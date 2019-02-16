  /*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_Feature from 'ol/Feature'
import ol_geom_Polygon from 'ol/geom/Polygon'
import ol_geom_Point from 'ol/geom/Point'
import ol_source_Vector from 'ol/source/Vector'
import { getCenter as ol_extent_getCenter } from 'ol/extent'
import { ol_coordinate_getFeatureCenter } from "../geom/GeomUtils";

import ol_InseeGrid from '../render/InseeGrid';
import {ol_ext_inherits} from '../util/ext'

/** A source for INSEE grid
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol_source_VectorOptions + grid option
 *  @param {ol.source.Vector} options.source Source
 *  @param {number} [options.size] size of the grid in meter, default 200m
 *  @param {(f: ol.Feature) => ol.geom.Point} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {(bin: ol.Feature, features: Array<ol.Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
var ol_source_InseeGrid = function (options) {
  options = options || {};
  this._bindModify = this._onModifyFeature.bind(this);

  ol_source_Vector.call(this, options);

  this._origin = options.source;

  this._grid = new ol_InseeGrid({ size: options.size });

  // Geometry function
  this._geomFn = options.geometryFunction || ol_coordinate_getFeatureCenter || function (f) { return f.getGeometry().getFirstCoordinate(); };

  // Existing features
  this.reset();

  // Future features
  this._origin.on("addfeature", this._onAddFeature.bind(this));
  this._origin.on("removefeature", this._onRemoveFeature.bind(this));
  if (typeof (options.flatAttributes) === 'function') options.flatAttributes;

};
ol_ext_inherits(ol_source_InseeGrid, ol_source_Vector);

ol_source_InseeGrid.prototype.setSize = function (size) {
  this._grid.set('size', size);
  this.reset();
};

/**
 * On add feature
 * @param {ol.events.Event} e
 * @param {ol.Feature} bin
 * @private
 */
ol_source_InseeGrid.prototype._onAddFeature = function (e, bin) {
  var f = e.feature || e.target;
  bin = bin || this.getBinAt(this._geomFn(f), true);
  bin.get('features').push(f);
  f.on("change", this._bindModify);
};

/**
 *  On remove feature
 *  @param {ol.events.Event} e
 *  @param {ol.Feature} bin
 *  @private
 */
ol_source_InseeGrid.prototype._onRemoveFeature = function (e, bin) {
  var f = e.feature || e.target;
  bin = bin || this.getBinAt(this._geomFn(f));
  if (bin) {
    // Remove feature from bin
    var features = bin.get('features');
    for (var i=0, fi; fi=features[i]; i++) {
      if (fi===f) {
        features.splice(i, 1);
        break;
      }
    }
    // Remove bin if no features
    if (!features.length) {
      this.removeFeature(bin);
    }
  } else {
    console.log("[ERROR:Bin] remove feature: feature doesn't exists anymore.");
  }
  f.un("change", this._bindModify);
};

/**
 * Get the bin that contains a feature
 * @param {ol.Feature} f the feature
 * @return {ol.Feature|boolean} the bin or false it doesn't exit
 */
ol_source_InseeGrid.prototype.getBin = function (feature) {
  var bins = this.getFeatures();
  for (var i=0, b; b = bins[i]; i++) {
    var features = b.get('features');
    for (var j=0, f; f=features[j]; j++) {
      if (f===feature) return b;
    }
  }
  return false;
}

/** Get the bean at a coord
 * @param {ol.Coordinate} coord
 * @param {boolean} create true to create if doesn't exit
 * @return {ol.Feature|boolean} the bin or false it doesn't exit
 */
ol_source_InseeGrid.prototype.getBinAt = function (coord, create) {
  var g = this._grid.getGridAtCoordinate(coord, this.getProjection());
  var center = ol_extent_getCenter(g.getExtent());
  var features = this.getFeaturesAtCoordinate( center );
  var bin = features[0];
  if (!bin && create) {
    bin = new ol_Feature({ geometry: g, features: [], center: center });
    this.addFeature(bin);
  }
  return bin;
};

/**
 *  A feature has been modified
 *  @param {ol.events.Event} e
 *  @private
 */
ol_source_InseeGrid.prototype._onModifyFeature = function (e) {
  var bin = this.getBin(e.target);
  var bin2 = this.getBinAt(this._geomFn(e.target), 'create');
  if (bin && bin !== bin2) {
    // remove from the bin
    this._onRemoveFeature(e, bin);
    // insert in the new bin
    this._onAddFeature(e, bin2);
  }
  this.changed();
};

/** Clear all bins and generate a new one. 
 */
ol_source_InseeGrid.prototype.reset = function () {
  this.clear();
  var features = this._origin.getFeatures();
  for (var i = 0, f; f = features[i]; i++) {
    this._onAddFeature({ feature: f });
  }
};

/** Get grid extent 
 * @param {ol.ProjectionLike} proj
 * @return {ol.Extent}
 */
ol_source_InseeGrid.prototype.getGridExtent = function (proj) {
  return this._grid.getExtent(proj);
};

/** Flatten a list of features associated with a bin
 * @param {ol.Feature} bin the bin feature
 * @param {<Array<ol.Feature>} features features associated with the bin
 */
ol_source_InseeGrid.prototype._flatAttributes = function (bin, features) {
};

/**
 * Get features withour circular dependencies (vs. getFeatures)
 * @return {Array<ol.Feature>}
 */
ol_source_InseeGrid.prototype.getGridFeatures = function () {
  var features = [];
  this.getFeatures().forEach(function (f) {
    var bin = new ol_Feature(f.getGeometry().clone());
    for (var i in f.getProperties()) {
      if (i!=='features' && i!=='geometry') {
        bin.set(i, f.get(i));
      }
    };
    bin.set('nb', f.get('features').length);
    this._flatAttributes(bin, f.get('features'));
    features.push(bin);
  }.bind(this));
  return features;
};

export default ol_source_InseeGrid
