
import UserNavbar from "@/Components/user/UserNavbar";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            <UserNavbar />
            {children}
        </div>
    );
}
