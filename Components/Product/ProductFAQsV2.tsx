"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

interface FAQ {
    question: string;
    answer: string;
    // Tab name, e.g. "General", "Product", "Usage" (blank/missing = General).
    category?: string;
}

const DEFAULT_CATEGORY = "General";
const categoryOf = (faq: FAQ) => faq.category?.trim() || DEFAULT_CATEGORY;
// "General" reads as "General FAQs" on its tab, like the design.
const tabLabel = (category: string) => (category === DEFAULT_CATEGORY ? "General FAQs" : category);

interface ProductFAQsV2Props {
    faqs?: FAQ[];
}

/**
 * "Straight answers": line-separated accordion, all closed by default.
 * With more than one FAQ category, tabs (General FAQs · Product · Usage ...)
 * switch between them.
 */
export default function ProductFAQsV2({ faqs = [] }: ProductFAQsV2Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const idPrefix = useId();

    // Tabs in order of first appearance, with "General" first when present.
    const categories = Array.from(new Set(faqs.map(categoryOf))).sort((a, b) =>
        a === DEFAULT_CATEGORY ? -1 : b === DEFAULT_CATEGORY ? 1 : 0,
    );
    const [activeTab, setActiveTab] = useState(categories[0] ?? DEFAULT_CATEGORY);
    const currentTab = categories.includes(activeTab) ? activeTab : categories[0];
    const visibleFaqs = categories.length > 1 ? faqs.filter((faq) => categoryOf(faq) === currentTab) : faqs;

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

                    {/* Category tabs (only when there's more than one) */}
                    {categories.length > 1 && (
                        <div
                            role="tablist"
                            aria-label="FAQ categories"
                            className="no-scrollbar -mx-4 mb-6 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:justify-center sm:px-0"
                        >
                            {categories.map((category) => {
                                const selected = category === currentTab;
                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        role="tab"
                                        aria-selected={selected}
                                        onClick={() => {
                                            setActiveTab(category);
                                            setOpenIndex(null);
                                        }}
                                        className={`shrink-0 rounded-full border px-5 py-2.5 font-body text-sm font-semibold transition sm:px-7 ${selected
                                            ? "border-brand-navy bg-brand-navy text-white"
                                            : "border-olympus bg-white text-brand-navy hover:border-brand-navy"
                                            }`}
                                    >
                                        {tabLabel(category)}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="border-t border-medium-gray" role={categories.length > 1 ? "tabpanel" : undefined}>
                        {visibleFaqs.map((faq, index) => {
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
