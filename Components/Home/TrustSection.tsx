
import Image from "next/image";
import {
    FlaskConical,
    Box,
    ShieldCheck,
    MessageSquareText,
} from "lucide-react";

const trustFeatures = [
    {
        icon: FlaskConical,
        title: "SCIENCE BACKED",
        subtitle: "FORMULAS",
    },
    {
        icon: Box,
        title: "DISCREET PACKAGING",
        subtitle: "",
    },
    {
        icon: ShieldCheck,
        title: "LICENSED MANUFACTURING",
        subtitle: "",
    },
    {
        icon: MessageSquareText,
        title: "CONSULTATION WITH",
        subtitle: "EXPERT GUIDANCE",
    },
];

export default function TrustSection() {
    return (
        <section className="relative overflow-hidden bg-[#101a30] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">

            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#101a30] via-[#18243c] to-[#101a30]" />

            <div className="relative mx-auto max-w-[1068px]">

                {/* Certification Content */}
                <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center sm:gap-10 lg:gap-14">

                    {/* WHO GMP Image */}
                    <div className="relative flex w-full shrink-0 items-center justify-center sm:w-[190px] lg:w-[215px]">
                        <Image
                            src="/images/whogmp.png"
                            alt="WHO-GMP Certification"
                            width={220}
                            height={220}
                            className="h-auto w-[150px] object-contain sm:w-[175px] lg:w-[210px]"
                        />
                    </div>

                    {/* Certification Text */}
                    <div className="flex-1 text-center sm:text-left">

                        <p className="mb-3 font-body text-xs font-medium uppercase tracking-[0.35em] text-[#aab2c2]">
                            OUR STANDARD
                        </p>

                        <h2 className="font-heading text-2xl font-semibold tracking-wide text-[#e0dfdc] sm:text-3xl lg:text-[32px]">
                            WHO-GMP CERTIFIED
                        </h2>

                        <p className="mt-4 max-w-[680px] font-body text-sm leading-7 text-[#c4c9d3] sm:text-base sm:leading-8">
                            Every Alpha Male product is made in our own
                            licensed facility, certified to WHO Good
                            Manufacturing Practice standards.
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-10 h-px w-full bg-white/10 sm:my-12" />

                {/* Trust Features */}
                <div className="grid grid-cols-2 gap-y-9 sm:grid-cols-4 sm:gap-4">

                    {trustFeatures.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={index}
                                className="group flex flex-col items-center justify-center gap-3 text-center"
                            >
                                <Icon
                                    size={32}
                                    strokeWidth={1.5}
                                    className="text-[#d0d3dc] transition-all duration-300 group-hover:-translate-y-1 group-hover:text-[#d6b47e]"
                                />

                                <div className="font-body text-xs font-bold leading-5 tracking-[0.08em] text-[#b9c0ce] transition-colors group-hover:text-white sm:tracking-[0.1em]">
                                    <p>{feature.title}</p>
                                    {feature.subtitle && (
                                        <p>{feature.subtitle}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Divider */}
                <div className="mt-9 h-px w-full bg-white/10 sm:mt-10" />

            </div>
        </section>
    );
}
