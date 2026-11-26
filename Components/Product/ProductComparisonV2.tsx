import Image from "next/image";
import { Check, X } from "lucide-react";

import { canOptimizeImage } from "@/lib/image-hosts";
import type { Product } from "@/types/product";

interface ProductComparisonV2Props {
    comparison?: Product["comparison"];
}

/** One comparison line: feature, our value (+ detail), their value (+ detail). */
type Row = {
    feature: string;
    ours: string;
    oursDetail: string;
    others: string;
    othersDetail: string;
};

/**
 * Rows come as { ours, others } (admin editor) or older { label, ourValue, otherValue }.
 * Admin fields: ours.title = feature, ours.description = our value,
 * ours.note = our detail, others.title = their short answer,
 * others.description = their detail.
 */
function toRows(rows: NonNullable<Product["comparison"]>["rows"] = []): Row[] {
    return rows
        .map((row): Row | null => {
            if ("ours" in row && row.ours) {
                const others = row.others ?? { title: "", description: "" };
                return {
                    feature: row.ours.title,
                    ours: row.ours.description || row.ours.title,
                    oursDetail: row.ours.note ?? "",
                    // No short answer -> the detail becomes the main line.
                    others: others.title || others.description || "",
                    othersDetail: others.title ? others.description || "" : "",
                };
            }
            if ("label" in row) {
                return { feature: row.label, ours: row.ourValue, oursDetail: "", others: row.otherValue, othersDetail: "" };
            }
            return null;
        })
        .filter((row): row is Row => Boolean(row && (row.feature || row.ours || row.others)));
}

function Mark({ good }: { good: boolean }) {
    return good ? (
        <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white">
            <Check size={15} strokeWidth={3} />
        </span>
    ) : (
        <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pale-gray text-brand-navy-muted">
            <X size={14} strokeWidth={2.5} />
        </span>
    );
}

function Cell({ feature, value, detail, good }: { feature: string; value: string; detail: string; good: boolean }) {
    return (
        <div className="flex items-start gap-3">
            <Mark good={good} />
            <div className="min-w-0">
                <span className="sr-only">{good ? "Yes: " : "No: "}</span>
                {feature && (
                    <p className="font-body text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-navy-muted">{feature}</p>
                )}
                <p className={`mt-0.5 font-body text-sm font-semibold leading-snug ${good ? "text-brand-navy" : "text-brand-navy/80"}`}>{value}</p>
                {detail && <p className="mt-0.5 font-body text-xs leading-snug text-brand-navy-muted">{detail}</p>}
            </div>
        </div>
    );
}

function Pill({ children, ours }: { children: React.ReactNode; ours: boolean }) {
    return (
        <span
            className={`inline-flex rounded-full px-5 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.18em] ${ours ? "bg-brand-navy text-white" : "bg-olympus text-brand-navy-muted"}`}
        >
            {children}
        </span>
    );
}

function ProductImage({ src, alt, className }: { src?: string; alt: string; className: string }) {
    if (!src) return null;
    return (
        <div className={`relative ${className}`}>
            <Image src={src} alt={alt} fill sizes="220px" unoptimized={!canOptimizeImage(src)} className="object-contain" />
        </div>
    );
}

function Vs() {
    return (
        <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border border-olympus bg-white font-heading text-sm text-brand-navy shadow-[0_6px_16px_rgba(33,46,73,0.12)]">
            VS
        </span>
    );
}

/**
 * "Know the difference": our product vs the alternative. Desktop: ticks on
 * the left, crosses on the right, product images with "VS" in the middle.
 * Phones: images on top, then one card per feature with both answers.
 */
export default function ProductComparisonV2({ comparison }: ProductComparisonV2Props) {
    const rows = toRows(comparison?.rows);
    if (!comparison || !rows.length) return null;

    const ourLabel = comparison.ourLabel;
    const otherLabel = comparison.otherLabel;

    return (
        <section className="pdp-section w-full bg-white text-brand-navy">
            <div className="pdp-container">
                {/* Heading */}
                <div className="text-center">
                    <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy">
                        Know the difference
                    </p>
                    <h2 className="font-heading text-3xl leading-tight text-brand-navy sm:text-4xl">{comparison.heading}</h2>
                    {comparison.subheading && (
                        <p className="mx-auto mt-3 max-w-xl font-body text-sm text-brand-navy-muted sm:text-base">{comparison.subheading}</p>
                    )}
                </div>

                {/* Screen readers: the comparison as a plain table. The sr-only
                    goes on a wrapper div: on a <table> itself browsers ignore
                    its width/overflow, which widened the whole page on phones. */}
                <div className="sr-only">
                <table>
                    <caption>{ourLabel} compared with {otherLabel}</caption>
                    <thead>
                        <tr>
                            <th scope="col">Feature</th>
                            <th scope="col">{ourLabel}</th>
                            <th scope="col">{otherLabel}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                <th scope="row">{row.feature}</th>
                                <td>{[row.ours, row.oursDetail].filter(Boolean).join(", ")}</td>
                                <td>{[row.others, row.othersDetail].filter(Boolean).join(", ")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>

                {/* Desktop: two sides with the images in the middle */}
                <div
                    aria-hidden="true"
                    className="mx-auto mt-10 hidden max-w-5xl grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)] gap-x-10 lg:grid"
                    style={{ gridTemplateRows: `auto repeat(${rows.length}, auto)` }}
                >
                    <div className="mb-5 flex justify-center" style={{ gridColumn: 1, gridRow: 1 }}>
                        <Pill ours>{ourLabel}</Pill>
                    </div>
                    <div className="mb-5 flex justify-center" style={{ gridColumn: 3, gridRow: 1 }}>
                        <Pill ours={false}>{otherLabel}</Pill>
                    </div>

                    {rows.map((row, index) => (
                        <div key={`ours-${index}`} className="border-b border-olympus py-3.5" style={{ gridColumn: 1, gridRow: index + 2 }}>
                            <Cell feature={row.feature} value={row.ours} detail={row.oursDetail} good />
                        </div>
                    ))}
                    {rows.map((row, index) => (
                        <div key={`others-${index}`} className="border-b border-olympus py-3.5" style={{ gridColumn: 3, gridRow: index + 2 }}>
                            <Cell feature={row.feature} value={row.others} detail={row.othersDetail} good={false} />
                        </div>
                    ))}

                    {/* Middle: our product, VS, the alternative */}
                    <div className="flex flex-col items-center justify-center gap-5" style={{ gridColumn: 2, gridRow: `2 / span ${rows.length}` }}>
                        <ProductImage src={comparison.ourImage} alt={ourLabel} className="h-64 w-44 drop-shadow-[0_18px_30px_rgba(33,46,73,0.25)]" />
                        <Vs />
                        <ProductImage src={comparison.otherImage} alt={otherLabel} className="h-28 w-36 opacity-90" />
                    </div>
                </div>

                {/* Phones/tablets: images on top, then one card per feature */}
                <div aria-hidden="true" className="mt-8 lg:hidden">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <div className="flex flex-col items-center gap-3">
                            <ProductImage src={comparison.ourImage} alt={ourLabel} className="h-36 w-28" />
                            <Pill ours>{ourLabel}</Pill>
                        </div>
                        <Vs />
                        <div className="flex flex-col items-center gap-3">
                            <ProductImage src={comparison.otherImage} alt={otherLabel} className="h-20 w-28" />
                            <Pill ours={false}>{otherLabel}</Pill>
                        </div>
                    </div>

                    <ul className="mt-6 divide-y divide-olympus border-y border-olympus">
                        {rows.map((row, index) => (
                            <li key={index} className="py-4">
                                {row.feature && (
                                    <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-navy-muted">{row.feature}</p>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <Cell feature="" value={row.ours} detail={row.oursDetail} good />
                                    <Cell feature="" value={row.others} detail={row.othersDetail} good={false} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
