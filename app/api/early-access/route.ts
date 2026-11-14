import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EarlyAccess from "@/models/EarlyAccess";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const name = body.name?.trim();
        const email = body.email?.trim().toLowerCase();
        const phone = body.phone?.trim();

        if (!name || !email || !phone) {
            return NextResponse.json(
                { success: false, message: "All fields are required." },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        const phoneRegex = /^\+?[0-9\s()-]{7,20}$/;

        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid email address." },
                { status: 400 }
            );
        }

        if (!phoneRegex.test(phone) || phone.replace(/\D/g, "").length < 7) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid phone number." },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if email already exists
        const existingEmail = await EarlyAccess.findOne({ email });

        if (existingEmail) {
            return NextResponse.json(
                { success: false, message: "This email is already registered for early access." },
                { status: 409 }
            );
        }

        // Check if phone number already exists
        const existingPhone = await EarlyAccess.findOne({ phone });

        if (existingPhone) {
            return NextResponse.json(
                { success: false, message: "This phone number is already registered for early access." },
                { status: 409 }
            );
        }

        await EarlyAccess.create({ name, email, phone });

        return NextResponse.json(
            {
                success: true,
                message: "Your early access registration is confirmed!",
            },
            { status: 201 }
        );
    } catch (error) {
        // Handle duplicate key errors (MongoDB code 11000)
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This email or phone number is already registered.",
                },
                { status: 409 }
            );
        }

        console.error("Early access error:", error);

        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}