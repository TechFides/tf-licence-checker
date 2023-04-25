How to publish new version
=========================

1. First of all you need to create account on [NPM](https://www.npmjs.com/signup) or login if you already have account
2. Join to `techfides` organization
3. Create account on [GitHub](https://github.com/) or login if you already have account
4. Join to `techfides` organization
5. Clone [licence-checker](https://github.com/TechFides/tf-licence-checker) project
6. In your terminal login to NPM with techfides organization scope
   1. `npm login --scope=@techfides`
7. Change the code a commit changes
8. Update package version
   1. `npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]`
9. Push changes to git
10. Publish new package version
    1. `npm publish --access public`