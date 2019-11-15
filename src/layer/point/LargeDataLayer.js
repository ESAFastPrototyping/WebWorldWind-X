import WorldWind from 'webworldwind-esa';
import {QuadTree, Box, Point, Circle} from 'js-quadtree';
import LargeDataLayerTile from "./LargeDataLayerTile";

const {
    Location,
    REDRAW_EVENT_TYPE,
    Sector,
    SurfaceCircle,
    TiledImageLayer
} = WorldWind;

// It supports GeoJSON as format with only points and maximum 1 000 000 points.
// TODO: Highlight the selected points.
class LargeDataLayer extends TiledImageLayer {
    constructor(wwd, renderableLayer, url) {
        super(new Sector(-90, 90, -180, 180), new Location(45, 45), 18, 'image/png', 'large-data-layer', 256, 256);
        this.tileWidth = 256;
        this.tileHeight = 256;
        this.renderableLayer = renderableLayer;

        // At the moment the URL must contain the GeoJSON.
        this.processedTiles = {};
        this.quadTree = new QuadTree(new Box(0,0,360,180));

        fetch(url).then(data => {
            return data.json();
        }).then(file => {
            if(file.features.length > 1000000) {
                throw new Error('Too many features.');
            }

            file.features.forEach(feature => {
                this.quadTree.insert(
                    new Point(feature.geometry.coordinates[0] + 180, feature.geometry.coordinates[1] + 90, feature.properties)
                );
            });
        });

        this.onClick = this.onClick.bind(this, wwd);
        this.onMouseMove = this.onMouseMove.bind(this, wwd);
        wwd.addEventListener('click', this.onClick);
        wwd.addEventListener('mousemove', this.onMouseMove);
    }

    handleEvent(wwd, event) {
        const x = event.touches && event.touches[0] && event.touches[0].clientX || event.clientX,
            y = event.touches && event.touches[0] && event.touches[0].clientY || event.clientY;

        const terrainObject = wwd.pickTerrain(wwd.canvasCoordinates(x, y)).terrainObject();
        const position = terrainObject.position;

        const points = this.quadTree.query(new Circle(position.longitude + 180, position.latitude + 90, 0.0001));
        if(this.renderableLayer) {
            this.renderableLayer.removeAllRenderables();
            if(points.length > 0) {
                this.renderableLayer.addRenderable(
                    new SurfaceCircle(new Location(points[0].y - 90, points[0].x - 180), Math.sqrt(points[0].data["PERIMETER"]))
                );
            }
            wwd.redraw();
        }

        return points;
    }

    onMouseMove(wwd, event) {
        this.onMouseMoveResult(this.handleEvent(wwd, event));
    }

    onClick(wwd, event) {
        this.onClickResult(this.handleEvent(wwd, event));
    }

    onClickResult(points){}

    onMouseMoveResult(points) {}

    retrieveTileImage(dc, tile, suppressRedraw) {
        if(tile.level.levelNumber < 14 || this.processedTiles[tile.imagePath]){
            return;
        }
        this.processedTiles[tile.imagePath] = true;

        const sector = tile.sector;
        const extended = this.calculateExtendedSector(sector, 0.2, 0.2);
        const extendedWidth = Math.ceil(extended.extensionFactorWidth * this.tileWidth);
        const extendedHeight = Math.ceil(extended.extensionFactorHeight * this.tileHeight);

        const points = this.filterGeographically(extended.sector);

        if(points.length > 0) {
            var imagePath = tile.imagePath,
                cache = dc.gpuResourceCache,
                layer = this;

            var canvas = this.createPointTile(points, {
                sector: extended.sector,

                width: this.tileWidth + 2 * extendedWidth,
                height: this.tileHeight + 2 * extendedHeight
            }).canvas();

            var result = document.createElement('canvas');
            result.height = this.tileHeight;
            result.width = this.tileWidth;
            result.getContext('2d').putImageData(
                canvas.getContext('2d').getImageData(extendedWidth, extendedHeight, this.tileWidth, this.tileHeight),
                0, 0
            );

            var texture = layer.createTexture(dc, tile, result);
            layer.removeFromCurrentRetrievals(imagePath);

            if (texture) {
                cache.putResource(imagePath, texture, texture.size);

                layer.currentTilesInvalid = true;
                layer.absentResourceList.unmarkResourceAbsent(imagePath);

                if (!suppressRedraw) {
                    // Send an event to request a redraw.
                    const e = document.createEvent('Event');
                    e.initEvent(REDRAW_EVENT_TYPE, true, true);
                    window.dispatchEvent(e);
                }
            }
        }
    }

    filterGeographically(sector) {
        const width = sector.maxLongitude - sector.minLongitude;
        const height = sector.maxLatitude - sector.minLatitude;
        return this.quadTree.query(new Box(
            sector.minLongitude + 180,
            sector.minLatitude + 90,
            width,
            height
        ));
    }

    calculateExtendedSector(sector, extensionFactorWidth, extensionFactorHeight) {
        var latitudeChange = (sector.maxLatitude - sector.minLatitude) * extensionFactorHeight;
        var longitudeChange = (sector.maxLongitude - sector.minLongitude) * extensionFactorWidth;
        return {
            sector: new Sector(
                sector.minLatitude - latitudeChange,
                sector.maxLatitude + latitudeChange,
                sector.minLongitude - longitudeChange,
                sector.maxLongitude + longitudeChange
            ),
            extensionFactorHeight: extensionFactorHeight,
            extensionFactorWidth: extensionFactorWidth
        };
    };

    createPointTile(data, options) {
        return new LargeDataLayerTile(data, options);
    };
}

export default LargeDataLayer;