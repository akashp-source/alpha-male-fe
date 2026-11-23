
import AccountHeader from "@/Components/user/AccountHeader";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            {/* Main site header (with cart) on account pages; slim header on login/register */}
            <AccountHeader />
            {children}
        </div>
    );
}
