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
 * Provides utilities for determining the Moon geographic and celestial location.
 * @exports MoonPosition
 */
const MoonPosition = {

    /**
     * Computes the geographic location of the moon for a given date
     * @param {Date} date
     * @throws {ArgumentError} if the date is missing
     * @return {{latitude: Number, longitude: Number}} the geographic location
     */
    getAsGeographicLocation: function (date) {
        if (date instanceof Date === false) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "MoonPosition", "getAsGeographicLocation",
                    "missingDate"));
        }

        let celestialLocation = this.getAsCelestialLocation(date);
        return this.celestialToGeographic(celestialLocation, date);
    },

    /**
     * Computes the celestial location of the moon for a given julianDate
     * @param {Date} date
     * @throws {ArgumentError} if the date is missing
     * @return {{declination: Number, rightAscension: Number}} the celestial location
     */
    getAsCelestialLocation: function (date) {
        if (date instanceof Date === false) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "MoonPosition", "getAsCelestialLocation",
                    "missingDate"));
        }

        let julianDate = this.computeJulianDate(date);

        //number of days (positive or negative) since Greenwich noon, Terrestrial Time, on 1 January 2000 (J2000.0)
        let numDays = julianDate - 2451545;

        let eclipticLongitude = this.normalizeAngle360(218.316 + 13.176396 * numDays) * Angle.DEGREES_TO_RADIANS;
        let meanAnomaly = this.normalizeAngle360(134.963 + 13.064993  * numDays) * Angle.DEGREES_TO_RADIANS;
        let meanDistance = this.normalizeAngle360(93.272 + 13.229350  * numDays) * Angle.DEGREES_TO_RADIANS;

        let longitude = eclipticLongitude + 6.289 * Math.sin(meanAnomaly) * Angle.DEGREES_TO_RADIANS;
        let latitude = 5.128 * Math.sin(meanDistance) * Angle.DEGREES_TO_RADIANS;
        let obliquityOfTheEcliptic = (23.439 - 0.0000004 * numDays) * Angle.DEGREES_TO_RADIANS;

        let rightAscension = Math.atan2( Math.sin(longitude) * Math.cos(obliquityOfTheEcliptic) - Math.tan(latitude) * Math.sin(obliquityOfTheEcliptic) , Math.cos(longitude) ) *
        Angle.RADIANS_TO_DEGREES;

        let declination = Math.asin( Math.sin(latitude) * Math.cos(obliquityOfTheEcliptic) + Math.cos(latitude) * Math.sin(obliquityOfTheEcliptic) * Math.sin(longitude) ) *
        Angle.RADIANS_TO_DEGREES;


        //compensate for atan result
        // if (eclipticLongitude >= 90 && eclipticLongitude < 270) {
        //     rightAscension += 180;
        // }
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
                Logger.logMessage(Logger.LEVEL_SEVERE, "MoonPosition", "celestialToGeographic",
                    "missingCelestialLocation"));
        }
        if (date instanceof Date === false) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "MoonPosition", "celestialToGeographic", "missingDate"));
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
                Logger.logMessage(Logger.LEVEL_SEVERE, "MoonPosition", "computeJulianDate", "missingDate"));
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

export default MoonPosition;