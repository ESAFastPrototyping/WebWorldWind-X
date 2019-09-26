import WorldWind from 'webworldwind-esa';
const {
    Angle
} = WorldWind;
import SunPosition from './SunPosition';

const Celestial = {

    SUN: 0,
    MERCURY: 1,
    VENUS: 2,
    MARS: 4,
    JUPITER: 5,
    SATURN: 6,
    URANUS: 7,
    NEPTUNE: 8,

    getCelestialLocation(id, date) {
        let orbitalElements;
        const julianDate = SunPosition.computeJulianDate(date);
        let d = julianDate - 2451543.5;
        //d = -3543.0;

        switch (id) {
            case this.SUN:
                orbitalElements = this.computeSun(d);
                break;

            case this.MERCURY:
                orbitalElements = this.computeMercury(d);
                break;

            case this.VENUS:
                orbitalElements = this.computeVenus(d);
                break;

            case this.MARS:
                orbitalElements = this.computeMars(d);
                break;

            case this.JUPITER:
                orbitalElements = this.computeJupiter(d);
                break;

            case this.SATURN:
                orbitalElements = this.computeSaturn(d);
                break;

            case this.URANUS:
                orbitalElements = this.computeUranus(d);
                break;

            case this.NEPTUNE:
                orbitalElements = this.computeNeptune(d);
                break;
        }

        return this.computePosition(d, orbitalElements);
    },

    computeMercury(d) {
        const N = 48.3313 + 3.24587E-5 * d;
        const i = 7.0047 + 5.00E-8 * d;
        const w = 29.1241 + 1.01444E-5 * d;
        const a = 0.387098;  //(AU)
        const e = 0.205635 + 5.59E-10 * d;
        const M = 168.6562 + 4.0923344368 * d;

        return {N, i, w, a, e, M};
    },

    computeVenus(d) {
        const N = 76.6799 + 2.46590E-5 * d;
        const i = 3.3946 + 2.75E-8 * d;
        const w = 54.8910 + 1.38374E-5 * d;
        const a = 0.723330;//  (AU)
        const e = 0.006773 - 1.302E-9 * d;
        const M = 48.0052 + 1.6021302244 * d;

        return {N, i, w, a, e, M};
    },

    computeMars(d) {
        const N = 49.5574 + 2.11081E-5 * d;
        const i = 1.8497 - 1.78E-8 * d;
        const w = 286.5016 + 2.92961E-5 * d;
        const a = 1.523688;  //(AU)
        const e = 0.093405 + 2.516E-9 * d;
        const M = 18.6021 + 0.5240207766 * d;

        return {N, i, w, a, e, M};
    },

    computeJupiter(d) {
        const N = 100.4542 + 2.76854E-5 * d;
        const i = 1.3030 - 1.557E-7 * d;
        const w = 273.8777 + 1.64505E-5 * d;
        const a = 5.20256;  //(AU)
        const e = 0.048498 + 4.469E-9 * d;
        const M = 19.8950 + 0.0830853001 * d;

        return {N, i, w, a, e, M};
    },

    computeSaturn(d) {
        const N = 113.6634 + 2.38980E-5 * d;
        const i = 2.4886 - 1.081E-7 * d;
        const w = 339.3939 + 2.97661E-5 * d;
        const a = 9.55475;  //(AU)
        const e = 0.055546 - 9.499E-9 * d;
        const M = 316.9670 + 0.0334442282 * d;

        return {N, i, w, a, e, M};
    },

    computeUranus(d) {
        const N = 74.0005 + 1.3978E-5 * d;
        const i = 0.7733 + 1.9E-8 * d;
        const w = 96.6612 + 3.0565E-5 * d;
        const a = 19.18171 - 1.55E-8 * d;//  (AU)
        const e = 0.047318 + 7.45E-9 * d;
        const M = 142.5905 + 0.011725806 * d;

        return {N, i, w, a, e, M};
    },

    computeNeptune(d) {
        const N = 131.7806 + 3.0173E-5 * d;
        const i = 1.7700 - 2.55E-7 * d;
        const w = 272.8461 - 6.027E-6 * d;
        const a = 30.05826 + 3.313E-8 * d;//  (AU)
        const e = 0.008606 + 2.15E-9 * d;
        const M = 260.2471 + 0.005995147 * d;

        return {N, i, w, a, e, M};
    },

    computeSun(d) {
        const N = 0.0;
        const i = 0.0;
        const w = 282.9404 + 4.70935E-5 * d;
        const a = 1.000000;  //(AU)
        const e = 0.016709 - 1.151E-9 * d;
        const M = 356.0470 + 0.9856002585 * d;

        return {N, i, w, a, e, M};
    },

    computePosition(d, {N, i, w, a, e, M}) {
        N = SunPosition.normalizeAngle360(N) * Angle.DEGREES_TO_RADIANS;
        i = SunPosition.normalizeAngle360(i) * Angle.DEGREES_TO_RADIANS;
        w = SunPosition.normalizeAngle360(w) * Angle.DEGREES_TO_RADIANS;
        //e = SunPosition.normalizeAngle360(e) * Angle.DEGREES_TO_RADIANS;
        M = SunPosition.normalizeAngle360(M) * Angle.DEGREES_TO_RADIANS;

        let E = M + e * Math.sin(M) * (1.0 + e * Math.cos(M));

        if (e >= 0.06) {
            for (var aa = 0; aa < 10; aa++) {
                var E1 = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
                if (Math.abs(E1 - E) < 0.001) {
                    E = E1;
                    break;
                }
                E = E1;
            }
        }

        const xv = a * (Math.cos(E) - e);
        const yv = a * (Math.sqrt(1.0 - e * e) * Math.sin(E));

        const v = Math.atan2(yv, xv);
        const r = Math.sqrt(xv * xv + yv * yv);

        let xh = r * (Math.cos(N) * Math.cos(v + w) - Math.sin(N) * Math.sin(v + w) * Math.cos(i));
        let yh = r * (Math.sin(N) * Math.cos(v + w) + Math.cos(N) * Math.sin(v + w) * Math.cos(i));
        let zh = r * (Math.sin(v + w) * Math.sin(i));

        const Epoch = 2000.0;
        const lon_corr = 3.82394E-5 * (365.2422 * (Epoch - 2000.0) - d) * Angle.DEGREES_TO_RADIANS;

        const lonecl = Math.atan2(yh, xh) + lon_corr;
        const latecl = Math.atan2(zh, Math.sqrt(xh * xh + yh * yh));


        /*** perturbations ***/
        /*** not implemented ***/


        xh = r * Math.cos(lonecl) * Math.cos(latecl);
        yh = r * Math.sin(lonecl) * Math.cos(latecl);
        zh = r * Math.sin(latecl);

        let {lonsun, rsun} = this.getLonSun(d, this.computeSun(d));
        lonsun *= Angle.RADIANS_TO_DEGREES;
        lonsun = SunPosition.normalizeAngle360(lonsun) * Angle.DEGREES_TO_RADIANS;

        const xs = rsun * Math.cos(lonsun);
        const ys = rsun * Math.sin(lonsun);

        const xg = xh + xs;
        const yg = yh + ys;
        const zg = zh;

        const ecl = SunPosition.normalizeAngle360(23.4393 - 3.563E-7 * d) * Angle.DEGREES_TO_RADIANS;

        const xe = xg;
        const ye = yg * Math.cos(ecl) - zg * Math.sin(ecl);
        const ze = yg * Math.sin(ecl) + zg * Math.cos(ecl);

        const ra = SunPosition.normalizeAngle360(Math.atan2(ye, xe) * Angle.RADIANS_TO_DEGREES);
        const dec = Math.atan2(ze, Math.sqrt(xe * xe + ye * ye)) * Angle.RADIANS_TO_DEGREES;

        return {ra, dec};
    },

    getLonSun(d, {w, e, M}) {
        w = SunPosition.normalizeAngle360(w) * Angle.DEGREES_TO_RADIANS;
        //e = SunPosition.normalizeAngle360(e) * Angle.DEGREES_TO_RADIANS;
        M = SunPosition.normalizeAngle360(M) * Angle.DEGREES_TO_RADIANS;

        const E = M + e * Math.sin(M) * (1.0 + e * Math.cos(M));

        const xv = Math.cos(E) - e;
        const yv = Math.sqrt(1.0 - e * e) * Math.sin(E);

        const v = Math.atan2(yv, xv);
        const rsun = Math.sqrt(xv * xv + yv * yv);

        const lonsun = v + w;

        return {lonsun, rsun};
    },

};

export default Celestial;