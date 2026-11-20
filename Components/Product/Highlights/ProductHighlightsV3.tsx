
interface ProductHighlight {
    image: string;
    title: string;
    description: string;
}

interface ProductHighlightsV3Props {
    highlights?: ProductHighlight[];
    heading?: string;
    eyebrow?: string;
}

export default function ProductHighlightsV3({
    highlights = [],
    heading = "Why Choose This Product?",
    eyebrow = "WHY BOLD S",
}: ProductHighlightsV3Props) {
    if (!highlights.length) return null;

    return (
        <section className="w-full overflow-hidden bg-[#07162f] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-16">

            <div className="mx-auto max-w-[1400px]">

                {/* Heading */}
                <div className="mb-12 text-center sm:mb-16">
                    <p className="mb-3 font-body text-[11px] font-bold tracking-[0.3em] text-[#c5df50] sm:text-xs">
                        {eyebrow}
                    </p>

                    <h2 className="font-heading text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                        {heading}
                    </h2>
                </div>

                {/* Timeline */}
                <div className="relative">

                    {/* Horizontal timeline line */}
                    <div className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-white/40 lg:block" />

                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-0">

                        {highlights.map((item, index) => {
                            const imageOnTop = index % 2 === 0;

                            const ImageBlock = (
                                <div className="group w-full overflow-hidden rounded-xl bg-white/10">
                                    <div className="aspect-[16/9] overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                </div>
                            );

                            const TextBlock = (
                                <div className={`flex min-h-[110px] flex-col justify-center ${imageOnTop ? "text-center" : "text-center"}`}>
                                    <h3 className="mb-2 font-body text-base font-bold leading-snug text-white sm:text-lg">
                                        {item.title}
                                    </h3>

                                    <p className="font-body text-xs leading-relaxed text-white/75 sm:text-sm">
                                        {item.description}
                                    </p>
                                </div>
                            );

                            return (
                                <article
                                    key={`${item.title}-${index}`}
                                    className="relative flex min-w-0 flex-col lg:grid lg:grid-rows-[minmax(110px,1fr)_48px_minmax(110px,1fr)]"
                                >

                                    {/* Top content */}
                                    <div className="flex items-center lg:row-start-1">
                                        {imageOnTop ? ImageBlock : TextBlock}
                                    </div>

                                    {/* Timeline number */}
                                    <div className="relative z-10 flex items-center justify-center py-3 lg:row-start-2 lg:py-0">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c5df50] bg-[#0d403d] font-body text-xs font-bold text-[#c5df50] shadow-[0_0_0_5px_#0d403d]">
                                            {String(index + 1).padStart(2, "0")}
                                        </div>
                                    </div>

                                    {/* Bottom content */}
                                    <div className="flex items-center lg:row-start-3">
                                        {imageOnTop ? TextBlock : ImageBlock}
                                    </div>

                                </article>
                            );
                        })}

                    </div>
                </div>
            </div>
        </section>
    );
}
