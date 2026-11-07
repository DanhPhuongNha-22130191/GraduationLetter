import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Pinyon_Script, Kantumruy_Pro } from "next/font/google";
import "./globals.css";

// Tiêu đề: serif thanh lịch
const fontSerif = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Nội dung: sans-serif sạch, hỗ trợ đủ dấu tiếng Việt
const fontSans = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

// Chữ viết tay: chỉ dùng tiết chế cho tên người tốt nghiệp
const fontScript = Pinyon_Script({
  subsets: ["latin", "vietnamese"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

const fontKhmer = Kantumruy_Pro({
  subsets: ["khmer"],
  weight: ["400", "500", "600"],
  variable: "--font-khmer",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Lễ Tốt Nghiệp — Danh Phương Nhã",
  description: "Thư mời lễ tốt nghiệp của Danh Phương Nhã — Công nghệ thông tin, Class of 2026.",
  openGraph: {
    title: "Lễ Tốt Nghiệp — Danh Phương Nhã",
    description: "Thân mời tham dự Lễ Tốt Nghiệp ngành Công nghệ thông tin của Danh Phương Nhã.",
    type: "website",
    locale: "vi_VN",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// Cho phép zoom (accessibility)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E3A2F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`scroll-smooth ${fontSerif.variable} ${fontSans.variable} ${fontScript.variable} ${fontKhmer.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ivory text-charcoal antialiased selection:bg-gold selection:text-emerald-950 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
