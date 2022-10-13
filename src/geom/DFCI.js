/*
	Copyright (c) 2018 Jean-Marc VIGLINO,
	released under the CeCILL-B license (http://www.cecill.info/).
*/

import {get as ol_proj_get} from 'ol/proj.js';
import {transform as ol_proj_transform} from 'ol/proj.js';
import {register as ol_proj_proj4_register} from 'ol/proj/proj4.js';
import proj4 from 'proj4.js';

/** Convert coordinate to French DFCI grid
 * @param {ol/coordinate} coord
 * @param {number} level [0-3]
 * @param {ol/proj/Projection} projection of the coord, default EPSG:27572
 * @return {String} the DFCI index
 */
var ol_coordinate_toDFCI = function (coord, level, projection) {
  if (!level && level !==0) level = 3;
  if (projection) {
    if (!ol_proj_get('EPSG:27572')) {
      // Add Lambert IIe proj 
      if (!proj4.defs["EPSG:27572"]) proj4.defs("EPSG:27572","+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs");
      ol_proj_proj4_register(proj4);
    }
    coord = ol_proj_transform(coord, projection, 'EPSG:27572');
  }
  var x = coord[0];
  var y = coord[1];
  var s = '';
  // Level 0
  var step = 100000;
  s += String.fromCharCode(65 + Math.floor((x<800000?x:x+200000)/step))
    + String.fromCharCode(65 + Math.floor((y<2300000?y:y+200000)/step) - 1500000/step);
  if (level === 0) return s;
  // Level 1
  var step1 = 100000/5;
  s += 2*Math.floor((x%step)/step1);
  s += 2*Math.floor((y%step)/step1);
  if (level === 1) return s;
  // Level 2
  var step2 = step1 / 10;
  var x0 = Math.floor((x%step1)/step2);
  s += String.fromCharCode(65 + (x0<8 ? x0 : x0+2));
  s += Math.floor((y%step1)/step2);
  if (level === 2) return s;
  // Level 3
  var x3 = Math.floor((x%step2)/500);
  var y3 = Math.floor((y%step2)/500);
  if (x3<1) {
    if (y3>1) s += '.1';
    else s += '.4';
  } else if (x3>2) {
    if (y3>1) s += '.2';
    else s += '.3';
  } else if (y3>2) {
    if (x3<2) s += '.1';
    else s += '.2';
  } else if (y3<1) {
    if (x3<2) s += '.4';
    else s += '.3';
  } else {
    s += '.5';
  }
  return s;
};

/** Get coordinate from French DFCI index
 * @param {String} index the DFCI index
 * @param {ol/proj/Projection} projection result projection, default EPSG:27572
 * @return {ol/coordinate} coord
 */
var ol_coordinate_fromDFCI = function (index, projection) {
  var coord;

  // Level 0
  var step = 100000;
  var x = index.charCodeAt(0) - 65;
  x = (x<8 ? x : x-2)*step;
  var y = index.charCodeAt(1) - 65;
  y = (y<8 ? y : y-2)*step + 1500000;
  if (index.length===2) {
    coord = [x+step/2, y+step/2];
  } else {
    // Level 1
    step /= 5;
    x += Number(index.charAt(2))/2*step;
    y += Number(index.charAt(3))/2*step;
    if (index.length===4) {
      coord = [x+step/2, y+step/2];
    } else {
      // Level 2
      step /= 10;
      var x0 = index.charCodeAt(4) - 65;
      x += (x0<8 ? x0 : x0-2)*step;
      y += Number(index.charAt(5))*step;
      if (index.length === 6) {
        coord = [x+step/2, y+step/2];
      } else {
        // Level 3
        switch (index.charAt(7)) {
          case '1':
            coord = [x+step/4, y+3*step/4];
            break;
          case '2':
            coord = [x+3*step/4, y+3*step/4];
            break;
          case '3':
            coord = [x+3*step/4, y+step/4];
            break;
          case '4':
            coord = [x+step/4, y+step/4];
            break;
          default:
            coord = [x+step/2, y+step/2];
            break;
        }
      }
    }
  }

  // Convert ?
  if (projection) {
    if (!ol_proj_get('EPSG:27572')) {
      // Add Lambert IIe proj 
      if (!proj4.defs["EPSG:27572"]) proj4.defs("EPSG:27572","+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs");
      ol_proj_proj4_register(proj4);
    }
    coord = ol_proj_transform(coord, 'EPSG:27572', projection);
  }

  return coord;
};

/** The string is a valid DFCI index
 * @param {string} index DFCI index
 * @return {boolean}
 */
var ol_coordinate_validDFCI = function (index) {
  if (index.length<2 || index.length>8) return false;
  if (/[^A-H|^K-N]/.test(index.substr(0,1))) return false;
  if (/[^B-H|^K-N]/.test(index.substr(1,1))) return false;
  if (index.length>2) {
    if (index.length<4) return false;
    if (/[^0,^2,^4,^6,^8]/.test(index.substr(2,1))) return false;
    if (/[^0,^2,^4,^6,^8]/.test(index.substr(3,1))) return false;
  }
  if (index.length>4) {
    if (index.length<6) return false;
    if (/[^A-H|^K-L]/.test(index.substr(4,1))) return false;
    if (/[^0-9]/.test(index.substr(5,1))) return false;
  }
  if (index.length>6) {
    if (index.length<8) return false;
    if (index.substr(6,1)!=='.') return false;
    if (/[^1-5]/.test(index.substr(7,1))) return false;
  }
  return true;
}

/** Coordinate is valid for DFCI 
 * @param {ol/coordinate} coord
 * @param {ol/proj/Projection} projection result projection, default EPSG:27572
 * @return {boolean}
 */
var ol_coordinate_validDFCICoord = function (coord, projection) {
  if (projection) {
    if (!ol_proj_get('EPSG:27572')) {
      // Add Lambert IIe proj 
      if (!proj4.defs["EPSG:27572"]) proj4.defs("EPSG:27572","+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs");
      ol_proj_proj4_register(proj4);
    }
    coord = ol_proj_transform(coord, projection, 'EPSG:27572');
  }
  // Test extent
  if (0 > coord[0] || coord[0] > 1200000 ) return false;
  if (1600000 > coord[1] || coord[1] > 2700000 ) return false;
  return true;
};

export {ol_coordinate_toDFCI}
export {ol_coordinate_fromDFCI}
export {ol_coordinate_validDFCI}
export {ol_coordinate_validDFCICoord}