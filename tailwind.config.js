/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: '#E50914', // Netflix Red
                tmdbBlue: '#01B4E4',
                surface: '#FFFFFF',
                background: '#0d0d1a',
                textMain: '#141414',
                surfaceDark: '#1a1a2e',
                cardDark: '#16213e',
                gold: '#f5c518',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            animation: {
                shimmer: 'shimmer 1.5s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}