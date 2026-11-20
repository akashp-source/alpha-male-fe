"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, X } from "lucide-react";

import { CancellationReasonOption, Order } from "@/types/order.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

/** Reasons rarely change; fetch once per page load. */
let reasonsCache: CancellationReasonOption[] | null = null;

interface Props {
    order: Order;
    open: boolean;
    onClose: () => void;
    onCancelled: (updated: Order, message: string) => void;
}

export default function CancelOrderDialog({ order, open, onClose, onCancelled }: Props) {
    const [reasons, setReasons] = useState<CancellationReasonOption[]>(reasonsCache ?? []);
    const [reasonsError, setReasonsError] = useState("");
    const [reason, setReason] = useState("");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const dialogRef = useRef<HTMLDivElement>(null);

    const reasonsLoading = open && reasons.length === 0 && !reasonsError;
    const selected = reasons.find((item) => item.value === reason);
    const noteRequired = selected?.requiresNote === true;
    const canSubmit = !!reason && (!noteRequired || note.trim().length > 0) && !submitting;

    // Load reasons the first time the dialog opens.
    useEffect(() => {
        if (!open || reasonsCache) return;

        const controller = new AbortController();

        fetch(`${API_URL}/orders/cancellation-reasons`, {
            cache: "no-store",
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to load reasons");
                return response.json();
            })
            .then((result) => {
                const list: CancellationReasonOption[] = Array.isArray(result?.reasons)
                    ? result.reasons
                    : [];
                if (list.length === 0) throw new Error("No reasons returned");
                reasonsCache = list;
                setReasons(list);
            })
            .catch((cause) => {
                if (cause?.name !== "AbortError") {
                    setReasonsError("Unable to load cancellation reasons. Please close and try again.");
                }
            });

        return () => controller.abort();
    }, [open]);

    // Close on Escape and move focus into the dialog.
    useEffect(() => {
        if (!open) return;

        dialogRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !submitting) onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, submitting, onClose]);

    if (!open) return null;

    const submit = async () => {
        if (!canSubmit) return;

        const token = window.localStorage.getItem("token");
        if (!token) {
            window.location.href = "/user/login";
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/orders/user/${encodeURIComponent(order._id)}/status`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: "CANCELLED",
                        reason,
                        note: note.trim() || undefined,
                    }),
                }
            );
            const result = await response.json().catch(() => ({}));

            if (response.status === 401) {
                window.localStorage.removeItem("token");
                window.localStorage.removeItem("user");
                window.location.href = "/user/login";
                return;
            }

            if (!response.ok || !result?.order) {
                const message = Array.isArray(result?.message)
                    ? result.message.join(" ")
                    : result?.message;
                throw new Error(message || "Unable to cancel this order. Please try again.");
            }

            onCancelled(result.order as Order, result.message || "Order cancelled.");
            setReason("");
            setNote("");
        } catch (cause) {
            setError(
                cause instanceof Error ? cause.message : "Unable to cancel this order. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#07152e]/50 p-0 sm:items-center sm:p-4"
            onClick={() => !submitting && onClose()}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`cancel-order-title-${order._id}`}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
                className="max-h-[90vh] w-full overflow-y-auto rounded-t-[22px] bg-white p-5 shadow-xl outline-none sm:max-w-md sm:rounded-[22px] sm:p-6"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2
                            id={`cancel-order-title-${order._id}`}
                            className="text-base font-bold text-[#07152e]"
                        >
                            Cancel order
                        </h2>
                        <p className="mt-1 text-xs text-[#718096]">{order.orderNumber}</p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-lg p-1.5 text-[#718096] transition hover:bg-[#f5f7fa] hover:text-[#07152e] disabled:opacity-40"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="mt-4 rounded-xl bg-[#f5f7fa] px-4 py-3 text-xs leading-5 text-[#4a5568]">
                    {order.cancelRequiresApproval
                        ? "Your order is already paid or being prepared, so our team will review the cancellation and process your refund."
                        : "Your order will be cancelled right away."}
                </p>

                <fieldset className="mt-5" disabled={submitting}>
                    <legend className="text-sm font-bold text-[#07152e]">
                        Why are you cancelling?
                    </legend>

                    {reasonsLoading && (
                        <p className="mt-3 flex items-center gap-2 text-xs text-[#718096]">
                            <RefreshCw size={13} className="animate-spin" /> Loading reasons...
                        </p>
                    )}

                    <div className="mt-3 space-y-2">
                        {reasons.map((item) => (
                            <label
                                key={item.value}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${reason === item.value
                                    ? "border-[#07152e] bg-[#f5f7fa] text-[#07152e]"
                                    : "border-[#e1e6ee] text-[#4a5568] hover:border-[#07152e]"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`cancel-reason-${order._id}`}
                                    value={item.value}
                                    checked={reason === item.value}
                                    onChange={() => setReason(item.value)}
                                    className="h-4 w-4 accent-[#07152e]"
                                />
                                {item.label}
                            </label>
                        ))}
                    </div>
                </fieldset>

                {reason && (
                    <div className="mt-4">
                        <label
                            htmlFor={`cancel-note-${order._id}`}
                            className="text-xs font-semibold text-[#07152e]"
                        >
                            {noteRequired ? "Please tell us more" : "Anything else? (optional)"}
                        </label>
                        <textarea
                            id={`cancel-note-${order._id}`}
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            maxLength={500}
                            rows={3}
                            disabled={submitting}
                            className="mt-2 w-full resize-none rounded-xl border border-[#dce2ea] px-4 py-3 text-sm text-[#07152e] outline-none transition focus:border-[#07152e] focus:ring-2 focus:ring-[#07152e]/5"
                        />
                        <p className="mt-1 text-right text-[10px] text-[#9aa3b2]">{note.length}/500</p>
                    </div>
                )}

                {(error || reasonsError) && (
                    <p role="alert" className="mt-3 text-xs text-red-600">
                        {error || reasonsError}
                    </p>
                )}

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-xl border border-[#d5dce7] px-4 py-3 text-xs font-bold text-[#07152e] transition hover:bg-[#f5f7fa] disabled:opacity-40"
                    >
                        Keep order
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={!canSubmit}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting && <RefreshCw size={13} className="animate-spin" />}
                        {submitting
                            ? "Cancelling..."
                            : order.cancelRequiresApproval
                                ? "Request cancellation"
                                : "Cancel order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
