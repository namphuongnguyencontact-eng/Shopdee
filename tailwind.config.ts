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
        brand: {
          50: "#f4f6f9",
          100: "#e5eaf1",
          200: "#cad6e4",
          300: "#a3b9d0",
          400: "#6082a9",
          500: "#2d4b73",
          600: "#192841",
          700: "#132034",
          800: "#0e1827",
          900: "#09101b",
          950: "#05090f",
          DEFAULT: "#192841",
        },
        blue: {
          50: "#f4f6f9",
          100: "#e5eaf1",
          200: "#cad6e4",
          300: "#a3b9d0",
          400: "#6082a9",
          500: "#2d4b73",
          600: "#192841",
          700: "#132034",
          800: "#0e1827",
          900: "#09101b",
          950: "#05090f",
        },
        indigo: {
          50: "#f4f6f9",
          100: "#e5eaf1",
          200: "#cad6e4",
          300: "#a3b9d0",
          400: "#6082a9",
          500: "#2d4b73",
          600: "#192841",
          700: "#132034",
          800: "#0e1827",
          900: "#09101b",
          950: "#05090f",
        },
        navy: {
          DEFAULT: "#192841",
          800: "#192841",
          900: "#132034",
          950: "#09101b",
        },
        flash: {
          DEFAULT: "#ff4d4f",
          accent: "#ff7a45",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(25, 40, 65, 0.05)",
        card: "0 2px 4px 0 rgba(25, 40, 65, 0.06)",
        hover: "0 6px 16px 0 rgba(25, 40, 65, 0.08)",
      }
    },
  },
  plugins: [],
};

export default config;
