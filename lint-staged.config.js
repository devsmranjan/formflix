module.exports = {
    '{apps,libs,tools}/**/*.{ts}': (files) => {
        return `nx affected --target=typecheck --files=${files.join(',')}`;
    },
    '{apps,libs,tools}/**/*.{js,ts,json,html,scss}': [
        (files) => `nx affected:lint --files=${files.join(',')}`,
        (files) => `nx format:write --files=${files.join(',')}`,
    ],
};
