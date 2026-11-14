
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ShoppingBag,
    UserRound,
    Menu,
    X,
} from "lucide-react";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/products" },
        { name: "About", href: "/about" },
    ];

    return (
        <header className="relative z-50 w-full border-b border-[#eee9e3] bg-white">

            <nav className="relative mx-auto flex h-[70px] max-w-[1600px] items-center justify-between px-4 sm:h-[76px] sm:px-8 lg:h-[84px] lg:px-12">

                {/* LEFT: Desktop Navigation */}
                <div className="hidden items-center gap-7 md:flex lg:gap-11">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="font-body text-sm font-medium text-[#211b17] transition-colors hover:text-[#176348] lg:text-base"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="flex h-10 w-10 items-center justify-center text-[#211b17] md:hidden"
                    aria-label="Toggle navigation menu"
                >
                    {mobileMenuOpen ? (
                        <X size={24} />
                    ) : (
                        <Menu size={24} />
                    )}
                </button>

                {/* CENTER: Actual Brand Logo */}
                <Link
                    href="/"
                    className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center"
                >
                    <Image
                        src="/images/logo.png"
                        alt="Alpha Male"
                        width={190}
                        height={65}
                        priority
                        className="h-auto max-h-[48px] w-[135px] object-contain sm:w-[160px] sm:max-h-[55px] lg:w-[190px] lg:max-h-[62px]"
                    />
                </Link>

                {/* RIGHT: Cart and Account */}
                <div className="ml-auto flex items-center gap-4 sm:gap-6 lg:gap-8">

                    <Link
                        href="/cart"
                        aria-label="Shopping cart"
                        className="relative flex items-center justify-center text-[#211b17] transition hover:text-[#176348]"
                    >
                        <ShoppingBag size={21} strokeWidth={1.5} />
                    </Link>

                    <Link
                        href="/account"
                        aria-label="My account"
                        className="hidden items-center justify-center text-[#211b17] transition hover:text-[#176348] sm:flex"
                    >
                        <UserRound size={22} strokeWidth={1.5} />
                    </Link>
                </div>
            </nav>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="border-t border-[#eee9e3] bg-white px-6 py-5 md:hidden">
                    <div className="flex flex-col gap-5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-body text-sm font-medium uppercase tracking-wider text-[#211b17] transition hover:text-[#176348]"
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="border-t border-[#eee9e3] pt-4">
                            <Link
                                href="/account"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2 font-body text-sm text-[#211b17]"
                            >
                                <UserRound size={18} />
                                My Account
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
