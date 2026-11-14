import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = body.email?.trim().toLowerCase();

        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required." },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid email address." },
                { status: 400 }
            );
        }

        await connectDB();

        const existingSubscription = await Subscription.findOne({ email });

        if (existingSubscription) {
            return NextResponse.json(
                { success: false, message: "This email is already subscribed." },
                { status: 409 }
            );
        }

        await Subscription.create({ email });

        return NextResponse.json(
            {
                success: true,
                message: "Thank you! You're on our launch notification list.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Subscription error:", error);

        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}