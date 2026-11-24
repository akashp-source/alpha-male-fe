
import {
    Layers2,
    Heart,
    Leaf,
} from "lucide-react";

const products = [
    {
        icon: Layers2,
        title: "ORAL STRIPS",
        subtitle: "BUILT FOR PERFORMANCE. MADE TO LAST.",
        description:
            "Alpha Bold, Alpha Boss, Alpha Legend and Alpha Icon - fast-dissolving strips for peak performance and lasting confidence, when it matters most. No water needed.",
        tag: "COMING SOON",
    },
    {
        icon: Heart,
        title: "INTIMACY CARE",
        subtitle: "",
        description:
            "Bare Ultra Thin and Long Play condoms, delay spray and water-based lubricants.",
        tag: "COMING SOON",
    },
    {
        icon: Leaf,
        title: "DAILY WELLNESS",
        subtitle: "",
        description:
            "Ashwagandha, Shilajit, Biotin & Zinc and Caffeine - everyday support for energy and focus.",
        tag: "COMING SOON",
    },
];

export default function ProductRange() {
    return (
        <section
            className="relative w-full overflow-hidden  px-5 py-20 text-olympus sm:px-10 sm:py-24"
        >
            {/* Decorative Side Borders */}
            <div className="pointer-events-none absolute inset-y-0 left-4 border-l border-olympus/[0.07] sm:left-6" />
            <div className="pointer-events-none absolute inset-y-0 right-4 border-r border-olympus/[0.07] sm:right-6" />

            <div className="relative mx-auto max-w-[920px]">

                {/* Section Heading */}
                <div className="mb-10 text-center sm:mb-12">
                    <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.4em] text-[#9FA6B5]">
                        THE RANGE
                    </p>

                    <h2 className="silver-text font-heading text-[clamp(32px,5vw,42px)] font-semibold uppercase leading-tight tracking-[0.04em]">
                        What&apos;s Coming
                    </h2>
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {products.map((product) => {
                        const Icon = product.icon;

                        return (
                            <article
                                key={product.title}
                                className="group flex min-h-[300px] flex-col border border-olympus/[0.12] bg-white/[0.025] px-6 py-8 transition-all duration-300 hover:border-olympus/30 hover:bg-white/[0.045] sm:px-7 sm:py-9"
                            >

                                {/* Icon */}
                                <div className="mb-5">
                                    <Icon
                                        size={21}
                                        strokeWidth={1.7}
                                        className="text-olympus transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>

                                {/* Product Title */}
                                <h3 className="mb-4 font-body text-[19px] font-semibold uppercase tracking-[0.035em] text-[#E1E1E3]">
                                    {product.title}
                                </h3>

                                {/* Subtitle */}
                                {product.subtitle && (
                                    <p className="mb-3 font-serif text-[12px] font-semibold uppercase leading-[1.5] tracking-[0.035em] text-olympus">
                                        {product.subtitle}
                                    </p>
                                )}

                                {/* Description */}
                                <p className="text-[13px] font-light leading-[1.8] text-palladium">
                                    {product.description}
                                </p>

                                {/* Coming Soon */}
                                <p className="mt-5 text-[9px] font-medium uppercase tracking-[0.3em] text-[#929BAE]">
                                    {product.tag}
                                </p>

                            </article>
                        );
                    })}

                </div>
            </div>
        </section>
    );
}
