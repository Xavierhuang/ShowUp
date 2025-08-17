import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/lib/providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import "./globals.css";

// Suppress non-critical Dynamic SDK errors in development
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    // Convert all args to strings for better error detection
    const errorStr = JSON.stringify(args).toLowerCase();
    const firstArg = (args[0]?.toString() || '').toLowerCase();
    
    // Comprehensive Dynamic SDK error suppression
    if (errorStr.includes('failed to fetch') || 
        errorStr.includes('dynamicsdk') ||
        errorStr.includes('getsupportedonramps') ||
        errorStr.includes('onramp') ||
        errorStr.includes('pub is no longer a valid access keyword') ||
        errorStr.includes('walletconnector') ||
        errorStr.includes('access api') ||
        errorStr.includes('cadence runtime error') ||
        errorStr.includes('invalid flow argument') ||
        firstArg.includes('http request error')) {
      return; // Silently ignore these errors
    }
    originalError.apply(console, args);
  };
}


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShowUp - Stake to Attend Events",
  description: "The first event platform where commitment matters. Stake FLOW tokens to secure your spot, attend to get your stake back.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}