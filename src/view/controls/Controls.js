import WorldWind from '@nasaworldwind/worldwind';

import './Controls.css';
import tiltLess from './temp-icon-tilt-less.svg';
import tiltMore from './temp-icon-tilt-more.svg';

const ArgumentError = WorldWind.ArgumentError,
    Logger = WorldWind.Logger;

/**
 * Constructs a view controls layer.
 * @alias Controls
 * @constructor
 * @param {WorldWindow} worldWindow The World Window associated with these controls.
 * @param {String} id Id of the element to generate the Controls into.
 * @throws {ArgumentError} If the specified world window is null or undefined.
 */
class Controls {
    constructor(worldWindow, id) {
        if (!worldWindow) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "Controls", "constructor", "missingWorldWindow"));
        }

        if (!id) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "Controls", "constructor", "missingId"));
        }

        /**
         * The World Window associated with controls.
         * @type {WorldWindow}
         * @readonly
         */
        this.wwd = worldWindow;

        /**
         * The incremental amount to increase or decrease the eye distance (for zoom) each cycle.
         * @type {Number}
         * @default 0.04 (4%)
         */
        this.zoomIncrement = 0.04;

        /**
         * The incremental amount to increase or decrease the heading each cycle, in degrees.
         * @type {Number}
         * @default 1.0
         */
        this.headingIncrement = 1.0;

        /**
         * The incremental amount to increase or decrease the tilt each cycle, in degrees.
         * @type {Number}
         */
        this.tiltIncrement = 1.0;

        const html = Controls.build();
        document.getElementById(id).insertAdjacentHTML('beforeend', html);

        // Establish event handlers.
        this.setupInteraction();
    };

    /**
     * Prepare the html to be displayed.
     * @return {String}
     */
    static build() {
        return `
            <div class="control-group">
                <div id="map-controls">
                    <div class="zoom-control control">
                        <a href="#" id="zoom-plus-control"><i class="fa fa-plus"></i></a>
                        <a href="#" id="zoom-minus-control"><i class="fa fa-minus"></i></a>
                    </div>
                    <div class="rotate-control control">
                        <a href="#" id="rotate-right-control"><i class="fa fa-rotate-right"></i></a>
                        <a href="#" id="rotate-left-control"><i class="fa fa-rotate-left"></i></a>
                    </div>
                    <div class="tilt-control control">
                        <a href="#" id="tilt-more-control" style="background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(tiltMore)}')"></a>
                        <a href="#" id="tilt-less-control" style="background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(tiltLess)}')"></a>
                    </div>
                </div>
            </div>
        `;
    }

    setupInteraction() {
        document.getElementById('zoom-plus-control').addEventListener('mouseup', this.handleZoomIn.bind(this));
        document.getElementById('zoom-minus-control').addEventListener('mouseup', this.handleZoomOut.bind(this));
        document.getElementById('tilt-more-control').addEventListener('mouseup', this.handleTiltUp.bind(this));
        document.getElementById('tilt-less-control').addEventListener('mouseup', this.handleTiltDown.bind(this));
        document.getElementById('rotate-right-control').addEventListener('mouseup', this.handleHeadingRight.bind(this));
        document.getElementById('rotate-left-control').addEventListener('mouseup', this.handleHeadingLeft.bind(this));
    };

    /**
     * Decrease the distance to the LookAt point by 4%
     */
    handleZoomIn() {
        this.wwd.navigator.range *= (1 - this.zoomIncrement);
        this.wwd.redraw();
    };

    /**
     * Increase the distance to the LookAt point by 4%
     */
    handleZoomOut() {
        this.wwd.navigator.range *= (1 + this.zoomIncrement);
        this.wwd.redraw();
    };

    /**
     * Rotate the globe to the right by 1 degree
     */
    handleHeadingRight() {
        this.wwd.navigator.heading -= this.headingIncrement;
        this.wwd.redraw();
    };

    /**
     * Rotate the globe to the left by 1 degree
     */
    handleHeadingLeft() {
        this.wwd.navigator.heading += this.headingIncrement;
        this.wwd.redraw();
    };

    /**
     * Tilt the globe up by 1 degree
     */
    handleTiltUp() {
        this.wwd.navigator.tilt = Math.max(0, this.wwd.navigator.tilt - this.tiltIncrement);
        this.wwd.redraw();
    };

    /**
     * Tilt the globe down by 1 degree
     */
    handleTiltDown() {
        this.wwd.navigator.tilt = Math.min(90, this.wwd.navigator.tilt + this.tiltIncrement);
        this.wwd.redraw();
    };
}

export default Controls;