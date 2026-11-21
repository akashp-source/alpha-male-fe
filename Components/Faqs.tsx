
"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ONLINE_PAYMENT_DISCOUNT_PERCENT } from "@/lib/offers";
import { WHATSAPP_LINK } from "@/lib/contact";

const faqs = [
    {
        question: "IS DELIVERY DISCREET?",
        answer:
            "Yes. Every order ships sealed, and the outside of the parcel never shows what's inside.",
    },
    {
        question: "WHY WILL YOUR TEAM CALL ME AFTER I ORDER?",
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
        question: "HOW CAN I CONTACT YOUR TEAM?",
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
                    <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.4em] text-[#929BAE]">
                        GOOD TO KNOW
                    </p>

                    <h2 className="silver-text font-heading text-[clamp(32px,5vw,42px)] font-medium uppercase leading-tight tracking-[0.04em]">
                        Your Questions
                    </h2>
                </div>

                {/* FAQ Accordion */}
                <div className="border-t border-[#D5D5D7]/[0.10]">

                    {faqs.map((faq, index) => {
                        const isOpen = openItems.includes(index);

                        return (
                            <div
                                key={faq.question}
                                className="border-b border-[#D5D5D7]/[0.10]"
                            >

                                {/* Question */}
                                <button
                                    type="button"
                                    onClick={() => toggleFAQ(index)}
                                    aria-expanded={isOpen}
                                    className="flex w-full items-center justify-between gap-5 py-6 text-left transition-colors hover:text-white sm:py-7"
                                >
                                    <span className="font-heading text-[13px] font-semibold uppercase leading-[1.6] tracking-[0.035em] text-[#E0E0E2] sm:text-[14px]">
                                        {faq.question}
                                    </span>

                                    {isOpen ? (
                                        <X
                                            size={15}
                                            strokeWidth={1.5}
                                            className="shrink-0 text-[#AEB5C3]"
                                        />
                                    ) : (
                                        <Plus
                                            size={15}
                                            strokeWidth={1.5}
                                            className="shrink-0 text-[#AEB5C3]"
                                        />
                                    )}
                                </button>

                                {/* Answer */}
                                <div
                                    className={`grid transition-all duration-300 ease-in-out ${isOpen
                                        ? "grid-rows-[1fr] opacity-100"
                                        : "grid-rows-[0fr] opacity-0"
                                        }`}
                                >
                                    <div className="overflow-hidden">
                                        <p className="max-w-[620px] pb-6 pr-6 text-[12px] font-body leading-[1.9] text-[#AEB5C3] sm:text-[13px]">
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
