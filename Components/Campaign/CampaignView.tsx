"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { addToCart } from "@/lib/cart";
import { readUtm, trackCampaignVisit } from "@/lib/campaign";
import { CampaignActionsProvider, SectionRenderer, type CampaignActions } from "./SectionRenderer";
import { isHiddenOn, type CampaignProduct, type CampaignSection, type Device } from "./config";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeToViewport(callback: () => void) {
    const media = window.matchMedia(MOBILE_QUERY);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
}

/** Current device, using the server's user-agent guess until the browser knows. */
function useDevice(initial: Device): Device {
    return useSyncExternalStore(
        subscribeToViewport,
        () => (window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop"),
        () => initial,
    );
}

export default function CampaignView({
    slug,
    sections,
    products,
    backgroundColor,
    contained,
    initialDevice,
}: {
    slug: string;
    sections: CampaignSection[];
    products: CampaignProduct[];
    backgroundColor: string;
    contained: boolean;
    initialDevice: Device;
}) {
    const device = useDevice(initialDevice);

    const productMap = useMemo(
        () => Object.fromEntries(products.map((p) => [String(p._id), p])) as Record<string, CampaignProduct>,
        [products],
    );

    const actions = useMemo<CampaignActions>(
        () => ({
            addToCart: async (productId, quantity) => {
                await addToCart(productId, quantity);
                // NavBar listens for this and opens the cart drawer.
                window.dispatchEvent(new Event("open-cart"));
            },
            subscribe: async (email) => {
                const response = await fetch("/api/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const data = await response.json().catch(() => null);
                // Already subscribed counts as success for the visitor.
                if (!response.ok && response.status !== 409) {
                    throw new Error(data?.message || "Unable to subscribe. Please try again.");
                }
            },
            productHref: (product) => `/products/${product._id}`,
        }),
        [],
    );

    // Record the visit with its UTM tags (once per session). Saving the tags
    // for checkout is done site-wide by <AttributionCapture /> in the layout.
    useEffect(() => {
        const utm = readUtm(window.location.search);
        trackCampaignVisit(slug, utm, window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop");
    }, [slug]);

    const visible = sections.filter((section) => section.enabled !== false && !isHiddenOn(section, device));

    return (
        <CampaignActionsProvider value={actions}>
            <div style={{ background: backgroundColor, width: "100%", scrollBehavior: "smooth" }}>
                <div style={{ maxWidth: contained ? 1240 : undefined, margin: "0 auto" }}>
                    {visible.map((section) => (
                        <SectionRenderer key={section.id} section={section} device={device} products={productMap} />
                    ))}
                </div>
            </div>
        </CampaignActionsProvider>
    );
}
