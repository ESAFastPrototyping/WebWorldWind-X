/**
 * Constructs a HeatMapTile.
 *
 * Returns one tile for the HeatMap information. It is basically an interface specifying the public methods
 * properties and default configuration. The logic itself is handled in the subclasses.
 *
 * @alias HeatMapTile
 * @constructor
 * @classdesc Tile for the HeatMap layer visualising data on a canvas using shades of gray scale.
 *
 * @param data {Object[]} Array of information constituting points in the map.
 * @param options {Object}
 * @param options.sector {Sector} Sector representing the geographical area for this tile. It is used to correctly
 *  interpret the location of the MeasuredLocation on the resulting canvas.
 * @param options.width {Number} Width of the Canvas to be created in pixels.
 * @param options.height {Number} Height of the Canvas to be created in pixels.
 * @param options.radius {Number} Radius of the data point in pixels. The radius represents the blur applied to the
 *  drawn shape
 * @param options.incrementPerIntensity {Number} The ratio representing the 1 / measure for the maximum measure.
 * @param options.intensityGradient {Object} Keys represent the opacity between 0 and 1 and the values represent
 *  color strings.
 */
class LargeDataLayerTile {

    constructor(data, options) {
        this._data = data;

        this._sector = options.sector;

        this._canvas = this.createCanvas(options.width, options.height);

        this._width = options.width;
        this._height = options.height;
    };

    /**
     * Returns the drawn HeatMapTile in the form of URL.
     * @return {String} Data URL of the tile.
     */
    url() {
        return this.draw().toDataURL();
    };

    /**
     * Returns the whole Canvas. It is then possible to use further. This one is actually used in the
     * HeatMapLayer mechanism so if you want to provide some custom implementation of Canvas creation in your tile,
     * change this method.
     * @return {HTMLCanvasElement} Canvas Element representing the drawn tile.
     */
    canvas() {
        return this.draw();
    };

    /**
     * Draws the shapes on the canvas. Create shapes based on the gradient. Each of the gradient colors has associated
     * shape, which defines how strong will be the center point.
     * @protected
     * @returns {HTMLCanvasElement}
     */
    draw() {
        const ctx = this._canvas.getContext('2d');

        for (let i = 0; i < this._data.length; i++) {
            const dataPoint = this._data[i];
            this.shape(ctx, dataPoint);
        }

        return this._canvas;
    };

    shape(ctx, dataPoint) {
        ctx.beginPath();
        ctx.arc(
            this.longitudeInSector(dataPoint, this._sector, this._width),
            this._height - this.latitudeInSector(dataPoint, this._sector, this._height),
            Math.ceil(Math.sqrt(dataPoint.data['PERIMETER'])), 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.fill();
    }

    /**
     * Creates canvas element of given size.
     * @protected
     * @param width {Number} Width of the canvas in pixels
     * @param height {Number} Height of the canvas in pixels
     * @returns {HTMLCanvasElement} Created the canvas
     */
    createCanvas(width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    };

    /**
     * Calculates position in pixels of the point based on its latitude.
     * @param dataPoint {Object} Location to transform
     * @param sector {Sector} Sector to which transform
     * @param height {Number} Height of the tile to draw to.
     * @private
     * @returns {Number} Position on the height in pixels.
     */
    latitudeInSector(dataPoint, sector, height) {
        var sizeOfArea = sector.maxLatitude - sector.minLatitude;
        var locationInArea = (dataPoint.y - 90) - sector.minLatitude;
        return Math.ceil((locationInArea / sizeOfArea) * height);
    };

    /**
     * Calculates position in pixels of the point based on its longitude.
     * @param dataPoint {Object} Location to transform
     * @param sector {Sector} Sector to which transform
     * @param width {Number} Width of the tile to draw to.
     * @private
     * @returns {Number} Position on the width in pixels.
     */
    longitudeInSector(dataPoint, sector, width) {
        var sizeOfArea = sector.maxLongitude - sector.minLongitude;
        var locationInArea = (dataPoint.x - 180) - sector.minLongitude;
        return Math.ceil((locationInArea / sizeOfArea) * width);
    };
}

export default LargeDataLayerTile;