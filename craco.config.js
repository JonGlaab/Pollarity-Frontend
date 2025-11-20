const path = require('path');

module.exports = {
    style: {
        postcss: {
            env: {
                stage: 3,
                features: {
                    'nesting-rules': true,
                },
            },
            plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
            ],
        },
    },
    webpack: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
};

