"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plane, MapPin, Calendar, ArrowRight, Trash2, Eye, X,
  Hotel, DollarSign, Clock,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import { useTripStore } from "@/hooks/useTripStore";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TripsPage() {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const { savedTrips, deleteTrip, loadTrip, loadUserTrips, isLoading } = useTripStore();
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  // ✅ تحميل رحلات المستخدم من Supabase
  useEffect(() => {
    if (user) {
      loadUserTrips();
    }
  }, [user, loadUserTrips]);

  const getTripTitle = (trip: any) => {
    if (trip.tripData?.from && trip.tripData?.to) {
      return `${trip.tripData.from} → ${trip.tripData.to}`;
    }
    if (trip.from && trip.to) return `${trip.from} → ${trip.to}`;
    if (trip.title) return trip.title;
    return "رحلة بدون اسم";
  };

  const getTripDates = (trip: any) => {
    if (trip.tripData?.departDate && trip.tripData?.returnDate) {
      return `${formatDate(trip.tripData.departDate)} - ${formatDate(trip.tripData.returnDate)}`;
    }
    if (trip.dates) return trip.dates;
    if (trip.tripData?.departDate) return formatDate(trip.tripData.departDate);
    return "تاريخ غير محدد";
  };

  const getTripDays = (trip: any) => {
    if (trip.dailyPlans?.length) return `${trip.dailyPlans.length} أيام`;
    if (trip.days) return `${trip.days} أيام`;
    return "";
  };

  const getTripCost = (trip: any) => {
    const cost = trip.totalCost || 0;
    const currency = trip.tripData?.currency || trip.currency || "AED";
    return formatCurrency(cost, currency);
  };

  const handleView = (trip: any) => {
    if (trip.tripData && trip.dailyPlans) {
      loadTrip(trip.id);
      setSelectedTrip(trip);
    }
  };

  return (
    <AuthGuard user={user} onSignIn={signInWithGoogle}>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">رحلاتي</h1>
            <p className="text-gray-500">جميع رحلاتك المحفوظة في مكان واحد</p>
          </div>

          {savedTrips.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-card border border-gray-100 text-center">
              <div className="w-20 h-20 rounded-2xl bg-ocean/10 flex items-center justify-center mx-auto mb-6">
                <Plane className="w-10 h-10 text-ocean" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">لا توجد رحلات محفوظة</h2>
              <p className="text-gray-500 mb-6">ابدأ رحلتك الأولى باستخدام مخطط الرحلات الذكي</p>
              <Link
                href="/trip"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ocean text-white rounded-xl font-bold hover:bg-ocean/90 transition-all"
              >
                ابدأ رحلة جديدة
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedTrips.map((trip: any) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:shadow-card-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-ocean/10 flex items-center justify-center">
                        <Plane className="w-7 h-7 text-ocean" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {getTripTitle(trip)}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {getTripDates(trip)}
                          </span>
                          {getTripDays(trip) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {getTripDays(trip)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-ocean">
                        {getTripCost(trip)}
                      </span>
                      <button
                        onClick={() => handleView(trip)}
                        className="w-10 h-10 rounded-xl bg-ocean/10 flex items-center justify-center text-ocean hover:bg-ocean hover:text-white transition-all"
                        title="عرض الرحلة"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteTrip(trip.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedTrip && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-3xl">
                <h2 className="text-xl font-bold text-gray-800">تفاصيل الرحلة</h2>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-black text-gray-800">
                    {selectedTrip.tripData?.from} → {selectedTrip.tripData?.to}
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {formatDate(selectedTrip.tripData?.departDate)} - {formatDate(selectedTrip.tripData?.returnDate)}
                  </p>
                </div>

                {selectedTrip.selectedFlight && (
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Plane className="w-5 h-5 text-ocean" />
                      تفاصيل الرحلة
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{selectedTrip.selectedFlight.airline}</p>
                        <p className="text-sm text-gray-500">
                          {selectedTrip.selectedFlight.fromCode} → {selectedTrip.selectedFlight.toCode}
                        </p>
                      </div>
                      <p className="font-bold text-ocean">
                        {formatCurrency(selectedTrip.selectedFlight.price, selectedTrip.selectedFlight.currency)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTrip.selectedHotel && (
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Hotel className="w-5 h-5 text-ocean" />
                      تفاصيل الإقامة
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{selectedTrip.selectedHotel.name}</p>
                        <p className="text-sm text-gray-500">{selectedTrip.selectedHotel.area}</p>
                      </div>
                      <p className="font-bold text-ocean">
                        {formatCurrency(selectedTrip.selectedHotel.totalPrice, selectedTrip.selectedHotel.currency)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTrip.dailyPlans?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-ocean" />
                      الخطة اليومية
                    </h4>
                    <div className="space-y-4">
                      {selectedTrip.dailyPlans.map((day: any) => (
                        <div key={day.day} className="border-r-2 border-ocean/20 pr-4">
                          <h5 className="font-bold text-gray-700 mb-2">
                            اليوم {day.day}: {day.title}
                          </h5>
                          <div className="space-y-2">
                            {day.activities?.map((activity: any) => (
                              <div key={activity.id} className="flex items-start gap-3 text-sm">
                                <span className="font-bold text-ocean min-w-[50px]">{activity.time}</span>
                                <div>
                                  <p className="font-medium text-gray-800">{activity.name}</p>
                                  <p className="text-gray-500 text-xs">
                                    {activity.place} | {activity.duration}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTrip.budgetItems?.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-ocean" />
                      الميزانية
                    </h4>
                    <div className="space-y-2">
                      {selectedTrip.budgetItems.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.label}</span>
                          </div>
                          <span className="font-bold">{formatCurrency(item.value, item.currency)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-2 flex items-center justify-between font-bold text-lg">
                        <span>الإجمالي</span>
                        <span className="text-ocean">{getTripCost(selectedTrip)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setSelectedTrip(null);
                      router.push("/trip");
                    }}
                    className="flex-1 py-3 bg-ocean text-white rounded-xl font-bold hover:bg-ocean/90 transition-all"
                  >
                    تحرير الرحلة
                  </button>
                  <button
                    onClick={() => setSelectedTrip(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}