
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Package, RefreshCw } from "lucide-react";

import AccountSidebar from "@/Components/user/AccountSidebar";
import OrderCard from "@/Components/user/OrderCard";
import { Order, OrdersResponse } from "@/types/order.types";


const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

type Filter = "ALL" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED";

const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "ALL" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
];

function getOrderCategory(order: Order): Filter {
    const status = `${order.status || ""} ${order.shipmentCurrentStatus || ""
        }`.toLowerCase();

    if (
        order.cancelledAt ||
        status.includes("cancel") ||
        status.includes("refund")
    ) {
        return "CANCELLED";
    }

    if (
        order.deliveredAt ||
        status.includes("delivered")
    ) {
        return "DELIVERED";
    }

    return "IN_PROGRESS";
}

function getCustomerName(order?: Order) {
    if (!order?.customer) return "Customer";

    return (
        `${order.customer.firstName || ""} ${order.customer.lastName || ""
            }`.trim() || "Customer"
    );
}

function getCustomerEmail(order?: Order) {
    return order?.customer?.email || "";
}

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<Filter>("ALL");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = useCallback(async (pageNumber: number) => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/user/login";
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/orders/my-orders?page=${pageNumber}&limit=10`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    cache: "no-store",
                }
            );

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/user/login";
                return;
            }

            const result: OrdersResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to fetch your orders.");
            }

            setOrders(Array.isArray(result.data) ? result.data : []);
            setPage(result.pagination?.currentPage || pageNumber);
            setTotalPages(result.pagination?.totalPages || 1);
            setTotalOrders(result.pagination?.totalOrders || 0);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while fetching orders."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    const customerOrder = orders[0];

    const filteredOrders = useMemo(() => {
        let result = [...orders];

        if (filter !== "ALL") {
            result = result.filter(
                (order) => getOrderCategory(order) === filter
            );
        }

        const query = search.trim().toLowerCase();

        if (query) {
            result = result.filter((order) => {
                const orderNumber = order.orderNumber?.toLowerCase() || "";

                const productNames = order.items
                    ?.map((item) => item.name)
                    .join(" ")
                    .toLowerCase();

                return (
                    orderNumber.includes(query) ||
                    productNames?.includes(query)
                );
            });
        }

        return result;
    }, [orders, filter, search]);

    const counts = useMemo(() => {
        return {
            ALL: totalOrders,
            IN_PROGRESS: orders.filter(
                (order) => getOrderCategory(order) === "IN_PROGRESS"
            ).length,
            DELIVERED: orders.filter(
                (order) => getOrderCategory(order) === "DELIVERED"
            ).length,
            CANCELLED: orders.filter(
                (order) => getOrderCategory(order) === "CANCELLED"
            ).length,
        };
    }, [orders, totalOrders]);

    const changePage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) return;

        setPage(nextPage);
        fetchOrders(nextPage);
    };

    return (
        <main className="min-h-screen bg-[#fafbfc]">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12 pb-28 lg:pb-28">
                <div className="mb-7">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-success-green">
                        Your account
                    </p>

                    <h1 className="mt-2 font-heading text-2xl font-semibold tracking-wide text-brand-navy sm:text-3xl">
                        MY ORDERS
                    </h1>

                    <p className="mt-2 text-xs text-brand-navy-muted sm:text-sm">
                        Track, manage and reorder your purchases.
                    </p>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-7">
                    {/* Account sidebar */}
                    <AccountSidebar
                        name={getCustomerName(customerOrder)}
                        email={getCustomerEmail(customerOrder)}
                        orderCount={totalOrders}
                    />

                    {/* Main orders section */}
                    <section className="min-w-0">
                        {/* Filters and search */}
                        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex flex-wrap gap-2">
                                {filters.map((item) => {
                                    const active = filter === item.value;

                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() => setFilter(item.value)}
                                            className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition ${active
                                                ? "border-brand-navy bg-brand-navy text-white"
                                                : "border-[#dce2ea] bg-white text-brand-navy hover:border-brand-navy"
                                                }`}
                                        >
                                            {item.label}

                                            <span
                                                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] ${active
                                                    ? "bg-white/20 text-white"
                                                    : "bg-pale-gray text-brand-navy"
                                                    }`}
                                            >
                                                {counts[item.value]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="relative w-full xl:max-w-[300px]">
                                <Search
                                    size={17}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718096]"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Order ID or product"
                                    className="h-12 w-full rounded-xl border border-[#dce2ea] bg-white pl-11 pr-4 text-sm text-brand-navy outline-none transition placeholder:text-[#9aa3b2] focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/5"
                                />
                            </div>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="space-y-5">
                                {[1, 2].map((item) => (
                                    <div
                                        key={item}
                                        className="animate-pulse overflow-hidden rounded-[22px] border border-[#e1e6ee] bg-white"
                                    >
                                        <div className="h-24 bg-[#f0f2f6]" />
                                        <div className="space-y-4 p-6">
                                            <div className="h-4 w-40 rounded bg-pale-gray" />
                                            <div className="h-16 rounded bg-[#f5f7fa]" />
                                            <div className="h-10 w-48 rounded bg-pale-gray" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center">
                                <p className="text-sm font-semibold text-red-600">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => fetchOrders(page)}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-xs font-bold text-white"
                                >
                                    <RefreshCw size={14} />
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* Orders */}
                        {!loading && !error && filteredOrders.length > 0 && (
                            <div className="space-y-5">
                                {filteredOrders.map((order) => (
                                    <OrderCard
                                        key={order._id}
                                        order={order}
                                        onOrderUpdated={(updated) =>
                                            setOrders((current) =>
                                                current.map((item) =>
                                                    item._id === updated._id ? updated : item
                                                )
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && !error && filteredOrders.length === 0 && (
                            <div className="flex flex-col items-center rounded-[22px] border border-dashed border-[#dce2ea] bg-white px-6 py-16 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f2f6]">
                                    <Package size={28} className="text-[#718096]" />
                                </div>

                                <h3 className="mt-5 text-base font-semibold text-brand-navy">
                                    {search
                                        ? "No matching orders found"
                                        : filter === "ALL"
                                            ? "You haven't placed any orders yet"
                                            : `No ${filter.toLowerCase().replace("_", " ")} orders`}
                                </h3>

                                <p className="mt-2 max-w-sm text-xs leading-5 text-[#718096]">
                                    {search
                                        ? "Try searching with another order number or product name."
                                        : "Your purchases will appear here once you place an order."}
                                </p>

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="mt-5 rounded-xl bg-brand-navy px-5 py-3 text-xs font-bold text-white"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && !error && totalPages > 1 && (
                            <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e1e6ee] bg-white p-4 sm:flex-row">
                                <p className="text-xs text-[#718096]">
                                    Page {page} of {totalPages} · {totalOrders} total orders
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() => changePage(page - 1)}
                                        className="rounded-lg border border-[#dce2ea] px-4 py-2 text-xs font-semibold text-brand-navy disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        type="button"
                                        disabled={page >= totalPages}
                                        onClick={() => changePage(page + 1)}
                                        className="rounded-lg bg-brand-navy px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
