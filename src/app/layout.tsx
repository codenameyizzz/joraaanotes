import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans, Caveat, Space_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-handwriting",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joraaa Notes — Aesthetic Digital Keepsake & Letters",
  description: "Kirim sepucuk surat, potret polaroid, dan catatan estetik dalam amplop kenangan digital.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${instrumentSerif.variable} ${plusJakarta.variable} ${caveat.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-[#E2D4C0] selection:text-[#25221F]">
        {children}
      </body>
    </html>
  );
}
