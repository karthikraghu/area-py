/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        siemens: {
          green: '#009999',  // Primary Siemens green/petrol
          dark: '#006666',   // Darker shade for hover states
          light: '#ccffff',  // Light shade for backgrounds
          gray: '#333333',   // Siemens dark gray for text
          lightgray: '#f0f5f5' // Light background color
        }
      }
    },
  },
  plugins: [],
}