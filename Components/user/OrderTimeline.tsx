
"use client";

import { Order } from "@/types/order.types";
import { Check, Circle, Package, Truck, Home } from "lucide-react";


interface Props {
    order: Order;
}

const steps = [
    { label: "Order placed", icon: Package },
    { label: "Packed", icon: Package },
    { label: "Shipped", icon: Truck },
    { label: "Out for delivery", icon: Truck },
    { label: "Delivered", icon: Home },
];

function normalize(value: string | null | undefined = "") {
    return (value ?? "").toLowerCase().replace(/[_-]/g, " ");
}

function getCurrentStep(order: Order) {
    if (order.status === "CANCELLED" || order.status === "REFUNDED") {
        return -1;
    }

    if (order.deliveredAt || normalize(order.status).includes("delivered")) {
        return 4;
    }

    const shipment = normalize(order.shipmentCurrentStatus);
    const status = normalize(order.status);
    const combined = `${shipment} ${status}`;

    if (combined.includes("out for delivery")) return 3;
    if (combined.includes("shipped") || combined.includes("in transit")) return 2;
    if (combined.includes("packed") || combined.includes("processing")) return 1;

    return 0;
}

function formatDate(value?: string | null) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function OrderTimeline({ order }: Props) {
    const currentStep = getCurrentStep(order);
    const cancelled = currentStep === -1;

    const timelineEvents = [
        {
            label: "Order placed",
            date: order.createdAt,
        },
        ...(order.shipmentScans || order.scans || []).map((scan) => ({
            label: scan.activity || scan.status || "Shipment update",
            date: scan.date || scan.createdAt,
        })),
        ...(order.deliveredAt
            ? [{ label: "Delivered", date: order.deliveredAt }]
            : []),
    ];

    return (
        <div className="grid gap-8 border-t border-[#e7ebf1] bg-[#fafbfc] p-5 sm:grid-cols-2 sm:p-6">
            <div>
                <h3 className="mb-5 text-sm font-bold text-[#07152e]">
                    Order timeline
                </h3>

                {cancelled ? (
                    <div className="flex items-center gap-3 text-sm font-semibold text-red-600">
                        <Circle size={17} />
                        Order cancelled
                        {order.cancelledAt && (
                            <span className="text-xs font-normal text-[#718096]">
                                {formatDate(order.cancelledAt)}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {steps.map((step, index) => {
                            const completed = index <= currentStep;
                            const Icon = step.icon;

                            return (
                                <div key={step.label} className="flex items-start gap-3">
                                    <div
                                        className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${completed
                                                ? "bg-[#07152e] text-white"
                                                : "border border-[#cbd3df] bg-white text-[#a0a9b7]"
                                            }`}
                                    >
                                        {completed ? (
                                            <Check size={13} />
                                        ) : (
                                            <Icon size={12} />
                                        )}
                                    </div>

                                    <div>
                                        <p
                                            className={`text-sm font-semibold ${completed ? "text-[#07152e]" : "text-[#9aa3b2]"
                                                }`}
                                        >
                                            {step.label}
                                        </p>

                                        {index === 0 && (
                                            <p className="mt-0.5 text-[11px] text-[#718096]">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        )}

                                        {index === 4 && order.deliveredAt && (
                                            <p className="mt-0.5 text-[11px] text-[#718096]">
                                                {formatDate(order.deliveredAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {timelineEvents.length > 1 && (
                    <div className="mt-5 border-t border-[#e7ebf1] pt-4">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                            Shipment updates
                        </p>
                        <div className="space-y-2">
                            {timelineEvents.slice(1).map((event, index) => (
                                <div key={`${event.label}-${index}`}>
                                    <p className="text-xs font-medium text-[#344054]">
                                        {event.label}
                                    </p>
                                    {event.date && (
                                        <p className="text-[10px] text-[#98a2b3]">
                                            {formatDate(event.date)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <h3 className="mb-5 text-sm font-bold text-[#07152e]">
                    Delivery address
                </h3>

                <div className="space-y-1 text-xs leading-5 text-[#526078]">
                    <p className="font-semibold text-[#07152e]">
                        {order.customer?.firstName} {order.customer?.lastName}
                    </p>

                    <p>{order.shippingAddress?.address}</p>

                    {order.shippingAddress?.apartment && (
                        <p>{order.shippingAddress.apartment}</p>
                    )}

                    <p>
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state}{" "}
                        {order.shippingAddress?.pincode}
                    </p>

                    <p>{order.shippingAddress?.country}</p>

                    {order.customer?.phone && (
                        <p className="pt-2">{order.customer.phone}</p>
                    )}
                </div>

                <div className="mt-5 border-t border-[#e7ebf1] pt-4">
                    <h4 className="text-xs font-bold text-[#07152e]">
                        Payment details
                    </h4>

                    <div className="mt-2 flex justify-between text-xs">
                        <span className="text-[#718096]">Payment method</span>
                        <span className="font-semibold text-[#07152e]">
                            {order.paymentMethod}
                        </span>
                    </div>

                    <div className="mt-2 flex justify-between text-xs">
                        <span className="text-[#718096]">Payment status</span>
                        <span className="font-semibold text-[#07152e]">
                            {order.paymentStatus}
                        </span>
                    </div>

                    {order.awb && (
                        <div className="mt-2 flex justify-between gap-3 text-xs">
                            <span className="text-[#718096]">AWB number</span>
                            <span className="break-all font-semibold text-[#07152e]">
                                {order.awb}
                            </span>
                        </div>
                    )}

                    {order.courierName && (
                        <div className="mt-2 flex justify-between text-xs">
                            <span className="text-[#718096]">Courier</span>
                            <span className="font-semibold text-[#07152e]">
                                {order.courierName}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
