import WorldWind from 'webworldwind-esa';
import './Controls.css';

const ArgumentError = WorldWind.ArgumentError,
    Logger = WorldWind.Logger;

/**
 * Constructs a controls in the top right corner of the given div. Controls zoom, rotation, heading and exaggeration.
 * @alias Controls
 * @constructor
 * @param {Object} options
 * @param {WorldWindow} options.worldWindow The World Window associated with these controls.
 * @param {string} options.mapContainerId Id of the container to draw controls into.
 * @param {string}[options.classes] Optional parameter. List of classes that will be added to the top container for controls.
 *
 * @throws {ArgumentError} If the specified world window is null or undefined or if the Id of the container is null.
 */
class Controls {
    constructor(options) {
        if (!options.worldWindow) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "Controls", "constructor", "missingWorldWindow"));
        }
        if (!options.mapContainerId) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "Controls", "constructor", "missingTarget"));
        }

        if (options.mapContainerId) {
            this._mapContainer = document.querySelector('#' + options.mapContainerId);
        }

        this._classes = options.classes || ['bottom-right'];

        /**
         * The World Window associated with controls.
         * @type {WorldWindow}
         * @readonly
         */
        this.wwd = options.worldWindow;

        /**
         * The incremental vertical exaggeration to apply each cycle.
         * @type {Number}
         * @default 0.01
         */
        this.exaggerationIncrement = 1;

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

        // Render icons
        this.buildIcons();

        // Establish event handlers.
        this.setupInteraction();
    }

    /**
     * Render icons into the document. All icons are represented as SVGs.
     * @private
     */
    buildIcons() {
        const html = `
        <div class="map-controls ${this._classes.join(' ')}">
            <div class="exaggerate-control control">
                <a href="#" class="exaggerate-plus-control">
                    <svg width="18px" height="18px" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"/></svg>
                </a>
                <a href="#" class="exaggerate-minus-control">
                    <svg width="18px" height="18px" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1675 832q0 53-37 90l-651 652q-39 37-91 37-53 0-90-37l-651-652q-38-36-38-90 0-53 38-91l74-75q39-37 91-37 53 0 90 37l294 294v-704q0-52 38-90t90-38h128q52 0 90 38t38 90v704l294-294q37-37 90-37 52 0 91 37l75 75q37 39 37 91z"/></svg>
                </a>
            </div>
            <div class="zoom-control control">
                <a href="#" class="zoom-plus-control">
                    <svg width="18px" height="18px" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1600 736v192q0 40-28 68t-68 28h-416v416q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-416h-416q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h416v-416q0-40 28-68t68-28h192q40 0 68 28t28 68v416h416q40 0 68 28t28 68z"/></svg>
                </a>
                <a href="#" class="zoom-minus-control">
                    <svg width="18px" height="18px" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1600 736v192q0 40-28 68t-68 28h-1216q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h1216q40 0 68 28t28 68z"/></svg>
                </a>
            </div>
            <div class="rotate-control control">
                <a href="#" class="rotate-right-control">
                    <svg width="18px" height="18px" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1664 256v448q0 26-19 45t-45 19h-448q-42 0-59-40-17-39 14-69l138-138q-148-137-349-137-104 0-198.5 40.5t-163.5 109.5-109.5 163.5-40.5 198.5 40.5 198.5 109.5 163.5 163.5 109.5 198.5 40.5q119 0 225-52t179-147q7-10 23-12 15 0 25 9l137 138q9 8 9.5 20.5t-7.5 22.5q-109 132-264 204.5t-327 72.5q-156 0-298-61t-245-164-164-245-61-298 61-298 164-245 245-164 298-61q147 0 284.5 55.5t244.5 156.5l130-129q29-31 70-14 39 17 39 59z"/></svg>
                </a>
                <a href="#" class="rotate-needle-control" style="transform: rotate(-45deg);">
                    <svg width="18px" height="18px" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1593 349l-640 1280q-17 35-57 35-5 0-15-2-22-5-35.5-22.5t-13.5-39.5v-576h-576q-22 0-39.5-13.5t-22.5-35.5 4-42 29-30l1280-640q13-7 29-7 27 0 45 19 15 14 18.5 34.5t-6.5 39.5z"/></svg>
                </a>
                <a href="#" class="rotate-left-control">
                    <svg width="18px" height="18px" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1664 896q0 156-61 298t-164 245-245 164-298 61q-172 0-327-72.5t-264-204.5q-7-10-6.5-22.5t8.5-20.5l137-138q10-9 25-9 16 2 23 12 73 95 179 147t225 52q104 0 198.5-40.5t163.5-109.5 109.5-163.5 40.5-198.5-40.5-198.5-109.5-163.5-163.5-109.5-198.5-40.5q-98 0-188 35.5t-160 101.5l137 138q31 30 14 69-17 40-59 40h-448q-26 0-45-19t-19-45v-448q0-42 40-59 39-17 69 14l130 129q107-101 244.5-156.5t284.5-55.5q156 0 298 61t245 164 164 245 61 298z"/></svg>
                </a>
            </div>
            <div class="tilt-control control">
                <a href="#" class="tilt-more-control">
                    <svg version="1.1" class="icon-tilt-more" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             width="18px" height="18px" viewBox="0 0 511.625 511.627" xml:space="preserve">
        <g>
            <path d="M224.595,201.822h-93.576c-6.879,0-13.674,3.236-15.211,7.307l-24.902,66.025c-2.188,5.797,2.867,10.61,11.34,10.61
                h115.271c8.477,0,15.584-4.813,15.873-10.611l3.295-66.024C236.888,205.057,231.474,201.822,224.595,201.822z"/>
            <path d="M379.204,201.821l-93.574,0.001c-6.879,0-12.293,3.236-12.092,7.307l3.293,66.024c0.291,5.798,7.4,10.611,15.873,10.611
                h115.275c8.473,0,13.525-4.813,11.338-10.611l-24.902-66.024C392.879,205.057,386.081,201.821,379.204,201.821z"/>
            <path d="M419.61,319.696H295.565c-9.117,0-16.227,5.703-15.865,12.927l6.236,125.035c0.586,11.742,10.93,21.594,23.078,21.594
                h165.289c12.148,0,18.283-9.852,13.855-21.594l-47.164-125.035C438.272,325.398,428.727,319.696,419.61,319.696z"/>
            <path d="M214.657,319.696l-124.043,0.001c-9.121,0-18.662,5.702-21.387,12.926L22.065,457.657
                c-4.428,11.742,1.703,21.594,13.855,21.594h165.285c12.152,0,22.492-9.852,23.076-21.594l6.24-125.035
                C230.884,325.399,223.776,319.696,214.657,319.696z"/>
        </g>
        </svg>
                </a>
                <a href="#" class="tilt-less-control">
                    <svg version="1.1" class="icon-tilt-less" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             width="18px" height="18px" viewBox="0 0 511.625 511.627" xml:space="preserve">
        <g>
            <path d="M210.81,37.038H55.599c-11.047,0-20,8.954-20,20v155.211c0,11.046,8.953,20,20,20H210.81c11.045,0,20-8.954,20-20V57.038
                C230.81,45.992,221.854,37.038,210.81,37.038z"/>
            <path d="M454.127,37.038H298.917c-11.047,0-20,8.954-20,20v155.211c0,11.046,8.953,20,20,20h155.211c11.045,0,20-8.954,20-20
                V57.038C474.127,45.992,465.172,37.038,454.127,37.038z"/>
            <path d="M454.127,280.369H298.917c-11.047,0-20,8.954-20,20V455.58c0,11.046,8.953,20,20,20h155.211c11.045,0,20-8.954,20-20
                V300.369C474.127,289.323,465.172,280.369,454.127,280.369z"/>
            <path d="M210.81,280.369H55.599c-11.047,0-20,8.954-20,20V455.58c0,11.046,8.953,20,20,20H210.81c11.045,0,20-8.954,20-20V300.369
                C230.81,289.323,221.854,280.369,210.81,280.369z"/>
        </g>
        </svg>
                </a>
            </div>
        </div>
        `;

        const controlContainer = document.createElement('div');
        controlContainer.innerHTML = html;
        this._mapContainer.append(controlContainer);
    }

    /**
     * Setup mousedown, mouseup and mouseleave Event Listeners.
     * @param htmlElement {HTMLElement} HTML element to attach the listeners to.
     * @param functionToCall {Function} Function to call when the event occurs
     * @private
     */
    setupForInteractions(htmlElement, functionToCall) {
        htmlElement.addEventListener('mousedown', functionToCall);
        htmlElement.addEventListener('mouseup', functionToCall);
        htmlElement.addEventListener('mouselave', functionToCall);
        htmlElement.addEventListener('touchstart', functionToCall);
        htmlElement.addEventListener('touchend', functionToCall);
        htmlElement.addEventListener('touchcancel', functionToCall);
    }

    /**
     * Sets listeners for mouse interactions with all the control elements.
     * @private
     */
    setupInteraction() {
        this.setupForInteractions(this._mapContainer.querySelector(".exaggerate-plus-control"),
            this.handleMouseEvent.bind(this, this.handleExaggeratePlus.bind(this)));

        this.setupForInteractions(this._mapContainer.querySelector(".exaggerate-minus-control"),
            this.handleMouseEvent.bind(this, this.handleExaggerateMinus.bind(this)));

        this.setupForInteractions(this._mapContainer.querySelector(".zoom-plus-control"),
            this.handleMouseEvent.bind(this, this.handleZoomIn.bind(this)));

        this.setupForInteractions(this._mapContainer.querySelector(".zoom-minus-control"),
            this.handleMouseEvent.bind(this, this.handleZoomOut.bind(this)));

        this.setupForInteractions(this._mapContainer.querySelector(".tilt-less-control"),
            this.handleMouseEvent.bind(this, this.handleTiltUp.bind(this)));

        this.setupForInteractions(this._mapContainer.querySelector(".tilt-more-control"),
            this.handleMouseEvent.bind(this, this.handleTiltDown.bind(this)));

        this.setupForInteractions(this._mapContainer.querySelector(".rotate-right-control"),
            this.handleMouseEvent.bind(this, this.handleHeadingRight.bind(this)));

        this.setupForInteractions(this._mapContainer.querySelector(".rotate-left-control"),
            this.handleMouseEvent.bind(this, this.handleHeadingLeft.bind(this)));


        this._mapContainer.querySelector(".rotate-needle-control").addEventListener('mouseup', this.handleHeadingReset.bind(this));
        this.wwd.addEventListener("mousemove", this.handleManualRedraw.bind(this));
    }

    /**
     * The operation continues as long as the button is pushed.
     * @private
     * @param operation {Function} Function to call as long as the operation doesn't end
     * @param e {Event} Event starting the mouse event.
     */
    handleMouseEvent(operation, e) {
        if (
            e.type &&
            (
                (e.type === "mouseup" && e.which === 1) ||
                e.type === "mouseleave" ||
                e.type === "touchend" ||
                e.type === "touchcancel"
            )
        ) {
            this.handleOperationEnd(e);
        } else {
            this.handleOperationStart(operation, e);
        }
    }

    /**
     * Handle the start of the operation and make sure it runs as long as the buttons is pushed.
     * @private
     * @param operation {Function} Function to call as long as the operation doesn't end
     * @param e {Event} Event starting the mouse event.
     */
    handleOperationStart(operation, e) {
        if ((e.type === "mousedown" && e.which === 1) || (e.type === "touchstart")) {
            this.activeOperation = operation;
            e.preventDefault();

            let runOperation = () => {
                if (this.activeOperation) {
                    operation.call(self);
                    setTimeout(runOperation, 50);
                }
            };
            setTimeout(runOperation, 50);
        }
    }

    /**
     * Stops the operation from further repeating.
     * @param e {Event} Event starting the mouse event.
     */
    handleOperationEnd(e) {
        this.activeOperation = null;
        e.preventDefault();
    }

    /**
     * Lessen the difference in height between the places.
     * @private
     */
    handleExaggeratePlus() {
        const wwd = this.wwd;
        wwd.verticalExaggeration += this.exaggerationIncrement;
        wwd.redraw();
    }

    /**
     * Exaggerates the difference in height between the places.
     * @private
     */
    handleExaggerateMinus() {
        const wwd = this.wwd;
        wwd.verticalExaggeration = Math.max(1, wwd.verticalExaggeration - this.exaggerationIncrement);
        wwd.redraw();
    }

    /**
     * Zoom in by given increment.
     * @private
     */
    handleZoomIn() {
        const wwd = this.wwd;
        wwd.navigator.range *= (1 - this.zoomIncrement);
        wwd.redraw();
    }

    /**
     * Zoom out by given increment.
     * @private
     */
    handleZoomOut() {
        const wwd = this.wwd;
        wwd.navigator.range *= (1 + this.zoomIncrement);
        wwd.redraw();
    }

    /**
     * Turn the globe to the right.
     * @private
     */
    handleHeadingRight() {
        const wwd = this.wwd;
        wwd.navigator.heading -= this.headingIncrement;
        wwd.redraw();
        this.redrawHeadingIndicator();
    }

    /**
     * Turn the globe to the left.
     * @private
     */
    handleHeadingLeft() {
        const wwd = this.wwd;
        wwd.navigator.heading += this.headingIncrement;
        wwd.redraw();
        this.redrawHeadingIndicator();
    }

    /**
     * Turn the globe to the up in the right direction.
     * @private
     */
    handleHeadingReset() {
        const wwd = this.wwd;
        let headingIncrement = 1.0;
        if (Math.abs(wwd.navigator.heading) > 60) {
            headingIncrement = 2.0;
        } else if (Math.abs(navigator.heading) > 120) {
            headingIncrement = 3.0;
        }
        if (wwd.navigator.heading > 0) {
            headingIncrement = -headingIncrement;
        }

        let runOperation = () => {
            if (Math.abs(wwd.navigator.heading) > Math.abs(headingIncrement)) {
                wwd.navigator.heading += headingIncrement;
                setTimeout(runOperation, 10);
            } else {
                wwd.navigator.heading = 0;
            }
            wwd.redraw();
            this.redrawHeadingIndicator();
        };
        setTimeout(runOperation, 10);
    }

    /**
     * Change the rotation of the icon representing the turn of the globe to the left or right.
     * @private
     */
    redrawHeadingIndicator() {
        const wwd = this.wwd;
        let initialAngle = 45;
        let currentHeading = wwd.navigator.heading;
        let rotateAngle = 0 - currentHeading - initialAngle;
        this._mapContainer.querySelector(".rotate-needle-control").style.transform = 'rotate(' + rotateAngle + 'deg)';
    }

    /**
     * Tilt the globe up.
     * @private
     */
    handleTiltUp() {
        const wwd = this.wwd;
        wwd.navigator.tilt = Math.max(0, wwd.navigator.tilt - this.tiltIncrement);
        wwd.redraw();
    }

    /**
     * Tilt the globe down.
     * @private
     */
    handleTiltDown() {
        const wwd = this.wwd;
        wwd.navigator.tilt = Math.min(90, wwd.navigator.tilt + this.tiltIncrement);
        wwd.redraw();
    }

    /**
     * When user changes heading by the mouse display it properly on the Control panel as well.
     * @param e {Event} Event on moving the mouse with right button clicked
     */
    handleManualRedraw(e) {
        if (e.which) {
            const wwd = this.wwd;

            // Redraw heading indicator
            this._lastHeading = this._lastHeading || 0;
            if (wwd.navigator.heading !== this._lastHeading) {
                this.redrawHeadingIndicator();
            }
            this._lastHeading = wwd.navigator.heading;
        }
    }
}

export default Controls;