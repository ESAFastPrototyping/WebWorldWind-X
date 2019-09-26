# Extensions for Web WorldWind

This repository contains a collection of specialised extensions to the functionality of Web WorldWind.

The internal structure of this repository copies the structure of the core repository wherever applicable.

## Get started

You can explore the extensions in action at https://worldwindlabs.github.io/WebWorldWind-X/.

To build and serve the extensions and examples locally, run: `npm start`

## Building

Install [NodeJS](https://nodejs.org/en/). The build is known to work with v6.9.2 (LTS).

- `npm install` downloads the required dependencies.
- `npm run build` builds everything into the dist directory.
- `npm run jsdoc` generates the API documentation into the dist/api-doc folder.
- `npm run lint` processes the files with the standard linter.
- `npm test` runs Karma tests in the PhantomJS browser and exits after the run.
- `npm run test:watch` runs Karma tests in watch mode, i.e. tests are run again on file change.
- `npm start` builds everything into the dist directory and starts the server with the examples.
- `npm run release` publishes a new version of the package to NPM.

## License

These extensions were created in the scope of the Frame Contract for Social Media and Mobile Applications Development for EO Ground Segment and Mission Operations, European Space Agency (ESA) Contract Number 4000112250.
They are released under Apache License 2.0.

Consortium: Solenix Deutschland GmbH (Prime Contractor), TERRASIGNA SRL, GISAT SRO, Progressive Systems SRL, Qualteh JR SRL.
