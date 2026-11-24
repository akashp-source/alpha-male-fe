
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Package,
    CreditCard,
    ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        emailOrPhone: "",
        password: "",
        confirmPassword: "",
        acceptedTerms: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const updateField = (field: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (form.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!form.acceptedTerms) {
            setError("Please accept the Terms & Conditions.");
            return;
        }

        setLoading(true);

        try {
            // TODO: Connect your registration API here.

        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
            {/* LEFT: REGISTER FORM */}
            <section className="relative flex min-h-screen flex-col bg-white px-6 pb-10 pt-[155px] sm:px-12 lg:px-16 lg:py-8 xl:px-24">
                {/* Logo - desktop */}
                <Link href="/" className="hidden w-fit items-center gap-2 lg:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-navy text-white">
                        <ShieldCheck size={19} />
                    </div>
                    <span className="font-heading text-sm font-bold tracking-[0.12em] text-brand-navy">
                        ALPHA MALE
                    </span>
                </Link>

                {/* Mobile brand header */}
                <div className="absolute left-0 top-0 flex w-full flex-col items-center bg-brand-navy pb-12 pt-7 text-white lg:hidden">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-navy">
                        <ShieldCheck size={30} />
                    </div>

                    <span className="mt-2 font-heading text-sm font-bold tracking-[0.15em]">
                        ALPHA MALE
                    </span>

                    <span className="mt-1 text-[9px] tracking-[0.25em] text-[#c2d0df]">
                        DRIVE · STAMINA · ENERGY
                    </span>
                </div>

                {/* Form content */}
                <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-8 lg:py-10">
                    <div className="mb-6">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-success-green">
                            Join the Alpha community
                        </p>

                        <h1 className="font-heading text-2xl font-semibold tracking-wide text-brand-navy sm:text-3xl">
                            CREATE ACCOUNT
                        </h1>

                        <p className="mt-2 text-xs leading-5 text-brand-navy-muted">
                            Create your account for faster checkout, easy reordering and
                            private order tracking.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Full name */}
                        <div>
                            <label className="mb-2 block text-[11px] font-semibold text-brand-navy">
                                Full name
                            </label>

                            <div className="flex h-11 items-center gap-3 rounded-lg border border-[#dce2ea] bg-[#f5f7fa] px-3 focus-within:border-success-green">
                                <User size={15} className="shrink-0 text-[#718096]" />

                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => updateField("fullName", e.target.value)}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                    className="w-full bg-transparent text-xs text-brand-navy outline-none placeholder:text-[#9aa5b5]"
                                />
                            </div>
                        </div>

                        {/* Email / Phone */}
                        <div>
                            <label className="mb-2 block text-[11px] font-semibold text-brand-navy">
                                Email or mobile number
                            </label>

                            <div className="flex h-11 items-center gap-3 rounded-lg border border-[#dce2ea] bg-[#f5f7fa] px-3 focus-within:border-success-green">
                                <Mail size={15} className="shrink-0 text-[#718096]" />

                                <input
                                    type="text"
                                    value={form.emailOrPhone}
                                    onChange={(e) =>
                                        updateField("emailOrPhone", e.target.value)
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                    className="w-full bg-transparent text-xs text-brand-navy outline-none placeholder:text-[#9aa5b5]"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-2 block text-[11px] font-semibold text-brand-navy">
                                Password
                            </label>

                            <div className="flex h-11 items-center gap-3 rounded-lg border border-[#dce2ea] bg-[#f5f7fa] px-3 focus-within:border-success-green">
                                <Lock size={15} className="shrink-0 text-[#718096]" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => updateField("password", e.target.value)}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    required
                                    className="w-full bg-transparent text-xs text-brand-navy outline-none placeholder:text-[#9aa5b5]"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[#718096]"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            <p className="mt-1.5 text-[10px] text-brand-navy-muted">
                                Use at least 8 characters.
                            </p>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="mb-2 block text-[11px] font-semibold text-brand-navy">
                                Confirm password
                            </label>

                            <div className="flex h-11 items-center gap-3 rounded-lg border border-[#dce2ea] bg-[#f5f7fa] px-3 focus-within:border-success-green">
                                <Lock size={15} className="shrink-0 text-[#718096]" />

                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={(e) =>
                                        updateField("confirmPassword", e.target.value)
                                    }
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    required
                                    className="w-full bg-transparent text-xs text-brand-navy outline-none placeholder:text-[#9aa5b5]"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="text-[#718096]"
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terms */}
                        <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-5 text-[#657084]">
                            <input
                                type="checkbox"
                                checked={form.acceptedTerms}
                                onChange={(e) =>
                                    updateField("acceptedTerms", e.target.checked)
                                }
                                className="mt-1 accent-brand-navy"
                            />

                            <span>
                                I agree to the{" "}
                                <Link
                                    href="/terms"
                                    className="font-semibold text-success-green underline"
                                >
                                    Terms & Conditions
                                </Link>{" "}
                                and{" "}
                                <Link
                                    href="/privacy-policy"
                                    className="font-semibold text-success-green underline"
                                >
                                    Privacy Policy
                                </Link>
                                .
                            </span>
                        </label>

                        {/* Error */}
                        {error && (
                            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex h-12 w-full items-center justify-center rounded-lg bg-brand-navy text-xs font-bold text-white transition hover:bg-[#10284b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                        </button>
                    </form>

                    {/* Social sign up */}
                    <div className="my-5 flex items-center gap-4">
                        <div className="h-px flex-1 bg-[#e8ebef]" />
                        <span className="text-[10px] text-[#a0a8b5]">or sign up with</span>
                        <div className="h-px flex-1 bg-[#e8ebef]" />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#9aa5b5] text-xs font-semibold text-brand-navy transition hover:border-brand-navy hover:bg-[#f7f8fa]"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z" />
                                <path fill="#4285F4" d="M21 12.3c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.3 1.3-1.1 2.4-2.3 3.1l3.1 2.4c1.8-1.7 2.7-4.2 2.7-7.8z" />
                                <path fill="#FBBC05" d="M6.4 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L3.2 7.3C2.5 8.7 2.1 10.3 2.1 12s.4 3.3 1.1 4.7l3.2-2.4z" />
                                <path fill="#34A853" d="M12 21.5c2.6 0 4.8-.9 6.3-2.4l-3.1-2.4c-.8.6-1.9 1-3.2 1-2.5 0-4.6-1.7-5.4-4l-3.2 2.4c1.6 3.2 4.9 5.4 8.6 5.4z" />
                            </svg>
                            Continue with Google
                        </button>
                        <button
                            type="button"
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-xs font-semibold text-white transition hover:bg-[#1f1f1f]"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.97-3.46-1.07-1.57-2.74-1.78-3.33-1.8-1.42-.14-2.77.83-3.49.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.59-.75 2.99-.75 1.39 0 1.79.75 3.01.73 1.24-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.53 1.26-2.6-.03-.01-2.42-.93-2.45-3.72zM14.08 5.85c.64-.77 1.07-1.84.95-2.91-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.77-.97 2.82 1.03.08 2.07-.52 2.71-1.29z" />
                            </svg>
                            Continue with Apple
                        </button>
                    </div>

                    {/* Login link */}
                    <p className="mt-6 text-center text-[11px] text-[#7b8493]">
                        Already have an account?{" "}
                        <Link
                            href="/user/login"
                            className="font-bold text-success-green underline underline-offset-2"
                        >
                            Log in
                        </Link>
                    </p>

                    {/* Guest */}
                    <div className="my-5 flex items-center gap-4">
                        <div className="h-px flex-1 bg-[#e8ebef]" />
                        <span className="text-[10px] text-[#a0a8b5]">or</span>
                        <div className="h-px flex-1 bg-[#e8ebef]" />
                    </div>

                    <Link
                        href="/"
                        className="flex h-11 w-full items-center justify-center rounded-lg border border-[#9aa5b5] text-xs font-semibold text-brand-navy transition hover:border-brand-navy hover:bg-[#f7f8fa]"
                    >
                        Continue as guest
                    </Link>

                    <p className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] text-[#9aa2ae]">
                        <Lock size={11} />
                        Your details stay private and secure.
                    </p>
                </div>
            </section>

            {/* RIGHT: BRAND PANEL */}
            <section className="relative hidden min-h-screen overflow-hidden bg-brand-navy px-10 py-12 text-white lg:flex lg:items-center lg:justify-center xl:px-20">
                <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full border border-white/[0.06]" />
                <div className="absolute -right-16 -top-16 h-[370px] w-[370px] rounded-full border border-white/[0.06]" />
                <div className="absolute -bottom-40 -left-24 h-[450px] w-[450px] rounded-full border border-white/[0.04]" />

                <div className="relative z-10 w-full max-w-[480px]">
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-8 shadow-2xl backdrop-blur-sm xl:p-10">
                        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b6c5d9]">
                            Drive · Stamina · Energy
                        </p>

                        <h2 className="font-heading text-3xl font-semibold leading-tight xl:text-4xl">
                            OWN YOUR
                            <br />
                            CONFIDENCE.
                            <br />
                            OWN YOUR WELLNESS.
                        </h2>

                        <p className="mt-4 max-w-sm text-xs leading-6 text-[#aebdd0]">
                            Discover products designed around your confidence, comfort and
                            personal wellness.
                        </p>

                        {/* Product visual */}
                        <div className="relative mt-7 flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-[#10264a]">
                            <div className="absolute h-48 w-48 rounded-full bg-success-green/20 blur-3xl" />

                            <div className="relative flex h-40 w-28 -rotate-6 flex-col items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#263b5c] to-[#101d35] shadow-2xl">
                                <ShieldCheck size={34} className="text-[#d5dce7]" />
                                <span className="mt-3 font-heading text-[9px] tracking-[0.25em] text-white/70">
                                    ALPHA MALE
                                </span>
                                <span className="mt-1 font-heading text-2xl font-bold tracking-widest text-white">
                                    BOLD
                                </span>
                            </div>

                            <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-navy shadow-lg">
                                <ShieldCheck size={27} />
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="mt-7 grid grid-cols-2 gap-4">
                            <div>
                                <Package size={18} className="mb-2 text-[#c2d0df]" />
                                <p className="text-[11px] font-semibold">Plain packaging</p>
                            </div>

                            <div>
                                <CreditCard size={18} className="mb-2 text-[#c2d0df]" />
                                <p className="text-[11px] font-semibold">Private billing</p>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-[10px] tracking-[0.2em] text-white/35">
                        CONFIDENCE STARTS WITH YOU.
                    </p>
                </div>
            </section>
        </main>
    );
}
