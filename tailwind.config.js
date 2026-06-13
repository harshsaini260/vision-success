/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#04090F',
          900: '#07111F',
          800: '#0A1628',
          700: '#0F2040',
          600: '#152C55',
          500: '#1E3D6B',
        },
        gold: {
          300: '#F5D76E',
          400: '#E8C547',
          500: '#D4AF37',
          600: '#B8941F',
          700: '#9A7A0F',
        },
        olive: {
          400: '#6FAA7A',
          500: '#4A7C59',
          600: '#3A6149',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Rajdhani', 'sans-serif'],
        military: ['Orbitron', 'monospace'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%)',
        'navy-gradient': 'linear-gradient(135deg, #04090F 0%, #0A1628 50%, #152C55 100%)',
        'hero-pattern': "url('/images/hero-pattern.svg')",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 2s infinite',
        'pulse-gold': 'pulseGold 2.5s ease-in-out infinite',
        'ticker': 'ticker 25s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'fadeInUp': 'fadeInUp 0.8s ease forwards',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'march': 'march 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.5)' },
          '50%': { boxShadow: '0 0 30px 10px rgba(212,175,55,0)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 10px rgba(212,175,55,0.5)' },
          '50%': { textShadow: '0 0 25px rgba(212,175,55,1), 0 0 50px rgba(212,175,55,0.5)' },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        twinkle: {
          '0%, 100%': { opacity: 0.2, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.3)' },
        },
        march: {
          '0%': { transform: 'translateX(100vw)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      boxShadow: {
        'gold': '0 0 30px rgba(212,175,55,0.4)',
        'gold-lg': '0 0 60px rgba(212,175,55,0.3)',
        'navy': '0 20px 60px rgba(4,9,15,0.8)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
