import * as satellite from './satellite.es';

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function rad2deg(rad) {
    return rad * (180 / Math.PI);
}

function computeSatrec(tleLine1, tleLine2) {
    return satellite.twoline2satrec(tleLine1, tleLine2);
}

function getOrbitPositionWithPositionalData(satrec, date) {

    var positionEci = getPositionEci(satrec, date);
    var gmst = getGmst(date);
    var position_gd = satellite.eciToGeodetic(positionEci, gmst);
    var latitude = satellite.degreesLat(position_gd.latitude);
    var longitude = satellite.degreesLong(position_gd.longitude);
    var altitude = position_gd.height * 1000;

    return {
        position_eci: positionEci,
        gmst: gmst,
        position: {latitude, longitude, altitude}
    };
}

function getElevationWithPositionalData(position_eci, gmst, observerGd) {
    var positionEcf = satellite.eciToEcf(position_eci, gmst);
    var lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
    return lookAngles.elevation;
}

function getPositionEci(satrec, date) {
    var positionAndVelocity = satellite.propagate(
        satrec,
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
    );

    return positionAndVelocity.position;
}

function getGmst(date) {
    return satellite.gstime(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
    );
}

export default {
    computeSatrec,
    deg2rad,
    rad2deg,
    getOrbitPositionWithPositionalData,
    getElevationWithPositionalData
};