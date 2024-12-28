import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers/auth-provider";
import Navbar from "./components/shared/Navbar";
import { Toaster } from "@/components/ui/toaster";
import AIChatButton from "./components/shared/AIChatButton";
import MobileNav from "./components/shared/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BEU College",
  description: "BEU College Question Papers Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <MobileNav />
            <Toaster />
            <AIChatButton />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
