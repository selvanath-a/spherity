import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { HeaderBar } from "@/components/HeaderBar";
import { QueryProvider } from "@/components/providers/QueryProvider";
import dynamic from "next/dynamic";

const OfflineBanner = dynamic(
  () => import("@/components/OfflineBanner").then((m) => m.OfflineBanner),
  { ssr: false },
);
const ptSerif = localFont({
  src: [
    {
      path: "../../public/fonts/PTSerif-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/PTSerif-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pt-serif",
  display: "swap",
});

const liberationSans = localFont({
  src: [
    {
      path: "../../public/fonts/LiberationSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/LiberationSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-liberation-sans",
  display: "swap",
});

const liberationSerif = localFont({
  src: [
    {
      path: "../../public/fonts/LiberationSerif-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/LiberationSerif-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-liberation-serif",
  display: "swap",
});

const nimbusMono = localFont({
  src: [
    {
      path: "../../public/fonts/NimbusMono-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/NimbusMono-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-nimbus-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VC Wallet",
  description: "Credential wallet for managing verifiable credentials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ptSerif.variable} ${liberationSerif.variable} ${liberationSans.variable} ${nimbusMono.variable} antialiased bg-background text-text min-h-screen`}
      >
        <QueryProvider>
          <OfflineBanner />
          <HeaderBar />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
