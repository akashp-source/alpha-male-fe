
"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
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
import ProductGallery from "./ProductGallery";
import { PackSuggestionsBox, PackUpgradeDialog } from "./PackSuggestions";
import RichDescription from "./RichDescription";
import {
    Loader2,
    Minus,
    Plus,
    ShoppingBag,
    Zap,
    Check,
    ShieldCheck,
    Package,
    RefreshCcw,
    ChevronRight,
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

    const activeCombo =
        pricing.appliedOffer?.type === "COMBO"
            ? product.comboOffers?.find(
                (offer) => offer.quantity === quantity
            ) ?? null
            : null;

    const bulkPercent = getBulkDiscountPercent(product);
    const bulkMinQuantity = getBulkDiscountMinQuantity(product);
    const bulkActive = pricing.appliedOffer?.type === "BULK_PERCENT";
    const hasOffers = product.comboOffers?.length > 0 || bulkPercent > 0;

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
    // What the summary shows: main product (+ add-on when ticked).
    const displayTotal = totalPrice + (addOnActive && addOn ? addOn.price : 0);
    const displayItems = quantity + (addOnActive ? 1 : 0);
    const addOnSavings =
        addOnActive && addOn && addOnHasMrp && addOn.compareAtPrice
            ? addOn.compareAtPrice - addOn.price
            : 0;

    // Savings are measured against the 1-qty strike-through price (MRP)
    // when there is one, so combos show the full discount off MRP.
    const unitMrp =
        product.compareAtPrice && product.compareAtPrice > product.price
            ? product.compareAtPrice
            : product.price;

    const originalPrice = unitMrp * quantity;

    const savings = Math.max(0, originalPrice - totalPrice);
    const displaySavings = savings + addOnSavings;

    const discountPercentage =
        product.compareAtPrice &&
            product.compareAtPrice > product.price
            ? Math.round(
                ((product.compareAtPrice - product.price) /
                    product.compareAtPrice) *
                100
            )
            : 0;

    const outOfStock = product.stock <= 0;

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

    const formatPrice = (price: number) =>
        `₹${price.toLocaleString("en-IN")}`;

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

    // -----------------------------------
    // Combo selection
    // Click selected combo again to reset
    // -----------------------------------

    const selectCombo = (offerQuantity: number) => {
        if (quantity === offerQuantity) {
            setQuantity(1);
            return;
        }

        if (offerQuantity <= product.stock) {
            setQuantity(offerQuantity);
        }
    };

    // Radio-group keyboard support: arrow keys move to and select the
    // previous/next enabled offer.
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

    // Roving tabindex: the selected offer (or the first enabled one when
    // nothing is selected) is the single tab stop in the group.
    const firstEnabledComboIndex = (product.comboOffers ?? []).findIndex(
        (offer) => offer.quantity <= product.stock
    );
    const anyOfferSelected = activeCombo !== null || bulkActive;

    return (
        <section className="w-full bg-[#faf7f2] text-[#211b17]">
            <div className="pdp-container py-4 sm:py-5 lg:py-6">

                {/* Breadcrumb */}
                <nav className="mb-4 flex min-w-0 flex-wrap items-center gap-2 font-body text-xs text-[#968a80] sm:mb-5 sm:text-sm">
                    <a
                        href="/"
                        className="transition hover:text-[#176348]"
                    >
                        Home
                    </a>

                    <ChevronRight size={13} />

                    <a
                        href="/products"
                        className="transition hover:text-[#176348]"
                    >
                        Shop
                    </a>

                    <ChevronRight size={13} />

                    <span className="min-w-0 break-words font-medium uppercase text-[#211b17]">
                        {product.name}
                    </span>
                </nav>

                {/* Main Product Layout */}
                <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">

                    {/* LEFT: Product Images */}
                    <div className="w-full min-w-0 lg:sticky lg:top-[92px]">
                        {/* Swipe on phone; click + ← → on desktop */}
                        <ProductGallery images={product.images ?? []} name={product.name} />
                    </div>

                    {/* RIGHT: Product Details */}
                    <div className="flex min-w-0 flex-col">

                        {/* Category */}
                        <p className="order-1 mb-1 font-body text-[10px] font-bold uppercase tracking-[0.25em] text-[#176348] sm:text-xs">
                            {product.category}
                        </p>

                        {/* Product Name */}
                        <h1 className="order-1 break-words font-heading text-[25px] font-bold uppercase leading-[1.2] tracking-wide sm:text-3xl lg:text-[34px]">
                            {product.name}
                        </h1>

                        {/* Description: bullet lines ("- ", "• ", "* ") render as points */}
                        <RichDescription
                            text={product.description}
                            className="order-8 mt-3 font-body text-xs leading-6 text-[#5c534b] sm:text-sm md:order-2"
                        />

                        {/* Product Price */}
                        <div className="order-2 mt-1 flex flex-wrap items-center gap-2.5 sm:mt-2 lg:mt-1">
                            <span className="font-body text-[27px] font-bold tracking-tight sm:text-3xl">
                                {formatPrice(product.price)}
                            </span>

                            {product.compareAtPrice &&
                                product.compareAtPrice > product.price && (
                                    <>
                                        <span className="font-body text-sm text-[#a69a90] line-through sm:text-base">
                                            {formatPrice(
                                                product.compareAtPrice
                                            )}
                                        </span>

                                        <span className="rounded-md bg-[#e5f1e9] px-2.5 py-1 font-body text-[10px] font-bold text-[#176348] sm:text-xs">
                                            {discountPercentage}% OFF
                                        </span>
                                    </>
                                )}
                        </div>

                        <p className="order-2 mt-0.5 font-body text-[10px] text-[#9a8e84] sm:text-xs">
                            Inclusive of all taxes
                        </p>

                        {/* Quantity Selector */}
                        <div className="order-3 mt-2 flex flex-wrap items-center gap-3 lg:mt-2">
                            <div className="flex h-11 items-center rounded-lg border border-[#e3d9ce] bg-white sm:h-12">

                                <button
                                    type="button"
                                    onClick={() =>
                                        updateQuantity(quantity - 1)
                                    }
                                    disabled={
                                        quantity <= 1 || outOfStock
                                    }
                                    aria-label="Decrease quantity"
                                    className="flex h-full w-10 items-center justify-center disabled:opacity-30"
                                >
                                    <Minus size={14} />
                                </button>

                                <span className="min-w-7 text-center font-body text-sm font-medium">
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        updateQuantity(quantity + 1)
                                    }
                                    disabled={
                                        quantity >= product.stock
                                    }
                                    aria-label="Increase quantity"
                                    className="flex h-full w-10 items-center justify-center disabled:opacity-30"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <span
                                className={`font-body text-xs ${outOfStock
                                    ? "text-red-600"
                                    : "text-[#8b8077]"
                                    }`}
                            >
                                {outOfStock
                                    ? "Out of stock"
                                    : `${product.stock} available`}
                            </span>
                        </div>

                        {/* Combo Offers */}
                        {hasOffers && (
                            <div className="order-4 mt-2 sm:mt-3 lg:mt-2">

                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <div>
                                        <h2
                                            id="combo-offers-heading"
                                            className="font-heading text-base font-bold sm:text-lg"
                                        >
                                            Special Combo Offers
                                        </h2>

                                        <p className="mt-1 font-body text-xs text-[#94877d] sm:text-sm">
                                            Buy more and save more
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-[#e5f1e9] px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-[#176348]">
                                        Best Deals
                                    </span>
                                </div>

                                <div
                                    role="radiogroup"
                                    aria-labelledby="combo-offers-heading"
                                    onKeyDown={handleOfferKeyDown}
                                >
                                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">

                                    {(product.comboOffers ?? []).map(
                                        (offer, index) => {
                                            const isSelected =
                                                quantity === offer.quantity;

                                            const regularPrice =
                                                unitMrp *
                                                offer.quantity;

                                            const offerSavings =
                                                Math.max(
                                                    0,
                                                    regularPrice -
                                                    offer.offerPrice
                                                );

                                            const offerSavingsPercent =
                                                regularPrice > 0
                                                    ? Math.round(
                                                        (offerSavings /
                                                            regularPrice) *
                                                        100
                                                    )
                                                    : 0;

                                            const exceedsStock =
                                                offer.quantity >
                                                product.stock;

                                            return (
                                                <button
                                                    type="button"
                                                    key={index}
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    tabIndex={
                                                        isSelected ||
                                                            (!anyOfferSelected &&
                                                                index === firstEnabledComboIndex)
                                                            ? 0
                                                            : -1
                                                    }
                                                    disabled={exceedsStock}
                                                    onClick={() =>
                                                        selectCombo(
                                                            offer.quantity
                                                        )
                                                    }
                                                    className={`relative min-w-0 rounded-xl border p-2 text-left transition-all sm:p-2.5 ${isSelected
                                                        ? "border-[#176348] bg-[#edf5ef] ring-1 ring-[#176348]"
                                                        : "border-[#e5dcd2] bg-white hover:border-[#176348]"
                                                        } disabled:cursor-not-allowed disabled:opacity-40`}
                                                >
                                                    {isSelected && (
                                                        <span
                                                            aria-hidden="true"
                                                            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#176348] text-white sm:right-3 sm:top-3"
                                                        >
                                                            <Check size={12} strokeWidth={3} />
                                                        </span>
                                                    )}

                                                    <p className="break-words pr-6 font-body text-xs font-bold leading-snug sm:text-sm">
                                                        {offer.title ||
                                                            `Buy ${offer.quantity} Packs`}
                                                    </p>

                                                    {offer.description && (
                                                        <p className="mt-1 break-words font-body text-xs leading-4 text-[#91857b]">
                                                            {offer.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                                        <span className="font-body text-sm font-bold text-[#176348] sm:text-lg">
                                                            {formatPrice(
                                                                offer.offerPrice
                                                            )}
                                                        </span>

                                                        <span className="font-body text-xs text-[#a69a90] line-through">
                                                            {formatPrice(
                                                                regularPrice
                                                            )}
                                                        </span>
                                                    </div>

                                                    {offerSavings > 0 && (
                                                        <p className="mt-1 font-body text-xs font-semibold text-[#176348]">
                                                            Save{" "}
                                                            {formatPrice(
                                                                offerSavings
                                                            )}
                                                            {offerSavingsPercent > 0 &&
                                                                ` (${offerSavingsPercent}% off)`}
                                                        </p>
                                                    )}

                                                    {isSelected && (
                                                        <p className="mt-1 font-body text-xs font-semibold text-[#176348]">
                                                            Selected
                                                        </p>
                                                    )}
                                                </button>
                                            );
                                        }
                                    )}
                                </div>

                                {/* Bulk percent off above the largest combo */}
                                {bulkPercent > 0 && (
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={bulkActive}
                                        tabIndex={
                                            bulkActive ||
                                                (!anyOfferSelected &&
                                                    firstEnabledComboIndex === -1)
                                                ? 0
                                                : -1
                                        }
                                        disabled={bulkMinQuantity > product.stock}
                                        onClick={() =>
                                            bulkActive
                                                ? setQuantity(1)
                                                : setQuantity(bulkMinQuantity)
                                        }
                                        className={`relative mt-2 w-full min-w-0 rounded-xl border p-2 text-left transition-all sm:p-2.5 ${bulkActive
                                            ? "border-[#176348] bg-[#edf5ef] ring-1 ring-[#176348]"
                                            : "border-[#e5dcd2] bg-white hover:border-[#176348]"
                                            } disabled:cursor-not-allowed disabled:opacity-40`}
                                    >
                                        {bulkActive && (
                                            <span
                                                aria-hidden="true"
                                                className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#176348] text-white sm:right-3 sm:top-3"
                                            >
                                                <Check size={12} strokeWidth={3} />
                                            </span>
                                        )}

                                        <p className="break-words pr-6 font-body text-xs font-bold leading-snug sm:text-sm">
                                            Buy {bulkMinQuantity}+ packs
                                        </p>

                                        <p className="mt-1 font-body text-sm font-bold text-[#176348] sm:text-base">
                                            {bulkPercent}% OFF
                                            <span className="ml-1 font-body text-xs font-semibold text-[#91857b]">
                                                on every pack
                                            </span>
                                        </p>

                                        {bulkActive && (
                                            <p className="mt-1 font-body text-xs font-semibold text-[#176348]">
                                                Applied to {quantity} packs
                                            </p>
                                        )}
                                    </button>
                                )}
                                </div>

                                {/* Remove Combo */}
                                {(activeCombo || bulkActive) && (
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(1)}
                                        className="mt-2 font-body text-xs font-semibold text-[#176348] underline underline-offset-4"
                                    >
                                        Remove combo selection
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Total Price Summary */}
                        <div className="order-5 mt-2 flex items-center justify-between gap-3 rounded-xl border border-[#eee5dc] bg-white p-2.5 sm:p-3">

                            <div>
                                <p className="font-body text-xs text-[#5c534b]">
                                    Total amount ({displayItems}{" "}
                                    {displayItems === 1 ? "item" : "items"})
                                </p>

                                <p className="mt-1 font-body text-xl font-bold sm:text-2xl" aria-live="polite">
                                    {formatPrice(displayTotal)}
                                </p>
                            </div>

                            {displaySavings > 0 && (
                                <div className="text-right">
                                    <p className="font-body text-xs text-[#5c534b]">
                                        You save
                                    </p>

                                    <p className="mt-1 font-body text-xs font-bold text-[#176348] sm:text-sm">
                                        {formatPrice(displaySavings)}
                                    </p>
                                </div>
                            )}
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
                                className={`order-5 mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3 transition sm:gap-4 sm:p-3.5 ${addOnActive
                                    ? "border-[#071630] bg-[#eef1f6]"
                                    : "border-[#d9cfc4] bg-white hover:border-[#071630]/50"
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
                                    className="h-5 w-5 shrink-0 cursor-pointer rounded accent-[#071630] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#071630] focus-visible:ring-offset-2"
                                />

                                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eee8de]">
                                    {addOn.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={addOn.image}
                                            alt=""
                                            loading="lazy"
                                            className="h-full w-full object-contain p-1"
                                        />
                                    ) : (
                                        <Package size={22} aria-hidden="true" className="text-[#5c534b]" />
                                    )}
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="block font-body text-sm font-bold leading-snug text-[#211b17]">
                                        {addOnTitle}
                                        {" · "}
                                        {formatPrice(addOn.price)}
                                        {addOnHasMrp && addOn.compareAtPrice && (
                                            <>
                                                {" "}
                                                <s className="font-medium text-[#5c534b]">
                                                    <span className="sr-only">was </span>
                                                    {formatPrice(addOn.compareAtPrice)}
                                                </s>
                                            </>
                                        )}
                                    </span>
                                    {addOn.description?.trim() && (
                                        <span className="mt-0.5 block font-body text-sm leading-snug text-[#5c534b]">
                                            {addOn.description}
                                        </span>
                                    )}
                                </span>
                            </label>
                        )}

                        {/* Add to Cart / Buy Now */}
                        <div className="order-6 mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">

                            <button
                                type="button"
                                disabled={outOfStock || pending !== null || planPending !== null}
                                onClick={handleAddToCart}
                                className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#071630] bg-[#071630] px-4 font-body text-sm font-semibold text-white transition hover:border-[#14284d] hover:bg-[#14284d] disabled:cursor-not-allowed disabled:opacity-50"
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
                                className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#071630] bg-transparent px-4 font-body text-sm font-semibold text-[#071630] transition hover:bg-[#E9E9EA] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {pending === "buy" ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Zap size={16} />
                                )}
                                {pending === "buy" ? "Please wait..." : "Buy now"}
                            </button>

                            {cartError && (
                                <p role="alert" className="font-body text-xs text-red-600 sm:col-span-2">
                                    {cartError}
                                </p>
                            )}

                            {addOnNotice && (
                                <p role="status" className="font-body text-xs text-[#8a4b08] sm:col-span-2">
                                    {addOnNotice}
                                </p>
                            )}
                        </div>

                        {/* Trust Features */}
                        <div className="order-7 mt-3 grid grid-cols-3 gap-2 border-t border-[#e8ded4] pt-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3 sm:pt-4">

                            <div className="flex min-w-0 flex-col items-center gap-1 text-center font-body text-xs leading-tight text-[#5c534b] sm:flex-row">
                                <Package size={14} className="shrink-0" />
                                Plain packaging
                            </div>

                            <div className="flex min-w-0 flex-col items-center gap-1 text-center font-body text-xs leading-tight text-[#5c534b] sm:flex-row">
                                <ShieldCheck size={14} className="shrink-0" />
                                Private billing
                            </div>

                            <div className="flex min-w-0 flex-col items-center gap-1 text-center font-body text-xs leading-tight text-[#5c534b] sm:flex-row">
                                <RefreshCcw size={14} className="shrink-0" />
                                Easy returns
                            </div>
                        </div>

                        {/* SKU */}
                        <p className="order-9 mt-3 font-body text-[10px] text-[#a1958b] sm:text-xs">
                            SKU: {product.sku}
                        </p>
                    </div>
                </div>
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
