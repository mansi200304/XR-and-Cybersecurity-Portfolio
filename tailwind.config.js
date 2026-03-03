/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,ax}",
    ],
    theme: {
      extend: {
        colors: {
          'f1-red': '#DC0000',
          'asphalt': '#0d0d0d',
        },
      },
    },
    plugins: [],
  }