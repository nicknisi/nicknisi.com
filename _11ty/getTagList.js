module.exports = (collection) => {
    const tagSet = new Set();
    collection.getAll().forEach((item) => {
        const { tags = [] } = item.data;
        tags.filter((tag) => {
            switch (tag) {
                case 'all':
                case 'nav':
                case 'post':
                case 'posts':
                    return false;
            }
            return true;
        }).forEach((tag) => tagSet.add(tag));
    });

    return [...tagSet];
};
