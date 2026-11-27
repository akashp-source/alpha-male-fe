import { ONLINE_PAYMENT_DISCOUNT_PERCENT } from "@/lib/offers";

interface ProductAfterOrderProps {
    /** Prescription products get the "A private call" step. */
    requiresPrescription?: boolean;
}

interface Step {
    title: string;
    text: string;
}

/** "What happens after you order": fixed copy; the call step is prescription-only. */
export default function ProductAfterOrder({ requiresPrescription = false }: ProductAfterOrderProps) {
    const steps: Step[] = [
        {
            title: "Place your order",
            text: `Pay online for ${ONLINE_PAYMENT_DISCOUNT_PERCENT}% off, or choose Cash on Delivery.`,
        },
        ...(requiresPrescription
            ? [{
                title: "Dispatch confirmation",
                text: "We’ll confirm your order and delivery address before shipping to help avoid delays and get your order to the right doorstep.",
            }]
            : []),
        {
            title: "Packed discreetly",
            text: "Your order ships in a plain, sealed parcel. Track it via SMS and WhatsApp.",
        },
        {
            title: "Delivered to your door",
            text: "Estimated delivery in 2–5 working days across India.",
        },
    ];

    return (
        <section className="pdp-section w-full bg-white text-brand-navy">
            <div className="pdp-container">
                <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy">
                    No surprises
                </p>
                <h2 className="font-heading text-3xl leading-tight text-brand-navy sm:text-4xl">
                    What happens after you order
                </h2>

                <ol className={`mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 ${steps.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                    {steps.map((step, index) => (
                        <li
                            key={step.title}
                            className="rounded-2xl border border-transparent bg-brand-navy p-5 text-white shadow-sm transition duration-300 hover:border-palladium/40 hover:shadow-xl motion-safe:hover:scale-105"
                        >
                            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-palladium">
                                Step {String(index + 1).padStart(2, "0")}
                            </p>
                            <h3 className="mt-2 font-body text-sm uppercase tracking-[0.06em] text-white">
                                {step.title}
                            </h3>
                            <p className="mt-2 font-body text-sm leading-relaxed text-olympus">
                                {step.text}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
