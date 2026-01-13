import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SeaVitae",
  description: "A CV-first talent discovery platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
