import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jevara: {
          bg: "#080B12",
          bg2: "#111622",
          bg3: "#171D2A",
          tx: "#F5F7FA",
          mu: "#969BAD",
          bd: "#2A3140",
          blue: "#5DA8FF",
          cyan: "#5DA8FF",
          gn: "#34D399",
          or: "#FF8A3D",
          pu: "#9B87F5",
          amber: "#FBBF24",
          danger: "#FB7185",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#5DA8FF",
          foreground: "#07111d",
        },
        secondary: {
          DEFAULT: "#171D2A",
          foreground: "#F5F7FA",
        },
        muted: {
          DEFAULT: "#2A3140",
          foreground: "#969BAD",
        },
        card: {
          DEFAULT: "#111622",
          foreground: "#F5F7FA",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
