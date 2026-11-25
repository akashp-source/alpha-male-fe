"use client";

import { useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
    fetchDeliveryEstimate,
    PINCODE_PATTERN,
    type DeliveryEstimate,
} from "@/lib/delivery";

type State =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "done"; estimate: DeliveryEstimate }
    | { status: "error"; message: string };

/** "Check delivery date": pincode → serviceable / estimated delivery. */
export default function DeliveryCheck() {
    const [pincode, setPincode] = useState("");
    const [state, setState] = useState<State>({ status: "idle" });
    const controllerRef = useRef<AbortController | null>(null);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const value = pincode.trim();
        if (!PINCODE_PATTERN.test(value)) {
            setState({ status: "error", message: "Enter a valid 6-digit pincode." });
            return;
        }

        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        setState({ status: "loading" });
        try {
            const estimate = await fetchDeliveryEstimate(value, controller.signal);
            setState({ status: "done", estimate });
        } catch (error) {
            if (controller.signal.aborted) return;
            setState({
                status: "error",
                message: error instanceof Error ? error.message : "We couldn't check delivery right now.",
            });
        }
    };

    const result = () => {
        if (state.status === "error") {
            return <p role="alert" className="font-body text-xs text-red-600">{state.message}</p>;
        }
        if (state.status !== "done") return null;

        const { estimate } = state;
        if (!estimate.serviceable) {
            return (
                <p className="font-body text-xs text-brand-navy">
                    Sorry, we don&apos;t deliver to {estimate.pincode} yet.
                </p>
            );
        }

        const when = estimate.etd
            ? `Delivery by ${estimate.etd}`
            : estimate.estimatedDays
                ? `Delivery in about ${estimate.estimatedDays} ${estimate.estimatedDays === 1 ? "day" : "days"}`
                : "We deliver to this pincode";

        return (
            <p className="font-body text-xs text-brand-navy">
                <span className="font-semibold text-success-green">{when}</span>
                {" "}to {estimate.pincode}
                {estimate.codAvailable ? " · Cash on delivery available" : " · Prepaid only"}
            </p>
        );
    };

    return (
        <div className="mt-4">
            <label htmlFor="delivery-pincode" className="font-body text-xs font-semibold text-brand-navy">
                Check delivery date
            </label>

            <form onSubmit={submit} className="mt-2 flex gap-2">
                <input
                    id="delivery-pincode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    placeholder="Enter 6-digit pincode"
                    value={pincode}
                    onChange={(event) => {
                        setPincode(event.target.value.replace(/\D/g, ""));
                        if (state.status !== "loading") setState({ status: "idle" });
                    }}
                    className="h-11 min-w-0 flex-1 rounded-lg border border-olympus bg-white px-3 font-body text-sm text-brand-navy placeholder:text-brand-navy-muted focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                />
                <button
                    type="submit"
                    disabled={state.status === "loading"}
                    className="flex h-11 min-w-[84px] items-center justify-center rounded-lg border border-brand-navy bg-white px-4 font-body text-sm font-semibold text-brand-navy transition hover:bg-pale-gray disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {state.status === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Check"}
                </button>
            </form>

            <div className="mt-2 min-h-4" aria-live="polite">
                {result()}
            </div>
        </div>
    );
}
