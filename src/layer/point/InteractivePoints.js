import WorldWind from 'webworldwind-esa';
import LargeDataLayer from './LargeDataLayer';

const {
    RenderableLayer
} = WorldWind;

class InteractivePoints {
    constructor(wwd, url) {
        // Parse the data

        this._visualizationLayer = this.visualizationLayer(data);
        this._interactiveLayer = this.interactiveLayer(wwd, data);
        // Controller. Handling the events of the wwd.
    }

    visualizationLayer() {
        return new LargeDataLayer();
    }

    interactiveLayer() {
        return new RenderableLayer();
    }
}

export default InteractivePoints;