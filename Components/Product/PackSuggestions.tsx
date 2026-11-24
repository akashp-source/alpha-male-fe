"use client";

import { useEffect, useRef } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { describePlan, type PackPlan, type PackSuggestions } from "@/lib/packSuggestions";

const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const unitName = (suggestions: PackSuggestions) =>
    suggestions.unitLabel.trim() || "units";

/** "pay ₹8 less" / "add just ₹40 more" / "same price". */
function priceDelta(plan: PackPlan) {
    if (plan.savings > 0) return `${formatPrice(plan.savings)} less`;
    if (plan.savings < 0) return `${formatPrice(-plan.savings)} more`;
    return "the same price";
}

interface BoxProps {
    suggestions: PackSuggestions;
    /** e.g. "3 × Classic 3-pack" */
    selectionLabel: string;
    pendingPlan: PackPlan | null;
    disabled: boolean;
    onChoose: (plan: PackPlan) => void;
}

/** On-page "better ways to buy" box under the total. */
export function PackSuggestionsBox({
    suggestions,
    selectionLabel,
    pendingPlan,
    disabled,
    onChoose,
}: BoxProps) {
    const units = unitName(suggestions);
    const { current, exactMatch, bestValue } = suggestions;

    return (
        <section
            aria-labelledby="pack-suggestions-heading"
            className="order-5 mt-2 rounded-xl border border-[#D5D5D7] bg-white p-3 sm:p-3.5"
        >
            <h2
                id="pack-suggestions-heading"
                className="flex items-center gap-1.5 font-body text-sm font-bold text-[#212E49]"
            >
                <Sparkles size={15} aria-hidden="true" />
                Better ways to buy
            </h2>
            <p className="mt-1 font-body text-xs leading-5 text-[#5c534b]">
                {selectionLabel} = {current.units} {units} for {formatPrice(current.total)}.
            </p>

            <ul className="mt-2 space-y-2">
                {exactMatch && (
                    <PlanRow
                        heading={`Want exactly ${exactMatch.units}?`}
                        text={`Buy ${describePlan(exactMatch)} for ${formatPrice(exactMatch.total)} and save ${formatPrice(exactMatch.savings)}.`}
                        plan={exactMatch}
                        pending={pendingPlan === exactMatch}
                        disabled={disabled}
                        onChoose={onChoose}
                    />
                )}
                {bestValue && (
                    <PlanRow
                        heading={`Best price per ${units.replace(/s$/, "") || "unit"}`}
                        text={`Buy ${describePlan(bestValue)} for ${formatPrice(bestValue.total)}. That's ${bestValue.extraUnits} more ${units} for ${priceDelta(bestValue)}.`}
                        plan={bestValue}
                        pending={pendingPlan === bestValue}
                        disabled={disabled}
                        onChoose={onChoose}
                    />
                )}
            </ul>
        </section>
    );
}

function PlanRow({
    heading,
    text,
    plan,
    pending,
    disabled,
    onChoose,
}: {
    heading: string;
    text: string;
    plan: PackPlan;
    pending: boolean;
    disabled: boolean;
    onChoose: (plan: PackPlan) => void;
}) {
    return (
        <li className="flex flex-col gap-2 rounded-lg bg-[#E9E9EA]/60 p-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <p className="font-body text-xs font-bold text-[#212E49] sm:text-sm">{heading}</p>
                <p className="mt-0.5 font-body text-xs leading-5 text-[#5c534b]">{text}</p>
            </div>
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChoose(plan)}
                className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border-2 border-[#212E49] px-3 font-body text-xs font-semibold text-[#212E49] transition hover:bg-[#212E49] hover:text-[#FEFEFE] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending && <Loader2 size={14} className="animate-spin" />}
                Add to cart · {formatPrice(plan.total)}
            </button>
        </li>
    );
}

interface DialogProps {
    suggestions: PackSuggestions;
    plan: PackPlan;
    selectionLabel: string;
    pending: "switch" | "keep" | null;
    onSwitch: () => void;
    onKeep: () => void;
    onClose: () => void;
}

/** Pop-up on Add to cart: "Pay ₹8 less and get 12 condoms". */
export function PackUpgradeDialog({
    suggestions,
    plan,
    selectionLabel,
    pending,
    onSwitch,
    onKeep,
    onClose,
}: DialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const units = unitName(suggestions);
    const busy = pending !== null;

    useEffect(() => {
        dialogRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !busy) onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [busy, onClose]);

    const headline =
        plan.savings >= 0
            ? `Pay ${priceDelta(plan)} and get ${plan.units} ${units}`
            : `Add just ${priceDelta(plan)} and get ${plan.units} ${units}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#212E49]/50 p-0 sm:items-center sm:p-4"
            onClick={() => !busy && onClose()}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="pack-upgrade-title"
                aria-describedby="pack-upgrade-text"
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
                className="w-full rounded-t-[22px] bg-[#FEFEFE] p-5 shadow-xl outline-none sm:max-w-md sm:rounded-[22px] sm:p-6"
            >
                <div className="flex items-start justify-between gap-4">
                    <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#176348]">
                        Better deal
                    </p>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        disabled={busy}
                        className="rounded-lg p-1.5 text-[#5c534b] transition hover:bg-[#E9E9EA] disabled:opacity-40"
                    >
                        <X size={18} />
                    </button>
                </div>

                <h2 id="pack-upgrade-title" className="mt-1 font-heading text-lg font-semibold text-[#212E49] sm:text-xl">
                    {headline}
                </h2>

                <div id="pack-upgrade-text" className="mt-3 rounded-xl bg-[#E9E9EA] p-3 font-body text-sm leading-6 text-[#212E49]">
                    <p>
                        <span className="font-semibold">{describePlan(plan)}</span>:{" "}
                        {plan.units} {units} for <span className="font-bold">{formatPrice(plan.total)}</span>
                    </p>
                    <p className="text-[#5c534b]">
                        Instead of {selectionLabel}: {suggestions.current.units} {units} for{" "}
                        {formatPrice(suggestions.current.total)}
                    </p>
                    <p className="mt-1 font-semibold text-[#176348]">
                        {plan.extraUnits} more {units} for {priceDelta(plan)}.
                    </p>
                </div>

                <div className="mt-4 grid gap-2">
                    <button
                        type="button"
                        onClick={onSwitch}
                        disabled={busy}
                        className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#212E49] bg-[#212E49] px-4 font-body text-sm font-semibold text-[#FEFEFE] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pending === "switch" && <Loader2 size={16} className="animate-spin" />}
                        Switch to {describePlan(plan)} · {formatPrice(plan.total)}
                    </button>
                    <button
                        type="button"
                        onClick={onKeep}
                        disabled={busy}
                        className="flex h-11 items-center justify-center gap-2 rounded-lg px-4 font-body text-sm font-semibold text-[#212E49] underline underline-offset-4 transition hover:bg-[#E9E9EA] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pending === "keep" && <Loader2 size={16} className="animate-spin" />}
                        No thanks, keep {selectionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
