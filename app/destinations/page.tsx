import { Metadata } from "next";
import { MapPin, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "الوجهات | الرحّال",
  description: "استكشف أجمل الوجهات السياحية حول العالم",
};

const destinations = [
  {
    name: "نيويورك",
    country: "الولايات المتحدة",
    image: "https://kimi-web-img.moonshot.cn/img/www.agoda.com/319c7a31898b6c5c7a44ebdb392df8339ca4fc4c.jpg",
    rating: 4.8,
  },
  {
    name: "باريس",
    country: "فرنسا",
    image: "https://kimi-web-img.moonshot.cn/img/as2.ftcdn.net/5442cd84c7f1ae795bd3a1f77969f0a838848056.jpg",
    rating: 4.9,
  },
  {
    name: "دبي",
    country: "الإمارات",
    image: "https://kimi-web-img.moonshot.cn/img/img.andrewprokos.com/0e2d2f328dfd5b927667564b27574fdbdcfb4b2e.jpg",
    rating: 4.7,
  },
  {
    name: "طوكيو",
    country: "اليابان",
    image: "https://kimi-web-img.moonshot.cn/img/www.advantour.com/5a8d94a29beb18f2ed80f270bb1663f5c8d6d919.jpg",
    rating: 4.8,
  },
  {
    name: "لندن",
    country: "المملكة المتحدة",
    image: "https://kimi-web-img.moonshot.cn/img/guidelinestobritain.com/bdaed6dc8bd6a2c78d340c0973ae0dad3fd774d0.jpg",
    rating: 4.6,
  },
  {
    name: "اسطنبول",
    country: "تركيا",
    image: "https://kimi-web-img.moonshot.cn/img/thumbs.dreamstime.com/40c6f6db02efb51f539c8a6070c02e4ab4d58674.jpg",
    rating: 4.7,
  },
];

export default function DestinationsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">استكشف الوجهات</h1>
          <p className="text-gray-500">أفضل الوجهات السياحية المختارة لك</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.name}
              className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-card-lg transition-all group cursor-pointer"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                  <p className="text-white/80 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {dest.country}
                  </p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-gray-700">{dest.rating}</span>
                </div>
                <Link
                  href={`/trip?to=${encodeURIComponent(dest.name)}`}
                  className="text-ocean font-bold text-sm flex items-center gap-1 hover:underline"
                >
                  خطط رحلة
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}