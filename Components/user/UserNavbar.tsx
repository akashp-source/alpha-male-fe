
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function UserNavbar() {
    const pathname = usePathname();

    const isLogin = pathname === "/user/login";
    const isAuthPage = isLogin || pathname === "/user/register";

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(window.localStorage.getItem("token"));
    }, []);

    return (
        <header className="relative z-20 w-full border-b border-[#e8ebef] bg-white">
            <nav className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#07152e] text-white">
                        <Image
                            src="/images/logo.png"
                            alt="Alpha Male"
                            width={52}
                            height={52}
                            priority
                            className="h-12 w-12 object-contain md:h-14 md:w-14"
                        />
                    </div>

                    <span className="font-heading text-sm font-bold tracking-[0.12em] text-[#07152e]">
                        ALPHA MALE
                    </span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {isAuthPage && (
                        <>
                            <span className="hidden text-xs text-[#91857b] sm:block">
                                {isLogin
                                    ? "New to Alpha Male?"
                                    : "Already have an account?"}
                            </span>

                            <Link
                                href={isLogin ? "/user/register" : "/user/login"}
                                className="rounded-lg border border-[#07152e] px-4 py-2.5 text-xs font-semibold text-[#07152e] transition hover:bg-[#07152e] hover:text-white"
                            >
                                {isLogin ? "Create account" : "Log in"}
                            </Link>
                        </>
                    )}
                    {
                        token && (
                            <>
                                <Link href="/user/orders" className="rounded-lg border border-[#07152e] px-4 py-2.5 text-xs font-semibold text-[#07152e] transition hover:bg-[#07152e] hover:text-white">My Orders</Link>
                            </>
                        )
                    }

                    {/* Icon-only on phones, icon + text from sm up */}
                    <Link
                        href="/home"
                        aria-label="Back to store"
                        className="flex h-10 w-10 items-center justify-center gap-1.5 rounded-full border border-[#dce2ea] text-xs font-medium text-[#07152e] transition hover:bg-[#f5f7fa] sm:h-auto sm:w-auto sm:rounded-none sm:border-0 sm:text-[#526078] sm:hover:bg-transparent sm:hover:text-[#07152e]"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        <span className="hidden sm:inline">Back to store</span>
                    </Link>
                </div>
            </nav>
        </header>
    );
}
