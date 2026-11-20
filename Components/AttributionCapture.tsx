"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttribution } from "@/lib/campaign";

/**
 * Saves utm_* tags from any landing URL so checkout can attach them to the
 * order. Mounted once in the root layout; renders nothing.
 */
export default function AttributionCapture() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        captureAttribution();
    }, [pathname, searchParams]);

    return null;
}
