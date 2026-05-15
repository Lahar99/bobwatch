/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        card: '#13131A',
        border: '#1E1E2E',
        text: '#E2E8F0',
        accent: '#3B82F6',
      },
    },
  },
  plugins: [],
}

// Made with Bob
