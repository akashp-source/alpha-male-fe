import { timingSafeEqual } from "crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { PRODUCTS_TAG } from "@/lib/product-cache";

// Tags the backend may clear. Anything else is rejected.
const ALLOWED_TAGS = new Set([PRODUCTS_TAG]);

function validSecret(given: string | null) {
    const expected = process.env.REVALIDATE_SECRET;
    if (!expected || !given) return false;
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * POST /api/revalidate   header: x-revalidate-secret   body: { "tag": "products" }
 * Called by the backend after a product changes in admin. The next request
 * for that data waits for fresh data instead of getting the old copy.
 */
export async function POST(request: Request) {
    if (!validSecret(request.headers.get("x-revalidate-secret"))) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const tag = typeof body?.tag === "string" ? body.tag : "";
    if (!ALLOWED_TAGS.has(tag)) {
        return NextResponse.json({ success: false, message: "Unknown tag" }, { status: 400 });
    }

    // expire: 0 -> never serve the old copy; the next visit gets fresh data.
    revalidateTag(tag, { expire: 0 });
    return NextResponse.json({ success: true, revalidated: tag });
}
