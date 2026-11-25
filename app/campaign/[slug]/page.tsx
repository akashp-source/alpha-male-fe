import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import Navbar from "@/Components/Home/NavBar";
// import FooterPage from "@/Components/Footer"; (replaced by FooterV2 in app/layout.tsx)
import CampaignView from "@/Components/Campaign/CampaignView";
import { normalizeCampaign } from "@/Components/Campaign/config";
import { getPublicCampaign } from "@/lib/campaign-server";

// Public page: no login. Example URL with tracking:
//   /campaign/bold-s-offer?utm_source=instagram&utm_medium=story&utm_campaign=bold-s-offer

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const campaign = await getPublicCampaign(slug).catch(() => null);

    if (!campaign) {
        return { title: "Offer not available | Alpha Male" };
    }

    const title = campaign.seo?.title || `${campaign.name} | Alpha Male`;
    const description = campaign.seo?.description || campaign.description || undefined;
    const image = campaign.seo?.ogImage || undefined;

    return {
        title,
        description,
        keywords: campaign.seo?.keywords || undefined,
        alternates: { canonical: `/campaign/${campaign.slug}` },
        openGraph: {
            title,
            description,
            type: "website",
            url: `/campaign/${campaign.slug}`,
            images: image ? [{ url: image }] : undefined,
        },
        twitter: {
            card: image ? "summary_large_image" : "summary",
            title,
            description,
            images: image ? [image] : undefined,
        },
    };
}

export default async function CampaignPage({ params }: Props) {
    const { slug } = await params;
    const raw = await getPublicCampaign(slug);

    if (!raw) {
        notFound();
    }

    const campaign = normalizeCampaign(raw);

    // Guess the device from the user agent so the first render already uses
    // the right layout; the browser corrects it if the guess is wrong.
    const userAgent = (await headers()).get("user-agent") || "";
    const initialDevice = /Mobi|Android|iPhone|iPod/i.test(userAgent) ? "mobile" : "desktop";

    return (
        <>
            <Navbar />
            <main className="flex w-full flex-col">
                <CampaignView
                    slug={campaign.slug}
                    sections={campaign.sections}
                    products={raw.products || []}
                    backgroundColor={campaign.settings.backgroundColor}
                    contained={campaign.settings.contentWidth === "contained"}
                    initialDevice={initialDevice}
                />
            </main>
            {/* <FooterPage /> replaced by FooterV2 in app/layout.tsx */}
        </>
    );
}
