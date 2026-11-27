import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FlaskConical, HeartHandshake, PackageCheck, ShieldCheck } from "lucide-react";

import Navbar from "@/Components/Home/NavBar";
import OurStandard from "@/Components/OurStandard";

export const metadata: Metadata = {
    title: "About Us",
    description:
        "Alpha Male is a premium men's wellness brand for performance, intimacy care and daily wellness: science-backed products, held to a higher standard and delivered discreetly.",
};

/** The range: every part of a man's wellness, not just one product. */
const range = [
    {
        image: "https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/df190abd-2618-4bb2-a073-b2a0481dd94f.webp",
        label: "Performance",
        title: "Oral strips",
        text: "Alpha Bold, Alpha Boss, Alpha Legend and Alpha Icon: discreet dissolving strips for lasting confidence, when it matters most. No water needed.",
    },
    {
        image: "https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/f161cfa2-02a2-4e04-bb45-672256e549ed.webp",
        label: "Intimacy care",
        title: "More than intimacy",
        text: "Bare ultra-thin condoms and science-backed lubricants, made for comfort and confidence.",
    },
    {
        image: "https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/a2723487-6f9f-45fb-b762-5598d9065b62.webp",
        label: "Daily wellness",
        title: "Everyday energy",
        text: "Shilajit and caffeine: everyday support for energy and focus.",
    },
];

const principles = [
    {
        icon: FlaskConical,
        title: "Science-backed",
        text: "Formulas built on proven ingredients, with clear directions and honest claims.",
    },
    {
        icon: PackageCheck,
        title: "Discreet, always",
        text: "Plain, sealed parcels. The label carries only your name, address and phone number.",
    },
    {
        icon: ShieldCheck,
        title: "A higher standard",
        text: "Made in India, with every batch tested before it is released.",
    },
    {
        icon: HeartHandshake,
        title: "Respect, not judgement",
        text: "Real people answer your questions privately. No awkward conversations.",
    },
];

/* Old strip-only principles:
const principles = [
    {
        icon: Leaf,
        title: "Dissolves in seconds",
        text: "Place a strip on your tongue. No water, no swallowing tablets.",
    },
    {
        icon: PackageCheck,
        title: "Wallet-thin, discreet",
        text: "Slim sealed pouches that slip into a wallet or pocket, and plain packaging on every delivery.",
    },
    {
        icon: ShieldCheck,
        title: "Precisely made",
        text: "Every strip is produced in our own licensed facility that follows WHO Good Manufacturing Practice.",
    },
    {
        icon: HeartHandshake,
        title: "Personally guided",
        text: "A short, private consultation with every order, so the right product reaches the right man.",
    },
];
*/

// Public page.
export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main className="w-full bg-white text-brand-navy">
                {/* Hero */}
                <section className="relative overflow-hidden bg-brand-navy px-5 py-16 text-center text-white sm:py-24">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[32px] border-white/[0.04]" />
                    <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-white/[0.07]" />
                    <div className="relative mx-auto max-w-3xl">
                        <Image
                            src="/images/logo-cropped.png"
                            alt="Alpha Male"
                            width={120}
                            height={120}
                            priority
                            className="mx-auto mb-6 h-20 w-auto object-contain sm:h-24"
                        />
                        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-palladium">
                            About Alpha Male
                        </p>
                        <h1 className="mt-4 font-heading text-[clamp(30px,5vw,52px)] font-semibold uppercase leading-[1.15] tracking-[0.04em] text-olympus">
                            Strength isn&apos;t loud.
                            <br />
                            It&apos;s certain.
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl font-body text-sm leading-7 text-palladium sm:text-base sm:leading-8">
                            Men&apos;s wellness in India has been whispered about, sold in shady corners and
                            wrapped in embarrassment. We&apos;re changing that, with formulas you can trust, a
                            format you&apos;ll actually use, and an experience built on respect.
                        </p>
                    </div>
                </section>

                {/* Story */}
                <section className="pdp-section">
                    <div className="mx-auto grid max-w-[1100px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16">
                        <div>
                            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy-muted">
                                Our story
                            </p>
                            <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">
                                Wellness for the whole man, made with respect
                            </h2>
                            <div className="mt-5 space-y-4 font-body text-sm leading-7 text-brand-navy-muted sm:text-base sm:leading-8">
                                {/* Old strip-only story:
                                Alpha Male is a men&apos;s wellness brand from Hyderabad. We make fast-dissolving,
                                mint-flavoured oral strips: each one individually sealed, in a pack small enough
                                to carry anywhere. Discretion is part of the product. Orders ship in plain packaging,
                                and our team speaks to every customer privately before dispatch. */}
                                <p>
                                    Alpha Male is India&apos;s premium, science-backed men&apos;s wellness brand. We
                                    look after every side of a man&apos;s wellbeing: performance when it matters,
                                    intimacy care for the moments you share, and daily wellness for the energy and
                                    focus you need every day.
                                </p>
                                <p>
                                    Whatever you choose, the experience is the same: products you can trust, plain
                                    and discreet delivery, and a team you can talk to privately, without judgement.
                                </p>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href="/shop"
                                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-navy px-7 font-body text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#14284d]"
                                >
                                    Shop products
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-navy px-7 font-body text-sm font-semibold uppercase tracking-[0.12em] text-brand-navy transition hover:bg-pale-gray"
                                >
                                    Contact us
                                </Link>
                            </div>
                        </div>

                        {/* Strip-only image, replaced by the three pillars:
                        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[28px] bg-pale-gray p-8 sm:p-10">
                            <Image src="/images/strip.png" alt="Alpha Male oral strip" width={600} height={600}
                                className="mx-auto h-auto w-full max-w-[340px] object-contain" />
                        </div> */}
                        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[28px] bg-brand-navy p-6 text-white sm:p-8">
                            <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full border-[24px] border-white/[0.04]" />
                            <ol className="relative space-y-3">
                                {range.map((item, index) => (
                                    <li key={item.label} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                        <span aria-hidden="true" className="font-heading text-2xl text-palladium/60">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span>
                                            <span className="block font-heading text-lg text-olympus">{item.label}</span>
                                            <span className="block font-body text-xs text-palladium">{item.title}</span>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </section>

                {/* Range */}
                <section className="bg-white pb-14 sm:pb-20">
                    <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy-muted">
                                The range
                            </p>
                            <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">
                                Three pillars of men&apos;s wellness
                            </h2>
                        </div>
                        <ul className="mt-10 grid gap-5 md:grid-cols-3">
                            {range.map((item) => (
                                <li key={item.label} className="flex flex-col overflow-hidden rounded-2xl border border-[#e1e6ee] bg-white">
                                    <div className="relative aspect-[4/3] bg-pale-gray">
                                        <Image src={item.image} alt={item.label} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy-muted">{item.label}</p>
                                        <h3 className="mt-2 font-heading text-xl">{item.title}</h3>
                                        <p className="mt-2 font-body text-sm leading-6 text-brand-navy-muted">{item.text}</p>
                                        <Link href="/shop" className="mt-auto pt-5 font-body text-xs font-bold uppercase tracking-[0.14em] text-brand-navy underline-offset-4 hover:underline">
                                            Shop now ›
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Principles */}
                <section className="bg-pale-gray py-14 sm:py-20">
                    <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy-muted">
                                What we stand for
                            </p>
                            <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">
                                What every Alpha Male product promises
                            </h2>
                        </div>
                        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {principles.map(({ icon: Icon, title, text }, index) => (
                                <li key={title} className="rounded-2xl border border-[#e1e6ee] bg-white p-6">
                                    <div className="flex items-center justify-between">
                                        <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-white">
                                            <Icon size={20} />
                                        </span>
                                        <span aria-hidden="true" className="font-heading text-2xl text-[#c5cbd6]">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 font-heading text-lg leading-snug">{title}</h3>
                                    <p className="mt-2 font-body text-sm leading-6 text-brand-navy-muted">{text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* "Our standard" badges (same as the homepage) */}
                <OurStandard marquee />

                {/* Closing block: commented out, the footer's "Questions are normal" bar
                    right below already offers WhatsApp / call / email.
                <section className="bg-brand-navy px-5 py-14 text-center text-white sm:py-16">
                    <h2 className="font-heading text-2xl text-olympus sm:text-3xl">Questions? Talk to us privately.</h2>
                    <p className="mx-auto mt-3 max-w-xl font-body text-sm leading-7 text-palladium">
                        Our team is here Monday to Saturday, 10 am to 6 pm IST, on WhatsApp, phone or email.
                    </p>
                    <Link
                        href="/contact"
                        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 font-body text-sm font-semibold uppercase tracking-[0.12em] text-brand-navy transition hover:bg-olympus"
                    >
                        Get in touch
                    </Link>
                </section>
                */}
            </main>
        </>
    );
}
