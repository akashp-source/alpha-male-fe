"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/Components/Home/NavBar";
import UserNavbar from "@/Components/user/UserNavbar";

/**
 * Header for /user/* pages. Account pages use the main site header (shop
 * links, cart, mobile menu); login and register keep the slim auth header.
 */
export default function AccountHeader() {
    const pathname = usePathname();
    const isAuthPage = pathname === "/user/login" || pathname === "/user/register";

    return isAuthPage ? <UserNavbar /> : <Navbar />;
}
