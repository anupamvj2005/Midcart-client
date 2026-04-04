/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00a651', // Medical Green
          dark: '#007a3d',
          light: '#e6f7ee',
        },
        accent: {
          DEFAULT: '#ff6b35', // Accent Orange for actionable elements
          light: '#fff3ee',
        },
        danger: '#e53e3e',
        warning: '#f6ad55',
        info: '#4299e1',
        brandBlue: '#005f9e', // Trust Blue
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
