import type { Metadata } from "next";
import { Cormorant_Garamond, Be_Vietnam_Pro, Kantumruy_Pro } from "next/font/google";
import "./globals.css";

const fontSerif = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const fontSans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const fontKhmer = Kantumruy_Pro({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-khmer",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lễ Tốt Nghiệp — Danh Phương Nhã",
  description: "Thư mời lễ tốt nghiệp của Danh Phương Nhã — Công nghệ thông tin, Class of 2026.",
  openGraph: {
    title: "Lễ Tốt Nghiệp — Danh Phương Nhã",
    description: "Trân trọng kính mời tham dự Lễ Tốt Nghiệp ngành Công nghệ thông tin của Danh Phương Nhã.",
    type: "website",
    locale: "vi_VN",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`scroll-smooth ${fontSerif.variable} ${fontSans.variable} ${fontKhmer.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#123C32" />
      </head>
      <body className="bg-ivory text-charcoal antialiased selection:bg-gold selection:text-white min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
