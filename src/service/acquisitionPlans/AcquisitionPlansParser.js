import toGeoJSON from './toGeoJson/togeojson';

export class AcquisitionPlansParser {

    /**
     * @alias AcquisitionPlansParser
     * @constructor
     * @param {Workers} workers 
     */
    constructor(workers) {
        if (!workers) {
            throw (new Error('AcquisitionPlansParser - constructor - missing workers instance'));
        }

        this.workers = workers;

        this.InteriorCtor = WorldWind ? WorldWind.SurfacePolygon : null;
        this.OutlineCtor = WorldWind ? WorldWind.Path : null;
        this.ShapeAttributesCtor = WorldWind ? WorldWind.ShapeAttributes : null;
        this.PositionCtor = WorldWind ? WorldWind.Position : null;
        this.ColorCtor = WorldWind ? WorldWind.Color : null;

        /**
         * @type {DOMParser|null}
         */
        this.domParser = null;

        /**
         * @type {Object}
         */
        this.shapeAttributesMap = Object.create(null);
    }

    /**
     * Parses an acquisition plan kml file.
     * Parsing will be attempted in a web worker and if that fails it will be attemped on the main thread.
     * 
     * @param {{ satName: String, url: String, type: String, interior: Boolean, outline: Boolean, outlineAlpha: Number, interiorAlpha: Number, highlightAlpha: Number, filterDate: String }} fileInfo
     * 
     * @param {String} fileInfo.satName The satellite name for the acquisition plan. The convention is to use the short name: "s1a", "s2b", "s5p", etc.
     * @param {String} fileInfo.url The url for the acquisition plan file
     * @param {String} fileInfo.type A type for the web workers. Default is "downloadAndParseKmls"
     * @param {Boolean} fileInfo.interior A flag that indicates if interior renderables should be created. Default is true
     * @param {Boolean} fileInfo.outline A flag that indicates if outline renderables should be created. Default is true
     * @param {Number} fileInfo.outlineAlpha Alpha value fot the outline. Default is 1
     * @param {Number} fileInfo.interiorAlpha Alpha value for the interior. Default is 0.2
     * @param {Number} fileInfo.highlightAlpha Alpha value for the interior highlight. Default is 0.5
     * @param {String} fileInfo.filterDate An ISODate string used for filtering out shapes that lees than this value. Default is the current date
     * 
     * @param {Function} cb A callback function, will be called with error and entry params
     */
    parse(fileInfo, cb) {
        fileInfo.type = fileInfo.type || 'downloadAndParseKmls';
        fileInfo.filterDate = fileInfo.filterDate || new Date().toISOString();

        this.workers.process(fileInfo, (err, result) => {
            if (err) {
                return cb(err);
            }

            const { shapes, satName, url } = result;
            let parsedShapes;

            if (typeof shapes === 'string') {
                console.info('Worker unable to parse kml file', url);
                try {
                    parsedShapes = this.parseSync(shapes, satName, fileInfo.filterDate);
                }
                catch (error) {
                    return cb(error);
                }
            }
            else {
                parsedShapes = shapes;
            }

            let outlines;
            let interiors;
            let interval;

            try {
                ({ outlines, interiors, interval } = this.makeRenderables(parsedShapes, fileInfo));
            }
            catch (error) {
                return cb(error);
            }

            if ((outlines || interiors) && interval) {
                return cb(null, this.formatOutput({ satName, url }, interval, outlines, interiors));
            }
        });
    }

    parseSync(kmlString, satName, filterDate) {
        if (!this.domParser) {
            this.domParser = new DOMParser();
        }

        const kmlDoc = this.domParser.parseFromString(kmlString, 'text/xml');
        const geoJson = toGeoJSON.kml(kmlDoc);
        let shapes = geoJson.features;

        const isSentinel2 = satName.includes('s2');
        const nowDate = new Date(filterDate);
        shapes = shapes.filter(shape => {
            const isInTheFuture = new Date(shape.properties.timespan.end) >= nowDate;

            if (isSentinel2) {
                return (
                    isInTheFuture &&
                    shape.properties.Mode === 'NOBS' &&
                    shape.properties.Timeliness === 'NOMINAL'
                );
            }

            return isInTheFuture;
        });

        return shapes;
    }

    makeRenderables(shapes, fileInfo) {
        const outlines = [];
        const interiors = [];

        const interval = {
            startDate: Number.MAX_SAFE_INTEGER,
            endDate: Number.MIN_SAFE_INTEGER
        };

        for (let i = 0; i < shapes.length; i++) {
            let shape = shapes[i];
            let coords = shape.coordinates;
            let color = shape.color;
            let extendedData = shape.extendedData;

            if (shape.geometry) {
                coords = shape.geometry.coordinates[0];
            }
            if (shape.properties) {
                color = shape.properties.lineColor;
                extendedData = shape.properties;
            }

            let positions = this.makePositions(coords);

            if (fileInfo.outline !== false) {
                let pathAttributes = this.makePathAttributes(color, fileInfo.outlineAlpha);
                let path = new this.OutlineCtor(positions, pathAttributes);
                path.altitudeMode = 'clampToGround';
                path.followTerrain = true;
                path.expiryTime = Number.MAX_SAFE_INTEGER;
                this.setTimeInterval(path, extendedData, interval);
                path.kmlProps.satName = fileInfo.satName;
                outlines.push(path);
            }

            if (fileInfo.interior !== false) {
                let surfacePolygonAttributes = this.makeSurfacePolygonAttributes(color, fileInfo.interiorAlpha);
                let surfacePolygon = new this.InteriorCtor(positions, surfacePolygonAttributes);
                surfacePolygon.highlightAttributes = this.makeSurfacePolygonHighlightAttributes(color, fileInfo.highlightAlpha);
                this.setTimeInterval(surfacePolygon, extendedData, interval);
                surfacePolygon.kmlProps.satName = fileInfo.satName;
                interiors.push(surfacePolygon);
            }
        }

        interval.startDate = new Date(interval.startDate);
        interval.endDate = new Date(interval.endDate);

        return {
            outlines,
            interiors,
            interval,
        };
    }

    makePositions(coords) {
        const positions = [];

        for (let i = 0, len = coords.length; i < len; i++) {
            let coord = coords[i];
            let pos = new this.PositionCtor(
                coord[1] || coord.latitude,
                coord[0] || coord.longitude,
                coord[2] || 0
            );
            if (pos.longitude < -180) {
                pos.longitude = pos.longitude + 360;
            }
            if (pos.longitude > 180) {
                pos.longitude = pos.longitude - 360;
            }
            positions.push(pos);
        }

        return positions;
    }

    makePathAttributes(hexColor, alpha = 1) {
        const key = hexColor + 'path';
        
        if (this.shapeAttributesMap[key]) {
            return this.shapeAttributesMap[key];
        }

        const attributes =  new this.ShapeAttributesCtor(null);
        attributes.drawOutline = true;
        attributes.drawInterior = false;
        attributes.outlineColor = this.makeColor(hexColor, alpha);

        this.shapeAttributesMap[key] = attributes;

        return attributes;
    }

    makeSurfacePolygonAttributes(props, alpha = 0.2) {
        const hexColor = props.lineColor || props;
        const key = hexColor + 'poly';

        if (this.shapeAttributesMap[key]) {
            return this.shapeAttributesMap[key];
        }

        const attributes = new this.ShapeAttributesCtor(null);
        attributes.drawOutline = false;
        attributes.drawInterior = true;
        attributes.interiorColor = this.makeColor(hexColor, alpha);

        this.shapeAttributesMap[key] = attributes;

        return attributes;
    }

    makeSurfacePolygonHighlightAttributes(props, alpha = 0.5) {
        const hexColor = props.lineColor || props;

        const attributes = new this.ShapeAttributesCtor(null);
        attributes.drawOutline = false;
        attributes.drawInterior = true;
        attributes.interiorColor = this.makeColor(hexColor, alpha);

        return attributes;
    }

    makeColor(hexColor, alpha) {
        const blue = hexColor.substring(2, 4);
        const green = hexColor.substring(4, 6);
        const red = hexColor.substring(6, 8);

        const r = parseInt(red, 16) / 255;
        const g = parseInt(green, 16) / 255;
        const b = parseInt(blue, 16) / 255;

        return new this.ColorCtor(r, g, b, alpha);
    }

    setTimeInterval(renderable, props, interval) {
        const startTime = this.dateStringToUTC(props.ObservationTimeStart || props.timespan.begin);
        const endTime = this.dateStringToUTC(props.ObservationTimeStop || props.timespan.end);
        const startTimeMs = (new Date(startTime)).getTime();
        const endTimeMs = (new Date(endTime)).getTime();

        if (interval.startDate > startTimeMs) {
            interval.startDate = startTimeMs;
        }
        if (interval.endDate < endTimeMs) {
            interval.endDate = endTimeMs;
        }

        renderable.kmlProps = props;
        renderable.kmlProps.startDate = new Date(startTimeMs);
        renderable.kmlProps.endDate = new Date(endTimeMs);
        renderable.type = 'acqPlan';
    }

    dateStringToUTC(dateString) {
        const lastChar = dateString[dateString.length - 1];
        if (lastChar.toLowerCase() !== 'z') {
            return dateString + 'Z';
        }
        return dateString;
    }

    formatOutput(fileInfo, interval, outlines = [], interiors = []) {
        return {
            url: fileInfo.url,
            satName: fileInfo.satName,
            outlines: outlines,
            interiors: interiors,
            startDate: interval.startDate,
            endDate: interval.endDate,
        };
    }

}
