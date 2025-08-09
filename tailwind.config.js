/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#4f566b",
        secondary: "#64D3A4",
        tertiary: "#3B4668",
        danger: "#F87171",
      }
    },
  },
  plugins: [],
}

