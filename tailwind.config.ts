import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-modern": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-blue": "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
      },
      boxShadow: {
        "modern": "0 10px 40px rgba(0, 0, 0, 0.1)",
        "modern-lg": "0 20px 60px rgba(0, 0, 0, 0.15)",
        "modern-md": "0 8px 24px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
