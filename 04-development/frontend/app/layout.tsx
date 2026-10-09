import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Shell } from "@/components/shell";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
});

const sans = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SECRET — Не выбирай букет. Создай его.",
  description: "Демонстрационный интерактивный опыт цветочного ателье SECRET. Не официальный сайт.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${serif.variable} ${sans.variable} font-sans antialiased`}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
