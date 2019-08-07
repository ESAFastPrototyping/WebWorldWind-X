import Products from '../../../src/service/scihub/Products';
import {fetch as fetchPolyfill} from 'whatwg-fetch';

describe('Products', () => {
    beforeEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    });

    const fetchWithCredentials = (url, options = {}) => {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers.Authorization = 'Basic ' + window.btoa('webworldwind:wwwPassSent');

        return fetchPolyfill(url, options);
    };

    describe('products', () => {
        it('properly returns all products.', async () => {
            const cache = new Map();
            const productsScihub = new Products(cache, fetchWithCredentials);
            const productsLocal = await productsScihub.products({
                shortName: 'S-1A',
                products: ['SLC'],
                beginTime: new Date("2017-05-31 18:45:32.004+02:00"),
                endTime: new Date("2017-06-01 04:45:32.004+02:00")
            });
            expect(productsLocal.length).toBe(219);
        });
    });

    describe('renderables', () =>{
        it('properly returns the renderables', async () => {
            async function loadProducts() {
                return await productsScihub.renderables({
                    shortName: 'S-1A',
                    products: ['SLC'],
                    beginTime: new Date("2017-06-01 03:45:32.004+02:00"),
                    endTime: new Date("2017-06-01 04:45:32.004+02:00")
                })
            }

            const cache = new Map();
            const productsScihub = new Products(cache, fetchWithCredentials);
            const productsLocal = await loadProducts();
            expect(productsLocal.renderables.length).toBe(23);
            expect(productsLocal.total).toBe(23);
            expect(productsLocal.errors.length).toBe(0);

            const productsSecondQuery = await loadProducts();
            expect(productsSecondQuery.renderables.length).toBe(23);
            expect(productsSecondQuery.total).toBe(23);
            expect(productsSecondQuery.errors.length).toBe(0);
        })
    })
});