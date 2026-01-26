import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
  description: "A sea of careers, searchable.",
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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthListener />
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
