
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    UserRound,
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
            href: "/user/profile",
            icon: ShieldCheck,
        },
        {
            label: "My orders",
            href: "/user/orders",
            icon: Package,
            count: orderCount,
        },
        {
            label: "Saved addresses",
            href: "/user/addresses",
            icon: MapPin,
        },
        {
            label: "Help & support",
            href: "/user/support",
            icon: Headset,
        },
    ];

    return (
        <aside className="w-full lg:w-[290px] lg:shrink-0">
            <div className="rounded-[24px] bg-[#07152e] p-5 text-white">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#07152e]">
                        {name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase())
                            .join("") || "U"}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{name}</p>
                        <p className="mt-0.5 truncate text-xs text-white/65">
                            {email}
                        </p>
                    </div>
                </div>
            </div>

            <nav className="mt-4 rounded-[24px] border border-[#e4e8ef] bg-white p-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const active =
                        pathname === link.href ||
                        (link.href.includes("#") &&
                            pathname === link.href.split("#")[0]);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`mb-1 flex items-center justify-between rounded-xl px-3.5 py-3 text-sm transition last:mb-0 ${active
                                ? "bg-[#e9edf3] font-bold text-[#07152e]"
                                : "text-[#344054] hover:bg-[#f5f7fa]"
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <Icon size={17} />
                                {link.label}
                            </span>

                            {link.label === "My orders" && orderCount !== undefined && (
                                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#07152e] px-1.5 text-[10px] font-bold text-white">
                                    {orderCount}
                                </span>
                            )}
                        </Link>
                    );
                })}

                <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 cursor-pointer"
                >
                    <LogOut size={17} />
                    Log out
                </button>
            </nav>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-[#d5dce7] bg-white p-4">
                <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-[#07152e]"
                />
                <p className="text-xs leading-5 text-[#526078]">{privacyNote}</p>
            </div>
        </aside>
    );
}
