NPM [TechFides](https://team.techfides.cz/) Licence Checker
===================

Check your installed packages and their licences against allowed licences list.

Installation:
```
 npm install tf-licence-checker --save-dev
```

Create config file in your project
  * example: `licence-checker.config.js`

If licence checker not found config file, default will be used

Config options
--------------
* `allowedLicenses` array allowed licences 
* `ignoredPackages` ignored packages that will not be included in report
* `package` path to your package.json file, default: `./package.json`
* `checkDevDependencies` include dev dependencies in report

Config example
--------------
```
const config = {
  allowedLicenses: [
    '(Apache-2.0 OR MPL-1.1)',
    '(BSD-2-Clause OR WTFPL)',
    '(CC-BY-4.0 AND MIT)',
    '(MIT AND BSD-3-Clause)',
    '(MIT AND CC-BY-3.0)',
    '(MIT AND Zlib)',
    '(MIT OR Apache-2.0)',
    '(MIT OR CC0-1.0)',
    '(Unlicense OR Apache-2.0)',
    '(WTFPL OR MIT)',
    '0BSD',
    'AFLv2.1',
    'Apache 2.0',
    'Apache License, Version 2.0',
    'Apache-2.0',
    'Apache2',
    'BSD-2-Clause',
    'BSD-3-Clause OR MIT',
    'BSD-3-Clause',
    'CC-BY-3.0',
    'CC-BY-4.0',
    'CC0-1.0',
    'ISC',
    'MIT',
    'MIT,Apache2',
    'MPL-1.1',
    'WTFPL',
    'Zlib',
  ],
  ignoredPackages: [],
  package: './package.json',
  checkDevDependencies: true,
}

module.exports = config;
```

Usage
-----

Report show table with installed packages and blacklisted licences used in your project.

Add script to your package.json file:
```
"licence-checker": "tf-licence-checker --config={pathToConfig}"
```

or to use default config:
```
"licence-checker": "tf-licence-checker"
```

and then run:
```
npm run licence-checker
```

Table columns:
* `name` package name
* `version` package version
* `author` package author
* `licence type` package licence type
* `is alllowed` whenever is licence allowed to use

```
Name                Version  Author                                                License type  Is allowed
----                -------  ------                                                ------------  ----------
text-table          0.2.0    James Halliday mail@substack.net http://substack.net  MIT           true
yargs               17.6.2   n/a                                                   MIT           true
@types/yargs        17.0.22  n/a                                                   MIT           true
ag-grid-enterprise  27.3.0   Niall Crosby <niall.crosby@ag-grid.com>               Commercial    false    

BLACKLISTED LICENSE AT MODULE NAME: ag-grid-enterprise
            | LICENSE: Commercial
            | AUTHOR: Niall Crosby <niall.crosby@ag-grid.com>
            | VERSION: 27.3.0
```
