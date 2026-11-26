import Image from "next/image";
import Link from "next/link";

// Branded 404. Brand navy background, Cinzel heading, Montserrat body.
// Contrast on #212E49: white 13.3:1, palladium 6.2:1.
export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-brand-navy px-6 py-16 text-center font-body text-white">
            <Link href="/" aria-label="Alpha Male home">
                <Image
                    src="https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/7dea7f70-17ce-4059-ae58-1e7da21d2220.webp"
                    alt="Alpha Male"
                    width={150}
                    height={150}
                    priority
                    className="h-[150px] w-[150px] object-contain"
                />
            </Link>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-palladium">
                Error 404
            </p>

            <h1 className="mt-3 font-heading text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl">
                Page not found
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-palladium sm:text-base">
                The page you&apos;re looking for doesn&apos;t exist or has moved.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                    href="/"
                    className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-sm font-semibold text-brand-navy transition hover:bg-pale-gray"
                >
                    Back to Home
                </Link>
                <Link
                    href="/shop"
                    className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-palladium px-8 text-sm font-semibold text-white transition hover:border-white"
                >
                    Shop products
                </Link>
            </div>
        </main>
    );
}
