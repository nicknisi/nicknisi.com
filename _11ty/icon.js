const { readFileSync } = require('fs');
const cheerio = require('cheerio');

const HEROICONS_PATH = './node_modules/heroicons/outline';

module.exports = (icon, classes) => {
    const data = readFileSync(`${HEROICONS_PATH}/${icon}.svg`, (error, data) => {
        if (error) {
            throw new Error(error);
        }

        return data.toString('utf8');
    });

    const $ = cheerio.load(data, { xmlMode: true });

    if (classes) {
        $('svg').addClass(classes);
    }

    return `<span class="icon">${$.html('svg')}</icon>`;
};
