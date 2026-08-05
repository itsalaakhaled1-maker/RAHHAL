"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Users, Calendar, ArrowRightLeft, ChevronDown, Search, MapPin, X } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { useRouter } from "next/navigation";
import { getIataCode, getAllSearchableItems, getCountryIata } from "@/lib/iata";
import AuthModal from "@/components/auth/AuthModal";
import PaywallModal from "@/components/payments/PaywallModal";
import { useAuth } from "@/hooks/useAuth";

const currencies = [
  { code: "AED", label: "درهم إماراتي", symbol: "AED" },
  { code: "USD", label: "دولار أمريكي", symbol: "$" },
  { code: "EUR", label: "يورو", symbol: "€" },
  { code: "SAR", label: "ريال سعودي", symbol: "SAR" },
  { code: "TRY", label: "ليرة تركية", symbol: "₺" },
];

const travelClasses = [
  { value: "ECONOMY", label: "السياحية" },
  { value: "PREMIUM_ECONOMY", label: "السياحية المميزة" },
  { value: "BUSINESS", label: "رجال الأعمال" },
  { value: "FIRST", label: "الأولى" },
];

function CustomDropdown({ label, value, options, onChange, icon: Icon, error }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o: any) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3.5 bg-[var(--bg-secondary)] border-2 rounded-2xl text-[var(--text-primary)] font-medium transition-all outline-none hover:border-[var(--border-medium)] ${
          error ? "border-[var(--color-danger)]" : "border-[var(--border-medium)]"
        }`}
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-[var(--color-primary-500)]" />}
          {selected?.label || selected?.name || value}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-card max-h-60 overflow-y-auto"
          >
            {options.map((option: any) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={`w-full text-right px-4 py-3 hover:bg-[var(--color-primary-500)]/10 transition-colors flex items-center gap-2 ${
                  value === option.value ? "bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] font-bold" : "text-[var(--text-secondary)]"
                }`}
              >
                {option.icon}
                {option.label || option.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-[var(--color-danger)] text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

function LocationAutocomplete({ label, value, onChange, icon: Icon, error, placeholder }: any) {
  const [input, setInput] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems = getAllSearchableItems();
  const normalizedInput = input.trim();
  const filtered = normalizedInput
    ? allItems.filter((item) => {
      if (item.name.includes(normalizedInput)) return true;
      if (item.aliases?.some(alias => alias.includes(normalizedInput))) return true;
      if (item.iata && item.iata.toLowerCase() === normalizedInput.toLowerCase()) return true;
      return false;
    })
  : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setInput(value);
  }, [value]);

  const handleSelect = (item: any) => {
    const displayName = item.type === "country" ? item.name : item.name;
    setInput(displayName);
    onChange(displayName);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered[highlighted]) {
      e.preventDefault();
      handleSelect(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-primary-500)] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            setHighlighted(0);
            onChange(e.target.value);
          }}
          onFocus={() => input.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          className={`w-full pr-10 pl-10 py-3.5 bg-[var(--bg-secondary)] border-2 rounded-2xl text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary-400)] focus:ring-4 focus:ring-[var(--color-primary-500)]/10 transition-all outline-none hover:border-[var(--border-medium)] ${
            error ? "border-[var(--color-danger)]" : "border-[var(--border-medium)]"
          }`}
        />
        {input && (
          <button
            type="button"
            onClick={() => { setInput(""); onChange(""); inputRef.current?.focus(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-card max-h-72 overflow-y-auto"
          >
            {filtered.slice(0, 10).map((item, index) => (
              <button
                key={`${item.name}-${index}`}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full text-right px-4 py-3 hover:bg-[var(--color-primary-500)]/10 transition-colors flex items-center gap-3 ${
                  index === highlighted ? "bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {item.type === "country" ? (
                  <MapPin className="w-4 h-4 text-[var(--color-primary-500)] shrink-0" />
                ) : (
                  <Plane className="w-4 h-4 text-[var(--color-primary-300)] shrink-0" />
                )}
                <div className="flex-1">
                  <span className="font-bold">{item.name}</span>
                  {item.type === "country" && (
                    <span className="text-xs text-[var(--text-muted)] mr-2">بلد</span>
                  )}
                  {item.type === "city" && item.iata && (
                    <span className="text-xs text-[var(--text-muted)] mr-2">{item.iata}</span>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-[var(--color-danger)] text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

function CustomDatePicker({ label, value, onChange, icon: Icon, error, min }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [viewYear, setViewYear] = useState(currentYear);

  const monthNames = [
    "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const dayNames = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const days = [];
  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDay = getFirstDayOfMonth(viewMonth, viewYear);

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleSelect = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    const formatted = date.toISOString().split("T")[0];
    onChange(formatted);
    setOpen(false);
  };

  const isDisabled = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    const minDate = min ? new Date(min) : today;
    return date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const date = new Date(viewYear, viewMonth, day);
    const selected = new Date(value);
    return date.toDateString() === selected.toDateString();
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3.5 bg-[var(--bg-secondary)] border-2 rounded-2xl text-[var(--text-primary)] font-medium transition-all outline-none hover:border-[var(--border-medium)] ${
          error ? "border-[var(--color-danger)]" : "border-[var(--border-medium)]"
        }`}
      >
        <span className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[var(--color-primary-500)]" />
          {value ? new Date(value).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : "اختر التاريخ"}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 w-full mt-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-card-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
                  else setViewMonth(viewMonth - 1);
                }}
                className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)]"
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
              <span className="font-bold text-lg text-[var(--text-heading)]">{monthNames[viewMonth]} {viewYear}</span>
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
                  else setViewMonth(viewMonth + 1);
                }}
                className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)]"
              >
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-[var(--text-muted)] py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => (
                day === null ? (
                  <div key={`empty-${i}`} />
                ) : (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabled(day)}
                    onClick={() => handleSelect(day)}
                    className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                      isSelected(day)
                        ? "bg-[var(--color-primary-500)] text-white shadow-lg shadow-[var(--color-primary-500)]/30"
                        : isDisabled(day)
                        ? "text-[var(--text-muted)] cursor-not-allowed"
                        : "hover:bg-[var(--color-primary-500)]/10 text-[var(--text-secondary)]"
                    }`}
                  >
                    {day}
                  </button>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-[var(--color-danger)] text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

export default function FlightSearch() {
  const router = useRouter();
  const { tripData, setTripData } = useTripStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { user, credits, loading: authLoading, deductCredits } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!tripData.from.trim()) newErrors.from = "أدخل مدينة المغادرة";
    if (!tripData.to.trim()) newErrors.to = "أدخل مدينة الوصول";
    if (!tripData.departDate) newErrors.departDate = "اختر تاريخ المغادرة";
    if (!tripData.returnDate) newErrors.returnDate = "اختر تاريخ العودة";
    if (tripData.budget <= 0) newErrors.budget = "أدخل الميزانية";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async () => {
    if (!validate()) return;

    if (!user) {
      setShowAuth(true);
      return;
    }

    // ✅ تحقق من الكريديتس (10 كريديتس لكل رحلة)
    if (credits < 10) {
      setShowPaywall(true);
      return;
    }

    // ✅ خصم 10 كريديتس وابدأ البحث
    const deducted = await deductCredits(10);
    if (deducted) {
      startSearch();
    } else {
      setShowPaywall(true);
    }
  };

  const startSearch = () => {
    setTripData({ tripType: "roundtrip" });

    let fromIata = getIataCode(tripData.from);
    let toIata = getIataCode(tripData.to);

    if (!fromIata || fromIata === tripData.from) {
      const countryIata = getCountryIata(tripData.from);
      if (countryIata) fromIata = countryIata;
    }
    if (!toIata || toIata === tripData.to) {
      const countryIata = getCountryIata(tripData.to);
      if (countryIata) toIata = countryIata;
    }

    console.log(`[FlightSearch] Converting: "${tripData.from}" → "${fromIata}", "${tripData.to}" → "${toIata}"`);

    const params = new URLSearchParams({
      from: fromIata,
      to: toIata,
      depart: tripData.departDate,
      return: tripData.returnDate || tripData.departDate,
      adults: String(tripData.adults),
      budget: String(tripData.budget),
      currency: tripData.currency,
    });

    router.push(`/trip?${params.toString()}`);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    // بعد التسجيل، تحقق من الكريديتس
    if (credits < 10) {
      setShowPaywall(true);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaywall(false);
    // الكريديتس ستُحدث تلقائياً عبر useAuth
  };

  const currencyOptions = currencies.map((c) => ({
    value: c.code,
    label: `${c.symbol} — ${c.label}`,
  }));

  const classOptions = travelClasses.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  const passengerOptions = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    value: n,
    label: `${n} ${n === 1 ? "بالغ" : "بالغين"}`,
  }));

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="search-card p-6 md:p-8"
      >
        {/* Row 1: From - Swap - To */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <LocationAutocomplete
              label="من"
              value={tripData.from}
              onChange={(val: string) => {
                setTripData({ from: val });
                setErrors((prev) => ({ ...prev, from: "" }));
              }}
              icon={Plane}
              error={errors.from}
              placeholder="اكتب اسم المدينة أو البلد..."
            />
          </div>

          <div className="hidden md:flex md:col-span-2 items-end justify-center pb-8">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const temp = tripData.from;
                setTripData({ from: tripData.to, to: temp });
              }}
              className="w-10 h-10 rounded-xl bg-[var(--color-primary-500)]/10 flex items-center justify-center text-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)] hover:text-white transition-all shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="md:col-span-5">
            <LocationAutocomplete
              label="إلى"
              value={tripData.to}
              onChange={(val: string) => {
                setTripData({ to: val });
                setErrors((prev) => ({ ...prev, to: "" }));
              }}
              icon={Plane}
              error={errors.to}
              placeholder="اكتب اسم المدينة أو البلد..."
            />
          </div>
        </div>

        {/* Row 2: Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <CustomDatePicker
            label="المغادرة"
            value={tripData.departDate}
            onChange={(val: string) => {
              setTripData({ departDate: val });
              setErrors((prev) => ({ ...prev, departDate: "" }));
            }}
            icon={Calendar}
            error={errors.departDate}
          />
          <CustomDatePicker
            label="العودة"
            value={tripData.returnDate}
            onChange={(val: string) => {
              setTripData({ returnDate: val });
              setErrors((prev) => ({ ...prev, returnDate: "" }));
            }}
            icon={Calendar}
            error={errors.returnDate}
            min={tripData.departDate}
          />
        </div>

        {/* Row 3: Passengers - Class - Currency - Budget */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <CustomDropdown
            label="المسافرين"
            value={tripData.adults}
            options={passengerOptions}
            onChange={(val: number) => setTripData({ adults: val })}
            icon={Users}
          />
          <CustomDropdown
            label="درجة السفر"
            value={tripData.travelClass}
            options={classOptions}
            onChange={(val: string) => setTripData({ travelClass: val })}
          />
          <CustomDropdown
            label="العملة"
            value={tripData.currency}
            options={currencyOptions}
            onChange={(val: string) => setTripData({ currency: val })}
          />
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">الميزانية المتوقعة للسفرة كاملة</label>
            <div className="relative">
              <input
                type="number"
                placeholder="5000"
                value={tripData.budget || ""}
                onChange={(e) => {
                  setTripData({ budget: parseInt(e.target.value) || 0 });
                  setErrors((prev) => ({ ...prev, budget: "" }));
                }}
                className={`w-full pr-4 pl-16 py-3.5 bg-[var(--bg-secondary)] border-2 rounded-2xl text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary-400)] focus:ring-4 focus:ring-[var(--color-primary-500)]/10 transition-all outline-none hover:border-[var(--border-medium)] ${
                  errors.budget ? "border-[var(--color-danger)]" : "border-[var(--border-medium)]"
                }`}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-bold">
                {tripData.currency}
              </span>
            </div>
            {errors.budget && <p className="text-[var(--color-danger)] text-xs mt-1.5 font-medium">{errors.budget}</p>}
          </div>
        </div>

        {/* Search Button */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          className="w-full mt-8 py-4 bg-[var(--color-primary-500)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[var(--color-primary-500)]/30 hover:shadow-xl hover:shadow-[var(--color-primary-500)]/40 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Search className="w-5 h-5 relative z-10" />
          <span className="relative z-10">ابحث عن الرحلة</span>
        </motion.button>
      </motion.div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />
      
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPaymentSuccess={handlePaymentSuccess}
        tripData={{
          from: tripData.from,
          to: tripData.to,
          departureDate: tripData.departDate,
          returnDate: tripData.returnDate,
        }}
      />
    </div>
  );
}