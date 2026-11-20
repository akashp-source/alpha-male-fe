
interface HowToUseStep {
    title: string;
    description: string;
    image?: string;
}

interface ProductHowItWorksProps {
    title?: string;
    description: string;
    steps?: HowToUseStep[];
}

export default function ProductHowItWorks({
    title = "How it works",
    description,
    steps = [],
}: ProductHowItWorksProps) {
    if (!steps.length) return null;

    return (
        <section className="pdp-section pdp-section-end-tight w-full">
            <div className="pdp-container">
                <div className="grid grid-cols-1 items-center gap-6 rounded-[28px] bg-[#101c36] px-5 py-7 text-white sm:px-8 sm:py-10 lg:grid-cols-2 lg:gap-14 lg:px-14 lg:py-14">

                    {/* Left content */}
                    <div>
                        <h2 className="mb-4 font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
                            {title}
                        </h2>
                        {/* 
                    <p className="max-w-[580px] font-body text-base leading-[1.65] text-[#c3cbd9] sm:text-lg">
                        {description}
                    </p> */}
                    </div>

                    {/* Right steps */}
                    <div className="flex flex-col gap-3">
                        {steps.map((step, index) => (
                            <div
                                key={`${step.title}-${index}`}
                                className="flex min-h-[90px] items-center gap-4 rounded-[20px] bg-[#202c45] px-4 py-4 transition duration-300 hover:bg-[#293751] sm:gap-5 sm:px-5"
                            >
                                {/* Number */}
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#315bd5] font-body text-lg font-bold text-white sm:h-14 sm:w-14 sm:text-xl">
                                    {index + 1}
                                </div>

                                {/* Step text */}
                                <p className="font-body text-sm font-medium leading-relaxed text-white sm:text-base">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
