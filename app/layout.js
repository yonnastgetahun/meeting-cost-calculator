import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Meeting Cost Calculator",
  description: "Calculate what meetings are really costing your team.",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
