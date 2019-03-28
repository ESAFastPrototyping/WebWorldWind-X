import WorldWind from 'webworldwind-esa';
import TexturedSurfaceShape from './TexturedSurfaceShape';

const SurfacePolygon = WorldWind.SurfacePolygon;

/**
 * @exports TexturedSurfacePolygon
 */
class TexturedSurfacePolygon extends TexturedSurfaceShape {
    /**
     * Constructs Textured Surface Polygon. The polygon is drawn using the standard attributes. Unlike the standard
     * surface polygon it draws associated image on the area of the polygon.
     * @param boundaries {Location[]} Array of locations enclosing the surface polygon.
     * @param attributes {ShapeAttributes} Attributes used for the styling of the Surface Polygon
     */
    constructor(boundaries, attributes) {
        super(attributes);

        if (!Array.isArray(boundaries)) {
            throw new Error('TexturedSurfacePolygon - constructor - The specified boundary is not an array.');
        }

        /**
         * Boundaries relevant for the current polygon.
         * @type {Location[]}
         * @memberof TexturedSurfacePolygon.prototype
         * @public
         */
        this.boundaries = boundaries;

        this._stateId = SurfacePolygon.stateId++;
    }

    get boundaries() {
        return this._boundaries;
    }

    set boundaries(boundaries) {
        if (!Array.isArray(boundaries)) {
            throw new Error('TexturedSurfacePolygon - set boundaries - The specified boundary is not an array.');
        }

        this.resetBoundaries();
        this._boundaries = boundaries;
        this._stateId = SurfacePolygon.stateId++;
        this.stateKeyInvalid = true;
    }

    /**
     * @inheritDoc
     */
    computeStateKey() {
        return TexturedSurfacePolygon.staticStateKey(this);
    }

    /**
     * @inheritDoc
     */
    computeBoundaries(dc) {
    }

    static staticStateKey(shape) {
        return SurfacePolygon.staticStateKey(shape) + " pg " + shape._stateId;
    }
}

export default TexturedSurfacePolygon;