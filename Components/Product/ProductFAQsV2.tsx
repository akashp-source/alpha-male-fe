"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

interface FAQ {
    question: string;
    answer: string;
}

interface ProductFAQsV2Props {
    faqs?: FAQ[];
}

/** "Straight answers": line-separated accordion, all closed by default. */
export default function ProductFAQsV2({ faqs = [] }: ProductFAQsV2Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const idPrefix = useId();

    if (!faqs.length) return null;

    return (
        <section className="pdp-section pdp-last-section w-full bg-white text-brand-navy">
            <div className="pdp-container">
                <div className="mx-auto max-w-3xl">

                    <div className="mb-8 text-center">
                        <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy">
                            Good to know
                        </p>
                        <h2 className="font-heading text-3xl leading-tight text-brand-navy sm:text-4xl">
                            Straight answers
                        </h2>
                    </div>

                    <div className="border-t border-medium-gray">
                        {faqs.map((faq, index) => {
                            const isOpen = openIndex === index;
                            const buttonId = `${idPrefix}-faq-button-${index}`;
                            const panelId = `${idPrefix}-faq-panel-${index}`;

                            return (
                                <div key={index} className="border-b border-olympus">
                                    <h3>
                                        <button
                                            type="button"
                                            id={buttonId}
                                            aria-expanded={isOpen}
                                            aria-controls={panelId}
                                            onClick={() => setOpenIndex(isOpen ? null : index)}
                                            className="flex w-full items-center justify-between gap-4 py-4 text-left font-body text-sm font-semibold text-brand-navy sm:text-base"
                                        >
                                            {faq.question}
                                            {isOpen ? (
                                                <Minus size={16} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
                                            ) : (
                                                <Plus size={16} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
                                            )}
                                        </button>
                                    </h3>

                                    <div
                                        id={panelId}
                                        role="region"
                                        aria-labelledby={buttonId}
                                        inert={!isOpen}
                                        className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="pb-5 font-body text-sm leading-relaxed text-brand-navy-muted">
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
