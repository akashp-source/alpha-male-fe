
"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import {
  FlaskConical,
  Box,
  ShieldCheck,
  MessageSquareText,
  Tickets,
  Heart,
  Leaf
} from 'lucide-react'
import BrandPhilosophy from "@/Components/BrandPhilosophy";
import ProductRange from "@/Components/ProductRange";
import FAQ from "@/Components/Faqs";
import LaunchingSoon from "@/Components/LaunchingSoon";
type PopupState = {
  show: boolean;
  type: "success" | "error" | "";
  message: string;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);

  const [earlyAccessForm, setEarlyAccessForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [earlyAccessError, setEarlyAccessError] = useState("");
  const [earlyAccessLoading, setEarlyAccessLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    show: false,
    type: "",
    message: "",
  });

  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const handleEarlyAccess = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setEarlyAccessLoading(true);
    setEarlyAccessError("");

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(earlyAccessForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setEarlyAccessError(data.message || "Registration failed.");
        return;
      }

      setShowEarlyAccess(false);

      setEarlyAccessForm({
        name: "",
        email: "",
        phone: "",
      });

      setPopup({
        show: true,
        type: "success",
        message: data.message,
      });
    } catch {
      setEarlyAccessError("Unable to connect. Please try again.");
    } finally {
      setEarlyAccessLoading(false);
    }
  };

  // Launch date: 25 December 2026
  useEffect(() => {
    const launchDate = new Date("2026-12-25T00:00:00+05:30").getTime();

    const updateCountdown = () => {
      const difference = launchDate - Date.now();

      if (difference <= 0) {
        setCountdown({
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
        });
        return;
      }

      setCountdown({
        days: String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
        minutes: String(Math.floor((difference / (1000 * 60)) % 60)).padStart(2, "0"),
        seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, "0"),
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNotify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setPopup({
        show: true,
        type: "error",
        message: "Please enter your email address.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to subscribe.");
      }

      setPopup({
        show: true,
        type: "success",
        message: data.message,
      });

      setEmail("");
    } catch (error) {
      setPopup({
        show: true,
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setPopup({ show: false, type: "", message: "" });
  };

  const features = [
    {
      icon: FlaskConical,
      title: "SCIENCE BACKED FORMULAS",
    },
    {
      icon: Box,
      title: "DISCREET PACKAGING",
    },
    {
      icon: ShieldCheck,
      title: "LICENSED MANUFACTURING",
    },
    {
      icon: MessageSquareText,
      title: "CONSULTATION WITH EXPERT GUIDANCE",
    },
  ];

  const products = [
    {
      image: "/images/strip.png",
      title: "ORAL STRIPS",
      description:
        "BUILT FOR PERFORMANCE. MADE TO LAST.\n\nAlpha Bold, Alpha Boss, Alpha Legend and Alpha Icon - discreet dissolving strips for peak performance and lasting confidence, when it matters most.\n\n No water needed.",
      tag: "COMING SOON",
    },
    {
      image: "/images/intimacy-care.png",
      title: "INTIMACY CARE",
      description:
        "More than intimacy.\n\n Bare Ultra thin Condoms, Long-play confidence, daily energy and science-backed lubricants.",
      tag: "COMING SOON",
    },
    {
      image: "/images/daily-wellness2.png",
      title: "DAILY WELLNESS",
      description:
        " Shilajit & caffeine - everyday support for energy and focus.",
      tag: "COMING SOON",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_50%_20%,#19243B_0%,#0C1221_75%)] text-[#D5D5D7]">

      {/* Double Border Frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 border hidden sm:block border-[#D5D5D7]/[0.18] border-0 sm:inset-6"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4  border hidden sm:block border-[#D5D5D7]/[0.08] sm:inset-8 "
      />

      {/* Header
      <header className="relative flex items-center justify-end px-8 pt-8 sm:px-[72px] sm:pt-10">
        <p className="m-0 text-[9px] uppercase tracking-[0.32em] text-[#B0B1B0]">
          ALPHAMALE.CO.IN
        </p>
      </header> */}

      {/* Hero Section */}

      {/* Hero Section */}

      <section className="relative mx-auto grid w-full max-w-[1200px] grid-cols-1 items-stretch gap-5 px-6 pb-2 pt-8 sm:px-10 sm:pt-12 md:grid-cols-[220px_minmax(0,1fr)] md:gap-6">

        {/* LEFT: Logo Container */}
        {/* LEFT: Logo Container */}
        <div className="flex items-start justify-center p-2 md:justify-start">
          <div className="w-[220px] sm:w-[280px]">
            <Image
              src="/images/logo-cropped.png"
              alt="Alpha Male - Drive, Stamina, Energy"
              width={800}
              height={800}
              priority
              unoptimized
              className="block h-auto w-full object-contain"
            />
          </div>
        </div>

        {/* RIGHT: Coming Soon Content Container */}
        <div className="flex h-full w-full flex-col items-center justify-start gap-6  px-4 py-2 text-center sm:gap-7 sm:px-8">

          {/* Tagline */}
          <p className="m-0 text-[9px] font-body font-bold uppercase tracking-[0.22em] text-[#B0B1B0] sm:text-[11px] sm:tracking-[0.42em]">
            India's first premium science-backed men's wellness brand
          </p>

          {/* Heading */}
          <h1 className="silver-text m-0  text-[clamp(42px,7vw,76px)] uppercase leading-none tracking-[0.06em] font-heading font-semibold">
            Coming Soon
          </h1>

          {/* Decorative Divider */}
          <div className="flex w-[280px] max-w-full items-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#B0B1B0]" />
            <span className="h-2 w-2 rotate-45 bg-[#D5D5D7]" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#B0B1B0]" />
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center gap-3">

            <p className="m-0 text-[8px] uppercase tracking-[0.35em] text-[#9FA6B5]">
              LAUNCHING 25 DECEMBER 2026
            </p>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { value: countdown.days, label: "DAYS" },
                { value: countdown.hours, label: "HOURS" },
                { value: countdown.minutes, label: "MINUTES" },
                { value: countdown.seconds, label: "SECONDS" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-[62px] flex-col items-center border border-[#D5D5D7]/10 bg-white/[0.035] px-3 py-3 sm:min-w-[80px] sm:px-5"
                >
                  <span className="font-serif text-2xl text-[#E5E5E7] sm:text-3xl">
                    {item.value}
                  </span>
                  <span className="mt-1 text-[7px] tracking-[0.18em] text-[#9FA6B5]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="m-0 max-w-[600px] text-[13px] font-body font-normal leading-[1.9] text-[#D5D5D7] sm:text-[14px]">
            Confidence, refined. Science-backed wellness for the man who expects
            more - made in a WHO-GMP certified facility and delivered with
            complete discretion.
          </p>

          {/* Early Access */}
          <div className="flex flex-wrap items-center justify-center gap-3 border border-[#D5D5D7]/10 bg-white/[0.025] px-4 py-3 text-[9px] sm:text-[10px]">

            <button
              type="button"
              onClick={() => setShowEarlyAccess(true)}
              className="cursor-pointer border border-[#D5D5D7]/30 bg-[#E9E9EA] px-2 py-1 font-body font-normal uppercase tracking-[0.15em] text-[#212E49] transition hover:bg-white"
            >
              EARLY ACCESS
            </button>

            <span className="text-[#E5E5E7] font-body font-normal">
              First 500 sign-ups get <strong>10% off</strong> at launch
            </span>

          </div>

          {/* Email Subscription */}
          <form
            onSubmit={handleNotify}
            className="flex w-full max-w-[450px] flex-col gap-2 sm:flex-row font-body font-normal"
          >
            <label htmlFor="am-email" className="sr-only">
              Email address
            </label>

            <input
              id="am-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              className="min-h-[46px] min-w-0 flex-1 rounded-[2px] border border-[#D5D5D7]/20 bg-white/[0.04] px-4 text-xs text-white outline-none placeholder:text-[#9FA6B5] focus:border-[#D5D5D7]/70"
            />

            <button
              type="submit"
              disabled={loading}
              className="am-button min-h-[46px] cursor-pointer rounded-[2px] bg-[#E9E9EA] px-7 text-[9px] font-body font-bold uppercase tracking-[0.18em] text-[#212E49] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "PLEASE WAIT..." : "NOTIFY ME"}
            </button>
          </form>

          {/* Privacy Text */}
          <p className="m-0 text-[9px] tracking-[0.04em] text-[#9FA6B5] font-body font-normal">
            Be the first to know when we launch. No spam, ever.
          </p>

          {/* Scroll Indicator */}
          {/* <a
            href="#products"
            className="group mt-3 flex w-fit flex-col items-center gap-3"
          >
            <span className="text-[8px] font-body font-normal tracking-[0.3em] text-[#AEB5C3] transition-colors group-hover:text-white">
              SCROLL DOWN TO EXPLORE OUR PRODUCTS
            </span>

            <Image
              src="/images/down.png"
              alt="Scroll down"
              width={64}
              height={64}
              priority
              className="h-20 w-20 animate-bounce object-contain"
            />
          </a> */}

          <a
            href="#products"
            className="group mt-3 flex w-fit flex-col items-center gap-3"
          >
            <span className="text-[8px] font-body font-normal tracking-[0.3em] text-[#AEB5C3] transition-colors group-hover:text-white">
              SCROLL DOWN TO EXPLORE OUR PRODUCTS
            </span>

            <Image
              src="/images/down.png"
              alt="Scroll down"
              width={64}
              height={64}
              priority
              className="h-20 w-20 animate-bounce object-contain"
            />
          </a>

        </div>

      </section>




      {/* WHO-GMP Certification Section */}
      <section className="relative mx-auto flex w-full max-w-[760px] flex-col items-center gap-5 px-6 pb-10 sm:flex-row sm:gap-8">

        {/* Certification Seal */}
        <div className="flex justify-center sm:justify-start">
          <Image
            src="/images/whogmp.png"
            alt="WHO-GMP"
            width={140}
            height={140}
            className="h-[110px] w-[110px] object-contain sm:h-[140px] sm:w-[140px]"
            priority
          />
        </div>

        <div className="text-center sm:text-left">
          <p className="mb-2 text-[8px] font-heading uppercase tracking-[0.3em] text-[#9FA6B5]">
            OUR STANDARD
          </p>

          <h2 className="mb-2 font-serif text-xl tracking-[0.08em] text-[#D5D5D7] font-heading">
            WHO-GMP CERTIFIED
          </h2>

          <p className="max-w-[440px] text-[11px] leading-[1.8] text-[#AEB5C3]font-body font-normal">
            Every Alpha Male product is made in our own licensed facility,
            certified to WHO Good Manufacturing Practice standards.
          </p>
        </div>
      </section>

      {/* Brand Highlights */}
      <section className="relative mx-auto w-full max-w-[760px] px-6 pb-10">
        <div className="grid grid-cols-2 gap-5 border-y border-[#D5D5D7]/10 py-5 sm:grid-cols-4 sm:gap-4">

          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="text-lg text-[#D5D5D7]">
                <feature.icon
                  // size={24}
                  strokeWidth={1.3}
                  className="text-[#D5D5D7]"
                />
              </span>

              <p className="m-0 max-w-[145px] text-[8px] font-semibold leading-[1.6] tracking-[0.12em] text-[#BFC4CE]">
                {feature.title}
              </p>
            </div>
          ))}

        </div>
      </section>

      <LaunchingSoon />

      <BrandPhilosophy />

      {/* What's Coming Section */}
      <section className="relative mx-auto w-full max-w-[760px] px-6 pb-16 pt-10">

        {/* Section Heading */}
        <div className="mb-7 text-center">
          <p className="mb-2 text-[8px] font-semibold uppercase tracking-[0.35em] text-[#9FA6B5]">
            THE RANGE
          </p>

          <h2 className="silver-text font-heading text-2xl uppercase tracking-[0.08em] sm:text-3xl">
            What&apos;s Coming
          </h2>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">

          {products.map((product) => (
            <div
              key={product.title}
              className="group flex min-h-[205px] flex-col border border-[#D5D5D7]/10 bg-white/[0.025] p-5 transition duration-300 hover:border-[#D5D5D7]/35 hover:bg-white/[0.045] sm:p-4"
            >
              <div className="mb-4 flex h-15 w-15 items-center">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={60}
                  height={60}
                  className="h-15 w-15 object-contain"
                />
              </div>

              <h3 className="mb-3 text-[10px] font-semibold tracking-[0.12em] text-[#E5E5E7]">
                {product.title}
              </h3>

              <p className="flex-1 whitespace-pre-line text-[9px] leading-[1.7] text-[#ADB5C4]">
                {product.description}
              </p>

              <p className="mt-4 text-[7px] font-semibold tracking-[0.2em] text-[#9FA6B5]">
                {product.tag}
              </p>
            </div>
          ))}

        </div>
      </section>

      <FAQ />

      {/* Footer */}
      <footer className="relative border-t border-[#D5D5D7]/10 px-8 py-8 sm:px-[72px]">

        <div className="mx-auto flex max-w-[880px] flex-col gap-5">

          <div className="flex flex-wrap justify-center gap-5 text-[9px] text-[#B0B1B0] sm:justify-start">
            <a href="/policies/privacy" className="transition hover:text-white">
              Privacy Policy
            </a>

            <a href="/policies/terms" className="transition hover:text-white">
              Terms & Conditions
            </a>

            <a href="/policies/shipping" className="transition hover:text-white">
              Shipping & Delivery Policy
            </a>

            <a href="/policies/returns" className="transition hover:text-white">
              Return & Refund Policy
            </a>

            <a href="/policies/cancellation" className="transition hover:text-white">
              Cancellation Policy
            </a>

            <a href="/policies/it-policy" className="transition hover:text-white">
              IT Policy
            </a>

            <a
              href="mailto:info@alphamale.co.in"
              className="transition hover:text-white"
            >
              info@alphamale.co.in
            </a>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#D5D5D7]/10 pt-5 text-center sm:flex-row sm:text-left">

            <p className="m-0 text-[8px] tracking-[0.08em] text-[#858E9E]">
              © 2026 Alpha Male. All rights reserved.
            </p>

            <p className="m-0 text-[8px] tracking-[0.08em] text-[#858E9E]">
              <strong className="mr-2 border border-[#D5D5D7]/30 px-2 py-1 text-[#D5D5D7]">
                18+
              </strong>
              For adults aged 18 and above only.
            </p>

          </div>
        </div>
      </footer>
      {/* Early Access Modal */}
      {showEarlyAccess && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-sm"
          onClick={() => setShowEarlyAccess(false)}
        >
          <div
            className="relative w-full max-w-[440px] border border-[#D5D5D7]/25 bg-[#172139] p-7 shadow-2xl sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowEarlyAccess(false)}
              className="absolute right-4 top-3 cursor-pointer text-2xl text-[#AEB5C3] transition hover:text-white"
              aria-label="Close modal"
            >
              &times;
            </button>

            <div className="mb-7 text-center">
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#AEB5C3]">
                ALPHA MALE
              </p>

              <h2 className="silver-text font-serif text-2xl uppercase tracking-[0.08em]">
                Get Early Access
              </h2>

              <p className="mt-3 text-xs leading-6 text-[#AEB5C3]">
                Join our exclusive launch list and get 10% off your first order.
              </p>
            </div>

            <form onSubmit={handleEarlyAccess} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="early-name"
                  className="mb-2 block text-[9px] uppercase tracking-[0.15em] text-[#AEB5C3]"
                >
                  Full Name
                </label>

                <input
                  id="early-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  value={earlyAccessForm.name}
                  onChange={(e) =>
                    setEarlyAccessForm({
                      ...earlyAccessForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter your full name"
                  className="min-h-[46px] w-full border border-[#D5D5D7]/20 bg-white/[0.04] px-4 text-xs text-white outline-none placeholder:text-[#9FA6B5] focus:border-[#D5D5D7]/70"
                />
              </div>

              <div>
                <label
                  htmlFor="early-email"
                  className="mb-2 block text-[9px] uppercase tracking-[0.15em] text-[#AEB5C3]"
                >
                  Email Address
                </label>

                <input
                  id="early-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={earlyAccessForm.email}
                  onChange={(e) =>
                    setEarlyAccessForm({
                      ...earlyAccessForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="Enter your email"
                  className="min-h-[46px] w-full border border-[#D5D5D7]/20 bg-white/[0.04] px-4 text-xs text-white outline-none placeholder:text-[#9FA6B5] focus:border-[#D5D5D7]/70"
                />
              </div>

              <div>
                <label
                  htmlFor="early-phone"
                  className="mb-2 block text-[9px] uppercase tracking-[0.15em] text-[#AEB5C3]"
                >
                  Phone Number
                </label>

                <input
                  id="early-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={earlyAccessForm.phone}
                  onChange={(e) =>
                    setEarlyAccessForm({
                      ...earlyAccessForm,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Enter your phone number"
                  className="min-h-[46px] w-full border border-[#D5D5D7]/20 bg-white/[0.04] px-4 text-xs text-white outline-none placeholder:text-[#9FA6B5] focus:border-[#D5D5D7]/70"
                />
              </div>
              {earlyAccessError && (
                <div
                  role="alert"
                  className="border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-xs text-red-300"
                >
                  {earlyAccessError}
                </div>
              )}
              <button
                type="submit"
                disabled={earlyAccessLoading}
                className="am-button mt-2 min-h-[48px] cursor-pointer bg-[#E9E9EA] px-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#212E49] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {earlyAccessLoading ? "PLEASE WAIT..." : "GET EARLY ACCESS"}
              </button>
            </form>

            <p className="mt-5 text-center text-[8px] leading-5 text-[#858E9E]">
              Your information will only be used for launch updates and early access.
            </p>
          </div>
        </div>
      )}

      {/* Popup Modal */}
      {popup.show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
          onClick={closePopup}
        >
          <div
            className="relative w-full max-w-[420px] border border-[#D5D5D7]/30 bg-[#202D47] px-7 py-10 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={closePopup}
              className="absolute right-4 top-3 cursor-pointer text-2xl text-[#B0B1B0] hover:text-white"
              aria-label="Close popup"
            >
              &times;
            </button>

            {/* Status Icon */}
            <div
              className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border text-2xl ${popup.type === "success"
                ? "border-green-400 text-green-400"
                : "border-red-400 text-red-400"
                }`}
            >
              {popup.type === "success" ? "✓" : "!"}
            </div>

            <h2 className="silver-text mb-3 font-serif text-2xl font-semibold">
              {popup.type === "success"
                ? "You're on the list!"
                : "Oops!"}
            </h2>

            <p className="mb-7 text-sm leading-7 text-[#D5D5D7]">
              {popup.message}
            </p>

            <button
              onClick={closePopup}
              className="w-full cursor-pointer bg-[#E9E9EA] px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#212E49] transition hover:bg-white"
            >
              {popup.type === "success" ? "Awesome" : "Try Again"}
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
