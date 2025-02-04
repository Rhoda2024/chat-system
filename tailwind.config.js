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
        fe: "500px",
        we: "980px",
        le: "1100px",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
