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
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
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