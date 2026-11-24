"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Barcode,
    CheckCircle2,
    ChevronLeft,
    LoaderCircle,
    LockKeyhole,
    Package,
    Phone,
    Search,
    Truck,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

type TrackingMode = "awb" | "order-phone" | "phone";

const trackingModes: { id: TrackingMode; title: string; description: string }[] = [
    { id: "awb", title: "AWB number", description: "The tracking number from your shipping message" },
    { id: "order-phone", title: "Order ID + phone", description: "Your order number and the mobile used to order" },
    { id: "phone", title: "Phone number only", description: "Verify with OTP and see all your orders" },
];

interface TrackingData {
    tracking_data?: {
        shipment_track?: { awb_code?: string; current_status?: string; courier_name?: string; etd?: string }[];
        shipment_track_activities?: { date?: string; activity?: string; location?: string; status?: string }[];
        track_url?: string;
    };
    [key: string]: unknown;
}

export default function TrackPage() {
    const [mode, setMode] = useState<TrackingMode>("awb");
    const [awb, setAwb] = useState("");
    const [orderNumber, setOrderNumber] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpStep, setOtpStep] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [tracking, setTracking] = useState<TrackingData | null>(null);

    useEffect(() => {
        const queryAwb = new URLSearchParams(window.location.search).get("awb");
        if (queryAwb) {
            setAwb(queryAwb);
            setMode("awb");
        }
    }, []);

    async function trackByAwb(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");
        setTracking(null);
        const value = awb.trim();
        if (!value) return;

        setLoading(true);
        try {
            // The currently available backend route accepts a Shiprocket order_id.
            const response = await fetch(
                `${API_URL}/ship-rocket/track?order_id=${encodeURIComponent(value)}`,
                { cache: "no-store" }
            );
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                const errorText = Array.isArray(result.message) ? result.message.join(" ") : result.message;
                throw new Error(errorText || "We couldn’t find tracking details for that number.");
            }
            setTracking(result as TrackingData);
        } catch (cause) {
            setMessage(cause instanceof Error ? cause.message : "Unable to load tracking details. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function submitUnavailableMode(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setTracking(null);
        if (mode === "order-phone") {
            setMessage("Order ID and phone verification is not available yet. Please track with your shipping order ID.");
        } else {
            setOtpStep(true);
            setMessage("Phone OTP tracking needs a phone verification API before we can send a code.");
        }
    }

    const shipment = tracking?.tracking_data?.shipment_track?.[0];
    const activities = tracking?.tracking_data?.shipment_track_activities ?? [];

    return (
        <main className="min-h-screen bg-[#f5f6f8]">
            <header className="border-b border-[#e8ebef] bg-white">
                <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-4 sm:px-6">
                    <Link href="/home" className="flex items-center gap-2 font-heading text-xs font-bold tracking-[0.16em] text-brand-navy sm:text-sm">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-white"><Package size={16} /></span>
                        ALPHA MALE
                    </Link>
                    <Link href="/home" className="inline-flex items-center gap-1.5 text-[11px] text-[#718096] transition hover:text-brand-navy sm:text-xs"><ChevronLeft size={14} />Back to store</Link>
                </div>
            </header>

            <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6">
                <section className="relative -mx-4 overflow-hidden bg-brand-navy px-4 pb-16 pt-10 text-white sm:-mx-6 sm:px-8 sm:pb-20 sm:pt-12 lg:px-16">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-10 h-64 w-64 rounded-full border-[34px] border-white/[0.035]" />
                    <div aria-hidden="true" className="pointer-events-none absolute right-10 top-8 h-44 w-44 rounded-full border border-white/[0.06]" />
                    <div className="relative mx-auto max-w-[740px]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a8c0da]">Order tracking</p>
                        <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">TRACK YOUR ORDER</h1>
                        <p className="mt-2 max-w-lg text-xs leading-5 text-white/75 sm:text-sm">Check where your package is. Tracking never shows product names, only the shipment status.</p>
                    </div>
                </section>

                <div className="relative mx-auto -mt-10 max-w-[680px] sm:-mt-12">
                    <section className="rounded-[20px] border border-[#e5e8ed] bg-white p-4 shadow-[0_16px_40px_rgba(33,46,73,0.10)] sm:p-6">
                        <h2 className="text-sm font-semibold text-brand-navy sm:text-base">How would you like to track?</h2>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            {trackingModes.map((item) => {
                                const selected = mode === item.id;
                                return (
                                    <button key={item.id} type="button" onClick={() => { setMode(item.id); setMessage(""); setOtpStep(false); setTracking(null); }} aria-pressed={selected} className={`flex min-h-[72px] items-start gap-2.5 rounded-xl border p-3 text-left transition sm:min-h-[78px] sm:gap-2 sm:p-3 ${selected ? "border-brand-navy bg-pale-gray ring-1 ring-brand-navy" : "border-[#e1e6ee] bg-white hover:border-[#aeb8c7]"}`}>
                                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? "border-brand-navy" : "border-[#aeb6c2]"}`}>{selected && <span className="h-2 w-2 rounded-full bg-brand-navy" />}</span>
                                        <span className="min-w-0"><span className="block text-xs font-bold leading-4 text-brand-navy">{item.title}</span><span className="mt-1 block text-[10px] leading-4 text-[#718096]">{item.description}</span></span>
                                    </button>
                                );
                            })}
                        </div>

                        {mode === "awb" && (
                            <form onSubmit={trackByAwb} className="mt-4">
                                <label htmlFor="awb" className="block text-[10px] font-bold text-brand-navy">AWB / tracking number</label>
                                <div className="mt-1.5 flex h-11 items-center gap-2.5 rounded-xl border border-[#dce2ea] px-3.5 focus-within:border-brand-navy sm:h-12">
                                    <Barcode size={16} className="shrink-0 text-[#718096]" />
                                    <input id="awb" required value={awb} onChange={(event) => setAwb(event.target.value)} placeholder="e.g. 1234567890123" className="h-full min-w-0 flex-1 bg-transparent text-sm text-brand-navy outline-none placeholder:text-[#a0a8b4]" />
                                </div>
                                <p className="mt-1.5 text-[10px] text-[#8b94a3]">You&apos;ll find it in your shipping SMS, email or WhatsApp update.</p>
                                <button type="submit" disabled={loading} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-xs font-bold text-white transition hover:bg-[#142b4c] disabled:opacity-60 sm:h-12 sm:text-sm">{loading ? <><LoaderCircle size={16} className="animate-spin" />Looking up shipment...</> : <><Search size={15} />Track package</>}</button>
                            </form>
                        )}

                        {mode === "order-phone" && (
                            <form onSubmit={submitUnavailableMode} className="mt-4 space-y-3">
                                <label className="block text-[10px] font-bold text-brand-navy">Order ID
                                    <input required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="e.g. ORD-123456" className="mt-1.5 h-11 w-full rounded-xl border border-[#dce2ea] px-3.5 text-sm text-brand-navy outline-none placeholder:text-[#a0a8b4] focus:border-brand-navy" />
                                </label>
                                <label className="block text-[10px] font-bold text-brand-navy">Phone number used to order
                                    <span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-[#dce2ea] px-3.5 focus-within:border-brand-navy"><span className="text-xs text-brand-navy-muted">+91</span><input required inputMode="numeric" maxLength={10} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" className="h-full min-w-0 flex-1 text-sm font-normal text-brand-navy outline-none placeholder:text-[#a0a8b4]" /></span>
                                </label>
                                <button type="submit" className="h-11 w-full rounded-xl bg-brand-navy text-xs font-bold text-white">Find order</button>
                            </form>
                        )}

                        {mode === "phone" && (
                            <form onSubmit={submitUnavailableMode} className="mt-4">
                                {!otpStep ? <>
                                    <h3 className="text-sm font-semibold text-brand-navy">Enter your mobile number</h3>
                                    <p className="mt-1 text-xs leading-5 text-[#718096]">Use the number you placed your orders with. We&apos;ll send a one-time password to confirm it&apos;s you.</p>
                                    <label className="mt-4 block text-[10px] font-bold text-brand-navy">Mobile number
                                        <span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-[#dce2ea] px-3.5 focus-within:border-brand-navy"><span className="text-xs text-brand-navy-muted">+91</span><input required inputMode="numeric" maxLength={10} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" className="h-full min-w-0 flex-1 text-sm font-normal text-brand-navy outline-none placeholder:text-[#a0a8b4]" /></span>
                                    </label>
                                    <button type="submit" className="mt-3 h-11 w-full rounded-xl bg-brand-navy text-xs font-bold text-white">Send OTP</button>
                                </> : <>
                                    <h3 className="text-sm font-semibold text-brand-navy">Verify your phone number</h3>
                                    <p className="mt-1 text-xs leading-5 text-[#718096]">Phone OTP verification is not connected to the server yet, so no code has been sent.</p>
                                    <label className="mt-4 block text-[10px] font-bold text-brand-navy">One-time password
                                        <input disabled inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="OTP unavailable until phone verification is enabled" className="mt-1.5 h-11 w-full rounded-xl border border-[#dce2ea] bg-[#f5f7fa] px-3.5 text-sm text-brand-navy outline-none placeholder:text-[#a0a8b4] disabled:cursor-not-allowed" />
                                    </label>
                                    <button type="submit" disabled className="mt-3 h-11 w-full rounded-xl bg-brand-navy text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Verify OTP</button>
                                </>}
                            </form>
                        )}

                        {message && <p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">{message}</p>}
                    </section>

                    {tracking && (
                        <section className="mt-5 overflow-hidden rounded-[20px] border border-[#e1e6ee] bg-white">
                            {shipment ? (
                                <>
                                    <div className="flex items-start gap-3 border-b border-[#e7ebf1] bg-[#f5f7fa] p-4 sm:p-5">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white"><Truck size={19} /></span>
                                        <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Shipment status</p><h2 className="mt-1 text-base font-semibold text-brand-navy">{shipment.current_status || "Tracking update"}</h2><p className="mt-1 break-all text-xs text-[#718096]">{shipment.courier_name || "Courier"}{shipment.awb_code ? ` · ${shipment.awb_code}` : ""}</p></div>
                                        <CheckCircle2 size={19} className="shrink-0 text-success-green" />
                                    </div>
                                    <div className="space-y-4 p-4 sm:p-5">
                                        {activities.length ? activities.map((activity, index) => <div key={`${activity.date}-${index}`} className="flex gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-success-green ring-4 ring-[#e8f5ef]" /><div className="min-w-0"><p className="text-sm font-semibold text-brand-navy">{activity.activity || activity.status || "Shipment update"}</p><p className="mt-1 text-xs text-[#718096]">{[activity.date, activity.location].filter(Boolean).join(" · ")}</p></div></div>) : <p className="text-xs text-[#718096]">No shipment scans are available yet.</p>}
                                        {shipment.etd && <p className="border-t border-[#e7ebf1] pt-3 text-xs text-brand-navy-muted">Estimated delivery: <strong>{shipment.etd}</strong></p>}
                                    </div>
                                </>
                            ) : <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 text-xs text-brand-navy-muted">{JSON.stringify(tracking, null, 2)}</pre>}
                        </section>
                    )}

                    <p className="mt-4 flex items-start justify-center gap-1.5 text-center text-[10px] leading-4 text-[#8b94a3]"><LockKeyhole size={12} className="mt-0.5 shrink-0" />Tracking shows shipment status only, never product names.</p>
                </div>

                <p className="mt-8 text-center text-xs text-[#718096]">Have an account? <Link href="/user/login" className="font-bold text-brand-navy underline underline-offset-4">Log in to see all your orders</Link></p>
            </div>
        </main>
    );
}
