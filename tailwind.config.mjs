/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",  // Include Next.js pages
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Include components
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // Include src folder (if used)
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        'space-black': '#0A0F25',
        'nebula-purple': '#8A63D2',
        'comet-blue': '#4FD1C5',
        'stardust-white': '#EBF4FF',
        'pulsar-pink': '#FF6B6B',
      },
      backgroundImage: {
        'galaxy': 'radial-gradient(circle at 50% 50%, #2C3E50 0%, #000000 100%)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
