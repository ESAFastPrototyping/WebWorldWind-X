/**
 * @exports StarFieldLayer
 */
import Celestial from './Celestial';
import StarFieldProgram from './StarFieldProgram';
import SunPosition from './SunPosition';

import WorldWind from 'webworldwind-esa';
const {
    Color,
    Layer,
    Logger,
    Matrix,
    REDRAW_EVENT_TYPE
} = WorldWind;


/**
 * Constructs a layer showing stars and the Sun around the Earth.
 * If used together with the AtmosphereLayer, the StarFieldLayer must be inserted before the AtmosphereLayer.
 *
 * If you want to use your own star data, the file provided must be .json
 * and the fields 'ra', 'dec' and 'vmag' must be present in the metadata.
 * ra and dec must be expressed in degrees.
 *
 * This layer uses J2000.0 as the ref epoch.
 *
 * If the star data .json file is too big, consider enabling gzip compression on your web server.
 * For more info about enabling gzip compression consult the configuration for your web server.
 *
 *
 -- output format : json
 SELECT "I/239/hip_main".HIP,  "I/239/hip_main".Vmag as vmag, "I/239/hip_main"."_RA.icrs" as ra,  "I/239/hip_main"."_DE.icrs" as dec
 FROM "I/239/hip_main"
 WHERE "I/239/hip_main".Vmag <=6.5
 *
 * @alias StarFieldLayer
 * @constructor
 * @classdesc Provides a layer showing stars, and the Sun around the Earth
 * @param {URL} starDataSource optional url for the stars data
 * @augments Layer
 */
class StarFieldLayer extends Layer {
    constructor(starDataSource) {
        super('StarField');

        // The StarField Layer is not pickable.
        this.pickEnabled = false;

        /**
         * The size of the Sun in pixels.
         * This can not exceed the maximum allowed pointSize of the GPU.
         * A warning will be given if the size is too big and the allowed max size will be used.
         * @type {Number}
         * @default 128
         */
        this.sunSize = 128;

        /**
         * Indicates weather to show or hide the Sun
         * @type {Boolean}
         * @default true
         */
        this.showSun = true;

        //Documented in defineProperties below.
        this._starDataSource = starDataSource || WorldWind.configuration.baseUrl + 'images/stars.json';
        this._sunImageSource = WorldWind.configuration.baseUrl + 'images/sunTexture.png';

        //Internal use only.
        //The MVP matrix of this layer.
        this._matrix = Matrix.fromIdentity();

        //Internal use only.
        //gpu cache key for the stars vbo.
        this._starsPositionsVboCacheKey = null;

        //Internal use only.
        this._numStars = 0;

        //Internal use only.
        this._starData = null;

        //Internal use only.
        this._minMagnitude = Number.MAX_VALUE;
        this._maxMagnitude = Number.MIN_VALUE;

        //Internal use only.
        //A flag to indicate the star data is currently being retrieved.
        this._loadStarted = false;

        //Internal use only.
        this._minScale = 30e6;
        this._scale = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;
        //this._scale = 50e6;

        //Internal use only.
        this._sunPositionsCacheKey = '';
        this._sunBufferView = new Float32Array(4);

        //Internal use only.
        this._MAX_GL_POINT_SIZE = 0;

        this.showPlanets = true;

        const jupiterSize = 32;

        this.planets = [
            {
                id: Celestial.MERCURY,
                url: 'images/Mercury64.png',
                size: jupiterSize / 4,
                ra: null,
                dec: null,
            },
            {
                id: Celestial.VENUS,
                url: 'images/Venus64.png',
                size: jupiterSize / 4,
                ra: null,
                dec: null,
            },
            {
                id: Celestial.MARS,
                url: 'images/Mars64.png',
                size: jupiterSize / 4,
                ra: null,
                dec: null,
            },
            {
                id: Celestial.JUPITER,
                url: 'images/Jupiter64.png',
                size: jupiterSize,
                ra: null,
                dec: null,
            },
            {
                id: Celestial.SATURN,
                url: 'images/Saturn64.png',
                size: jupiterSize,
                ra: null,
                dec: null,
            },
            {
                id: Celestial.URANUS,
                url: 'images/Uranus64.png',
                size: jupiterSize / 2,
                ra: null,
                dec: null,
            },
            {
                id: Celestial.NEPTUNE,
                url: 'images/Neptune64.png',
                size: jupiterSize / 2,
                ra: null,
                dec: null,
            },
        ];

        this._planetsBufferView = null;

        this._cacheKeys = {
            sunPosition: '',
            planetPositions: '',
            starPositions: ''
        };
    }

    /**
     * Url for the stars data.
     * @memberof StarFieldLayer.prototype
     * @type {URL}
     */
    get starDataSource() {
        return this._starDataSource;
    }
    
    set starDataSource(value) {
        this._starDataSource = value;
        this.invalidateStarData();
    }

    /**
     * Url for the sun texture image.
     * @memberof StarFieldLayer.prototype
     * @type {URL}
     */
    get sunImageSource() {
        return this._sunImageSource;
    }
    
    set sunImageSource(value) {
        this._sunImageSource = value;
    }

    // Documented in superclass.
    doRender(dc) {
        if (dc.globe.is2D()) {
            return;
        }

        if (!this.haveResources(dc)) {
            this.loadResources(dc);
            return;
        }

        this.beginRendering(dc);
        try {
            this.doDraw(dc);
        }
        finally {
            this.endRendering(dc);
        }
    }

    // Internal. Intentionally not documented.
    haveResources(dc) {
        let sunTexture = dc.gpuResourceCache.resourceForKey(this._sunImageSource);
        let planetTextures = this.planets.every(planet => {
            const texture = dc.gpuResourceCache.resourceForKey(planet.url);
            return !!texture;
        });
        return (
            this._starData != null &&
            sunTexture != null &&
            planetTextures
        );
    }

    // Internal. Intentionally not documented.
    loadResources(dc) {
        let gl = dc.currentGlContext;
        let gpuResourceCache = dc.gpuResourceCache;

        if (!this._starData) {
            this.fetchStarData();
        }

        let sunTexture = gpuResourceCache.resourceForKey(this._sunImageSource);
        if (!sunTexture) {
            gpuResourceCache.retrieveTexture(gl, this._sunImageSource);
        }

        this.planets.forEach(planet => {
            const texture = gpuResourceCache.resourceForKey(planet.url);
            if (!texture) {
                gpuResourceCache.retrieveTexture(gl, planet.url);
            }
        });
    }

    // Internal. Intentionally not documented.
    beginRendering(dc) {
        let gl = dc.currentGlContext;
        dc.findAndBindProgram(StarFieldProgram);
        gl.enableVertexAttribArray(0);
        gl.depthMask(false);
    }

    // Internal. Intentionally not documented.
    doDraw(dc) {
        this.loadCommonUniforms(dc);

        this.renderStars(dc);

        if (this.showSun) {
            this.renderSun(dc);
        }

        if (this.showPlanets) {
            this.renderPlanets(dc);
        }
    }

    // Internal. Intentionally not documented.
    loadCommonUniforms(dc) {
        let gl = dc.currentGlContext;
        let program = dc.currentProgram;

        let mvp = dc.modelviewProjection || dc.navigatorState.modelviewProjection;
        this._matrix.copy(mvp);
        this._matrix.multiplyByScale(this._scale, this._scale, this._scale);

        program.loadModelviewProjection(gl, this._matrix);

        //this subtraction does not work properly on the GPU, it must be done on the CPU
        //possibly due to precision loss
        //number of days (positive or negative) since Greenwich noon, Terrestrial Time, on 1 January 2000 (J2000.0)
        let julianDate = SunPosition.computeJulianDate(this.time || new Date());
        program.loadNumDays(gl, julianDate - 2451545.0);
    }

    // Internal. Intentionally not documented.
    renderStars(dc) {
        let gl = dc.currentGlContext;
        let gpuResourceCache = dc.gpuResourceCache;
        let program = dc.currentProgram;

        if (!this._starsPositionsVboCacheKey) {
            this._starsPositionsVboCacheKey = gpuResourceCache.generateCacheKey();
        }
        let vboId = gpuResourceCache.resourceForKey(this._starsPositionsVboCacheKey);
        if (!vboId) {
            vboId = gl.createBuffer();
            let positions = this.createStarsGeometry();
            gpuResourceCache.putResource(this._starsPositionsVboCacheKey, vboId, positions.length * 4);
            gl.bindBuffer(gl.ARRAY_BUFFER, vboId);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        }
        else {
            gl.bindBuffer(gl.ARRAY_BUFFER, vboId);
        }
        dc.frameStatistics.incrementVboLoadCount(1);

        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);

        program.loadMagnitudeRange(gl, this._minMagnitude, this._maxMagnitude);
        program.loadFragMode(gl, program.FRAG_MODE_MIX_COLOR);

        gl.drawArrays(gl.POINTS, 0, this._numStars);
    }

    // Internal. Intentionally not documented.
    renderPlanets(dc) {
        let gl = dc.currentGlContext;
        let program = dc.currentProgram;
        let gpuResourceCache = dc.gpuResourceCache;

        if (!this._MAX_GL_POINT_SIZE) {
            this._MAX_GL_POINT_SIZE = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1];
        }
        if (this.sunSize > this._MAX_GL_POINT_SIZE) {
            Logger.log(Logger.LEVEL_WARNING, 'StarFieldLayer - sunSize is to big, max size allowed is: ' +
                this._MAX_GL_POINT_SIZE);
        }

        this.planets.forEach(planet => {
            const {ra, dec} = Celestial.getCelestialLocation(planet.id, this.time || new Date());
            planet.ra = ra;
            planet.dec = dec;
        }, this);

        if (!this._planetsBufferView) {
            this._planetsBufferView = new Float32Array(this.planets.length * 4);
        }

        for (let i = 0; i < this.planets.length; i++) {
            let planet = this.planets[i];
            this._planetsBufferView[i * 4 + 0] = planet.dec;
            this._planetsBufferView[i * 4 + 1] = planet.ra;
            this._planetsBufferView[i * 4 + 2] = Math.min(planet.size, this._MAX_GL_POINT_SIZE);
            this._planetsBufferView[i * 4 + 3] = 1;
        }

        if (!this._planetsPositionsVboCacheKey) {
            this._planetsPositionsVboCacheKey = gpuResourceCache.generateCacheKey();
        }
        let vboId = gpuResourceCache.resourceForKey(this._planetsPositionsVboCacheKey);
        if (!vboId) {
            vboId = gl.createBuffer();
            gpuResourceCache.putResource(this._planetsPositionsVboCacheKey, vboId, this._planetsBufferView.length * 4);
            gl.bindBuffer(gl.ARRAY_BUFFER, vboId);
            gl.bufferData(gl.ARRAY_BUFFER, this._planetsBufferView, gl.DYNAMIC_DRAW);
        }
        else {
            gl.bindBuffer(gl.ARRAY_BUFFER, vboId);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._planetsBufferView);
        }
        dc.frameStatistics.incrementVboLoadCount(1);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);

        program.loadFragMode(gl, program.FRAG_MODE_TEXTURE);

        for (let i = 0; i < this.planets.length; i++) {
            let textureSrc = this.planets[i].url;
            let texture = dc.gpuResourceCache.resourceForKey(textureSrc);
            texture.bind(dc);
            gl.drawArrays(gl.POINTS, i, 1);
        }
    }

    // Internal. Intentionally not documented.
    renderSun(dc) {
        let gl = dc.currentGlContext;
        let program = dc.currentProgram;
        let gpuResourceCache = dc.gpuResourceCache;

        if (!this._MAX_GL_POINT_SIZE) {
            this._MAX_GL_POINT_SIZE = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1];
        }
        if (this.sunSize > this._MAX_GL_POINT_SIZE) {
            Logger.log(Logger.LEVEL_WARNING, 'StarFieldLayer - sunSize is to big, max size allowed is: ' +
                this._MAX_GL_POINT_SIZE);
        }

        let sunCelestialLocation = SunPosition.getAsCelestialLocation(this.time || new Date());

        this._sunBufferView[0] = sunCelestialLocation.declination;
        this._sunBufferView[1] = sunCelestialLocation.rightAscension;
        this._sunBufferView[2] = Math.min(this.sunSize, this._MAX_GL_POINT_SIZE);
        this._sunBufferView[3] = 1;

        if (!this._sunPositionsCacheKey) {
            this._sunPositionsCacheKey = gpuResourceCache.generateCacheKey();
        }
        let vboId = gpuResourceCache.resourceForKey(this._sunPositionsCacheKey);
        if (!vboId) {
            vboId = gl.createBuffer();
            gpuResourceCache.putResource(this._sunPositionsCacheKey, vboId, this._sunBufferView.length * 4);
            gl.bindBuffer(gl.ARRAY_BUFFER, vboId);
            gl.bufferData(gl.ARRAY_BUFFER, this._sunBufferView, gl.DYNAMIC_DRAW);
        }
        else {
            gl.bindBuffer(gl.ARRAY_BUFFER, vboId);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._sunBufferView);
        }
        dc.frameStatistics.incrementVboLoadCount(1);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);

        program.loadFragMode(gl, program.FRAG_MODE_TEXTURE);

        let sunTexture = dc.gpuResourceCache.resourceForKey(this._sunImageSource);
        sunTexture.bind(dc);

        gl.drawArrays(gl.POINTS, 0, 1);
    }

    // Internal. Intentionally not documented.
    endRendering(dc) {
        let gl = dc.currentGlContext;
        gl.depthMask(true);
        gl.disableVertexAttribArray(0);
    }

    // Internal. Intentionally not documented.
    fetchStarData() {
        if (this._loadStarted) {
            return;
        }

        this._loadStarted = true;
        let self = this;
        let xhr = new XMLHttpRequest();

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                try {
                    self._starData = JSON.parse(this.response);
                    self.sendRedrawRequest();
                }
                catch (e) {
                    Logger.log(Logger.LEVEL_SEVERE, 'StarFieldLayer unable to parse JSON for star data ' +
                        e.toString());
                }
            }
            else {
                Logger.log(Logger.LEVEL_SEVERE, 'StarFieldLayer unable to fetch star data. Status: ' +
                    this.status + ' ' + this.statusText);
            }
            self._loadStarted = false;
        };

        xhr.onerror = function () {
            Logger.log(Logger.LEVEL_SEVERE, 'StarFieldLayer unable to fetch star data');
            self._loadStarted = false;
        };

        xhr.ontimeout = function () {
            Logger.log(Logger.LEVEL_SEVERE, 'StarFieldLayer fetch star data has timeout');
            self._loadStarted = false;
        };

        xhr.open('GET', this._starDataSource, true);
        xhr.send();
    }

    // Internal. Intentionally not documented.
    createStarsGeometry() {
        let indexes = this.parseStarsMetadata(this._starData.metadata);

        if (indexes.raIndex === -1) {
            throw new Error(
                Logger.logMessage(Logger.LEVEL_SEVERE, 'StarFieldLayer', 'createStarsGeometry',
                    'Missing ra field in star data.'));
        }
        if (indexes.decIndex === -1) {
            throw new Error(
                Logger.logMessage(Logger.LEVEL_SEVERE, 'StarFieldLayer', 'createStarsGeometry',
                    'Missing dec field in star data.'));
        }
        if (indexes.magIndex === -1) {
            throw new Error(
                Logger.logMessage(Logger.LEVEL_SEVERE, 'StarFieldLayer', 'createStarsGeometry',
                    'Missing vmag field in star data.'));
        }

        let data = this._starData.data;
        let positions = [];

        this._minMagnitude = Number.MAX_VALUE;
        this._maxMagnitude = Number.MIN_VALUE;

        for (let i = 0, len = data.length; i < len; i++) {
            let starInfo = data[i];
            let declination = starInfo[indexes.decIndex]; //for latitude
            let rightAscension = starInfo[indexes.raIndex]; //for longitude
            let magnitude = starInfo[indexes.magIndex];
            let pointSize = magnitude < 2 ? 2 : 1;
            positions.push(declination, rightAscension, pointSize, magnitude);

            this._minMagnitude = Math.min(this._minMagnitude, magnitude);
            this._maxMagnitude = Math.max(this._maxMagnitude, magnitude);
        }
        this._numStars = Math.floor(positions.length / 4);

        return positions;
    }

    // Internal. Intentionally not documented.
    parseStarsMetadata(metadata) {
        let raIndex = -1,
            decIndex = -1,
            magIndex = -1;
        for (let i = 0, len = metadata.length; i < len; i++) {
            let starMetaInfo = metadata[i];
            if (starMetaInfo.name === 'ra') {
                raIndex = i;
            }
            if (starMetaInfo.name === 'dec') {
                decIndex = i;
            }
            if (starMetaInfo.name === 'vmag') {
                magIndex = i;
            }
        }
        return {
            raIndex: raIndex,
            decIndex: decIndex,
            magIndex: magIndex
        };
    }

    // Internal. Intentionally not documented.
    invalidateStarData() {
        this._starData = null;
        this._starsPositionsVboCacheKey = null;
    }

    // Internal. Intentionally not documented.
    sendRedrawRequest() {
        let e = document.createEvent('Event');
        e.initEvent(REDRAW_EVENT_TYPE, true, true);
        window.dispatchEvent(e);
    }
}

export default StarFieldLayer;
