/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Poppins", "ui-sans-serif", "system-ui"],
        display: ["Poppins", "Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        obsidian: "#09090B",
        gold: "#D4AF37",
        emerald: "#34D399",
        ink: "#121216",
        pearl: "#F8FAFC",
      },
      boxShadow: {
        glow: "0 0 34px rgba(212, 175, 55, 0.24)",
        emerald: "0 0 40px rgba(52, 211, 153, 0.18)",
      },
      backgroundImage: {
        "gold-line": "linear-gradient(135deg, rgba(212,175,55,.8), rgba(52,211,153,.45))",
      },
    },
  },
  plugins: [],
};
