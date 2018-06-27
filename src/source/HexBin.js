/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	
*/

import ol from 'ol'
import ol_Feature from 'ol/feature'
import ol_geom_Polygon from 'ol/geom/polygon'
import ol_geom_Point from 'ol/geom/point'
import ol_coordinate from 'ol/coordinate'
import ol_source_Vector from 'ol/source/vector'
import ol_extent from 'ol/extent'
import ol_HexGrid from '../render/HexGrid'

/** A source for hexagonal binning
* @constructor 
* @extends {ol_source_Vector}
* @param {} options ol_source_VectorOptions + ol.HexGridOptions
*	 @param {ol_source_Vector} options.source Source
*	 @param {Number} options.size size of the exagon in map units, default 80000
*	 @param {ol.coordinate} options.origin orgin of the grid, default [0,0]
*	 @param {pointy|flat} options.layout grid layout, default pointy
*	 @param {function|undefined} options.geometryFunction Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center. 
*/
var ol_source_HexBin = function(options) {
  options = options || {} ;
	
	// bind function for callback
	this._bind = { modify: this._onModifyFeature.bind(this) };
	
	ol_source_Vector.call (this, options);

	// The HexGrid
	this._hexgrid = new ol_HexGrid(options);
	this._bin = {};
	// Source and origin
	this._origin = options.source;
	// Geometry function to get a point
	this._geomFn = options.geometryFunction || ol_coordinate.getFeatureCenter || function(f) { return f.getGeometry().getFirstCoordinate(); };
	// Existing features
	this.reset();
	// Future features
	this._origin.on("addfeature", this._onAddFeature.bind(this));
	this._origin.on("removefeature", this._onRemoveFeature.bind(this));
};
ol.inherits (ol_source_HexBin, ol_source_Vector);

/**
 * On add feature
 * @param {ol.Event} e 
 * @private
 */
ol_source_HexBin.prototype._onAddFeature = function(e) {
  var f = e.feature || e.target;
  var h = this._hexgrid.coord2hex(this._geomFn(f));
	var id = h.toString();
	if (this._bin[id]) {
    this._bin[id].get('features').push(f);
	} else { 
    var ex = new ol_Feature(new ol_geom_Polygon([this._hexgrid.getHexagon(h)]));
		ex.set('features',[f]);
		ex.set('center', new ol_geom_Point(ol_extent.getCenter(ex.getGeometry().getExtent())));
		this._bin[id] = ex;
		this.addFeature(ex);
	}
	f.on("change", this._bind.modify);
};

/**
 * Get the hexagon of a feature
 * @param {ol.Feature} f 
 * @return {} the bin id, the index of the feature in the bin and a boolean if the feature has moved to an other bin
 */
ol_source_HexBin.prototype.getBin = function(f) {
  // Test if feature exists in the current hex
	var id = this._hexgrid.coord2hex(this._geomFn(f)).toString();
	if (this._bin[id]) {
    var index = this._bin[id].get('features').indexOf(f);
		if (index > -1) return { id:id, index:index };
	}
	// The feature has moved > check all bins
	for (id in this._bin) {
    var index = this._bin[id].get('features').indexOf(f);
		if (index > -1) return { id:id, index:index, moved:true };
	}
	return false;
};

/**
 * On remove feature
 * @param {ol.Event} e 
 * @param {*} bin 
 * @private
 */
ol_source_HexBin.prototype._onRemoveFeature = function(e, bin) {
  var f = e.feature || e.target;
  var b = bin || this.getBin(f);
	if (b) {
    var features = this._bin[b.id].get('features');
		features.splice(b.index, 1);
		if (!features.length) {
      this.removeFeature(this._bin[b.id]);
			delete this._bin[b.id];
		}
	} else {
    console.log("[ERROR:HexBin] remove feature feature doesn't exists anymore.");
	}
	f.un("change", this._bind.modify);
};

/**
 * A feature has been modified
 * @param {ol.Event} e 
 * @private
 */
ol_source_HexBin.prototype._onModifyFeature = function(e) {
  var bin = this.getBin(e.target);
	if (bin && bin.moved) {
    // remove from the bin
		this._onRemoveFeature(e, bin);
		// insert in the new bin
		this._onAddFeature(e);
	}	
	this.changed();
};

/** Clear all bins and generate a new one
 */
ol_source_HexBin.prototype.reset = function() {
  this._bin = {};
	this.clear();
	var features = this._origin.getFeatures();
	for (var i=0, f; f=features[i]; i++) {
    this._onAddFeature({ feature:f });
	};
};

/**
* Get the orginal source 
* @return {ol_source_Vector}
*/
ol_source_HexBin.prototype.getSource = function() {
  return this._origin;
};

export default ol_source_HexBin