import WorldWind from 'webworldwind-esa';

import LayerManager from './LayerManager';
import SentinelCloudlessLayer from '../src/layer/SentinelCloudlessLayer';
import TexturedSurfacePolygon from '../src/shapes/TexturedSurfacePolygon';
import { AcquisitionPlans } from '../src/service/acquisitionPlans/AcquisitionPlans';
import { Workers } from '../src/util/workers/Workers.js';
import KMLWorker from '../src/service/acquisitionPlans/KML.worker.js';

WorldWind.configuration.baseUrl = window.location.pathname.replace('AcquisitionPlansExample.html', '');

const wwd = new WorldWind.WorldWindow("canvasOne");

const footprintLayer = new WorldWind.RenderableLayer('Footprints');

const layers = [
    {layer: footprintLayer, enabled: true},
    {layer: new SentinelCloudlessLayer(), enabled: true},
    {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
    {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
];

for (let l = 0; l < layers.length; l++) {
    layers[l].layer.enabled = layers[l].enabled;
    wwd.addLayer(layers[l].layer);
}

new LayerManager(wwd);



const satNames = ['s1a', 's1b', 's2a', 's2b'];
const numWorkers = Workers.getCoreCount();
const workers = new Workers(KMLWorker, numWorkers);
const acquisitionPlans = new AcquisitionPlans(satNames, workers);
acquisitionPlans.parser.InteriorCtor = TexturedSurfacePolygon;


async function parseAcquisitionPlans() {
    const filterDate = '2019-08-19T00:00:00.000Z';

    const plans = [
        { satName: 's1a', url: './examples/data/S1A_20190812_20190828.kml', filterDate },
        { satName: 's1a', url: './examples/data/S1A_20190814_20190909.kml', filterDate },
        { satName: 's2a', url: './examples/data/S2A_20190801_20190819.kml', filterDate },
        { satName: 's2a', url: './examples/data/S2A_20190815_20190902.kml', filterDate },
        { satName: 's2a', url: './examples/data/S2A_20190829_20190916.kml', filterDate },
    ];

  
    await Promise.all(plans.map(plan => acquisitionPlans.parse(plan).catch((err) => {console.error(err)})));

    acquisitionPlans.terminateWorkers();

    const timestamp = new Date('2019-08-20T00:00:00.000Z').getTime();
    
    const range = 90 * 60 * 1000;
    const startDate = new Date(timestamp - range);
    const endDate = new Date(timestamp + range);
    
    const { interiors, outlines } = acquisitionPlans.getFootprints({ satName: 's1a', startDate, endDate });

    footprintLayer.addRenderables(interiors);
    footprintLayer.addRenderables(outlines);

    wwd.redraw();
}

function getPickObject(e) {
    const pickList = wwd.pick(wwd.canvasCoordinates(e.clientX, e.clientY));
    const pickedObject =  pickList.objects.find(pickedObject => !pickedObject.isTerrain && pickedObject.userObject);
    return pickedObject ? pickedObject.userObject : null;
}

wwd.addEventListener('click', (e) => {
    const pickedObject = getPickObject(e);
    acquisitionPlans.toggleHighlight(pickedObject);
});

wwd.addEventListener('dblclick', () => {
    acquisitionPlans.deHighlight();
});

parseAcquisitionPlans()
    .catch(err => console.error(err));