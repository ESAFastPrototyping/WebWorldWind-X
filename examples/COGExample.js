import WorldWind from 'webworldwind-esa';

import CogTiledLayer from '../src/layer/COGTiledLayer';
import LayerManager from './LayerManager';
import SentinelCloudlessLayer from '../src/layer/SentinelCloudlessLayer';

WorldWind.configuration.baseUrl = window.location.pathname.replace('COGExample.html', '');

let amountOfLevels, image, tiff;
GeoTIFF.fromUrl('/examples/data/beijing.tif').then(pTiff => {
    tiff = pTiff;

    return tiff.getImageCount();
}).then(pAmountOfLevels => {
    amountOfLevels = pAmountOfLevels;

    return tiff.getImage(0);
}).then(pImage => {
    image = pImage;

    return tiff.getImage(amountOfLevels - 1);
}).then(pImage => {
    const tileWidth = pImage.fileDirectory.ImageWidth / 2;
    const tileHeight = pImage.fileDirectory.ImageLength / 2;

    initGlobe(image, tileWidth, tileHeight, amountOfLevels);
});

function initGlobe(image, tileWidth, tileHeight, amountOfLevels) {
    const boundingBox = image.getBoundingBox();

    const sector = new WorldWind.Sector(boundingBox[1], boundingBox[3], boundingBox[0], boundingBox[2]);

    const wwd = new WorldWind.WorldWindow("canvasOne");
    wwd.addLayer(new SentinelCloudlessLayer());

    wwd.addLayer(new BeijingCogLayer(tiff,
        new WorldWind.Location(Math.abs(boundingBox[3] - boundingBox[1]) / 2, Math.abs(boundingBox[2] - boundingBox[0]) / 2),
        sector, amountOfLevels, tileHeight,
        tileWidth, new GeoTIFF.Pool()));

    wwd.navigator.lookAtLocation = new WorldWind.Location((boundingBox[3] + boundingBox[1]) / 2, (boundingBox[2] + boundingBox[0]) / 2);
    wwd.navigator.range = 2000000;

    new LayerManager(wwd);

    wwd.redraw();
}

/**
 * Updated Cloud Optimised Geotiff layer taking into account the fact that in Beijing example the result doesn't contain
 * directly RGB colors.
 */
class BeijingCogLayer extends CogTiledLayer {
    constructor(geoTiff, levelZeroDelta, sector, numLevels, tileHeight, tileWidth, pool) {
        super(geoTiff, levelZeroDelta, sector, numLevels, tileHeight, tileWidth, pool);
    }

    bandsToCanvasData(result) {
        const rBand = result[0];
        const gBand = result[1];
        const bBand = result[2];

        const dataArray = [];
        rBand.forEach((red, index) => {
            const green = gBand[index];
            const blue = bBand[index];

            // 100 % means difference between max and min but probably for the whole image.
            const redBandValue = ((red - 0.124471) / (0.193829 - 0.124471)) * 255;
            const greenBandValue = ((green - 0.134592) / (0.180243 - 0.134592)) * 255;
            const blueBandValue = ((blue - 0.146628) / (0.190304 - 0.146628)) * 255;

            dataArray.push(redBandValue, greenBandValue, blueBandValue, 255);
        });

        return dataArray;
    }
}