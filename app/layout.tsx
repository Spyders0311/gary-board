import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Gary Board",
  description: "Collaborative kanban for Kyle & Gary"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} noise-bg min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
