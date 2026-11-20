
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
    ChevronDown,
    ChevronUp,
    Package,
    Truck,
    FileText,
    Star,
    X,
    RefreshCw,
    XCircle,
} from "lucide-react";

import OrderTimeline from "./OrderTimeline";
import CancelOrderDialog from "./CancelOrderDialog";
import { Order } from "@/types/order.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

/** Display labels for every cancellation reason the API can store. */
const CANCELLATION_REASON_LABELS: Record<string, string> = {
    ORDERED_BY_MISTAKE: "Ordered by mistake",
    CHANGED_MIND: "Changed my mind",
    FOUND_BETTER_PRICE: "Found a better price elsewhere",
    DELIVERY_TOO_SLOW: "Delivery is taking too long",
    CHANGE_ADDRESS: "Need to change the delivery address",
    CHANGE_PAYMENT_METHOD: "Want to change the payment method",
    PRIVACY_CONCERN: "Concerned about privacy / discreet delivery",
    CONSULT_DOCTOR_FIRST: "Want to consult a doctor first",
    OTHER: "Other",
    PAYMENT_FAILED: "Payment was not completed",
    COD_NOT_CONFIRMED: "Cash on delivery order was not confirmed",
    CANCELLED_BY_ADMIN: "Cancelled by Alpha Male",
};

function cancellationReasonLabel(reason: string) {
    return CANCELLATION_REASON_LABELS[reason] ?? reason.replace(/_/g, " ").toLowerCase();
}

interface RatingEntry {
    rating: number;
    title: string;
    description: string;
    existing: boolean;
}

interface Props {
    order: Order;
    /** Called with the updated order after the customer cancels it. */
    onOrderUpdated?: (order: Order) => void;
}

const money = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value || 0);

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function isOnlinePayment(order: Order) {
    return order.paymentMethod?.toUpperCase() === "RAZORPAY";
}

function statusLabel(order: Order) {
    // Online payment never completed: the order was released after the
    // payment window closed.
    if (isOnlinePayment(order) && order.paymentStatus?.toUpperCase() === "FAILED") {
        return "Payment failed";
    }

    if (order.cancelledAt || order.status === "CANCELLED") {
        return "Cancelled";
    }

    if (order.status === "CANCELLATION_REQUESTED") {
        return "Cancellation requested";
    }

    if (
        isOnlinePayment(order) &&
        order.paymentStatus?.toUpperCase() === "PENDING" &&
        order.status === "PENDING"
    ) {
        // Window closed but the release job hasn't marked it failed yet.
        return order.canRetryPayment ? "Payment pending" : "Payment not completed";
    }

    if (order.deliveredAt || order.status === "DELIVERED") {
        return "Delivered";
    }

    if (order.shipmentCurrentStatus) {
        return order.shipmentCurrentStatus.replace(/[_-]/g, " ");
    }

    return (order.status || "Processing").replace(/[_-]/g, " ");
}

function statusColor(order: Order) {
    const status = statusLabel(order).toLowerCase();

    if (
        status.includes("cancel") ||
        status.includes("failed") ||
        status.includes("not completed")
    ) {
        return "bg-red-50 text-red-600";
    }

    if (status.includes("deliver")) {
        return "bg-green-50 text-green-700";
    }

    if (status.includes("ship") || status.includes("transit")) {
        return "bg-blue-50 text-blue-700";
    }

    return "bg-amber-50 text-amber-700";
}

function progressStep(order: Order) {
    if (order.cancelledAt || order.status === "CANCELLED") return -1;

    const status = `${order.status} ${order.shipmentCurrentStatus || ""}`.toLowerCase();

    if (order.deliveredAt || status.includes("delivered")) return 5;
    if (status.includes("out for delivery")) return 4;
    if (status.includes("ship") || status.includes("transit")) return 3;
    if (status.includes("pack")) return 2;
    if (status.includes("process") || status.includes("confirm")) return 2;

    return 1;
}

export default function OrderCard({ order, onOrderUpdated }: Props) {
    const [expanded, setExpanded] = useState(true);
    const [ratingPanelOpen, setRatingPanelOpen] = useState(false);
    const [ratingsLoaded, setRatingsLoaded] = useState(false);
    const [ratingsLoading, setRatingsLoading] = useState(false);
    const [ratingError, setRatingError] = useState("");
    const [ratings, setRatings] = useState<Record<string, RatingEntry>>({});
    const [savingRatingId, setSavingRatingId] = useState<string | null>(null);
    const [savedRatingId, setSavedRatingId] = useState<string | null>(null);
    const [retryingPayment, setRetryingPayment] = useState(false);
    const [retryPaymentError, setRetryPaymentError] = useState("");
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelMessage, setCancelMessage] = useState("");

    const handleCancelled = (updated: Order, message: string) => {
        setCancelDialogOpen(false);
        setCancelMessage(message);
        // The cancelled order no longer allows any customer action.
        onOrderUpdated?.({
            ...order,
            ...updated,
            canCancel: false,
            cancelRequiresApproval: false,
            canRetryPayment: false,
            paymentRetryExpiresAt: null,
        });
    };

    const step = progressStep(order);
    const cancelled = step === -1;
    const canRate = String(order.status || "").toUpperCase() === "DELIVERED";
    const ratingProducts = Array.from(
        new Map((order.items || []).map((item) => [String(item.productId), item])).values()
    );
    // The backend decides whether the order is still inside its payment
    // window (stock reserved); the client only hides the button once the
    // window's expiry time passes.
    const retryExpiresAt = order.paymentRetryExpiresAt
        ? new Date(order.paymentRetryExpiresAt).getTime()
        : null;
    const [now, setNow] = useState(() => Date.now());
    const canRetryPayment =
        order.canRetryPayment === true &&
        retryExpiresAt !== null &&
        retryExpiresAt > now;
    const retryMinutesLeft =
        canRetryPayment && retryExpiresAt !== null
            ? Math.max(1, Math.ceil((retryExpiresAt - now) / 60_000))
            : 0;

    useEffect(() => {
        if (!order.canRetryPayment || retryExpiresAt === null) return;

        const timer = window.setInterval(() => {
            const current = Date.now();
            setNow(current);
            if (current >= retryExpiresAt) window.clearInterval(timer);
        }, 30_000);

        return () => window.clearInterval(timer);
    }, [order.canRetryPayment, retryExpiresAt]);

    const retryPayment = async () => {
        if (!canRetryPayment || retryingPayment) return;

        const token = window.localStorage.getItem("token");
        if (!token) {
            window.location.href = "/user/login";
            return;
        }

        setRetryingPayment(true);
        setRetryPaymentError("");
        try {
            const response = await fetch(
                `${API_URL}/payments/orders/${encodeURIComponent(order._id)}/retry`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const result = await response.json().catch(() => ({}));
            if (response.status === 401) {
                window.localStorage.removeItem("token");
                window.localStorage.removeItem("user");
                window.location.href = "/user/login";
                return;
            }
            if (!response.ok) {
                const message = Array.isArray(result.message) ? result.message.join(" ") : result.message;
                throw new Error(message || "Unable to retry this payment. Please try again.");
            }

            if (result.payment_url) {
                window.location.assign(result.payment_url);
                return;
            }
            if (result.status === "PAID") {
                const query = new URLSearchParams({
                    orderId: String(result.orderId || order._id),
                    orderNumber: String(result.orderNumber || order.orderNumber),
                });
                window.location.assign(`/order-success?${query.toString()}`);
                return;
            }
            throw new Error("The retry payment page was not returned. Please try again.");
        } catch (cause) {
            setRetryPaymentError(
                cause instanceof Error ? cause.message : "Unable to retry this payment. Please try again."
            );
        } finally {
            setRetryingPayment(false);
        }
    };

    const openRatingPanel = async () => {
        if (ratingPanelOpen) {
            setRatingPanelOpen(false);
            return;
        }

        setRatingPanelOpen(true);
        setRatingError("");
        if (ratingsLoaded) return;

        const token = window.localStorage.getItem("token");
        if (!token) {
            window.location.href = "/user/login";
            return;
        }

        setRatingsLoading(true);
        try {
            const loadedRatings = await Promise.all(ratingProducts.map(async (item) => {
                const productId = String(item.productId);
                const response = await fetch(
                    `${API_URL}/ratings/order/${encodeURIComponent(order._id)}/product/${encodeURIComponent(productId)}`,
                    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
                );

                if (response.status === 401) {
                    window.localStorage.removeItem("token");
                    window.localStorage.removeItem("user");
                    window.location.href = "/user/login";
                    throw new Error("Your session has expired. Please sign in again.");
                }
                if (!response.ok) {
                    const result = await response.json().catch(() => ({}));
                    throw new Error(result.message || "Could not load your ratings.");
                }

                const result = await response.json();
                const existing = result.rating;
                return [productId, {
                    rating: existing?.rating ?? 0,
                    title: existing?.title ?? "",
                    description: existing?.description ?? "",
                    existing: Boolean(existing),
                }] as const;
            }));

            setRatings(Object.fromEntries(loadedRatings));
            setRatingsLoaded(true);
        } catch (cause) {
            setRatingError(cause instanceof Error ? cause.message : "Could not load your ratings.");
        } finally {
            setRatingsLoading(false);
        }
    };

    const saveRating = async (productId: string) => {
        const entry = ratings[productId];
        if (!entry || entry.rating < 1 || savingRatingId) return;

        const token = window.localStorage.getItem("token");
        if (!token) {
            window.location.href = "/user/login";
            return;
        }

        setSavingRatingId(productId);
        setSavedRatingId(null);
        setRatingError("");
        try {
            const response = await fetch(
                `${API_URL}/ratings/order/${encodeURIComponent(order._id)}/product/${encodeURIComponent(productId)}`,
                {
                    method: entry.existing ? "PATCH" : "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        rating: entry.rating,
                        title: entry.title,
                        description: entry.description,
                    }),
                }
            );

            if (response.status === 401) {
                window.localStorage.removeItem("token");
                window.localStorage.removeItem("user");
                window.location.href = "/user/login";
                return;
            }
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                const message = Array.isArray(result.message) ? result.message.join(" ") : result.message;
                throw new Error(message || "Unable to save your rating.");
            }

            setRatings((current) => ({
                ...current,
                [productId]: { ...current[productId], existing: true },
            }));
            setSavedRatingId(productId);
        } catch (cause) {
            setRatingError(cause instanceof Error ? cause.message : "Unable to save your rating.");
        } finally {
            setSavingRatingId(null);
        }
    };

    return (
        <article className="overflow-hidden rounded-[22px] border border-[#e1e6ee] bg-white">
            {/* Order header */}
            <div className="flex flex-col gap-4 bg-[#f5f7fa] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:items-center sm:gap-9">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#718096]">
                            Order
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-[#07152e]">
                            {order.orderNumber}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#718096]">
                            Placed on
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-[#07152e]">
                            {formatDate(order.createdAt)}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#718096]">
                            Total
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-[#07152e]">
                            {money(order.total)}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#718096]">
                            Payment
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-sm font-bold text-[#07152e]">
                                {order.paymentMethod}
                            </p>
                            {canRetryPayment && (
                                <button
                                    type="button"
                                    onClick={retryPayment}
                                    disabled={retryingPayment}
                                    className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
                                >
                                    {retryingPayment && <RefreshCw size={11} className="animate-spin" />}
                                    {retryingPayment ? "Opening..." : "Retry payment"}
                                </button>
                            )}
                        </div>
                        {canRetryPayment && !retryPaymentError && (
                            <p className="mt-1 text-[10px] leading-4 text-[#718096]">
                                Complete within {retryMinutesLeft} min — items are reserved for you
                            </p>
                        )}
                        {retryPaymentError && <p role="alert" className="mt-1 max-w-48 text-[10px] leading-4 text-red-600">{retryPaymentError}</p>}
                    </div>
                </div>

                <span
                    className={`w-fit rounded-full px-3.5 py-1.5 text-[11px] font-bold capitalize ${statusColor(order)}`}
                >
                    {statusLabel(order)}
                </span>
            </div>

            {/* Order content */}
            <div className="px-5 py-5 sm:px-6">
                {cancelMessage && (
                    <p role="status" className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-xs font-semibold text-green-700">
                        {cancelMessage}
                    </p>
                )}

                {order.cancellation && (cancelled || order.status === "CANCELLATION_REQUESTED") && (
                    <div className="mb-5 flex gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
                        <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                        <div className="text-xs leading-5 text-[#4a5568]">
                            <p className="font-bold text-[#07152e]">
                                {order.status === "CANCELLATION_REQUESTED"
                                    ? "Cancellation requested — our team is reviewing it"
                                    : order.cancellation.source === "CUSTOMER"
                                        ? `Cancelled by you${order.cancelledAt ? ` on ${formatDate(order.cancelledAt)}` : ""}`
                                        : `Cancelled${order.cancelledAt ? ` on ${formatDate(order.cancelledAt)}` : ""}`}
                            </p>
                            <p>Reason: {cancellationReasonLabel(order.cancellation.reason)}</p>
                            {order.cancellation.note && order.cancellation.source === "CUSTOMER" && (
                                <p className="mt-0.5 italic">“{order.cancellation.note}”</p>
                            )}
                        </div>
                    </div>
                )}

                {!cancelled && (
                    <div className="mb-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-bold text-[#07152e]">
                                {order.deliveredAt
                                    ? `Delivered on ${formatDate(order.deliveredAt)}`
                                    : order.shipmentEtd
                                        ? `Expected by ${formatDate(order.shipmentEtd)}`
                                        : canRetryPayment
                                            ? "Complete your payment to confirm this order"
                                            : "Your order is being processed"}
                            </p>

                            {order.courierName && (
                                <p className="text-[11px] text-[#718096]">
                                    Courier: {order.courierName}
                                </p>
                            )}
                        </div>

                        <div className="mt-4 flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div
                                    key={item}
                                    className={`h-[5px] flex-1 rounded-full ${item <= step ? "bg-[#07152e]" : "bg-[#e3e8ef]"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Products */}
                <div className="space-y-4">
                    {order.items?.map((item: any, index: any) => (
                        <div
                            key={`${item.productId}-${index}`}
                            className="flex items-center gap-3"
                        >
                            <div className="relative flex h-[62px] w-[62px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#edf0f5]">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="62px"
                                        className="object-contain p-1"
                                        unoptimized
                                    />
                                ) : (
                                    <Package size={23} className="text-[#9aa5b5]" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-semibold text-[#07152e]">
                                    {item.name}
                                </p>
                                <p className="mt-1 text-[11px] text-[#718096]">
                                    Qty {item.quantity}
                                </p>
                            </div>

                            <p className="shrink-0 text-sm font-bold text-[#07152e]">
                                {money(item.lineTotal)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#e7ebf1] pt-4">
                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-2 rounded-xl bg-[#07152e] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#142b4c]"
                    >
                        {expanded ? "Hide details" : "View details"}
                        {expanded ? (
                            <ChevronUp size={15} />
                        ) : (
                            <ChevronDown size={15} />
                        )}
                    </button>

                    <button
                        type="button"
                        disabled={!order.trackingNumber && !order.awb}
                        title={
                            order.trackingNumber || order.awb
                                ? "Tracking details are available in your shipment information"
                                : "Tracking is not available yet"
                        }
                        className="flex items-center gap-2 rounded-xl border border-[#d5dce7] px-4 py-3 text-xs font-bold text-[#07152e] transition hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Truck size={14} />
                        Track order
                    </button>

                    <button
                        type="button"
                        disabled
                        title="Invoice download API is not configured yet"
                        className="flex items-center gap-2 rounded-xl border border-[#d5dce7] px-4 py-3 text-xs font-bold text-[#07152e] opacity-40"
                    >
                        <FileText size={14} />
                        Invoice
                    </button>

                    {/* Cancel order button — temporarily disabled. Uncomment to re-enable.
                    {order.canCancel && (
                        <button
                            type="button"
                            onClick={() => {
                                setCancelMessage("");
                                setCancelDialogOpen(true);
                            }}
                            className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                            <XCircle size={14} />
                            {order.cancelRequiresApproval ? "Request cancellation" : "Cancel order"}
                        </button>
                    )}
                    */}

                    {canRate && (
                        <button
                            type="button"
                            onClick={openRatingPanel}
                            aria-expanded={ratingPanelOpen}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition ${ratingPanelOpen ? "border-[#07152e] bg-[#f5f7fa] text-[#07152e]" : "border-[#d5dce7] text-[#07152e] hover:bg-[#f5f7fa]"}`}
                        >
                            <Star size={14} className={ratingsLoaded ? "fill-amber-400 text-amber-500" : ""} />
                            Rate products
                        </button>
                    )}
                </div>

                {ratingPanelOpen && (
                    <section className="mt-4 rounded-2xl border border-[#e1e6ee] bg-[#f8f9fb] p-4 sm:p-5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#07152e]">Rate your products</h3>
                                <p className="mt-1 text-xs text-[#718096]">Your feedback helps other customers.</p>
                            </div>
                            <button type="button" aria-label="Close ratings" onClick={() => setRatingPanelOpen(false)} className="rounded-lg p-1.5 text-[#718096] transition hover:bg-white hover:text-[#07152e]"><X size={17} /></button>
                        </div>

                        {ratingsLoading && <div className="flex items-center gap-2 py-4 text-xs text-[#718096]"><RefreshCw size={14} className="animate-spin" />Loading your ratings...</div>}
                        {ratingError && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{ratingError}</p>}

                        {!ratingsLoading && ratingProducts.length === 0 && <p className="text-xs text-[#718096]">There are no products in this order to rate.</p>}

                        {!ratingsLoading && ratingProducts.length > 0 && (
                            <div className="space-y-3">
                                {ratingProducts.map((item) => {
                                    const productId = String(item.productId);
                                    const entry = ratings[productId];
                                    if (!entry) return null;

                                    return (
                                        <div key={productId} className="rounded-xl border border-[#e1e6ee] bg-white p-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-[#07152e]">{item.name}</p>
                                                    <div className="mt-2 flex items-center gap-1" role="group" aria-label={`Rate ${item.name}`}>
                                                        {[1, 2, 3, 4, 5].map((value) => (
                                                            <button key={value} type="button" onClick={() => setRatings((current) => ({ ...current, [productId]: { ...current[productId], rating: value } }))} aria-label={`${value} ${value === 1 ? "star" : "stars"}`} aria-pressed={entry.rating === value} className="rounded p-0.5 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                                                                <Star size={22} className={value <= entry.rating ? "fill-amber-400 text-amber-500" : "text-[#cbd3df]"} />
                                                            </button>
                                                        ))}
                                                        <span className="ml-1 text-xs text-[#718096]">{entry.rating ? `${entry.rating}/5` : "Choose a rating"}</span>
                                                    </div>
                                                </div>
                                                {entry.existing && <span className="w-fit rounded-full bg-[#e8f5ef] px-2.5 py-1 text-[10px] font-semibold text-[#176348]">Your rating</span>}
                                            </div>
                                            <label className="mt-3 block text-xs font-medium text-[#526078]">
                                                Review title <span className="font-normal text-[#8b94a3]">(optional)</span>
                                                <input type="text" value={entry.title} maxLength={150} onChange={(event) => setRatings((current) => ({ ...current, [productId]: { ...current[productId], title: event.target.value } }))} placeholder="Sum it up in a few words" className="mt-1.5 block w-full rounded-xl border border-[#dce2ea] bg-white px-3 py-2.5 text-sm text-[#07152e] outline-none placeholder:text-[#8b94a3] focus:border-[#07152e]" />
                                            </label>
                                            <label className="mt-3 block text-xs font-medium text-[#526078]">
                                                Review <span className="font-normal text-[#8b94a3]">(optional)</span>
                                                <textarea value={entry.description} maxLength={2000} rows={3} onChange={(event) => setRatings((current) => ({ ...current, [productId]: { ...current[productId], description: event.target.value } }))} placeholder="Share your experience" className="mt-1.5 block w-full resize-y rounded-xl border border-[#dce2ea] bg-white px-3 py-2.5 text-sm text-[#07152e] outline-none placeholder:text-[#8b94a3] focus:border-[#07152e]" />
                                            </label>
                                            <div className="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-[10px] text-[#8b94a3]">You can rate a product only after delivery.</p>
                                                <button type="button" disabled={!entry.rating || savingRatingId !== null} onClick={() => saveRating(productId)} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#07152e] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#142b4c] disabled:cursor-not-allowed disabled:opacity-50">
                                                    {savingRatingId === productId && <RefreshCw size={13} className="animate-spin" />}
                                                    {savingRatingId === productId ? "Saving..." : entry.existing ? "Update rating" : "Submit rating"}
                                                </button>
                                            </div>
                                            {savedRatingId === productId && <p role="status" className="mt-2 text-xs font-medium text-[#176348]">Your rating has been saved.</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}
            </div>

            {/* Expanded details */}
            {expanded && <OrderTimeline order={order} />}

            <CancelOrderDialog
                order={order}
                open={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                onCancelled={handleCancelled}
            />
        </article>
    );
}
