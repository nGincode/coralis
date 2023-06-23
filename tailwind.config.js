/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./react/src/**/*.{html,jsx,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animated")],
};
