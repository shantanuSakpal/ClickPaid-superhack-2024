const {nextui} = require('@nextui-org/theme');
/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(tabs|user|avatar).js"
  ],
    theme: {
        extend: {
            keyframes: {
              scroll: {
                '0%': { transform: 'translateX(0)' },
                '100%': { transform: 'translateX(calc(-250% - 20px))' },
              },
            },
            animation: {
              scroll: 'scroll 60s linear infinite',
            },
            colors: {
                "theme-gray-dark": "#111827",
                "theme-gray-light": "#232a3e",
                "theme-purple-dark": "#5530b8",
                "theme-purple": "#7a49ff",
                "theme-purple-light": "#a87dff",
                "theme-blue-dark": "#12355D",
                "theme-blue": "#3948EE",
                "theme-blue-light": "#017BFE",
                "theme-pink-dark": "#e2558c",
                "theme-pink": "#ff69b4",
                "theme-pink-light": "#ffa5c0",
                "theme-orange": "#FB773C"
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
  plugins: [nextui()],
};