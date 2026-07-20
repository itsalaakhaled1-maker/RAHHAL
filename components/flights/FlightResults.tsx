"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Clock, Luggage, Check, ChevronLeft, Loader2 } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { formatCurrency, getDurationLabel } from "@/lib/utils";
import type { Flight } from "@/types";

export default function FlightResults() {
  const { tripData, setSelectedFlight, setCurrentStep } = useTripStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        from: tripData.from,
        to: tripData.to,
        date: tripData.departDate,
        adults: String(tripData.adults),
        class: tripData.travelClass,
        currency: tripData.currency,
      });

      if (tripData.returnDate) {
        params.set("return", tripData.returnDate);
      }

      const res = await fetch(`/api/flights?${params.toString()}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setFlights(data.flights || []);
      }
    } catch (err) {
      setError("حدث خطأ في تحميل الرحلات");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (flight: Flight) => {
    setSelectedId(flight.id);
    setSelectedFlight(flight);
    setTimeout(() => setCurrentStep(2), 300);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-ocean animate-spin mb-4" />
        <p className="text-gray-500 font-medium">جاري البحث عن أفضل الرحلات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plane className="w-10 h-10 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{error}</h3>
        <button
          onClick={fetchFlights}
          className="mt-4 px-6 py-3 bg-ocean text-white rounded-xl font-bold hover:bg-ocean/90 transition-all"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plane className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">لم يتم العثور على رحلات</h3>
        <p className="text-gray-500">جرب تغيير التواريخ أو الوجهة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            رحلات من {tripData.from} إلى {tripData.to}
          </h2>
          <p className="text-gray-500 mt-1">{flights.length} رحلة متاحة</p>
        </div>
        <button
          onClick={() => setCurrentStep(0)}
          className="flex items-center gap-2 text-ocean font-bold hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          تعديل البحث
        </button>
      </div>

      <AnimatePresence>
        {flights.map((flight, index) => (
          <motion.div
            key={flight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(flight)}
            className={`relative bg-white rounded-2xl p-5 cursor-pointer border-2 transition-all hover:shadow-card-lg ${
              selectedId === flight.id
                ? "border-ocean shadow-card-lg"
                : "border-transparent shadow-card hover:border-ocean/30"
            }`}
          >
            {/* Badge */}
            {flight.badge && (
              <div
                className={`absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-bold text-white ${
                  flight.badge === "best"
                    ? "bg-ocean"
                    : flight.badge === "cheapest"
                    ? "bg-success"
                    : "bg-warning"
                }`}
              >
                {flight.badgeText}
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Airline */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className="w-12 h-12 bg-ocean/10 rounded-xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-ocean" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{flight.airline}</p>
                  <p className="text-sm text-gray-400">{flight.flightNumber}</p>
                </div>
              </div>

              {/* Route */}
              <div className="flex-1 flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{flight.departureTime}</p>
                  <p className="text-sm text-gray-500">{flight.fromCode}</p>
                </div>

                <div className="flex-1 flex flex-col items-center px-4">
                  <p className="text-sm text-gray-400 mb-1">{flight.duration}</p>
                  <div className="w-full h-0.5 bg-gray-200 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full" />
                    {flight.stops > 0 && (
                      <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-warning rounded-full" />
                    )}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-ocean rounded-full" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {flight.stops === 0
                      ? "مباشرة"
                      : `${flight.stops} توقف${flight.stopCities ? ` (${flight.stopCities.join(", ")})` : ""}`}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{flight.arrivalTime}</p>
                  <p className="text-sm text-gray-500">{flight.toCode}</p>
                </div>
              </div>

              {/* Price & Select */}
              <div className="flex items-center gap-4 min-w-[200px] justify-end">
                <div className="text-left">
                  <p className="text-2xl font-black text-ocean">
                    {formatCurrency(flight.price, flight.currency)}
                  </p>
                  <p className="text-sm text-gray-400">للشخص الواحد</p>
                </div>

                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedId === flight.id
                      ? "bg-ocean border-ocean"
                      : "border-gray-200"
                  }`}
                >
                  {selectedId === flight.id && <Check className="w-5 h-5 text-white" />}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Luggage className="w-4 h-4" />
                <span>{flight.luggage}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{flight.duration}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
