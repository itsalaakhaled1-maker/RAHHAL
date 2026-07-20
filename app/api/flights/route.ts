import { NextRequest, NextResponse } from "next/server";
import { searchSerpFlights } from "@/lib/serpapi";
import { getIataCode } from "@/lib/iata";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const date = searchParams.get("date") || "";
    const returnDate = searchParams.get("return") || "";
    const adults = parseInt(searchParams.get("adults") || "1");
    const travelClass = searchParams.get("class") || "ECONOMY";
    const currency = searchParams.get("currency") || "AED";

    const fromCode = getIataCode(from);
    const toCode = getIataCode(to);

    console.log(`[Flights API] ${from}(${fromCode}) → ${to}(${toCode}) | ${date} | ${adults} adults`);
    console.log(`[Flights API] SERPAPI_KEY exists: ${!!process.env.SERPAPI_KEY}`);

    // Use SerpAPI (real data)
    const data = await searchSerpFlights({
      departureId: fromCode,
      arrivalId: toCode,
      outboundDate: date,
      returnDate: returnDate || undefined,
      travelClass,
      adults,
      currency,
    });

    if (!data) {
      return NextResponse.json({ 
        flights: [], 
        error: "تعذر الاتصال بخدمة الرحلات. تأكد من مفتاح SerpAPI في .env.local",
        fromCode,
        toCode,
      });
    }

    // Parse SerpAPI response
    const bestFlights = data.best_flights || [];
    const otherFlights = data.other_flights || [];
    const allFlights = [...bestFlights, ...otherFlights];

    if (allFlights.length === 0) {
      return NextResponse.json({ 
        flights: [], 
        error: "لا توجد رحلات متاحة لهذه التواريخ. جرب تواريخ أخرى.",
        fromCode,
        toCode,
      });
    }

    const parsedFlights = allFlights.slice(0, 10).map((f: any, index: number) => {
      const firstFlight = f.flights?.[0] || {};
      const lastFlight = f.flights?.[f.flights.length - 1] || {};

      return {
        id: `flight-${index}`,
        airline: firstFlight.airline || "Unknown",
        airlineCode: firstFlight.airline?.substring(0, 2).toUpperCase() || "",
        flightNumber: firstFlight.flight_number || "",
        from: fromCode,
        fromCode,
        to: toCode,
        toCode,
        departureTime: firstFlight.departure_airport?.time || firstFlight.departure_time || "",
        arrivalTime: lastFlight.arrival_airport?.time || lastFlight.arrival_time || "",
        duration: f.total_duration || "",
        durationMinutes: f.total_duration_minutes || 0,
        stops: (f.flights?.length || 1) - 1,
        stopCities: f.flights?.slice(0, -1).map((fl: any) => fl.arrival_airport?.name) || [],
        price: f.price || 0,
        pricePerPerson: f.price || 0,
        currency: currency,
        luggage: "30 كجم",
        badge: index === 0 ? "best" : index === 1 ? "cheapest" : index === 2 ? "fastest" : undefined,
        badgeText: index === 0 ? "أفضل قيمة" : index === 1 ? "الأرخص" : index === 2 ? "الأسرع" : undefined,
      };
    });

    return NextResponse.json({
      flights: parsedFlights,
      fromCode,
      toCode,
      totalResults: allFlights.length,
      source: "serpapi",
    });

  } catch (error) {
    console.error("Flights API error:", error);
    return NextResponse.json(
      { flights: [], error: "خطأ في تحميل الرحلات" },
      { status: 500 }
    );
  }
}
