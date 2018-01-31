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
import ol_source_ImageVector from 'ol/source/imagevector'
import ol_extent from 'ol/extent'
import ol_HexGrid from '../render/hexgrid'

(function() {

/* Implementation */
function addFeature(f)
{	var h = this._hexgrid.coord2hex(this._geomFn(f));
	var id = h.toString();
	if (this._bin[id]) 
	{	this._bin[id].get('features').push(f);
	}
	else 
	{	var ex = new ol_Feature(new ol_geom_Polygon([this._hexgrid.getHexagon(h)]));
		ex.set('features',[f]);
		ex.set('center', new ol_geom_Point(ol_extent.getCenter(ex.getGeometry().getExtent())));
		this._bin[id] = ex;
		this._source.addFeature(ex);
	}
	f.on("change", modifyFeature, this);
};

// Get the hexagon of a feature
// @return {} the bin id, the index of the feature in the bin and a boolean if the feature has moved to an other bin
function getBin(f)
{	// Test if feature exists in the current hex
	var id = this._hexgrid.coord2hex(this._geomFn(f)).toString();
	if (this._bin[id])
	{	var index = this._bin[id].get('features').indexOf(f);
		if (index > -1) return { id:id, index:index };
	}
	// The feature has moved > check all bins
	for (id in this._bin)
	{	var index = this._bin[id].get('features').indexOf(f);
		if (index > -1) return { id:id, index:index, moved:true };
	}
	return false;
};

function removeFeature(f, bin)
{	var b = bin || getBin.call(this,f);
	if (b)
	{	var features = this._bin[b.id].get('features');
		features.splice(b.index, 1);
		if (!features.length)
		{	this._source.removeFeature(this._bin[b.id]);
			delete this._bin[b.id];
		}
	}
	else 
	{	console.log("[ERROR:HexBin] remove feature feature doesn't exists anymore.");
	}
	f.un("change", modifyFeature, this);
};

function modifyFeature(e)
{	var bin = getBin.call(this,e.target);
	if (bin && bin.moved)
	{	// remove from the bin
		removeFeature.call(this, e.target, bin);
		// insert in the new bin
		addFeature.call (this, e.target);
	}	
	this._source.changed();
};

// Clear all bins and generate a new one
function reset()
{	this._bin = {};
	this._source.clear();
	var features = this._origin.getFeatures();
	for (var i=0, f; f=features[i]; i++)
	{	addFeature.call (this,f);
	};
};

// Init the bin
function hexbinInit(source, options)
{	// The HexGrid
	this._hexgrid = new ol_HexGrid(options);
	this._bin = {};
	// Source and origin
	this._source = source;
	this._origin = options.source;
	// Geometry function to get a point
	this._geomFn = options.geometryFunction || ol_coordinate.getFeatureCenter || function(f) { return f.getGeometry().getFirstCoordinate(); };
	// Existing features
	reset.call(this);
	// Future features
	this._origin.on("addfeature", function(e){ addFeature.call(this, e.feature); }, this);
	this._origin.on("removefeature", function(e){ removeFeature.call(this, e.feature); }, this);
};

/** A source for hexagonal binning
* @constructor 
* @extends {ol_source_Vector}
* @param {} options ol_source_VectorOptions + ol.HexGridOptions
*	@param {ol_source_Vector} options.source Source
*	@param {Number} options.size size of the exagon in map units, default 80000
*	@param {ol.coordinate} options.origin orgin of the grid, default [0,0]
*	@param {pointy|flat} options.layout grid layout, default pointy
*	@param {function|undefined} options.geometryFunction Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center. 
*/
var ol_source_HexBin = function(options)
{	options = options || {} ;
	ol_source_Vector.call (this, options);
	hexbinInit.call(this, this, options);
};
ol.inherits (ol_source_HexBin, ol_source_Vector);

/**
* Get the orginal source 
* @return {ol_source_Vector}
*/
ol_source_HexBin.prototype.getSource = function()
{	return this._origin;
};

/* DEPRECATED: use ol_source_HexBin with renderMode:'image' on layer
* An image source for hexagonal binning
* @constructor 
* @extends {ol_source_ImageVector}
* @param {} options ol_source_ImageVectorOptions + ol.HexGridOptions
*	@param {ol_source_Vector} options.source Source
*	@param {Number} options.size size of the exagon in map units, default 80000
*	@param {ol.coordinate} options.origin orgin of the grid, default [0,0]
*	@param {pointy|flat} options.layout grid layout, default pointy
*	@param {function|undefined} options.geometryFunction Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center. 
* /
var ol_source_ImageHexBin = function(options)
{	options = options || {} ;
	var source = new ol_source_Vector();
	hexbinInit.call (this, source, options);
	options.source = source;
	// Create source
	ol_source_ImageVector.call (this, options);
};
ol.inherits (ol_source_ImageHexBin, ol_source_ImageVector);

/**
* Get the orginal source 
* @return {ol_source_Vector}
* /
ol_source_ImageHexBin.prototype.getOriginSource = function()
{	return this._origin;
};
*/

})();

export default ol_source_HexBin