/** @type {import('tailwindcss').Config} */
module.exports = {

    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {

            colors: {
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    hover: 'var(--color-primary-hover)',
                    content: 'var(--color-primary-content)',
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    hover: 'var(--color-secondary-hover)',
                },
                background: {
                    DEFAULT: 'var(--color-background)',
                    paper: 'var(--color-surface)',
                },
                text: {
                    main: 'var(--color-text-main)',
                    muted: 'var(--color-text-muted)',
                },
                status: {
                    error: 'var(--color-error)',
                }
            },
        },
    },
    plugins: [],
}