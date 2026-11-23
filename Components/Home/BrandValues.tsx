import Image from "next/image";
import Link from "next/link";

const values = [
    {
        number: "01",
        image: "/images/icons/formula.png",
        title: "Thoughtfully formulated",
        description: "Every product is built around carefully selected ingredients and clear, honest usage guidance.",
    },
    {
        number: "02",
        image: "/images/icons/privacy.png",
        title: "Privacy by default",
        description: "Plain packaging, private billing and tracking that never shows what’s inside. Order without a second thought.",
    },
    {
        number: "03",
        image: "/images/icons/madeforreallife.png",
        title: "Made for real life",
        description: "Fast-dissolving strips, no water needed and compact packs that slip into a pocket.",
    },
    {
        number: "04",
        image: "/images/icons/straightanswer.png",
        title: "Straight answers",
        description: "Clear information on what each product does and how to use it, so you can decide with confidence.",
    },
    {
        number: "05",
        image: "/images/icons/support",
        title: "Support, minus the judgement",
        description: "Questions are normal. Reach our team on WhatsApp or email, and every conversation stays private.",
    },
];

export default function BrandValues() {
    return (
        <section className="bg-[linear-gradient(125deg,#f7f7f8_0%,#f1f4f8_48%,#f7f5f1_100%)] px-4 py-14 text-[#071630] sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-[1320px]">
                <div className="mb-8 grid gap-4 sm:mb-10 md:grid-cols-[1fr_340px] md:items-end">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#526987]">WHY ALPHA MALE</p>
                        <h2 className="max-w-2xl font-heading text-3xl font-semibold uppercase leading-tight sm:text-4xl lg:text-[46px]">
                            Wellness, without the awkwardness.
                        </h2>
                    </div>
                    <p className="max-w-sm text-xs leading-6 text-slate-500 sm:text-sm sm:leading-6">
                        We keep things simple: good products, clear information and complete privacy, from checkout to your door.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                    {values.map((value) => (
                        <article key={value.number} className="group relative min-h-[170px] rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-[#f5f7fa] p-5 shadow-[0_6px_20px_rgba(7,22,48,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#cbd4e0] hover:shadow-[0_14px_34px_rgba(7,22,48,0.09)] sm:min-h-[190px] sm:p-6">
                            <span className="absolute right-5 top-4 font-heading text-xl font-bold text-slate-200 sm:right-6 sm:top-5 sm:text-2xl">{value.number}</span>
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef1f6]">
                                <Image src={value.image} alt="" width={23} height={23} unoptimized className="h-6 w-6 object-contain" />
                            </div>
                            <h3 className="mb-2 max-w-[85%] font-heading text-base font-bold leading-snug sm:text-lg">{value.title}</h3>
                            <p className="max-w-sm text-xs leading-5 text-slate-500 sm:text-[13px] sm:leading-[1.65]">{value.description}</p>
                        </article>
                    ))}

                    {/* Photo and text on navy: the text never sits on the image.
                        Stacked on phone/tablet; side by side on desktop so this card is no
                        taller than cards 04-05 next to it (a tall card left them half empty).
                        info-products.png is info.png without its built-in badge column. */}
                    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-[#071630] shadow-[0_6px_20px_rgba(7,22,48,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(7,22,48,0.18)] lg:flex-row">
                        <div className="relative h-44 shrink-0 overflow-hidden bg-[linear-gradient(180deg,#f3e2d6_0%,#ecdcd1_100%)] sm:h-48 lg:h-auto lg:w-[42%]">
                            <Image
                                src="/images/utils/info-products.png"
                                alt="Alpha Male condoms, delay spray and oral strips"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 15vw"
                                className="object-contain object-bottom px-6 pt-4 transition-transform duration-700 group-hover:scale-[1.03] lg:px-3"
                            />
                        </div>
                        <div className="p-5 text-white sm:p-6 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:p-5">
                            <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-[#d7c29e]">MADE FOR YOU</p>
                            <h3 className="font-heading text-xl font-bold uppercase leading-snug sm:text-2xl lg:text-xl">Feel good about taking care.</h3>
                            <Link href="/products" className="mt-4 inline-flex items-center gap-2 self-start rounded-lg border border-white/60 px-4 py-2.5 text-xs font-semibold transition hover:bg-white hover:text-[#071630]">
                                Explore the collection <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
