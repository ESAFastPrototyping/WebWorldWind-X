import Product from './Product';
import Query from './Query';
import {xml2js} from 'xml-js';

export default class Products {
    /**
     * Products represents collection of the products from different satellites. The Query is focused on the SciHub.
     * @param cache {Map} Cache to be used for storing the retrieved products.
     * @param fetch {Function} Function with provided defaults for making requests.
     * @param baseUrl {String} Optional. Optional URL for the retrieval of the products. Default is SciHub
     */
    constructor(cache, fetch, baseUrl = 'https://scihub.copernicus.eu/apihub/search') {
        this._baseUrl = baseUrl;
        this._cache = cache;

        this._fetch = fetch;
    }

    /**
     * Retrieve the product information from the SciHub. The process has two parts.
     *   The first part is retrieving the products available for given combination of the parameters.
     *   The second part is to retrieve the actual quicklooks for all the products not already stored in cache.
     * @param shortName {String} Short name of the satellite for which to query the data.
     * @param products {String[]} Array of the products to query for.
     * @param location {Object} Latitude, Longitude of specific point.
     * @param beginTime {Date} From when we want the data
     * @param endTime {Date} Until when we want the data
     * @returns {Promise<Product[]>} Product for further use.
     */
    async products({shortName, products = [], location, beginTime, endTime} = {}) {
        const filteredProducts = [];
        const resultsPerPage = 100;
        let startIndex = 0;
        let currentPage;
        do {
            currentPage = await this.load({shortName, products, location, beginTime, endTime, startIndex});
            startIndex += resultsPerPage;

            const processed = this.processProducts(currentPage);
            filteredProducts.push.apply(filteredProducts, processed);
        } while(currentPage.next);

        return filteredProducts;
    }

    /**
     * Retrieve the product information from the SciHub. The process has two parts.
     *   The first part is retrieving the products available for given combination of the parameters.
     *   The second part is to retrieve the actual quicklooks for all the products not already stored in cache.
     * @param shortName {String} Short name of the satellite for which to query the data.
     * @param products {String[]} Array of the products to query for.
     * @param location {Object} Latitude, Longitude of specific point.
     * @param beginTime {Date} From when we want the data
     * @param endTime {Date} Until when we want the data
     * @returns {Promise<Renderable[]>} Renderable to be used within the WebWorldWind.
     */
    async renderables({shortName, products = [], location, beginTime, endTime} = {}) {
        const productsLocal = await this.products({shortName, products, location, beginTime, endTime});
        const renderables = [];
        for(let productIndex = 0; productIndex < productsLocal.length; productIndex++) {
            const renderable = await productsLocal[productIndex].renderable();
            renderables.push(renderable);
        }
        return renderables;
    }

    /**
     * From the entries received from Sci Hub creates relevant products with all necessary information for further
     * processing and visualization.
     * @private
     * @param feed {Object} Atom feed with the information about the products.
     * @returns {Array<Product>} Valid products
     */
    processProducts(feed) {
        if(feed.entry && feed.entry.length > 0) {
            return feed.entry.map(entry => {
                if(entry && entry.id) {
                    const cached = this._cache.get(entry.id._text);
                    if(!cached) {
                        entry.id = entry.id._text;

                        const str = {};
                        entry.str.forEach(element => {
                            const name = element._attributes.name;
                            str[name] = element._text;
                        });
                        entry.str = str;

                        entry.link = entry.link.map(element => {
                            return {
                                rel: element._attributes.rel,
                                href: element._attributes.href
                            };
                        });

                        const product = new Product(this._fetch, entry);
                        this._cache.set(product.id(), product);
                        return product;
                    }
                } else {
                    return null;
                }
            }).filter(product => product);
        } else {
            return [];
        }
    }

    /**
     * Load feed with the products from the remote source.
     * @private
     * @param shortName {String} Short name of the satellite for which to query the data.
     * @param products {String[]} Array of the products to query for.
     * @param location {Object} Latitude, Longitude of specific point.
     * @param beginTime {Date} From when we want the data
     * @param endTime {Date} Until when we want the data
     * @param startIndex {Number} The index of the first result to query for.
     * @returns {Promise<Object>} Feed from the response.
     */
    async load({shortName, products = [], location, beginTime, endTime, startIndex} = {}) {
        const query = new Query({shortName, products, location, beginTime, endTime, startIndex});
        const url = this._baseUrl + query.url();

        const response = await this._fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const atomFeed = await response.text();
        const root = xml2js(atomFeed, {compact: true});
        const feed = root.feed;
        if(feed.entry && typeof feed.entry.length === 'undefined') {
            feed.entry = [feed.entry];
        }

        // Here it is necessary to decide whether there are more results.
        const totalResults = Number(feed['opensearch:totalResults']._text);
        const itemsPerPage = Number(feed['opensearch:itemsPerPage']._text);

        feed.next = (startIndex + itemsPerPage) < totalResults;
        return feed;
    }
}