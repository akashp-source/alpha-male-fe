// Product page sections, shared by the public page and the admin preview.
import ProductBuySection from "@/Components/Product/ProductBuySection";
// import ProductRecommendations from "@/Components/Product/ProductRecommendations";
import ProductRecommendationsV2 from "@/Components/Product/ProductRecommendationsV2";
// import ProductKeyPoints from "@/Components/Product/ProductKeyPoints";
// import ProductHowItWorks from "@/Components/Product/HowToUse/ProductHowItWorks";
import ProductHowToUseV2, { isOralStrip } from "@/Components/Product/HowToUse/ProductHowToUseV2";
import ProductHighlights from "@/Components/Product/Highlights/ProductHighlights";
import ProductHighlightsV2 from "@/Components/Product/Highlights/ProductHighlightsV2";
import ProductHighlightsV3 from "@/Components/Product/Highlights/ProductHighlightsV3";
import ProductHighlightsV4 from "@/Components/Product/Highlights/ProductHighlightsV4";
import ProductClaims from "@/Components/ProductClaims";
// import ProductFAQs from "@/Components/Product/ProductFAQs";
import ProductFAQsV2 from "@/Components/Product/ProductFAQsV2";
// import ProductComparison from "@/Components/Product/ProductComparison";
import ProductInformation from "@/Components/Product/ProductInformation";
import ProductAfterOrder from "@/Components/Product/ProductAfterOrder";
import ProductCompareAndSafety from "@/Components/Product/ProductCompareAndSafety";
import ProductComparisonV2 from "@/Components/Product/ProductComparisonV2";
// import ProductDetailedDescription from "@/Components/Product/ProductDetailedDescription";
import ProductDetailedDescriptionV2 from "@/Components/Product/ProductDetailedDescriptionV2";
// import ProductRatings from "@/Components/Product/ProductRatings";
import ProductRatingsV2 from "@/Components/Product/ProductRatingsV2";
import DeliveryBanner from "@/Components/DeliveryBanner";
import OurStandard from "@/Components/OurStandard";
import ProductStoryBanners from "@/Components/Product/ProductStoryBanners";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductPageView({ product }: { product: any }) {
    // "Why choose" label + centre badge from admin; blank parts fall back to
    // the product name and its strength label.
    const badgeName = product.highlightsBadge?.name?.trim() || product.name;
    const badgeStrength = product.highlightsBadge?.strength?.trim() || product.strength?.label || "";
    const badgeEyebrow = product.highlightsBadge?.eyebrow?.trim() || `Why ${badgeName}`.toUpperCase();

    return (
        <main className="flex w-full flex-col items-center overflow-x-clip bg-white">

            {/* Product details and purchase section */}

            <ProductBuySection key={product._id} product={product} />



            {/* Product recommendations */}
            {/* <ProductRecommendations product={product} /> old design, replaced by ProductRecommendationsV2 */}
            <ProductRecommendationsV2 product={product} />

            {/* "Our standard" badges (replaces the navy trust bar) */}
            {/* <OurStandard /> */}
            <OurStandard marquee />

            {/* Story banners (stacked; renders only if set in admin) */}
            <ProductStoryBanners header={product.storyHeader} banners={product.storyBanners} />

            {/* Product key points (removed from the page)
            <ProductKeyPoints
                keyPoints={product.keyPoints}
            /> */}

            {/* How the product works (old design, replaced by ProductHowToUseV2)
            <ProductHowItWorks
                title={`How ${product.name} works`}
                description={product.description}
                steps={product.howToUse}
            />
            <br /><br /> */}

            {/* How to use */}
            {/* <ProductHowToUseV2
                eyebrow="The Ritual"
                category={product.category}
                intro={isOralStrip(product.category)
                    ? "A strip thinner than a card, mint-flavoured, sealed one by one so it travels in a wallet."
                    : undefined}
                steps={product.howToUse}
            /> */}

            {/* Product information ("Inside the pack") */}
            <ProductInformation
                information={product.productInformation}
                // sku={product.sku}
                licenceNumber={product.licenceNumber}
            />

            {/* What happens after you order (call step only for prescription products) */}
            <ProductAfterOrder requiresPrescription={product.requiresPrescription === true} />

            {/* Comparison table + "Read before use" (old comparison design replaced)
            <ProductComparison comparison={product.comparison} /> */}
            {/* Comparison + safety side by side (old design, replaced below)
            <ProductCompareAndSafety
                comparison={product.comparison}
                safetyInfo={product.safetyInfo}
            /> */}

            {/* "Strips vs pills" comparison with product images (admin → Know the difference) */}
            <ProductComparisonV2 comparison={product.comparison} />

            {/* "Read before use" on its own (no comparison passed) */}
            <ProductCompareAndSafety safetyInfo={product.safetyInfo} />

            {/* 
        <ProductHighlights
            heading={`Why Choose ${product.name}?`}
            highlights={product.highlights}
        />

        <br />
        <ProductHighlightsV2
            heading={`Why Choose ${product.name}?`}
            highlights={product.highlights}
        />

        <br /><br />
        <ProductHighlightsV3
            heading={`Why Choose ${product.name}?`}
            eyebrow="WHY BOLD S"
            highlights={product.highlights}
        /> */}
            {/* <ProductHighlightsV4
                highlights={product.highlights}
                heading={`Why Choose ${product.name}?`}
                eyebrow={badgeEyebrow}
                productName={badgeName}
                strength={badgeStrength}
            /> */}

            {/* <ProductClaims
                claims={product.claims}
                heading="The Alpha Male Promise"
            /> */}

            {/* Long-form description (old design, replaced by ProductDetailedDescriptionV2)
            <ProductDetailedDescription
                detailedDescription={product.detailedDescription}
                productName={product.name}
            /> */}
            {/* Long-form description (renders only if set in DB) */}
            {/* <ProductDetailedDescriptionV2
                detailedDescription={product.detailedDescription}
                productName={product.name}
            /> */}

            {/* Ratings and reviews (old design, replaced by ProductRatingsV2)
            <ProductRatings
                productId={product._id}
                productName={product.name}
                ratings={product.ratings}
            /> */}
            {/* Ratings and reviews (renders only if the product has ratings) */}
            <ProductRatingsV2 ratings={product.ratings} />

            {/* Discreet delivery banner (no Shop button on the product page).
                White space above keeps it apart from the navy reviews band. */}
            <div className="w-full bg-white pt-12 sm:pt-16">
                <DeliveryBanner />
            </div>

            {/* FAQs (old design, replaced by ProductFAQsV2)
            <ProductFAQs
                faqs={product.faqs}
                productName={product.name}
            /> */}
            <ProductFAQsV2 faqs={product.faqs} />
        </main>
    );
}
