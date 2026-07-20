"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TripData, Flight, Hotel, DayPlan, BudgetItem } from "@/types";

interface SavedTrip {
  id: string;
  tripData: TripData;
  selectedFlight: Flight | null;
  selectedHotel: Hotel | null;
  dailyPlans: DayPlan[];
  budgetItems: BudgetItem[];
  totalCost: number;
  createdAt: string;
}

interface TripState {
  tripData: TripData;
  currentStep: number;
  selectedFlight: Flight | null;
  selectedHotel: Hotel | null;
  dailyPlans: DayPlan[];
  budgetItems: BudgetItem[];
  savedTrips: SavedTrip[];
  isLoading: boolean;
  error: string | null;

  setTripData: (data: Partial<TripData>) => void;
  setCurrentStep: (step: number) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  setSelectedHotel: (hotel: Hotel | null) => void;
  setDailyPlans: (plans: DayPlan[]) => void;
  setBudgetItems: (items: BudgetItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  saveTrip: () => boolean;
  deleteTrip: (id: string) => void;
  loadTrip: (id: string) => void;
  reset: () => void;
}

const defaultTripData: TripData = {
  from: "",
  fromCode: "",
  to: "",
  toCode: "",
  departDate: "",
  returnDate: "",
  adults: 1,
  children: 0,
  travelClass: "ECONOMY",
  tripType: "roundtrip",
  budget: 5000,
  currency: "AED",
};

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      tripData: defaultTripData,
      currentStep: 0,
      selectedFlight: null,
      selectedHotel: null,
      dailyPlans: [],
      budgetItems: [],
      savedTrips: [],
      isLoading: false,
      error: null,

      setTripData: (data) =>
        set((state) => ({ tripData: { ...state.tripData, ...data } })),
      setCurrentStep: (step) => set({ currentStep: step }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),
      setDailyPlans: (plans) => set({ dailyPlans: plans }),
      setBudgetItems: (items) => set({ budgetItems: items }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      saveTrip: () => {
        const state = get();
        // ✅ تحقق: ما نحفظ إلا لو فيه بيانات فعلية
        if (!state.tripData.to || !state.tripData.from) {
          return false;
        }
        const trip: SavedTrip = {
          id: Date.now().toString(),
          tripData: { ...state.tripData },
          selectedFlight: state.selectedFlight,
          selectedHotel: state.selectedHotel,
          dailyPlans: [...state.dailyPlans],
          budgetItems: [...state.budgetItems],
          totalCost: state.budgetItems.reduce((sum, item) => sum + item.value, 0),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ savedTrips: [trip, ...s.savedTrips] }));
        return true;
      },

      deleteTrip: (id) =>
        set((s) => ({ savedTrips: s.savedTrips.filter((t) => t.id !== id) })),

      loadTrip: (id) => {
        const trip = get().savedTrips.find((t) => t.id === id);
        if (!trip) return;
        set({
          tripData: trip.tripData,
          selectedFlight: trip.selectedFlight,
          selectedHotel: trip.selectedHotel,
          dailyPlans: trip.dailyPlans,
          budgetItems: trip.budgetItems,
          currentStep: 5,
        });
      },

      reset: () =>
        set({
          tripData: defaultTripData,
          currentStep: 0,
          selectedFlight: null,
          selectedHotel: null,
          dailyPlans: [],
          budgetItems: [],
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "al-rahhal-trip-v2", // ← غيّرنا الاسم عشان نمسح القديم
    }
  )
);