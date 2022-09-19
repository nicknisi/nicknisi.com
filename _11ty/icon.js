// Load and return heroicons svg, embedding classes into it
const loadSvg = require('./svg');
const HEROICONS_PATH = './node_modules/heroicons';

module.exports = (icon, { classes, solid = true, mini = false } = {}) => {
  const sizePath = !solid ? '24/outline' : mini ? '20/solid' : '24/outline';
  return loadSvg(`${HEROICONS_PATH}/${sizePath}/${icon}.svg`, `icon ${classes}`.trim());
};
