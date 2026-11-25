
interface ProductHighlight {
    image: string;
    title: string;
    description: string;
}

interface ProductHighlightsV4Props {
    highlights?: ProductHighlight[];
    heading?: string;
    eyebrow?: string;
    productName?: string;
    strength?: string;
}

// Connector paths in a 0-100 box over the desktop grid: from each card
// (left top, left bottom, right top, right bottom) curving into the centre.
const HIGHLIGHT_LINES = [
    "M 20 25 C 40 25, 40 50, 50 50",
    "M 20 75 C 40 75, 40 50, 50 50",
    "M 80 25 C 60 25, 60 50, 50 50",
    "M 80 75 C 60 75, 60 50, 50 50",
];

export default function ProductHighlightsV4({
    highlights = [],
    heading = "Why Choose This Product?",
    eyebrow = "WHY BOLD S",
    productName = "BOLD S",
    strength = "25mg",
}: ProductHighlightsV4Props) {
    if (!highlights.length) return null;

    const items = highlights.slice(0, 4);

    return (
        <section className="pdp-section relative w-full overflow-hidden bg-brand-navy">
            <div className="pdp-container">

                {/* Heading */}
                <div className="mb-12 text-center sm:mb-16">
                    <p className="mb-3 text-[10px] font-bold tracking-[0.35em] text-accent-lime sm:text-xs">
                        {eyebrow}
                    </p>

                    <h2 className="font-heading text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
                        {heading}
                    </h2>                </div>

                {/* Main layout */}
                <div className="relative mx-auto grid min-w-0 grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_280px_1fr] lg:gap-10">

                    {/* Connector lines (desktop): each card links to the centre badge.
                        Drawn behind the cards and badge, so only the gaps show.
                        A dashed line flows inward and a light pulse travels along it. */}
                    <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        {HIGHLIGHT_LINES.slice(0, items.length).map((d, index) => (
                            <g key={d}>
                                <path
                                    d={d}
                                    pathLength={100}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1}
                                    vectorEffect="non-scaling-stroke"
                                    className="highlight-line-flow text-white/25"
                                />
                                <path
                                    d={d}
                                    pathLength={100}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    vectorEffect="non-scaling-stroke"
                                    className="highlight-line-pulse text-accent-lime"
                                    style={{ animationDelay: `${index * 0.75}s` }}
                                />
                            </g>
                        ))}
                    </svg>

                    {/* Left cards */}
                    <div className="order-2 flex flex-col gap-5 lg:order-1">
                        {items.slice(0, 2).map((item, index) => (
                            <HighlightCard
                                key={`${item.title}-${index}`}
                                item={item}
                                number={index + 1}
                                imageFirst
                            />
                        ))}
                    </div>

                    {/* Center badge */}
                    <div className="relative order-1 flex items-center justify-center py-3 lg:order-2 lg:py-0">
                        <div className="highlight-ring-spin absolute h-[225px] w-[225px] rounded-full border border-dashed border-white/25 sm:h-[275px] sm:w-[275px]" />

                        <div className="absolute h-[190px] w-[190px] rounded-full border-[7px] border-brand-navy sm:h-[230px] sm:w-[230px]" />

                        <div className="relative z-10 flex h-[190px] w-[190px] flex-col items-center justify-center rounded-full bg-pale-gray text-center shadow-[0_10px_45px_rgba(0,0,0,0.2)] sm:h-[215px] sm:w-[215px]">
                            <p className="mb-1 text-[9px] font-bold tracking-[0.35em] text-brand-navy">
                                ALPHA MALE

                            </p>
                            <p className="text-[7px] text-black font-bold tracking-[0.35em]">Drive - Stamina - Energy</p>

                            <h3 className="font-body text-3xl font-semibold leading-none text-brand-navy sm:text-4xl">
                                {productName}
                            </h3>

                            <p className="mt-2 text-sm font-bold text-brand-navy">
                                {strength}
                            </p>
                        </div>
                    </div>

                    {/* Right cards */}
                    <div className="order-3 flex flex-col gap-5">
                        {items.slice(2, 4).map((item, index) => (
                            <HighlightCard
                                key={`${item.title}-${index + 2}`}
                                item={item}
                                number={index + 3}
                                imageFirst={false}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function HighlightCard({
    item,
    number,
    imageFirst,
}: {
    item: ProductHighlight;
    number: number;
    imageFirst: boolean;
}) {
    return (
        <article
            tabIndex={0}
            className="group relative z-0 flex min-h-[126px] w-full cursor-default items-center gap-3 rounded-2xl border border-white/10 bg-brand-navy p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_10px_rgba(0,0,0,0.25),0_14px_32px_rgba(0,0,0,0.35)] transition-all duration-700 ease-out hover:z-20 hover:border-accent-lime/60 hover:bg-[#0c1f40] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_16px_rgba(0,0,0,0.3),0_24px_48px_rgba(0,0,0,0.45)] focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime sm:gap-4 sm:p-4"
        >
            {/* Image: a thumbnail at rest; on hover/focus it grows to fill the
                card (right-hand cards grow toward the left) and the text fades. */}
            {item.image && (
                <div
                    className={`absolute inset-y-3 z-10 w-[34%] overflow-hidden rounded-lg transition-all duration-700 ease-in-out sm:inset-y-4 group-hover:inset-y-0 group-hover:w-full group-hover:rounded-2xl group-focus-visible:inset-y-0 group-focus-visible:w-full group-focus-visible:rounded-2xl sm:group-hover:inset-y-0 sm:group-focus-visible:inset-y-0 ${imageFirst
                        ? "left-3 sm:left-4 group-hover:left-0 group-focus-visible:left-0 sm:group-hover:left-0 sm:group-focus-visible:left-0"
                        : "right-3 sm:right-4 group-hover:right-0 group-focus-visible:right-0 sm:group-hover:right-0 sm:group-focus-visible:right-0"
                        }`}
                >
                    {/* object-contain: the whole image stays visible, never cropped */}
                    <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-contain"
                    />
                </div>
            )}

            {/* Keeps room for the thumbnail beside the text */}
            {imageFirst && item.image && <div aria-hidden="true" className="aspect-[4/3] w-[34%] shrink-0" />}

            <div className="min-w-0 flex-1 transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0">
                <p className="mb-1 text-[10px] font-bold tracking-wider text-accent-lime">
                    {String(number).padStart(2, "0")}
                </p>

                <h3 className="mb-1 font-body text-sm font-semibold leading-snug text-white sm:text-base">
                    {item.title}
                </h3>

                <p className="font-body text-sm leading-relaxed text-pale-gray">
                    {item.description}
                </p>
            </div>

            {!imageFirst && item.image && <div aria-hidden="true" className="aspect-[4/3] w-[34%] shrink-0" />}
        </article>
    );
}
