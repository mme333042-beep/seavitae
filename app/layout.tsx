import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";
import AuthListener from "@/components/AuthListener";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "SeaVitae",
    template: "%s | SeaVitae",
  },
  description: "A sea of careers, searchable. For Employers: Find top talent by searching CVs directly. For Jobseekers: Create your CV and get discovered.",
  metadataBase: new URL("https://seavitae.com"),

  openGraph: {
    title: "SeaVitae",
    description: "A sea of careers, searchable.",
    url: "https://seavitae.com",
    siteName: "SeaVitae",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SeaVitae – A sea of careers, searchable",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "SeaVitae",
    description: "A sea of careers, searchable.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0N0M05DVH5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0N0M05DVH5');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthListener />
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
