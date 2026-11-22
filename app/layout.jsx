import Script from 'next/script';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Analytics } from '@vercel/analytics/react';
import { sourceSans } from '@/theme/theme';
import { ThemeRegistry } from '@/components/ThemeRegistry';
import { StoreProvider } from '@/components/StoreProvider';
import { LocalBusinessJsonLd } from '@/components/seo/LocalBusinessJsonLd';
import { isAnalyticsEnabled } from '@/lib/analytics/isEnabled';
import { BUSINESS } from '@/lib/constants';
import './globals.css';

const siteDescription =
  'Boiko Machine & Tool is a New Hampshire machine shop for custom machining, repair, precision prototypes, and tooling in southern NH. Small jobs welcome.';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
}

export const metadata = {
  metadataBase: new URL(BUSINESS.siteUrl),
  title: {
    default: `${BUSINESS.name} | NH Machine Shop`,
    template: `%s | ${BUSINESS.name}`,
  },
  description: siteDescription,
  openGraph: {
    title: `${BUSINESS.name} | NH Machine Shop`,
    description: siteDescription,
    url: BUSINESS.siteUrl,
    siteName: BUSINESS.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BUSINESS.name} | NH Machine Shop`,
    description: siteDescription,
  },
  alternates: {
    canonical: BUSINESS.siteUrl,
  },
};

export default function RootLayout({ children }) {
  const analyticsEnabled = isAnalyticsEnabled();
  const gaMeasurementId = analyticsEnabled ? process.env.GA_MEASUREMENT_ID : undefined;
  const openaiPixelId = analyticsEnabled ? process.env.OPENAI_PIXEL_ID : undefined;
  const vercelEnv =
    process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || '';
  const openaiPixelDebug = vercelEnv !== 'production';

  return (
    <html lang="en" className={sourceSans.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <InitColorSchemeScript defaultMode="system" />
        <LocalBusinessJsonLd />
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <StoreProvider>{children}</StoreProvider>
          </ThemeRegistry>
        </AppRouterCacheProvider>
        <Analytics />
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        ) : null}
        {openaiPixelId ? (
          <Script id="openai-ads-pixel" strategy="afterInteractive">
            {`
              !function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");
              oaiq("init",{pixelId:"${openaiPixelId}",debug:${openaiPixelDebug}});
            `}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
