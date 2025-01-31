/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        heroimg: "url('../src/assets/bg.jpg')",
        chatimg: "url('../src/assets/imgg.jpg')",
      },
      screens: {
        de: "400px",
        we: "980px",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
