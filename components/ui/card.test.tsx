import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./card";

describe("Card (shadcn) — jevara tokens seam", () => {
  it("renders with jevara bg2/bd tokens", () => {
    render(<Card data-testid="c">hello</Card>);
    const el = screen.getByTestId("c");
    expect(el.className).toContain("bg-jevara-bg2");
    expect(el.className).toContain("border-jevara-bd");
    expect(el.textContent).toBe("hello");
  });
});
