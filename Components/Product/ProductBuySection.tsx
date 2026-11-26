
"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/types/product";
import { addToCart } from "@/lib/cart";
import {
    calculateComboPricing,
    getBulkDiscountMinQuantity,
    getBulkDiscountPercent,
} from "@/lib/comboPricing";
import {
    fetchPackSuggestions,
    type PackPlan,
    type PackSuggestions,
} from "@/lib/packSuggestions";
import { ONLINE_PAYMENT_DISCOUNT_PERCENT } from "@/lib/offers";
// import { WHATSAPP_LINK } from "@/lib/contact"; (used by the removed strength note)
import ProductGallery from "./ProductGallery";

// "Choose strength" order, remembered for one navigation: clicking another
// strength stores the boxes' current order, so the next page keeps it (feels
// like switching a tab). Opening a product directly puts it first.
const STRENGTH_ORDER_KEY = "am:strength-order";

function readStrengthOrder(productId: string, optionIds: string[]): string[] | null {
    if (typeof window === "undefined") return null;
    try {
        const saved = JSON.parse(sessionStorage.getItem(STRENGTH_ORDER_KEY) || "null");
        // Only for the product that was clicked, and only if it's the same set of strengths.
        if (saved?.target !== productId || !Array.isArray(saved.ids)) return null;
        const ids: string[] = saved.ids;
        const sameSet = ids.length === optionIds.length && optionIds.every((id) => ids.includes(id));
        return sameSet ? ids : null;
    } catch {
        return null;
    }
}
// import DeliveryCheck from "./DeliveryCheck";
import { PackSuggestionsBox, PackUpgradeDialog } from "./PackSuggestions";
import RichDescription from "./RichDescription";
import {
    Loader2,
    Minus,
    Plus,
    ShoppingBag,
    Zap,
    Check,
    Package,
    ChevronRight,
    // Phone, (used by the removed consultation-call note)
    Star,
} from "lucide-react";

interface ProductBuySectionProps {
    product: Product;
    onAddToCart?: (
        product: Product,
        quantity: number,
        totalPrice: number
    ) => void;
    onBuyNow?: (
        product: Product,
        quantity: number,
        totalPrice: number
    ) => void;
}

/** "strips" -> "strip" for "₹70 per strip". */
const singular = (label: string) =>
    /[^s]s$/i.test(label) ? label.slice(0, -1) : label;

/** One row in "Choose pack": the single pack, then each combo tier. */
type PackOption = {
    quantity: number;
    price: number;
    title?: string;
    description?: string;
    badge?: string;
};

export default function ProductBuySection({
    product,
    onAddToCart,
    onBuyNow,
}: ProductBuySectionProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [pending, setPending] = useState<"cart" | "buy" | null>(null);
    const [cartError, setCartError] = useState("");
    // Add-on tick-box next to the buy buttons (set up in admin).
    const [addOnSelected, setAddOnSelected] = useState(false);
    const [addOnNotice, setAddOnNotice] = useState("");
    // Pack-size suggestions (cheaper mix / better-value pack) for the
    // current quantity, set up in admin under "Pack sizes".
    const [packState, setPackState] = useState<{
        quantity: number;
        suggestions: PackSuggestions | null;
    } | null>(null);
    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [upgradePending, setUpgradePending] = useState<"switch" | "keep" | null>(null);
    const [planPending, setPlanPending] = useState<PackPlan | null>(null);

    // -----------------------------------
    // Pricing calculation
    // Quantity is the single source of truth. Same rules the backend
    // charges at checkout: exact combo tier, else bulk percent above the
    // largest tier, else regular price.
    // -----------------------------------

    const pricing = calculateComboPricing(product, quantity);

    const bulkPercent = getBulkDiscountPercent(product);
    const bulkMinQuantity = getBulkDiscountMinQuantity(product);
    const bulkActive = pricing.appliedOffer?.type === "BULK_PERCENT";

    const totalPrice = pricing.total;

    // Add-on (upsell): shown only when the backend returned one that is
    // active and in stock. It is charged at its own price at checkout.
    const addOn =
        product.upsellProduct &&
            product.upsellProduct._id &&
            Number.isFinite(product.upsellProduct.price) &&
            product.upsellProduct.stock > 0
            ? product.upsellProduct
            : null;
    const addOnActive = Boolean(addOn && addOnSelected);
    const addOnTitle = addOn ? addOn.title?.trim() || `Add ${addOn.name}` : "";
    const addOnHasMrp = Boolean(
        addOn?.compareAtPrice && addOn.compareAtPrice > addOn.price
    );
    // What the price box shows: main product (+ add-on when ticked).
    const displayTotal = totalPrice + (addOnActive && addOn ? addOn.price : 0);
    const addOnMrp =
        addOnActive && addOn
            ? addOnHasMrp && addOn.compareAtPrice
                ? addOn.compareAtPrice
                : addOn.price
            : 0;

    // Savings are measured against the 1-qty strike-through price (MRP)
    // when there is one, so combos show the full discount off MRP.
    const unitMrp =
        product.compareAtPrice && product.compareAtPrice > product.price
            ? product.compareAtPrice
            : product.price;

    const originalPrice = unitMrp * quantity;
    const displayMrp = originalPrice + addOnMrp;
    const displaySavings = Math.max(0, displayMrp - displayTotal);
    const displayPercentOff =
        displayMrp > 0 ? Math.round((displaySavings / displayMrp) * 100) : 0;

    // Prepaid price, rounded to the paisa the way checkout does.
    const onlineDiscount =
        Math.round(displayTotal * ONLINE_PAYMENT_DISCOUNT_PERCENT) / 100;
    const onlineTotal = Math.max(0, displayTotal - onlineDiscount);

    // Units per pack (e.g. 10 strips), from admin "Pack sizes".
    const packUnits =
        product.packSizing && Number(product.packSizing.units) > 0
            ? Number(product.packSizing.units)
            : 0;
    const unitLabel = product.packSizing?.unitLabel?.trim() || "";
    const perUnitText = (price: number, packs: number) =>
        packUnits && unitLabel
            ? `${formatPrice(Math.round(price / (packs * packUnits)))} per ${singular(unitLabel)}`
            : "";
    const galleryBadge =
        packUnits && unitLabel ? `Pack of ${packUnits} ${unitLabel}` : undefined;

    const outOfStock = product.stock <= 0;

    // "Choose pack": the single pack first, then the combo tiers.
    const packOptions: PackOption[] = [
        { quantity: 1, price: product.price },
        ...(product.comboOffers ?? []).map((offer) => ({
            quantity: offer.quantity,
            price: offer.offerPrice,
            title: offer.title,
            description: offer.description,
            badge: offer.badge,
        })),
    ];

    // "Choose strength": shown when the product links other strengths.
    // Opened directly: this product first (the API's order). Reached by
    // clicking another strength: the previous page's order, so the boxes stay
    // where they were and only the highlight moves.
    const apiStrengthOptions = product.strengthOptions ?? [];
    const [rememberedOrder] = useState(() =>
        readStrengthOrder(product._id, apiStrengthOptions.map((option) => option._id)),
    );
    const strengthOptions = rememberedOrder
        ? [...apiStrengthOptions].sort((a, b) => rememberedOrder.indexOf(a._id) - rememberedOrder.indexOf(b._id))
        : apiStrengthOptions;

    // The remembered order is used once.
    useEffect(() => {
        try {
            sessionStorage.removeItem(STRENGTH_ORDER_KEY);
        } catch {
            // Storage unavailable (private mode): ordering just falls back.
        }
    }, []);

    const rememberStrengthOrder = (targetId: string) => {
        try {
            sessionStorage.setItem(
                STRENGTH_ORDER_KEY,
                JSON.stringify({ target: targetId, ids: strengthOptions.map((option) => option._id) }),
            );
        } catch {
            // Storage unavailable: the next page shows its own product first.
        }
    };

    const rating = product.ratings?.summary;
    const quickPoints = (product.quickPoints ?? []).filter((point) => point.trim());

    // Load suggestions shortly after the quantity settles.
    useEffect(() => {
        if (outOfStock || onAddToCart) return;

        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            fetchPackSuggestions(product._id, quantity, controller.signal)
                .then((suggestions) => setPackState({ quantity, suggestions }))
                .catch(() => {
                    // Suggestions are optional; the page works without them.
                });
        }, 250);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [product._id, quantity, outOfStock, onAddToCart]);

    // Ignore suggestions loaded for a previous quantity.
    const packSuggestions =
        packState && packState.quantity === quantity ? packState.suggestions : null;
    const selectionLabel = `${quantity} × ${product.name}`;

    // -----------------------------------
    // Buy buttons, two stages:
    //  1. Not reached yet: the real Add to cart / Buy now buttons stick to the
    //     bottom of the screen inside the right-hand column (CSS sticky).
    //  2. Scrolled past them: a full-width bar with the same two buttons is
    //     pinned to the bottom of the screen. Scrolling back up hides it.
    // -----------------------------------
    const buyButtonsRef = useRef<HTMLDivElement>(null);
    const [showStickyBar, setShowStickyBar] = useState(false);

    useEffect(() => {
        const target = buyButtonsRef.current;
        if (!target || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(([entry]) => {
            // Only once the buttons are ABOVE the screen (scrolled past); before
            // that they're on screen, stuck to the bottom of their column.
            setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        });
        observer.observe(target);
        return () => observer.disconnect();
    }, []);

    // Lift the floating WhatsApp button above the buy buttons on this page:
    // they're pinned to the bottom of the screen in both stages (real buttons
    // stuck in their column, then the full bar), so it would cover them.
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--pdp-bar-offset", "76px");
        return () => {
            root.style.removeProperty("--pdp-bar-offset");
        };
    }, []);

    function formatPrice(price: number) {
        return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    }

    // -----------------------------------
    // Add to cart / Buy now
    // Callers may override via onAddToCart / onBuyNow; otherwise the item is
    // added to the cart through the cart API.
    // -----------------------------------

    /**
     * Adds the ticked add-on after the main product. The main product is
     * already in the cart at this point, so an add-on failure (e.g. it just
     * sold out) is reported without undoing the main item.
     */
    const addSelectedAddOn = async () => {
        if (!addOnActive || !addOn) return;
        try {
            await addToCart(addOn._id, 1);
        } catch (error) {
            const reason = error instanceof Error ? error.message : "";
            setAddOnNotice(
                `${product.name} was added, but ${addOn.name} couldn't be added${reason ? `: ${reason}` : "."}`
            );
        }
    };

    /** Adds the selected quantity of this product (+ ticked add-on). */
    const addSelectionToCart = async () => {
        await addToCart(product._id, quantity);
        await addSelectedAddOn();
        // Show the updated cart (the navbar listens for this event).
        window.dispatchEvent(new Event("open-cart"));
    };

    /** Adds a suggested pack mix instead of the selection (+ ticked add-on). */
    const addPlanToCart = async (plan: PackPlan) => {
        for (const item of plan.items) {
            await addToCart(item.productId, item.quantity);
        }
        await addSelectedAddOn();
        window.dispatchEvent(new Event("open-cart"));
    };

    const handleChoosePlan = async (plan: PackPlan) => {
        if (pending || planPending) return;

        setPlanPending(plan);
        setCartError("");
        setAddOnNotice("");
        try {
            await addPlanToCart(plan);
        } catch (error) {
            setCartError(error instanceof Error ? error.message : "Unable to add to cart");
        } finally {
            setPlanPending(null);
        }
    };

    const closeUpgrade = useCallback(() => setUpgradeOpen(false), []);

    const handleUpgradeChoice = async (choice: "switch" | "keep") => {
        if (upgradePending || !packSuggestions?.bestValue) return;

        setUpgradePending(choice);
        setCartError("");
        setAddOnNotice("");
        try {
            if (choice === "switch") {
                await addPlanToCart(packSuggestions.bestValue);
            } else {
                await addSelectionToCart();
            }
            setUpgradeOpen(false);
        } catch (error) {
            setCartError(error instanceof Error ? error.message : "Unable to add to cart");
            setUpgradeOpen(false);
        } finally {
            setUpgradePending(null);
        }
    };

    const handleAddToCart = async () => {
        if (onAddToCart) return onAddToCart(product, quantity, totalPrice);
        if (pending || outOfStock) return;

        // A bigger pack gives more for less (or a little more): ask first.
        if (packSuggestions?.bestValue) {
            setUpgradeOpen(true);
            return;
        }

        setPending("cart");
        setCartError("");
        setAddOnNotice("");
        try {
            await addSelectionToCart();
        } catch (error) {
            setCartError(error instanceof Error ? error.message : "Unable to add to cart");
        } finally {
            setPending(null);
        }
    };

    const handleBuyNow = async () => {
        if (onBuyNow) return onBuyNow(product, quantity, totalPrice);
        if (pending || outOfStock) return;

        setPending("buy");
        setCartError("");
        setAddOnNotice("");
        try {
            await addToCart(product._id, quantity);
            // Checkout shows the real cart, so carry on even if the add-on failed.
            await addSelectedAddOn();
            router.push("/checkout");
            // Keep the spinner while the checkout page loads.
        } catch (error) {
            setCartError(error instanceof Error ? error.message : "Unable to start checkout");
            setPending(null);
        }
    };

    // -----------------------------------
    // Quantity update
    // -----------------------------------

    const updateQuantity = (value: number) => {
        setQuantity(
            Math.max(1, Math.min(value, product.stock))
        );
    };

    // Radio-group keyboard support: arrow keys move to and select the
    // previous/next enabled option.
    const handleOfferKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
        const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
        if (!forward && !backward) return;

        const radios = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>(
                '[role="radio"]:not(:disabled)'
            )
        );
        if (radios.length === 0) return;

        event.preventDefault();
        const current = radios.indexOf(
            document.activeElement as HTMLButtonElement
        );
        const next =
            current === -1
                ? 0
                : (current + (forward ? 1 : -1) + radios.length) % radios.length;
        radios[next].focus();
        if (radios[next].getAttribute("aria-checked") !== "true") {
            radios[next].click();
        }
    };

    // Roving tabindex: the selected option (or the first one when nothing
    // is selected) is the single tab stop in the group.
    const anyPackSelected =
        packOptions.some((option) => option.quantity === quantity) || bulkActive;

    // Trust bar under the buy section (licence number from admin, when set).
    // Replaced on the page by the "Our standard" section (Components/OurStandard.tsx);
    // kept for reference with the commented-out markup below.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const trustItems = [
        {
            title: "WHO-GMP facility",
            text: product.licenceNumber
                ? `Mfg. Lic. No. ${product.licenceNumber}`
                : "Made in a WHO-GMP licensed facility",
        },
        { title: "Plain packaging", text: "Nothing on the box says what's inside" },
        { title: "Private billing", text: "Neutral name on bank & UPI statements" },
        { title: "COD or prepaid", text: `Extra ${ONLINE_PAYMENT_DISCOUNT_PERCENT}% off when you pay online` },
    ];

    const sectionLabel = "font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-navy";

    return (
        <section className="w-full bg-white text-brand-navy">
            <div className="pdp-container py-4 sm:py-5 lg:py-4">

                {/* Breadcrumb */}
                <nav className="mb-3 flex min-w-0 flex-wrap items-center gap-2 font-body text-xs text-brand-navy-muted sm:mb-4 sm:text-sm">
                    <Link
                        href="/"
                        className="transition hover:text-brand-navy"
                    >
                        Home
                    </Link>

                    <ChevronRight size={13} />

                    <Link
                        href="/products"
                        className="transition hover:text-brand-navy"
                    >
                        Shop
                    </Link>

                    <ChevronRight size={13} />

                    <span className="min-w-0 break-words font-medium text-brand-navy">
                        {product.name}
                    </span>
                </nav>

                {/* Main Product Layout */}
                <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">

                    {/* LEFT: Product Images */}
                    <div className="w-full min-w-0 lg:sticky lg:top-[92px]">
                        {/* Swipe on phone; click + ← → on desktop */}
                        <ProductGallery
                            images={product.images ?? []}
                            name={product.name}
                            badge={galleryBadge}
                        />
                    </div>

                    {/* RIGHT: Product Details */}
                    <div className="flex min-w-0 flex-col">

                        {/* Category */}
                        <p className="mb-1 font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-success-green sm:text-xs">
                            {product.category}
                        </p>

                        {/* Product Name */}
                        <h1 className="break-words font-heading text-[25px] font-semibold uppercase leading-[1.2] tracking-wide sm:text-3xl lg:text-[30px]">
                            {product.name}
                        </h1>

                        {/* Description: bullet lines ("- ", "• ", "* ") render as points */}
                        <RichDescription
                            text={product.description}
                            className="mt-2 font-body text-xs leading-6 text-brand-navy-muted sm:text-sm"
                        />

                        {/* Rating */}
                        {rating && rating.count > 0 && (
                            <a
                                href="#reviews"
                                className="mt-2 flex w-fit items-center gap-1.5 font-body text-xs text-brand-navy-muted transition hover:text-brand-navy"
                            >
                                <span className="flex items-center gap-0.5" aria-hidden="true">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={13}
                                            strokeWidth={0}
                                            fill="currentColor"
                                            className={star <= Math.round(rating.average) ? "text-brand-navy" : "text-olympus"}
                                        />
                                    ))}
                                </span>
                                <span className="font-semibold text-brand-navy">
                                    {rating.average.toFixed(1)}
                                </span>
                                <span>
                                    · ({rating.count}) verified {rating.count === 1 ? "review" : "reviews"}
                                </span>
                            </a>
                        )}

                        {/* Quick points */}
                        {quickPoints.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {quickPoints.map((point, index) => (
                                    <li key={index} className="flex items-start gap-2 font-body text-xs text-brand-navy sm:text-sm">
                                        <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success-green" aria-hidden="true" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Choose strength */}
                        {strengthOptions.length > 1 && (
                            <div className="mt-4">
                                <p className={sectionLabel}>Choose strength</p>

                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {strengthOptions.map((option) => {
                                        const body = (
                                            <>
                                                <span className="block font-heading text-sm font-semibold uppercase tracking-wide max-sm:text-[11px] max-sm:leading-snug max-sm:tracking-normal">
                                                    {option.name}
                                                </span>
                                                <span className={`mt-0.5 block font-body text-xs max-sm:text-[10px] ${option.current ? "text-olympus" : "text-brand-navy-muted"}`}>
                                                    {option.label ? `${option.label} · ` : ""}from {formatPrice(option.price)}
                                                    {!option.inStock && " · Out of stock"}
                                                </span>
                                            </>
                                        );

                                        return option.current ? (
                                            <div
                                                key={option._id}
                                                aria-current="true"
                                                className="rounded-lg border border-brand-navy bg-brand-navy px-3 py-2 text-white max-sm:px-2.5 max-sm:py-1.5"
                                            >
                                                {body}
                                            </div>
                                        ) : (
                                            <Link
                                                key={option._id}
                                                href={`/products/${option.slug || option._id}`}
                                                onClick={() => rememberStrengthOrder(option._id)}
                                                className="rounded-lg border border-olympus bg-white px-3 py-2 text-brand-navy transition hover:border-brand-navy max-sm:px-2.5 max-sm:py-1.5"
                                            >
                                                {body}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* "Not sure which strength?" WhatsApp note - removed for now
                                <p className="mt-2 font-body text-xs text-brand-navy-muted">
                                    Not sure which strength?{" "}
                                    <a
                                        href={WHATSAPP_LINK}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-brand-navy underline underline-offset-2"
                                    >
                                        Ask our team on WhatsApp
                                    </a>
                                    {" "}- free and private
                                </p>
                                */}
                            </div>
                        )}

                        {/* Choose pack */}
                        <div className="mt-4">
                            <p id="choose-pack-heading" className={sectionLabel}>Choose pack</p>

                            <div
                                role="radiogroup"
                                aria-labelledby="choose-pack-heading"
                                onKeyDown={handleOfferKeyDown}
                                className="mt-2 space-y-2"
                            >
                                {packOptions.map((option, index) => {
                                    const isSelected = quantity === option.quantity;
                                    const regularPrice = unitMrp * option.quantity;
                                    const optionSavings = Math.max(0, regularPrice - option.price);
                                    const exceedsStock = option.quantity > product.stock;
                                    const packsText = `${option.quantity} ${option.quantity === 1 ? "pack" : "packs"}`;
                                    const unitsText = packUnits && unitLabel
                                        ? ` · ${option.quantity * packUnits} ${unitLabel}`
                                        : "";
                                    const subText =
                                        perUnitText(option.price, option.quantity) ||
                                        option.description?.trim() ||
                                        "";

                                    return (
                                        <button
                                            type="button"
                                            key={option.quantity}
                                            role="radio"
                                            aria-checked={isSelected}
                                            tabIndex={isSelected || (!anyPackSelected && index === 0) ? 0 : -1}
                                            disabled={exceedsStock}
                                            onClick={() => setQuantity(option.quantity)}
                                            className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition sm:px-4 ${isSelected
                                                ? "border-brand-navy bg-white ring-1 ring-brand-navy"
                                                : "border-olympus bg-white hover:border-brand-navy"
                                                } disabled:cursor-not-allowed disabled:opacity-40`}
                                        >
                                            <span className="min-w-0">
                                                <span className="flex flex-wrap items-center gap-2 font-body text-sm font-semibold">
                                                    {option.title?.trim() || `${packsText}${unitsText}`}
                                                    {option.badge && (
                                                        <span className="rounded-full bg-brand-navy px-2 py-0.5 font-body text-[10px] font-semibold text-white">
                                                            {option.badge}
                                                        </span>
                                                    )}
                                                </span>
                                                {subText && (
                                                    <span className="mt-0.5 block font-body text-xs text-brand-navy-muted">
                                                        {subText}
                                                    </span>
                                                )}
                                            </span>

                                            <span className="shrink-0 text-right">
                                                <span className="block font-body text-sm font-bold">
                                                    {formatPrice(option.price)}
                                                </span>
                                                {optionSavings > 0 && (
                                                    <span className="block font-body text-xs font-semibold text-success-green">
                                                        Save {formatPrice(optionSavings)}
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}

                                {/* Bulk percent off above the largest combo */}
                                {bulkPercent > 0 && (
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={bulkActive}
                                        tabIndex={bulkActive ? 0 : -1}
                                        disabled={bulkMinQuantity > product.stock}
                                        onClick={() => setQuantity(bulkMinQuantity)}
                                        className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition sm:px-4 ${bulkActive
                                            ? "border-brand-navy bg-white ring-1 ring-brand-navy"
                                            : "border-olympus bg-white hover:border-brand-navy"
                                            } disabled:cursor-not-allowed disabled:opacity-40`}
                                    >
                                        <span className="min-w-0">
                                            <span className="block font-body text-sm font-semibold">
                                                {bulkMinQuantity}+ packs
                                            </span>
                                            <span className="mt-0.5 block font-body text-xs text-brand-navy-muted">
                                                {bulkActive ? `Applied to ${quantity} packs` : "On every pack"}
                                            </span>
                                        </span>
                                        <span className="shrink-0 font-body text-sm font-bold text-success-green">
                                            {bulkPercent}% off
                                        </span>
                                    </button>
                                )}
                            </div>

                            {/* Any other quantity */}
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <span className="font-body text-xs text-brand-navy-muted">Quantity</span>
                                <div className="flex h-9 items-center rounded-lg border border-olympus bg-white">
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(quantity - 1)}
                                        disabled={quantity <= 1 || outOfStock}
                                        aria-label="Decrease quantity"
                                        className="flex h-full w-9 items-center justify-center disabled:opacity-30"
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <span className="min-w-7 text-center font-body text-sm font-medium">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(quantity + 1)}
                                        disabled={quantity >= product.stock}
                                        aria-label="Increase quantity"
                                        className="flex h-full w-9 items-center justify-center disabled:opacity-30"
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>
                                {outOfStock && (
                                    <span className="font-body text-xs text-red-600">Out of stock</span>
                                )}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mt-3 rounded-lg border border-olympus bg-white p-3">
                            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                                <span className="font-body text-[26px] font-bold tracking-tight" aria-live="polite">
                                    {formatPrice(displayTotal)}
                                </span>
                                {displaySavings > 0 && (
                                    <>
                                        <s className="font-body text-sm text-brand-navy-muted">
                                            <span className="sr-only">MRP </span>
                                            {formatPrice(displayMrp)}
                                        </s>
                                        <span className="font-body text-sm font-semibold text-success-green">
                                            {displayPercentOff}% off
                                        </span>
                                    </>
                                )}
                            </div>

                            <p className="mt-1 font-body text-xs text-brand-navy-muted">
                                MRP inclusive of all taxes
                                {perUnitText(totalPrice, quantity) && ` · ${perUnitText(totalPrice, quantity)}`}
                            </p>

                            <p className="mt-1 font-body text-xs font-semibold text-success-green">
                                Pay online: {formatPrice(onlineTotal)} after extra {ONLINE_PAYMENT_DISCOUNT_PERCENT}% off
                            </p>
                        </div>

                        {/* Pack sizes: cheaper mix / better-value pack for this quantity */}
                        {packSuggestions && !outOfStock && (
                            <PackSuggestionsBox
                                suggestions={packSuggestions}
                                selectionLabel={selectionLabel}
                                pendingPlan={planPending}
                                disabled={pending !== null || planPending !== null}
                                onChoose={handleChoosePlan}
                            />
                        )}

                        {/* Add-on (upsell): tick to add it to the cart with this product */}
                        {addOn && !outOfStock && (
                            <label
                                className={`mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3 transition sm:gap-4 sm:p-3.5 ${addOnActive
                                    ? "border-brand-navy bg-white"
                                    : "border-olympus bg-white hover:border-brand-navy/50"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={addOnSelected}
                                    onChange={(event) => {
                                        setAddOnSelected(event.target.checked);
                                        setAddOnNotice("");
                                    }}
                                    disabled={pending !== null}
                                    className="h-5 w-5 shrink-0 cursor-pointer rounded accent-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
                                />

                                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-pale-gray">
                                    {addOn.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={addOn.image}
                                            alt=""
                                            loading="lazy"
                                            className="h-full w-full object-contain p-1"
                                        />
                                    ) : (
                                        <Package size={22} aria-hidden="true" className="text-brand-navy-muted" />
                                    )}
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="block font-body text-sm font-bold leading-snug text-brand-navy">
                                        {addOnTitle}
                                        {" · "}
                                        {formatPrice(addOn.price)}
                                        {addOnHasMrp && addOn.compareAtPrice && (
                                            <>
                                                {" "}
                                                <s className="font-medium text-brand-navy-muted">
                                                    <span className="sr-only">was </span>
                                                    {formatPrice(addOn.compareAtPrice)}
                                                </s>
                                            </>
                                        )}
                                    </span>
                                    {addOn.description?.trim() && (
                                        <span className="mt-0.5 block font-body text-sm leading-snug text-brand-navy-muted">
                                            {addOn.description}
                                        </span>
                                    )}
                                </span>
                            </label>
                        )}

                        {/* Add to Cart / Buy Now (watched by the sticky buy bar) */}
                        {/* Sticks to the bottom of the screen within this column until
                            reached; white background so the content behind is hidden. */}
                        <div
                            ref={buyButtonsRef}
                            className="sticky bottom-0 z-20 -mx-1 mt-3 grid grid-cols-2 gap-2 bg-white px-1 py-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-10px_16px_-12px_rgba(33,46,73,0.25)] sm:gap-3"
                        >

                            <button
                                type="button"
                                disabled={outOfStock || pending !== null || planPending !== null}
                                onClick={handleAddToCart}
                                className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-brand-navy bg-white px-3 font-body text-sm font-semibold text-brand-navy transition hover:bg-pale-gray disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {pending === "cart" ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <ShoppingBag size={16} />
                                )}
                                {pending === "cart" ? "Adding..." : "Add to cart"}
                            </button>

                            <button
                                type="button"
                                disabled={outOfStock || pending !== null}
                                onClick={handleBuyNow}
                                className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-brand-navy bg-brand-navy px-3 font-body text-sm font-semibold text-white transition hover:border-[#14284d] hover:bg-[#14284d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {pending === "buy" ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Zap size={16} />
                                )}
                                {pending === "buy" ? "Please wait..." : "Buy now"}
                            </button>

                            {cartError && (
                                <p role="alert" className="col-span-2 font-body text-xs text-red-600">
                                    {cartError}
                                </p>
                            )}

                            {addOnNotice && (
                                <p role="status" className="col-span-2 font-body text-xs text-[#8a4b08]">
                                    {addOnNotice}
                                </p>
                            )}
                        </div>

                        {/* Check delivery date (pincode) - removed for now */}
                        {/* <DeliveryCheck /> */}

                        {/* Prescription consultation-call note - removed for now
                        {/ * Prescription products: consultation call before dispatch * /}
                        {product.requiresPrescription && (
                            <div className="mt-3 flex items-start gap-3 rounded-lg border border-olympus bg-white p-3">
                                <Phone size={16} className="mt-0.5 shrink-0 text-brand-navy" aria-hidden="true" />
                                <p className="font-body text-xs leading-5 text-brand-navy-muted">
                                    <span className="font-semibold text-brand-navy">
                                        Every order gets a short, private call before dispatch.
                                    </span>{" "}
                                    Our team confirms your order and asks a few health questions (age, heart
                                    health, current medicines) so the product is safe for you.
                                </p>
                            </div>
                        )}

                        */}

                        {/* SKU - removed for now
                        <p className="mt-3 font-body text-[10px] text-brand-navy-muted sm:text-xs">
                            SKU: {product.sku}
                        </p>
                        */}
                    </div>
                </div>
            </div>

            {/* Trust bar (old design, replaced by <OurStandard /> in ProductPageView)
            <div className="w-full bg-brand-navy">
                <ul className="pdp-container grid grid-cols-2 gap-x-4 gap-y-4 py-5 sm:grid-cols-4 sm:py-6">
                    {trustItems.map((item) => (
                        <li key={item.title} className="min-w-0">
                            <p className="font-body text-xs font-semibold text-white sm:text-sm">
                                {item.title}
                            </p>
                            <p className="mt-1 font-body text-[11px] leading-4 text-palladium sm:text-xs">
                                {item.text}
                            </p>
                        </li>
                    ))}
                </ul>
            </div> */}

            {/* Sticky buy bar (same handlers and states as the buttons above) */}
            <div
                aria-hidden={!showStickyBar}
                inert={!showStickyBar}
                className={`fixed inset-x-0 bottom-0 z-40 border-t border-olympus bg-white/95 shadow-[0_-8px_24px_rgba(33,46,73,0.12)] backdrop-blur transition-transform duration-300 ${showStickyBar ? "translate-y-0" : "translate-y-full"}`}
            >
                <div className="pdp-container flex items-center gap-3 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
                    {/* Product and price (hidden on small phones to keep the buttons wide) */}
                    <div className="hidden min-w-0 flex-1 sm:block">
                        <p className="truncate font-body text-sm font-semibold text-brand-navy">{product.name}</p>
                        <p className="font-body text-xs text-brand-navy-muted">
                            {quantity > 1 ? `${quantity} packs · ` : ""}
                            <span className="font-semibold text-brand-navy">{formatPrice(displayTotal)}</span>
                            {onlineDiscount > 0 && ` · ${formatPrice(onlineTotal)} if you pay online`}
                        </p>
                    </div>

                    <div className="grid flex-1 grid-cols-2 gap-2 sm:max-w-md sm:flex-none sm:basis-[26rem]">
                        <button
                            type="button"
                            disabled={outOfStock || pending !== null || planPending !== null}
                            onClick={handleAddToCart}
                            className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-brand-navy bg-white px-3 font-body text-sm font-semibold text-brand-navy transition hover:bg-pale-gray disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {pending === "cart" ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                            {pending === "cart" ? "Adding..." : outOfStock ? "Out of stock" : "Add to cart"}
                        </button>
                        <button
                            type="button"
                            disabled={outOfStock || pending !== null}
                            onClick={handleBuyNow}
                            className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-brand-navy bg-brand-navy px-3 font-body text-sm font-semibold text-white transition hover:border-[#14284d] hover:bg-[#14284d] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {pending === "buy" ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                            {pending === "buy" ? "Please wait..." : "Buy now"}
                        </button>
                    </div>
                </div>
                {cartError && showStickyBar && (
                    <p role="alert" className="pdp-container pb-2 font-body text-xs text-red-600">{cartError}</p>
                )}
            </div>

            {upgradeOpen && packSuggestions?.bestValue && (
                <PackUpgradeDialog
                    suggestions={packSuggestions}
                    plan={packSuggestions.bestValue}
                    selectionLabel={selectionLabel}
                    pending={upgradePending}
                    onSwitch={() => handleUpgradeChoice("switch")}
                    onKeep={() => handleUpgradeChoice("keep")}
                    onClose={closeUpgrade}
                />
            )}
        </section>
    );
}
