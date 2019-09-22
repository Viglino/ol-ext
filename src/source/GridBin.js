/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_source_BinBase from './BinBase'
import {ol_ext_inherits} from '../util/ext'
import {transform as ol_proj_transform} from 'ol/proj'
import ol_geom_Polygon from 'ol/geom/Polygon'

/** A source for grid binning
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol_source_VectorOptions + grid option
 *  @param {ol.source.Vector} options.source Source
 *  @param {number} [options.size] size of the grid in meter, default 200m
 *  @param {function} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
var ol_source_GridBin = function (options) {
  options = options || {};

  ol_source_BinBase.call(this, options);
  
  this.set('gridProjection', options.gridProjection || 'EPSG:4326');
  this.set('size', options.size || 1);
};
ol_ext_inherits(ol_source_GridBin, ol_source_BinBase);

/** Set grid projection
 * @param {ol.ProjectionLike} proj
 */
ol_source_GridBin.prototype.setGridProjection = function (proj) {
  this.set('gridProjection', proj);
  this.reset();
};

/** Set grid size
 * @param {number} size
 */
ol_source_GridBin.prototype.setSize = function (size) {
  this.set('size', size);
  this.reset();
};

/** Get the grid geometry at the coord 
 * @param {ol.Coordinate} coord
 * @returns {ol.geom.Polygon} 
 * @api
 */
ol_source_GridBin.prototype.getGridGeomAt = function (coord) {
  coord = ol_proj_transform (coord, this.getProjection() || 'EPSG:3857', this.get('gridProjection'));
  var size = this.get('size');
  var x = size * Math.floor(coord[0] / size);
  var y = size * Math.floor(coord[1] / size);
  var geom = new ol_geom_Polygon([[[x,y], [x+size,y], [x+size,y+size], [x,y+size], [x,y]]]);
  return geom.transform(this.get('gridProjection'), this.getProjection() || 'EPSG:3857');
};

export default ol_source_GridBin
