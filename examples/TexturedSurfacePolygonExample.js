import WorldWind from 'webworldwind-esa';

import LayerManager from './LayerManager';
import TexturedSurfacePolygon from '../src/shapes/TexturedSurfacePolygon';

WorldWind.configuration.baseUrl = window.location.pathname.replace('TexturedSurfacePolygonExample.html', '');
const wwd = new WorldWind.WorldWindow("canvasOne");

const layerWithTexturedSurfacePolygon = new WorldWind.RenderableLayer('Textured Surface');
const layers = [
    {layer: layerWithTexturedSurfacePolygon, enabled: true},
    {layer: new WorldWind.BMNGLayer(), enabled: true},
    {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
    {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
];

const texturedPolygon = new TexturedSurfacePolygon([
    new WorldWind.Location(37.91904192681665, 14.60128369746704),
    new WorldWind.Location(37.91904192681665, 15.35832653742206),
    new WorldWind.Location(37.46543388598137, 15.35832653742206),
    new WorldWind.Location(37.46543388598137, 14.60128369746704)
], new WorldWind.ShapeAttributes());
const texture = new Image();
texture.src = 'images/etna.jpg';
texturedPolygon.image = texture;

layerWithTexturedSurfacePolygon.addRenderable(texturedPolygon);

wwd.navigator.range = 187000;
wwd.navigator.lookAtLocation = new WorldWind.Location(37.6, 15);

for (let l = 0; l < layers.length; l++) {
    layers[l].layer.enabled = layers[l].enabled;
    wwd.addLayer(layers[l].layer);
}

new LayerManager(wwd);