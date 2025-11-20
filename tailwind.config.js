/** @type {import('tailwindcss').Config} */
module.exports = {

    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {

            colors: {
                'brand-darkest': '#0d1b2a',
                'brand-dark': '#1b263b',
                'brand-mid': '#415a77',
                'brand-light': '#778da9',
                'brand-bg': '#e0e1dd',
            },
        },
    },
    plugins: [],
}