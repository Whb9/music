/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          primary: '#008c8c',
          dark: '#006e6e',
          light: '#00a8a8',
          pale: '#e6f5f5',
          hover: '#007878',
        },
      },
      fontFamily: {
        song: ['SimSun', 'STSong', 'serif'],
        hei: ['SimHei', 'STHeiti', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
