import type { Campaign, CampaignProduct } from "@/Components/Campaign/config";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export type PublicCampaign = Campaign & { products: CampaignProduct[] };

/* ------------------------------------------------------------------ */
/* UTM tracking (browser only)                                         */
/* ------------------------------------------------------------------ */

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

const UTM_STORAGE_KEY = "alpha_male_utm";

/** Read utm_* params from a query string. */
export function readUtm(search: string): UtmParams {
    const params = new URLSearchParams(search);
    const utm: UtmParams = {};
    UTM_KEYS.forEach((key) => {
        const value = params.get(key)?.trim();
        if (value) utm[key] = value.slice(0, 120);
    });
    return utm;
}

/** What gets saved in the browser and sent with the order at checkout. */
export type Attribution = UtmParams & {
    campaignSlug?: string;
    landingPage?: string;
    referrer?: string;
    capturedAt?: string;
};

// A sale counts for a UTM link if the order is placed within this window.
const ATTRIBUTION_DAYS = 30;

// Only real slugs (letters, digits, dashes). A mangled URL such as
// "/campaign/some-offerhttp://localhost:3001/home" is ignored.
function campaignSlugFromPath(pathname: string) {
    const match = pathname.match(/^\/campaign\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/i);
    return match ? match[1].toLowerCase() : "";
}

/**
 * Call on every page load. Remembers where the visitor came from
 * (last touch wins) in localStorage under "alpha_male_utm":
 * - a URL with utm_* tags always replaces what was stored;
 * - a campaign page without tags is stored only if nothing recent is stored,
 *   so it never overwrites a real source like Instagram.
 */
export function captureAttribution() {
    try {
        const utm = readUtm(window.location.search);
        const campaignSlug = campaignSlugFromPath(window.location.pathname);
        const hasUtm = Object.keys(utm).length > 0;

        if (!hasUtm && !campaignSlug) return;
        if (!hasUtm && getStoredAttribution()) return;

        const attribution: Attribution = {
            ...utm,
            campaignSlug,
            landingPage: window.location.pathname,
            referrer: document.referrer ? document.referrer.slice(0, 300) : "",
            capturedAt: new Date().toISOString(),
        };

        localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attribution));
    } catch {
        // Storage can be blocked (private mode); tracking is best-effort.
    }
}

/** The stored attribution if it's still within the window, else null. */
export function getStoredAttribution(): Attribution | null {
    try {
        const raw = localStorage.getItem(UTM_STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw) as Attribution;
        const age = Date.now() - new Date(data.capturedAt || 0).getTime();
        if (!(age >= 0 && age < ATTRIBUTION_DAYS * 86400000)) {
            localStorage.removeItem(UTM_STORAGE_KEY);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

/** Same guest id the cart uses, so visits and carts can be linked. */
function getGuestId() {
    try {
        let guestId = localStorage.getItem("guestId");
        if (!guestId) {
            guestId = crypto.randomUUID();
            localStorage.setItem("guestId", guestId);
        }
        return guestId;
    } catch {
        return "";
    }
}

/** Record one visit per browser session per campaign. */
export function trackCampaignVisit(slug: string, utm: UtmParams, device: "mobile" | "desktop") {
    const sessionKey = `campaign_visit_${slug}_${utm.utm_source || "direct"}`;
    try {
        if (sessionStorage.getItem(sessionKey)) return;
        sessionStorage.setItem(sessionKey, "1");
    } catch {
        // continue without the de-duplication guard
    }

    fetch(`${API_URL}/campaign/slug/${encodeURIComponent(slug)}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
            ...utm,
            referrer: document.referrer || "",
            guestId: getGuestId(),
            device,
        }),
    }).catch(() => {
        // Analytics must never break the page.
    });
}
