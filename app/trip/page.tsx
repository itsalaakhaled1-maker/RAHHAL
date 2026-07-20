"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTripStore } from "@/hooks/useTripStore";
import Header from "@/components/shared/Header";
import ProgressSteps from "@/components/shared/ProgressSteps";
import FlightResults from "@/components/flights/FlightResults";
import HotelResults from "@/components/hotels/HotelResults";
import BudgetPlanner from "@/components/budget/BudgetPlanner";
import DailyPlan from "@/components/plan/DailyPlan";
import TripReview from "@/components/review/TripReview";
import FlightSearch from "@/components/flights/FlightSearch";

export default function TripPage() {
  const searchParams = useSearchParams();
  const { currentStep, setTripData, setCurrentStep } = useTripStore();

  // Read URL params on mount
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const depart = searchParams.get("depart");
    const ret = searchParams.get("return");
    const adults = searchParams.get("adults");
    const budget = searchParams.get("budget");
    const currency = searchParams.get("currency");

    if (from || to || depart) {
      setTripData({
        from: from || "",
        to: to || "",
        departDate: depart || "",
        returnDate: ret || "",
        adults: adults ? parseInt(adults) : 1,
        budget: budget ? parseInt(budget) : 5000,
        currency: currency || "AED",
      });

      // If we have search params, go to flight results
      if (from && to && depart) {
        setCurrentStep(1);
      }
    }
  }, [searchParams, setTripData, setCurrentStep]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20">
        <ProgressSteps currentStep={currentStep} />

        <main className="max-w-6xl mx-auto px-4 py-8">
          {currentStep === 0 && (
            <div className="max-w-5xl mx-auto pt-8">
              <FlightSearch />
            </div>
          )}
          {currentStep === 1 && <FlightResults />}
          {currentStep === 2 && <HotelResults />}
          {currentStep === 3 && <BudgetPlanner />}
          {currentStep === 4 && <DailyPlan />}
          {currentStep === 5 && <TripReview />}
        </main>
      </div>
    </div>
  );
}
