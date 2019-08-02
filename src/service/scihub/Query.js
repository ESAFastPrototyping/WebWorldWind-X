export default class Query {
    /**
     * Representation of the query for the SciHub.
     * @param shortName {String} Short name of the satellite for which to query the data.
     * @param products {String[]} Array of the products to query for.
     * @param location {Object} Latitude, Longitude of specific point.
     * @param beginTime {Date} From when we want the data
     * @param endTime {Date} Until when we want the data
     * @param startIndex {Number} Index of the first returned results
     */
    constructor({shortName, products = [], location, beginTime, endTime, startIndex} = {}) {
        this._shortName = shortName;
        this._products = products;
        this._location = location;
        this._beginTime = beginTime;
        this._endTime = endTime;
        this._startIndex = startIndex;
    }

    /**
     * URL representation of the query for the SciHub.
     * @returns {string} query part of the URL for the SciHub request.
     */
    url() {
        let toSerialize = [];

        if(this._location){
            toSerialize.push(serializeLocation(this._location));
        }
        if(this._beginTime && this._endTime) {
            toSerialize.push(serializeTime(this._beginTime, this._endTime));
        }

        const platformNameQuery = '(filename:(' + serializeFileName(this._shortName) + '))';
        const productsQuery = serializeProductType(this._products);
        toSerialize.push(platformNameQuery, productsQuery);
        const queryValue = toSerialize.join('AND');

        return `?q=${encodeURIComponent(queryValue)}&rows=100&start=${this._startIndex}&orderby=${encodeURIComponent('beginposition desc')}`;
    }
}

const serializeProductType = (products) => {
    const productsString = products.join(' OR ');
    return '(producttype:(' + productsString + '))';
};

const serializeLocation = ({latitude, longitude}) => {
    return '(footprint:"intersects(' + latitude + ', ' + longitude + ')")';
};

const serializeFileName = (shortSatName) => {
    if (shortSatName === 'S-1A') {
        return 'S1A_*';
    }
    if (shortSatName === 'S-2A') {
        return 'S2A_*';
    }
    if (shortSatName === 'S-3A') {
        return 'S3A_*';
    }
    if (shortSatName === 'S-1B') {
        return 'S1B_*';
    }
    if (shortSatName === 'S-2B') {
        return 'S2B_*';
    }
    if (shortSatName === 'S-5P') {
        return '';
    }
    if (shortSatName === 'S-3B') {
        return 'S3B_*';
    }
};

const serializeTime = (startTime, endTime) => {
    return `(beginposition: [${startTime.toISOString()} TO ${endTime.toISOString()}])`;
};