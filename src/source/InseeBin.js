/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_source_BinBase from './BinBase'
import ol_InseeGrid from '../render/InseeGrid';
import {ol_ext_inherits} from '../util/ext'

/** A source for INSEE grid
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol_source_VectorOptions + grid option
 *  @param {ol.source.Vector} options.source Source
 *  @param {number} [options.size] size of the grid in meter, default 200m
 *  @param {function} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
var ol_source_InseeBin = function (options) {
  options = options || {};

  this._grid = new ol_InseeGrid({ size: options.size });

  ol_source_BinBase.call(this, options);
};
ol_ext_inherits(ol_source_InseeBin, ol_source_BinBase);

/** Set grid size
 * @param {number} size
 */
ol_source_InseeBin.prototype.setSize = function (size) {
  if (this.getSize() !== size) {
    this._grid.set('size', size);
    this.reset();
  }
};

/** Get grid size
 * @return {number} size
 */
ol_source_InseeBin.prototype.getSize = function () {
  return this._grid.get('size');
};

/** Get the grid geometry at the coord 
 * @param {ol.Coordinate} coord
 * @returns {ol.geom.Polygon} 
 * @api
 */
ol_source_InseeBin.prototype.getGridGeomAt = function (coord) {
  return this._grid.getGridAtCoordinate(coord, this.getProjection());
};

/** Get grid extent 
 * @param {ol.ProjectionLike} proj
 * @return {ol.Extent}
 */
ol_source_InseeBin.prototype.getGridExtent = function (proj) {
  return this._grid.getExtent(proj);
};

export default ol_source_InseeBin
