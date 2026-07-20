"use server";

const SERPAPI_KEY = process.env.SERPAPI_KEY || "";

// SerpAPI - Google Flights (user has this key)
export async function searchSerpFlights(params: {
  departureId: string;
  arrivalId: string;
  outboundDate: string;
  returnDate?: string;
  travelClass?: string;
  adults?: number;
  currency?: string;
}) {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("engine", "google_flights");
    searchParams.set("departure_id", params.departureId);
    searchParams.set("arrival_id", params.arrivalId);
    searchParams.set("outbound_date", params.outboundDate);
    if (params.returnDate) {
      searchParams.set("return_date", params.returnDate);
      searchParams.set("type", "1");
    } else {
      searchParams.set("type", "2");
    }
    searchParams.set("travel_class", params.travelClass === "ECONOMY" ? "1" : params.travelClass === "PREMIUM_ECONOMY" ? "2" : params.travelClass === "BUSINESS" ? "3" : "4");
    searchParams.set("adults", String(params.adults || 1));
    searchParams.set("currency", params.currency || "AED");
    searchParams.set("hl", "ar");
    searchParams.set("api_key", SERPAPI_KEY);

    const url = `https://serpapi.com/search?${searchParams.toString()}`;

    console.log(`[SerpAPI] Fetching: ${params.departureId} → ${params.arrivalId} on ${params.outboundDate}`);

    const response = await fetch(url, {
      method: "GET",
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[SerpAPI] HTTP error:", response.status, text);
      return null;
    }

    const data = await response.json();

    if (data.error) {
      console.error("[SerpAPI] API error:", data.error);
      return null;
    }

    console.log(`[SerpAPI] Success! Best flights: ${data.best_flights?.length || 0}, Other: ${data.other_flights?.length || 0}`);
    return data;
  } catch (error) {
    console.error("[SerpAPI] Fetch error:", error);
    return null;
  }
}

// RapidAPI - Booking.com (for hotels)
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";

export async function searchBookingDestination(query: string) {
  try {
    const url = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "booking-com15.p.rapidapi.com",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      console.error("[Booking] Destination error:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[Booking] Destination error:", error);
    return null;
  }
}

export async function searchBookingHotels(params: {
  destId: string;
  searchType: string;
  arrivalDate: string;
  departureDate: string;
  adults: number;
  currency?: string;
}) {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("dest_id", params.destId);
    searchParams.set("search_type", params.searchType);
    searchParams.set("arrival_date", params.arrivalDate);
    searchParams.set("departure_date", params.departureDate);
    searchParams.set("adults", String(params.adults));
    searchParams.set("room_qty", "1");
    searchParams.set("currency_code", params.currency || "AED");
    searchParams.set("languagecode", "ar-SA");

    const url = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "booking-com15.p.rapidapi.com",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error("[Booking] Hotels error:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[Booking] Hotels error:", error);
    return null;
  }
}
