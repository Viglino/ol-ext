/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_geom_Polygon from 'ol/geom/Polygon.js'
import ol_Feature from 'ol/Feature.js'
import ol_source_Vector from 'ol/source/Vector.js'
import {all as ol_loadingstrategy_all} from 'ol/loadingstrategy.js'

/** DayNight source: a source to display day/night on a map
 * @constructor 
 * @extends {ol.source.Vector}
 * @param {any} options Vector source options
 *  @param {string|Date} time source date time
 *  @param {number} step step in degree for coordinate precision
 */
var ol_source_DayNight = class olsourceDayNight extends ol_source_Vector {
  constructor(options) {
    options = options || {};
    options.strategy = ol_loadingstrategy_all;
    super(options);
    this.setLoader(this._loader);
    this.set('time', options.time || new Date());
    this.set('step', options.step || 1);
  }
  /** Compute the position of the Sun in ecliptic coordinates at julianDay.
   * @see http://en.wikipedia.org/wiki/Position_of_the_Sun
   * @param {number} julianDay
   * @private
   */
  static _sunEclipticPosition(julianDay) {
    var deg2rad = Math.PI / 180;
    // Days since start of J2000.0
    var n = julianDay - 2451545.0;
    // mean longitude of the Sun
    var L = 280.460 + 0.9856474 * n;
    L %= 360;
    // mean anomaly of the Sun
    var g = 357.528 + 0.9856003 * n;
    g %= 360;
    // ecliptic longitude of Sun
    var lambda = L + 1.915 * Math.sin(g * deg2rad) +
      0.02 * Math.sin(2 * g * deg2rad);
    // distance from Sun in AU
    var R = 1.00014 - 0.01671 * Math.cos(g * deg2rad) -
      0.0014 * Math.cos(2 * g * deg2rad);
    return { lambda: lambda, R: R };
  }
  /**
   * @see http://en.wikipedia.org/wiki/Axial_tilt#Obliquity_of_the_ecliptic_.28Earth.27s_axial_tilt.29
   * @param {number} julianDay
   * @private
   */
  static _eclipticObliquity(julianDay) {
    var n = julianDay - 2451545.0;
    // Julian centuries since J2000.0
    var T = n / 36525;
    var epsilon = 23.43929111 -
      T * (46.836769 / 3600
        - T * (0.0001831 / 3600
          + T * (0.00200340 / 3600
            - T * (0.576e-6 / 3600
              - T * 4.34e-8 / 3600))));
    return epsilon;
  }
  /* Compute the Sun's equatorial position from its ecliptic position.
   * @param {number} sunEclLng sun lon in degrees
   * @param {number} eclObliq secliptic position in degrees
   * @return {number} position in degrees
   * @private
   */
  static _sunEquatorialPosition(sunEclLon, eclObliq) {
    var rad2deg = 180 / Math.PI;
    var deg2rad = Math.PI / 180;

    var alpha = Math.atan(Math.cos(eclObliq * deg2rad)
      * Math.tan(sunEclLon * deg2rad)) * rad2deg;
    var delta = Math.asin(Math.sin(eclObliq * deg2rad)
      * Math.sin(sunEclLon * deg2rad)) * rad2deg;

    var lQuadrant = Math.floor(sunEclLon / 90) * 90;
    var raQuadrant = Math.floor(alpha / 90) * 90;
    alpha = alpha + (lQuadrant - raQuadrant);

    return { alpha: alpha, delta: delta };
  }
  /** Get the day/night separation latitude
   * @param {number} lon
   * @param {Date} time
   * @returns {number}
   */
  static getNightLat(lon, time) {
    var rad2deg = 180 / Math.PI;
    var deg2rad = Math.PI / 180;

    var date = time ? new Date(time) : new Date();

    // Calculate the present UTC Julian Date. 
    // Function is valid after the beginning of the UNIX epoch 1970-01-01 and ignores leap seconds. 
    var julianDay = (date / 86400000) + 2440587.5;

    // Calculate Greenwich Mean Sidereal Time (low precision equation).
    // http://aa.usno.navy.mil/faq/docs/GAST.php 
    var gst = (18.697374558 + 24.06570982441908 * (julianDay - 2451545.0)) % 24;

    var sunEclPos = ol_source_DayNight._sunEclipticPosition(julianDay);
    var eclObliq = ol_source_DayNight._eclipticObliquity(julianDay);
    var sunEqPos = ol_source_DayNight._sunEquatorialPosition(sunEclPos.lambda, eclObliq);

    // Hour angle (indegrees) of the sun for a longitude on Earth.
    var ha = (gst * 15 + lon) - sunEqPos.alpha;
    // Latitude     
    var lat = Math.atan(-Math.cos(ha * deg2rad) /
      Math.tan(sunEqPos.delta * deg2rad)) * rad2deg;

    return lat;
  }
  /** Loader
   * @private
   */
  _loader(extent, resolution, projection) {
    var lonlat = this.getCoordinates(this.get('time'));
    var geom = new ol_geom_Polygon([lonlat]);
    geom.transform('EPSG:4326', projection);
    this.addFeature(new ol_Feature(geom));
  }
  /** Set source date time
   * @param {string|Date} time source date time
   */
  setTime(time) {
    this.set('time', time);
    this.refresh();
  }
  /** Get sun coordinates on earth
   * @param {string} time DateTime string, default yet
   * @returns {ol.coordinate} position in lonlat
   */
  getSunPosition(time) {
    var date = time ? new Date(time) : new Date();

    // Calculate the present UTC Julian Date. 
    // Function is valid after the beginning of the UNIX epoch 1970-01-01 and ignores leap seconds. 
    var julianDay = (date / 86400000) + 2440587.5;

    // Calculate Greenwich Mean Sidereal Time (low precision equation).
    // http://aa.usno.navy.mil/faq/docs/GAST.php 
    var gst = (18.697374558 + 24.06570982441908 * (julianDay - 2451545.0)) % 24;

    var sunEclPos = ol_source_DayNight._sunEclipticPosition(julianDay);
    var eclObliq = ol_source_DayNight._eclipticObliquity(julianDay);
    var sunEqPos = ol_source_DayNight._sunEquatorialPosition(sunEclPos.lambda, eclObliq);

    return [sunEqPos.alpha - gst * 15, sunEqPos.delta];
  }
  /** Get night-day separation line
   * @param {string} time DateTime string, default yet
   * @param {string} options use 'line' to get the separation line, 'day' to get the day polygon, 'night' to get the night polygon or 'daynight' to get both polygon, default 'night'
   * @return {Array<ol.Point>|Array<Array<ol.Point>>}
   */
  getCoordinates(time, options) {
    var rad2deg = 180 / Math.PI;
    var deg2rad = Math.PI / 180;

    var date = time ? new Date(time) : new Date();

    // Calculate the present UTC Julian Date. 
    // Function is valid after the beginning of the UNIX epoch 1970-01-01 and ignores leap seconds. 
    var julianDay = (date / 86400000) + 2440587.5;

    // Calculate Greenwich Mean Sidereal Time (low precision equation).
    // http://aa.usno.navy.mil/faq/docs/GAST.php 
    var gst = (18.697374558 + 24.06570982441908 * (julianDay - 2451545.0)) % 24;
    var lonlat = [];

    var sunEclPos = ol_source_DayNight._sunEclipticPosition(julianDay);
    var eclObliq = ol_source_DayNight._eclipticObliquity(julianDay);
    var sunEqPos = ol_source_DayNight._sunEquatorialPosition(sunEclPos.lambda, eclObliq);

    var step = this.get('step') || 1;
    for (var i = -180; i <= 180; i += step) {
      var lon = i;
      // Hour angle (indegrees) of the sun for a longitude on Earth.
      var ha = (gst * 15 + lon) - sunEqPos.alpha;
      // Latitude     
      var lat = Math.atan(-Math.cos(ha * deg2rad) /
        Math.tan(sunEqPos.delta * deg2rad)) * rad2deg;
      // New point
      lonlat.push([lon, lat]);
    }
    switch (options) {
      case 'line': break;
      case 'day': sunEqPos.delta *= -1;
      // fallthrough
      default: {
        // Close polygon
        lat = (sunEqPos.delta < 0) ? 90 : -90;
        for (var tlon = 180; tlon >= -180; tlon -= step) {
          lonlat.push([tlon, lat]);
        }
        lonlat.push(lonlat[0]);
        break;
      }
    }
    // Return night + day polygon
    if (options === 'daynight') {
      var day = [];
      lonlat.forEach(function (t) { day.push(t.slice()); });
      day[0][1] = -day[0][1];
      day[day.length - 1][1] = -day[0][1];
      day[day.length - 1][1] = -day[0][1];
      lonlat = [lonlat, day];
    }
    // Return polygon
    return lonlat;
  }
}

export default ol_source_DayNight
