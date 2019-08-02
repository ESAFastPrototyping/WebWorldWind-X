import Products from '../../../src/service/scihub/Products';
import {fetch as fetchPolyfill} from 'whatwg-fetch';

// Removed from running until the login part is solved.
xdescribe('Products', () => {
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

        it('properly returns all products.', async () => {
            const cache = new Map();
            const productsScihub = new Products(cache, fetchWithCredentials);
            const productsLocal = await productsScihub.renderables({
                shortName: 'S-1A',
                products: ['SLC'],
                beginTime: new Date("2017-06-01 03:45:32.004+02:00"),
                endTime: new Date("2017-06-01 04:45:32.004+02:00")
            });
            expect(productsLocal.length).toBe(23);
            expect(productsLocal[0].image !== null).toBe(true);
        })
    });
});