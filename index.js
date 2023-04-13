#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const args = require('yargs').argv;
const formatAsTable = require('./formatter.js');
const { getJsonDataFromFile, isNullOrUndefined } = require('./utils.js');
const { addPackagesToIndex, addLocalPackageData } = require('./packageParser.js');

const configPath = args.config;
let config;

if (fs.existsSync(path.resolve(process.cwd(), configPath))) {
    config = require(path.resolve(process.cwd(), configPath));
} else {
    config = require(path.resolve('./example/licence-checker.config.js'));
}

const packagePath = config.package || './package.json';

const resolvedPackageJson = path.resolve(process.cwd(), packagePath);

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
    return addLocalPackageData(dependency, process.cwd(), config);
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
