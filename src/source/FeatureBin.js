  /*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_source_Vector from 'ol/source/Vector'
import ol_source_BinBase from './BinBase'
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
var ol_source_FeatureBin = function (options) {
  options = options || {};

  this._sourceFeature = new ol_source_Vector ({ features: options.features || [] });

  ol_source_BinBase.call(this, options);
};
ol_ext_inherits(ol_source_FeatureBin, ol_source_BinBase);

/** Set grid size
 * @param {ol.Feature} features
 */
ol_source_FeatureBin.prototype.setFeatures = function (features) {
  this._sourceFeature.clear();
  this._sourceFeature.addFeatures(features || []);
  this.reset();
};

/** Get the grid geometry at the coord 
 * @param {ol.Coordinate} coord
 * @returns {ol.geom.Polygon} 
 * @api
 */
ol_source_FeatureBin.prototype.getGridGeomAt = function (coord, attributes) {
  var f = this._sourceFeature.getFeaturesAtCoordinate(coord)[0];
  if (!f) return null;
  var a = f.getProperties();
  for (var i in a) {
    if (i!=='geometry') attributes[i] = a[i];
  }
  return f.getGeometry();
};

export default ol_source_FeatureBin
