"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CreditCard, Home } from "lucide-react";

export default function PaymentSuccessClient({ paymentId }: { paymentId: string }) {
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState(5);

    useEffect(() => {
        const redirectTimer = window.setTimeout(() => router.replace("/home"), 5000);
        const countdownTimer = window.setInterval(() => {
            setSecondsLeft((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => {
            window.clearTimeout(redirectTimer);
            window.clearInterval(countdownTimer);
        };
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4 py-10 sm:px-6">
            <div className="w-full max-w-xl">
                <Link href="/home" className="mx-auto mb-7 flex w-fit items-center gap-2 font-heading text-sm font-bold tracking-[0.16em] text-[#07152e]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#07152e] text-white"><CreditCard size={16} /></span>
                    ALPHA MALE
                </Link>

                <section className="overflow-hidden rounded-[28px] border border-[#e1e6ee] bg-white shadow-sm">
                    <div className="px-5 py-10 text-center sm:px-10 sm:py-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5ef] text-[#176348] sm:h-[72px] sm:w-[72px]">
                            <Check size={32} strokeWidth={2.5} />
                        </div>
                        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-[#176348]">Payment confirmed</p>
                        <h1 className="mt-2 font-heading text-2xl font-bold text-[#07152e] sm:text-3xl">Your payment was successful</h1>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#526078]">Thank you. We&apos;ve received your payment and are preparing your order.</p>

                        <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-[#f5f7fa] px-4 py-4 text-left sm:px-5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Order ID</p>
                            <p className="mt-1 break-all font-mono text-sm font-semibold text-[#07152e]">{paymentId}</p>
                        </div>
                    </div>

                    <div className="border-t border-[#e8ebef] bg-[#fbfcfd] px-5 py-5 text-center sm:px-8">
                        <p aria-live="polite" className="text-sm font-semibold text-[#07152e]">Redirecting to the home page in {secondsLeft} {secondsLeft === 1 ? "second" : "seconds"}…</p>
                        <div className="mx-auto mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-[#e3e8ef]">
                            <div className="h-full rounded-full bg-[#176348] transition-[width] duration-1000" style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }} />
                        </div>
                        <Link href="/home" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#07152e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12294b]">
                            <Home size={16} /> Go to home now <ArrowRight size={15} />
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
