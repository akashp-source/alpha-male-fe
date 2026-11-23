
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Package,
    MapPin,
    ShieldCheck,
    Headset,
    LogOut,
} from "lucide-react";

interface AccountSidebarProps {
    name?: string;
    email?: string;
    orderCount?: number;
    privacyNote?: string;
}

/**
 * Account navigation.
 *
 * - lg and up: the sidebar card (profile summary, menu, log out, privacy note).
 * - Below lg: the <aside> uses `display: contents`, so its parts become items of
 *   the page's grid. A compact tab row is placed first (right under the page
 *   heading) and the privacy note + "Log out" are placed last (bottom of the
 *   page), so the page content starts on the first screen.
 *
 * Every page that uses this renders it as a direct child of a `grid` container.
 */
export default function AccountSidebar({
    name = "Customer",
    email = "",
    orderCount,
    privacyNote = "Every order ships in plain packaging with private billing.",
}: AccountSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/user/login");
    };

    const links = [
        {
            label: "Profile & security",
            shortLabel: "Profile",
            href: "/user/profile",
            icon: ShieldCheck,
        },
        {
            label: "My orders",
            shortLabel: "Orders",
            href: "/user/orders",
            icon: Package,
            count: orderCount,
        },
        {
            label: "Saved addresses",
            shortLabel: "Addresses",
            href: "/user/addresses",
            icon: MapPin,
        },
        {
            label: "Help & support",
            shortLabel: "Help",
            href: "/user/support",
            icon: Headset,
        },
    ];

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    const initials =
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "U";

    const logoutButton = (
        <button
            type="button"
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
            <LogOut size={17} aria-hidden="true" />
            Log out
        </button>
    );

    const privacyCard = (
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[#d5dce7] bg-white p-4">
            <ShieldCheck
                size={18}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-[#07152e]"
            />
            <p className="text-xs leading-5 text-[#526078]">{privacyNote}</p>
        </div>
    );

    return (
        <aside className="contents lg:block lg:w-[290px] lg:shrink-0">
            {/* ---------- Mobile / tablet: tab row under the heading ---------- */}
            <nav
                aria-label="Account"
                className="no-scrollbar order-first -mx-4 min-w-0 overflow-x-auto overscroll-x-contain px-4 py-1 sm:-mx-6 sm:px-6 lg:hidden"
            >
                {/* Tabs share the row evenly when they fit; on very narrow
                    screens the row swipes sideways (scrollbar hidden). */}
                <ul className="flex w-max min-w-full gap-2">
                    {links.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <li key={link.href} className="flex-1">
                                <Link
                                    href={link.href}
                                    aria-current={active ? "page" : undefined}
                                    className={`flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#07152e] focus-visible:ring-offset-2 ${active
                                        ? "border-[#07152e] bg-[#07152e] text-white"
                                        : "border-[#dce2ea] bg-white text-[#07152e] hover:bg-[#f5f7fa]"
                                        }`}
                                >
                                    {link.shortLabel}
                                    {link.count !== undefined && (
                                        <span
                                            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${active ? "bg-white text-[#07152e]" : "bg-[#07152e] text-white"}`}
                                        >
                                            {link.count}
                                            <span className="sr-only"> orders</span>
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* ---------- Mobile / tablet: privacy note + log out at the bottom ---------- */}
            <div className="order-last space-y-3 lg:hidden">
                {privacyCard}
                <div className="rounded-[20px] border border-[#e4e8ef] bg-white p-2">
                    {logoutButton}
                </div>
            </div>

            {/* ---------- Desktop sidebar ---------- */}
            <div className="hidden lg:block">
                <div className="rounded-[24px] bg-[#07152e] p-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#07152e]">
                            {initials}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{name}</p>
                            <p className="mt-0.5 truncate text-xs text-white/75">
                                {email}
                            </p>
                        </div>
                    </div>
                </div>

                <nav aria-label="Account" className="mt-4 rounded-[24px] border border-[#e4e8ef] bg-white p-2">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? "page" : undefined}
                                className={`mb-1 flex items-center justify-between rounded-xl px-3.5 py-3 text-sm transition last:mb-0 ${active
                                    ? "bg-[#e9edf3] font-bold text-[#07152e]"
                                    : "text-[#344054] hover:bg-[#f5f7fa]"
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    <Icon size={17} aria-hidden="true" />
                                    {link.label}
                                </span>

                                {link.count !== undefined && (
                                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#07152e] px-1.5 text-xs font-bold text-white">
                                        {link.count}
                                        <span className="sr-only"> orders</span>
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {logoutButton}
                </nav>

                <div className="mt-4">{privacyCard}</div>
            </div>
        </aside>
    );
}
