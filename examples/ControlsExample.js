import WorldWind from 'webworldwind-esa';

import SentinelCloudlessLayer from '../src/layer/SentinelCloudlessLayer';
import Controls from '../src/view/Controls';
import LayerManager from './LayerManager';

WorldWind.configuration.baseUrl = window.location.pathname.replace('ControlsExample.html', '');
const wwd = new WorldWind.WorldWindow("canvasOne");

wwd.addLayer(new SentinelCloudlessLayer());

new Controls({
    mapContainerId: 'wwd-globe' ,
    worldWindow: wwd,
    classes: ['top-right']
});

new LayerManager(wwd);