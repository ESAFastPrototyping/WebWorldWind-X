import { AcquisitionPlans } from './service/acquisitionPlans/AcquisitionPlans';
import Controls from './view/Controls';
import CyclicPickController from './util/CyclicPickController';
import LayerOrder from './util/LayerOrder';
import EoUtils from './util/eo/utils';
import KMLWorker from './service/acquisitionPlans/KML.worker.js';
import Model from './shapes/satellites/Model';
import Orbits from './shapes/Orbits';
import SciHubProducts from './service/scihub/Products';
import SentinelCloudlessLayer from './layer/SentinelCloudlessLayer';
import StarFieldLayer from "./layer/starfield/StarFieldLayer";
import SwathCone from './shapes/SwathCone';
import TexturedSurfacePolygon from './shapes/TexturedSurfacePolygon';
import TexturedSurfaceShape from './shapes/TexturedSurfaceShape';
import { Workers } from './util/workers/Workers.js';

export default {
    AcquisitionPlans: AcquisitionPlans,
    Controls: Controls,
    CyclicPickController: CyclicPickController,
    EoUtils: EoUtils,
    KMLWorker: KMLWorker,
    LayerOrder: LayerOrder,
    Model: Model,
    Orbit: Orbits,
    SciHubProducts: SciHubProducts,
    SentinelCloudlessLayer: SentinelCloudlessLayer,
    StarFieldLayer: StarFieldLayer,
    SwathCone: SwathCone,
    TexturedSurfacePolygon: TexturedSurfacePolygon,
    TexturedSurfaceShape: TexturedSurfaceShape,
    Workers: Workers
};
