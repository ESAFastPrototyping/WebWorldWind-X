import WorldWind from 'webworldwind-esa';
import SentinelCloudlessLayer from '../src/layer/SentinelCloudlessLayer';
import LayerManager from './LayerManager';
import Swath from '../src/shapes/Swath';
import utils from '../src/util/eo/utils';

const {
    Color,
    RenderableLayer,
    WorldWindow
} = WorldWind;

WorldWind.configuration.baseUrl = window.location.pathname.replace('SwathExample.html', '');
const wwd = new WorldWindow("canvasOne");

const satRec = utils.computeSatrec(
    '1 39634U 14016A   18124.03591006  .00000001  00000-0  10014-4 0  9998',
    '2 39634  98.1819 132.0838 0001369  78.7198 281.4156 14.59198520217480'
);
const now = new Date();
const currentPosition = utils.getOrbitPosition(satRec, now);
const nextPosition = utils.getOrbitPosition(satRec, new Date(now.getTime() + 10000));
const nNextPosition = utils.getOrbitPosition(satRec, new Date(now.getTime() + 20000));
const headingRad = utils.headingAngleRadians(currentPosition.latitude, currentPosition.longitude, nextPosition.latitude, nextPosition.longitude);
const currentHeading = utils.rad2deg(headingRad);
const nextHeadingRad = utils.headingAngleRadians(nextPosition.latitude, nextPosition.longitude, nNextPosition.latitude, nNextPosition.longitude);
const nextHeading = utils.rad2deg(nextHeadingRad);

const swathLayer = new RenderableLayer();
swathLayer.addRenderable(new Swath({
    currentPosition,
    nextPosition,
    currentHeading,
    nextHeading
}, Color.RED, 490, 130, 35));

wwd.addLayer(new SentinelCloudlessLayer());
wwd.addLayer(swathLayer);

new LayerManager(wwd);