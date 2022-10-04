/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_source_Vector from 'ol/source/Vector.js'
import ol_source_BinBase from './BinBase.js'

/** A source that use a set of feature to collect data on it.
 * If a binSource is provided the bin is recalculated when features change.
 * @constructor
 * @extends {ol_source_BinBase}
 * @param {Object} options ol_source_VectorOptions + grid option
 *  @param {ol.source.Vector} options.source source to collect in the bin
 *  @param {ol.source.Vector} options.binSource a source to use as bin collector, default none
 *  @param {Array<ol.Feature>} options.features the features, ignored if binSource is provided, default none
 *  @param {number} [options.size] size of the grid in meter, default 200m
 *  @param {function} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
var ol_source_FeatureBin = class olsourceFeatureBin extends ol_source_BinBase {
  constructor(options) {
    options = options || {};
    super(options);

    if (options.binSource) {
      this._sourceFeature = options.binSource;
      // When features change recalculate the bin...
      var timout;
      this._sourceFeature.on(['addfeature', 'changefeature', 'removefeature'], function () {
        if (timout) {
          // Do it only one time
          clearTimeout(timout);
        }
        timout = setTimeout(function () {
          this.reset();
        }.bind(this));
      }.bind(this));
    } else {
      this._sourceFeature = new ol_source_Vector({ features: options.features || [] });
    }

    // Handle existing features
    this.reset();
  }
  /** Set features to use as bin collector
   * @param {ol.Feature} features
   */
  setFeatures(features) {
    this._sourceFeature.clear();
    this._sourceFeature.addFeatures(features || []);
    this.reset();
  }
  /** Get the grid geometry at the coord
   * @param {ol.Coordinate} coord
   * @returns {ol.geom.Polygon}
   * @api
   */
  getGridGeomAt(coord, attributes) {
    var f = this._sourceFeature.getFeaturesAtCoordinate(coord)[0];
    if (!f)
      return null;
    var a = f.getProperties();
    for (var i in a) {
      if (i !== 'geometry')
        attributes[i] = a[i];
    }
    return f.getGeometry();
  }
}

export default ol_source_FeatureBin
