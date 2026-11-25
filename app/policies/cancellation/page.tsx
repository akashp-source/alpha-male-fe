
import type { Metadata } from "next";

// import FooterPage from "@/Components/Footer"; (replaced by FooterV2 in app/layout.tsx)
// import Footer from "@/Components/Footer"; (replaced by FooterV2 in app/layout.tsx)
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const cancellationStages = [
    {
        stage: "Placed, not yet dispatched",
        canCancel: "Yes, free of charge",
        outcome: "Full refund to your original payment method",
    },
    {
        stage: "Dispatched, in transit",
        canCancel: "No, but you may decline delivery",
        outcome:
            "Prepaid orders are refunded once the parcel returns to us, minus the forward shipping fee if one was charged",
    },
    {
        stage: "Delivered",
        canCancel: "No",
        outcome: "See our Return & Refund Policy",
    },
];

function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="border-b border-[#28344A] py-7 last:border-0">
            <h2 className="mb-4 font-heading text-xl text-olympus">
                {title}
            </h2>
            <div className="space-y-3 text-sm leading-7 text-palladium [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-5 [&_strong]:text-olympus">
                {children}
            </div>
        </section>
    );
}

export const metadata: Metadata = {
    title: "Cancellation Policy",
    description:
        "How to cancel an Alpha Male order before or after dispatch, and how refunds for cancelled orders are processed.",
};

export default function CancellationPolicyPage() {
    return (
        <main className="min-h-screen bg-brand-navy text-olympus">
            <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">

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
                <header className="mb-10 border-b border-[#354158] pb-8">
                    <div className="mb-4 flex justify-center">
                        <Link href="/home" aria-label="Alpha Male home">
                            <Image
                                src="/images/logo.png"
                                alt="Alpha Male - Drive, Stamina, Energy"
                                width={150}
                                height={150}
                                priority
                                className="h-[90px] w-[90px] object-contain"
                            />
                        </Link>
                    </div>

                    <h1 className="font-heading text-4xl sm:text-5xl">
                        Cancellation Policy
                    </h1>

                    <p className="mt-4 text-sm text-[#929BAE]">
                        Effective: 02 November 2026
                    </p>

                    <p className="mt-6 max-w-3xl text-sm leading-7 text-palladium">
                        Plans change, and we keep cancellations simple. You can cancel any
                        Alpha Male order free of charge until it leaves our warehouse.
                    </p>
                </header>

                {/* When You Can Cancel */}
                <Section title="When You Can Cancel">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#354158] text-olympus">
                                    <th className="py-3 pr-4">Order stage</th>
                                    <th className="py-3 pr-4">Can you cancel?</th>
                                    <th className="py-3">What happens</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cancellationStages.map((item) => (
                                    <tr
                                        key={item.stage}
                                        className="border-b border-[#28344A] last:border-0"
                                    >
                                        <td className="py-3 pr-4 align-top text-olympus">
                                            {item.stage}
                                        </td>
                                        <td className="py-3 pr-4 align-top">
                                            {item.canCancel}
                                        </td>
                                        <td className="py-3 align-top">
                                            {item.outcome}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p>
                        You can cancel part of an order. We refund the cancelled items, and
                        the rest of the order ships as planned.
                    </p>
                </Section>

                <Section title="How to Cancel">
                    <ol>
                        <li>
                            Go to <strong>My Orders</strong> in your account and select Cancel,
                            or
                        </li>
                        <li>
                            Email{" "}
                            <a
                                href="mailto:info@alphamale.co.in"
                                className="text-olympus underline underline-offset-4 hover:text-white"
                            >
                                info@alphamale.co.in
                            </a>{" "}
                            with your order ID, registered mobile number and the items you
                            want to cancel.
                        </li>
                    </ol>
                    <p>
                        You will get a confirmation by email or WhatsApp once your
                        cancellation is processed.
                    </p>
                </Section>

                <Section title="Cancellations by Alpha Male">
                    <p>We may cancel an order, in full or in part, in these cases:</p>
                    <ul>
                        <li>A product is out of stock.</li>
                        <li>There is a pricing or listing error.</li>
                        <li>The address is not serviceable.</li>
                        <li>Payment or identity verification fails.</li>
                        <li>
                            A required prescription or consultation is not completed within
                            72 hours of ordering.
                        </li>
                        <li>We suspect fraud or misuse.</li>
                    </ul>
                    <p>If you have already paid, we refund you in full.</p>
                </Section>

                <Section title="Refund Timelines After Cancellation">
                    <ul>
                        <li>
                            <strong>UPI, cards, net banking and wallets:</strong> Refunded to
                            the original payment method within 5–7 business days of the
                            cancellation being confirmed. Your bank may take a little longer
                            to show the credit.
                        </li>
                        <li>
                            <strong>Cash on Delivery:</strong> No payment is collected, so no
                            refund is needed.
                        </li>
                    </ul>
                </Section>

                <Section title="Changing an Order">
                    <p>
                        You can change your delivery address, contact number or items until
                        your order is dispatched. Write to us as early as possible. Once
                        the parcel is with the courier, we can no longer change it.
                    </p>
                </Section>

                <Section title="Contact">
                    <div className="space-y-3">
                        <p>
                            <strong>Email:</strong>{" "}
                            <a
                                href="mailto:info@alphamale.co.in"
                                className="underline underline-offset-4 hover:text-white"
                            >
                                info@alphamale.co.in
                            </a>
                        </p>

                        <p>
                            <strong>Phone / WhatsApp:</strong>{" "}
                            <a
                                href="tel:+919000937222"
                                className="underline underline-offset-4 hover:text-white"
                            >
                                +91 90009 37222
                            </a>
                        </p>

                        <p>
                            <strong>Support hours:</strong> Monday to Saturday, 10:00 AM to
                            6:00 PM IST
                        </p>
                    </div>
                </Section>

                {/* Footer */}
                {/* <footer className="mt-12 border-t border-[#354158] pt-8 text-center">
                    <p className="font-serif text-sm uppercase tracking-[0.35em] text-olympus">
                        ALPHA MALE
                    </p>

                    <p className="mt-2 text-xs text-[#929BAE]">
                        alphamale.co.in · info@alphamale.co.in
                    </p>

                    <Link
                        href="/"
                        className="mt-5 inline-block text-xs text-[#929BAE] underline underline-offset-4 transition hover:text-white"
                    >
                        ← Back to Home
                    </Link>
                </footer> */}

            </div>
            {/* <FooterPage /> replaced by FooterV2 in app/layout.tsx */}
        </main>
    );
}
