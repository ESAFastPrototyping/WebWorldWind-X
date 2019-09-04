import WorldWind from 'webworldwind-esa';
import SentinelCloudlessLayer from '../src/layer/SentinelCloudlessLayer';
import LayerManager from './LayerManager';
import Orbits from '../src/shapes/orbits/Orbits';
import utils from '../src/shapes/orbits/utils';

const {
    RenderableLayer,
    WorldWindow
} = WorldWind;

WorldWind.configuration.baseUrl = window.location.pathname.replace('OrbitsExample.html', '');
const wwd = new WorldWindow("canvasOne");

const satRec = utils.computeSatrec(
    '1 39634U 14016A   18124.03591006  .00000001  00000-0  10014-4 0  9998',
    '2 39634  98.1819 132.0838 0001369  78.7198 281.4156 14.59198520217480'
);

const orbitsLayer = new RenderableLayer();
orbitsLayer.addRenderable(new Orbits(satRec));

wwd.addLayer(new SentinelCloudlessLayer());
wwd.addLayer(orbitsLayer);

new LayerManager(wwd);