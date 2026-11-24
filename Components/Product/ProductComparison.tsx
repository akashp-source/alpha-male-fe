import { Check, Pill, Sparkles, X } from "lucide-react";

import type { Product } from "@/types/product";

interface ProductComparisonProps {
    comparison?: Product["comparison"];
}

type Row = { label: string; ours: string; others: string };

/**
 * Rows come in two shapes: the older { label, ourValue, otherValue } and the
 * admin editor's { ours: { title, description }, others: { title, description } }.
 */
function normalizeRows(rows: NonNullable<Product["comparison"]>["rows"]): Row[] {
    return rows
        .map((row) => {
            if ("ours" in row && row.ours) {
                const others = row.others ?? { title: "", description: "" };
                return {
                    label: row.ours.title,
                    ours: row.ours.description || row.ours.title,
                    others: [others.title, others.description].filter(Boolean).join(" · "),
                };
            }
            if ("label" in row) {
                return { label: row.label, ours: row.ourValue, others: row.otherValue };
            }
            return null;
        })
        .filter((row): row is Row => Boolean(row && (row.label || row.ours || row.others)));
}

/** Highlight a "vs" inside the heading, e.g. "Oral Strips vs Traditional Pills". */
function Heading({ text }: { text: string }) {
    const parts = text.split(/\s+(?:vs\.?|versus)\s+/i);
    if (parts.length !== 2) return <>{text}</>;
    return (
        <>
            {parts[0]}{" "}
            <span className="mx-1 inline-block bg-gradient-to-br from-[#e9b949] to-[#b8801f] bg-clip-text italic text-transparent">
                vs
            </span>{" "}
            {parts[1]}
        </>
    );
}

function ColumnAvatar({ image, ours }: { image?: string; ours: boolean }) {
    if (image) {
        return (
            <img
                src={image}
                alt=""
                loading="lazy"
                className={`h-14 w-14 rounded-2xl object-cover sm:h-16 sm:w-16 ${ours ? "ring-2 ring-accent-amber-dark/70" : "opacity-80 grayscale"}`}
            />
        );
    }
    return (
        <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl sm:h-16 sm:w-16 ${ours ? "bg-gradient-to-br from-[#e9b949] to-[#b8801f] text-brand-navy shadow-[0_8px_24px_rgba(215,155,43,0.35)]" : "bg-[#e6e9ef] text-[#8a93a3]"}`}
        >
            {ours ? <Sparkles size={26} /> : <Pill size={26} />}
        </span>
    );
}

function Tick({ ours }: { ours: boolean }) {
    return ours ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e9b949] to-[#b8801f] text-brand-navy shadow-[0_0_0_4px_rgba(215,155,43,0.15)]">
            <Check size={14} strokeWidth={3} />
        </span>
    ) : (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e9ecf2] text-[#9aa3b2]">
            <X size={13} strokeWidth={3} />
        </span>
    );
}

function VsBadge({ className = "" }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#e9b949] to-[#b8801f] font-heading text-sm font-bold text-brand-navy shadow-[0_10px_30px_rgba(33,46,73,0.25)] ${className}`}
        >
            VS
        </span>
    );
}

export default function ProductComparison({ comparison }: ProductComparisonProps) {
    if (!comparison?.rows?.length) return null;

    const rows = normalizeRows(comparison.rows);
    if (!rows.length) return null;

    const ourLabel = comparison.ourLabel || "Ours";
    const otherLabel = comparison.otherLabel || "Others";
    const grid = "grid-cols-[minmax(150px,0.9fr)_minmax(0,1.2fr)_minmax(0,1.2fr)]";

    return (
        <section className="pdp-section relative w-full overflow-hidden bg-gradient-to-b from-[#f4f6fa] to-white">
            {/* Decorative glows */}
            <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand-navy/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent-amber-dark/15 blur-3xl" />

            <div className="pdp-container relative">
                <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-navy/15 bg-white px-4 py-1.5 font-body text-[10px] font-bold uppercase tracking-[0.25em] text-brand-navy sm:text-xs">
                        <Sparkles size={13} className="text-accent-amber-dark" />
                        Know the difference
                    </p>
                    <h2 className="font-heading text-2xl font-semibold uppercase leading-tight tracking-wide text-brand-navy sm:text-4xl lg:text-5xl">
                        <Heading text={comparison.heading || "Know the difference"} />
                    </h2>
                    {comparison.subheading && (
                        <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-relaxed text-[#5b6577] sm:text-base">
                            {comparison.subheading}
                        </p>
                    )}
                </header>

                {/* ---------- Tablet / desktop: highlighted-column table ---------- */}
                <div className="mx-auto hidden max-w-5xl sm:block" role="table" aria-label={`${ourLabel} compared with ${otherLabel}`}>
                    {/* Column headers */}
                    <div className={`grid ${grid} items-end`} role="row">
                        <div role="columnheader" className="px-6 pb-6 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#8a93a3]">
                            Feature
                        </div>

                        <div role="columnheader" className="relative rounded-t-[28px] border-x border-white/20 bg-gradient-to-b from-[#132a52] to-brand-navy px-5 pb-6 pt-9 text-center text-white shadow-[-7px_0_18px_rgba(33,46,73,0.22),7px_0_18px_rgba(33,46,73,0.22)]">
                            {comparison.ourBadge && (
                                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#e9b949] to-[#b8801f] px-4 py-1.5 font-body text-[10px] font-bold uppercase tracking-[0.15em] text-brand-navy shadow-lg">
                                    {comparison.ourBadge}
                                </span>
                            )}
                            <div className="flex flex-col items-center gap-3">
                                <ColumnAvatar image={comparison.ourImage} ours />
                                <h3 className="font-body text-base font-semibold leading-snug lg:text-lg">{ourLabel}</h3>
                            </div>
                        </div>

                        <div role="columnheader" className="relative px-5 pb-6 pt-9 text-center">
                            <VsBadge className="absolute left-0 top-[calc(50%+1rem)] z-10 -translate-x-1/2 -translate-y-1/2" />
                            <div className="flex flex-col items-center gap-3">
                                <ColumnAvatar image={comparison.otherImage} ours={false} />
                                <h3 className="font-body text-base font-semibold leading-snug text-brand-navy-muted lg:text-lg">{otherLabel}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="overflow-visible rounded-[28px] rounded-tr-none bg-white shadow-[0_20px_60px_rgba(33,46,73,0.08)] ring-1 ring-[#e3e8f0]">
                        {rows.map((row, index) => {
                            const divider = index < rows.length - 1;
                            return (
                                <div key={`${row.label}-${index}`} role="row" className={`group grid ${grid} transition-colors hover:bg-[#f7f9fc]`}>
                                    <div role="rowheader" className={`flex items-center gap-3 px-6 py-5 ${divider ? "border-b border-pale-gray" : ""}`}>
                                        <span className="font-heading text-xs font-bold text-accent-amber-dark">{String(index + 1).padStart(2, "0")}</span>
                                        <span className="font-body text-sm font-bold text-brand-navy lg:text-base">{row.label}</span>
                                    </div>

                                    <div role="cell" className={`relative z-[1] flex items-center gap-3 border-x border-white/20 bg-brand-navy px-5 py-5 text-white shadow-[-7px_0_18px_rgba(33,46,73,0.22),7px_0_18px_rgba(33,46,73,0.22)] transition-colors group-hover:bg-[#0c1e3d] ${divider ? "border-b border-white/10" : ""}`}>
                                        <Tick ours />
                                        <span className="font-body text-sm leading-relaxed lg:text-[15px]">{row.ours}</span>
                                    </div>

                                    <div role="cell" className={`flex items-center gap-3 px-5 py-5 ${divider ? "border-b border-pale-gray" : ""}`}>
                                        <Tick ours={false} />
                                        <span className="font-body text-sm leading-relaxed text-brand-navy-muted lg:text-[15px]">{row.others}</span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Summary strip under our column */}
                        <div className={`grid ${grid}`} aria-hidden="true">
                            <div />
                            <div className="relative z-[1] flex items-center justify-center gap-2 rounded-b-[28px] border-x border-white/20 bg-gradient-to-b from-brand-navy to-[#132a52] px-5 py-4 font-body text-xs font-bold uppercase tracking-[0.18em] text-[#e9b949] shadow-[-7px_0_18px_rgba(33,46,73,0.22),7px_0_18px_rgba(33,46,73,0.22)]">
                                <Check size={14} strokeWidth={3} />
                                {rows.length} reasons to choose
                            </div>
                            <div />
                        </div>
                    </div>
                </div>

                {/* ---------- Mobile: matchup header + stacked cards ---------- */}
                <div className="sm:hidden">
                    <div className="relative mb-6 grid grid-cols-2 gap-3 pt-3">
                        <div className="relative flex flex-col items-center gap-2 rounded-3xl bg-gradient-to-b from-[#132a52] to-brand-navy px-3 pb-5 pt-7 text-center text-white shadow-[0_14px_40px_rgba(33,46,73,0.25)]">
                            {comparison.ourBadge && (
                                <span className="absolute left-1/2 top-0 max-w-[90%] -translate-x-1/2 -translate-y-1/2 truncate rounded-full bg-gradient-to-r from-[#e9b949] to-[#b8801f] px-3 py-1 font-body text-[9px] font-bold uppercase tracking-wider text-brand-navy">
                                    {comparison.ourBadge}
                                </span>
                            )}
                            <ColumnAvatar image={comparison.ourImage} ours />
                            <span className="font-body text-xs font-bold leading-snug">{ourLabel}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 rounded-3xl border border-[#e3e8f0] bg-white px-3 pb-5 pt-7 text-center">
                            <ColumnAvatar image={comparison.otherImage} ours={false} />
                            <span className="font-body text-sm font-semibold leading-snug text-brand-navy-muted">{otherLabel}</span>
                        </div>
                        <VsBadge className="absolute left-1/2 top-1/2 z-10 h-11 w-11 -translate-x-1/2 -translate-y-1/2 text-xs" />
                    </div>

                    <ul className="space-y-3">
                        {rows.map((row, index) => (
                            <li key={`${row.label}-${index}`} className="overflow-hidden rounded-2xl border border-[#e3e8f0] bg-white shadow-[0_8px_24px_rgba(33,46,73,0.06)]">
                                <p className="flex items-center gap-2 px-4 pb-2 pt-3 font-body text-[13px] font-bold text-brand-navy">
                                    <span className="font-heading text-[11px] text-accent-amber-dark">{String(index + 1).padStart(2, "0")}</span>
                                    {row.label}
                                </p>
                                <div className="grid grid-cols-2">
                                    <div className="flex items-start gap-2 bg-brand-navy px-3 py-3 text-white">
                                        <Tick ours />
                                        <span className="font-body text-xs leading-relaxed">{row.ours}</span>
                                    </div>
                                    <div className="flex items-start gap-2 px-3 py-3">
                                        <Tick ours={false} />
                                        <span className="font-body text-sm leading-relaxed text-brand-navy-muted">{row.others}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
