import type { Product } from "@/types/product";

interface ProductInformationProps {
    information?: Product["productInformation"];
    sku?: string;
    licenceNumber?: string | null;
}

/**
 * "Inside the pack": pack image + label/value table from the backend.
 * SKU and licence number come from their own product fields and are added
 * at the end unless the admin already typed a row with that label.
 */
export default function ProductInformation({ information, sku, licenceNumber }: ProductInformationProps) {
    const rows = (information?.rows ?? []).filter((row) => row.label?.trim() && row.value?.trim());
    if (!rows.length) return null;

    const hasRow = (pattern: RegExp) => rows.some((row) => pattern.test(row.label));
    const allRows = [
        ...rows,
        ...(licenceNumber?.trim() && !hasRow(/licen[cs]e/i) ? [{ label: "Mfg. licence", value: licenceNumber.trim() }] : []),
        ...(sku?.trim() && !hasRow(/^sku$/i) ? [{ label: "SKU", value: sku.trim() }] : []),
    ];

    const image = information?.image?.trim();
    const caption = information?.imageCaption?.trim();

    return (
        <section className="pdp-section w-full  text-brand-navy">
            <div className={`pdp-container grid grid-cols-1 items-center gap-8 ${image ? "lg:grid-cols-2 lg:gap-14" : ""}`}>

                {/* Pack image */}
                {image && (
                    <div className="flex flex-col items-center gap-6 rounded-3xl bg-transparent p-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image}
                            alt={caption || "What's inside the pack"}
                            loading="lazy"
                            className="max-h-[420px] max-w-full object-contain"
                        />
                        {caption && (
                            <p className="w-full text-center font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-navy-muted">
                                {caption}
                            </p>
                        )}
                    </div>
                )}

                {/* Details table */}
                <div>
                    <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy">
                        Inside the pack
                    </p>
                    <h2 className="font-heading text-3xl leading-tight text-brand-navy sm:text-4xl">
                        Product information
                    </h2>

                    <dl className="mt-6 border-t border-olympus">
                        {allRows.map((row, index) => (
                            <div
                                key={`${row.label}-${index}`}
                                className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-olympus py-3"
                            >
                                <dt className="font-body text-xs font-semibold text-brand-navy sm:text-sm">
                                    {row.label}
                                </dt>
                                <dd className="font-body text-xs leading-relaxed text-brand-navy-muted sm:text-sm">
                                    {row.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>

            </div>
        </section>
    );
}
