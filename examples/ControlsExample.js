import WorldWind from '@nasaworldwind/worldwind';

import Controls from '../src/view/Controls';
import LayerManager from './LayerManager';

WorldWind.configuration.baseUrl = '/examples/';
const wwd = new WorldWind.WorldWindow("canvasOne");

wwd.addLayer(new WorldWind.BMNGLayer());

new Controls({
    mapContainerId: 'globe' ,
    worldWindow: wwd
});

new LayerManager(wwd);

document.querySelector('#canvasOne').height = (window.innerHeight - 55);