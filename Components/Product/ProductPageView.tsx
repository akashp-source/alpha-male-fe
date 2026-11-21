// Product page sections, shared by the public page and the admin preview.
import ProductBuySection from "@/Components/Product/ProductBuySection";
import ProductRecommendations from "@/Components/Product/ProductRecommendations";
import ProductKeyPoints from "@/Components/Product/ProductKeyPoints";
import ProductHowItWorks from "@/Components/Product/HowToUse/ProductHowItWorks";
import ProductHighlights from "@/Components/Product/Highlights/ProductHighlights";
import ProductHighlightsV2 from "@/Components/Product/Highlights/ProductHighlightsV2";
import ProductHighlightsV3 from "@/Components/Product/Highlights/ProductHighlightsV3";
import ProductHighlightsV4 from "@/Components/Product/Highlights/ProductHighlightsV4";
import ProductClaims from "@/Components/ProductClaims";
import ProductFAQs from "@/Components/Product/ProductFAQs";
import ProductComparison from "@/Components/Product/ProductComparison";
import ProductDetailedDescription from "@/Components/Product/ProductDetailedDescription";
import ProductRatings from "@/Components/Product/ProductRatings";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductPageView({ product }: { product: any }) {
    return (
        <main className="flex w-full flex-col items-center overflow-x-clip bg-white">

            {/* Product details and purchase section */}

            <ProductBuySection product={product} />

            {/* Product recommendations */}
            <ProductRecommendations product={product} />

            {/* Product key points */}
            <ProductKeyPoints
                keyPoints={product.keyPoints}
            />

            {/* How the product works */}
            <ProductHowItWorks
                title={`How ${product.name} works`}
                description={product.description}
                steps={product.howToUse}
            />
            <br /><br />

            <ProductComparison comparison={product.comparison} />

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
            <ProductHighlightsV4
                highlights={product.highlights}
                heading={`Why Choose ${product.name}?`}
                eyebrow="WHY BOLD S"
                productName="BOLD S"
                strength="25mg"
            />

            <ProductClaims
                claims={product.claims}
                heading="The Alpha Male Promise"
            />

            {/* Long-form description (renders only if set in DB) */}
            <ProductDetailedDescription
                detailedDescription={product.detailedDescription}
                productName={product.name}
            />

            {/* Ratings and reviews (renders only if the product has ratings) */}
            <ProductRatings
                productId={product._id}
                productName={product.name}
                ratings={product.ratings}
            />

            <ProductFAQs
                faqs={product.faqs}
                productName={product.name}
            />
        </main>
    );
}
