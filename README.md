# Extensions for Web WorldWind

This repository contains a collection of specialised extensions to the functionality of Web WorldWind.

The internal structure of this repository copies the structure of the core repository wherever applicable.

## Get started

You can explore the extensions in action at https://esafastprototyping.github.io/WebWorldWind-X/.

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

### satellite.js

This repository includes a copy of satellite.js released by its author as follows.

Copyright (C) 2013 Shashwat Kandadai, UCSC Jack Baskin School of Engineering

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
