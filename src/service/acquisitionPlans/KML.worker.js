import 'babel-polyfill';
import xml2js from './xml2js';

self.addEventListener('message', onMessage);

const WORKER_ID = 'kmlWorker';

function onMessage(e) {
    const { type, url, satName, filterDate } = e.data;

    switch (type) {

        case 'downloadAndParseKmls':
            downloadAndParseKmls(url, satName, filterDate)
                .then(({ err, shapes }) => {
                    self.postMessage({
                        type,
                        satName,
                        url,
                        shapes,
                        err,
                        workerId: WORKER_ID,
                    });
                });
            break;

        default:
            self.postMessage({
                type,
                satName,
                url,
                shapes: null,
                err: 'Unknown action type: ' + type,
                workerId: WORKER_ID,
            });
            break;
    }
}

async function downloadAndParseKmls(url, satName, filterDate) {
    const { err, body } = await getFile(url);

    if (err) {
        return { err, shapes: null };
    }

    const shapes = parse(satName, body, filterDate) || body;

    return { err, shapes };
}

function parse(satName, kmlStringContent, filterDate) {
    let shapes = null;
    try {
        const jsKml = xml2js(kmlStringContent, { compact: true, spaces: 4 });
        shapes = geoKml.parse(jsKml);

        const isSentinel2 = satName.includes('s2');
        const nowDate = new Date(filterDate);
        shapes = shapes.filter(shape => {
            const isInTheFuture = new Date(shape.timeSpan.end) >= nowDate;

            if (isSentinel2) {
                return (
                    isInTheFuture &&
                    shape.extendedData.Mode === 'NOBS' &&
                    shape.extendedData.Timeliness === 'NOMINAL'
                );
            }

            return isInTheFuture;
        });
    }
    catch (e) {
        console.error('KMLWorker - parse error', e);
        shapes = null;
    }

    return shapes;
}

const geoKml = {

    parse(kmlObj) {
        const doc = kmlObj.kml.Document;
        const rootFolder = doc.Folder;
        if (!rootFolder) {
            return null;
        }

        const style = doc.Style;
        const styleMap = doc.StyleMap;

        const rawPlacemarks = [];
        this.getPlacemarks(rootFolder, rawPlacemarks);
        if (rawPlacemarks.length === 0) {
            return null;
        }

        const styles = this.parseStyles(style);
        this.parseStyleMap(styleMap, styles);

        return this.parsePlacemarks(rawPlacemarks, styles);
    },

    parseStyles: function (stylesObj) {
        return stylesObj.map(styleObj => {
            const id = this.formatId(styleObj._attributes.id);

            let color = 'ffffffff';
            if (styleObj.LineStyle && styleObj.LineStyle.color && styleObj.LineStyle.color._text) {
                color = styleObj.LineStyle.color._text;
            }

            return {
                id: id,
                color: color
            };
        });
    },

    parseStyleMap: function (styleMaps, styles) {
        if (!styleMaps) {
            return;
        }

        const styleIds = styles.map(style => style.id);

        const styleMapId = this.formatId(styleMaps._attributes.id);
        const normalPair = styleMaps.Pair.filter(pair => pair.key._text === 'normal')[0];
        const id = this.formatId(normalPair.styleUrl._text);
        const index = styleIds.indexOf(id);
        const color = styles[index].color || 'ffffffff';

        styles.push({
            id: styleMapId,
            color: color
        });
    },

    parsePlacemarks: function (placemarks, styles) {
        const shapes = [];

        for (let i = 0; i < placemarks.length; i++) {
            let placemark = placemarks[i];
            let styleUrl = this.parseStyleUrl(placemark.styleUrl);

            let shape = {
                extendedData: this.parseExtendedData(placemark.ExtendedData),
                timeSpan: this.parseTimeSpan(placemark.TimeSpan),
                name: this.parseName(placemark.name),
                coordinates: this.parseCoordinates(placemark),
                color: this.matchStyle(styles, styleUrl)
            };

            shapes.push(shape);
        }

        return shapes;
    },

    matchStyle: function (styles, styleUrl) {
        const style = styles.filter(style => style.id === styleUrl)[0];
        if (style) {
            return style.color;
        }
        return 'ffffffff';
    },

    parseCoordinates: function (placemark) {
        let coordinates;

        if (placemark.LinearRing && placemark.LinearRing.coordinates) {
            coordinates = placemark.LinearRing.coordinates;
        }
        else if (placemark.Polygon && placemark.Polygon.outerBoundaryIs && placemark.Polygon.outerBoundaryIs.LinearRing &&
            placemark.Polygon.outerBoundaryIs.LinearRing.coordinates) {
            coordinates = placemark.Polygon.outerBoundaryIs.LinearRing.coordinates;
        }
        else {
            console.error('parseCoordinates - unsuported shape', placemark);
            return [];
        }

        const positions = coordinates._text.trim().replace(/\s+/g, ' ').split(' ');

        return positions.map(pos => {
            const positionsPair = pos.split(',');
            return {
                latitude: +positionsPair[1],
                longitude: +positionsPair[0]
            };
        });
    },

    parseExtendedData: function (extDataObj) {
        const extendedData = {};
        const datas = extDataObj.Data;

        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];

            let key = data._attributes.name;

            let value = '';
            if (data.value) {
                value = data.value._text;
            }

            extendedData[key] = value;
        }

        return extendedData;
    },

    parseTimeSpan: function (timeSpanObj) {
        const begin = timeSpanObj.begin._text;
        const end = timeSpanObj.end._text;

        return {
            begin: begin,
            end: end
        };
    },

    parseName: function (nameObj) {
        return nameObj._text;
    },

    parseStyleUrl: function (styleUrlObj) {
        return this.formatId(styleUrlObj._text);
    },

    formatId(text) {
        if (text[0] === '#') {
            return text.slice(1);
        }

        return text;
    },

    getPlacemarks(folder, placemarks) {
        if (Array.isArray(folder)) {
            for (let i = 0, len = folder.length; i < len; i++) {
                let subFolder = folder[i];
                if (!subFolder) {
                    continue;
                }
                if (subFolder.Placemark) {
                    this.addPlacemarks(subFolder.Placemark, placemarks);
                }
                else {
                    this.getPlacemarks(subFolder, placemarks);
                }
            }
        }
        else if (folder && folder.Folder) {
            this.getPlacemarks(folder.Folder, placemarks);
        }
        else if (folder && folder.Placemark) {
            this.addPlacemarks(folder.Placemark, placemarks);
        }
    },

    addPlacemarks(placemarkFolder, placemarks) {
        if (Array.isArray(placemarkFolder)) {
            for (let i = 0, len = placemarkFolder.length; i < len; i++) {
                if (placemarkFolder[i]) {
                    placemarks.push(placemarkFolder[i]);
                }
            }
        }
        else if (placemarkFolder) {
            placemarks.push(placemarkFolder);
        }
    },

};

async function getFile(url) {
    let response = null;
    let body = null;

    try {
        response = await fetch(url);
    }
    catch(error) {
        return { err: 'Unable to fetch file: ' + url, body };
    }

    // A response with the status code 0 may still contain the data.
    // Usually happens in mobile environments when fetching from local disk.
    if (!response.ok && response.status !== 0) {
        return { err: 'Unable to fetch file: ' + url, body };
    }

    try {
        body = await response.text();
    }
    catch(error) {
        return { err: 'Unable to fetch file: ' + url, body };
    }

    return { err: null, body };
}