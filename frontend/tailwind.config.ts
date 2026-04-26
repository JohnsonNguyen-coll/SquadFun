import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07060F',
        surface: '#110D2A',
        primary: {
          DEFAULT: '#8B5CF6',
          bright: '#A78BFA',
          glow: '#7C3AED',
          highlight: '#C4B5FD',
        },
        monad: '#836EF9',
        emerald: {
          400: '#34D399',
        },
        red: {
          400: '#F87171',
        },
        gold: '#FBBF24',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'noise': "url('/noise.png')", // We'll add a subtle noise texture
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
