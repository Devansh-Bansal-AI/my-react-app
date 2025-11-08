/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Crucial: Scans your .tsx files for utility classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}