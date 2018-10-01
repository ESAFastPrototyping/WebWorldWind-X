# Extension repository for Web WorldWind framework

Extending the functionality of the Web WorldWind. Collection of modules that are useful for developers but not relevant for the core functionality.  

The internal structure of this repository copies the structure of the core repository wherever applicable. The extensions are provided in the relevant packages.

## Get started

Explore the examples here in the examples directory. There is an example per module. To build and serve the examples run: npm start

## Building

Install [NodeJS](https://nodejs.org/en/). The build is known to work with v6.9.2 (LTS).

- `npm install` downloads extension repository's dependencies.
- `npm run build` builds everything into the dist directory.
- `npm run jsdoc` generates the API documentation into the dist/api-doc folder.
- `npm run lint` process the files with the standard JsHint. 
- `npm run test` runs karma tests in the PhantomJS browser and exits after the run.
- `npm run test:watch` runs karma tests in the watch mode meaning that on the change in the files, the tests are rerun. 
- `npm run start` builds everything into the dist directory and starts the server with examples in the examples directory.
- `npm run release` publishes new version of the repository to the npm.
 