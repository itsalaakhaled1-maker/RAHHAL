"use client";

import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import Header from "@/components/shared/Header";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
  
        {/* Open Graph / WhatsApp / Facebook Preview */}
        <meta property="og:title" content="رحال - مخطط رحلاتك الذكي" />
        <meta property="og:description" content="خطط رحلتك كاملة من الطيران للفنادق والخطة اليومية بالذكاء الاصطناعي!" />
        <meta property="og:image" content="https://www.tryrahhal.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://www.tryrahhal.com" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_AR" />
        <meta property="og:site_name" content="رحال" />
  
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="رحال - مخطط رحلاتك الذكي" />
        <meta name="twitter:description" content="خطط رحلتك كاملة من الطيران للفنادق والخطة اليومية!" />
        <meta name="twitter:image" content="https://www.tryrahhal.com/og-image.png" />
  
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-tajawal antialiased bg-white text-gray-900">
        <Header />
        {mounted ? (
          <>
            {children}
            <Toaster position="top-center" richColors />
          </>
        ) : (
          <div className="min-h-screen bg-white" />
        )}
      </body>
    </html>
  );
}