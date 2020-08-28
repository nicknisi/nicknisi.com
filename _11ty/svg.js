const { readFileSync } = require('fs');
const cheerio = require('cheerio');

function getSvg(path) {
    return readFileSync(path, (error, data) => {
        if (error) {
            throw new Error(error);
        }

        return data.toString('utf8');
    });
}

function applyClasses(svg, classes, tag) {
    const $ = cheerio.load(svg, { xmlMode: true });
    $(tag).addClass(classes);
    return $.html(tag);
}

module.exports = (path, classes, tag = 'svg') => {
    const svg = getSvg(path);
    return classes ? applyClasses(svg, classes, tag) : classes;
};
