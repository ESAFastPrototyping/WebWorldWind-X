import Product from '../../../src/service/scihub/Product';
import {fetch as fetchPolyfill} from 'whatwg-fetch';

describe('Product', () => {
    describe('renderable', () => {
        it('properly parses the WKT footprint', async () => {
            const product = new Product(() => {}, {
                id: 'id1',
                str: {
                    footprint: 'MULTIPOLYGON (((143.0515033072139 62.98660681025939, 145.21721057471424 63.030515399107884, 145.15466375659273 64.01543504402161, 142.91334302837234 63.96960512533651, 143.0515033072139 62.98660681025939)))'
                }
            });
            const result = await product.renderable();
            expect(result._boundaries.length).toBe(1);
            expect(result._boundaries[0].length).toBe(5);
        });

        it('properly creates Polygon with Texture', async () => {
            const product = new Product(fetchPolyfill, {
                id: 'id1',
                link: [
                    {
                        rel: 'icon',
                        href: 'https://cog-gisat.s3.eu-central-1.amazonaws.com/data_cube.jpg'
                    }
                ],
                str: {
                    footprint: 'MULTIPOLYGON (((143.0515033072139 62.98660681025939, 145.21721057471424 63.030515399107884, 145.15466375659273 64.01543504402161, 142.91334302837234 63.96960512533651, 143.0515033072139 62.98660681025939)))'
                }
            });
            const result = await product.renderable();
            expect(result.image !== null).toBe(true);
        });
    })
});