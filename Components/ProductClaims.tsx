
import {
    Zap,
    Clock,
    FlaskConical,
    DropletOff,
    Package,
    ShieldCheck,
} from "lucide-react";

interface ProductClaim {
    title: string;
    description: string;
    image?: string;
}

interface ProductClaimsProps {
    claims?: ProductClaim[];
    heading?: string;
}

const defaultIcons = [
    Zap,
    Clock,
    FlaskConical,
    DropletOff,
    Package,
    ShieldCheck,
];

export default function ProductClaims({
    claims = [],
    heading = "The Bold S Promise",
}: ProductClaimsProps) {
    if (!claims.length) return null;

    return (
        <section className="pdp-section w-full bg-[#f5f1e9]">
            <div className="pdp-container">

                {/* Heading */}
                <div className="mb-8 flex min-w-0 items-center justify-center gap-3 sm:mb-10 sm:gap-5">
                    <div className="hidden h-px flex-1 bg-[#dcd8ce] sm:block" />

                    <h2 className="text-center font-heading text-lg font-bold capitalize tracking-wide text-[#10443f] sm:whitespace-nowrap sm:text-2xl lg:text-3xl">
                        {heading}
                    </h2>

                    <div className="hidden h-px flex-1 bg-[#dcd8ce] sm:block" />
                </div>

                {/* Claims */}
                <div className="grid grid-cols-2 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
                    {claims.map((claim, index) => {
                        const Icon =
                            defaultIcons[index % defaultIcons.length];

                        return (
                            <div
                                key={`${claim.title}-${index}`}
                                className={`group flex min-w-0 flex-col items-center px-2 text-center ${claims.length % 2 === 1 && index === claims.length - 1 ? "col-span-2 mx-auto w-1/2 sm:col-span-1 sm:w-auto" : ""} lg:border-r lg:border-[#dedbd2] lg:last:border-r-0`}
                            >
                                {/* Icon */}
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#07162f] transition-transform duration-300 group-hover:scale-110">
                                    {claim.image ? (
                                        <img
                                            src={claim.image}
                                            alt=""
                                            className="h-6 w-6 object-contain"
                                        />
                                    ) : (
                                        <Icon
                                            size={21}
                                            strokeWidth={1.7}
                                            className="text-[#c5df50]"
                                        />
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="mb-2 font-body text-xs font-bold leading-snug text-[#103e3a] sm:text-sm">
                                    {claim.title}
                                </h3>

                                {/* Description */}
                                <p className="max-w-[190px] font-body text-[11px] leading-relaxed text-[#71817e] sm:text-xs">
                                    {claim.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
