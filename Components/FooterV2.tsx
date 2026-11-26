import Image from "next/image";
import Link from "next/link";
import { Banknote, CreditCard, Landmark, MessageCircle, Phone, Smartphone } from "lucide-react";

import { WHATSAPP_LINK } from "@/lib/contact";

const SUPPORT_EMAIL = "info@alphamale.co.in";
// Same support number as the Help page and IT policy.
const SUPPORT_PHONE = "+91 90009 37222";
const SUPPORT_PHONE_LINK = "+919000937222";
const SUPPORT_HOURS = "10 am - 6 pm, Mon - Sat";

const SHOP_LINKS = [
    { label: "Alpha Bold (S - 25 mg)", href: "/products/alpha-male-bold-s-25mg" },
    { label: "Alpha Boss (S - 50 mg)", href: "/products/alpha-male-boss-s-50mg" },
    { label: "All products", href: "/shop" },
];

const POLICY_LINKS = [
    { label: "Privacy", href: "/policies/privacy" },
    { label: "Shipping", href: "/policies/shipping" },
    { label: "Returns & refunds", href: "/policies/returns" },
    { label: "Cancellation", href: "/policies/cancellation" },
    { label: "Terms", href: "/policies/terms" },
    { label: "IT policy", href: "/policies/it-policy" },
];

// const PAYMENT_METHODS = ["UPI", "Cards", "Net banking", "COD"];
const PAYMENT_METHODS = [
    { label: "UPI", Icon: Smartphone },
    { label: "Cards", Icon: CreditCard },
    { label: "Net banking", Icon: Landmark },
    { label: "COD", Icon: Banknote },
];

const columnLabel = "mb-4 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-palladium";
const linkClass = "font-body text-sm text-olympus transition hover:text-white";

/** Site footer: contact band on top, link columns and legal line below. */
export default function FooterV2() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full text-olympus">

            {/* Contact band */}
            <div className="border-b border-white/10 bg-brand-navy">
                <div className="pdp-container flex flex-col gap-6 py-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-heading text-3xl leading-tight text-white sm:text-4xl">
                            Questions are normal.
                        </h2>
                        <p className="mt-3 font-body text-sm text-olympus sm:text-base">
                            Talk to our team privately · {SUPPORT_HOURS}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
                        <a
                            href={WHATSAPP_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 font-body text-xs font-semibold uppercase tracking-[0.16em] text-brand-navy transition hover:bg-olympus"
                        >
                            <MessageCircle size={16} aria-hidden="true" />
                            WhatsApp us
                        </a>
                        {/* Call: "Call us" button on phones/tablets, the number itself on desktop */}
                        <a
                            href={`tel:${SUPPORT_PHONE_LINK}`}
                            aria-label={`Call us on ${SUPPORT_PHONE}`}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/40 px-6 font-body text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-brand-navy"
                        >
                            <Phone size={16} aria-hidden="true" />
                            <span className="lg:hidden">Call us</span>
                            <span className="hidden tracking-[0.08em] lg:inline">{SUPPORT_PHONE}</span>
                        </a>
                        <a
                            href={`mailto:${SUPPORT_EMAIL}`}
                            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/40 px-6 font-body text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-brand-navy"
                        >
                            {SUPPORT_EMAIL}
                        </a>
                    </div>
                </div>
            </div>

            {/* Link columns (sits on the dark page background) */}
            <div className="pdp-container py-12">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        {/* <p className="font-heading text-lg font-semibold uppercase tracking-[0.18em] text-white">
                            Alpha Male
                        </p> */}
                        <Link href="/home" aria-label="Alpha Male home" className="inline-block">
                            <Image
                                src="/images/logo-cropped.png"
                                alt="Alpha Male"
                                width={120}
                                height={120}
                                sizes="120px"
                                className="h-24 w-24 object-contain sm:h-28 sm:w-28"
                            />
                        </Link>
                        <p className="mt-4 max-w-[260px] font-body text-sm leading-relaxed text-olympus">
                            India&apos;s premium, science-backed men&apos;s wellness brand.
                        </p>
                    </div>

                    <nav aria-label="Shop">
                        <p className={columnLabel}>Shop</p>
                        <ul className="space-y-2.5">
                            {SHOP_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className={linkClass}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-label="Policies">
                        <p className={columnLabel}>Policies</p>
                        <ul className="space-y-2.5">
                            {POLICY_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className={linkClass}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div>
                        <p className={columnLabel}>Grievance officer</p>
                        <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
                            {SUPPORT_EMAIL}
                        </a>
                        <p className="mt-1">
                            <Link href="/policies/it-policy" className="font-body text-xs text-palladium underline underline-offset-4 transition hover:text-white">
                                Full details
                            </Link>
                        </p>

                        <p className={`${columnLabel} mt-7`}>We accept</p>
                        <ul className="flex flex-wrap gap-2">
                            {PAYMENT_METHODS.map(({ label, Icon }) => (
                                <li
                                    key={label}
                                    className="flex items-center gap-1.5 rounded-md border border-white/20 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.08em] text-olympus"
                                >
                                    <Icon size={13} aria-hidden="true" className="shrink-0 text-palladium" />
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Legal line */}
                <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 font-body text-xs text-palladium sm:flex-row sm:items-center sm:justify-between">
                    <p>© {year} Alpha Male. All rights reserved.</p>
                    <p>For adults 18+ only.</p>
                </div>
            </div>

        </footer>
    );
}
