import WorldWind from 'webworldwind-esa';

const {
    ABSOLUTE,
    Color,
    Renderable,
    Path,
    ShapeAttributes
} = WorldWind;

import utils from '../util/eo/utils';

/**
 * @exports Orbits
 */
class Orbits extends Renderable {
    /**
     * Constructs Orbits displaying the past and future position. The positions are calculated from the satrec. The
     * orbits are displayed from now back to past and
     * @param satrec {Object} SDG format representing the satellite.
     * @param time {Date} Date for which the orbits will be displayed.
     * @param timeWindow {Number} Amount of milliseconds for the time window.
     * @param orbitPoints {Number} Amount of the Panther.
     */
    constructor(satrec, time = new Date(), timeWindow = 2 * 540000, orbitPoints = 720) {
        super();

        if(!satrec) {
            throw new Error('Orbits#constructor Satellite Record is missing.');
        }

        this._satrec = satrec;

        this._timeWindow = timeWindow;
        this._orbitPoints = orbitPoints;

        this._pastTrail = this.trail(this.trailAttributes(new Color(213 / 255, 214  / 255, 210 / 255, 1)));
        this._futureTrail = this.trail(this.trailAttributes(new Color(1, 1, 0, 1)));

        this._currentTime = time;
        this._previousTime = time;

        this.populate();
    }

    /**
     * Update information about when and where the satellite was. It fully rebuilds the positions for the trails.
     * @param satelliteRecord SPG format representing the satellite.
     */
    satrec(satelliteRecord) {
        if(!satelliteRecord) {
            throw Error('No satellite record was provided');
        }
        this._satrec = satelliteRecord;
        // This must signalize somehow that it needs to be recalculated.

        this.populate();
    }

    /**
     * Update current time for this set of orbits.
     * @param time {Date} Current date for the satellite.
     */
    time(time) {
        if(!time) {
            throw Error('No time was provided');
        }
        this._previousTime = this._currentTime;
        this._currentTime = time;

        this.update();
    }

    /**
     * Renders all trails belonging to this Orbit if it is enabled.
     * @param dc {DrawContext} Shared state for one rendering.
     */
    render(dc) {
        if(!this.enabled) {
            return;
        }

        this._pastTrail.render(dc);
        this._futureTrail.render(dc);
    }

    /**
     * Updates the trails associated with this Orbit based on the current time and satrec. If there is no change in
     * either of these parameters nothing changes.
     * @param force {Boolean} If force, recalculate all positions
     * @private
     */
    update(force = false) {
        const now = this._currentTime.getTime();
        const previousTime = this._previousTime.getTime();
        const change = now - previousTime;
        if(change === 0 && !force) {
            return;
        }

        if(force) {
            this.populate();
            return;
        }

        const isInFuture = change > 0;

        const tick = Math.floor(this._timeWindow / this._orbitPoints);
        let positionsToReplace = Math.ceil(Math.abs(now - previousTime) / tick);
        if(positionsToReplace > this._orbitPoints) {
            this.populate();
            return;
        }

        if(isInFuture) {
            this._pastTrail.positions.pop();

            // Add to the start date.
            const startDate = (now + (this._timeWindow / 2)) - (positionsToReplace * tick);
            const positionsToTransfer = [];
            const positionsToAdd = [];
            for(let positionIndex = 0; positionIndex < positionsToReplace; positionIndex++) {
                const time = new Date(startDate + positionIndex * tick);
                const position = utils.getOrbitPositionWithPositionalData(this._satrec, time).position;
                position.time = time.getTime();

                this._pastTrail.positions.shift();

                positionsToTransfer.push(this._futureTrail.positions.shift());
                positionsToAdd.push(position);
            }

            this._pastTrail.positions = this._pastTrail.positions.concat(positionsToTransfer);
            this._futureTrail.positions = this._futureTrail.positions.concat(positionsToAdd);

            this._pastTrail.positions.push(this._futureTrail.positions[0]);
        } else {
            const startDate = now - (this._timeWindow / 2);
            const positionsToTransfer = [];
            const positionsToAdd = [];
            for(let positionIndex = 0; positionIndex < positionsToReplace; positionIndex++) {
                const time = new Date(startDate + positionIndex * tick);
                const position = utils.getOrbitPositionWithPositionalData(this._satrec, time).position;
                position.time = time.getTime();

                this._futureTrail.positions.pop();

                positionsToTransfer.push(this._pastTrail.positions.pop());
                positionsToAdd.push(position);
            }

            this._futureTrail.positions = positionsToTransfer.concat(this._futureTrail.positions);
            this._pastTrail.positions = positionsToAdd.concat(this._pastTrail.positions);
        }
    }

    populate() {
        const now = this._currentTime.getTime();
        const startDate = now - (this._timeWindow / 2);
        const tick = Math.floor(this._timeWindow / this._orbitPoints);

        const futurePositions = [];
        const pastPositions = [];
        for(let positionIndex = 0; positionIndex < this._orbitPoints; positionIndex++) {
            const time = new Date(startDate + positionIndex * tick);
            const position = utils.getOrbitPositionWithPositionalData(this._satrec, time).position;
            position.time = time.getTime();

            if(positionIndex < this._orbitPoints / 2) {
                pastPositions.push(position);
            } else if(positionIndex === this._orbitPoints / 2) {
                pastPositions.push(position);
                futurePositions.push(position);
            } else {
                futurePositions.push(position);
            }
        }

        this._pastTrail.positions = pastPositions;
        this._futureTrail.positions = futurePositions;
    }

    /**
     * Create the relevant shape which is used to display the orbit on the globe.
     * @private
     * @param attributes
     */
    trail(attributes) {
        const trail = new Path([]);
        trail.enabled = true;
        trail.altitudeMode = ABSOLUTE;
        trail.numSubSegments = 1;
        trail.attributes = attributes;
        return trail;
    }

    /**
     * Create attributes for the proper visualization of the Orbit in more than one color.
     * @private
     * @param color
     */
    trailAttributes(color) {
        const attributes = new ShapeAttributes(null);
        attributes.outlineColor = color;
        attributes.outlineWidth = 1;
        attributes.drawOutline = true;
        attributes.drawInterior = false;
        return attributes;
    }
}

export default Orbits;