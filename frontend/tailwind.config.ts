import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        study: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        play: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        rest: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'translate(-50%, 0) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0) scale(1)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        study: 'study 1.5s ease-in-out infinite',
        play: 'play 0.8s ease-in-out infinite',
        rest: 'rest 3s ease-in-out infinite',
        fadeIn: 'fadeIn 0.3s ease-out',
        scaleUp: 'scaleUp 0.5s ease-out',
        slideDown: 'slideDown 0.5s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
