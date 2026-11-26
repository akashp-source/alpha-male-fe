import type { Product } from "@/types/product";

interface ProductCompareAndSafetyProps {
    comparison?: Product["comparison"];
    safetyInfo?: Product["safetyInfo"];
}

type Row = { label: string; ours: string; others: string };

/** Safety point text with **double stars** around words shown in bold. */
function WithBold({ text }: { text: string }) {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return (
        <>
            {parts.map((part, index) =>
                index % 2 === 1 ? <strong key={index} className="font-semibold">{part}</strong> : part,
            )}
        </>
    );
}

/** Comparison rows come as { ours, others } (admin editor) or older { label, ourValue, otherValue }. */
function toRows(rows: NonNullable<Product["comparison"]>["rows"] = []): Row[] {
    return rows
        .map((row): Row | null => {
            if ("ours" in row && row.ours) {
                const others = row.others ?? { title: "", description: "" };
                return {
                    label: row.ours.title,
                    ours: row.ours.description || row.ours.title,
                    others: others.description || others.title || "",
                };
            }
            if ("label" in row) return { label: row.label, ours: row.ourValue, others: row.otherValue };
            return null;
        })
        .filter((row): row is Row => Boolean(row && (row.label || row.ours || row.others)));
}

/** Comparison table (e.g. Strip vs tablet) beside the "Read before use" box. */
export default function ProductCompareAndSafety({ comparison, safetyInfo }: ProductCompareAndSafetyProps) {
    const rows = toRows(comparison?.rows);
    const points = (safetyInfo?.points ?? []).map((point) => point.trim()).filter(Boolean);

    const showTable = rows.length > 0;
    const showSafety = points.length > 0;
    if (!showTable && !showSafety) return null;

    return (
        <section className="pdp-section w-full bg-white text-brand-navy">
            <div className={`pdp-container grid grid-cols-1 items-start gap-10 ${showTable && showSafety ? "lg:grid-cols-2 lg:gap-14" : ""}`}>

                {/* Comparison table */}
                {showTable && comparison && (
                    <div className="min-w-0">
                        <h2 className="font-heading text-2xl leading-tight text-brand-navy sm:text-3xl">
                            {comparison.heading}
                        </h2>
                        {comparison.subheading && (
                            <p className="mt-2 font-body text-sm text-brand-navy-muted">{comparison.subheading}</p>
                        )}

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[420px] border-collapse text-left font-body text-sm">
                                <thead>
                                    <tr className="border-b border-olympus">
                                        <th scope="col" className="py-3 pr-4"><span className="sr-only">Feature</span></th>
                                        <th scope="col" className="py-3 pr-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-navy">
                                            {comparison.ourLabel}
                                        </th>
                                        <th scope="col" className="py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-navy-muted">
                                            {comparison.otherLabel}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={`${row.label}-${index}`} className="border-b border-olympus">
                                            <th scope="row" className="py-3 pr-4 font-semibold text-brand-navy">{row.label}</th>
                                            <td className="py-3 pr-4 text-brand-navy">{row.ours}</td>
                                            <td className="py-3 text-brand-navy-muted">{row.others}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Read before use */}
                {showSafety && (
                    // On its own (no comparison table) the box is centred at a readable width.
                    <aside className={`rounded-2xl border border-medium-gray p-6 sm:p-7 ${showTable ? "" : "mx-auto w-full max-w-3xl"}`}>
                        <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy">
                            Read before use
                        </p>
                        <h2 className="font-heading text-xl leading-tight text-brand-navy sm:text-2xl">
                            {safetyInfo?.title?.trim() || "Your safety first"}
                        </h2>
                        <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-sm leading-relaxed text-brand-navy marker:text-brand-navy">
                            {points.map((point, index) => (
                                <li key={index}><WithBold text={point} /></li>
                            ))}
                        </ul>
                    </aside>
                )}

            </div>
        </section>
    );
}
