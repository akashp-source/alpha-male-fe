"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, ShieldCheck, RefreshCw, Plus, X, CircleAlert } from "lucide-react";
import AccountSidebar from "@/Components/user/AccountSidebar";
import LocationSelect from "@/Components/Utils/LocationSelect";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

interface Address {
    _id?: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

interface Profile {
    name: string;
    email: string;
    addresses: Address[];
}

interface AddressForm {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

const emptyAddress: AddressForm = {
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
};

function titleCase(value = "") {
    return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function SavedAddressesPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);
    const [savingAddress, setSavingAddress] = useState(false);
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        if (!toastMessage) return;
        const timeout = window.setTimeout(() => setToastMessage(""), 4500);
        return () => window.clearTimeout(timeout);
    }, [toastMessage]);

    useEffect(() => {
        const token = window.localStorage.getItem("token");
        if (!token) {
            router.replace("/user/login");
            return;
        }

        const controller = new AbortController();
        fetch(`${API_URL}/user/profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
            signal: controller.signal,
        })
            .then(async (response) => {
                if (response.status === 401) {
                    window.localStorage.removeItem("token");
                    window.localStorage.removeItem("user");
                    router.replace("/user/login");
                    return null;
                }
                if (!response.ok) throw new Error("Unable to load your saved addresses.");
                return (await response.json()) as Profile;
            })
            .then((data) => {
                if (data) setProfile(data);
            })
            .catch((cause: unknown) => {
                if (!controller.signal.aborted) {
                    setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [router]);

    const addresses = [...(profile?.addresses ?? [])].sort(
        (a, b) => Number(b.isDefault) - Number(a.isDefault)
    );

    async function addAddress(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError("");
        setSuccessMessage("");
        setToastMessage("");

        if (!addressForm.state || !addressForm.city) {
            setFormError("Select a state and city.");
            return;
        }
        if (!/^\d{10}$/.test(addressForm.phone)) {
            setFormError("Phone number must be exactly 10 digits.");
            return;
        }
        if (!/^\d{6}$/.test(addressForm.pincode)) {
            setFormError("Pincode must be exactly 6 digits.");
            return;
        }

        const token = window.localStorage.getItem("token");
        if (!token) {
            router.replace("/user/login");
            return;
        }

        setSavingAddress(true);
        try {
            const response = await fetch(`${API_URL}/user/address`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: addressForm.fullName.trim(),
                    phone: addressForm.phone,
                    addressLine1: addressForm.addressLine1.trim(),
                    ...(addressForm.addressLine2.trim() ? { addressLine2: addressForm.addressLine2.trim() } : {}),
                    city: addressForm.city.trim(),
                    state: addressForm.state.trim(),
                    pincode: addressForm.pincode,
                    isDefault: addressForm.isDefault,
                }),
            });

            const result = await response.json().catch(() => ({}));
            if (response.status === 401) {
                window.localStorage.removeItem("token");
                window.localStorage.removeItem("user");
                router.replace("/user/login");
                return;
            }
            const message = Array.isArray(result.message)
                ? result.message.join(" ")
                : typeof result.message === "string"
                    ? result.message
                    : "";
            if (message === "Address already exists") {
                setToastMessage(message);
                return;
            }
            if (!response.ok) {
                throw new Error(message || "Unable to save this address.");
            }

            const addedAddress: Address = { ...addressForm, isDefault: addressForm.isDefault };
            setProfile((current) => current ? {
                ...current,
                addresses: [
                    ...(addressForm.isDefault ? current.addresses.map((address) => ({ ...address, isDefault: false })) : current.addresses),
                    addedAddress,
                ],
            } : current);
            setAddressForm(emptyAddress);
            setShowAddressForm(false);
            setSuccessMessage("Address added successfully.");

            try {
                const refreshedProfile = await fetch(`${API_URL}/user/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                if (refreshedProfile.ok) setProfile((await refreshedProfile.json()) as Profile);
            } catch {
                // The new address is already reflected optimistically above.
            }
        } catch (cause) {
            setFormError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
        } finally {
            setSavingAddress(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#fafbfc]">
            {toastMessage && (
                <div role="alert" aria-live="assertive" className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-3.5 text-sm text-[#07152e] shadow-lg sm:right-6 sm:top-6">
                    <CircleAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
                    <p className="min-w-0 flex-1 font-medium">{toastMessage}</p>
                    <button type="button" aria-label="Dismiss notification" onClick={() => setToastMessage("")} className="rounded p-0.5 text-[#718096] hover:bg-[#f1f3f6] hover:text-[#07152e]"><X size={16} /></button>
                </div>
            )}
            <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12 pb-28 lg:pb-28">
                <div className="mb-7">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#176348]">Your account</p>
                    <h1 className="mt-2 font-heading text-2xl font-bold tracking-wide text-[#07152e] sm:text-3xl">SAVED ADDRESSES</h1>
                    <p className="mt-2 text-xs text-[#91857b] sm:text-sm">Manage the addresses you use for delivery.</p>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-7">
                    <AccountSidebar name={titleCase(profile?.name || "Customer")} email={profile?.email} />
                    <section className="min-w-0 rounded-[22px] border border-[#e1e6ee] bg-white p-5 sm:p-6">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-[#07152e]">Delivery addresses</h2>
                                <p className="mt-1 text-[11px] text-[#718096]">Addresses saved to your account.</p>
                            </div>
                            {!loading && !error && (
                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                    <span className="text-[11px] font-medium text-[#718096]">{addresses.length} saved</span>
                                    <button type="button" onClick={() => { setShowAddressForm((visible) => !visible); setFormError(""); }} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#07152e] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#12294b]">
                                        {showAddressForm ? <X size={15} /> : <Plus size={15} />}
                                        {showAddressForm ? "Close" : "Add address"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {successMessage && <p role="status" className="mb-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-xs font-medium text-green-700">{successMessage}</p>}

                        {showAddressForm && !loading && !error && (
                            <form onSubmit={addAddress} className="mb-5 rounded-2xl border border-[#dce2ea] bg-[#f8f9fb] p-4 sm:p-5">
                                <div className="mb-4">
                                    <h3 className="text-sm font-bold text-[#07152e]">Add a delivery address</h3>
                                    <p className="mt-1 text-xs text-[#718096]">Enter the recipient and delivery details.</p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="text-xs font-semibold text-[#344054]">Full name
                                        <input required maxLength={100} autoComplete="name" value={addressForm.fullName} onChange={(event) => setAddressForm({ ...addressForm, fullName: event.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-[#dce2ea] bg-white px-3 text-sm font-normal text-[#07152e] outline-none focus:border-[#07152e]" />
                                    </label>
                                    <label className="text-xs font-semibold text-[#344054]">Phone number
                                        <input required type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[0-9]{10}" maxLength={10} title="Enter exactly 10 digits" value={addressForm.phone} onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value.replace(/\D/g, "").slice(0, 10) })} className="mt-1.5 h-11 w-full rounded-xl border border-[#dce2ea] bg-white px-3 text-sm font-normal text-[#07152e] outline-none focus:border-[#07152e]" />
                                    </label>
                                    <label className="text-xs font-semibold text-[#344054] sm:col-span-2">Address line 1
                                        <input required maxLength={200} autoComplete="address-line1" value={addressForm.addressLine1} onChange={(event) => setAddressForm({ ...addressForm, addressLine1: event.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-[#dce2ea] bg-white px-3 text-sm font-normal text-[#07152e] outline-none focus:border-[#07152e]" />
                                    </label>
                                    <label className="text-xs font-semibold text-[#344054] sm:col-span-2">Address line 2 <span className="font-normal text-[#8b94a3]">(optional)</span>
                                        <input maxLength={200} autoComplete="address-line2" value={addressForm.addressLine2} onChange={(event) => setAddressForm({ ...addressForm, addressLine2: event.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-[#dce2ea] bg-white px-3 text-sm font-normal text-[#07152e] outline-none focus:border-[#07152e]" />
                                    </label>
                                    <div className="min-w-0 sm:col-span-2">
                                        <LocationSelect
                                            key={`${addressForm.state}-${addressForm.city}`}
                                            initialState={addressForm.state}
                                            initialCity={addressForm.city}
                                            onChange={({ state, city }) => setAddressForm((current) => ({ ...current, state, city }))}
                                        />
                                    </div>
                                    <label className="text-xs font-semibold text-[#344054]">Pincode
                                        <input required inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{6}" maxLength={6} title="Enter exactly 6 digits" value={addressForm.pincode} onChange={(event) => setAddressForm({ ...addressForm, pincode: event.target.value.replace(/\D/g, "").slice(0, 6) })} className="mt-1.5 h-11 w-full rounded-xl border border-[#dce2ea] bg-white px-3 text-sm font-normal text-[#07152e] outline-none focus:border-[#07152e]" />
                                    </label>
                                    <label className="flex min-h-11 items-center gap-2 self-end text-xs font-medium text-[#344054] sm:pb-2">
                                        <input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm({ ...addressForm, isDefault: event.target.checked })} className="h-4 w-4 accent-[#07152e]" />
                                        Set as default address
                                    </label>
                                </div>
                                {formError && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{formError}</p>}
                                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <button type="button" onClick={() => { setShowAddressForm(false); setAddressForm(emptyAddress); setFormError(""); }} className="min-h-10 rounded-xl border border-[#dce2ea] bg-white px-4 py-2.5 text-xs font-semibold text-[#344054]">Cancel</button>
                                    <button type="submit" disabled={savingAddress} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#07152e] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#12294b] disabled:cursor-wait disabled:opacity-60">
                                        {savingAddress && <RefreshCw size={14} className="animate-spin" />}
                                        {savingAddress ? "Saving..." : "Save address"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {loading && <div className="h-36 animate-pulse rounded-2xl bg-[#f5f7fa]" />}

                        {!loading && error && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center">
                                <p className="text-sm font-semibold text-red-600">{error}</p>
                                <button type="button" onClick={() => window.location.reload()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#07152e] px-4 py-2.5 text-xs font-bold text-white">
                                    <RefreshCw size={14} /> Try again
                                </button>
                            </div>
                        )}

                        {!loading && !error && addresses.length === 0 && (
                            <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#dce2ea] bg-[#f5f7fa] px-6 py-12 text-center">
                                <MapPin size={22} className="text-[#9aa5b5]" />
                                <p className="mt-3 text-sm font-semibold text-[#07152e]">No saved addresses yet</p>
                                <p className="mt-1 text-[11px] text-[#718096]">Addresses you add at checkout will appear here.</p>
                            </div>
                        )}

                        {!loading && !error && addresses.length > 0 && (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {addresses.map((address, index) => (
                                    <article key={address._id ?? index} className={`flex flex-col rounded-2xl border bg-white p-5 ${address.isDefault ? "border-[#07152e]" : "border-[#dce2ea]"}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={15} className="shrink-0 text-[#176348]" />
                                                <p className="text-sm font-bold text-[#07152e]">{titleCase(address.fullName)}</p>
                                            </div>
                                            {address.isDefault && <span className="flex items-center gap-1 rounded-full bg-[#176348]/10 px-2.5 py-1 text-[10px] font-semibold text-[#176348]"><ShieldCheck size={11} />Default</span>}
                                        </div>
                                        <div className="mt-3 space-y-0.5 text-xs leading-5 text-[#526078]">
                                            <p>{address.addressLine1}</p>
                                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                                            <p>{titleCase(address.city)}, {titleCase(address.state)} – {address.pincode}</p>
                                        </div>
                                        <p className="mt-4 flex items-center gap-2 border-t border-[#e8ebef] pt-3 text-[11px] text-[#718096]"><Phone size={12} />{address.phone}</p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
