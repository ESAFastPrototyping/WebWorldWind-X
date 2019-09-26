import WorldWind from 'webworldwind-esa';
import SentinelCloudlessLayer from '../src/layer/SentinelCloudlessLayer';
import LayerManager from './LayerManager';
import StarFieldLayer from "../src/layer/starfield/StarFieldLayer";

const {
    WorldWindow
} = WorldWind;

WorldWind.configuration.baseUrl = window.location.pathname.replace('PlanetsExample.html', '');
document.getElementById("canvasOne").style.backgroundColor = 'black';
const wwd = new WorldWindow("canvasOne");

wwd.addLayer(new SentinelCloudlessLayer());
wwd.addLayer(new StarFieldLayer());

new LayerManager(wwd);