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


function getOrbitPosition(satrec, date) {

    var positionEci = getPositionEci(satrec, date);
    var gmst = getGmst(date);
    var position_gd = satellite.eciToGeodetic(positionEci, gmst);
    var latitude = satellite.degreesLat(position_gd.latitude);
    var longitude = satellite.degreesLong(position_gd.longitude);
    var altitude = position_gd.height * 1000;

    return {latitude, longitude, altitude};
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

function headingAngleRadians(latStart, longStart, latEnd, longEnd) {
    var headingAngle = 0;

    var northPoleCurrentPositionDiff = pointToPointDistance(
        {latitude: 90, longitude: 0},
        {latitude: latStart, longitude: longStart}
    );

    var nextPositionCurrentPositionDiff = pointToPointDistance(
        {latitude: latStart, longitude: longStart},
        {latitude: latEnd, longitude: longEnd}
    );

    if (nextPositionCurrentPositionDiff != 0) {
        var northPoleNextPositionDiff = pointToPointDistance(
            {latitude: 90, longitude: 0},
            {latitude: latEnd, longitude: longEnd}
        );

        var cosAngleCurrentPosition = (nextPositionCurrentPositionDiff * nextPositionCurrentPositionDiff +
            northPoleCurrentPositionDiff * northPoleCurrentPositionDiff -
            northPoleNextPositionDiff * northPoleNextPositionDiff) /
            (2 * nextPositionCurrentPositionDiff * northPoleCurrentPositionDiff);

        headingAngle = Math.abs(Math.acos(cosAngleCurrentPosition));
    }

    return headingAngle;
}

function pointToPointDistance(point1, point2) {
    var lat1 = point1.latitude;
    var lon1 = point1.longitude;
    var lat2 = point2.latitude;
    var lon2 = point2.longitude;

    return getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km

    return d;
}


function projectPosition(origin, heading, distance) {
    var coordinate = {};
    var rtd = 180.0 / Math.PI;
    var dtr = Math.PI / 180.0;
    var brng = dtr * heading;
    var lat1 = dtr * origin.latitude;
    var lon1 = dtr * origin.longitude;
    var kLatLonEarthRadius = 6371.0;

    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / kLatLonEarthRadius) +
        Math.cos(lat1) * Math.sin(distance / kLatLonEarthRadius) * Math.cos(brng));
    var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(distance / kLatLonEarthRadius) * Math.cos(lat1),
        Math.cos(distance / kLatLonEarthRadius) - Math.sin(lat1) * Math.sin(lat2));
    lon2 = fmod(lon2 + Math.PI, 2.0 * Math.PI) - Math.PI;

    if (!isNaN(lat2) && !isNaN(lon2)) {
        coordinate.latitude = lat2 * rtd;
        coordinate.longitude = lon2 * rtd;
        coordinate.altitude = 0;
    }

    return coordinate;
}

function fmod(a, b) {
    return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
}

export default {
    computeSatrec,
    deg2rad,
    getElevationWithPositionalData,
    getOrbitPosition,
    getOrbitPositionWithPositionalData,
    headingAngleRadians,
    projectPosition,
    rad2deg
};