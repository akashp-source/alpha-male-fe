"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Phone,
    ShieldCheck,
    Lock,
    UserRound,
    Mail,
    CalendarDays,
} from "lucide-react";
import AccountSidebar from "@/Components/user/AccountSidebar";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

interface Profile {
    _id: string;
    name: string;
    email: string;
    number?: string;
    twoFactorEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function titleCase(value: string) {
    return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [togglingTwoFactor, setTogglingTwoFactor] = useState(false);
    const [twoFactorError, setTwoFactorError] = useState("");
    // Shown right after the switch changes, so the result and next step are clear.
    const [twoFactorNotice, setTwoFactorNotice] = useState<"on" | "off" | null>(null);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/user/login");
    }, [router]);

    const toggleTwoFactor = async () => {
        if (!profile || togglingTwoFactor) return;

        const token = window.localStorage.getItem("token");
        if (!token) {
            router.replace("/user/login");
            return;
        }

        setTogglingTwoFactor(true);
        setTwoFactorError("");
        setTwoFactorNotice(null);

        try {
            const response = await fetch(`${API_URL}/user/toogle-auth`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
                logout();
                return;
            }

            const result = await response.json().catch(() => ({})) ?? {};
            if (!response.ok) {
                const message = Array.isArray(result.message)
                    ? result.message.join(" ")
                    : result.message;
                throw new Error(message || "Unable to update two-factor authentication.");
            }

            const payload = result.data ?? result.user ?? result;
            const updatedValue =
                typeof payload.twoFactorEnabled === "boolean"
                    ? payload.twoFactorEnabled
                    : typeof payload.isTwoFactorEnabled === "boolean"
                        ? payload.isTwoFactorEnabled
                        : !profile.twoFactorEnabled;

            setProfile((current) => current
                ? { ...current, twoFactorEnabled: updatedValue }
                : current);
            setTwoFactorNotice(updatedValue ? "on" : "off");
        } catch (cause) {
            setTwoFactorError(
                cause instanceof Error
                    ? cause.message
                    : "Unable to update two-factor authentication. Please try again."
            );
        } finally {
            setTogglingTwoFactor(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/user/login");
            return;
        }

        const controller = new AbortController();

        (async () => {
            try {
                const response = await fetch(`${API_URL}/user/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (response.status === 401) {
                    logout();
                    return;
                }

                if (!response.ok) {
                    throw new Error("Unable to load your profile.");
                }

                const data: Profile = await response.json();
                setProfile(data);
            } catch (err) {
                if (controller.signal.aborted) return;
                setError(
                    err instanceof Error
                        ? err.message
                        : "Something went wrong. Please try again."
                );
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [router, logout]);

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-[1240px] px-5 py-14 sm:px-8 lg:px-12">
                <div className="animate-pulse space-y-6">
                    <div className="h-3 w-32 rounded bg-pale-gray" />
                    <div className="h-8 w-56 rounded bg-pale-gray" />
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="h-80 rounded-2xl bg-[#f5f7fa]" />
                        <div className="h-80 rounded-2xl bg-[#f5f7fa]" />
                    </div>
                </div>
            </main>
        );
    }

    if (error || !profile) {
        return (
            <main className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-5 py-24 text-center sm:px-8">
                <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error || "Unable to load your profile."}
                </p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-5 rounded-lg bg-brand-navy px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#10284b]"
                >
                    Try again
                </button>
            </main>
        );
    }

    const personalFields = [
        { label: "Full name", value: titleCase(profile.name || "—") },
        { label: "Email address", value: profile.email || "—" },
        { label: "Mobile number", value: profile.number || "—" },
        { label: "Member since", value: formatDate(profile.createdAt) },
    ];

    return (
        <main className="min-h-screen bg-[#fafbfc]">
          {/* pb-28: room for the floating WhatsApp button so it never covers the last card */}
          <div className="mx-auto w-full max-w-[1440px] px-4 py-8 pb-28 sm:px-6 lg:px-10 lg:py-12 lg:pb-28">
            {/* Header */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-success-green">
                        Your account
                    </p>
                    <h1 className="mt-2 font-heading text-2xl font-semibold tracking-wide text-brand-navy sm:text-3xl">
                        MY PROFILE
                    </h1>
                    <p className="mt-2 text-sm leading-5 text-brand-navy-muted">
                        Manage your personal details and account security.
                    </p>
                </div>

            </div>

            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-7">
                <AccountSidebar name={titleCase(profile.name || "Customer")} email={profile.email} />
                <div className="min-w-0">
            <div className="grid gap-5 xl:grid-cols-2">
                <section className="h-full" aria-labelledby="personal-info-heading">
                    <div className="h-full overflow-hidden rounded-[22px] border border-[#e1e6ee] bg-white">
                        <div className="border-b border-[#e7ebf1] bg-pale-gray px-5 py-5 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white"><UserRound size={18} /></div>
                                <div>
                                    <h2 id="personal-info-heading" className="text-sm font-semibold text-brand-navy">Personal information</h2>
                                    <p className="mt-1 text-xs text-brand-navy-muted">Your account details</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-[#e8ebef]">
                        {personalFields.map((field) => (
                            <div key={field.label} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                                {field.label === "Email address" ? <Mail size={16} aria-hidden="true" className="shrink-0 text-brand-navy-muted" /> : field.label === "Member since" ? <CalendarDays size={16} aria-hidden="true" className="shrink-0 text-brand-navy-muted" /> : field.label === "Mobile number" ? <Phone size={16} aria-hidden="true" className="shrink-0 text-brand-navy-muted" /> : <UserRound size={16} aria-hidden="true" className="shrink-0 text-brand-navy-muted" />}
                                <div>
                                <p className="text-xs font-medium text-brand-navy-muted">
                                    {field.label}
                                </p>
                                <p className="mt-1 break-all text-sm font-medium text-brand-navy">
                                    {field.value}
                                </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                </section>

                <section className="h-full" aria-labelledby="two-factor-heading">
                    <div className="h-full overflow-hidden rounded-[22px] border border-[#e1e6ee] bg-white">
                        {/* Same header strip as "Personal information" */}
                        <div className="border-b border-[#e7ebf1] bg-pale-gray px-5 py-5 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
                                    <Lock size={18} />
                                </div>
                                <div>
                                    <h2 id="two-factor-heading" className="text-sm font-semibold text-brand-navy">
                                        Two-factor authentication
                                    </h2>
                                    <p className="mt-1 text-xs text-brand-navy-muted">
                                        An extra check when you log in
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-5 sm:px-6">
                            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f5f7fa] px-4 py-4">
                                <div className="min-w-0">
                                    <p id="two-factor-label" className="text-sm font-bold text-brand-navy">
                                        Email code at login
                                    </p>
                                    <p className="mt-1 text-sm leading-5 text-brand-navy-muted">
                                        {profile.twoFactorEnabled
                                            ? "You enter a one-time code from your email each time you log in."
                                            : "Turn on to enter a one-time code from your email each time you log in."}
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-2.5">
                                    {/* Calm status text next to the switch */}
                                    <span aria-hidden="true" className={`text-sm font-bold ${profile.twoFactorEnabled ? "text-success-green" : "text-brand-navy-muted"}`}>
                                        {profile.twoFactorEnabled ? "On" : "Off"}
                                    </span>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={profile.twoFactorEnabled}
                                        aria-labelledby="two-factor-label"
                                        aria-busy={togglingTwoFactor}
                                        disabled={togglingTwoFactor}
                                        onClick={toggleTwoFactor}
                                        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 ${profile.twoFactorEnabled
                                            ? "bg-success-green"
                                            : "bg-[#8a94a5]"
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${profile.twoFactorEnabled
                                                ? "translate-x-[26px]"
                                                : "translate-x-0.5"
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {twoFactorError && (
                                <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {twoFactorError}
                                </p>
                            )}

                            {/* Confirmation + next step right after a change */}
                            <div role="status" aria-live="polite">
                                {twoFactorNotice === "on" && (
                                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#cfe5d8] bg-[#edf5ef] px-4 py-3">
                                        <ShieldCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-success-green" />
                                        <div className="text-sm leading-5 text-brand-navy">
                                            <p className="font-bold">Two-factor authentication is on.</p>
                                            <p className="mt-1 text-[#3f4d4a]">
                                                Next time you log in, we&apos;ll email a one-time code to{" "}
                                                <span className="font-semibold break-all">{profile.email}</span>.
                                                Make sure you can open this inbox before you log out.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {twoFactorNotice === "off" && (
                                    <p className="mt-4 rounded-xl bg-[#f5f7fa] px-4 py-3 text-sm leading-5 text-brand-navy-muted">
                                        Two-factor authentication is off. You&apos;ll log in with your password only.
                                    </p>
                                )}
                            </div>

                            <p className="mt-4 text-sm leading-6 text-brand-navy-muted">
                                The code is sent to your registered email address and
                                expires after 5 minutes.
                            </p>
                        </div>
                    </div>
                </section>
            </div>


                </div>
            </div>
          </div>
        </main>
    );
}
