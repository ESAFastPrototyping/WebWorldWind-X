/*
 * Copyright 2015-2017 WorldWind Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import WorldWind from 'webworldwind-esa';
const {
    Angle,
    ArgumentError,
    Logger
} = WorldWind;

/**
 * Provides utilities for determining the Sun geographic and celestial location.
 * @exports SunPosition
 */
const SunPosition = {

    /**
     * Computes the geographic location of the sun for a given date
     * @param {Date} date
     * @throws {ArgumentError} if the date is missing
     * @return {{latitude: Number, longitude: Number}} the geographic location
     */
    getAsGeographicLocation: function (date) {
        if (date instanceof Date === false) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "SunPosition", "getAsGeographicLocation",
                    "missingDate"));
        }

        let celestialLocation = this.getAsCelestialLocation(date);
        return this.celestialToGeographic(celestialLocation, date);
    },

    /**
     * Computes the celestial location of the sun for a given julianDate
     * @param {Date} date
     * @throws {ArgumentError} if the date is missing
     * @return {{declination: Number, rightAscension: Number}} the celestial location
     */
    getAsCelestialLocation: function (date) {
        if (date instanceof Date === false) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "SunPosition", "getAsCelestialLocation",
                    "missingDate"));
        }

        let julianDate = this.computeJulianDate(date);

        //number of days (positive or negative) since Greenwich noon, Terrestrial Time, on 1 January 2000 (J2000.0)
        let numDays = julianDate - 2451545;

        let meanLongitude = this.normalizeAngle360(280.460 + 0.9856474 * numDays);

        let meanAnomaly = this.normalizeAngle360(357.528 + 0.9856003 * numDays) * Angle.DEGREES_TO_RADIANS;

        let eclipticLongitude = meanLongitude + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly);
        let eclipticLongitudeRad = eclipticLongitude * Angle.DEGREES_TO_RADIANS;

        let obliquityOfTheEcliptic = (23.439 - 0.0000004 * numDays) * Angle.DEGREES_TO_RADIANS;

        let declination = Math.asin(Math.sin(obliquityOfTheEcliptic) * Math.sin(eclipticLongitudeRad)) *
            Angle.RADIANS_TO_DEGREES;

        let rightAscension = Math.atan(Math.cos(obliquityOfTheEcliptic) * Math.tan(eclipticLongitudeRad)) *
            Angle.RADIANS_TO_DEGREES;

        //compensate for atan result
        if (eclipticLongitude >= 90 && eclipticLongitude < 270) {
            rightAscension += 180;
        }
        rightAscension = this.normalizeAngle360(rightAscension);

        return {
            declination: declination,
            rightAscension: rightAscension
        };
    },

    /**
     * Converts from celestial coordinates (declination and right ascension) to geographic coordinates
     * (latitude, longitude) for a given julian date
     * @param {{declination: Number, rightAscension: Number}} celestialLocation
     * @param {Date} date
     * @throws {ArgumentError} if celestialLocation or julianDate are missing
     * @return {{latitude: Number, longitude: Number}} the geographic location
     */
    celestialToGeographic: function (celestialLocation, date) {
        if (!celestialLocation) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "SunPosition", "celestialToGeographic",
                    "missingCelestialLocation"));
        }
        if (date instanceof Date === false) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "SunPosition", "celestialToGeographic", "missingDate"));
        }

        let julianDate = this.computeJulianDate(date);

        //number of days (positive or negative) since Greenwich noon, Terrestrial Time, on 1 January 2000 (J2000.0)
        let numDays = julianDate - 2451545;

        //Greenwich Mean Sidereal Time
        let GMST = this.normalizeAngle360(280.46061837 + 360.98564736629 * numDays);

        //Greenwich Hour Angle
        let GHA = this.normalizeAngle360(GMST - celestialLocation.rightAscension);

        let longitude = Angle.normalizedDegreesLongitude(-GHA);

        return {
            latitude: celestialLocation.declination,
            longitude: longitude
        };
    },

    /**
     * Computes the julian date from a javascript date object
     * @param {Date} date
     * @throws {ArgumentError} if the date is missing
     * @return {Number} the julian date
     */
    computeJulianDate: function (date) {
        if (date instanceof Date === false) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "SunPosition", "computeJulianDate", "missingDate"));
        }

        let year = date.getUTCFullYear();
        let month = date.getUTCMonth() + 1;
        let day = date.getUTCDate();
        let hour = date.getUTCHours();
        let minute = date.getUTCMinutes();
        let second = date.getUTCSeconds();

        let dayFraction = (hour + minute / 60 + second / 3600) / 24;

        if (month <= 2) {
            year -= 1;
            month += 12;
        }

        let A = Math.trunc(year / 100);
        let B = 2 - A + Math.trunc(A / 4);
        let JD0h = Math.trunc(365.25 * (year + 4716)) + Math.trunc(30.6001 * (month + 1)) + day + B - 1524.5;

        return JD0h + dayFraction;
    },

    /**
     * Restricts an angle to the range [0, 360] degrees, wrapping angles outside the range.
     * Wrapping takes place as though traversing the edge of a unit circle;
     * angles less than 0 wrap back to 360, while angles greater than 360 wrap back to 0.
     *
     * @param {Number} degrees the angle to wrap in degrees
     *
     * @return {Number} the specified angle wrapped to [0, 360] degrees
     */
    normalizeAngle360: function(degrees) {
        let angle = degrees % 360;
        return angle >= 0 ? angle : (angle < 0 ? 360 + angle : 360 - angle);
    }

};

export default SunPosition;