
interface HowToUseStep {
    title: string;
    description: string;
    image?: string;
}

interface ProductHowToUseV2Props {
    eyebrow?: string;
    /** Overrides the generated "N steps." heading when set. */
    heading?: string;
    intro?: string;
    /** Product category; oral strips get "No water." added to the heading. */
    category?: string;
    steps?: HowToUseStep[];
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const NUMBER_WORDS = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

// Matches "oral-strip", "oral strip", "Oral Strips", etc.
export function isOralStrip(category?: string) {
    return (category ?? "").toLowerCase().replace(/[^a-z]/g, "").startsWith("oralstrip");
}

function stepsHeading(count: number, category?: string) {
    const countText = NUMBER_WORDS[count - 1] ?? String(count);
    const base = `${countText} ${count === 1 ? "step" : "steps"}.`;
    return isOralStrip(category) ? `${base} No water.` : base;
}

export default function ProductHowToUseV2({
    eyebrow = "How to use",
    heading,
    intro,
    category,
    steps = [],
}: ProductHowToUseV2Props) {
    if (!steps.length) return null;

    const title = heading ?? stepsHeading(steps.length, category);

    return (
        <section className="pdp-section pdp-section-end-tight w-full bg-white text-brand-navy">
            <div className="pdp-container">

                {/* Header: eyebrow + heading on the left, intro on the right */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
                    <div>
                        <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy">
                            {eyebrow}
                        </p>
                        <h2 className="font-heading text-3xl leading-tight text-brand-navy sm:text-4xl">
                            {title}
                        </h2>
                    </div>

                    {intro && (
                        <p className="max-w-[360px] font-body text-sm leading-relaxed text-brand-navy-muted">
                            {intro}
                        </p>
                    )}
                </div>

                {/* Divider */}
                <div className="mt-8 border-t border-olympus sm:mt-10" />

                {/* Steps */}
                <ol className="mt-6 grid grid-cols-1 gap-8 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                    {steps.map((step, index) => (
                        <li key={`${step.title}-${index}`}>
                            {/* Decorative numeral; order is conveyed by the <ol> */}
                            <span
                                aria-hidden="true"
                                className="block font-heading text-5xl font-normal leading-none text-palladium sm:text-6xl"
                            >
                                {ROMAN[index] ?? index + 1}
                            </span>

                            <h3 className="mt-4 font-body text-sm uppercase tracking-[0.08em] text-brand-navy">
                                {step.title}
                            </h3>

                            <p className="mt-2 max-w-[320px] font-body text-sm leading-relaxed text-brand-navy-muted">
                                {step.description}
                            </p>
                        </li>
                    ))}
                </ol>

            </div>
        </section>
    );
}
