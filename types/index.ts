export interface TripData {
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departDate: string;
  returnDate: string;
  adults: number;
  children: number;
  travelClass: string;
  tripType: string;
  budget: number;
  currency: string;
}

export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  stops: number;
  stopCities?: string[];
  price: number;
  pricePerPerson: number;
  currency: string;
  luggage: string;
  badge?: string;
  badgeText?: string;
  isSelected?: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  stars: number;
  area: string;
  city: string;
  reviewScore: number;
  reviewCount: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  imageUrl?: string;
  distanceFromCenter: string;
  badge?: string;
  badgeText?: string;
  amenities?: string[];
  isSelected?: boolean;
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  weather: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  time: string;
  name: string;
  place: string;
  type: string;
  duration: string;
  cost: number;
  currency: string;
  icon: string;
  imageUrl?: string;
  description?: string;
}

export interface BudgetItem {
  id: string;
  label: string;
  value: number;
  currency: string;
  icon: string;
  color: string;
  percentage: number;
}

export interface TransportOption {
  icon: string;
  name: string;
  price: string;
  recommended: boolean;
}

export interface Place {
  name: string;
  rating: number;
  icon: string;
  imageUrl?: string;
  description?: string;
}

export interface SavedTrip {
  id: string;
  title: string;
  from: string;
  to: string;
  dates: string;
  passengers: number;
  totalCost: number;
  currency: string;
  createdAt: string;
}
