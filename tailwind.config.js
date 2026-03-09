/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: '#E50914', // Netflix Red
                tmdbBlue: '#01B4E4',
                surface: '#FFFFFF',
                background: '#F8F9FA',
                textMain: '#141414',
            },
        },
    },
    plugins: [],
}