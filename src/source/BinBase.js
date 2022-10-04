/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_Feature from 'ol/Feature.js'
import ol_geom_Polygon from 'ol/geom/Polygon.js'
import ol_source_Vector from 'ol/source/Vector.js'
import { ol_coordinate_getFeatureCenter } from "../geom/GeomUtils.js";
import './Vector.js'

/** Abstract base class; normally only used for creating subclasses. Bin collector for data
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol_source_VectorOptions + grid option
 *  @param {ol.source.Vector} options.source Source
 *  @param {boolean} options.listenChange listen changes (move) on source features to recalculate the bin, default true
 *  @param {fucntion} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
var ol_source_BinBase = class olsourceBinBase extends ol_source_Vector {
  constructor(options) {
    options = options || {};
    super(options);

    this._bindModify = this._onModifyFeature.bind(this);
    this._watch = true;
    this._origin = options.source;
    this._listen = (options.listenChange !== false);

    // Geometry function
    this._geomFn = options.geometryFunction || ol_coordinate_getFeatureCenter || function (f) { return f.getGeometry().getFirstCoordinate(); };

    // Future features
    this._origin.on('addfeature', this._onAddFeature.bind(this));
    this._origin.on('removefeature', this._onRemoveFeature.bind(this));
    this._origin.on('clearstart', this._onClearFeature.bind(this));
    this._origin.on('clearend', this._onClearFeature.bind(this));
    if (typeof (options.flatAttributes) === 'function') {
      this._flatAttributes = options.flatAttributes;
    }

    // Handle exsting feature (should be called from children when fully created)
    // this.reset()
  }
  /**
   * On add feature
   * @param {ol.events.Event} e
   * @param {ol.Feature} bin
   * @private
   */
  _onAddFeature(e, bin, listen) {
    var f = e.feature || e.target;
    bin = bin || this.getBinAt(this._geomFn(f), true);
    if (bin)
      bin.get('features').push(f);
    if (this._listen && listen !== false)
      f.on('change', this._bindModify);
  }
  /**
   *  On remove feature
   *  @param {ol.events.Event} e
   *  @param {ol.Feature} bin
   *  @private
   */
  _onRemoveFeature(e, bin, listen) {
    if (!this._watch)
      return;
    var f = e.feature || e.target;
    bin = bin || this.getBinAt(this._geomFn(f));
    if (bin) {
      // Remove feature from bin
      var features = bin.get('features');
      for (var i = 0, fi; fi = features[i]; i++) {
        if (fi === f) {
          features.splice(i, 1);
          break;
        }
      }
      // Remove bin if no features
      if (!features.length) {
        this.removeFeature(bin);
      }
    } else {
      // console.log("[ERROR:Bin] remove feature: feature doesn't exists anymore.");
    }
    if (this._listen && listen !== false)
      f.un('change', this._bindModify);
  }
  /** When clearing features remove the listener
   * @private
   */
  _onClearFeature(e) {
    if (e.type === 'clearstart') {
      if (this._listen) {
        this._origin.getFeatures().forEach(function (f) {
          f.un('change', this._bindModify);
        }.bind(this));
      }
      this.clear();
      this._watch = false;
    } else {
      this._watch = true;
    }
  }
  /**
   * Get the bin that contains a feature
   * @param {ol.Feature} f the feature
   * @return {ol.Feature} the bin or null it doesn't exit
   */
  getBin(feature) {
    var bins = this.getFeatures();
    for (var i = 0, b; b = bins[i]; i++) {
      var features = b.get('features');
      for (var j = 0, f; f = features[j]; j++) {
        if (f === feature)
          return b;
      }
    }
    return null;
  }
  /** Get the grid geometry at the coord
   * @param {ol.Coordinate} coord
   * @param {Object} attributes add key/value to this object to add properties to the grid feature
   * @returns {ol.geom.Polygon}
   * @api
   */
  getGridGeomAt(coord /*, attributes */) {
    return new ol_geom_Polygon([coord]);
  }
  /** Get the bean at a coord
   * @param {ol.Coordinate} coord
   * @param {boolean} create true to create if doesn't exit
   * @return {ol.Feature} the bin or null it doesn't exit
   */
  getBinAt(coord, create) {
    var attributes = {};
    var g = this.getGridGeomAt(coord, attributes);
    if (!g)
      return null;
    var center = g.getInteriorPoint ? g.getInteriorPoint().getCoordinates() : g.getInteriorPoints().getCoordinates()[0]; // ol_extent_getCenter(g.getExtent());
    var features = this.getFeaturesAtCoordinate(center);
    var bin = features[0];
    if (!bin && create) {
      attributes.geometry = g;
      attributes.features = [];
      attributes.center = center;
      bin = new ol_Feature(attributes);
      this.addFeature(bin);
    }
    return bin || null;
  }
  /**
   *  A feature has been modified
   *  @param {ol.events.Event} e
   *  @private
   */
  _onModifyFeature(e) {
    var bin = this.getBin(e.target);
    var bin2 = this.getBinAt(this._geomFn(e.target), 'create');
    if (bin !== bin2) {
      // remove from the bin
      if (bin) {
        this._onRemoveFeature(e, bin, false);
      }
      // insert in the new bin
      if (bin2) {
        this._onAddFeature(e, bin2, false);
      }
    }
    this.changed();
  }
  /** Clear all bins and generate a new one.
   */
  reset() {
    this.clear();
    var features = this._origin.getFeatures();
    for (var i = 0, f; f = features[i]; i++) {
      this._onAddFeature({ feature: f });
    }
    this.changed();
  }
  /**
   * Get features without circular dependencies (vs. getFeatures)
   * @return {Array<ol.Feature>}
   */
  getGridFeatures() {
    var features = [];
    this.getFeatures().forEach(function (f) {
      var bin = new ol_Feature(f.getGeometry().clone());
      for (var i in f.getProperties()) {
        if (i !== 'features' && i !== 'geometry') {
          bin.set(i, f.get(i));
        }
      }
      bin.set('nb', f.get('features').length);
      this._flatAttributes(bin, f.get('features'));
      features.push(bin);
    }.bind(this));
    return features;
  }
  /** Create bin attributes using the features it contains when exporting
   * @param {ol.Feature} bin the bin to export
   * @param {Array<ol.Features>} features the features it contains
   */
  _flatAttributes( /*bin, features*/) {
  }
  /** Set the flatAttribute function
   * @param {function} fn Function that takes a bin and the features it contains and aggragate the features in the bin attributes when saving
   */
  setFlatAttributesFn(fn) {
    if (typeof (fn) === 'function')
      this._flatAttributes = fn;
  }
  /**
   * Get the orginal source
   * @return {ol_source_Vector}
   */
  getSource() {
    return this._origin;
  }
}

export default ol_source_BinBase
