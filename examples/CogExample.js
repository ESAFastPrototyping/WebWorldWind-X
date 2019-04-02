import WorldWind from 'webworldwind-esa';
import {fromUrl} from 'geotiff/src/main';
import GeoTIFF from 'geotiff';

console.log(GeoTIFF);
console.log(fromUrl);

//import CogTiledLayer from '../src/layers/COGTiledLayer';

import LayerManager from './LayerManager';

WorldWind.configuration.baseUrl = window.location.pathname.replace('ControlsExample.html', '');
const wwd = new WorldWind.WorldWindow("canvasOne");

wwd.addLayer(new WorldWind.BMNGLayer());
//wwd.addLayer(new CogTiledLayer('https://s3-us-west-2.amazonaws.com/planet-disaster-data/hurricane-harvey/SkySat_Freeport_s03_20170831T162740Z3.tif'));

fromUrl('https://s3-us-west-2.amazonaws.com/planet-disaster-data/hurricane-harvey/SkySat_Freeport_s03_20170831T162740Z3.tif').then(tiff => {
    console.log(tiff);

    tiff.getImageCount().then(count => {
        console.log(count);
    });
    tiff.getImage().then(image => {
        console.log(image);

        console.log(image.getBoundingBox());
        console.log(image.getGDALMetadata());
        console.log(image.getWidth());
        console.log(image.getHeight());
    });

    tiff.getImage(1).then(image => {
        console.log('Id1', image);
    });

    tiff.readRasters({
            bbox: [
                259537.6000000000058208, 3195976.8000000002793968, 281663.2000000000116415, 3217617.6000000000931323
            ],
            resX: 25,
            resY: 25
        }
    ).then(result => {
        console.log(result);

        const rBand = result[0];
        const gBand = result[1];
        const bBand = result[2];
    });
});

new LayerManager(wwd);