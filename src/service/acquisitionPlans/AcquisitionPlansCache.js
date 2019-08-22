export class AcquisitionPlansCache {

    /**
     * @typedef {{ satName: String, url: String, startDate: Date, endDate: Date, outlines: Renderable[], interiors: Renderable[] }} acquisitionPlanEntry
     */

    /**
     * @alias AcquisitionPlansCache
     * @constructor
     * @param {String[]} satNames  The satellite names for the acquisition plan. The convention is to use the short name: ["s1a", "s1b", "s2a", "s2b"].
     */
    constructor(satNames) {
        this.satNames = satNames;

        for (const satName of satNames) {
            /**
             * @type {acquisitionPlanEntry[]}
             */
            this[satName] = [];
        }
    }

    /**
     * Adds a new acquisition plan entry.
     * 
     * @param {acquisitionPlanEntry} entry 
     */
    add(entry) {
        const entries = this.getEntries(entry.satName);

        if (!entries) {
            return;
        }

        if (this.has(entries, entry.url)) {
            return;
        }

        entries.push(entry);

        this.removeOverlaps(entries);
    }

    /**
     * Checks if a list of acquisition plan entries has the specified url. 
     * 
     * @param {acquisitionPlanEntry[]} entries 
     * @param {String} url 
     * 
     * @returns {Boolean}
     */
    has(entries, url) {
        return entries.some(entry => entry.url === url);
    }

    /**
     * Gets the entries for the specified satellite.
     * 
     * @param {String} satName 
     * 
     * @returns {acquisitionPlanEntry[]}
     */
    getEntries(satName) {
        return this[satName];
    }

    /**
     * Removes overlaping entries.
     * 
     * @param {acquisitionPlanEntry[]} entries
     */
    removeOverlaps(entries) {
        if (entries.length < 2) {
            return;
        }

        entries.sort((a, b) => b.startDate - a.startDate);

        for (var i = 1; i < entries.length; i++) {
            var latest = entries[i - 1];
            var previous = entries[i];
            var isOverlap = (latest.startDate < previous.endDate);
            if (isOverlap) {
                this.removeOverlapingFootprints(previous, latest.startDate);
            }
        }

        for (i = entries.length - 1; i >= 0 ; i--) {
            var entry = entries[i];
            if (!entry.outlines.length && !entry.interiors.length) {
                entries.splice(i, 1);
            }
        }
    }

    /**
     * Removes overlaping footprints.
     * 
     * @param {acquisitionPlanEntry} entry
     * @param {Date} timeLimit
     */
    removeOverlapingFootprints(entry, timeLimit) {
        const outlines = [];
        const interiors = [];
        
        for (let i = 0, len = entry.outlines.length; i < len; i++) {
            let renderable = entry.outlines[i];
            if (renderable.kmlProps.endDate <= timeLimit) {
                outlines.push(renderable);
            }
        }

        for (let i = 0, len = entry.interiors.length; i < len; i++) {
            let renderable = entry.interiors[i];
            if (renderable.kmlProps.endDate <= timeLimit) {
                interiors.push(renderable);
            }
        }

        entry.outlines = outlines;
        entry.interiors = interiors;
        
        entry.outlines.sort((a, b) => a.kmlProps.startDate - b.kmlProps.startDate);
        entry.interiors.sort((a, b) => a.kmlProps.startDate - b.kmlProps.startDate);
        
        let lastFootprint;
        if (outlines.length) {
            lastFootprint =  outlines[outlines.length - 1];
        }
        else if (interiors.length) {
            lastFootprint =  interiors[interiors.length - 1];
        }

        if (lastFootprint) {
            entry.endDate = lastFootprint.kmlProps.endDate;
        }
    }

}