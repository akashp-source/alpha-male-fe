
"use client";

import { useId, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { ONLINE_PAYMENT_DISCOUNT_PERCENT } from "@/lib/offers";
import { WHATSAPP_LINK } from "@/lib/contact";

const faqs = [
    {
        question: "Is delivery discreet?",
        answer:
            "Yes. Every order ships sealed, and the outside of the parcel never shows what's inside.",
    },
    {
        question: "Why will your team call me after I order?",
        answer:
            "Every order is confirmed by phone before dispatch. Our team also runs a short consultation - age, health and current medicines - so every product reaches you safely.",
    },
    {
        question: "Is Cash on Delivery available?",
        answer:
            "Yes. You can pay online or choose Cash on Delivery at checkout.",
    },
    {
        question: "Is my information private?",
        answer:
            "Completely. Your details are used only to process your order and are never sold or shared.",
    },
    {
        question: "How do I get extra savings?",
        answer: (
            <>
                Pay online with Razorpay at checkout and get an extra {ONLINE_PAYMENT_DISCOUNT_PERCENT}% off your order.
            </>
        ),
    },
    {
        question: "How can I contact your team?",
        answer: (
            <>
                Message us on{" "}
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    WhatsApp
                </a>{" "}
                or email info@alphamale.co.in for product information, order help and general questions.
            </>
        ),
    },
];

export default function FAQ() {
    const [openItems, setOpenItems] = useState<number[]>([]);
    const idPrefix = useId();

    const toggleFAQ = (index: number) => {
        setOpenItems((prev) =>
            prev.includes(index)
                ? prev.filter((item) => item !== index)
                : [...prev, index]
        );
    };

    return (
        <section className="relative w-full overflow-hidden     px-5 py-20 text-[#D5D5D7] sm:px-10 sm:py-24">

            {/* Decorative Side Borders */}
            <div className="pointer-events-none absolute inset-y-0 left-4 border-l hidden sm:block border-[#D5D5D7]/[0.07] sm:left-6" />
            <div className="pointer-events-none absolute inset-y-0 right-4 border-r border-[#D5D5D7]/[0.07] sm:right-6" />

            <div className="relative mx-auto max-w-[730px]">

                {/* Heading */}
                <div className="mb-10 text-center sm:mb-12">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[#929BAE]">
                        GOOD TO KNOW
                    </p>

                    <h2 className="silver-text font-heading text-[clamp(32px,5vw,42px)] font-medium uppercase leading-tight tracking-[0.04em]">
                        Your Questions
                    </h2>
                </div>

                {/* FAQ Accordion: same card style as the product-page FAQ */}
                <div className="space-y-3">

                    {faqs.map((faq, index) => {
                        const isOpen = openItems.includes(index);
                        const buttonId = `${idPrefix}-faq-button-${index}`;
                        const panelId = `${idPrefix}-faq-panel-${index}`;

                        return (
                            <div
                                key={faq.question}
                                className={`overflow-hidden rounded-xl border bg-white transition-all duration-300 ${isOpen
                                    ? "border-[#07162f]/40 shadow-sm"
                                    : "border-[#e8e1d8]"
                                    }`}
                            >

                                {/* Question */}
                                <button
                                    type="button"
                                    id={buttonId}
                                    onClick={() => toggleFAQ(index)}
                                    aria-expanded={isOpen}
                                    aria-controls={panelId}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-7"
                                >
                                    <span className="font-body text-sm font-semibold text-[#211b17] md:text-base">
                                        {faq.question}
                                    </span>

                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f2ed] text-[#07162f]">
                                        {isOpen ? (
                                            <Minus size={16} />
                                        ) : (
                                            <Plus size={16} />
                                        )}
                                    </span>
                                </button>

                                {/* Answer */}
                                <div
                                    id={panelId}
                                    role="region"
                                    aria-labelledby={buttonId}
                                    inert={!isOpen}
                                    className={`grid transition-all duration-300 ${isOpen
                                        ? "grid-rows-[1fr]"
                                        : "grid-rows-[0fr]"
                                        }`}
                                >
                                    <div className="overflow-hidden">
                                        <p className="px-5 pb-6 font-body text-sm leading-7 text-[#4a423b] md:px-7 md:text-base">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>
        </section>
    );
}
