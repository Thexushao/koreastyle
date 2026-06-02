/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fdf2f2',
          100: '#fde8e8',
          500: '#c0392b',
          600: '#a93226',
          700: '#922b21',
        },
      },
    },
  },
  plugins: [],
};
