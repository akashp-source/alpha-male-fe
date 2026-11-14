
"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export default function ClarityAnalytics() {
    useEffect(() => {
        const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

        if (!projectId) return;
        try {

            Clarity.init(projectId);
        } catch (e) {
            console.log(`Error in Connecting clarity`);

        }
    }, []);

    return null;
}
