
const principles = [
    {
        number: "01",
        title: "DISSOLVES IN SECONDS",
        description:
            "Place a strip on your tongue. No water, no swallowing tablets.",
    },
    {
        number: "02",
        title: "WALLET-THIN, DISCREET",
        description:
            "Slim sealed pouches that slip into a wallet or pocket - no rattling bottles.",
    },
    {
        number: "03",
        title: "PRECISELY MADE",
        description:
            "Every strip produced in our own WHO-GMP certified, licensed facility.",
    },
    {
        number: "04",
        title: "PERSONALLY GUIDED",
        description:
            "A private consultation with every order, so the right product reaches the right man.",
    },
];

export default function BrandPhilosophy() {
    return (
        <section className="relative w-full overflow-hidden text-olympus ">

            {/* Decorative Border */}
            <div className="pointer-events-none absolute inset-x-4 top-0 bottom-0 border-x hidden sm:block border-olympus/[0.08] sm:inset-x-6" />

            <div className="relative mx-auto max-w-[920px]">

                {/* Section Heading */}
                <div className="mx-auto mb-12 max-w-[620px] text-center sm:mb-14">

                    <h2 className="silver-text mb-5  text-[clamp(32px,5vw,48px)] font-heading font-semibold uppercase leading-[1.2] tracking-[0.035em]">
                        Strength Isn&apos;t Loud.
                        <br />
                        It&apos;s Certain.
                    </h2>

                    <p className="mx-auto max-w-[550px] text-[13px] font-light leading-[1.9] text-[#B0B7C5] sm:text-[14px]">
                        Men&apos;s wellness in India has been whispered about, sold in
                        shady corners and wrapped in embarrassment. We&apos;re changing
                        that - with formulas you can trust, a format you&apos;ll
                        actually use, and an experience built on respect.
                    </p>

                </div>

                {/* Four Principles */}
                <div className="grid grid-cols-1 border border-olympus/[0.12] sm:grid-cols-2 lg:grid-cols-4">

                    {principles.map((item, index) => (
                        <div
                            key={item.number}
                            className={`group min-h-[190px] px-6 py-7 transition-colors duration-300 font-heading hover:bg-white/[0.025] sm:px-6 sm:py-7 ${index !== 0
                                ? "border-t border-olympus/[0.10] sm:border-t-0"
                                : ""
                                } ${index % 2 !== 0
                                    ? "sm:border-l sm:border-olympus/[0.10]"
                                    : ""
                                } ${index > 1
                                    ? "lg:border-t-0"
                                    : ""
                                } ${index !== 0 && index !== 2
                                    ? "lg:border-l lg:border-olympus/[0.10]"
                                    : ""
                                }`}
                        >

                            {/* Number */}
                            <span className="mb-3 block font-heading text-[35px] leading-none text-[#E0E0E2]">
                                {item.number}
                            </span>

                            {/* Title */}
                            <h3 className="mb-3 font-body text-[15px] font-semibold uppercase leading-[1.45] tracking-[0.035em] text-[#E5E5E7]">
                                {item.title}
                            </h3>

                            {/* Description */}
                            <p className="m-0 w-full max-w-none text-[12px] font-body leading-[1.75] text-palladium sm:max-w-[220px]">
                                {item.description}
                            </p>

                        </div>
                    ))}

                </div>

            </div>
        </section>
    );
}
