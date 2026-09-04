"use client";

import React from "react";
import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
};

export function Switch({ checked, onCheckedChange, className }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full border transition-colors",
        checked
          ? "bg-[rgba(16,185,129,.25)] border-[rgba(16,185,129,.5)]"
          : "bg-jevara-bg3 border-jevara-bd",
        className
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full transition-all",
          checked ? "translate-x-5 bg-[#34D399]" : "translate-x-0 bg-[#777]"
        )}
      />
    </button>
  );
}
