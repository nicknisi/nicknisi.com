const { readFileSync } = require('fs');

module.exports = (filePath) => {
    const data = readFileSync(`.${filePath}`, (error, data) => {
        if (error) {
            throw new Error(error);
        }

        return data.toString('utf8');
    });

    return data;
};
