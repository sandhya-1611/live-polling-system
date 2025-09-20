/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7765DA',
        secondary: '#5767D0',
        accent: '#4F0DCE',
        gray: {
          light: '#F2F2F2',
          dark: '#373737',
          medium: '#6E6E6E',
        },
      },
    },
  },
  plugins: [],
}