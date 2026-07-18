/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        /* Injecting our high-tech fonts into Tailwind */
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        /* Optional explicit neon colors if you want to use them in standard Tailwind classes */
        neon: {
          cyan: '#00f3ff',
          purple: '#bc13fe',
        }
      }
    },
  },
  plugins: [],
}