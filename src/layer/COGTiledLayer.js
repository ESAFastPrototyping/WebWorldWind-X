import WorldWind from 'webworldwind-esa';

const Sector = WorldWind.Sector,
    TiledImageLayer = WorldWind.TiledImageLayer,
    WWUtil = WorldWind.WWUtil;

/**
 * The Tiled Layer working in the context of the CloudOptimisedGeotiffs.
 */
class COGTiledLayer extends TiledImageLayer {
    constructor(geoTiff, levelZeroDelta, sector, numLevels, tileHeight, tileWidth, pool) {
        super(sector, levelZeroDelta, numLevels, 'image/png', 'COGTiledLayer ' + WWUtil.guid(), tileWidth, tileHeight);

        this.pool = pool;
        this.geoTiff = geoTiff;

        this.tileHeight = tileHeight;
        this.tileWidth = tileWidth;

        this.queue = new Queue(16);
    }

    /**
     * @inheritDoc
     * The COGs usually don't fit properly to the standard tile schema of WebWorldWind. Prepare top level tiles reflecting
     * the COG schema
     */
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

    loadTiff(dc, tile, suppressRedraw, bbox) {
        this.queue.addTask(taskResolved => {
            this.geoTiff.readRasters({
                bbox: bbox,
                width: this.tileWidth,
                height: this.tileHeight,
                pool: this.pool
            }).then(result => {
                this.processLoadedGeotiff(dc, tile, suppressRedraw, result);

                taskResolved();
            }).catch(error => {
                tile.loading = false;
                taskResolved();
            });
        });
    }

    /**
     * @inheritDoc
     * Read the specific tile in specific resolution from the Cloud Optimised Geotiff.
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

            var sector = tile.sector;

            this.loadTiff(dc, tile, suppressRedraw, [
                sector.minLongitude,
                sector.minLatitude,
                sector.maxLongitude,
                sector.maxLatitude
            ]);
        }
    }

    processLoadedGeotiff(dc, tile, suppressRedraw, result) {
        var imagePath = tile.imagePath,
            cache = dc.gpuResourceCache,
            layer = this;

        const dataArray = this.bandsToCanvasData(result);
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
    }

    /**
     * Converts the raw bands received from the GeoTIFF parsing into the RGB data to be drawn to the Canvas.
     * The default implementation simply draws the first three bands without any transformations.
     * @param result {Array} Array of bands present in the image.
     * @returns {Array} RGBA array.
     */
    bandsToCanvasData(result) {
        const rBand = result[0];
        const gBand = result[1];
        const bBand = result[2];

        const dataArray = [];
        rBand.forEach((red, index) => {
            const green = gBand[index];
            const blue = bBand[index];

            dataArray.push(red, green, blue, 255);
        });

        return dataArray;
    }
}

class Queue {
    constructor(maxRunning) {
        this.tasks = [];
        this.currentlyRunning = 0;
        this.maxRunning = maxRunning;

        this.taskResolved = this.taskResolved.bind(this);
    }

    addTask(task) {
        if(this.currentlyRunning < this.maxRunning) {
            this.currentlyRunning++;
            task(this.taskResolved);
        } else {
            this.tasks.push(task);
        }
    }

    taskResolved() {
        this.currentlyRunning--;

        if(this.currentlyRunning < this.maxRunning) {
            if(this.tasks.length > 0) {
                this.currentlyRunning++;
                const newTask = this.tasks.shift();

                newTask(this.taskResolved);
            }
        }
    }
}

export default COGTiledLayer;