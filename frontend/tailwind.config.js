/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a",      // slate-900ish
        surface: "#111827",         // subtle card bg
        border: "#1f2937",
        muted: "#94a3b8",
        primary: "#6366f1",         // soft indigo
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
}
