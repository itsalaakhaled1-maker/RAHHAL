import { NextRequest, NextResponse } from "next/server";
import { getCityName } from "@/lib/iata";

const SERPAPI_KEY = process.env.SERPAPI_KEY || "";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iataCode = searchParams.get("city") || "";
    const city = getCityName(iataCode);
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const adults = parseInt(searchParams.get("adults") || "1");
    const currency = searchParams.get("currency") || "USD";

    if (!city || !checkIn || !checkOut) {
      return NextResponse.json({ hotels: [], error: "Missing parameters" }, { status: 400 });
    }

    const nights = Math.max(1, Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )) || 1;

    // SerpAPI Google Hotels
    const url = `https://serpapi.com/search?engine=google_hotels&q=hotels+in+${encodeURIComponent(city)}&check_in_date=${checkIn}&check_out_date=${checkOut}&adults=${adults}&currency=${currency}&api_key=${SERPAPI_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    const properties = data.properties || [];
    
    const hotels = properties.slice(0, 12).map((h: any, index: number) => ({
      id: `hotel-${index}`,
      name: h.name || "فندق",
      stars: h.extracted_hotel_class || 4,
      area: h.area || city,
      city: iataCode,
      reviewScore: h.overall_rating || 0,
      reviewCount: h.reviews || 0,
      pricePerNight: h.rate_per_night?.extracted_lowest || 0,
      totalPrice: h.total_rate?.extracted_lowest || 0,
      currency,
      imageUrl: h.images?.[0]?.thumbnail || undefined,
      distanceFromCenter: h.nearby_places?.[0]?.distance || "—",
      badge: index === 0 ? "best" : index === 1 ? "luxury" : undefined,
      badgeText: index === 0 ? "الأفضل إجمالاً" : index === 1 ? "الأكثر فخامة" : undefined,
      amenities: h.amenities || [],
    }));

    return NextResponse.json({
      hotels,
      totalResults: properties.length,
      source: "serpapi",
      nights,
    });

  } catch (error) {
    console.error("Hotels API error:", error);
    return NextResponse.json({ hotels: [], error: "خطأ في تحميل الفنادق" }, { status: 500 });
  }
}