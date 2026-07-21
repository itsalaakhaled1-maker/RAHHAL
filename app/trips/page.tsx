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

  // ✅ قراءة البيانات من Supabase trip_data (JSONB) أو من الخصائص القديمة
  const getTripData = (trip: any) => {
    // Supabase يخزن في trip_data (snake_case)
    if (trip.trip_data) return trip.trip_data;
    // أو tripData (camelCase)
    if (trip.tripData) return trip.tripData;
    // أو مباشرة على الـ trip
    return trip;
  };

  const getTripTitle = (trip: any) => {
    const data = getTripData(trip);
    const from = data?.from || trip?.from || "غير معروف";
    const to = data?.to || trip?.to || "غير معروف";
    return `${from} → ${to}`;
  };

  const getTripDates = (trip: any) => {
    const data = getTripData(trip);
    const depart = data?.departDate || trip?.departDate;
    const ret = data?.returnDate || trip?.returnDate;
    if (!depart) return "تاريخ غير محدد";
    if (!ret) return formatDate(depart);
    return `${formatDate(depart)} - ${formatDate(ret)}`;
  };

  const getTripDays = (trip: any) => {
    // من Supabase: daily_plans (snake_case) أو dailyPlans (camelCase)
    const plans = trip.daily_plans || trip.dailyPlans;
    if (plans?.length) return `${plans.length} أيام`;
    if (trip.days) return `${trip.days} أيام`;
    return "";
  };

  const getTripCost = (trip: any) => {
    // من Supabase: total_cost (snake_case) أو totalCost (camelCase)
    const cost = trip.total_cost ?? trip.totalCost ?? 0;
    const data = getTripData(trip);
    const currency = data?.currency || trip.currency || "USD";
    return formatCurrency(cost, currency);
  };

  const handleView = (trip: any) => {
    // ✅ حمل الرحلة في الـ store ثم اعرضها
    loadTrip(trip.id);
    setSelectedTrip(trip);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الرحلة؟")) {
      await deleteTrip(id);
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

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-ocean border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">جاري تحميل الرحلات...</p>
            </div>
          ) : savedTrips.length === 0 ? (
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
                  className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:shadow-card-lg transition-all cursor-pointer"
                  onClick={() => handleView(trip)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(trip);
                        }}
                        className="w-10 h-10 rounded-xl bg-ocean/10 flex items-center justify-center text-ocean hover:bg-ocean hover:text-white transition-all"
                        title="عرض الرحلة"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(trip.id);
                        }}
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

        {/* ✅ Modal قابل للـ SCROLL */}
        {selectedTrip && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedTrip(null)}
          >
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - sticky */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-3xl z-10">
                <h2 className="text-xl font-bold text-gray-800">تفاصيل الرحلة</h2>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content - scrollable */}
              <div className="overflow-y-auto p-6 space-y-6">
                {/* Trip Header */}
                <div className="text-center pb-4 border-b border-gray-100">
                  <h3 className="text-2xl font-black text-gray-800">
                    {getTripTitle(selectedTrip)}
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {getTripDates(selectedTrip)}
                  </p>
                  <p className="text-ocean font-bold text-lg mt-2">
                    {getTripCost(selectedTrip)}
                  </p>
                </div>

                {/* Flight Details */}
                {(selectedTrip.selected_flight || selectedTrip.selectedFlight) && (
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Plane className="w-5 h-5 text-ocean" />
                      تفاصيل الطيران
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{(selectedTrip.selected_flight || selectedTrip.selectedFlight).airline}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedTrip.selected_flight || selectedTrip.selectedFlight).fromCode} → {(selectedTrip.selected_flight || selectedTrip.selectedFlight).toCode}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(selectedTrip.selected_flight || selectedTrip.selectedFlight).duration}
                        </p>
                      </div>
                      <p className="font-bold text-ocean">
                        {formatCurrency(
                          (selectedTrip.selected_flight || selectedTrip.selectedFlight).price,
                          (selectedTrip.selected_flight || selectedTrip.selectedFlight).currency
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Hotel Details */}
                {(selectedTrip.selected_hotel || selectedTrip.selectedHotel) && (
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Hotel className="w-5 h-5 text-ocean" />
                      تفاصيل الإقامة
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{(selectedTrip.selected_hotel || selectedTrip.selectedHotel).name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedTrip.selected_hotel || selectedTrip.selectedHotel).area || (selectedTrip.selected_hotel || selectedTrip.selectedHotel).stars + " نجوم"}
                        </p>
                      </div>
                      <p className="font-bold text-ocean">
                        {formatCurrency(
                          (selectedTrip.selected_hotel || selectedTrip.selectedHotel).totalPrice || (selectedTrip.selected_hotel || selectedTrip.selectedHotel).price,
                          (selectedTrip.selected_hotel || selectedTrip.selectedHotel).currency
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Daily Plans */}
                {(selectedTrip.daily_plans || selectedTrip.dailyPlans)?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-ocean" />
                      الخطة اليومية
                    </h4>
                    <div className="space-y-4">
                      {(selectedTrip.daily_plans || selectedTrip.dailyPlans).map((day: any) => (
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

                {/* Budget */}
                {(selectedTrip.budget_items || selectedTrip.budgetItems)?.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-ocean" />
                      تفاصيل الميزانية
                    </h4>
                    <div className="space-y-2">
                      {(selectedTrip.budget_items || selectedTrip.budgetItems).map((item: any) => (
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

                {/* Actions */}
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
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