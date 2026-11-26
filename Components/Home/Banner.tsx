import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Text-free product line-up (1453 × 897). Shown whole - never cropped or
// covered - on every screen size; the text sits beside it (desktop) or
// below it (mobile) on a navy that matches the photo's own background.
const BANNER = { src: "/images/banner/alpha-male-banner2.webp", width: 1453, height: 897 };

export default function HeroBanner() {
    return (
        <section className="relative isolate w-full overflow-hidden bg-[linear-gradient(180deg,#111e2e_0%,#1c2e42_55%,#212E49_100%)] text-white">
            <div className="mx-auto grid max-w-[1450px] items-center lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-6 lg:px-12 lg:py-10 xl:px-16">
                {/* Image: full width on mobile (top), right column on desktop */}
                <div className="relative order-1 lg:order-2">
                    <Image
                        src={BANNER.src}
                        alt="The Alpha Male range: Bold, Boss, Icon, Legend, Shilajit and Caffeine strips, Long Play and Bare condoms, and delay spray"
                        width={BANNER.width}
                        height={BANNER.height}
                        priority
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        // Soft edges so the photo melts into the navy background.
                        className="h-auto w-full [mask-image:linear-gradient(to_bottom,black_82%,transparent)] lg:rounded-2xl lg:[mask-image:linear-gradient(to_right,transparent,black_10%,black_92%,transparent)]"
                    />
                </div>

                {/* Text: below the image on mobile, left column on desktop */}
                <div className="order-2 px-6 pb-10 pt-2 sm:px-10 sm:pb-12 lg:order-1 lg:px-0 lg:py-0">
                    {/* <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.24em] text-olympus sm:mb-4 sm:text-sm sm:tracking-[0.3em]">
                        Drive · Stamina · Energy
                    </p> */}
                    <Image
                        src="/images/logo-cropped.png"
                        alt="Alpha Male"
                        width={140}
                        height={140}
                        priority
                        sizes="(min-width: 1024px) 128px, 96px"
                        className="mb-4 h-24 w-24 object-contain sm:mb-5 lg:h-32 lg:w-32"
                    />
                    <h1 className="font-heading text-[34px] font-semibold uppercase leading-[1.08] tracking-wide text-white sm:text-5xl lg:text-[52px] xl:text-[58px]">
                        Performance Strips
                    </h1>
                    <p className="mt-3 font-heading text-xl text-pale-gray sm:mt-4 sm:text-2xl">
                        Single Melt
                    </p>
                    <Link
                        href="/products"
                        className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border border-white/80 px-5 py-3 font-body text-sm font-semibold text-white transition hover:bg-white hover:text-brand-navy sm:mt-8 sm:px-7"
                    >
                        Explore the range <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
