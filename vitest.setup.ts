import "@testing-library/jest-dom";
import * as React from "react";
// @ts-ignore
(globalThis as unknown as { React: typeof React }).React = React;

// Load Supabase env for tests if not present (Next.js loads .env.local at runtime, Vitest needs stub)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-anon-key";
}
