import WorldWind from 'webworldwind-esa';

const {
    Color,
    Renderable,
    ShapeAttributes,
    TriangleMesh
} = WorldWind;

import utils from '../util/eo/utils';

class SwathCone extends Renderable {
    /**
     *
     * @param satellite {Object|{currentPosition, nextPosition, currentHeading, nextHeading}}
     * @param color
     * @param translateDistance
     * @param swathWidth
     * @param swathHeight controls how big the swath is, higher values means a smaller swath
     */
    constructor(satellite, color, translateDistance, swathWidth, swathHeight = 35) {
        super();

        this._swathWidth = swathWidth;
        this._swathHeight = swathHeight;
        this._translateDistance = translateDistance;

        const mesh = new TriangleMesh(this.positions(satellite), [
            0, 1, 2,
            0, 2, 3,
            0, 3, 4,
            0, 4, 1,
        ], this.meshAttributes(
            new Color(color.red, color.green, color.blue, 0.1),
            new Color(color.red, color.green, color.blue, 0.6)
        ));
        mesh.outlineIndices = [
            0, 1, 2, 3, 4, 0, 3, 2, 0, 1, 4
        ];
        this._mesh = mesh;
    }

    update(satellite) {
        this._mesh.positions = this.positions(satellite);
    }

    positions(satellite) {
        if(!this._translateDistance) {
            satellite.origin = satellite.currentPosition;
            satellite.heading = satellite.currentHeading;
        }

        const {
            origin,
            heading
        } = this._translateDistance && this.translateOrigin(satellite, this._translateDistance) || satellite;
        const {
            currentPosition
        } = satellite;

        const satPosition = {
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
            altitude: currentPosition.altitude - 10000
        };

        const positions = [satPosition];
        for(let i = 0; i < 4; i++) {
            const headingForPosition = i % 2 ?
                45 + 90 * i - heading - this._swathHeight:
                45 + 90 * i - heading + this._swathHeight;
            positions.push(
                utils.projectPosition(origin, headingForPosition, this._swathWidth),
            );
        }

        return positions;
    }

    render(dc) {
        if(!this.enabled) {
            return;
        }

        this._mesh.render(dc);
    }

    translateOrigin(satellite, translateDistance) {
        const origin = utils.projectPosition(satellite.currentPosition, 90 - satellite.currentHeading, translateDistance);
        const nextOrigin = utils.projectPosition(satellite.nextPosition, 90 - satellite.nextHeading, translateDistance);
        const headingRad = utils.headingAngleRadians(origin.latitude, origin.longitude, nextOrigin.latitude,
            nextOrigin.longitude);

        return {
            origin: origin,
            heading: utils.rad2deg(headingRad)
        };
    }

    /**
     * Prepare Mesh Attributes
     * @private
     * @param outlineColor
     * @param interiorColor
     */
    meshAttributes(outlineColor, interiorColor) {
        const pyramidAttributes = new ShapeAttributes(null);
        pyramidAttributes.drawInterior = true;
        pyramidAttributes.drawOutline = true;
        pyramidAttributes.outlineColor = outlineColor;
        pyramidAttributes.interiorColor = interiorColor;
        pyramidAttributes.depthTest = true;
        pyramidAttributes.applyLighting = true;
        return pyramidAttributes;
    }
}

export default SwathCone;