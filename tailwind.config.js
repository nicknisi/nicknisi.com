module.exports = {
    purge: ['_includes/**/*.njk', 'img/**/*.svg'],
    theme: {
        screens: {
            sm: '576px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
        },
        extend: {
            spacing: {
                '1/2': '0.125rem',
                7: '1.75rem',
                9: '2.25rem',
            },
            flex: {
                single: '0 0 100%',
                double: '0 0 50%',
                triple: '0 0 33.333333%',
            },
            fontSize: {
                tiny: '0.925rem',
            },
        },
    },
};
