
import type { Metadata } from "next";

import FooterPage from "@/Components/Footer";
import Image from "next/image";
import Link from "next/link";

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="border-b border-[#28344A] py-7 last:border-0">
            <h2 className="mb-4 font-heading text-xl text-olympus">{title}</h2>
            <div className="space-y-3 text-sm leading-7 text-palladium [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_strong]:text-olympus">
                {children}
            </div>
        </section>
    );
}

export const metadata: Metadata = {
    title: "IT Policy",
    description:
        "Permitted and prohibited use of the Alpha Male website, how we secure our platform, and how to report a vulnerability or request a takedown.",
};

export default function ITPolicyPage() {
    return (
        <main className="min-h-screen bg-brand-navy text-olympus">
            <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:py-20">
                <Link
                    href="/"
                    className="mb-10 inline-flex text-sm text-[#929BAE] transition hover:text-white"
                >
                    ← Back to Home
                </Link>

                <header className="mb-10 border-b border-[#354158] pb-8">
                    <div className="mb-4 flex justify-center">
                        <Image
                            src="/images/logo.png"
                            alt="Alpha Male - Drive, Stamina, Energy"
                            width={150}
                            height={150}
                            priority
                            unoptimized
                            className="h-[90px] w-[90px] object-contain"
                        />
                    </div>
                    <h1 className="font-heading text-4xl sm:text-5xl">IT Policy</h1>
                    <p className="mt-4 text-sm text-[#929BAE]">
                        Effective: 02 November 2026
                    </p>
                    <p className="mt-6 max-w-3xl text-sm leading-7 text-palladium">
                        This IT Policy is published under the Information Technology Act,
                        2000 and the Information Technology (Intermediary Guidelines and
                        Digital Media Ethics Code) Rules, 2021. It sets out the rules for
                        using alphamale.co.in and our digital services, how we keep them
                        secure, and how to raise a complaint. It applies alongside our
                        Terms & Conditions and Privacy Policy.
                    </p>
                </header>

                <Section title="1. Permitted Use">
                    <p>
                        You may use the Platform only to browse, buy Alpha Male products,
                        consult a doctor where needed, and engage with us lawfully.
                        Everything you submit must be accurate and your own.
                    </p>
                </Section>

                <Section title="2. Prohibited Content and Conduct">
                    <p>
                        You must not host, display, upload, share or send any information
                        that:
                    </p>
                    <ul>
                        <li>Belongs to another person, and you have no right to use it.</li>
                        <li>
                            Is obscene, pornographic, paedophilic, invasive of another
                            person’s privacy, defamatory, or harassing based on gender,
                            religion, caste or ethnicity.
                        </li>
                        <li>Is harmful to children.</li>
                        <li>
                            Infringes any patent, trademark, copyright or other proprietary
                            right.
                        </li>
                        <li>
                            Deceives or misleads about where a message came from, or knowingly
                            spreads false or misleading information.
                        </li>
                        <li>
                            Impersonates another person, including by submitting a false
                            prescription.
                        </li>
                        <li>
                            Threatens the unity, integrity, defence, security or sovereignty
                            of India, its public order, or its friendly relations with other
                            countries.
                        </li>
                        <li>
                            Contains viruses or any code designed to damage or interfere
                            with a computer system.
                        </li>
                        <li>Breaks any law in force in India.</li>
                    </ul>
                </Section>

                <Section title="3. Security of Our Systems">
                    <p>You must not do any of the following:</p>
                    <ul>
                        <li>
                            Try to gain unauthorised access to the Platform, our servers or
                            other users’ accounts.
                        </li>
                        <li>
                            Probe, scan or test our systems for vulnerabilities without
                            permission.
                        </li>
                        <li>Use bots or scrapers, or place automated or bulk orders.</li>
                        <li>Disrupt the Platform with excessive requests.</li>
                    </ul>
                    <p>
                        We may suspend access, cancel orders, and report the matter to law
                        enforcement for any breach.
                    </p>
                </Section>

                <Section title="4. How We Protect the Platform">
                    <ul>
                        <li>All traffic is encrypted with HTTPS/TLS.</li>
                        <li>
                            Payments are processed only by PCI-DSS compliant payment partners.
                        </li>
                        <li>
                            Access to customer and health data is restricted by role and
                            logged.
                        </li>
                        <li>
                            Our systems and software are monitored, backed up and updated
                            regularly.
                        </li>
                        <li>
                            Cyber security incidents are reported to CERT-In within the time
                            the law requires.
                        </li>
                    </ul>
                </Section>

                <Section title="5. Your Responsibilities">
                    <p>
                        Keep your password and one-time passwords (OTPs) private. Alpha
                        Male will never ask for your OTP, PIN, card number or password by
                        phone, email or WhatsApp. Report any suspicious message that claims
                        to be from us to{" "}
                        <a
                            href="mailto:info@alphamale.co.in"
                            className="text-olympus underline underline-offset-4"
                        >
                            info@alphamale.co.in
                        </a>.
                    </p>
                </Section>

                <Section title="6. Reporting a Vulnerability">
                    <p>
                        If you find a security issue on our Platform, please report it to{" "}
                        <a
                            href="mailto:info@alphamale.co.in?subject=Security%20Report"
                            className="text-olympus underline underline-offset-4"
                        >
                            info@alphamale.co.in
                        </a>{" "}
                        with the subject line “Security Report”. Do not access or alter
                        other people’s data. We will investigate and keep you updated.
                    </p>
                </Section>

                <Section title="7. Takedown Requests">
                    <p>
                        To report content on our Platform that breaks this Policy or
                        infringes your rights, email the Grievance Officer. Include the URL,
                        a description of the issue, and proof of your rights where relevant.
                        We will act on valid complaints within the time the law requires.
                    </p>
                </Section>

                <Section title="8. Grievance Officer">
                    <p>
                        Under the IT Act, 2000 and the Consumer Protection (E-Commerce)
                        Rules, 2020, you can contact our Grievance Officer using the
                        following details:
                    </p>

                    <div className="space-y-3 rounded-xl border border-[#354158] bg-[#19243B]/50 p-5">
                        <p>
                            <strong>Address:</strong> Alpha Male, Hyderabad, Telangana, India
                        </p>
                        <p>
                            <strong>Email:</strong>{" "}
                            <a
                                href="mailto:info@alphamale.co.in"
                                className="underline underline-offset-4"
                            >
                                info@alphamale.co.in
                            </a>
                        </p>
                        <p>
                            <strong>Phone:</strong>{" "}
                            <a
                                href="tel:+919000937222"
                                className="underline underline-offset-4"
                            >
                                +91 90009 37222
                            </a>
                        </p>
                        <p>
                            <strong>Hours:</strong> Monday to Saturday, 10:00 AM to 6:00 PM
                            IST
                        </p>
                    </div>

                    <p>
                        We acknowledge every complaint within 24 hours and resolve it
                        within 15 days of receipt.
                    </p>
                </Section>

                <Section title="9. Changes">
                    <p>
                        We may update this Policy to reflect changes in law or technology.
                        The current version, with its effective date, will always be on
                        this page.
                    </p>
                </Section>
                <FooterPage />
                {/* <footer className="mt-12 border-t border-[#354158] pt-6 text-center text-xs text-[#929BAE]">
                    <p>ALPHA MALE</p>
                    <p className="mt-2">alphamale.co.in · info@alphamale.co.in</p>
                    <p className="mt-4">
                        <Link
                            href="/"
                            className="underline underline-offset-4 hover:text-white"
                        >
                            Home
                        </Link>
                    </p>
                </footer> */}
            </div>
        </main>
    );
}
