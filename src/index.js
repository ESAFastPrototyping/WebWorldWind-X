import { AcquisitionPlans } from './service/acquisitionPlans/AcquisitionPlans';
import Controls from './view/Controls';
import CyclicPickController from './util/CyclicPickController';
import LayerOrder from './util/LayerOrder';
import Orbits from './shapes/orbits/Orbits';
import TexturedSurfacePolygon from './shapes/TexturedSurfacePolygon';
import TexturedSurfaceShape from './shapes/TexturedSurfaceShape';
import SciHubProducts from './service/scihub/Products';
import SentinelCloudlessLayer from "./layer/SentinelCloudlessLayer";

export default {
    AcquisitionPlans: AcquisitionPlans,
    Controls: Controls,
    CyclicPickController: CyclicPickController,
    LayerOrder: LayerOrder,
    Orbit: Orbits,
    SciHubProducts: SciHubProducts,
    SentinelCloudlessLayer: SentinelCloudlessLayer,
    TexturedSurfacePolygon: TexturedSurfacePolygon,
    TexturedSurfaceShape: TexturedSurfaceShape,
};