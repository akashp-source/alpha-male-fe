"use client";

import { useEffect, useState } from "react";

/**
 * "Dev" storefront accounts (User.role = "dev", set in the database) can see
 * and buy test products. The backend decides from the login token; this only
 * tells the storefront when to send that token with product requests, which
 * are otherwise anonymous (and the server-side cached pages never include
 * test products).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
const STORAGE_KEY = "am-dev-access";

function getUserToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem("token");
    } catch {
        return null;
    }
}

/** Short fingerprint so the cached answer is tied to this login. */
const tokenTag = (token: string) => token.slice(-16);

/** Cached answer for the current login, or null when not checked yet. */
function readCached(token: string): boolean | null {
    try {
        const value = sessionStorage.getItem(STORAGE_KEY);
        if (!value) return null;
        const [tag, flag] = value.split(":");
        return tag === tokenTag(token) ? flag === "1" : null;
    } catch {
        return null;
    }
}

let pending: Promise<boolean> | null = null;
let pendingFor = "";

/** Asks the backend once per login (GET /user/profile/me) whether it's a dev account. */
function checkIsDev(): Promise<boolean> {
    const token = getUserToken();
    if (!token) return Promise.resolve(false);
    const cached = readCached(token);
    if (cached !== null) return Promise.resolve(cached);
    if (pending && pendingFor === token) return pending;

    pendingFor = token;
    pending = fetch(`${API_URL}/user/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    })
        .then((response) => (response.ok ? response.json() : null))
        .then((profile) => {
            const isDev = profile?.role === "dev";
            try {
                sessionStorage.setItem(STORAGE_KEY, `${tokenTag(token)}:${isDev ? "1" : "0"}`);
            } catch {
                // Private mode etc.: just ask again next time.
            }
            return isDev;
        })
        .catch(() => false)
        .finally(() => {
            pending = null;
        });
    return pending;
}

/** True once the logged-in account is known to be a dev account. */
export function useIsDev(): boolean {
    const [isDev, setIsDev] = useState(false);
    useEffect(() => {
        let active = true;
        checkIsDev().then((value) => {
            if (active && value) setIsDev(true);
        });
        return () => {
            active = false;
        };
    }, []);
    return isDev;
}

/**
 * Authorization header for product requests: only for a known dev account
 * (empty for everyone else, so normal visitors stay anonymous).
 */
export function devAuthHeader(isDev = true): Record<string, string> {
    if (!isDev) return {};
    const token = getUserToken();
    if (!token || readCached(token) !== true) return {};
    return { Authorization: `Bearer ${token}` };
}
