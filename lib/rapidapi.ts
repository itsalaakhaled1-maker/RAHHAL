"use server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";

// ============================================
// Google Flights API via RapidAPI
// ============================================
export async function searchGoogleFlights(params: {
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
    searchParams.set("departure_id", params.departureId);
    searchParams.set("arrival_id", params.arrivalId);
    searchParams.set("outbound_date", params.outboundDate);
    if (params.returnDate) searchParams.set("return_date", params.returnDate);
    searchParams.set("travel_class", params.travelClass || "ECONOMY");
    searchParams.set("adults", String(params.adults || 1));
    searchParams.set("currency", params.currency || "AED");
    searchParams.set("language_code", "ar-SA");
    searchParams.set("country_code", "SA");
    searchParams.set("show_hidden", "1");

    const url = `https://google-flights2.p.rapidapi.com/api/v1/searchFlights?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "google-flights2.p.rapidapi.com",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Flights API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Google Flights fetch error:", error);
    return null;
  }
}

// ============================================
// Booking.com API - Step 1: Search destination
// ============================================
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
      const errorText = await response.text();
      console.error("Booking destination error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log("[Booking] Destination response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Booking destination error:", error);
    return null;
  }
}

// ============================================
// Booking.com API - Step 2: Search hotels
// ============================================
export async function searchBookingHotels(params: {
  destId: string;
  searchType: string;
  arrivalDate: string;
  departureDate: string;
  adults: number;
  children?: number;
  currency?: string;
  locale?: string;
}) {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("dest_id", params.destId);
    searchParams.set("search_type", params.searchType);
    searchParams.set("arrival_date", params.arrivalDate);
    searchParams.set("departure_date", params.departureDate);
    searchParams.set("adults", String(params.adults));
    searchParams.set("children_age", "0"); // Default: no children
    searchParams.set("room_qty", "1");
    searchParams.set("page_number", "1");
    searchParams.set("units", "metric");
    searchParams.set("temperature_unit", "c");
    searchParams.set("languagecode", params.locale || "en-us");
    searchParams.set("currency_code", params.currency || "USD");

    const url = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?${searchParams.toString()}`;

    console.log("[Booking] Search URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "booking-com15.p.rapidapi.com",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Booking hotels error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log("[Booking] Hotels response keys:", Object.keys(data));
    return data;
  } catch (error) {
    console.error("Booking hotels error:", error);
    return null;
  }
}