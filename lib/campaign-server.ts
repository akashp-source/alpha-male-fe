import { cache } from "react";
import type { PublicCampaign } from "./campaign";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

/**
 * Fetch a published, currently-running campaign by slug (public, no auth).
 * Returns null when it doesn't exist, isn't published, or is outside its schedule.
 * Wrapped in `cache` so generateMetadata and the page share one request.
 */
export const getPublicCampaign = cache(async function getPublicCampaign(
    slug: string,
): Promise<PublicCampaign | null> {
    const response = await fetch(`${API_URL}/campaign/slug/${encodeURIComponent(slug)}`, {
        cache: "no-store",
    });

    if (response.status === 404 || response.status === 400) return null;

    if (!response.ok) {
        throw new Error(`Failed to load campaign (${response.status})`);
    }

    return response.json();
});
