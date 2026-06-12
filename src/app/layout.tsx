import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Bhagyalaxmi ERP | Premium Wedding Venue Operating System",
  description: "Advanced ERP platform for Bhagyalaxmi Lawns - Wedding bookings, slot schedules, invoicing, vendor contracts, and staff coordinator tools.",
  keywords: ["Wedding ERP", "Banquet Management System", "Wedding Venue Software", "Bhagyalaxmi Lawns", "Ahilyanagar"],
};

import DatabaseProvider from "@/components/layout/database-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-dark font-sans selection:bg-purple-light selection:text-purple-primary">
        <DatabaseProvider>
          {children}
        </DatabaseProvider>
      </body>
    </html>
  );
}
