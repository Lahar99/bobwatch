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
        background: '#080B12',
        card: '#0D1421',
        border: '#1a2035',
        text: '#E2E8F0',
        accent: '#4F8EF7',
      },
      boxShadow: {
        'glow-blue': '0 0 8px #4F8EF7',
        'glow-red-pulse': '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.5)',
      },
    },
  },
  plugins: [],
}

// Made with Bob
