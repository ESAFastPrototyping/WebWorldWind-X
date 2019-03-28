import WorldWind from 'webworldwind-esa';
import TexturedSurfacePolygon from '../../../shapes/TexturedSurfacePolygon';

const KmlGroundOverlay = WorldWind.KmlGroundOverlay,
    Location = WorldWind.Location,
    Sector = WorldWind.Sector,
    ShapeAttributes = WorldWind.ShapeAttributes,
    SurfaceImage = WorldWind.SurfaceImage;

/**
 * Constructs an KmlGroundOverlay. Applications usually don't call this constructor. It is called by {@link
 * KmlFile} as objects from Kml file are read. This object is already concrete implementation.
 *
 * Properly displays non square Ground Overlays defined via LatLonQuad.
 * @alias KmlGroundOverlayFull
 * @classdesc Contains the data associated with GroundOverlay node.
 * @see https://developers.google.com/kml/documentation/kmlreference#groundoverlay
 * @augments KmlGroundOverlay
 */
class KmlGroundOverlayFull extends KmlGroundOverlay {
    /**
     * @inheritDoc
     */
    render(dc, kmlOptions) {
        super.render(dc, kmlOptions);

        if(!this._renderable && this.enabled) {
            if(this.kmlIcon) {
                if(this.kmlLatLonBox) {
                    this._renderable = new SurfaceImage(
                        new Sector(
                            this.kmlLatLonBox.kmlSouth,
                            this.kmlLatLonBox.kmlNorth,
                            this.kmlLatLonBox.kmlWest,
                            this.kmlLatLonBox.kmlEast
                        ),
                        this.kmlIcon.kmlHref(kmlOptions.fileCache)
                    );
                } else if(this.kmlLatLonQuad) {
                    const coordinates = this.kmlLatLonQuad.kmlCoordinates.split(' ');
                    const boundaries = coordinates.map(coordinates => {
                        const coordinate = coordinates.split(',');
                        return new Location(coordinate[1], coordinate[0]);
                    });

                    const texture = new Image();
                    texture.src = this.kmlIcon.kmlHref(kmlOptions.fileCache);

                    this._renderable = new TexturedSurfacePolygon(boundaries, new ShapeAttributes());
                    this._renderable.image = texture;
                }

                dc.redrawRequested = true;
            }
        }

        if(this._renderable) {
            this._renderable.render(dc);
        }
    }
}

export default KmlGroundOverlayFull;

