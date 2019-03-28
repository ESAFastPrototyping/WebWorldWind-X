import WorldWind from 'webworldwind-esa';
import LayerOrder from '../../src/util/LayerOrder';

describe('LayerOrder', () => {
    describe('#orderLayer', () => {
        const orderUnderTest = new LayerOrder({
            redrawCallbacks: []
        });

        it('doesn\'t change order when properly ordered', () => {
            const layers = [{
                id: 1,
                zIndex: 1
            }, {
                id: 2,
                zIndex: 2
            }, {
                id: 3,
                zIndex: 3
            }];
            LayerOrder.orderLayer({
                layers: layers
            }, WorldWind.BEFORE_REDRAW);

            expect(layers[0].id).toBe(1);
            expect(layers[1].id).toBe(2);
            expect(layers[2].id).toBe(3);
        });

        it('orders the layers by zIndex', () => {
            const layers = [{
                id: 2,
                zIndex: 2
            }, {
                id: 1,
                zIndex: 1
            }, {
                id: 3,
                zIndex: 3
            }];
            LayerOrder.orderLayer({
                layers: layers
            }, WorldWind.BEFORE_REDRAW);

            expect(layers[0].id).toBe(1);
            expect(layers[1].id).toBe(2);
            expect(layers[2].id).toBe(3);
        });
    })
});