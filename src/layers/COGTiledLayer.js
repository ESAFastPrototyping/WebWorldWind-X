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

        // Projection URL.
        if(crs) {
            this.sourceProjection = crs;
            this.targetProjection = 'EPSG:4326';
        }
    }

    createTopLevelTiles() {
        this.topLevelTiles = [];

        const level = this.levels.firstLevel();

        var deltaLat = level.tileDelta.latitude,
            deltaLon = level.tileDelta.longitude,

            sector = level.sector,
            firstRow = 0,
            lastRow = 1,

            firstCol = 0,
            lastCol = 1,

            firstRowLat = sector.minLatitude,
            firstRowLon = sector.minLongitude,

            minLat = firstRowLat,
            minLon,
            maxLat,
            maxLon;

        for (var row = firstRow; row <= lastRow; row += 1) {
            maxLat = minLat + deltaLat;
            minLon = firstRowLon;

            for (var col = firstCol; col <= lastCol; col += 1) {
                maxLon = minLon + deltaLon;
                var tileSector = new Sector(minLat, maxLat, minLon, maxLon),
                    tile = this.createTile(tileSector, level, row, col);
                this.topLevelTiles.push(tile);

                minLon = maxLon;
            }

            minLat = maxLat;
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

            if(tile.loading) {
                return;
            }
            tile.loading = true;

            var imagePath = tile.imagePath,
                cache = dc.gpuResourceCache,
                layer = this;

            let sector = tile.sector;
            const currentLevel = this.amounOfLevels - tile.level.levelNumber - 1;

            console.log('Sector: ', sector);

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
                width: this.tileWidth / (Math.pow(2, currentLevel)),
                height: this.tileHeight / (Math.pow(2, currentLevel))
            }).then(result => {
                console.log('Loaded Width: ', result.width, ' Height: ', result.height) ;

                let rBand, gBand, bBand;
                // Draw the bands into the canvas.
                if(result.length === 1) {
                    rBand = result[0];
                    gBand = result[0];
                    bBand = result[0];
                } else {
                    // Stretch min max to 0 to 255
                    rBand = result[0];
                    gBand = result[1];
                    bBand = result[2];
                }

                const dataArray = [];
                rBand.forEach((red, index) => {
                    const green = gBand[index];
                    const blue = bBand[index];

                    // 100 % means difference between max and min but probably for the whole image.
                    const redBandValue = ((red - 0.124471) / (0.193829 - 0.124471)) * 255;
                    const greenBandValue = ((green - 0.134592) / (0.180243 - 0.134592)) * 255;
                    const blueBandValue = ((blue - 0.146628) / (0.190304 - 0.146628)) * 255;

                    dataArray.push(redBandValue, greenBandValue, blueBandValue, 255);
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

                    tile.loading = false;

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