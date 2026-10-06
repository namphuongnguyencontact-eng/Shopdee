import React, { Suspense } from "react";
import { getGoogleAnalyticsConfig } from "@/services/siteSettings";
import GoogleAnalyticsClientTracker from "./GoogleAnalyticsClientTracker";

export default async function GoogleAnalyticsTag() {
  const config = await getGoogleAnalyticsConfig();
  if (!config || !config.enabled || !config.measurementId) {
    return null;
  }

  return (
    <>
      {/* Global site tag (gtag.js) - Google Analytics */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`}
      />
      <script
        id="google-tag-init"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${
              config.excludeAdmin
                ? `if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
                     gtag('config', '${config.measurementId}');
                   }`
                : `gtag('config', '${config.measurementId}');`
            }
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsClientTracker
          measurementId={config.measurementId}
          excludeAdmin={config.excludeAdmin}
        />
      </Suspense>
    </>
  );
}
