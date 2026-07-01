import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/SessionProvider"; // Import Provider-nya

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Taylor CMS",
  description: "Company Profile Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Bungkus seluruh aplikasi dengan Provider */}
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}