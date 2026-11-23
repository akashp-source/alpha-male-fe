
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
        <section className="pdp-section relative w-full overflow-hidden bg-[#07162f]">
            <div className="pdp-container">

                {/* Heading */}
                <div className="mb-12 text-center sm:mb-16">
                    <p className="mb-3 text-[10px] font-bold tracking-[0.35em] text-[#c5df50] sm:text-xs">
                        {eyebrow}
                    </p>

                    <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                        {heading}
                    </h2>                </div>

                {/* Main layout */}
                <div className="relative mx-auto grid min-w-0 grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_240px_1fr] lg:gap-6">

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
                        <div className="absolute h-[225px] w-[225px] rounded-full border border-dashed border-white/25 sm:h-[275px] sm:w-[275px]" />

                        <div className="absolute h-[190px] w-[190px] rounded-full border-[7px] border-[#07162f] sm:h-[230px] sm:w-[230px]" />

                        <div className="relative z-10 flex h-[190px] w-[190px] flex-col items-center justify-center rounded-full bg-[#f5f0e7] text-center shadow-[0_10px_45px_rgba(0,0,0,0.2)] sm:h-[215px] sm:w-[215px]">
                            <p className="mb-1 text-[9px] font-bold tracking-[0.35em] text-[#07162f]">
                                ALPHA MALE

                            </p>
                            <p className="text-[7px] text-black font-bold tracking-[0.35em]">Drive - Stamina - Energy</p>

                            <h3 className="font-heading text-3xl font-bold leading-none text-[#07162f] sm:text-4xl">
                                {productName}
                            </h3>

                            <p className="mt-2 text-sm font-bold text-[#07162f]">
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
            className="group relative z-0 flex min-h-[126px] w-full cursor-default items-center gap-3 rounded-2xl border border-white/10 bg-[#07162f] p-3 transition-all duration-300 ease-out hover:z-20 hover:scale-[1.045] hover:border-[#c5df50]/60 hover:bg-[#0c1f40] hover:shadow-[0_18px_40px_rgba(0,0,0,0.3)] focus-visible:z-20 focus-visible:scale-[1.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5df50] sm:gap-4 sm:p-4"
        >
            {imageFirst && item.image && (
                <div className="w-[34%] shrink-0 overflow-hidden rounded-lg">
                    <div className="aspect-[4/3]">
                        <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                </div>
            )}

            <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-bold tracking-wider text-[#c5df50]">
                    {String(number).padStart(2, "0")}
                </p>

                <h3 className="mb-1 font-body text-sm font-bold leading-snug text-white sm:text-base">
                    {item.title}
                </h3>

                <p className="font-body text-sm leading-relaxed text-[#E9E9EA]">
                    {item.description}
                </p>
            </div>

            {!imageFirst && item.image && (
                <div className="w-[34%] shrink-0 overflow-hidden rounded-lg">
                    <div className="aspect-[4/3]">
                        <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                </div>
            )}
        </article>
    );
}
