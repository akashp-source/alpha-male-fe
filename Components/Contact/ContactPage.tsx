"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Loader2,
    HelpCircle,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    Truck,
} from "lucide-react";

import { WHATSAPP_LINK } from "@/lib/contact";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
const SUPPORT_EMAIL = "info@alphamale.co.in";
const SUPPORT_PHONE = "+91 90009 37222";
const SUPPORT_PHONE_LINK = "+919000937222";

const TOPICS = ["General question", "Order or delivery", "Product question", "Returns or refunds", "Business / partnership", "Something else"];

const inputClass =
    "mt-1.5 h-12 w-full rounded-xl border border-[#d9dfe8] bg-white px-4 font-body text-sm font-normal text-brand-navy outline-none transition placeholder:text-[#6b7485] focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15";

const channels = [
    {
        href: WHATSAPP_LINK,
        external: true,
        icon: MessageCircle,
        title: "WhatsApp",
        detail: SUPPORT_PHONE,
        note: "Usually the fastest way",
        highlight: true,
    },
    { href: `tel:${SUPPORT_PHONE_LINK}`, icon: Phone, title: "Call us", detail: SUPPORT_PHONE, note: "Mon-Sat, 10 am - 6 pm IST" },
    { href: `mailto:${SUPPORT_EMAIL}`, icon: Mail, title: "Email", detail: SUPPORT_EMAIL, note: "We reply within 24 hours" },
];

/** Contact page: ways to reach the team, plus a form saved to the backend (POST /contact). */
export default function ContactPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [topic, setTopic] = useState(TOPICS[0]);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    // Hidden from people; bots fill it in and the backend ignores those.
    const [website, setWebsite] = useState("");

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (sending) return;
        setSending(true);
        setError("");
        setStatus("");
        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    ...(phone.trim() ? { phone: phone.trim() } : {}),
                    topic,
                    message: message.trim(),
                    ...(website ? { website } : {}),
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                if (response.status === 429) throw new Error("Too many messages in a short time. Please wait a minute and try again.");
                throw new Error(Array.isArray(data.message) ? data.message.join(" ") : data.message || "We couldn't send your message.");
            }
            setStatus("Thanks, your message has been sent. Our team will reply within 24 hours (Mon-Sat).");
            setMessage("");
            setPhone("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "We couldn't send your message.");
        } finally {
            setSending(false);
        }
    }

    /* Old submit: opened a pre-filled email instead of saving the message.
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const subject = `Contact: ${topic} - ${name.trim()}`;
        const body = [
            `Name: ${name.trim()}`,
            `Email: ${email.trim()}`,
            `Phone: ${phone.trim() || "Not provided"}`,
            `Topic: ${topic}`,
            "",
            message.trim(),
        ].join("\n");
        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setStatus("Your email app will open with your message. Press send to reach our team.");
    }
    */

    return (
        <main className="w-full bg-[#f7f8fa] text-brand-navy">
            {/* Hero */}
            <section className="bg-brand-navy px-5 py-14 text-center text-white sm:py-20">
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-palladium">Contact us</p>
                <h1 className="mt-4 font-heading text-[clamp(28px,5vw,46px)] font-semibold uppercase leading-tight tracking-[0.04em] text-olympus">
                    Talk to us, privately
                </h1>
                <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-7 text-palladium sm:text-base">
                    Questions about a product, an order or anything else? Our team answers every message in
                    confidence.
                </p>
            </section>

            <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                {/* Channels */}
                <ul className="grid gap-4 md:grid-cols-3">
                    {channels.map(({ href, external, icon: Icon, title, detail, note, highlight }) => (
                        <li key={title}>
                            <a
                                href={href}
                                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                className={`flex h-full items-start gap-4 rounded-[20px] border p-5 transition sm:p-6 ${
                                    highlight
                                        ? "border-transparent bg-[#e8f5ef] hover:bg-[#ddf0e7]"
                                        : "border-[#e1e6ee] bg-white hover:bg-[#f8f9fb]"
                                }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${
                                        highlight ? "bg-success-green" : "bg-brand-navy"
                                    }`}
                                >
                                    <Icon size={20} />
                                </span>
                                <span className="min-w-0">
                                    <span className="block font-heading text-lg">{title}</span>
                                    <span className="mt-1 block break-all font-body text-sm font-semibold">{detail}</span>
                                    <span className="mt-1 block font-body text-xs text-brand-navy-muted">{note}</span>
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
                    {/* Form */}
                    <section className="relative rounded-[22px] border border-[#e1e6ee] bg-white p-5 sm:p-8">
                        <h2 className="font-heading text-2xl">Send us a message</h2>
                        <p className="mt-1 font-body text-sm text-brand-navy-muted">
                            We read every message and reply within 24 hours, Monday to Saturday.
                        </p>
                        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                            {/* Honeypot: hidden from people and screen readers. */}
                            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                                <label>
                                    Website
                                    <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
                                </label>
                            </div>
                            <label className="block font-body text-xs font-bold">
                                Your name
                                <input required maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
                            </label>
                            <label className="block font-body text-xs font-bold">
                                Email
                                <input required type="email" maxLength={150} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
                            </label>
                            <label className="block font-body text-xs font-bold">
                                Phone <span className="font-normal text-brand-navy-muted">(optional)</span>
                                <input type="tel" maxLength={20} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} />
                            </label>
                            <label className="block font-body text-xs font-bold">
                                Topic
                                <select value={topic} onChange={(event) => setTopic(event.target.value)} className={`${inputClass} font-semibold`}>
                                    {TOPICS.map((option) => <option key={option}>{option}</option>)}
                                </select>
                            </label>
                            <label className="block font-body text-xs font-bold sm:col-span-2">
                                Message
                                <textarea
                                    required
                                    minLength={10}
                                    maxLength={2000}
                                    rows={5}
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    placeholder="How can we help?"
                                    className={`${inputClass} block h-auto min-h-32 resize-y py-3`}
                                />
                            </label>
                            <div className="sm:col-span-2">
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 font-body text-sm font-bold text-white transition hover:bg-[#14284d] disabled:opacity-70 sm:w-auto"
                                >
                                    {sending ? <Loader2 size={16} aria-hidden="true" className="animate-spin" /> : <Send size={16} aria-hidden="true" />}
                                    {sending ? "Sending..." : "Send message"}
                                </button>
                                {error && (
                                    <p role="alert" className="mt-3 flex items-start gap-2 font-body text-xs leading-5 text-red-700">
                                        <AlertCircle size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
                                        <span>
                                            {error} You can also email us at{" "}
                                            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline">{SUPPORT_EMAIL}</a>.
                                        </span>
                                    </p>
                                )}
                                {status && (
                                    <p role="status" className="mt-3 flex items-start gap-2 font-body text-xs leading-5 text-success-green">
                                        <CheckCircle2 size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
                                        {status}
                                    </p>
                                )}
                            </div>
                        </form>
                    </section>

                    {/* Details */}
                    <aside className="space-y-4">
                        <section className="rounded-[22px] border border-[#e1e6ee] bg-white p-5 sm:p-6">
                            <ul className="space-y-4 font-body text-sm">
                                <li className="flex gap-3">
                                    <Clock size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                                    <span>
                                        <span className="block font-bold">Support hours</span>
                                        <span className="text-brand-navy-muted">Monday to Saturday, 10:00 AM to 6:00 PM IST</span>
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <MapPin size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                                    <span>
                                        <span className="block font-bold">Location</span>
                                        <span className="text-brand-navy-muted">Hyderabad, Telangana, India</span>
                                    </span>
                                </li>
                            </ul>
                        </section>
                        <section className="rounded-[22px] border border-[#e1e6ee] bg-white p-5 sm:p-6">
                            <h2 className="font-body text-sm font-bold">Looking for something quick?</h2>
                            <ul className="mt-2 space-y-1 font-body text-sm font-semibold">
                                <li>
                                    <Link href="/track" className="flex min-h-11 items-center gap-3 rounded-xl px-2 transition hover:bg-[#f5f7fa]">
                                        <Truck size={17} aria-hidden="true" /> <span className="flex-1">Track your order</span> <span aria-hidden="true">›</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/help" className="flex min-h-11 items-center gap-3 rounded-xl px-2 transition hover:bg-[#f5f7fa]">
                                        <HelpCircle size={17} aria-hidden="true" /> <span className="flex-1">Help centre &amp; FAQs</span> <span aria-hidden="true">›</span>
                                    </Link>
                                </li>
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}
