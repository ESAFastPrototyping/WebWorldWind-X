import WorldWind from 'webworldwind-esa';
import {fromUrl} from 'geotiff/src/main';

const Location = WorldWind.Locations,
    Sector = WorldWind.Sector,
    TiledImageLayer = WorldWind.TiledImageLayer,
    WWUtil = WorldWind.WWUtil;

class COGTiledLayer extends TiledImageLayer {
    constructor(geoTiff, increment, sector, numLevels, resolutions) {
        super(sector, increment, numLevels, 'image/png', 'COGTiledLayer ' + WWUtil.guid(), 256, 256);

        this.geoTiff = geoTiff;
        this.resolutions = resolutions;
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

            const resolution = this.resolutions[tile.level.levelNumber];
            const sector = tile.sector;
            // bbox is based on the current data
            this.geoTiff.readRasters({
                bbox: [
                    sector.minLatitude,
                    sector.minLongitude,
                    sector.maxLatitude,
                    sector.maxLongitude
                ],
                resX: resolution.x,
                resY: resolution.y
            }).then(result => {
                const tileImage = new Image();

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx2d = canvas.getContext('2d');
                const rBand = result[0];
                const gBand = result[1];
                const bBand = result[2];

                // Reproject to relevant projection from WGS84.

                // Draw the bands into the canvas.

                var texture = layer.createTexture(dc, tile, tileImage);
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

    static async fromUrl(url) {
        const geoTiff = await fromUrl(url);
        const numLevels = await geoTiff.getImageCount();
        const image = await geoTiff.getImage();
        const boundingBox = await image.getBoundingBox();

        // Build resolutions.
        const resolutions = [];
        resolutions[0] = {
            x: (boundingBox[2] - boundingBox[0]) / image.getWidth(),
            y: (boundingBox[3] - boundingBox[1]) / image.getHeight()
        };

        for(let i = 1; i < numLevels; i++) {
            const image = await geoTiff.getImage(i);

            resolutions[i] = {
                x: (boundingBox[2] - boundingBox[0]) / image.getWidth(),
                y: (boundingBox[3] - boundingBox[1]) / image.getHeight()
            }
        }

        return new COGTiledLayer(geoTiff,
            new Location(boundingBox[2] - boundingBox[0], boundingBox[3] - boundingBox[1]),
            new Sector(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]),
            numLevels,
            resolutions);
    }
}

export default COGTiledLayer;