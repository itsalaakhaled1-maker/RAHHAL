"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plane, Hotel, DollarSign, CalendarDays, Users, MapPin,
  Clock, Check, ChevronLeft, Printer, Download, Share2, Heart,
} from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { formatCurrency, formatDate, calculateNights } from "@/lib/utils";
import { domToPng } from "modern-screenshot";
import jsPDF from "jspdf";
import Booklet from "./Booklet";

export default function TripReview() {
  const { tripData, selectedFlight, selectedHotel, dailyPlans, budgetItems, saveTrip, setCurrentStep } = useTripStore();
  const [showBooklet, setShowBooklet] = useState(false);
  const [liked, setLiked] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const nights = calculateNights(tripData.departDate, tripData.returnDate);
  const totalCost = budgetItems.reduce((sum, item) => sum + item.value, 0);

  if (showBooklet) {
    return <Booklet onClose={() => setShowBooklet(false)} />;
  }

  /* ========== 1️⃣ SHARE ========== */
  const handleShare = async () => {
    const shareData = {
      title: `رحلتي إلى ${tripData.to}`,
      text: `✈️ رحلة من ${tripData.from} إلى ${tripData.to}\n📅 ${formatDate(tripData.departDate)} - ${formatDate(tripData.returnDate)}\n💰 ${formatCurrency(totalCost, tripData.currency)}\n🏨 ${selectedHotel?.name || ""}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled — silent
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert("✅ تم نسخ تفاصيل الرحلة إلى الحافظة!");
      } catch {
        alert("المشاركة غير مدعومة في هذا المتصفح");
      }
    }
  };

  /* ========== 2️⃣ PDF DOWNLOAD ========== */
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setPdfLoading(true);

    try {
      // ✅ استخدم modern-screenshot بدل html2canvas
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      // Get dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const imgWidth = img.width;
      const imgHeight = img.height;

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      let heightLeft = imgHeight * ratio;
      let position = 0;
      let pageCount = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight * ratio;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pdfHeight;
        pageCount++;
        if (pageCount > 50) break; // Safety limit
      }

      pdf.save(`رحلة-${tripData.to}-${tripData.departDate}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("❌ حدث خطأ أثناء إنشاء PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مراجعة الرحلة</h2>
          <p className="text-gray-500 mt-1">تأكد من كل التفاصيل قبل الحجز</p>
        </div>
        <button
          onClick={() => setCurrentStep(4)}
          className="flex items-center gap-2 text-ocean font-bold hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          العودة للخطة
        </button>
      </div>

      {/* ===== PRINTABLE CONTENT ===== */}
      <div ref={contentRef}>
        {/* Trip Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-card-lg border border-gray-100 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl gradient-ocean flex items-center justify-center shadow-lg">
                <Plane className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-800">
                  {tripData.from} → {tripData.to}
                </h3>
                <p className="text-gray-500">
                  {formatDate(tripData.departDate)} - {formatDate(tripData.returnDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  liked ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <Users className="w-6 h-6 text-ocean mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">{tripData.adults + tripData.children}</p>
              <p className="text-sm text-gray-500">مسافر</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <CalendarDays className="w-6 h-6 text-ocean mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">{nights}</p>
              <p className="text-sm text-gray-500">ليلة</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <MapPin className="w-6 h-6 text-ocean mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">{dailyPlans.length}</p>
              <p className="text-sm text-gray-500">يوم</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <DollarSign className="w-6 h-6 text-ocean mx-auto mb-2" />
              <p className="text-2xl font-black text-ocean">{formatCurrency(totalCost, tripData.currency)}</p>
              <p className="text-sm text-gray-500">التكلفة الإجمالية</p>
            </div>
          </div>
        </motion.div>

        {/* Flight Details */}
        {selectedFlight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 mb-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <Plane className="w-5 h-5 text-ocean" />
              <h3 className="font-bold text-gray-800">تفاصيل الرحلة</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg text-gray-800">{selectedFlight.airline}</p>
                <p className="text-sm text-gray-500">
                  {selectedFlight.fromCode} → {selectedFlight.toCode} | {selectedFlight.duration}
                </p>
              </div>
              <p className="text-xl font-black text-ocean">
                {formatCurrency(selectedFlight.price * tripData.adults, selectedFlight.currency)}
              </p>
            </div>
          </motion.div>
        )}

        {/* Hotel Details */}
        {selectedHotel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 mb-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <Hotel className="w-5 h-5 text-ocean" />
              <h3 className="font-bold text-gray-800">تفاصيل الإقامة</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg text-gray-800">{selectedHotel.name}</p>
                <p className="text-sm text-gray-500">
                  {nights} ليلة | {selectedHotel.stars} نجوم
                </p>
              </div>
              <p className="text-xl font-black text-ocean">
                {formatCurrency(selectedHotel.totalPrice, selectedHotel.currency)}
              </p>
            </div>
          </motion.div>
        )}

        {/* Budget Breakdown */}
        {budgetItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-ocean" />
              <h3 className="font-bold text-gray-800">تفاصيل الميزانية</h3>
            </div>
            <div className="space-y-3">
              {budgetItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(item.value, item.currency)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="font-bold text-gray-800">الإجمالي</span>
                <span className="text-xl font-black text-ocean">
                  {formatCurrency(totalCost, tripData.currency)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowBooklet(true)}
          className="col-span-2 md:col-span-1 py-4 bg-ocean text-white rounded-2xl font-bold shadow-lg shadow-ocean/25 hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5" />
          طباعة الكتيب
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            saveTrip();
            alert("تم حفظ الرحلة بنجاح!");
          }}
          className="py-4 bg-success text-white rounded-2xl font-bold shadow-lg shadow-success/25 hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          حفظ الرحلة
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          مشاركة
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {pdfLoading ? (
            <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          PDF
        </motion.button>
      </div>
    </div>
  );
}