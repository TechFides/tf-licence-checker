const { isObject } = require('./utils.js');

function extractLicense(packageJSONContent) {
    const notAvailableText = 'n/a';

    if (typeof packageJSONContent.license === 'string') {
        return packageJSONContent.license;
    }

    if (typeof packageJSONContent.license === 'object') {
        return packageJSONContent.license.type;
    }

    let licenseType;
    if (Array.isArray(packageJSONContent.licenses)) {
        licenseType = '';
        for (let i = 0; i < packageJSONContent.licenses.length; i++) {
            if (i > 0) licenseType += ', ';

            if (typeof packageJSONContent.licenses[i] === 'string') {
                licenseType += packageJSONContent.licenses[i];
            } else {
                licenseType += packageJSONContent.licenses[i].type;
            }
        }
        if (licenseType.length === 0) {
            licenseType = notAvailableText;
        }
    } else {
        licenseType = notAvailableText;
    }
    return licenseType;
}

function extractAuthor(packageJSONContent) {
    let author = 'n/a';
    if (isObject(packageJSONContent.author)) {
        author = packageJSONContent.author.name || '';
        if (packageJSONContent.author.email) {
            if (author.length > 0) {
                author += ' ';
            }
            author += packageJSONContent.author.email;
        }

        if (packageJSONContent.author.url) {
            if (author.length > 0) {
                author += ' ';
            }
            author += packageJSONContent.author.url;
        }
    } else {
        if (
            typeof packageJSONContent.author === 'string' ||
            packageJSONContent.author instanceof String
        ) {
            author = packageJSONContent.author;
        }
    }

    return author;
}

module.exports = { extractLicense, extractAuthor };