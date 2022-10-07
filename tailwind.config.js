/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        megrim: ['Megrim', 'sans-serif'],
      },
      screens: {
        '2xl': '1600px',
      },
    },
  },
};
