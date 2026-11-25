
import type { Metadata } from "next";

// import FooterPage from "@/Components/Footer"; (replaced by FooterV2 in app/layout.tsx)
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="border-b border-white/[0.08] py-7 last:border-0">
            <h2 className="mb-4 font-heading text-lg tracking-wide text-olympus sm:text-xl">
                {title}
            </h2>
            <div className="space-y-3 text-sm font-body leading-7 text-palladium">
                {children}
            </div>
        </section>
    );
}

function PolicyTable({
    headers,
    rows,
}: {
    headers: string[];
    rows: string[][];
}) {
    return (
        <div className="my-5 overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-left text-xs sm:text-sm font-body">
                <thead>
                    <tr className="border-b border-white/20 text-olympus">
                        {headers.map((header) => (
                            <th key={header} className="px-4 py-3 font-medium">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr
                            key={index}
                            className="border-b border-white/[0.07] text-palladium"
                        >
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="px-4 py-3 align-top leading-6"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ContactLink({
    href,
    children,
}: {
    href: string;
    children: ReactNode;
}) {
    return (
        <a
            href={href}
            className="text-olympus underline decoration-white/30 underline-offset-4 transition hover:text-white"
        >
            {children}
        </a>
    );
}

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "How Alpha Male collects, uses, stores and protects your personal information when you shop with us.",
};

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-brand-navy px-5 py-8 text-olympus sm:px-8 sm:py-12">
            <div className="mx-auto max-w-4xl">

                {/* Back to Home */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 rounded-full border border-[#354158] px-5 py-2.5 text-sm text-palladium transition-all duration-300 hover:border-olympus hover:bg-[#19243B] hover:text-white"
                    >
                        <span className="transition-transform duration-300 group-hover:-translate-x-1">
                            ←
                        </span>
                        <span>Back to Home</span>
                    </Link>
                </div>

                {/* Header */}
                <header className="mb-12 text-center sm:mb-16">
                    <div className="mb-4 flex justify-center">
                        <Link href="/home" aria-label="Alpha Male home">
                            <Image
                                src="/images/logo.png"
                                alt="Alpha Male - Drive, Stamina, Energy"
                                width={150}
                                height={150}
                                priority
                                className="h-[90px] w-[90px] object-contain"
                            />
                        </Link>
                    </div>

                    <h1 className="font-heading text-3xl uppercase tracking-[0.12em] text-olympus sm:text-5xl">
                        Privacy Policy
                    </h1>

                    <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-[#929BAE]">
                        Effective: 02 November 2026
                    </p>

                    <div className="mx-auto mt-7 h-px w-16 bg-gradient-to-r from-transparent via-palladium to-transparent" />
                </header>

                <div className="mb-8 text-sm leading-7 font-body text-palladium">
                    As India’s first premium men’s wellness brand, Alpha Male treats
                    discretion as part of the product. This Privacy Policy explains what
                    personal data we collect when you visit alphamale.co.in, shop with us
                    or talk to our team. It also explains why we collect it, how we keep
                    it safe, and the choices you have. We follow the Digital Personal
                    Data Protection Act, 2023 (the “DPDP Act”), the Information Technology
                    Act, 2000, and the rules made under them.
                </div>

                {/* At a Glance */}
                <section className="mb-8 border border-white/10 bg-white/[0.025] p-5 sm:p-7 font-body">
                    <h2 className="mb-4  text-xl text-olympus font-heading font-semibold">
                        At a Glance
                    </h2>

                    <PolicyTable
                        headers={["Your question", "Our answer"]}
                        rows={[
                            ["Do you sell my data?", "Never."],
                            [
                                "Who sees my health details?",
                                "Only the doctor or pharmacy partner handling your order, where a product needs it.",
                            ],
                            [
                                "Will my parcel reveal what I bought?",
                                "No. The label carries only your name, address and phone number.",
                            ],
                            [
                                "Do you store my card details?",
                                "No. Payments are handled by RBI-compliant payment partners.",
                            ],
                            [
                                "Can I stop promotional messages?",
                                "Yes, at any time. Reply STOP or tap unsubscribe.",
                            ],
                            [
                                "Can I ask you to delete my data?",
                                "Yes. Email info@alphamale.co.in.",
                            ],
                        ]}
                    />

                    <p className="text-xs leading-6 text-[#929BAE]">
                        This summary is for convenience only. The full Policy below is what applies.
                    </p>
                </section>

                <div className="divide-y divide-white/[0.08]">

                    <Section title="1. Scope of This Policy">
                        <p>
                            This Policy covers personal data that Alpha Male (“we”, “us”,
                            “our”) collects through our website, our WhatsApp and social
                            channels, and our customer support. It applies to anyone who
                            browses, buys from, or contacts Alpha Male in India.
                        </p>
                        <p>
                            “Personal data” means any information that identifies you, on
                            its own or when combined with other information. Examples are
                            your name, mobile number, email address and delivery address.
                            This Policy does not cover information that is already public,
                            information collected offline, or third-party websites we link to.
                        </p>
                        <p>
                            By using our website or sharing your details with us, you agree
                            to this Policy. If you do not agree, please stop using our website.
                        </p>
                    </Section>

                    <Section title="2. What We Collect">
                        <PolicyTable
                            headers={["Type of data", "Examples"]}
                            rows={[
                                [
                                    "Contact and identity",
                                    "Name, mobile number, email address, delivery address",
                                ],
                                [
                                    "Order details",
                                    "Products bought, order value, delivery preferences, order history",
                                ],
                                [
                                    "Health details (only where a product needs them)",
                                    "Age, answers to a health questionnaire, prescription",
                                ],
                                [
                                    "Payment details",
                                    "Payment method and status, UPI ID or masked card number (full card and bank details stay with our payment partners)",
                                ],
                                [
                                    "Device and browsing",
                                    "IP address, browser and device type, pages visited, the website you came from",
                                ],
                                [
                                    "Conversations",
                                    "Emails, WhatsApp chats, call recordings for quality and training, reviews you post",
                                ],
                            ]}
                        />
                    </Section>

                    <Section title="3. How It Reaches Us">
                        <ul className="list-disc space-y-3 pl-5">
                            <li>
                                <strong className="text-olympus">From you:</strong> When you
                                create an account, place an order, fill in a form, enter a
                                promotion, or contact our team by email, phone or WhatsApp.
                            </li>
                            <li>
                                <strong className="text-olympus">Automatically:</strong>{" "}
                                Through cookies, pixels and similar tools as you browse. They
                                tell us which pages are popular and help keep your cart and
                                login working.
                            </li>
                            <li>
                                <strong className="text-olympus">From partners:</strong> For
                                example, a corrected delivery address from our courier, or
                                details a social media platform shares with us when you engage
                                with Alpha Male there, depending on your settings on that platform.
                            </li>
                        </ul>
                    </Section>

                    <Section title="4. Why We Use It">
                        <ul className="list-disc space-y-2 pl-5">
                            <li>To process, pack, deliver and support your orders, including cancellations, returns and refunds.</li>
                            <li>To check prescriptions or arrange consultations, where a product requires them.</li>
                            <li>To verify your age and identity, and to prevent fraud.</li>
                            <li>To send you updates about your orders and account.</li>
                            <li>To send offers and new launches, but only if you have opted in.</li>
                            <li>To understand how our website is used, so we can improve it, our products and your experience.</li>
                            <li>To meet legal, tax and regulatory obligations.</li>
                        </ul>
                    </Section>

                    <Section title="5. Messages We Send You">
                        <p>
                            <strong className="text-olympus">Service messages.</strong>{" "}
                            When you sign up, verify your number or place an order, we will
                            contact you about your account, payments, deliveries and any
                            legal matter. We may use SMS, WhatsApp, RCS, email, push
                            notifications or phone calls. These are essential to your order,
                            so they are not promotional.
                        </p>

                        <p>
                            <strong className="text-olympus">Offers and launches.</strong>{" "}
                            Promotional messages are sent only if you tick the opt-in box or
                            opt in later. They may come by WhatsApp, SMS, RCS or email. You
                            never need to opt in to shop with us.
                        </p>

                        <p>
                            <strong className="text-olympus">Channels.</strong> WhatsApp
                            messages come only from Alpha Male’s verified WhatsApp Business
                            account. RCS messages are delivered through your mobile network
                            and messaging app, and fall back to SMS if your device does not
                            support RCS. Your use of these apps is also governed by their own
                            terms and privacy policies.
                        </p>

                        <p>
                            <strong className="text-olympus">DND and TRAI rules.</strong>{" "}
                            We follow the TRAI Telecom Commercial Communications Customer
                            Preference Regulations, 2018. If your number is on the National
                            Customer Preference Register (DND), you will receive promotional
                            messages only if your consent has been recorded in the way those
                            rules require.
                        </p>

                        <p>
                            <strong className="text-olympus">Opting out.</strong> Reply
                            STOP to any SMS or WhatsApp message, tap unsubscribe in any
                            email, or write to info@alphamale.co.in. We will act on your
                            request within 7 working days. Messages about orders you have
                            already placed will continue.
                        </p>

                        <p>
                            <strong className="text-olympus">Consent records.</strong> We
                            keep a record of when and how you gave or withdrew consent.
                        </p>
                    </Section>

                    <Section title="6. Who We Share It With">
                        <p>
                            We share only what each partner needs, under contracts that
                            oblige them to protect it:
                        </p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>Delivery partners: your name, address and phone number, never your health details.</li>
                            <li>Payment partners: to process your payment securely.</li>
                            <li>Doctor and pharmacy partners: only for products that need a prescription or consultation.</li>
                            <li>Technology providers: for website hosting, analytics, messaging and customer support.</li>
                            <li>Authorities: where the law, a court or a government agency requires it, or where needed to protect our rights or someone’s safety.</li>
                            <li>A future owner: if Alpha Male merges with or is acquired by another business. Your data stays protected under this Policy.</li>
                        </ul>
                    </Section>

                    <Section title="7. Payments">
                        <p>
                            Your payments are processed by secure, RBI-compliant payment
                            partners that meet PCI-DSS standards. Your full card number and
                            bank details go directly to these partners and are never stored
                            by Alpha Male. All payment information is encrypted in transit.
                        </p>
                    </Section>

                    <Section title="8. Keeping Your Data Safe">
                        <p>
                            We use encryption (HTTPS/TLS), firewalls, secure servers and
                            role-based access controls, and we review our security regularly.
                            Only trained team members who need it can see health information.
                            No online system is completely secure, so please keep your
                            password and OTPs private. If a breach affects your data, we will
                            inform you and the Data Protection Board of India as the law requires.
                        </p>
                    </Section>

                    <Section title="9. How Long We Keep It">
                        <p>
                            We keep personal data only for as long as we need it for the
                            purposes in this Policy, or for as long as tax and other laws
                            require. After that, we securely delete or anonymise it. If your
                            account is inactive for 3 years and no law requires us to keep
                            your data, we delete it.
                        </p>
                    </Section>

                    <Section title="10. Your Rights">
                        <p>Under the DPDP Act, you can:</p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>Ask what personal data we hold about you and how we use it.</li>
                            <li>Correct or update your data.</li>
                            <li>Ask us to erase your data, unless the law requires us to keep it.</li>
                            <li>Withdraw your consent at any time.</li>
                            <li>Nominate someone to exercise these rights for you if you die or become unable to act.</li>
                            <li>Raise a complaint with us, and then with the Data Protection Board of India.</li>
                        </ul>
                        <p>
                            Email info@alphamale.co.in from your registered address to
                            exercise any of these rights. We may verify your identity first.
                        </p>
                    </Section>

                    <Section title="11. Reviews and Public Content">
                        <p>
                            Reviews, photos and comments you post on our website or social
                            pages may be visible to the public. Please don’t share personal
                            or health details in them. We may remove content that breaks our
                            Terms & Conditions.
                        </p>
                    </Section>

                    <Section title="12. Under-18s">
                        <p>
                            Alpha Male is for adults only. We do not knowingly collect data
                            from anyone under 18. If we learn that we have, we will delete it.
                        </p>
                    </Section>

                    <Section title="13. Access From Outside India">
                        <p>
                            Our servers and operations are in India. If you visit our website
                            from another country, your data will be transferred to India and
                            processed here under Indian law.
                        </p>
                    </Section>

                    <Section title="14. Third-Party Links and Ads">
                        <p>
                            Our website and ads may link to other websites, such as social
                            media pages or payment pages. We do not control those websites
                            and are not responsible for their privacy practices. Please read
                            their policies before you share any information with them.
                        </p>
                    </Section>

                    <Section title="15. Changes to This Policy">
                        <p>
                            We may update this Policy as our services or the law change. The
                            latest version, with its effective date, will always be on this
                            page. If a change is significant, we will also let you know by
                            email or with a notice on the website.
                        </p>
                    </Section>

                    <Section title="16. Privacy Grievances">
                        <p>
                            If you have a question or concern about your privacy, please
                            contact us using the details below.
                        </p>
                        <p>
                            We acknowledge every grievance within 24 hours and aim to
                            resolve it within 15 days.
                        </p>
                    </Section>

                    <Section title="Contact Us">
                        <p>For privacy questions, data requests or complaints:</p>
                        <ul className="space-y-3">
                            <li>
                                <span className="text-olympus">Email: </span>
                                <ContactLink href="mailto:info@alphamale.co.in">
                                    info@alphamale.co.in
                                </ContactLink>
                            </li>
                            <li>
                                <span className="text-olympus">Phone: </span>
                                <ContactLink href="tel:+919000937222">
                                    +91 90009 37222
                                </ContactLink>
                            </li>
                            <li>
                                <span className="text-olympus">WhatsApp: </span>
                                <ContactLink href="https://wa.me/919000937222">
                                    +91 90009 37222
                                </ContactLink>
                            </li>
                            <li>
                                <span className="text-olympus">Address: </span>
                                Hyderabad, Telangana, India
                            </li>
                        </ul>
                    </Section>
                </div>

                {/* <FooterPage /> replaced by FooterV2 in app/layout.tsx */}
                {/* Footer */}
                {/* <footer className="mt-12 border-t border-white/10 pt-8 text-center">
                    <p className="font-serif text-sm uppercase tracking-[0.35em] text-olympus">
                        ALPHA MALE
                    </p>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-[#929BAE]">
                        alphamale.co.in
                    </p>
                    <Link
                        href="/"
                        className="mt-5 inline-block text-xs text-[#929BAE] underline decoration-white/20 underline-offset-4 transition hover:text-white"
                    >
                        Back to Home
                    </Link>
                </footer> */}

            </div>
        </main>
    );
}
