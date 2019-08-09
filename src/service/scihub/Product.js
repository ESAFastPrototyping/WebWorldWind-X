import QuickLook from "./QuickLook";
import WorldWind from 'webworldwind-esa';
import TexturedSurfacePolygon from '../../shapes/TexturedSurfacePolygon';

const {
    Color,
    ShapeAttributes,
    Wkt
} = WorldWind;

export default class Product {
    constructor(fetch, entry) {
        if(!entry || !entry.id || !fetch) {
            throw new Error(`Product#constructor Provided entry is either null or invalid. Entry ${entry}`);
        }

        this._id = entry.id;
        this._entry = entry;

        // Renderable related information
        this._footprint = entry.str && entry.str.footprint && entry.str.footprint || null;
        const icons = entry.link && entry.link.length > 0 &&
            entry.link.filter(link => link.rel && link.rel === 'icon') || [];
        const iconUrl = icons.length > 0 && icons[0].href || null;
        if(iconUrl) {
            this._icon = new QuickLook(iconUrl, fetch);
        } else {
            this._icon = null;
        }
    }

    /**
     * Unique identifier of the specific product
     * @returns {String} UUID of the given product
     */
    id() {
        return this._id;
    }

    /**
     * The whole entry related to this product.
     * @returns {Object} Entry representing the product.
     */
    metadata() {
        return this._entry;
    }

    /**
     * Renderable for displaying this Product including QuickLook or null, if this wouldn't make any sense.
     * It doesn't make sense when no footprint is provided.
     * @returns {Promise<Renderable>}
     */
    async renderable() {
        if(!this._footprint) {
            return Promise.resolve(null);
        }

        let boundaries = [];
        new Wkt(this._footprint).load((wkt, objects) => {
            objects.forEach(object => {
                object.shapes().forEach(shape => {
                    boundaries = shape._boundaries;
                });
            });
        });
        const renderable = new TexturedSurfacePolygon(boundaries, this.footprintAttributes());
        if(this._icon) {
            try {
                renderable.image = await this._icon.icon();
            } catch (e) {
                console.log('ERROR: Product#renderable ', e);
                renderable.error = e;
            }
        }
        return renderable;
    }

    /**
     * The default attributes to be used for the Footprint.
     * @return {ShapeAttributes} Attributes for the footprint shapes
     */
    footprintAttributes() {
        const shapeAttributes = new ShapeAttributes(null);
        shapeAttributes.drawOutline = true;
        shapeAttributes.drawInterior = true;
        shapeAttributes.outlineColor = new Color(1, 0, 0, 1);
        shapeAttributes.interiorColor = new Color(1, 1, 0, 0.3);
        shapeAttributes.outlineWidth = 1;
        return shapeAttributes;
    }
}