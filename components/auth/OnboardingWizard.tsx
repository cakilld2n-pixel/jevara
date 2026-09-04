"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { completeOnboarding } from "@/lib/profile";
import { useToast } from "@/components/ui/toast";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onComplete: (recommended: string) => void;
};

const STEPS = [
  {
    key: "goal",
    title: "Tujuan utama?",
    options: [
      ["recomp", "Rekomposisi"],
      ["fatloss", "Fat Loss"],
      ["muscle", "Muscle Gain"],
      ["strength", "Strength"],
      ["fitness", "General Fitness"],
    ] as const,
  },
  {
    key: "experience",
    title: "Pengalaman latihan?",
    options: [
      ["beginner", "Pemula <1 th"],
      ["intermediate", "Menengah 1-3 th"],
      ["advanced", "Lanjutan 3+ th"],
    ] as const,
  },
  {
    key: "days",
    title: "Hari latihan per minggu?",
    options: [
      ["3", "3 hari"],
      ["4", "4 hari"],
      ["5", "5 hari"],
      ["6", "6 hari"],
    ] as const,
  },
  {
    key: "equipment",
    title: "Peralatan utama?",
    options: [
      ["fullgym", "Full Gym"],
      ["homegym", "Home Gym"],
      ["dumbbell", "Dumbbell Only"],
    ] as const,
  },
];

export function OnboardingWizard({ open, onOpenChange, userId, onComplete }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({
    goal: "recomp",
    experience: "beginner",
    days: "4",
    equipment: "fullgym",
  });
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (!isLast) setStep((s) => s + 1);
    else handleFinish();
  };

  const handleFinish = async () => {
    setLoading(true);
    const input = {
      goal: data.goal,
      experience: data.experience,
      days: Number(data.days),
      equipment: data.equipment,
      focus: "balanced",
    };
    const { recommended, error } = await completeOnboarding(userId, input);
    setLoading(false);
    if (error) toast(`Gagal simpan: ${error}`);
    else {
      toast(`Rekomendasi: ${recommended}`);
      onComplete(recommended);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setup JEVARA • {current.title}</DialogTitle>
        </DialogHeader>
        <Card>
          <div className="mb-3 flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-jevara-blue" : "bg-jevara-bd"}`} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {current.options.map(([val, label]) => (
              <button
                key={val}
                onClick={() => setData((d) => ({ ...d, [current.key]: val }))}
                className={`rounded-xl border px-3 py-3 text-xs font-bold ${
                  data[current.key] === val ? "border-jevara-blue bg-[rgba(93,168,255,.15)] text-jevara-blue" : "border-jevara-bd bg-jevara-bg3 text-jevara-tx"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={next}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-jevara-blue py-2.5 text-xs font-black text-[#07111d] disabled:opacity-50"
          >
            {isLast ? (loading ? "Menyimpan..." : "Selesai — Lihat Rekomendasi") : "Lanjut"}
          </button>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
