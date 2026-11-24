
interface ProductHighlight {
    image: string;
    title: string;
    description: string;
}

interface ProductHighlightsV2Props {
    highlights?: ProductHighlight[];
    heading?: string;
}

export default function ProductHighlightsV2({
    highlights = [],
    heading = "Why Choose This Product?",
}: ProductHighlightsV2Props) {
    if (!highlights.length) return null;

    return (
        <section className="w-full bg-brand-navy px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
            <div className="mx-auto max-w-[1300px]">

                {/* Heading */}
                <div className="mb-12 text-center">
                    <h2 className="font-heading text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
                        {heading}
                    </h2>

                    <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-[#c5d66b]" />
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                    {highlights.map((item, index) => (
                        <article
                            key={`${item.title}-${index}`}
                            className="group relative flex min-w-0 flex-col overflow-hidden rounded-[20px] bg-[#f6f2e9] shadow-sm transition-all duration-300 ease-out hover:z-20 hover:scale-[1.04] hover:shadow-2xl"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e9e3d8]">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Number */}
                                <span className="absolute left-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#0d403d] px-2 text-xs font-bold text-[#d3e77d] shadow-md">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="flex flex-1 flex-col p-4 sm:p-4 lg:p-4">
                                <h3 className="mb-2 font-body text-base font-semibold leading-snug text-[#0d403d] sm:text-[17px]">
                                    {item.title}
                                </h3>

                                <p className="font-body text-sm leading-relaxed text-[#626b68]">
                                    {item.description}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>

            </div>
        </section>
    );
}
