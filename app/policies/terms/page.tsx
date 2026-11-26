
import type { Metadata } from "next";

// import FooterPage from "@/Components/Footer"; (replaced by FooterV2 in app/layout.tsx)
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="border-b border-white/[0.08] py-7 last:border-0">
            <h2 className="mb-4 font-heading text-lg tracking-wide text-olympus sm:text-xl">
                {title}
            </h2>
            <div className="space-y-3 text-sm leading-7 text-palladium">
                {children}
            </div>
        </section>
    );
}

function PolicyTable({
    headers,
    rows,
}: {
    headers: string[];
    rows: string[][];
}) {
    return (
        <div className="my-5 overflow-x-auto font-body">
            <table className="w-full min-w-[500px] border-collapse text-left text-xs sm:text-sm">
                <thead>
                    <tr className="border-b border-white/20 text-olympus">
                        {headers.map((header) => (
                            <th key={header} className="px-4 py-3 font-medium">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr
                            key={index}
                            className="border-b border-white/[0.07] text-palladium"
                        >
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-3 align-top leading-6">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ContactLink({
    children,
    href,
}: {
    children: ReactNode;
    href: string;
}) {
    return (
        <a
            href={href}
            className="text-olympus underline decoration-white/30 underline-offset-4 transition hover:text-white"
        >
            {children}
        </a>
    );
}

export const metadata: Metadata = {
    title: "Terms & Conditions",
    description:
        "The terms and conditions that apply when you browse the Alpha Male website and buy our products.",
};

export default function TermsAndConditionsPage() {
    return (
        <main className="min-h-screen bg-brand-navy px-5 py-16 text-olympus sm:px-8 sm:py-24">
            <div className="mx-auto max-w-4xl">
                {/* Back to Home */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 rounded-full border border-[#354158] px-5 py-2.5 text-sm text-palladium transition-all duration-300 hover:border-olympus hover:bg-[#19243B] hover:text-white"
                    >
                        <span className="transition-transform duration-300 group-hover:-translate-x-1">
                            ←
                        </span>
                        <span>Back to Home</span>
                    </Link>
                </div>
                {/* Header */}
                <header className="mb-12 text-center sm:mb-16">
                    <div className="mb-4 flex justify-center">
                        <Link href="/home" aria-label="Alpha Male home">
                            <Image
                                src="https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/7dea7f70-17ce-4059-ae58-1e7da21d2220.webp"
                                alt="Alpha Male - Drive, Stamina, Energy"
                                width={150}
                                height={150}
                                priority
                                className="h-[90px] w-[90px] object-contain"
                            />
                        </Link>
                    </div>

                    <h1 className="font-heading text-3xl uppercase tracking-[0.12em] text-olympus sm:text-5xl">
                        Terms & Conditions
                    </h1>

                    <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-[#929BAE] font-body">
                        Effective: 02 November 2026
                    </p>

                    <div className="mx-auto mt-7 h-px w-16 bg-gradient-to-r from-transparent via-palladium to-transparent" />
                </header>

                {/* Introduction */}
                <div className="mb-8 text-sm leading-7 text-palladium font-body">
                    These Terms & Conditions apply each time you visit alphamale.co.in,
                    create an Alpha Male account or place an order with us. Please read
                    them carefully. Using our website means you accept them, together
                    with our Privacy, Shipping, Cancellation and Return & Refund policies.
                </div>

                {/* At a Glance */}
                <section className="mb-8 border border-white/10 bg-white/[0.025] p-5 sm:p-7 font-body">
                    <h2 className="mb-4  text-xl text-olympus font-heading">
                        At a Glance
                    </h2>

                    <PolicyTable
                        headers={["Topic", "The short version"]}
                        rows={[
                            ["Who can buy", "Adults aged 18 and above, ordering for personal use"],
                            ["Payment", "UPI, cards, net banking, wallets, and Cash on Delivery where available"],
                            ["Dispatch", "Within 24-48 hours, in discreet sealed packaging"],
                            ["Returns", "Sealed, unopened products within 7 days; damaged or wrong items reported within 48 hours"],
                            ["Subscriptions", "Cancel anytime; refund rules are set out in Section 6"],
                            ["Disputes", "Indian law; courts at Hyderabad, Telangana"],
                        ]}
                    />

                    <p className="text-xs leading-6 text-[#929BAE]">
                        This summary is for convenience only. The full Terms below are what apply.
                    </p>
                </section>

                <div className="divide-y divide-white/[0.08]">

                    <Section title="1. About These Terms">
                        <p>
                            Alpha Male (“Alpha Male”, “we”, “us”, “our”) is India’s first
                            premium men’s wellness brand, operated from Hyderabad, India.
                            These Terms form a binding agreement between you and Alpha Male.
                            If you do not agree with them, please do not use the website or
                            buy from us.
                        </p>
                    </Section>

                    <Section title="2. Your Account">
                        <ul className="list-disc space-y-2 pl-5">
                            <li>You must be at least 18 years old to use our website or buy from us.</li>
                            <li>
                                The details you give us, including your name, mobile number,
                                email and address, must be accurate and kept up to date.
                            </li>
                            <li>
                                You are responsible for keeping your login and one-time
                                passwords private, and for all activity on your account.
                            </li>
                            <li>
                                We may suspend or close an account that is used fraudulently
                                or in breach of these Terms.
                            </li>
                        </ul>
                    </Section>

                    <Section title="3. Our Products">
                        <p>
                            Every Alpha Male product is developed to support men’s wellness
                            and performance. Please use our products responsibly:
                        </p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                Read the label, directions and cautions before use, and never
                                exceed the stated dose.
                            </li>
                            <li>
                                Our products are not intended to diagnose, treat or cure any
                                disease. They do not replace advice from your doctor.
                            </li>
                            <li>
                                If you have a medical condition or take regular medication,
                                please consult a qualified doctor before use.
                            </li>
                            <li>
                                Where a product needs a valid prescription, we will ask for it
                                before dispatch.
                            </li>
                        </ul>
                        <p>
                            Product photos are for representation. Packaging may change
                            between batches. If we find an error in a description, image or
                            price, we will correct it and let you know if it affects your order.
                        </p>
                    </Section>

                    <Section title="4. Placing an Order">
                        <p>
                            When you place an order, you are making an offer to buy. We will
                            send you an acknowledgement by email, SMS or WhatsApp. Your order
                            is accepted only when it is dispatched.
                        </p>
                        <p>
                            Before dispatch, we may decline or cancel an order for any of
                            these reasons: a product is unavailable, there is a pricing
                            error, a verification fails, or we suspect misuse. If you have
                            already paid, we will refund you in full.
                        </p>
                    </Section>

                    <Section title="5. Prices & Payment">
                        <ul className="list-disc space-y-2 pl-5">
                            <li>Prices are shown in Indian Rupees (INR) and include applicable taxes.</li>
                            <li>
                                Prices and offers may change at any time. The price shown at
                                checkout is the price you pay.
                            </li>
                            <li>
                                Online payments are processed by secure, RBI-compliant payment
                                partners. Alpha Male never stores your card details.
                            </li>
                            <li>
                                For Cash on Delivery orders, please pay the full amount to the
                                courier when your parcel arrives. We may withdraw Cash on
                                Delivery for an account after repeated refused deliveries.
                            </li>
                            <li>
                                Coupons and offers apply only on their stated terms. They
                                cannot be exchanged for cash, and only one can be used per
                                order unless stated otherwise.
                            </li>
                        </ul>
                    </Section>

                    <Section title="6. Subscriptions">
                        <p>
                            <strong className="text-olympus">Managing your plan.</strong>{" "}
                            You can pause or cancel an Alpha Male subscription at any time
                            from your account, or by writing to info@alphamale.co.in. Once
                            your request is processed, no further recurring payments will
                            be taken.
                        </p>
                        <p>
                            A payment that was already initiated before your request may
                            still be completed. Any such payment is covered by the table below.
                        </p>

                        <PolicyTable
                            headers={["If this happens…", "…this is what we do"]}
                            rows={[
                                [
                                    "Payment debited, but that cycle’s order has not been delivered",
                                    "We cancel the subscription and, once we have verified your request, refund the full debited amount to your original payment method.",
                                ],
                                [
                                    "Payment debited, and that cycle’s order has been delivered",
                                    "We cancel the subscription. If you return the product unopened and sealed under our Return & Refund Policy, we refund the debited amount once the return is received.",
                                ],
                            ]}
                        />
                    </Section>

                    <Section title="7. Delivery">
                        <p>
                            We deliver across India. Orders are dispatched within 24-48 hours
                            and usually arrive within 2-6 business days (up to 10 in remote
                            areas), in plain, sealed packaging that does not reveal what is
                            inside.
                        </p>
                        <p>
                            You will receive a tracking link once your order is on its way.
                            Our Shipping & Delivery Policy has the full details.
                        </p>
                    </Section>

                    <Section title="8. Cancellations, Returns & Refunds">
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                <strong className="text-olympus">Cancellation:</strong>{" "}
                                Free of charge at any time before your order is dispatched.
                            </li>
                            <li>
                                <strong className="text-olympus">Returns:</strong>{" "}
                                To protect your health and hygiene, only sealed, unopened
                                products are accepted, within 7 days of delivery. Opened
                                products cannot be returned.
                            </li>
                            <li>
                                <strong className="text-olympus">Damaged, wrong or expired items:</strong>{" "}
                                Report them to us within 48 hours of delivery, with photos and
                                an unboxing video. We will replace the item or refund you in full.
                            </li>
                            <li>
                                <strong className="text-olympus">Refunds:</strong>{" "}
                                Credited to your original payment method within 5-7 business
                                days of approval.
                            </li>
                        </ul>
                        <p>
                            Our Cancellation Policy and Return & Refund Policy explain each
                            step in detail.
                        </p>
                    </Section>

                    <Section title="9. Reviews & Content You Share">
                        <p>
                            We welcome honest reviews. When you post a review, photo or
                            comment, you allow Alpha Male to display and reuse it, free of
                            charge, to promote our brand.
                        </p>
                        <p>
                            Please do not post anything unlawful, misleading or offensive,
                            or anything that reveals someone else’s private details. We may
                            remove any content that breaks these rules.
                        </p>
                    </Section>

                    <Section title="10. Fair Use of Our Website">
                        <p>When using our website, you must not:</p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>Use it for any unlawful, fraudulent or harmful purpose.</li>
                            <li>Try to gain unauthorised access, or upload malicious code.</li>
                            <li>Copy or scrape its content, or use bots.</li>
                            <li>Resell Alpha Male products without our written approval.</li>
                        </ul>
                    </Section>

                    <Section title="11. Our Brand">
                        <p>
                            The Alpha Male name and lion emblem, product names, packaging
                            designs, photography, text and website design are owned by Alpha
                            Male. They are protected under Indian and international
                            intellectual property law. Please do not use, copy or adapt any
                            of them without our written consent.
                        </p>
                    </Section>

                    <Section title="12. Our Responsibility to You">
                        <p>
                            We stand behind the quality of our products. However, to the
                            extent the law allows:
                        </p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                Results from wellness products vary from person to person,
                                and we do not promise any specific outcome.
                            </li>
                            <li>
                                We are not responsible for indirect or consequential loss, or
                                for loss caused by misuse or by ignoring label directions.
                            </li>
                            <li>
                                Our total liability for any claim is limited to the value of
                                the order it relates to.
                            </li>
                        </ul>
                        <p>
                            Nothing in these Terms takes away your rights under the Consumer
                            Protection Act, 2019.
                        </p>
                    </Section>

                    <Section title="13. Indemnity">
                        <p>
                            If you breach these Terms or misuse our website, you agree to
                            cover any resulting claims, losses or costs that Alpha Male faces.
                        </p>
                    </Section>

                    <Section title="14. Events Beyond Our Control">
                        <p>
                            We are not liable for delays or failures caused by events outside
                            our reasonable control. These include natural disasters,
                            epidemics, strikes, government restrictions, and courier or
                            network outages.
                        </p>
                    </Section>

                    <Section title="15. Resolving Concerns">
                        <p>
                            If something is not right, please write to info@alphamale.co.in
                            first. Most issues are resolved quickly this way.
                        </p>
                        <p>
                            These Terms are governed by the laws of India. Any dispute that
                            cannot be settled between us falls under the exclusive
                            jurisdiction of the courts at Hyderabad, Telangana.
                        </p>
                    </Section>

                    <Section title="16. Updates to These Terms">
                        <p>
                            We may revise these Terms as our products, services or the law
                            change. The latest version will always be on this page with its
                            effective date. If you continue to use our website after an
                            update, you accept the revised Terms.
                        </p>
                    </Section>

                    <Section title="17. Reach Us">
                        <p>
                            If you have any questions about these Terms, contact us:
                        </p>
                        <ul className="space-y-3">
                            <li>
                                <span className="text-olympus">Email: </span>
                                <ContactLink href="mailto:info@alphamale.co.in">
                                    info@alphamale.co.in
                                </ContactLink>
                            </li>
                            <li>
                                <span className="text-olympus">Phone: </span>
                                <ContactLink href="tel:+919000937222">
                                    +91 90009 37222
                                </ContactLink>
                            </li>
                            <li>
                                <span className="text-olympus">WhatsApp: </span>
                                <ContactLink href="https://wa.me/919000937222">
                                    +91 90009 37222
                                </ContactLink>
                            </li>
                            <li>
                                <span className="text-olympus">Address: </span>
                                Hyderabad, Telangana, India
                            </li>
                            <li>
                                <span className="text-olympus">Support hours: </span>
                                Monday to Saturday, 10:00 AM to 6:00 PM IST
                            </li>
                        </ul>
                    </Section>

                </div>

                {/* Footer */}
                {/* <FooterPage /> replaced by FooterV2 in app/layout.tsx */}

            </div>
        </main>
    );
}
