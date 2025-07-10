import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: "Meeting Cost Calculator | See What Meetings Really Cost",
  description: "71% of meetings waste money & burn out teams. Calculate the true cost of your meetings including context switching and lost deep work. Free facilitation templates included.",
  keywords: "meeting cost calculator, meeting ROI, productivity, meeting efficiency, facilitation tools, team meetings",
  authors: [{ name: "Your Facilitation Company" }],
  creator: "Your Facilitation Company",
  publisher: "Your Facilitation Company",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Only 29% of Meetings Drive ROI - Calculate Your Meeting Costs",
    description: "Discover the hidden costs of meetings including context switching and lost productivity. Get free facilitation templates.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meeting Cost Calculator - What Are Meetings Really Costing?",
    description: "Calculate the true cost of meetings including hidden productivity losses",
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

// Separate viewport export (this is the fix!)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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
              
              // Add custom event tracking helper
              window.trackCustomEvent = function(eventName, params) {
                if (window.fbq) {
                  window.fbq('trackCustom', eventName, params);
                }
              };
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}