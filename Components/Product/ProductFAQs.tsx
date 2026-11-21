
"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQ {
    question: string;
    answer: string;
}

interface ProductFAQsProps {
    faqs?: FAQ[];
    productName?: string;
}

export default function ProductFAQs({
    faqs = [],
    productName = "this product",
}: ProductFAQsProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!faqs.length) return null;

    return (
        <section className="pdp-section pdp-last-section w-full bg-[#faf7f2]">
            <div className="pdp-container">
            <div className="mx-auto max-w-4xl">

                <div className="mb-10 text-center">
                    <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.3em] text-[#07162f]">
                        Need to know?
                    </p>

                    <h2 className="font-heading text-3xl font-semibold text-[#211b17] md:text-5xl">
                        Frequently Asked Questions
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-7 text-[#91857b] md:text-base">
                        Everything you need to know about {productName}.
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div
                                key={index}
                                className={`overflow-hidden rounded-xl border transition-all duration-300 ${isOpen
                                    ? "border-[#07162f]/40 bg-white shadow-sm"
                                    : "border-[#e8e1d8] bg-white"
                                    }`}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenIndex(isOpen ? null : index)
                                    }
                                    aria-expanded={isOpen}
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

                                <div
                                    className={`grid transition-all duration-300 ${isOpen
                                        ? "grid-rows-[1fr]"
                                        : "grid-rows-[0fr]"
                                        }`}
                                >
                                    <div className="overflow-hidden">
                                        <p className="px-5 pb-6 font-body text-sm leading-7 text-[#746c65] md:px-7 md:text-base">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
            </div>
        </section>
    );
}
