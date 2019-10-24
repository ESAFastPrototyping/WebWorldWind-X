# Extensions for Web WorldWind

This repository contains a collection of specialised extensions to the functionality of Web WorldWind.

The internal structure of this repository copies the structure of the core repository wherever applicable.

## Get started

You can explore the extensions in action at https://worldwindlabs.github.io/WebWorldWind-X/.

To build and serve the extensions and examples locally, run: `npm start`

### Use from NPM

To install the library run `npm install --save webworldwind-x` at the command line.

To use the classes from the library you need to import the library as an object and then you can either reference them 
via . notation or destructure them to the relevant classes.

Destructuring example

``` 
import WorldWindX from 'webworldwind-x;
const {
    AcquisitionPlans,
    Controls,
    CyclicPickController,
    EoUtils,
    KMLWorker,
    LayerOrder,
    Model,
    Orbit,
    SciHubProducts,
    SentinelCloudlessLayer,
    StarFieldLayer,
    SwathCone,
    TexturedSurfacePolygon,
    TexturedSurfaceShape,
    Workers
} = WorldWindX
```

Dot notation

``` 
import WorldWindX from 'webworldwind-x;
const acqPlans = new WorldWindX.AcquisitionPlans();
```

## Building

Install [NodeJS](https://nodejs.org/en/). The build is known to work with v10.15.3 (LTS).

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

### License of included satellite.js

I chose the MIT License because this library is a derivative work off Brandon Rhodes sgp4, and that is licensed with MIT. It just seemed simpler this way, sub-licensing freedoms notwithstanding.

I worked in the Dining Hall at UCSC for a month, which means I signed a form that gives UCSC partial ownership of anything I make while under their aegis, so I included them as owners of the copyright.

Please email all complaints to help@ucsc.edu 