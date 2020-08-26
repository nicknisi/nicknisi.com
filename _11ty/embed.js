const { readFileSync } = require('fs');
const cheerio = require('cheerio');

module.exports = (filePath, classes) => {
    const data = readFileSync(`.${filePath}`, (error, data) => {
        if (error) {
            throw new Error(error);
        }

        return data.toString('utf8');
    });

    const $ = cheerio.load(data, { xmlMode: true });

    if (classes) {
        $('svg').addClass(classes);
    }

    return $.html('svg');
};
