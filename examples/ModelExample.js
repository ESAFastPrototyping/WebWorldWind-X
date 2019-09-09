import WorldWind from 'webworldwind-esa';
import SentinelCloudlessLayer from '../src/layer/SentinelCloudlessLayer';
import LayerManager from './LayerManager';
import SatelliteModel from '../src/shapes/satellites/Model';

const {
    Position,
    RenderableLayer,
    WorldWindow
} = WorldWind;

WorldWind.configuration.baseUrl = window.location.pathname.replace('ModelExample.html', '');
const wwd = new WorldWindow("canvasOne");

const modelsLayer = new RenderableLayer();
fetch('http://localhost:8080/examples/data/sentinel1/s1.json').then(response => {
    return response.json();
}).then(satelliteData => {
    modelsLayer.addRenderable(new SatelliteModel(satelliteData, {
        rotations: {
            x: 0,
            y: 0,
            z: 0,
            headingAxis: [0, 0, 1],
            headingAdd: -90,
            headingMultiply: 1
        },
        preRotations: {
            x: 0,
            y: 0,
            z: 0
        },
        scale: 500000,
        translations: {
            x: -0.1,
            y: -0.1,
            z: 0
        },
        ignoreLocalTransforms: true
    }, new Position(51, 14, 100000)));
});

wwd.addLayer(new SentinelCloudlessLayer());
wwd.addLayer(modelsLayer);

wwd.goTo(new Position(51,14,2000000), () => {});

new LayerManager(wwd);