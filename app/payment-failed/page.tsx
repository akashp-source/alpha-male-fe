"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleX, CreditCard, RefreshCw } from "lucide-react";

export default function PaymentFailedPage() {
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState(5);

    useEffect(() => {
        const redirectTimer = window.setTimeout(() => router.replace("/user/orders"), 5000);
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
                <Link href="/home" className="mx-auto mb-7 flex w-fit items-center gap-2 font-heading text-sm font-bold tracking-[0.16em] text-brand-navy">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-white"><CreditCard size={16} /></span>
                    ALPHA MALE
                </Link>

                <section className="overflow-hidden rounded-[28px] border border-[#e1e6ee] bg-white shadow-sm">
                    <div className="px-5 py-10 text-center sm:px-10 sm:py-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3eb] text-[#c45a2b] sm:h-[72px] sm:w-[72px]">
                            <CircleX size={34} strokeWidth={1.8} />
                        </div>
                        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-[#c45a2b]">Payment not completed</p>
                        <h1 className="mt-2 font-heading text-2xl font-semibold text-brand-navy sm:text-3xl">We couldn&apos;t complete your payment</h1>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-brand-navy-muted">
                            Your payment didn&apos;t go through. Your order details are still available in your account. Open My Orders to check the status and choose the next step.
                        </p>
                    </div>

                    <div className="border-t border-[#e8ebef] bg-[#fbfcfd] px-5 py-5 text-center sm:px-8">
                        <p aria-live="polite" className="text-sm font-semibold text-brand-navy">Redirecting to My Orders in {secondsLeft} {secondsLeft === 1 ? "second" : "seconds"}…</p>
                        <div className="mx-auto mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-[#e3e8ef]">
                            <div className="h-full rounded-full bg-[#c45a2b] transition-[width] duration-1000" style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }} />
                        </div>
                        <Link href="/user/orders" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12294b]">
                            <RefreshCw size={16} /> Open My Orders <ArrowRight size={15} />
                        </Link>
                    </div>
                </section>

                <p className="mt-5 text-center text-xs leading-5 text-[#8b94a3]">If you were charged, please check your order status before trying again.</p>
            </div>
        </main>
    );
}
