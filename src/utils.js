const fs = require('fs');
function isObject(item) {
    return (
        item !== null && (typeof item === 'object' || typeof item === 'function')
    );
}

function isNullOrUndefined(value) {
    return value === undefined || value === null;
}

function arrayOfObjectsToArrayOfArrays(arrayOfObjects) {
    return arrayOfObjects.map((objectItem) => {
        let objectAsArray = Object.values(objectItem);
        return objectAsArray.map((arrayItem) =>
            !isNullOrUndefined(arrayItem) ? arrayItem : 'n/a',
        );
    });
}

function getJsonDataFromFile(path) {
    const data = fs.readFileSync(path);
    return JSON.parse(data);
}

module.exports = { isObject, isNullOrUndefined, arrayOfObjectsToArrayOfArrays, getJsonDataFromFile };