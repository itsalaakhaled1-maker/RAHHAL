import { createClient } from "@/lib/supabase";
import type { TripData, Flight, Hotel, DayPlan, BudgetItem } from "@/types";

export interface TripRecord {
  id: string;
  user_id: string;
  trip_data: TripData;
  selected_flight: Flight | null;
  selected_hotel: Hotel | null;
  daily_plans: DayPlan[];
  budget_items: BudgetItem[];
  total_cost: number;
  currency: string;
  created_at: string;
}

// ✅ جيب رحلات المستخدم الحالي
export async function getUserTrips() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching trips:", error);
    return [];
  }

  return data as TripRecord[];
}

// ✅ احفظ رحلة جديدة
export async function saveTripToDB(trip: {
  tripData: TripData;
  selectedFlight: Flight | null;
  selectedHotel: Hotel | null;
  dailyPlans: DayPlan[];
  budgetItems: BudgetItem[];
  totalCost: number;
  currency: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      trip_data: trip.tripData,
      selected_flight: trip.selectedFlight,
      selected_hotel: trip.selectedHotel,
      daily_plans: trip.dailyPlans,
      budget_items: trip.budgetItems,
      total_cost: trip.totalCost,
      currency: trip.currency,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TripRecord;
}

// ✅ احذف رحلة
export async function deleteTripFromDB(tripId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", user.id);

  if (error) throw error;
  return true;
}