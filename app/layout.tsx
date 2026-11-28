import type { Metadata } from "next";
import { Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZLab · انیمیشن محصولات",
  description:
    "کاتالوگ تعاملی مدل‌های سه‌بعدی و انیمیشن Explode محصولات آزمایشگاه فناوری‌های پیشرفته فناپ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0c1118] text-slate-100">
        {children}
      </body>
    </html>
  );
}
