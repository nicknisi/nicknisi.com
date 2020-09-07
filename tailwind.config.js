module.exports = {
    purge: ['_includes/**/*.njk', 'img/**/*.svg'],
    theme: {
        extend: {
            colors: {
                'cool-gray': {
                    100: '#E4E7EB',
                    200: '#CBD2D9',
                    300: '#9AA5B1',
                    400: '#7B8794',
                    500: '#616E7C',
                    600: '#52606D',
                    700: '#3E4C59',
                    800: '#323F4B',
                    900: '#1F2933',
                },
            },
        },
    },
};
