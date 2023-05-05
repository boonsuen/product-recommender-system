const { fontFamily } = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './node_modules/flowbite-react/**/*.js',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  // corePlugins: {
  //   preflight: false,
  // },
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: '#0085FF',
        },
      },
    },
    container: {},
  },
  plugins: [require('flowbite/plugin')],
};
