import "@testing-library/jest-dom";
import * as React from "react";
import { vi } from "vitest";
// @ts-ignore
(globalThis as unknown as { React: typeof React }).React = React;

// jsdom lacks matchMedia and serviceWorker
if (typeof window !== "undefined" && !window.matchMedia) {
  // @ts-ignore
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
if (typeof navigator !== "undefined" && !("serviceWorker" in navigator)) {
  // @ts-ignore
  Object.defineProperty(navigator, "serviceWorker", {
    value: { register: vi.fn(async () => ({})), ready: Promise.resolve({}) },
    writable: true,
  });
}

// Load Supabase env for tests if not present (Next.js loads .env.local at runtime, Vitest needs stub)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-anon-key";
}
