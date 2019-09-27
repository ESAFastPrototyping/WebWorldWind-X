import WorldWind from 'webworldwind-esa';
import Products from '../src/service/scihub/Products';
import SentinelCloudlessLayer from '../src/layer/SentinelCloudlessLayer';
import LayerManager from './LayerManager';

const {
    Position,
    RenderableLayer,
    WorldWindow
} = WorldWind;

WorldWind.configuration.baseUrl = window.location.pathname.replace('ScihubProductsExample.html', '');
const wwd = new WorldWindow("canvasOne");
wwd.navigator.lookAtLocation = new Position(30, 55, 0);

const productsLayer = new RenderableLayer('Products');
wwd.addLayer(new SentinelCloudlessLayer());
wwd.addLayer(productsLayer);
new LayerManager(wwd);

document.getElementById('showProducts').addEventListener('click', () => {
    async function showProducts(username, password) {
        const fetchWithCredentials = (url, options = {}) => {
            if (!options.headers) {
                options.headers = {};
            }
            options.headers.Authorization = 'Basic ' + window.btoa(`${username}:${password}`);

            return window.fetch(url, options);
        };

        const cache = new Map();
        const productsScihub = new Products(cache, fetchWithCredentials);
        const productsLocal = await productsScihub.renderables({
            shortName: 'S-1A',
            products: ['SLC'],
            beginTime: new Date("2017-06-01 03:45:32.004+02:00"),
            endTime: new Date("2017-06-01 04:45:32.004+02:00")
        });
        if(productsLocal.errors.length === 0) {
            productsLayer.addRenderables(productsLocal.renderables);
        }
        wwd.redraw();
    }

    const username = document.getElementById('username').innerText;
    const password = document.getElementById('password').innerText;
    showProducts(username, password);
});


