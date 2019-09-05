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
     * @param past {Number} Amount of milliseconds for the time window in past.
     * @param future {Number} Amount of milliseconds for the time window in future.
     */
    constructor(satrec, time = new Date(), past = 540000, future = 540000) {
        super();

        if(!satrec) {
            throw new Error('Orbits#constructor Satellite Record is missing.');
        }

        this._satrec = satrec;

        this._past = past;
        this._future = future;

        this._orbitPoints = 360;
        this._trails = [
            this.trail(this.trailAttributes(new Color(213 / 255, 214  / 255, 210 / 255, 1))),
            this.trail(this.trailAttributes(new Color(1, 1, 0, 1)))
        ];

        this._currentTime = time;
        this._previousTime = time;

        this.update(true);
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

        this.update(true);
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

        this._trails.forEach(trail => {
            trail.render(dc);
        });
    }

    /**
     * Updates the trails associated with this Orbit based on the current time and satrec. If there is no change in
     * either of these parameters nothing changes.
     * @param force {Boolean} If force, recalculate all positions
     * @private
     */
    update(force = false) {
        this.orbit(
            this._trails[0],
            (now, i, tick) => {return new Date(now - i * tick);},
            Math.floor(this._past / this._orbitPoints),
            force);
        this.orbit(
            this._trails[1],
            (now, i, tick) => {return new Date(now + i * tick);},
            Math.floor(this._future / this._orbitPoints),
            force);
    }

    /**
     * Update the positions of trail based on the provided time and the previous time.
     * @private
     * @param trail {Path} Trail representing the orbit to update.
     * @param nextTick {Function} Function that provides us with time of the next tick.
     * @param tick {Number} Milliseconds for each tick.
     * @param force {Boolean} Recreate the whole path if forced.
     */
    orbit(trail, nextTick, tick, force = false) {
        const now = this._currentTime.getTime();
        const previousTime = this._previousTime.getTime();
        const positionsToReplace = !force ? Math.abs(now - previousTime) / tick : this._orbitPoints;
        const startDate = nextTick(now, this._orbitPoints - positionsToReplace, tick).getTime();

        const positions = [];
        for(let i = 0; i < positionsToReplace; i++) {
            // Now is starting with the amount of the time.
            const time = nextTick(startDate, i, tick);
            const position = utils.getOrbitPositionWithPositionalData(this._satrec, time).position;
            position.time = time.getTime();

            positions.push(position);
        }

        trail.positions = trail.positions
            .slice(positionsToReplace)
            .concat(positions);
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