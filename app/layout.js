import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: "Meeting Cost Calculator | See What Meetings Really Cost",
  description: "71% of meetings waste money & burn out teams. Calculate the true cost of your meetings including context switching and lost deep work. Free facilitation templates included.",
  keywords: "meeting cost calculator, meeting ROI, productivity, meeting efficiency, facilitation tools, team meetings",
  authors: [{ name: "PulseCollab Agency" }],
  creator: "PulseCollab Agency",
  publisher: "PulseCollab Agency",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  openGraph: {
    title: "Only 29% of Meetings Drive ROI - Calculate Your Meeting Costs",
    description: "Discover the hidden costs of meetings including context switching and lost productivity. Get free facilitation templates.",
    type: "website",
    locale: "en_US",
    url: "https://cal.pulsecollabagency.com",
    siteName: "PulseCollab Meeting Cost Calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meeting Cost Calculator - What Are Meetings Really Costing?",
    description: "Calculate the true cost of meetings including hidden productivity losses",
    site: "@pulsecollabagency",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Separate viewport export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager Script */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-MP7JXQLM');
            `,
          }}
        />
        
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{display: 'none'}} 
            src="https://www.facebook.com/tr?id=690959150421413&ev=PageView&noscript=1" 
          />
        </noscript>
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-MP7JXQLM"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        
        {/* Meta Pixel Code using Next.js Script component */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '690959150421413'); 
              fbq('track', 'PageView');
              
              // Track page load time and setup session tracking
              window.sessionStartTime = Date.now();
              window.calculatorUsageCount = 0;
              window.hasEngaged = false;
              
              // Add custom event tracking helper for Meta
              window.trackCustomEvent = function(eventName, params) {
                if (window.fbq) {
                  window.fbq('trackCustom', eventName, params);
                }
              };
            `,
          }}
        />
        
        {/* Google Analytics 4 Integration */}
        <Script
          id="google-analytics-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize analytics tracking helpers
              window.trackAnalytics = function(eventName, params) {
                // Track to both GA4 and Meta Pixel
                if (window.gtag) {
                  window.gtag('event', eventName, params);
                }
                if (window.fbq) {
                  window.fbq('trackCustom', eventName, params);
                }
                // Also push to GTM dataLayer
                if (window.dataLayer) {
                  window.dataLayer.push({
                    'event': eventName,
                    ...params
                  });
                }
              };
              
              // Specific calculator tracking functions
              window.trackCalculatorStart = function() {
                window.calculatorUsageCount++;
                window.trackAnalytics('calculator_started', {
                  event_category: 'calculator',
                  event_label: 'meeting_cost',
                  usage_count: window.calculatorUsageCount
                });
              };
              
              window.trackCalculatorComplete = function(meetingCost, attendees, duration) {
                window.trackAnalytics('calculation_completed', {
                  event_category: 'calculator',
                  event_label: 'meeting_cost',
                  value: Math.round(meetingCost),
                  meeting_attendees: attendees,
                  meeting_duration: duration,
                  currency: 'USD'
                });
              };
              
              window.trackEngagement = function(action, label) {
                if (!window.hasEngaged) {
                  window.hasEngaged = true;
                  window.trackAnalytics('first_engagement', {
                    event_category: 'engagement',
                    event_label: action
                  });
                }
                window.trackAnalytics(action, {
                  event_category: 'engagement',
                  event_label: label || 'meeting_calculator'
                });
              };
              
              // Track time on page when leaving
              window.addEventListener('beforeunload', function() {
                const timeSpent = Math.round((Date.now() - window.sessionStartTime) / 1000);
                window.trackAnalytics('time_on_calculator', {
                  event_category: 'engagement',
                  value: timeSpent,
                  calculations_performed: window.calculatorUsageCount
                });
              });
            `,
          }}
        />
        
        {children}
        
        {/* Google Analytics 4 - Using environment variable */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}