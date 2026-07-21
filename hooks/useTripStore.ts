"use client";

import { create } from "zustand";
import { getUserTrips, saveTripToDB, deleteTripFromDB, type TripRecord } from "@/lib/trips-db";
import type { TripData, Flight, Hotel, DayPlan, BudgetItem } from "@/types";

interface SavedTrip extends TripRecord {}

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
  
  loadUserTrips: () => Promise<void>;
  saveTrip: () => Promise<boolean>;
  deleteTrip: (id: string) => Promise<void>;
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

export const useTripStore = create<TripState>()((set, get) => ({
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

  loadUserTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const trips = await getUserTrips();
      set({ savedTrips: trips, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  saveTrip: async () => {
    const state = get();
    if (!state.tripData.to || !state.tripData.from) {
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const newTrip = await saveTripToDB({
        tripData: state.tripData,
        selectedFlight: state.selectedFlight,
        selectedHotel: state.selectedHotel,
        dailyPlans: state.dailyPlans,
        budgetItems: state.budgetItems,
        totalCost: state.budgetItems.reduce((sum, item) => sum + item.value, 0),
        currency: state.tripData.currency,
      });

      set((s) => ({ 
        savedTrips: [newTrip, ...s.savedTrips],
        isLoading: false 
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  deleteTrip: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTripFromDB(id);
      set((s) => ({ 
        savedTrips: s.savedTrips.filter((t) => t.id !== id),
        isLoading: false 
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  loadTrip: (id) => {
    const trip = get().savedTrips.find((t) => t.id === id);
    if (!trip) return;
    set({
      tripData: trip.trip_data,
      selectedFlight: trip.selected_flight,
      selectedHotel: trip.selected_hotel,
      dailyPlans: trip.daily_plans,
      budgetItems: trip.budget_items,
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
}));