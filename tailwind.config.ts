import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
  colors: {
    primary: "#071124",
    secondary: "#FD6401",

    background: "#020617",
    surface: "#0A1120",
    surfaceLight: "#111827",

    foreground: "#FFFFFF",
    muted: "#94A3B8",

    border: "#1E293B",

    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  },

  borderRadius: {
    xl: "1rem",
    "2xl": "1.25rem",
    "3xl": "1.5rem",
  },

  boxShadow: {
    card: "0 10px 40px rgba(0,0,0,.30)",
    modal: "0 20px 60px rgba(0,0,0,.45)",
    button: "0 8px 30px rgba(0,0,0,.25)",
  },
},
  },
  plugins: [],
};

export default config;
