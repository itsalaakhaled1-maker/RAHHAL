"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hotel, Star, MapPin, Check, ChevronLeft, Loader2, Users } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { formatCurrency, calculateNights } from "@/lib/utils";
import type { Hotel as HotelType } from "@/types";

export default function HotelResults() {
  const { tripData, setSelectedHotel, setCurrentStep } = useTripStore();
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStars, setFilterStars] = useState<number | null>(null);

  const nights = calculateNights(tripData.departDate, tripData.returnDate);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        city: tripData.to,
        checkIn: tripData.departDate,
        checkOut: tripData.returnDate || tripData.departDate,
        adults: String(tripData.adults),
        currency: tripData.currency,
      });

      const res = await fetch(`/api/hotels?${params.toString()}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setHotels(data.hotels || []);
      }
    } catch (err) {
      setError("حدث خطأ في تحميل الفنادق");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (hotel: HotelType) => {
    setSelectedId(hotel.id);
    setSelectedHotel(hotel);
    setTimeout(() => setCurrentStep(3), 300);
  };

  const filteredHotels = filterStars
    ? hotels.filter((h) => h.stars === filterStars)
    : hotels;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-ocean animate-spin mb-4" />
        <p className="text-gray-500 font-medium">جاري البحث عن أفضل الفنادق...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Hotel className="w-10 h-10 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{error}</h3>
        <button
          onClick={fetchHotels}
          className="mt-4 px-6 py-3 bg-ocean text-white rounded-xl font-bold hover:bg-ocean/90 transition-all"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            فنادق في {tripData.to}
          </h2>
          <p className="text-gray-500 mt-1">
            {nights} ليلة | {tripData.adults} {tripData.adults === 1 ? "بالغ" : "بالغين"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStars(null)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filterStars === null ? "bg-ocean text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            الكل
          </button>
          {[5, 4, 3].map((stars) => (
            <button
              key={stars}
              onClick={() => setFilterStars(stars)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1 ${
                filterStars === stars ? "bg-ocean text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {stars} <Star className="w-3 h-3" />
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center gap-2 text-ocean font-bold hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          العودة للرحلات
        </button>
      </div>

      <AnimatePresence>
        {filteredHotels.map((hotel, index) => (
          <motion.div
            key={hotel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => handleSelect(hotel)}
            className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer border-2 transition-all hover:shadow-card-lg ${
              selectedId === hotel.id
                ? "border-ocean shadow-card-lg"
                : "border-transparent shadow-card hover:border-ocean/30"
            }`}
          >
            {hotel.badge && (
              <div
                className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold text-white ${
                  hotel.badge === "best" ? "bg-ocean" : "bg-warning"
                }`}
              >
                {hotel.badgeText}
              </div>
            )}

            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="md:w-64 h-48 md:h-auto bg-gray-100 relative overflow-hidden">
                {hotel.imageUrl ? (
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Hotel";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-ocean/5">
                    <Hotel className="w-12 h-12 text-ocean/30" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{hotel.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < hotel.stars ? "text-warning fill-warning" : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {hotel.reviewScore} ({hotel.reviewCount} تقييم)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel.area}</span>
                      <span className="text-gray-300">|</span>
                      <span>{hotel.distanceFromCenter} من المركز</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="text-2xl font-black text-ocean">
                      {formatCurrency(hotel.totalPrice, hotel.currency)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatCurrency(hotel.pricePerNight, hotel.currency)} / ليلة
                    </p>
                  </div>
                </div>

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {hotel.amenities.slice(0, 4).map((amenity) => (
                      <span
                        key={amenity}
                        className="px-3 py-1 bg-gray-50 rounded-lg text-xs text-gray-600 font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}

                {/* Select indicator */}
                <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      selectedId === hotel.id
                        ? "bg-ocean text-white"
                        : "bg-ocean/10 text-ocean hover:bg-ocean hover:text-white"
                    }`}
                  >
                    {selectedId === hotel.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        تم الاختيار
                      </>
                    ) : (
                      "اختيار الفندق"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
