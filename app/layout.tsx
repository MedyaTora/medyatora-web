import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import VisitorTracker from "./components/visitor-tracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedyaTora",
  description: "Sosyal medya hizmetleri ve analiz platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}