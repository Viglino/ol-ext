/*	Copyright (c) 2017 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).

*/


import { inherits as ol_inherits } from 'ol'
import ol_Feature from 'ol/Feature'
import ol_geom_Polygon from 'ol/geom/Polygon'
import ol_geom_Point from 'ol/geom/Point'
import ol_source_Vector from 'ol/source/Vector'
import { getCenter as ol_extent_getCenter } from 'ol/extent'
import ol_HexGrid from '../render/HexGrid'
import { ol_coordinate_getFeatureCenter } from "../geom/GeomUtils";


/** A source for hexagonal binning
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol_source_VectorOptions + ol.HexGridOptions
 *	 @param {ol.source.Vector} options.source Source
 *	 @param {number} [options.size] size of the hexagon in map units, default 80000
 *	 @param {ol.coordinate} [options.origin] origin of the grid, default [0,0]
 *	 @param {import('../render/HexGrid').HexagonLayout} [options.layout] grid layout, default pointy
 *	 @param {(f: ol.Feature) => ol.geom.Point} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 */
var ol_source_HexBin = function (options) {
	options = options || {};

	/** Bind function for callback
	 * 	@type {{modify: (e: ol.events.Event) => void}}
	 */
	this._bind = { modify: this._onModifyFeature.bind(this) };

	ol_source_Vector.call(this, options);

	/** The HexGrid
	 * 	@type {ol_HexGrid}
	 */
	this._hexgrid = new ol_HexGrid(options);
	/** @type {{[key: string]: ol.Feature}} */
	this._bin = {};

	/** Source and origin
	 * 	@type {ol.source.Vector}
	 */
	this._origin = options.source;
	/** Geometry function to get a point
	 * 	@type {ol.Coordinate | ((f: ol.Feature) => ol.geom.Point)}
	 */
	this._geomFn = options.geometryFunction || ol_coordinate_getFeatureCenter || function (f) { return f.getGeometry().getFirstCoordinate(); };
	// Existing features
	this.reset();
	// Future features
	this._origin.on("addfeature", this._onAddFeature.bind(this));
	this._origin.on("removefeature", this._onRemoveFeature.bind(this));
};
ol_inherits(ol_source_HexBin, ol_source_Vector);

/**
 * On add feature
 * @param {ol.events.Event} e
 * @private
 */
ol_source_HexBin.prototype._onAddFeature = function (e) {
	var f = e.feature || e.target;
	var h = this._hexgrid.coord2hex(this._geomFn(f));
	var id = h.toString();
	if (this._bin[id]) {
		this._bin[id].get('features').push(f);
	} else {
		var ex = new ol_Feature(new ol_geom_Polygon([this._hexgrid.getHexagon(h)]));
		ex.set('features', [f]);
		ex.set('center', new ol_geom_Point(ol_extent_getCenter(ex.getGeometry().getExtent())));
		this._bin[id] = ex;
		this.addFeature(ex);
	}
	f.on("change", this._bind.modify);
};

/** @typedef {Object} Bin ???
 * 	@property {string} id
 * 	@property {number} index
 * 	@property {boolean} [moved]
 */

/**
 *  Get the hexagon of a feature
 *  @param {ol.Feature} f
 *  @return {Bin} the bin id, the index of the feature in the bin and a boolean if the feature has moved to an other bin
 */
ol_source_HexBin.prototype.getBin = function (f) {
	// Test if feature exists in the current hex
	var index, id = this._hexgrid.coord2hex(this._geomFn(f)).toString();
	if (this._bin[id]) {
		index = this._bin[id].get('features').indexOf(f);
		if (index > -1) return { id: id, index: index };
	}
	// The feature has moved > check all bins
	for (id in this._bin) {
		index = this._bin[id].get('features').indexOf(f);
		if (index > -1) return { id: id, index: index, moved: true };
	}
	return false;
};

/**
 *  On remove feature
 *  @param {ol.events.Event} e
 *  @param {Bin} bin
 *  @private
 */
ol_source_HexBin.prototype._onRemoveFeature = function (e, bin) {
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
 *  A feature has been modified
 *  @param {ol.events.Event} e
 *  @private
 */
ol_source_HexBin.prototype._onModifyFeature = function (e) {
	var bin = this.getBin(e.target);
	if (bin && bin.moved) {
		// remove from the bin
		this._onRemoveFeature(e, bin);
		// insert in the new bin
		this._onAddFeature(e);
	}
	this.changed();
};

/** Clear all bins and generate a new one. */
ol_source_HexBin.prototype.reset = function () {
	this._bin = {};
	this.clear();
	var features = this._origin.getFeatures();
	for (var i = 0, f; f = features[i]; i++) {
		this._onAddFeature({ feature: f });
	}
};

/**	Set the inner HexGrid size.
 * 	@param {number} newSize
 * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
 */
ol_source_HexBin.prototype.setSize = function setSize(newSize, noreset) {
	this._hexgrid.setSize(newSize);
	if (!noreset) {
		this.reset();
	}
}

/**	Get the inner HexGrid size.
 * 	@return {number}
 */
ol_source_HexBin.prototype.getSize = function getSize() {
	return this._hexgrid.getSize();
}

/**	Set the inner HexGrid layout.
 * 	@param {import('../render/HexGrid').HexagonLayout} newLayout
 * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
 */
ol_source_HexBin.prototype.setLayout = function setLayout(newLayout, noreset) {
	this._hexgrid.setLayout(newLayout);
	if (!noreset) {
		this.reset();
	}
}

/**	Get the inner HexGrid layout.
 * 	@return {import('../render/HexGrid').HexagonLayout}
 */
ol_source_HexBin.prototype.getLayout = function getLayout() {
	return this._hexgrid.getLayout();
}

/**	Set the inner HexGrid origin.
 * 	@param {ol.Coordinate} newLayout
 * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
 */
ol_source_HexBin.prototype.setOrigin = function setOrigin(newLayout, noreset) {
	this._hexgrid.setOrigin(newLayout);
	if (!noreset) {
		this.reset();
	}
}

/**	Get the inner HexGrid origin.
 * 	@return {ol.Coordinate}
 */
ol_source_HexBin.prototype.getOrigin = function getOrigin() {
	return this._hexgrid.getOrigin();
}

/**
 * Get the orginal source
 * @return {ol_source_Vector}
 */
ol_source_HexBin.prototype.getSource = function getSource() {
	return this._origin;
};

export default ol_source_HexBin