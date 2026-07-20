import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "StellarDAO — On-Chain Governance Platform",
  description:
    "A decentralized DAO governance platform built on Stellar/Soroban. Create governance proposals, vote collectively, and execute on-chain decisions as a community.",
  keywords: ["Stellar", "Soroban", "DAO", "governance", "DeFi", "smart contracts", "voting", "decentralized"],
  openGraph: {
    title: "StellarDAO — On-Chain Governance Platform",
    description: "Collectively govern your DAO with on-chain proposals and voting on Stellar testnet",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Navbar />
              <main className="flex-1 p-6 lg:p-8 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
