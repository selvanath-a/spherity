import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Page metadata for SEO and browser tab */
export const metadata: Metadata = {
  title: "VC Wallet",
  description: "Credential wallet for managing verifiable credentials",
};

/**
 * Root layout component wrapping all pages.
 * Provides navigation header with links to Dashboard, Issue, and Verify pages.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="nav">
          <div className="nav-container">
            <Link href="/" className="nav-brand">
              Wallet
            </Link>
            <div className="nav-links">
              <Link href="/" className="nav-link">
                Dashboard
              </Link>
              <Link href="/issue" className="nav-link">
                Issue
              </Link>
              <Link href="/verify" className="nav-link">
                Verify
              </Link>
            </div>
          </div>
        </nav>
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
