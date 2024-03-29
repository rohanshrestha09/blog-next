/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  important: true,
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        satisfy: ['Satisfy', 'sans-serif'],
        shalimar: ['Shalimar', 'sans-serif'],
      },
      screens: {
        '2xl': '1600px',
      },
    },
  },
};
