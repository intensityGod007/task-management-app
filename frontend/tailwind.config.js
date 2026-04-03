/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        display: ['var(--font-fraunces)', 'serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0F0F0F',
          secondary: '#171717',
          card: '#1C1C1C',
          elevated: '#242424',
          border: '#2A2A2A',
        },
        accent: {
          amber: '#F59E0B',
          'amber-dim': '#B45309',
          green: '#10B981',
          red: '#EF4444',
          blue: '#3B82F6',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#A3A3A3',
          muted: '#525252',
          accent: '#F59E0B',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
