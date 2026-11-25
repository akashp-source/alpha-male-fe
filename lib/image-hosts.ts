/**
 * Whether next/image may optimize (resize + convert to WebP/AVIF) this src.
 * Must match `images.remotePatterns` in next.config.ts: next/image throws for
 * any other host, so those images are passed through unoptimized instead.
 * Site paths (/images/...) are always optimizable.
 */
export function canOptimizeImage(src: string | undefined | null): boolean {
    if (!src) return false;
    if (src.startsWith("/") && !src.startsWith("//")) return true;
    try {
        const url = new URL(src);
        if (url.protocol !== "https:") return false;
        return (
            url.hostname === "alpha-male.s3.us-east-1.amazonaws.com" ||
            url.hostname.endsWith(".s3.ap-south-1.amazonaws.com")
        );
    } catch {
        return false;
    }
}
