import WorldWind from '@nasaworldwind/worldwind';
import Controls from '../src/view/controls/Controls';
import Sidebar from '../src/view/sidebar/Sidebar';

import CyclicPickController from '../src/util/CyclicPickController';

import './example.css';

const Logger = WorldWind.Logger,
    WorldWindow = WorldWind.WorldWindow;

Logger.setLoggingLevel(Logger.LEVEL_WARNING);

const wwd = new WorldWindow("canvasOne");
wwd.deepPicking = true;

new Controls(wwd, 'example');
new Sidebar(wwd, 'example');

new CyclicPickController(wwd, ['click'], onPickDone);

function onPickDone(renderables) {
    console.log(renderables);
}