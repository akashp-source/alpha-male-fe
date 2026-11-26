"use client";

import { FormEvent, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
    CheckCircle2,
    ChevronDown,
    CreditCard,
    FileText,
    FlaskConical,
    Headphones,
    HelpCircle,
    Mail,
    MessageCircle,
    Package,
    Phone,
    RotateCcw,
    Search,
    Truck,
    UserRound,
} from "lucide-react";
import { ONLINE_PAYMENT_DISCOUNT_PERCENT } from "@/lib/offers";

/**
 * Public help centre (no sign-in needed). Based on the account support page
 * (/user/support), minus the account sidebar and order lookups: guests type
 * their own details into the request form, which opens a pre-filled email.
 */

const SUPPORT_EMAIL = "info@alphamale.co.in";
const SUPPORT_PHONE = "+91 90009 37222";
const SUPPORT_PHONE_LINK = "+919000937222";

type Topic = "Orders" | "Delivery" | "Payments" | "Returns" | "Using" | "Account";

interface FAQ {
    topic: Topic;
    question: string;
    answer: string;
}

const topics: { title: string; subtitle: string; key: Topic; icon: typeof Package }[] = [
    { title: "Orders & tracking", subtitle: "Track, change or cancel", key: "Orders", icon: Package },
    { title: "Delivery & packaging", subtitle: "Pincodes, discreet shipping", key: "Delivery", icon: Truck },
    { title: "Payments & offers", subtitle: "Online offer, COD, refunds", key: "Payments", icon: CreditCard },
    { title: "Returns", subtitle: "Damaged or wrong items", key: "Returns", icon: RotateCcw },
    { title: "Using our products", subtitle: "How to use, safety", key: "Using", icon: FlaskConical },
    { title: "Account & login", subtitle: "Sign in, profile, addresses", key: "Account", icon: UserRound },
];

const faqs: FAQ[] = [
    { topic: "Orders", question: "How do I track my order?", answer: "Use Track order with your AWB number, or your order number and phone number. If you have an account, you can also open My orders and choose Track order on a shipped order." },
    { topic: "Orders", question: "Can I cancel my order?", answer: "If your order has not shipped, contact our team as soon as possible with your order number. Once it has shipped, cancellation may no longer be available." },
    { topic: "Orders", question: "Do I need an account to order?", answer: "No. You can check out as a guest. Creating an account lets you see all your orders, save addresses and track shipments in one place." },
    { topic: "Delivery", question: "Is the packaging discreet?", answer: "Yes. Orders are shipped in plain packaging with private billing, so the product details are not visible on the outside." },
    { topic: "Delivery", question: "Do you deliver to my pincode?", answer: "Pincode serviceability is confirmed at checkout. If your address is not serviceable, try another delivery address or contact our team." },
    { topic: "Delivery", question: "Why will your team call me after I order?", answer: "Every order is confirmed by phone before dispatch. Our team also runs a short consultation - age, health and current medicines - so every product reaches you safely." },
    { topic: "Payments", question: `How does the ${ONLINE_PAYMENT_DISCOUNT_PERCENT}% online payment offer work?`, answer: "Eligible prepaid orders receive the online payment offer at checkout. The final discount is shown in your order summary before you place the order." },
    { topic: "Payments", question: "Is cash on delivery available?", answer: "Cash on delivery may be available for eligible locations and orders. You'll see it as a payment option at checkout when available." },
    { topic: "Payments", question: "When will I get my refund?", answer: "After a return or cancellation is approved, the refund is initiated to the original payment method. Processing time depends on your bank or payment provider." },
    { topic: "Returns", question: "How do I return an item?", answer: "Please review our Return & Refund policy, then contact support with your order number and reason. Our team will guide you through the next steps." },
    { topic: "Using", question: "How do I use Bold S 25mg?", answer: "Follow the directions on the product packaging and any instructions from your healthcare professional. Contact support if you need help finding product information." },
    { topic: "Using", question: "Is it safe for me to use?", answer: "Suitability depends on your personal health and other medicines. Read the product information and consult a qualified healthcare professional if you have questions." },
    { topic: "Account", question: "How do I create an account or sign in?", answer: "Choose the account icon in the top bar to sign in or register. If you ordered as a guest, you can still track your order without an account." },
    { topic: "Account", question: "How do I change my saved address?", answer: "Sign in and open Saved addresses in your account. You can review the addresses saved to your profile and use the correct address at checkout." },
];

const popularSearches: { label: string; query: string; topic: Topic }[] = [
    { label: "Track my order", query: "track", topic: "Orders" },
    { label: "Refund", query: "refund", topic: "Payments" },
    { label: "Cancel order", query: "cancel", topic: "Orders" },
    { label: "Packaging", query: "packaging", topic: "Delivery" },
];

const issueOptions = [
    "Where is my order?",
    "I want to cancel my order",
    "Delivery or packaging issue",
    "Payment or refund issue",
    "I received a damaged or wrong item",
    "Product usage question",
    "Account or login issue",
    "Other",
];

const quickLinks = [
    { label: "Track an order", href: "/track", icon: Truck },
    { label: "Return & refund policy", href: "/policies/returns", icon: RotateCcw },
    { label: "Shipping & delivery policy", href: "/policies/shipping", icon: Package },
    { label: "Cancellation policy", href: "/policies/cancellation", icon: FileText },
];

const inputClass =
    "mt-2 h-12 w-full min-w-0 rounded-xl border border-[#dce2ea] bg-white px-3 text-sm font-normal text-brand-navy outline-none placeholder:text-[#6b7485] focus:border-brand-navy focus:ring-2 focus:ring-brand-navy";

export default function HelpCenter() {
    const idPrefix = useId();
    const [query, setQuery] = useState("");
    const [activeTopic, setActiveTopic] = useState<Topic | "All">("All");
    const [expandedFaq, setExpandedFaq] = useState(0);
    const [helpful, setHelpful] = useState<Record<number, boolean>>({});

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [orderNumber, setOrderNumber] = useState("");
    const [issue, setIssue] = useState(issueOptions[0]);
    const [details, setDetails] = useState("");
    const [submitMessage, setSubmitMessage] = useState("");

    const visibleFAQs = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return faqs
            .map((faq, index) => ({ ...faq, index }))
            .filter((faq) => activeTopic === "All" || faq.topic === activeTopic)
            .filter((faq) => !normalizedQuery || `${faq.topic} ${faq.question} ${faq.answer}`.toLowerCase().includes(normalizedQuery));
    }, [activeTopic, query]);

    function chooseTopic(topic: Topic) {
        setActiveTopic((current) => (current === topic ? "All" : topic));
        setExpandedFaq(-1);
    }

    function submitRequest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const order = orderNumber.trim();
        const subject = `Support request${order ? ` - ${order}` : ""}: ${issue}`;
        const body = [
            `Name: ${name.trim()}`,
            `Email: ${email.trim()}`,
            `Order: ${order || "Not provided"}`,
            `Issue: ${issue}`,
            "",
            details.trim(),
        ].join("\n");
        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setSubmitMessage("Your email app will open with the request details. Send the email to reach our team.");
    }

    return (
        <main className="w-full bg-[#f7f8fa]">
            <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                <header className="mb-7 sm:mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-success-green">Help centre</p>
                    <h1 className="mt-2 font-heading text-2xl font-semibold tracking-wide text-brand-navy sm:text-3xl">HELP &amp; SUPPORT</h1>
                    <p className="mt-2 text-sm text-brand-navy-muted">Find answers or get in touch with our team. No sign-in needed.</p>
                </header>

                {/* Search */}
                <section aria-labelledby={`${idPrefix}-search-heading`} className="relative overflow-hidden rounded-[22px] bg-brand-navy px-5 py-7 text-white sm:px-8 sm:py-9 lg:px-9">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[28px] border-white/[0.035]" />
                    <div aria-hidden="true" className="pointer-events-none absolute -right-4 top-8 h-36 w-36 rounded-full border border-white/[0.06]" />
                    <h2 id={`${idPrefix}-search-heading`} className="relative text-xl font-semibold sm:text-2xl">How can we help you today?</h2>
                    <label className="relative mt-5 flex h-12 items-center gap-3 rounded-xl bg-white px-4 text-brand-navy-muted focus-within:ring-2 focus-within:ring-[#e9b949] focus-within:ring-offset-2 focus-within:ring-offset-brand-navy sm:h-[58px] sm:px-5">
                        <Search size={19} className="shrink-0" aria-hidden="true" />
                        <input
                            type="search"
                            aria-label="Search help articles"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search e.g. track order, refund, packaging"
                            className="h-full min-w-0 flex-1 bg-transparent text-sm text-brand-navy outline-none placeholder:text-[#6b7485] sm:text-base"
                        />
                    </label>
                    <div className="relative mt-4 flex flex-wrap items-center gap-2 text-xs sm:gap-2.5">
                        <span className="mr-1 text-white/85">Popular:</span>
                        {popularSearches.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => { setQuery(item.query); setActiveTopic(item.topic); setExpandedFaq(-1); }}
                                className="rounded-full border border-white/25 bg-white/[0.07] px-3 py-2 font-semibold transition hover:bg-white/15 sm:px-3.5"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Topics */}
                <section className="mt-6 sm:mt-7">
                    <h3 className="mb-3 text-base font-semibold text-brand-navy sm:text-lg">Browse by topic</h3>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                        {topics.map((topic) => {
                            const Icon = topic.icon;
                            const selected = activeTopic === topic.key;
                            return (
                                <button
                                    key={topic.key}
                                    type="button"
                                    onClick={() => chooseTopic(topic.key)}
                                    aria-pressed={selected}
                                    className={`flex min-h-[76px] items-center gap-3 rounded-[18px] border p-3 text-left transition sm:min-h-[84px] sm:gap-4 sm:p-4 ${selected ? "border-brand-navy bg-pale-gray" : "border-[#e1e6ee] bg-white hover:border-brand-navy/40"}`}
                                >
                                    <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pale-gray text-brand-navy sm:h-[54px] sm:w-[54px]"><Icon size={20} /></span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-bold text-brand-navy sm:text-[15px]">{topic.title}</span>
                                        <span className="mt-0.5 block text-xs text-brand-navy-muted">{topic.subtitle}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,.8fr)] lg:gap-5">
                    {/* FAQs */}
                    <section className="overflow-hidden rounded-[22px] border border-[#e1e6ee] bg-white">
                        <div className="flex items-center gap-3 border-b border-[#e7ebf1] bg-[#f1f3f6] px-5 py-4 sm:px-6 sm:py-5">
                            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white"><HelpCircle size={21} /></span>
                            <div>
                                <h3 className="text-base font-semibold text-brand-navy sm:text-lg">Frequently asked questions</h3>
                                <p className="text-xs text-brand-navy-muted" aria-live="polite">{visibleFAQs.length} {visibleFAQs.length === 1 ? "answer" : "answers"}</p>
                            </div>
                        </div>

                        {visibleFAQs.length === 0 ? (
                            <div className="px-5 py-12 text-center sm:px-8">
                                <p className="text-sm font-semibold text-brand-navy">No answers found</p>
                                <p className="mt-1 text-xs text-brand-navy-muted">Try another search, browse a different topic, or contact our team.</p>
                                <button type="button" onClick={() => { setQuery(""); setActiveTopic("All"); }} className="mt-4 text-xs font-bold text-success-green underline underline-offset-4">Clear filters</button>
                            </div>
                        ) : visibleFAQs.map((faq) => {
                            const isOpen = expandedFaq === faq.index;
                            const buttonId = `${idPrefix}-faq-button-${faq.index}`;
                            const panelId = `${idPrefix}-faq-panel-${faq.index}`;
                            return (
                                <article key={faq.question} className="border-b border-[#e7ebf1] last:border-0">
                                    <h3>
                                        <button
                                            type="button"
                                            id={buttonId}
                                            aria-expanded={isOpen}
                                            aria-controls={panelId}
                                            onClick={() => setExpandedFaq(isOpen ? -1 : faq.index)}
                                            className="flex min-h-[58px] w-full items-center gap-2 px-4 py-3 text-left sm:gap-3 sm:px-6 sm:py-4"
                                        >
                                            <span className="hidden shrink-0 rounded-md bg-pale-gray px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-brand-navy-muted sm:inline-flex">{faq.topic}</span>
                                            <span className="min-w-0 flex-1 text-sm font-bold text-brand-navy sm:text-[15px]">{faq.question}</span>
                                            <ChevronDown size={18} aria-hidden="true" className={`shrink-0 text-brand-navy transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                        </button>
                                    </h3>
                                    <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="px-4 pb-5 sm:px-6 sm:pb-6">
                                        <p className="text-sm leading-6 text-brand-navy-muted">{faq.answer}</p>
                                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                                            <span className="mr-1 text-brand-navy-muted">Was this helpful?</span>
                                            {([true, false] as const).map((vote) => (
                                                <button
                                                    key={String(vote)}
                                                    type="button"
                                                    aria-pressed={helpful[faq.index] === vote}
                                                    onClick={() => setHelpful((current) => ({ ...current, [faq.index]: vote }))}
                                                    className={`rounded-full border px-3.5 py-1.5 font-semibold transition ${helpful[faq.index] === vote ? "border-brand-navy bg-brand-navy text-white" : "border-[#dce2ea] text-brand-navy hover:bg-[#f5f7fa]"}`}
                                                >
                                                    {vote ? "Yes" : "No"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <div className="space-y-4">
                        {/* Contact */}
                        <section className="rounded-[22px] border border-[#e1e6ee] bg-white p-5 sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-white"><Headphones size={20} /></span>
                                <div>
                                    <h3 className="text-base font-semibold text-brand-navy">Talk to us</h3>
                                    <p className="text-xs text-brand-navy-muted">Mon-Sat, 10 am - 6 pm IST</p>
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <a href={`https://wa.me/${SUPPORT_PHONE_LINK.slice(1)}`} target="_blank" rel="noopener noreferrer" className="flex min-h-[72px] items-center gap-3 rounded-2xl bg-[#e8f5ef] p-3 transition hover:bg-[#ddf0e7]">
                                    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-green text-white"><MessageCircle size={19} /></span>
                                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-brand-navy">Chat on WhatsApp</span><span className="block break-words text-xs text-brand-navy-muted">Usually the fastest way · {SUPPORT_PHONE}</span></span>
                                    <span aria-hidden="true" className="text-brand-navy">›</span>
                                </a>
                                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex min-h-[65px] items-center gap-3 rounded-2xl border border-[#e1e6ee] p-3 transition hover:bg-[#f8f9fb]">
                                    <Mail size={20} aria-hidden="true" className="ml-1 shrink-0 text-brand-navy" />
                                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-brand-navy">Email us</span><span className="block break-all text-xs text-brand-navy-muted">{SUPPORT_EMAIL}</span></span>
                                    <span aria-hidden="true" className="text-brand-navy">›</span>
                                </a>
                                <a href={`tel:${SUPPORT_PHONE_LINK}`} className="flex min-h-[65px] items-center gap-3 rounded-2xl border border-[#e1e6ee] p-3 transition hover:bg-[#f8f9fb]">
                                    <Phone size={19} aria-hidden="true" className="ml-1 shrink-0 text-brand-navy" />
                                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-brand-navy">Call us</span><span className="block text-xs text-brand-navy-muted">{SUPPORT_PHONE}</span></span>
                                    <span aria-hidden="true" className="text-brand-navy">›</span>
                                </a>
                            </div>
                        </section>

                        {/* Request form (opens a pre-filled email) */}
                        <section className="rounded-[22px] border border-[#e1e6ee] bg-white p-5 sm:p-6">
                            <h3 className="text-base font-semibold text-brand-navy">Raise a request</h3>
                            <p className="mt-1 text-xs leading-5 text-brand-navy-muted">Tell us what went wrong and we&apos;ll get back to you.</p>
                            <form onSubmit={submitRequest} className="mt-4 space-y-3.5">
                                <label className="block text-xs font-bold text-brand-navy">Your name
                                    <input required maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
                                </label>
                                <label className="block text-xs font-bold text-brand-navy">Email
                                    <input required type="email" maxLength={150} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
                                </label>
                                <label className="block text-xs font-bold text-brand-navy">Order number <span className="font-normal text-brand-navy-muted">(optional)</span>
                                    <input maxLength={40} value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="e.g. ORD-123456" className={inputClass} />
                                </label>
                                <label className="block text-xs font-bold text-brand-navy">What&apos;s the issue?
                                    <select value={issue} onChange={(event) => setIssue(event.target.value)} className={`${inputClass} font-semibold`}>
                                        {issueOptions.map((option) => <option key={option}>{option}</option>)}
                                    </select>
                                </label>
                                <label className="block text-xs font-bold text-brand-navy">Details
                                    <textarea required minLength={10} maxLength={2000} rows={4} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Describe the issue" className={`${inputClass} block h-auto min-h-28 resize-y py-3`} />
                                </label>
                                <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-bold text-white transition hover:bg-[#14284d]">
                                    <Mail size={16} aria-hidden="true" />Prepare request email
                                </button>
                                {submitMessage && (
                                    <p role="status" className="flex items-start gap-2 text-xs leading-5 text-success-green">
                                        <CheckCircle2 size={15} aria-hidden="true" className="mt-0.5 shrink-0" />{submitMessage}
                                    </p>
                                )}
                                <p className="text-xs leading-5 text-brand-navy-muted">Your email app opens with the details. Attach any photos there before sending.</p>
                            </form>
                        </section>

                        {/* Quick links */}
                        <section className="rounded-[22px] border border-[#e1e6ee] bg-white p-5 sm:p-6">
                            <h3 className="text-base font-semibold text-brand-navy">Quick links</h3>
                            <ul className="mt-3 space-y-1">
                                {quickLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <li key={link.href}>
                                            <Link href={link.href} className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm font-semibold text-brand-navy transition hover:bg-[#f5f7fa]">
                                                <Icon size={17} aria-hidden="true" className="shrink-0" />
                                                <span className="flex-1">{link.label}</span>
                                                <span aria-hidden="true">›</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                            <p className="mt-3 text-xs leading-5 text-brand-navy-muted">
                                Have an account? <Link href="/user/orders" className="font-semibold text-brand-navy underline underline-offset-4">View my orders</Link>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
