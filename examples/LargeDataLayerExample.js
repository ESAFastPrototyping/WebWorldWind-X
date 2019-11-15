import WorldWind from 'webworldwind-esa';
import LayerOrder from '../src/util/LayerOrder';
import LargeDataLayer from '../src/layer/point/LargeDataLayer';
import LayerManager from './LayerManager';

const {
    RenderableLayer
} = WorldWind;

WorldWind.configuration.baseUrl = window.location.pathname.replace('LargeDataLayerExample.html', '');
const wwd = new WorldWind.WorldWindow("canvasOne");
wwd.navigator.range = 10000;
wwd.navigator.lookAtLocation = new WorldWind.Position(59.9, 10.8, 0);

new LayerOrder(wwd);
const renderableLayer = new RenderableLayer('Highlighted Trees');

// What should be customizable?
   // The sector
   // The shapes to be drawn
      // Circles
      // Triangles
      // Squares
      // 
   // The click and hover behavior. But with meaningful defaults.
      // Co budete potrebovat vykreslit?

var layers = [
    {layer: new WorldWind.BingAerialLayer(null), enabled: true},
    {layer: new LargeDataLayer(wwd, renderableLayer,'http://localhost:8080/examples/data/treesCentroid.geojson'), enabled: true},
    {layer: renderableLayer, enabled: true}
];

for (var l = 0; l < layers.length; l++) {
    layers[l].layer.enabled = layers[l].enabled;
    layers[l].layer.zIndex = layers[l].zIndex;
    wwd.addLayer(layers[l].layer);``
}

new LayerManager(wwd);