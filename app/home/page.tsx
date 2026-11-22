import HomePage from "@/Components/Home/Homepage";
import GuestSignupPopup from "@/Components/user/GuestSignupPopup";
import AgeVerificationPopup from "@/Components/user/AgeVerificationPopup";

export default function Home() {
    return (
        <>
            <GuestSignupPopup />
            <HomePage />
            <AgeVerificationPopup />
        </>
    )
}
