
interface ProductHighlight {
    image: string;
    title: string;
    description: string;
}

interface ProductHighlightsProps {
    highlights?: ProductHighlight[];
    heading?: string;
}

const ImageContent = ({ highlight }: { highlight: ProductHighlight }) => (
    <div className="w-full min-w-0">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-white/10">
            <img
                src={highlight.image}
                alt={highlight.title}
                loading="lazy"
                className="h-full w-full object-cover"
            />
        </div>
    </div>
);

const TextContent = ({
    highlight,
    align = "left",
}: {
    highlight: ProductHighlight;
    align?: "left" | "right";
}) => (
    <div className={`w-full min-w-0 ${align === "right" ? "text-left lg:text-right" : "text-left"}`}>
        <h3 className="mb-3 font-body text-lg font-semibold leading-snug text-white sm:text-xl">
            {highlight.title}
        </h3>

        <p className="font-body text-sm leading-relaxed text-white/75 sm:text-base">
            {highlight.description}
        </p>
    </div>
);

export default function ProductHighlights({
    highlights = [],
    heading = "Why Choose This Product?",
}: ProductHighlightsProps) {
    if (!highlights.length) return null;

    return (
        <section className="w-full overflow-hidden bg-brand-navy px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="mx-auto w-full max-w-[1200px]">

                {/* Section heading */}
                <h2 className="mb-10 text-center font-heading text-2xl font-semibold text-white sm:mb-14 sm:text-3xl">
                    {heading}
                </h2>

                {/* Timeline */}
                <div className="relative">

                    {/* Vertical center line - desktop only */}
                    <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-white/40 lg:block" />

                    <div className="flex flex-col gap-10 lg:gap-12">

                        {highlights.map((highlight, index) => {
                            const imageLeft = index % 2 === 0;

                            return (
                                <div
                                    key={`${highlight.title}-${index}`}
                                    className="grid min-w-0 grid-cols-1 items-center gap-5 lg:min-h-[220px] lg:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] lg:gap-0"
                                >

                                    {/* LEFT COLUMN */}
                                    <div className="flex w-full min-w-0 items-center lg:col-start-1 lg:row-start-1 lg:justify-end lg:pr-6">

                                        <div className="w-full max-w-[480px]">
                                            {imageLeft ? (
                                                <ImageContent highlight={highlight} />
                                            ) : (
                                                <TextContent
                                                    highlight={highlight}
                                                    align="right"
                                                />
                                            )}
                                        </div>

                                    </div>

                                    {/* CENTER TIMELINE */}
                                    <div className="relative hidden h-full items-center justify-center lg:col-start-2 lg:row-start-1 lg:flex">

                                        {/* Horizontal connector */}
                                        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/40" />

                                        {/* Timeline dot */}
                                        <div className="relative z-10 h-3 w-3 rounded-full border-2 border-white bg-[#0d403d]" />

                                    </div>

                                    {/* RIGHT COLUMN */}
                                    <div className="flex w-full min-w-0 items-center lg:col-start-3 lg:row-start-1 lg:justify-start lg:pl-6">

                                        <div className="w-full max-w-[480px]">
                                            {imageLeft ? (
                                                <TextContent
                                                    highlight={highlight}
                                                />
                                            ) : (
                                                <ImageContent highlight={highlight} />
                                            )}
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
