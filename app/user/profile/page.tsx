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
                    <div className="h-3 w-32 rounded bg-[#e9edf3]" />
                    <div className="h-8 w-56 rounded bg-[#e9edf3]" />
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
                    className="mt-5 rounded-lg bg-[#07152e] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#10284b]"
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
          <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
            {/* Header */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#176348]">
                        Your account
                    </p>
                    <h1 className="mt-2 font-heading text-2xl font-bold tracking-wide text-[#07152e] sm:text-3xl">
                        MY PROFILE
                    </h1>
                    <p className="mt-2 text-xs leading-5 text-[#91857b] sm:text-sm">
                        Manage your personal details and saved addresses.
                    </p>
                </div>

            </div>

            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-7">
                <AccountSidebar name={titleCase(profile.name || "Customer")} email={profile.email} />
                <div className="min-w-0">
            <div className="grid gap-5 xl:grid-cols-2">
                <section>
                    <div className="overflow-hidden rounded-[22px] border border-[#e1e6ee] bg-white">
                        <div className="border-b border-[#e7ebf1] bg-[#f3f5f8] px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07152e] text-white"><UserRound size={18} /></div>
                                <div>
                                    <h2 className="text-sm font-bold text-[#07152e]">Personal information</h2>
                                    <p className="mt-1 text-xs text-[#718096]">Your account details</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-[#e8ebef]">
                        {personalFields.map((field) => (
                            <div key={field.label} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                                {field.label === "Email address" ? <Mail size={16} className="shrink-0 text-[#718096]" /> : field.label === "Member since" ? <CalendarDays size={16} className="shrink-0 text-[#718096]" /> : field.label === "Mobile number" ? <Phone size={16} className="shrink-0 text-[#718096]" /> : <UserRound size={16} className="shrink-0 text-[#718096]" />}
                                <div>
                                <p className="text-[11px] font-medium text-[#718096]">
                                    {field.label}
                                </p>
                                <p className="mt-1 break-all text-sm font-medium text-[#07152e]">
                                    {field.value}
                                </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                </section>

                <section>
                    <div className="h-full rounded-[22px] border border-[#e1e6ee] bg-white p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#07152e] text-white">
                                <Lock size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-[#07152e]">
                                    Two-Factor Authentication
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-[#718096]">
                                    Add an extra layer of security to your account with
                                    email OTP verification.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-[#f5f7fa] px-4 py-4">
                            <div>
                                <p className="text-xs font-bold text-[#07152e]">
                                    {profile.twoFactorEnabled
                                        ? "Protection enabled"
                                        : "Protection disabled"}
                                </p>
                                <p className="mt-0.5 text-[11px] text-[#718096]">
                                    {profile.twoFactorEnabled
                                        ? "An OTP is required each time you log in."
                                        : "Your account uses standard login verification."}
                                </p>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={profile.twoFactorEnabled}
                                aria-label={`${profile.twoFactorEnabled ? "Disable" : "Enable"} two-factor authentication`}
                                aria-busy={togglingTwoFactor}
                                disabled={togglingTwoFactor}
                                onClick={toggleTwoFactor}
                                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:cursor-wait disabled:opacity-70 ${profile.twoFactorEnabled
                                    ? "bg-[#176348]"
                                    : "bg-[#cfd6e0]"
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

                        {twoFactorError && (
                            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                                {twoFactorError}
                            </p>
                        )}

                        <p className="mt-4 text-[11px] leading-5 text-[#9aa2ae]">
                            When enabled, you&apos;ll need to verify your identity using an
                            OTP sent to your registered email during login.
                        </p>
                    </div>
                </section>
            </div>


                </div>
            </div>
          </div>
        </main>
    );
}
