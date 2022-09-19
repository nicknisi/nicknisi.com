// Load and return heroicons svg, embedding classes into it
const loadSvg = require('./svg');
const HEROICONS_PATH = './node_modules/heroicons';
const SIMPLEICON_PATH = './node_modules/simple-icons/icons';

module.exports = (icon, { classes, solid = true, mini = false, simple = false } = {}) => {
  const sizePath = !solid ? '24/outline' : mini ? '20/solid' : '24/outline';
  const path = simple
    ? `${SIMPLEICON_PATH}/${icon}.svg`
    : `${HEROICONS_PATH}/${sizePath}/${icon}.svg`;
  return loadSvg(path, `icon ${classes}`.trim());
};
