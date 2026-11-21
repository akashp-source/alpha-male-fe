import type { Metadata } from "next";
import PaymentSuccessClient from "./PaymentSuccessClient";

export const metadata: Metadata = {
    title: "Payment successful | Alpha Male",
};

export default async function PaymentSuccessPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <PaymentSuccessClient paymentId={id} />;
}
