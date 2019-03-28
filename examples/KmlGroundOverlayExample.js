import WorldWind from '@nasaworldwind/worldwind';
import KmlGroundOverlay from '../src/formats/kml/features/KmlGroundOverlay';
import LayerManager from './LayerManager';

WorldWind.configuration.baseUrl = window.location.pathname.replace('KmlGroundOverlay.html', '');
const wwd = new WorldWind.WorldWindow("canvasOne");

wwd.addLayer(new WorldWind.BingAerialLayer(null));

WorldWind.KmlElements.addKey('GroundOverlay', KmlGroundOverlay);

var kmlFilePromise = new WorldWind.KmlFile('data/map-overlay.kml');
kmlFilePromise.then(function (kmlFile) {
    var renderableLayer = new WorldWind.RenderableLayer("Product Shape");
    renderableLayer.addRenderable(kmlFile);

    wwd.addLayer(renderableLayer);
    wwd.redraw();
});

new LayerManager(wwd);