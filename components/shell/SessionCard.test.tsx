import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionCard } from "./SessionCard";
import { getFoundationContext } from "@/lib/session/context";

describe("SessionCard — Sesi Terencana read-only", () => {
  it("renders Foundation session with exercises and expectedSets", () => {
    const ctx = getFoundationContext(1, 1, "Senin")!;
    render(<SessionCard ctx={ctx} />);
    expect(screen.getByText(/Senin • Push/)).toBeInTheDocument();
    expect(screen.getByText("Barbell Bench Press")).toBeInTheDocument();
    expect(screen.getByText(/Read-only — logging/)).toBeInTheDocument();
    // expectedSets 19 appears as "6 exercises • 19 sets"
    expect(screen.getByText(/19 sets/)).toBeInTheDocument();
  });

  it("renders null context fallback", () => {
    render(<SessionCard ctx={null} />);
    expect(screen.getByText(/tidak tersedia/)).toBeInTheDocument();
  });
});
