import { AcquisitionPlansCache } from './AcquisitionPlansCache';
import { AcquisitionPlansParser } from './AcquisitionPlansParser';

export class AcquisitionPlans {

    /**
     * @alias AcquisitionPlans
     * @constructor
     * @param {String[]} satNames  The satellite names for the acquisition plan. The convention is to use the short name: ["s1a", "s1b", "s2a", "s2b"].
     * @param {Workers} workers
     */
    constructor(satNames, workers) {
        if (!Array.isArray(satNames)) {
            throw (new Error('AcquisitionPlan - constructor - satNames is not an array'));
        }

        if (!workers) {
            throw (new Error('AcquisitionPlan - constructor - missing workers instance'));
        }

        this.cache = new AcquisitionPlansCache(satNames);

        this.parser = new AcquisitionPlansParser(workers);

        this.lastHighlightedFootprint = null;
    }

    /**
     * Parses an acquisition plan in kml format and adds it to the cache.
     * Footprints that are in the past relatitive to the filterDate will be ignored.
     * Duplicated footprints will be ignored, only the lastest one will be stored.
     * For Sentinel 2 only Noobs Nominal footprints will be parsed.
     * 
     * @public
     * 
     * @param {{ satName: String, url: String, type: String, interior: Boolean, outline: Boolean, outlineAlpha: Number, interiorAlpha: Number, highlightAlpha: Number, filterDate: Date }} fileInfo
     *
     * @param {String} fileInfo.satName The satellite name for the acquisition plan. The convention is to use the short name: "s1a", "s2b", "s5p", etc.
     * @param {String} fileInfo.url The url for the acquisition plan file
     * @param {String} fileInfo.type A type for the web workers. Default is "downloadAndParseKmls"
     * @param {Boolean} fileInfo.interior A flag that indicates if interior renderables should be created. Default is true
     * @param {Boolean} fileInfo.outline A flag that indicates if outline renderables should be created. Default is true
     * @param {Number} fileInfo.outlineAlpha Alpha value fot the outline. Default is 1
     * @param {Number} fileInfo.interiorAlpha Alpha value for the interior. Default is 0.2
     * @param {Number} fileInfo.highlightAlpha Alpha value for the interior highlight. Default is 0.5
     * @param {Date} fileInfo.filterDate An ISODate string used for filtering out shapes that lees than this value. Default is the current date
     * 
     */
    parse(fileInfo) {
        return new Promise((resolve, reject) => {
            this.parser.parse(fileInfo, (err, result) => {
                if (err) {
                    return reject(err);
                }

                this.cache.add(result);
                resolve();
            });
        });
    }

    /**
     * Get all the footprints for a given sattelite and time interval.
     * 
     * @public
     * 
     * @param {{ satName: String, startDate: Date, endDate: Date }} searchOptions
     * @param {String} searchOptions.satName The satellite name. The convention is to use the short name: "s1a", "s2b", "s5p", etc.
     * @param {Date} searchOptions.startDate
     * @param {Date} searchOptions.endDate
     * 
     * @returns {{ outlines: Renderable[], interiors: Renderable[] }}
     */
    getFootprints({ satName, startDate, endDate }) {
        const entries = this.cache.getEntries(satName);

        if (!entries) {
            return { outlines: [], interiors: [] };
        }

        return entries
            .filter(entry => this.timeIntersection(entry.startDate, entry.endDate, startDate, endDate))
            .reduce((acc, entry) => {
                const { outlines, interiors } = this.findRenderablesInEntry(entry, startDate, endDate);

                acc.outlines = acc.outlines.concat(outlines);
                acc.interiors = acc.interiors.concat(interiors);

                return acc;
            }, { outlines: [], interiors: [] });
    }

    /**
     * Toggles the highlight of the provided renderable.
     * If a different footprint renderable is already highlighted it will be unhighlighted.
     * 
     * @public
     * 
     * @param {Renderable} renderable
     */
    toggleHighlight(renderable) {
        if (!renderable || renderable.type !== 'acqPlan') {
            return;
        }

        if (!this.lastHighlightedFootprint) {
            this.lastHighlightedFootprint = renderable;
        }

        if (this.lastHighlightedFootprint !== renderable) {
            this.lastHighlightedFootprint.highlighted = false;
            this.lastHighlightedFootprint = renderable;
        }

        renderable.highlighted = !renderable.highlighted;
    }

    /**
     * Dehighlights of a footprint renderable if it was previously enabled by the toggleHighlight method.
     * 
     * @public
     * 
     * @param {Renderable} renderable
     */
    deHighlight() {
        if (this.lastHighlightedFootprint) {
            this.lastHighlightedFootprint.highlighted = false;
            this.lastHighlightedFootprint = null;
        }
    }

    /**
     * Stops all the web workers associeted with this AcquisitionPlans instance and releases their memory.
     * New workers can still be spwaned after if needed.
     * 
     * @public
     */
    terminateWorkers() {
        this.parser.workers.terminate();
    }

    /**
     * Find all the renderables in an acquisition plan entry by startDate and endDate
     * 
     * @param {acquisitionPlanEntry} entry 
     * @param {Date} startDate 
     * @param {Date} endDate 
     * 
     * @returns {{ outlines: Renderable[], interiors: Renderable[] }}
     */
    findRenderablesInEntry(entry, startDate, endDate) {
        const outlines = [];
        const interiors = [];
        const length = entry.outlines.length || entry.interiors.length;

        for (let j = length - 1; j >= 0; j--) {
            let outline = entry.outlines[j];
            let interior = entry.interiors[j];
            let renderable = outline || interior;

            let isValid = this.timeIntersection(startDate, endDate, renderable.kmlProps.startDate, renderable.kmlProps.endDate);

            if (isValid) {
                if (outline) {
                    outlines.push(outline);
                }
                if (interior) {
                    interiors.push(interior);
                }
            }
        }

        return { outlines, interiors };
    }

    /**
     * Checks if the range [startRange1, endRange1] intersects with the range [startRange2, endRange2]
     
     * @param {Number|Date} startRange1
     * @param {Number|Date} endRange1
     * @param {Number|Date} startRange2
     * @param {Number|Date} endRange2
     
     * @returns {Boolean}
     */
    timeIntersection(startRange1, endRange1, startRange2, endRange2) {
        return (startRange1 <= endRange2 && startRange2 <= endRange1);
    }

}