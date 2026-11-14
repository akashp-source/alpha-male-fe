
import Image from "next/image";
import Link from "next/link";

export default function HeroBanner() {
    return (
        <section className="w-full overflow-hidden bg-[#06152f]">
            <Link
                href="/products"
                aria-label="Explore Alpha Male products"
                className="relative block w-full"
            >
                {/* Desktop Banner */}
                <div className="relative hidden aspect-[5/2] w-full sm:block">
                    <Image
                        src="/images/banner/alpha-male-banner.png"
                        alt="Alpha Male Performance Strips - Bold, Boss, Legend and Icon"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                </div>

                {/* Mobile Banner */}
                <div className="relative block aspect-[4/2] w-full sm:hidden ">
                    <Image
                        src="/images/banner/alpha-male-banner.png"
                        alt="Alpha Male Performance Strips"
                        fill
                        priority
                        sizes="100vw"
                        className="object-contain object-center"
                    />
                </div>
            </Link>
        </section>
    );
}
