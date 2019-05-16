import WorldWind from 'webworldwind-esa';
import proj4 from "proj4";

const Sector = WorldWind.Sector,
    TiledImageLayer = WorldWind.TiledImageLayer,
    WWUtil = WorldWind.WWUtil;

class COGTiledLayer extends TiledImageLayer {
    constructor(geoTiff, levelZeroDelta, sector, numLevels, resolutionX, resolutionY, tileHeight, tileWidth, crs) {
        super(sector, levelZeroDelta, numLevels, 'image/png', 'COGTiledLayer ' + WWUtil.guid(), tileWidth, tileHeight);

        console.log(sector, levelZeroDelta, numLevels, tileWidth, tileHeight);

        this.geoTiff = geoTiff;
        this.resX = resolutionX;
        this.resY = resolutionY;
        this.amounOfLevels = numLevels;

        console.log('CRS: ', crs);
        // Projection URL.
        if(crs) {
            this.sourceProjection = crs;
            this.targetProjection = 'EPSG:4326';
        }
    }

    /**
     * @inheritDoc
     */
    retrieveTileImage(dc, tile, suppressRedraw){
        if (this.currentRetrievals.indexOf(tile.imagePath) < 0) {
            if (this.absentResourceList.isResourceAbsent(tile.imagePath)) {
                return;
            }

            var imagePath = tile.imagePath,
                cache = dc.gpuResourceCache,
                layer = this;

            let sector = tile.sector;
            const currentLevel = this.amounOfLevels - tile.level.levelNumber - 1;

            if(this.sourceProjection) {
                const min = proj4(this.targetProjection, this.sourceProjection, [sector.minLongitude, sector.minLatitude]);
                const max = proj4(this.targetProjection, this.sourceProjection,[sector.maxLongitude, sector.maxLatitude]);

                sector = new Sector(
                    min[1],
                    max[1],
                    min[0],
                    max[0]
                );
            }

            // bbox is based on the current data
            this.geoTiff.readRasters({
                bbox: [
                    sector.minLongitude,
                    sector.minLatitude,
                    sector.maxLongitude,
                    sector.maxLatitude
                ],
                resX: this.resX * Math.pow(2, currentLevel),
                resY: this.resY * Math.pow(2, currentLevel)
            }).then(result => {
                console.log('Loaded Width: ', result.width, ' Height: ', result.height);

                let rBand, gBand, bBand;
                // Draw the bands into the canvas.
                if(result.length === 1) {
                    rBand = result[0];
                    gBand = result[0];
                    bBand = result[0];
                } else {
                    rBand = result[0];
                    gBand = result[1];
                    bBand = result[2];
                }

                const dataArray = [];
                rBand.forEach((red, index) => {
                    dataArray.push(red, gBand[index], bBand[index], 255);
                });
                const dataForCanvas = Uint8ClampedArray.from(dataArray);

                const imageData = new ImageData(dataForCanvas, result.width, result.height);
                const canvas = document.createElement('canvas');
                canvas.width = result.width;
                canvas.height = result.height;

                const context2D = canvas.getContext('2d');
                context2D.putImageData(imageData, 0, 0);

                var texture = layer.createTexture(dc, tile, canvas);
                layer.removeFromCurrentRetrievals(imagePath);

                if (texture) {
                    cache.putResource(imagePath, texture, texture.size);

                    layer.currentTilesInvalid = true;
                    layer.absentResourceList.unmarkResourceAbsent(imagePath);

                    if (!suppressRedraw) {
                        // Send an event to request a redraw.
                        var e = document.createEvent('Event');
                        e.initEvent(WorldWind.REDRAW_EVENT_TYPE, true, true);
                        window.dispatchEvent(e);
                    }
                }
            });
        }
    }
}

export default COGTiledLayer;