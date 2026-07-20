"use client";

import { motion } from "framer-motion";
import { Plane, Hotel, DollarSign, CalendarDays, FileText } from "lucide-react";

const steps = [
  { id: 0, label: "البحث", icon: Plane },
  { id: 1, label: "الطيران", icon: Plane },
  { id: 2, label: "الفنادق", icon: Hotel },
  { id: 3, label: "الميزانية", icon: DollarSign },
  { id: 4, label: "الخطة", icon: CalendarDays },
  { id: 5, label: "المراجعة", icon: FileText },
];

interface Props {
  currentStep: number;
}

export default function ProgressSteps({ currentStep }: Props) {
  return (
    <div className="w-full py-6 bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isActive ? "#0288D1" : isCompleted ? "#66BB6A" : "#E5E7EB",
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive || isCompleted ? "text-white" : "text-gray-400"}`}
                    />
                  </motion.div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "text-ocean" : isCompleted ? "text-success" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 rounded-full bg-gray-200 overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: isCompleted ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-success rounded-full"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
