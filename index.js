const fs = require('fs');
const path = require('path');
const table = require('text-table');
const args = require('yargs').argv;

const configPath = args.config;
let config;

if (fs.existsSync(configPath)) {
    config = require(configPath);
} else {
    throw new Error(
        `Error: the file '${configPath}' is required to get config`,
    );
}

const packagePath = config.package || './package.json';

const resolvedPackageJson = path.resolve(packagePath);

const fields = [
    {
        label: 'Name',
        name: 'name',
    },
    {
        label: 'Version',
        name: 'installedVersion',
    },
    {
        label: 'Author',
        name: 'author',
    },
    {
        label: 'License type',
        name: 'licenseType',
    },
    {
        label: 'Is allowed',
        name: 'isAllowed',
    },
];

function getJsonDataFromFile(path) {
    const data = fs.readFileSync(path);
    return JSON.parse(data);
}

function arrayOfObjectsToArrayOfArrays(arrayOfObjects) {
    return arrayOfObjects.map((objectItem) => {
        let objectAsArray = Object.values(objectItem);
        return objectAsArray.map((arrayItem) =>
            !isNullOrUndefined(arrayItem) ? arrayItem : 'n/a',
        );
    });
}

function isNullOrUndefined(value) {
    return value === undefined || value === null;
}

function formatAsTable(dataAsArray) {
    let data = arrayOfObjectsToArrayOfArrays(dataAsArray);
    let labels = [];
    let lines = [];

    // create a labels array and a lines array
    // the lines will be the same length as the label's
    for (let i = 0; i < fields.length; i++) {
        let label = fields[i].label;
        labels.push(label);
        lines.push('-'.repeat(label.length));
    }

    data.unshift(lines);
    data.unshift(labels);

    return table(data);
}

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

function isObject(item) {
    return (
        item !== null && (typeof item === 'object' || typeof item === 'function')
    );
}

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
        const itemPackageJsonPath = path.join(
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
        debug('found no package.json file for %s', dependency.fullName);
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

let packageJson;
if (fs.existsSync(resolvedPackageJson)) {
    packageJson = getJsonDataFromFile(resolvedPackageJson);
} else {
    throw new Error(
        `Error: the file '${resolvedPackageJson}' is required to get installed versions of packages`,
    );
}

if (!config.allowedLicenses) {
    throw new Error(
        `Error: the file '${configPath}' not contain field: "allowedLicenses"`,
    );
}

let depsIndex = addPackagesToIndex(packageJson.dependencies);

if (!isNullOrUndefined(packageJson.devDependencies) && config.checkDevDependencies) {
    depsIndex = depsIndex.concat(addPackagesToIndex(packageJson.devDependencies));
}

const packagesData = depsIndex.map((dependency) => {
    return addLocalPackageData(dependency, __dirname, config);
});

console.log(formatAsTable(packagesData));

let failJob = false;
packagesData.forEach((licence) => {
    if (!licence.isAllowed) {
        const moduleInfo = (licenseItem) => `MODULE NAME: ${licenseItem.name}
            | LICENSE: ${licenseItem.licenseType}
            | AUTHOR: ${licenseItem.author}
            | VERSION: ${licenseItem.installedVersion}
`;
        const msg = moduleInfo(licence);

        console.log('\x1b[40m\x1b[31m%s\x1b[0m', `BLACKLISTED LICENSE AT ${msg}`);
        failJob = true;
    }
});

if (failJob) {
    process.exit(1);
}
