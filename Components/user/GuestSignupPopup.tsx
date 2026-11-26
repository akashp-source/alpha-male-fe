
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    X,
    Package,
    Gift,
    Lock,
} from "lucide-react";
import Image from "next/image";
import { ONLINE_PAYMENT_DISCOUNT_PERCENT } from "@/lib/offers";

const DISMISS_KEY = "guest-signup-dismissed-until";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

export default function GuestSignupPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [mobile, setMobile] = useState("");
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const dialogRef = useRef<HTMLDivElement>(null);
    const mobileInputRef = useRef<HTMLInputElement>(null);

    const closePopup = useCallback(() => {
        localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DURATION));
        setIsOpen(false);
    }, []);

    // Show after a short delay unless the visitor recently dismissed the popup.
    useEffect(() => {
        if (localStorage.getItem("token")) return;
        const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
        if (dismissedUntil > Date.now()) return;
        if (dismissedUntil) localStorage.removeItem(DISMISS_KEY);

        const timer = window.setTimeout(() => {
            const currentDismissal = Number(localStorage.getItem(DISMISS_KEY) || 0);
            if (!localStorage.getItem("token") && currentDismissal <= Date.now()) {
                setIsOpen(true);
            }
        }, 2000);

        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const previousBodyOverflow = document.body.style.overflow;
        const previousRootOverflow = document.documentElement.style.overflow;
        const previousFocus = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        const focusTimer = window.setTimeout(() => mobileInputRef.current?.focus(), 0);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closePopup();
                return;
            }
            if (event.key !== "Tab" || !dialogRef.current) return;

            const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )).filter((element) => element.offsetParent !== null);
            if (!focusable.length) {
                event.preventDefault();
                dialogRef.current.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            window.clearTimeout(focusTimer);
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousRootOverflow;
            previousFocus?.focus();
        };
    }, [isOpen, closePopup]);

    const handleGetOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        setLoading(true);

        try {
            setError("Connect your OTP API to enable verification.");
        } catch {
            setError("Unable to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (

        // <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 sm:p-6">
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-brand-navy/50 p-3 sm:p-6">

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="guest-signup-title"
                tabIndex={-1}
                className="relative mx-auto grid w-full max-w-[1100px] items-center gap-0 rounded-2xl bg-transparent p-0 outline-none lg:grid-cols-2 lg:gap-6 lg:bg-brand-navy lg:p-5"
            >

                {/* LEFT BRAND PANEL */}
                <div className="hidden text-center text-white lg:block">
                    <div className="mb-5 flex items-center justify-center gap-2">


                        <Image
                            src="https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/1c2036f3-31c7-4a41-9fc7-7470ae79f4ca.webp"
                            alt="Alpha Male - Drive, Stamina, Energy"
                            width={100}
                            height={100}
                            priority
                            className="block object-contain"
                        />
                    </div>

                    <p className="mb-16 text-xs font-semibold tracking-[0.3em] text-[#c2d0df]">
                        DRIVE · STAMINA · ENERGY
                    </p>

                    <h2 className="mx-auto mb-12 max-w-md text-xl font-semibold leading-7">
                        Premium men's wellness, delivered
                        <br />
                        discreetly.
                    </h2>

                    <div className="grid grid-cols-2 gap-2">
                        <Benefit
                            icon={<Gift size={21} />}
                            title={`Extra ${ONLINE_PAYMENT_DISCOUNT_PERCENT}% off`}
                            description="When you pay online with Razorpay at checkout."
                        />

                        <Benefit
                            icon={<Package size={21} />}
                            title="100% discreet delivery"
                            description="Plain packaging and private billing on every order."
                        />
                    </div>

                    <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-success-green/10 blur-3xl" />
                </div>

                {/* RIGHT SIGNUP CARD */}
                <div className="relative z-10 mx-auto w-full max-w-[500px] rounded-2xl bg-white px-5 py-7 shadow-2xl sm:px-10 sm:py-10">

                    {/* Close */}
                    <button
                        type="button"
                        onClick={closePopup}
                        aria-label="Close signup popup"
                        className="absolute right-4 top-4 rounded-full p-1 text-[#718096] transition hover:bg-gray-100 hover:text-brand-navy"
                    >
                        <X size={19} />
                    </button>

                    <div className="mx-auto max-w-[350px]">
                        <h2 id="guest-signup-title" className="mb-2 text-center text-xl font-semibold leading-7 text-brand-navy">
                            Unlock members-only
                            <br />
                            offers
                        </h2>

                        <p className="mb-6 text-center text-sm leading-5 text-[#6B6158]">
                            Sign up with your mobile number for offers and order updates.
                        </p>

                        <form onSubmit={handleGetOtp}>
                            <label htmlFor="guest-signup-mobile" className="mb-2 block text-sm font-semibold text-brand-navy">
                                Mobile number
                            </label>

                            <div className="flex h-12 overflow-hidden rounded-lg border border-[#dce2ea] bg-white focus-within:border-success-green">
                                <div className="flex shrink-0 items-center gap-2 border-r border-[#e5e9ef] bg-[#f5f7fa] px-3 text-xs font-semibold text-brand-navy">
                                    <span>🇮🇳</span>
                                    <span>+91</span>
                                </div>

                                <input
                                    ref={mobileInputRef}
                                    id="guest-signup-mobile"
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={mobile}
                                    onChange={(e) =>
                                        setMobile(e.target.value.replace(/\D/g, ""))
                                    }
                                    placeholder="10-digit mobile number"
                                    required
                                    className="min-w-0 flex-1 px-3 text-sm text-brand-navy outline-none placeholder:text-[#6B6158]"
                                />
                            </div>

                            {/* Marketing consent */}
                            <label className="mt-5 flex cursor-pointer items-start gap-2 text-sm leading-5 text-[#6B6158]">
                                <input
                                    type="checkbox"
                                    checked={marketingConsent}
                                    onChange={(e) => setMarketingConsent(e.target.checked)}
                                    className="mt-1 shrink-0 accent-brand-navy"
                                />

                                <span>
                                    Notify me about offers and new products.
                                </span>
                            </label>

                            {error && (
                                <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-brand-navy text-sm font-bold text-white transition hover:bg-[#14284d] disabled:opacity-60"
                            >
                                {loading ? "PLEASE WAIT..." : "GET OTP"}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-xs leading-5 text-[#6B6158]">
                            By continuing, you agree to our{" "}
                            <a
                                href="/policies/privacy"
                                className="underline underline-offset-2"
                            >
                                Privacy Policy
                            </a>{" "}
                            and{" "}
                            <a
                                href="/policies/terms"
                                className="underline underline-offset-2"
                            >
                                T&Cs
                            </a>
                            .
                        </p>

                        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#6B6158]">
                            <Lock size={11} />
                            Your number stays private.
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

function Benefit({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-4">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-navy">
                {icon}
            </div>

            <h3 className="mb-2 text-sm font-semibold">{title}</h3>

            <p className="text-xs leading-5 text-[#c2d0df]">
                {description}
            </p>
        </div>
    );
}
