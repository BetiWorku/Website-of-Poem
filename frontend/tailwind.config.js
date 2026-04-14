/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        cream: 'var(--bg-color)',
        parchment: 'var(--parchment)',
        ink: 'var(--text-main)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent-color)',
        'accent-light': 'var(--accent-light)',
        card: 'var(--card-bg)',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s ease-out both',
      },
    },
  },
  plugins: [],
}
