NPM Techfides License Checker
===================

Check your installed packages and their licences against allowed licences list.

Installation:
```
 npm install tf-licence-checker --save-dev
```

Create config file in your project
  * example: `license-checker.config.js`

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
    'ISC',
    'MIT',
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
```
npm run tf-licence-checker --config={pathToConfig}
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

Gitlab CI/CD integration
------------------------
You can create CI/CD job that will automatically check licence and fail the job if there are a forbidden licences.

```
stages:
    - install
    - licence

license:
  stage: license
  needs:
    - install
  interruptible: true
  cache:
    key: '$CI_COMMIT_REF_NAME-server-$CI_PIPELINE_ID'
    paths:
      - node_modules/
    policy: pull
  script:
    - npm run license-checker
  tags:
    - docker 
```
