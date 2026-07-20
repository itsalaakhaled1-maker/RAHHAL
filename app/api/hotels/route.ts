import { NextRequest, NextResponse } from "next/server";
import { searchBookingDestination, searchBookingHotels } from "@/lib/rapidapi";
import { getCityName } from "@/lib/iata";

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
      return NextResponse.json(
        { hotels: [], error: "Missing required parameters: city, checkIn, checkOut" },
        { status: 400 }
      );
    }

    const nights = Math.max(1, Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )) || 1;

    console.log(`[Hotels API] IATA: ${iataCode} → City: ${city} | ${checkIn} → ${checkOut} | ${adults} adults | ${nights} nights`);

    // Step 1: Get destination ID
    const destData = await searchBookingDestination(city);

    if (!destData) {
      return NextResponse.json({ 
        hotels: [], 
        error: "فشل الاتصال بـ Booking API. تأكد من المفتاح.",
      });
    }

    let destinations: any[] = [];
    
    if (Array.isArray(destData)) {
      destinations = destData;
    } else if (destData.data && Array.isArray(destData.data)) {
      destinations = destData.data;
    } else if (destData.result && Array.isArray(destData.result)) {
      destinations = destData.result;
    }

    if (destinations.length === 0) {
      return NextResponse.json({ 
        hotels: [], 
        error: "لم يتم العثور على الوجهة. جرب اسم مدينة آخر.",
      });
    }

    const dest = destinations[0];
    console.log(`[Hotels API] Destination found: ${dest.dest_id} (${dest.search_type})`);

    const destId = dest.dest_id;
    const searchType = dest.search_type;

    // Step 2: Search hotels
    const hotelsData = await searchBookingHotels({
      destId: String(destId),
      searchType: String(searchType),
      arrivalDate: checkIn,
      departureDate: checkOut,
      adults,
      currency,
      locale: "en-us",
    });

    if (!hotelsData) {
      return NextResponse.json({ 
        hotels: [], 
        error: "فشل البحث عن الفنادق. جرب مرة أخرى.",
      });
    }

    // Extract hotels from response
    let rawHotels: any[] = [];
    
    if (hotelsData.data && Array.isArray(hotelsData.data)) {
      rawHotels = hotelsData.data;
    } else if (hotelsData.data?.result && Array.isArray(hotelsData.data.result)) {
      rawHotels = hotelsData.data.result;
    } else if (hotelsData.data?.hotels && Array.isArray(hotelsData.data.hotels)) {
      rawHotels = hotelsData.data.hotels;
    } else if (hotelsData.data?.properties && Array.isArray(hotelsData.data.properties)) {
      rawHotels = hotelsData.data.properties;
    } else if (hotelsData.result && Array.isArray(hotelsData.result)) {
      rawHotels = hotelsData.result;
    } else if (hotelsData.hotels && Array.isArray(hotelsData.hotels)) {
      rawHotels = hotelsData.hotels;
    }

    console.log(`[Hotels API] Raw hotels count: ${rawHotels.length}`);

    if (rawHotels.length === 0) {
      return NextResponse.json({ 
        hotels: [], 
        error: "لا توجد فنادق متاحة لهذه التواريخ. جرب تواريخ أو مدينة أخرى.",
      });
    }

    // Map hotels with correct paths
    const hotels = rawHotels.slice(0, 12).map((h: any, index: number) => {
      const prop = h.property || {};

      // Price: property.priceBreakdown.grossPrice.value
      let totalPrice = 0;
      let pricePerNight = 0;

      if (prop.priceBreakdown?.grossPrice?.value) {
        totalPrice = prop.priceBreakdown.grossPrice.value;
      } else if (prop.priceBreakdown?.strikethroughPrice?.value) {
        totalPrice = prop.priceBreakdown.strikethroughPrice.value;
      }

      pricePerNight = totalPrice > 0 ? Math.round(totalPrice / nights) : 0;

      // Review: property.reviewScore / property.reviewCount
      const reviewScore = prop.reviewScore !== undefined ? prop.reviewScore : 0;
      const reviewCount = prop.reviewCount !== undefined ? prop.reviewCount : 0;

      // Stars: use qualityClass when propertyClass is 0
      let stars = 4;
      if (prop.qualityClass && prop.qualityClass > 0) {
        stars = prop.qualityClass;
      } else if (prop.propertyClass && prop.propertyClass > 0) {
        stars = prop.propertyClass;
      } else if (prop.accuratePropertyClass && prop.accuratePropertyClass > 0) {
        stars = prop.accuratePropertyClass;
      }

      // Name
      const name = prop.name || "فندق";

      // Image
      const imageUrl = prop.photoUrls?.[0] || undefined;

      // Distance: extract from accessibilityLabel
      let distanceFromCenter = "—";
      if (h.accessibilityLabel) {
        const distanceMatch = h.accessibilityLabel.match(/(\d+\.?\d*)\s*km/i);
        if (distanceMatch) {
          distanceFromCenter = `${distanceMatch[1]} كم`;
        }
      }

      // Area
      const area = prop.wishlistName || city;

      return {
        id: `hotel-${index}`,
        name,
        stars: Number(stars) || 4,
        area,
        city: iataCode,
        reviewScore: Number(reviewScore) || 0,
        reviewCount: Number(reviewCount) || 0,
        pricePerNight,
        totalPrice: Math.round(totalPrice),
        currency,
        imageUrl,
        distanceFromCenter,
        badge: index === 0 ? "best" : index === 1 ? "luxury" : undefined,
        badgeText: index === 0 ? "الأفضل إجمالاً" : index === 1 ? "الأكثر فخامة" : undefined,
        amenities: [],
      };
    });

    return NextResponse.json({
      hotels,
      destination: dest,
      totalResults: rawHotels.length,
      source: "booking-api",
      nights,
    });

  } catch (error) {
    console.error("Hotels API error:", error);
    return NextResponse.json(
      { hotels: [], error: "خطأ في تحميل الفنادق. حاول مرة أخرى." },
      { status: 500 }
    );
  }
}