
interface KeyPoint {
    title: string;
    description: string;
    image?: string;
}

interface ProductKeyPointsProps {
    keyPoints?: KeyPoint[];
}

const pointIcons = ["🪶", "💧", "📐", "⚡", "🌿", "📦"];

export default function ProductKeyPoints({
    keyPoints = [],
}: ProductKeyPointsProps) {
    if (!keyPoints.length) return null;

    return (
        <section className="pdp-section w-full bg-[#f5f7f4]">
            <div className="pdp-container grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">

                {keyPoints.map((point, index) => (
                    <div
                        key={`${point.title}-${index}`}
                        className="min-w-0 rounded-[22px] border border-[#dce3dc] bg-white p-3 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
                    >
                        <div className="mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#dce5dc] bg-[#e0f2e9] sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl">
                            {point.image ? (
                                <img
                                    src={point.image}
                                    alt={point.title}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <span className="text-xl sm:text-2xl">
                                    {pointIcons[index % pointIcons.length]}
                                </span>
                            )}
                        </div>

                        <h3 className="mb-1 break-words font-body text-sm font-bold leading-snug text-[#17120f] sm:mb-2 sm:text-lg">
                            {point.title}
                        </h3>

                        <p className="break-words font-body text-[11px] leading-relaxed text-[#615b55] sm:text-base">
                            {point.description}
                        </p>
                    </div>
                ))}

            </div>
        </section>
    );
}
