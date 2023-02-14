const simpleIcons = require('simple-icons');

module.exports = function (iconName, class) {
  const icon = simpleIcons.Get(iconName);

  if (!icon) {
    throw new Error(`Icon ${iconName} not found`);
  }

  return `<svg class="${class}" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>${icon.title} icon</title><path d="${icon.path}" /></svg>`;
};
