"use client";

import Script from "next/script";

export default function GoogleTagManager() {
    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtm.js?id=GTM-MCDSLJLR`}
                strategy="afterInteractive"
            />

            <Script id="google-tag-manager-init" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
          });
        `}
            </Script>
        </>
    );
}