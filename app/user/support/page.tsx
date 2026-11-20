"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    CreditCard,
    FlaskConical,
    Headphones,
    HelpCircle,
    Mail,
    Package,
    Phone,
    RotateCcw,
    Search,
    Truck,
    UserRound,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Paperclip,
    CheckCircle2,
} from "lucide-react";
import AccountSidebar from "@/Components/user/AccountSidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
const SUPPORT_EMAIL = "info@alphamale.co.in";
const SUPPORT_PHONE = "+91 90009 37222";
const SUPPORT_PHONE_LINK = "+919000937222";

type Topic = "Orders" | "Delivery" | "Payments" | "Returns" | "Using" | "Account";

interface FAQ {
    topic: Topic;
    question: string;
    answer: string;
}

interface SupportOrder {
    _id?: string;
    orderNumber?: string;
    status?: string | null;
    shipmentCurrentStatus?: string | null;
    createdAt?: string;
}

interface SupportProfile {
    name?: string;
    email?: string;
}

const topics: { title: string; subtitle: string; key: Topic; icon: typeof Package }[] = [
    { title: "Orders & tracking", subtitle: "Track, change or cancel", key: "Orders", icon: Package },
    { title: "Delivery & packaging", subtitle: "Pincodes, discreet shipping", key: "Delivery", icon: Truck },
    { title: "Payments & offers", subtitle: "Online offer, COD, refunds", key: "Payments", icon: CreditCard },
    { title: "Returns", subtitle: "Damaged or wrong items", key: "Returns", icon: RotateCcw },
    { title: "Using our products", subtitle: "How to use, safety", key: "Using", icon: FlaskConical },
    { title: "Account & login", subtitle: "Profile, 2FA, addresses", key: "Account", icon: UserRound },
];

const faqs: FAQ[] = [
    { topic: "Orders", question: "How do I track my order?", answer: "Open My orders and choose Track order on a shipped order. You’ll see the shipment progress and tracking details when they’re available.", },
    { topic: "Orders", question: "Can I cancel my order?", answer: "If your order has not shipped, contact our team as soon as possible. Once it has shipped, cancellation may no longer be available.", },
    { topic: "Delivery", question: "Is the packaging discreet?", answer: "Yes. Orders are shipped in plain packaging with private billing, so the product details are not visible on the outside.", },
    { topic: "Delivery", question: "Do you deliver to my pincode?", answer: "Pincode serviceability is confirmed at checkout. If your address is not serviceable, try another delivery address or contact our team.", },
    { topic: "Payments", question: "How does the 12% online payment offer work?", answer: "Eligible prepaid orders receive the online payment offer at checkout. The final discount is shown in your order summary before you place the order.", },
    { topic: "Payments", question: "Is cash on delivery available?", answer: "Cash on delivery may be available for eligible locations and orders. You’ll see it as a payment option at checkout when available.", },
    { topic: "Payments", question: "When will I get my refund?", answer: "After a return or cancellation is approved, the refund is initiated to the original payment method. Processing time depends on your bank or payment provider.", },
    { topic: "Returns", question: "How do I return an item?", answer: "Please review our Returns policy, then contact support with your order number and reason. Our team will guide you through the next steps.", },
    { topic: "Using", question: "How do I use Bold S 25mg?", answer: "Follow the directions on the product packaging and any instructions from your healthcare professional. Contact support if you need help finding product information.", },
    { topic: "Using", question: "Is it safe for me to use?", answer: "Suitability depends on your personal health and other medicines. Read the product information and consult a qualified healthcare professional if you have questions.", },
    { topic: "Account", question: "How do I turn on two-factor authentication?", answer: "Open Profile & security from the account menu and follow the two-factor authentication settings shown there.", },
    { topic: "Account", question: "How do I change my saved address?", answer: "Open Saved addresses in your account. You can review the addresses saved to your profile and use the correct address at checkout.", },
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

export default function SupportPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<SupportProfile | null>(null);
    const [orders, setOrders] = useState<SupportOrder[]>([]);
    const [orderCount, setOrderCount] = useState<number>();
    const [query, setQuery] = useState("");
    const [activeTopic, setActiveTopic] = useState<Topic | "All">("All");
    const [expandedFaq, setExpandedFaq] = useState(0);
    const [helpful, setHelpful] = useState<Record<number, boolean>>({});
    const [details, setDetails] = useState("");
    const [selectedOrder, setSelectedOrder] = useState("");
    const [issue, setIssue] = useState(issueOptions[0]);
    const [attachmentName, setAttachmentName] = useState("");
    const [submitMessage, setSubmitMessage] = useState("");

    useEffect(() => {
        const token = window.localStorage.getItem("token");
        if (!token) {
            router.replace("/user/login");
            return;
        }

        const controller = new AbortController();
        const headers = { Authorization: `Bearer ${token}` };

        Promise.all([
            fetch(`${API_URL}/user/profile/me`, { headers, cache: "no-store", signal: controller.signal })
                .then(async (response) => {
                    if (response.status === 401) throw new Error("Your session has expired. Please sign in again.");
                    if (!response.ok) throw new Error("Profile details could not be loaded.");
                    return response.json() as Promise<SupportProfile>;
                })
                .then(setProfile),
            fetch(`${API_URL}/orders/my-orders?page=1&limit=20`, { headers, cache: "no-store", signal: controller.signal })
                .then(async (response) => {
                    if (!response.ok) return;
                    const result = await response.json();
                    const data = Array.isArray(result.data) ? result.data as SupportOrder[] : [];
                    setOrders(data);
                    setOrderCount(result.pagination?.totalOrders ?? data.length);
                })
                .catch(() => undefined),
        ]).catch((cause: unknown) => {
            if (controller.signal.aborted) return;
            if (cause instanceof Error && cause.message.includes("session has expired")) {
                window.localStorage.removeItem("token");
                window.localStorage.removeItem("user");
                router.replace("/user/login");
            }
        });

        return () => controller.abort();
    }, [router]);

    const visibleFAQs = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return faqs
            .map((faq, index) => ({ ...faq, index }))
            .filter((faq) => activeTopic === "All" || faq.topic === activeTopic)
            .filter((faq) => !normalizedQuery || `${faq.topic} ${faq.question} ${faq.answer}`.toLowerCase().includes(normalizedQuery));
    }, [activeTopic, query]);

    function chooseTopic(topic: Topic) {
        setActiveTopic((current) => current === topic ? "All" : topic);
        setExpandedFaq(-1);
    }

    function submitRequest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const orderNumber = orders.find((order) => (order._id || order.orderNumber) === selectedOrder)?.orderNumber;
        const subject = `Support request${orderNumber ? ` - ${orderNumber}` : ""}: ${issue}`;
        const body = [
            `Name: ${profile?.name || ""}`,
            `Email: ${profile?.email || ""}`,
            `Order: ${orderNumber || "Not selected"}`,
            `Issue: ${issue}`,
            "",
            details,
            attachmentName ? `\nPhoto selected: ${attachmentName} (please attach it to this email)` : "",
        ].join("\n");
        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setSubmitMessage("Your email app will open with the request details. Send the email to reach our team.");
    }

    const normalizedName = profile?.name || "Customer";

    return (
        <main className="min-h-screen bg-[#f7f8fa]">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-12">
                <header className="mb-7 sm:mb-8">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#176348]">Your account</p>
                    <h1 className="mt-2 font-heading text-2xl font-bold tracking-wide text-[#07152e] sm:text-3xl">HELP &amp; SUPPORT</h1>
                    <p className="mt-2 text-xs text-[#91857b] sm:text-sm">Find answers or get in touch with our team.</p>
                </header>

                <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[290px_minmax(0,1fr)]">
                    <AccountSidebar name={normalizedName} email={profile?.email} orderCount={orderCount} privacyNote="Your conversations with our team stay private." />

                    <div className="min-w-0">
                        <section className="relative overflow-hidden rounded-[22px] bg-[#07152e] px-5 py-7 text-white sm:px-8 sm:py-9 lg:px-9">
                            <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[28px] border-white/[0.035]" />
                            <div aria-hidden="true" className="pointer-events-none absolute -right-4 top-8 h-36 w-36 rounded-full border border-white/[0.06]" />
                            <h2 className="relative text-xl font-bold sm:text-2xl">How can we help you today?</h2>
                            <label className="relative mt-5 flex h-12 items-center gap-3 rounded-xl bg-white px-4 text-[#718096] sm:h-[58px] sm:px-5">
                                <Search size={19} className="shrink-0" />
                                <input aria-label="Search support articles" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search e.g. track order, refund, packaging" className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#07152e] outline-none placeholder:text-[#8b94a3] sm:text-base" />
                            </label>
                            <div className="relative mt-4 flex flex-wrap items-center gap-2 text-xs sm:gap-2.5">
                                <span className="mr-1 text-white/75">Popular:</span>
                                {[
                                    { label: "Track my order", topic: "Orders" as Topic },
                                    { label: "Refund", topic: "Payments" as Topic },
                                    { label: "Cancel order", topic: "Orders" as Topic },
                                    { label: "Packaging", topic: "Delivery" as Topic },
                                ].map((item) => (
                                    <button key={item.label} type="button" onClick={() => { setQuery(item.label === "Track my order" ? "track my order" : item.label); setActiveTopic(item.topic); }} className="rounded-full border border-white/20 bg-white/[0.07] px-3 py-2 font-semibold transition hover:bg-white/15 sm:px-3.5">
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="mt-6 sm:mt-7">
                            <h2 className="mb-3 text-base font-bold text-[#07152e] sm:text-lg">Browse by topic</h2>
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
                                {topics.map((topic) => {
                                    const Icon = topic.icon;
                                    const selected = activeTopic === topic.key;
                                    return (
                                        <button key={topic.key} type="button" onClick={() => chooseTopic(topic.key)} aria-pressed={selected} className={`flex min-h-[76px] items-center gap-3 rounded-[18px] border p-3 text-left transition sm:min-h-[84px] sm:gap-4 sm:p-4 ${selected ? "border-[#07152e] bg-[#eef1f6]" : "border-[#e1e6ee] bg-white hover:border-[#07152e]/40"}`}>
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf0f4] text-[#07152e] sm:h-[54px] sm:w-[54px]"><Icon size={20} /></span>
                                            <span className="min-w-0"><span className="block text-sm font-bold text-[#07152e] sm:text-[15px]">{topic.title}</span><span className="mt-0.5 block text-xs text-[#718096]">{topic.subtitle}</span></span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.8fr)] xl:gap-5">
                            <section className="overflow-hidden rounded-[22px] border border-[#e1e6ee] bg-white">
                                <div className="flex items-center gap-3 border-b border-[#e7ebf1] bg-[#f1f3f6] px-5 py-4 sm:px-6 sm:py-5">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#07152e] text-white"><HelpCircle size={21} /></span>
                                    <div><h2 className="text-base font-bold text-[#07152e] sm:text-lg">Frequently asked questions</h2><p className="text-xs text-[#718096]">{visibleFAQs.length} {visibleFAQs.length === 1 ? "answer" : "answers"}</p></div>
                                </div>

                                {visibleFAQs.length === 0 ? (
                                    <div className="px-5 py-12 text-center sm:px-8"><p className="text-sm font-semibold text-[#07152e]">No answers found</p><p className="mt-1 text-xs text-[#718096]">Try another search or browse a different topic.</p><button type="button" onClick={() => { setQuery(""); setActiveTopic("All"); }} className="mt-4 text-xs font-bold text-[#176348] underline underline-offset-4">Clear filters</button></div>
                                ) : visibleFAQs.map((faq) => {
                                    const isOpen = expandedFaq === faq.index;
                                    return (
                                        <article key={faq.question} className="border-b border-[#e7ebf1] last:border-0">
                                            <button type="button" aria-expanded={isOpen} onClick={() => setExpandedFaq(isOpen ? -1 : faq.index)} className="flex min-h-[58px] w-full items-center gap-2 px-4 py-3 text-left sm:gap-3 sm:px-6 sm:py-4">
                                                <span className="hidden shrink-0 rounded-md bg-[#edf0f4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#61728d] sm:inline-flex">{faq.topic}</span>
                                                <span className="min-w-0 flex-1 text-sm font-bold text-[#07152e] sm:text-[15px]">{faq.question}</span>
                                                {isOpen ? <ChevronUp size={18} className="shrink-0 text-[#07152e]" /> : <ChevronDown size={18} className="shrink-0 text-[#07152e]" />}
                                            </button>
                                            {isOpen && <div className="px-4 pb-5 sm:px-6 sm:pb-6"><span className="mb-2 inline-flex rounded-md bg-[#edf0f4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#61728d] sm:hidden">{faq.topic}</span><p className="text-sm leading-6 text-[#526078]">{faq.answer}</p><div className="mt-4 flex flex-wrap items-center gap-2 text-xs"><span className="mr-1 text-[#718096]">Was this helpful?</span>{([true, false] as const).map((vote) => <button key={String(vote)} type="button" aria-pressed={helpful[faq.index] === vote} onClick={() => setHelpful((current) => ({ ...current, [faq.index]: vote }))} className={`rounded-full border px-3.5 py-1.5 font-semibold transition ${helpful[faq.index] === vote ? "border-[#07152e] bg-[#07152e] text-white" : "border-[#dce2ea] text-[#07152e] hover:bg-[#f5f7fa]"}`}>{vote ? "Yes" : "No"}</button>)}</div></div>}
                                        </article>
                                    );
                                })}
                            </section>

                            <div className="space-y-4">
                                <section className="rounded-[22px] border border-[#e1e6ee] bg-white p-5 sm:p-6">
                                    <div className="mb-4 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#07152e] text-white"><Headphones size={20} /></span><div><h2 className="text-base font-bold text-[#07152e]">Talk to us</h2><p className="text-xs text-[#718096]">Mon–Sat, 10 am – 6 pm IST</p></div></div>
                                    <div className="space-y-2.5">
                                        <a href={`https://wa.me/${SUPPORT_PHONE_LINK.slice(1)}`} target="_blank" rel="noreferrer" className="flex min-h-[72px] items-center gap-3 rounded-2xl bg-[#e8f5ef] p-3 transition hover:bg-[#ddf0e7]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#19985d] text-white"><MessageCircle size={19} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#07152e]">Chat on WhatsApp</span><span className="block break-words text-xs text-[#526078]">Usually the fastest way · {SUPPORT_PHONE}</span></span><span className="text-[#07152e]">›</span></a>
                                        <a href={`mailto:${SUPPORT_EMAIL}`} className="flex min-h-[65px] items-center gap-3 rounded-2xl border border-[#e1e6ee] p-3 transition hover:bg-[#f8f9fb]"><Mail size={20} className="ml-1 shrink-0 text-[#07152e]" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#07152e]">Email us</span><span className="block break-all text-xs text-[#718096]">{SUPPORT_EMAIL}</span></span><span>›</span></a>
                                        <a href={`tel:${SUPPORT_PHONE_LINK}`} className="flex min-h-[65px] items-center gap-3 rounded-2xl border border-[#e1e6ee] p-3 transition hover:bg-[#f8f9fb]"><Phone size={19} className="ml-1 shrink-0 text-[#07152e]" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#07152e]">Call us</span><span className="block text-xs text-[#718096]">{SUPPORT_PHONE}</span></span><span>›</span></a>
                                    </div>
                                </section>

                                <section className="rounded-[22px] border border-[#e1e6ee] bg-white p-5 sm:p-6">
                                    <h2 className="text-base font-bold text-[#07152e]">Raise a request</h2>
                                    <p className="mt-1 text-xs leading-5 text-[#718096]">Tell us what went wrong and we&apos;ll get back to you.</p>
                                    <form onSubmit={submitRequest} className="mt-4 space-y-3.5">
                                        <label className="block text-xs font-bold text-[#07152e]">Related order
                                            <select value={selectedOrder} onChange={(event) => setSelectedOrder(event.target.value)} className="mt-2 h-12 w-full min-w-0 rounded-xl border border-[#dce2ea] bg-white px-3 text-sm font-semibold text-[#07152e] outline-none focus:border-[#07152e]">
                                                <option value="">Select an order (optional)</option>
                                                {orders.map((order, index) => <option key={order._id || index} value={order._id || order.orderNumber || ""}>{order.orderNumber || `Order ${index + 1}`} · {order.shipmentCurrentStatus || order.status || "Placed"}{order.createdAt ? ` · ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}</option>)}
                                            </select>
                                        </label>
                                        <label className="block text-xs font-bold text-[#07152e]">What&apos;s the issue?
                                            <select value={issue} onChange={(event) => setIssue(event.target.value)} className="mt-2 h-12 w-full min-w-0 rounded-xl border border-[#dce2ea] bg-white px-3 text-sm font-semibold text-[#07152e] outline-none focus:border-[#07152e]">{issueOptions.map((option) => <option key={option}>{option}</option>)}</select>
                                        </label>
                                        <label className="block text-xs font-bold text-[#07152e]">Details
                                            <textarea required minLength={10} maxLength={2000} rows={4} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Describe the issue" className="mt-2 block min-h-28 w-full resize-y rounded-xl border border-[#dce2ea] px-3.5 py-3 text-sm font-normal text-[#07152e] outline-none placeholder:text-[#718096] focus:border-[#07152e]" />
                                        </label>
                                        <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#d5dce7] px-3 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#f8f9fb]"><Paperclip size={17} />{attachmentName || "Attach photos (optional)"}<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => setAttachmentName(Array.from(event.target.files || []).map((file) => file.name).join(", "))} /></label>
                                        <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07152e] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#12294b]"><Mail size={16} />Prepare request email</button>
                                        {submitMessage && <p role="status" className="flex items-start gap-2 text-xs leading-5 text-[#176348]"><CheckCircle2 size={15} className="mt-0.5 shrink-0" />{submitMessage}</p>}
                                        <p className="text-[11px] leading-4 text-[#8a94a5]">Your email app opens with the details. Attach any selected photos there before sending.</p>
                                    </form>
                                </section>

                                <section className="rounded-[22px] border border-[#e1e6ee] bg-white p-5 sm:p-6">
                                    <h2 className="text-base font-bold text-[#07152e]">My requests</h2>
                                    <div className="mt-3 rounded-2xl border border-dashed border-[#dce2ea] bg-[#fafbfc] px-4 py-5 text-center">
                                        <p className="text-xs leading-5 text-[#718096]">Requests sent by email aren&apos;t listed here yet. Contact our team by email or WhatsApp to follow up.</p>
                                        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs font-semibold"><a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#07152e] underline underline-offset-4">Email support</a><Link href="/user/orders" className="text-[#07152e] underline underline-offset-4">View my orders</Link></div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
