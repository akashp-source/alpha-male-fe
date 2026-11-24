
import Link from "next/link";

export default function FooterPage() {
    return (
        <footer className="relative border-t border-olympus/10 px-5 py-8 sm:px-8 sm:py-8 lg:px-[72px]">
            <div className="mx-auto flex max-w-[880px] flex-col gap-5">

                {/* Policy Links */}
                <nav
                    aria-label="Footer navigation"
                    className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs text-palladium sm:text-sm sm:justify-start"
                >
                    <Link href="/" className="transition hover:text-white">
                        Home
                    </Link>
                    <Link href="/policies/privacy" className="transition hover:text-white">
                        Privacy Policy
                    </Link>

                    <Link href="/policies/terms" className="transition hover:text-white">
                        Terms & Conditions
                    </Link>

                    <Link href="/policies/shipping" className="transition hover:text-white">
                        Shipping & Delivery Policy
                    </Link>

                    <Link href="/policies/returns" className="transition hover:text-white">
                        Return & Refund Policy
                    </Link>

                    <Link href="/policies/cancellation" className="transition hover:text-white">
                        Cancellation Policy
                    </Link>

                    <Link href="/policies/it-policy" className="transition hover:text-white">
                        IT Policy
                    </Link>

                    <a
                        href="mailto:info@alphamale.co.in"
                        className="transition hover:text-white"
                    >
                        info@alphamale.co.in
                    </a>
                </nav>

                {/* Copyright and Age Restriction */}
                <div className="flex flex-col items-center justify-between gap-4 border-t border-olympus/10 pt-5 text-center sm:flex-row sm:text-left">

                    <p className="m-0 text-xs tracking-[0.04em] text-[#858E9E]">
                        © 2026 Alpha Male. All rights reserved.
                    </p>

                    <p className="m-0 flex items-center gap-2 text-xs tracking-[0.04em] text-[#858E9E]">
                        <strong className="border border-olympus/30 px-2 py-1 text-olympus">
                            18+
                        </strong>
                        For adults aged 18 and above only.
                    </p>

                </div>
            </div>
        </footer>
    );
}
