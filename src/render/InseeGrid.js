/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import proj4 from 'proj4.js'
import ol_Object from 'ol/Object.js'
import {register as ol_proj_proj4_register} from 'ol/proj/proj4.js';
import {transform as ol_proj_transform} from 'ol/proj.js'
import {transformExtent as ol_proj_transformExtent} from 'ol/proj.js'
import ol_geom_Polygon from 'ol/geom/Polygon.js'

/**
 * French INSEE grids
 * @classdesc a class to compute French INSEE grids, ie. fix area (200x200m) square grid, 
 * based appon EPSG:3035
 *
 * @requires proj4
 * @constructor 
 * @extends {ol_Object}
 * @param {Object} [options]
 *  @param {number} [options.size] size grid size in meter, default 200 (200x200m)
 */
var ol_InseeGrid = class olInseeGrid extends ol_Object {
  constructor(options) {
    options = options || {};

    // Define EPSG:3035 if none
    if (!proj4.defs["EPSG:3035"]) {
      proj4.defs("EPSG:3035", "+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m +no_defs");
      ol_proj_proj4_register(proj4);
    }

    super(options);

    // Options
    var size = Math.max(200, Math.round((options.size || 0) / 200) * 200);
    this.set('size', size);
  }
  /** Get the grid extent
   * @param {ol.proj.ProjLike} [proj='EPSG:3857']
   */
  getExtent(proj) {
    return ol_proj_transformExtent(ol_InseeGrid.extent, proj || 'EPSG:3035', 'EPSG:3857');
  }
  /** Get grid geom at coord
   * @param {ol.Coordinate} coord
   * @param {ol.proj.ProjLike} [proj='EPSG:3857']
   */
  getGridAtCoordinate(coord, proj) {
    var c = ol_proj_transform(coord, proj || 'EPSG:3857', 'EPSG:3035');
    var s = this.get('size');
    var x = Math.floor(c[0] / s) * s;
    var y = Math.floor(c[1] / s) * s;
    var geom = new ol_geom_Polygon([[[x, y], [x + s, y], [x + s, y + s], [x, y + s], [x, y]]]);
    geom.transform('EPSG:3035', proj || 'EPSG:3857');
    return geom;
  }
}

/** Default grid extent (in EPSG:3035)
 */
ol_InseeGrid.extent = [3200000,2000000,4300000,3140000];

export default ol_InseeGrid