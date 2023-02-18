const fs = require('fs');
const path = require('path');
const { getJsonDataFromFile } = require('./utils.js');
const {
    extractAuthor,
    extractLicense
} = require('./extractor.js');

function addLocalPackageData(dependency, projectRootPath, { allowedLicenses = [], ignoredPackages = [] }) {
    const notAvailableText = 'n/a';
    let item = {};

    let projectPackageJsonPath = projectRootPath;
    let oldProjectPackageJsonPath = '';

    item.installedVersion = notAvailableText;
    item.author = notAvailableText;
    item.licenseType = notAvailableText;

    let packageFolderName;
    if (dependency.alias.length === 0) {
        packageFolderName = dependency.fullName;
    } else {
        packageFolderName = dependency.alias;
    }

    do {
        const itemPackageJsonPath = path.resolve(
            projectPackageJsonPath,
            'node_modules',
            packageFolderName,
            'package.json',
        );

        if (fs.existsSync(itemPackageJsonPath)) {
            const packageJSONContent = getJsonDataFromFile(itemPackageJsonPath);
            if (packageJSONContent?.version !== undefined) {
                const licenseType = extractLicense(packageJSONContent);
                item = {
                    name: packageJSONContent.name,
                    installedVersion: packageJSONContent.version,
                    author: extractAuthor(packageJSONContent),
                    licenseType,
                    isAllowed:
                        allowedLicenses.includes(licenseType) ||
                        ignoredPackages.includes(packageJSONContent.name),
                };
                break;
            }
        }
        oldProjectPackageJsonPath = projectPackageJsonPath;
        projectPackageJsonPath = path.dirname(projectPackageJsonPath);
    } while (projectPackageJsonPath !== oldProjectPackageJsonPath);

    if (item.installedVersion === notAvailableText) {
        console.log('found no package.json file for', dependency.fullName);
    }

    return item;
}

function addPackagesToIndex(packages) {
    const packageIndex = [];
    // iterate over packages and prepare urls before I call the registry
    for (const key in packages) {
        let name = key;
        let fullName = key;
        let alias = '';
        let version = packages[key];

        if (version.startsWith('npm:')) {
            alias = fullName;
            const aliasBase = version.substring(4);
            const versionSeparator = aliasBase.lastIndexOf('@');
            fullName = aliasBase.substring(0, versionSeparator);
            name = fullName;
            version = aliasBase.substring(versionSeparator + 1);
        }

        let scope = undefined;
        if (name.indexOf('@') === 0) {
            const scopeSeparator = name.indexOf('/');
            scope = name.substring(1, scopeSeparator);
            name = name.substring(scopeSeparator + 1, name.length);
        }

        const newEntry = {
            fullName: fullName,
            alias: alias,
            name: name,
            version: version,
            scope: scope,
        };

        const indexOfNewEntry = packageIndex.findIndex(
            (entry) =>
                entry.name === newEntry.name &&
                entry.version === newEntry.version &&
                entry.scope === newEntry.scope,
        );

        if (indexOfNewEntry === -1) {
            packageIndex.push(newEntry);
        }
    }
    return packageIndex;
}

module.exports = { addLocalPackageData, addPackagesToIndex };