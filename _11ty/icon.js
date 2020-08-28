// Load and return heroicons svg, embedding classes into it
const loadSvg = require('./svg');
const HEROICONS_PATH = './node_modules/heroicons/outline';

module.exports = (icon, classes) => {
    return loadSvg(`${HEROICONS_PATH}/${icon}.svg`, `icon ${classes}`.trim());
};
