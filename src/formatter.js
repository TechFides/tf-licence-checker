const { arrayOfObjectsToArrayOfArrays } = require('./utils.js');
const { fields } = require('./tableFields.js');
const table = require('text-table');

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

module.exports = formatAsTable;