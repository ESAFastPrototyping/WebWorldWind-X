import WorldWind from 'webworldwind-esa';

/**
 * @exports LayerOrder
 */
class LayerOrder {
    /**
     * Constructs LayerOrder.
     * @alias LayerOrder
     * @constructor
     * @classdesc The LayerOrder will sort layers in ascending order based on the zIndex property.
     * @param {WorldWindow} wwd The world window instance.
     */
    constructor(wwd) {
        wwd.redrawCallbacks.push(LayerOrder.orderLayer);
    }

    static orderLayer(wwd, stage) {
        if (stage === WorldWind.BEFORE_REDRAW) {
            wwd.layers.sort(function (a, b) {
                return a.zIndex - b.zIndex;
            });
        }
    }
}

export default LayerOrder;