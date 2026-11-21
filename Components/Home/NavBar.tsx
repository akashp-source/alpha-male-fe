
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    ShoppingCart,
    UserRound,
    Menu,
    X,
    LogOut,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CartDrawer from "../Cart/CartDrawer";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Shop", href: "/shop" },
    // { name: "Combos", href: "/shop" },
    { name: "Help", href: "/help" },
];

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check authentication
    const checkAuth = useCallback(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setIsLoggedIn(false);
        setMobileMenuOpen(false);

        router.replace("/user/login");
        router.refresh();
    };

    const fetchCartCount = useCallback(async () => {
        try {
            let guestId = localStorage.getItem("guestId");

            if (!guestId) {
                guestId = `guest_${crypto.randomUUID()}`;
                localStorage.setItem("guestId", guestId);
            }

            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URL}/cart`, {
                method: "GET",
                headers: {
                    "x-guest-id": guestId,
                    ...(token
                        ? { Authorization: `Bearer ${token}` }
                        : {}),
                },
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error("Unable to fetch cart");
            }

            const data = await response.json();

            const totalItems = (data?.items || []).reduce(
                (total: number, item: { quantity?: number }) =>
                    total + (item.quantity || 0),
                0
            );

            setCartCount(totalItems);
        } catch (error) {
            console.error("Cart count error:", error);
        }
    }, []);

    // Initial authentication and cart check
    useEffect(() => {
        checkAuth();
        fetchCartCount();
    }, [checkAuth, fetchCartCount]);

    // Refresh authentication when login/logout happens
    useEffect(() => {
        const handleAuthChange = () => checkAuth();

        window.addEventListener("auth-updated", handleAuthChange);
        window.addEventListener("storage", handleAuthChange);

        return () => {
            window.removeEventListener("auth-updated", handleAuthChange);
            window.removeEventListener("storage", handleAuthChange);
        };
    }, [checkAuth]);

    // Refresh cart
    useEffect(() => {
        const handleCartUpdated = () => fetchCartCount();

        window.addEventListener("cart-updated", handleCartUpdated);

        return () => {
            window.removeEventListener("cart-updated", handleCartUpdated);
        };
    }, [fetchCartCount]);

    // Other pages (e.g. campaign pages) can open the cart drawer.
    useEffect(() => {
        const openCart = () => setIsCartOpen(true);

        window.addEventListener("open-cart", openCart);

        return () => {
            window.removeEventListener("open-cart", openCart);
        };
    }, []);

    return (
        <header className="relative z-50 w-full border-b border-[#eeeeee] bg-white">
            <div className="mx-auto grid h-[76px] w-full max-w-[1800px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-10 md:h-[92px]">

                {/* Logo */}
                <Link href="/" className="flex min-w-0 shrink items-center gap-1.5 justify-self-start sm:gap-2 md:shrink-0 md:gap-3">
                    <Image
                        src="/images/logo.png"
                        alt="Alpha Male"
                        width={52}
                        height={52}
                        priority
                        className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11 md:h-14 md:w-14"
                    />

                    <span className="truncate font-heading text-[13px] font-semibold tracking-[0.05em] text-[#101d38] sm:text-base sm:tracking-[0.08em] md:text-[27px]">
                        ALPHA MALE
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-5 justify-self-center lg:flex xl:gap-9">
                    {navLinks.map((link) => {
                        const active =
                            link.href === "/"
                                ? pathname === "/"
                                : pathname === link.href ||
                                pathname.startsWith(`${link.href}/`);

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative py-2 font-body text-[17px] font-medium transition-colors ${active
                                    ? "text-[#071630]"
                                    : "text-[#687080] hover:text-[#071630]"
                                    }`}
                            >
                                {link.name}

                                {active && (
                                    <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#071630]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="col-start-2 flex shrink-0 items-center justify-self-end gap-1.5 sm:gap-2 md:gap-3 lg:col-start-3">

                    {/* Account */}
                    {isLoggedIn ? (
                        <div className="hidden items-center gap-2 md:flex">
                            <Link
                                href="/user/profile"
                                aria-label="My account"
                                title="My account"
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e0e5ed] text-[#071630] transition hover:bg-[#f5f7fa] md:h-[54px] md:w-[54px]"
                            >
                                <UserRound size={22} strokeWidth={1.8} />
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="hidden items-center gap-2 rounded-full border border-[#e0e5ed] px-4 py-3 text-sm font-semibold text-[#071630] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:flex"
                            >
                                <LogOut size={17} />
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/user/login"
                            aria-label="Sign in"
                            title="Sign in"
                            className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#e0e5ed] text-[#071630] transition hover:bg-[#f5f7fa] md:flex md:h-[54px] md:w-[54px]"
                        >
                            <UserRound size={22} strokeWidth={1.8} />
                        </Link>
                    )}

                    {/* Cart */}
                    <button
                        type="button"
                        onClick={() => {
                            setIsCartOpen(true);
                            fetchCartCount();
                        }}
                        className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#071630] px-2.5 text-white transition hover:bg-[#176348] sm:h-11 sm:gap-2 sm:px-3 md:h-[55px] md:gap-3 md:px-6"
                    >
                        <ShoppingCart size={21} strokeWidth={1.8} />

                        <span className="hidden font-body text-sm font-semibold md:inline md:text-base">
                            Cart
                        </span>

                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#071630] md:h-6 md:min-w-6 md:px-1.5 md:text-xs">
                            {cartCount}
                        </span>
                    </button>

                    {/* Mobile Menu */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle navigation"
                        className="flex h-10 w-10 items-center justify-center text-[#071630] lg:hidden"
                    >
                        {mobileMenuOpen ? (
                            <X size={25} />
                        ) : (
                            <Menu size={25} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <nav className="border-t border-gray-100 bg-white px-6 py-4 shadow-lg lg:hidden">
                    <div className="flex flex-col">
                        {navLinks.map((link) => {
                            const active =
                                link.href === "/"
                                    ? pathname === "/"
                                    : pathname === link.href ||
                                    pathname.startsWith(`${link.href}/`);

                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`border-b border-gray-100 py-4 font-body text-sm font-semibold ${active
                                        ? "text-[#176348]"
                                        : "text-[#273449]"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}

                        {/* Mobile Account Actions */}
                        {isLoggedIn ? (
                            <>
                                <Link
                                    href="/user/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="border-b border-gray-100 py-4 text-sm font-semibold text-[#273449]"
                                >
                                    My Account
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 py-4 text-left text-sm font-semibold text-red-600"
                                >
                                    <LogOut size={17} />
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/user/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="border-b border-gray-100 py-4 text-sm font-semibold text-[#176348]"
                            >
                                Sign in / Register
                            </Link>
                        )}
                    </div>
                </nav>
            )}

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onCheckout={() => {
                    setIsCartOpen(false);
                    router.push("/checkout");
                }}
            />
        </header>
    );
}
