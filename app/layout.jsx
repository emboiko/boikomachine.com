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
      </body>
    </html>
  );
}
