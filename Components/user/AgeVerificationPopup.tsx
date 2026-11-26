"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

// Older versions remembered the answer forever in localStorage, which hid
// the popup on every later visit. Clear it so those visitors see it again.
const LEGACY_AGE_VERIFIED_KEY = "alpha-male-age-verified";

// Client-only, in-memory: true after the visitor confirms during this page load.
let confirmedThisLoad = false;

/**
 * 18+ age confirmation (compliance requirement).
 *
 * Mounted only on the /home route. Shown on every full load of /home,
 * including a refresh: the answer is deliberately NOT stored. Once confirmed,
 * navigating back to /home inside the site doesn't show it again until the
 * next full load (the module-level flag below resets on reload).
 * Rendered open from the server, so page content never flashes before it.
 */
export default function AgeVerificationPopup() {
    const [isOpen, setIsOpen] = useState(() => !confirmedThisLoad);
    const [isUnderage, setIsUnderage] = useState(false);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        try {
            window.localStorage.removeItem(LEGACY_AGE_VERIFIED_KEY);
        } catch {
            // Storage can be blocked (private mode); nothing to clean up then.
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const oldBodyOverflow = document.body.style.overflow;
        const oldRootOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        confirmButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = oldBodyOverflow;
            document.documentElement.style.overflow = oldRootOverflow;
        };
    }, [isOpen]);

    const confirmAge = () => {
        confirmedThisLoad = true;
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-[#212E49]/80 px-4 py-8 backdrop-blur-sm sm:px-6">
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="age-verification-title"
                className="w-full max-w-md overflow-hidden rounded-2xl border border-[#B0B1B0]/40 bg-[#212E49] text-center shadow-2xl"
            >
                <div className="flex justify-center border-b border-white/10 px-6 py-5">
                    <Image
                        src="/images/logo-cropped.png"
                        alt="Alpha Male - Drive, Stamina, Energy"
                        width={90}
                        height={90}
                        priority
                        className="h-[76px] w-[76px] object-contain"
                    />
                </div>

                <div className="px-6 pb-7 pt-6 sm:px-9 sm:pb-9">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#B0B1B0]/40 bg-white/5 text-[#D5D5D7]">
                        <ShieldCheck size={27} strokeWidth={1.7} aria-hidden="true" />
                    </div>
                    <p className="mb-2 font-body text-xs font-semibold uppercase tracking-[0.24em] text-[#B0B1B0]">
                        Age verification
                    </p>
                    <h1 id="age-verification-title" className="font-heading text-2xl font-semibold text-[#FEFEFE] sm:text-3xl">
                        Are you 18 or older?
                    </h1>
                    <p className="mx-auto mt-3 max-w-sm font-body text-sm leading-6 text-[#D5D5D7]">
                        Alpha Male products are intended for adults aged 18 and above. Please confirm your age to continue.
                    </p>

                    {isUnderage ? (
                        <p role="alert" className="mt-5 rounded-lg border border-[#B0B1B0]/30 bg-white/5 px-4 py-3 font-body text-sm leading-5 text-[#FEFEFE]">
                            You must be 18 or older to access this store.
                        </p>
                    ) : (
                        <div className="mt-6 grid gap-3">
                            <button
                                ref={confirmButtonRef}
                                type="button"
                                onClick={confirmAge}
                                className="min-h-12 rounded-lg bg-[#FEFEFE] px-5 py-3 font-body text-sm font-semibold text-[#212E49] transition hover:bg-[#E9E9EA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B0B1B0]"
                            >
                                Yes, I am 18 or older
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsUnderage(true)}
                                className="min-h-11 rounded-lg border border-[#B0B1B0]/40 px-5 py-2.5 font-body text-sm font-medium text-[#D5D5D7] transition hover:border-[#D5D5D7] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B0B1B0]"
                            >
                                No, I am under 18
                            </button>
                        </div>
                    )}

                    <p className="mt-6 font-body text-xs leading-5 text-[#B0B1B0]">
                        By continuing, you confirm that you meet the minimum age requirement.
                    </p>
                </div>
            </section>
        </div>
    );
}
