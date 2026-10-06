import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import ToastContainer from "@/components/ui/ToastContainer";
import CompareBar from "@/components/shop/CompareBar";
import CompareModal from "@/components/shop/CompareModal";
import TrafficTracker from "@/components/analytics/TrafficTracker";
import GoogleAnalyticsTag from "@/components/analytics/GoogleAnalyticsTag";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#192841",
};

export const metadata: Metadata = {
  title: "SHOPDEE Việt Nam | Mua Sắm Online",
  description:
    "Nền tảng mua sắm trực tuyến đỉnh cao: khám phá sản phẩm hot trend, săn voucher ưu đãi, chốt đơn mượt mà, giao hàng hỏa tốc 24h và bảo hành chính hãng.",
  keywords: ["shopdee", "gen z", "mua sắm", "shopping online", "thời trang gen z"],
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "SHOPDEE — Shopping Experience",
    description: "Thỏa mãn cảm xúc mua sắm bất tận với hàng ngàn ưu đãi hấp dẫn.",
    url: "https://shopdee.local",
    siteName: "SHOPDEE",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <GoogleAnalyticsTag />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[#f5f5f5] text-[#192841] selection:bg-[#192841] selection:text-white">
        <Suspense fallback={null}>
          <TrafficTracker />
        </Suspense>
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileNav />
        <CartDrawer />
        <CompareBar />
        <CompareModal />
        <ToastContainer />
      </body>
    </html>
  );
}
