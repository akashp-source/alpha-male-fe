import Link from "next/link";
import { ArrowRight, Check, Mail, MessageCircle, Package, ShoppingBag } from "lucide-react";

type SearchParams = Promise<{
    orderId?: string | string[];
    orderNumber?: string | string[];
}>;

function firstValue(value?: string | string[]) {
    return Array.isArray(value) ? value[0] : value;
}

export default async function OrderSuccessPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const orderId = firstValue(params.orderId);
    const orderNumber = firstValue(params.orderNumber);

    return (
        <main className="min-h-screen bg-[#f7f8fa] px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-2xl">
                <header className="mb-8 flex items-center justify-between">
                    <Link href="/home" className="font-heading text-sm font-bold tracking-[0.16em] text-brand-navy sm:text-base">
                        ALPHA MALE
                    </Link>
                    <Link href="/shop" className="text-xs font-semibold text-brand-navy-muted transition hover:text-brand-navy sm:text-sm">
                        Continue shopping
                    </Link>
                </header>

                <section className="overflow-hidden rounded-[28px] border border-[#e1e6ee] bg-white shadow-sm">
                    <div className="px-5 py-9 text-center sm:px-10 sm:py-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5ef] text-success-green sm:h-[72px] sm:w-[72px]">
                            <Check size={32} strokeWidth={2.5} />
                        </div>
                        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-success-green">Order confirmed</p>
                        <h1 className="mt-2 font-heading text-2xl font-semibold text-brand-navy sm:text-3xl">Thank you for your order</h1>
                        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-brand-navy-muted">
                            Your cash on delivery order has been placed. We&apos;ll send you a tracking link with your order ID by email and WhatsApp when your order ships.
                        </p>

                        {(orderNumber || orderId) && (
                            <div className="mx-auto mt-7 grid max-w-md gap-3 rounded-2xl bg-[#f5f7fa] p-4 text-left sm:grid-cols-2 sm:p-5">
                                {orderNumber && (
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Order number</p>
                                        <p className="mt-1 break-all text-sm font-bold text-brand-navy">{orderNumber}</p>
                                    </div>
                                )}
                                {orderId && (
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Order ID</p>
                                        <p className="mt-1 break-all font-mono text-xs text-brand-navy">{orderId}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-3 border-t border-[#e8ebef] bg-[#fbfcfd] p-5 sm:grid-cols-2 sm:p-7">
                        <div className="flex items-start gap-3 rounded-2xl border border-[#e1e6ee] bg-white p-4">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pale-gray text-brand-navy"><Mail size={18} /></span>
                            <div><p className="text-sm font-bold text-brand-navy">Email update</p><p className="mt-1 text-xs leading-5 text-[#718096]">Your tracking link will be sent to your email.</p></div>
                        </div>
                        <div className="flex items-start gap-3 rounded-2xl border border-[#e1e6ee] bg-white p-4">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ef] text-success-green"><MessageCircle size={18} /></span>
                            <div><p className="text-sm font-bold text-brand-navy">WhatsApp update</p><p className="mt-1 text-xs leading-5 text-[#718096]">We&apos;ll also share your tracking link on WhatsApp.</p></div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[#e8ebef] p-5 sm:flex-row sm:justify-center sm:p-7">
                        <Link href="/user/orders" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-[#12294b]">
                            <Package size={17} /> View my orders <ArrowRight size={16} />
                        </Link>
                        <Link href="/shop" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dce2ea] bg-white px-6 py-3 text-sm font-bold text-brand-navy transition hover:bg-[#f5f7fa]">
                            <ShoppingBag size={17} /> Continue shopping
                        </Link>
                    </div>
                </section>

                <p className="mt-5 text-center text-xs leading-5 text-[#8b94a3]">
                    Questions about your order? <Link href="/user/support" className="font-semibold text-success-green underline underline-offset-4">Contact support</Link>.
                </p>
            </div>
        </main>
    );
}
