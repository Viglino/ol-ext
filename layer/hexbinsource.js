/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	
*/

(function() {

/* Implementation */
function addFeature(f)
{	var h = this._hexgrid.coord2hex(f.getGeometry().getFirstCoordinate());
	var id = h.toString();
	if (this._bin[id]) 
	{	this._bin[id].get('features').push(f);
	}
	else 
	{	var ex = new ol.Feature(new ol.geom.Polygon([this._hexgrid.getHexagon(h)]));
		ex.set('features',[f]);
		ex.set('center', new ol.geom.Point(ol.extent.getCenter(ex.getGeometry().getExtent())));
		this._bin[id] = ex;
		this._source.addFeature(ex);
	}
	f.on("change", modifyFeature, this);
};

// Get the hexagon of a feature
// @return {} the bin id, the index of the feature in the bin and a boolean if the feature has moved to an other bin
function getBin(f)
{	// Test if feature exists in the current hex
	var id = this._hexgrid.coord2hex(f.getGeometry().getFirstCoordinate()).toString();
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
		removeFeature.call(this,e.target, bin);
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
	this._hexgrid = new ol.HexGrid(options);
	this._bin = {};
	// Source and origin
	this._source = source;
	this._origin = options.source;
	// Existing features
	reset.call(this);
	// Future features
	this._origin.on("addfeature", function(e){ addFeature.call(this, e.feature); }, this);
	this._origin.on("removefeature", function(e){ removeFeature.call(this, e.feature); }, this);
};

/** A source for hexagonal binning
* @constructor 
* @extends {ol.source.Vector}
* @param {olx.source.VectorOptions=} options extend ol.source.Vector options
*	@param {ol.source.Vector} options.source the source
* @todo 
*/
ol.source.HexBin = function(options)
{	options = options || {} ;
	ol.source.Vector.call (this, options);	
	hexbinInit.call(this, this, options);
};
ol.inherits (ol.source.HexBin, ol.source.Vector);

/**
* Get the orginal source 
* @return {ol.source.Vector} 
*/
ol.source.HexBin.prototype.getSource = function()
{	return this._origin;
};

/** An image source for hexagonal binning
* @constructor 
* @extends {ol.source.ImageVector}
* @param {olx.source.ImageVectorOptions=} options
* @todo 
*/
ol.source.ImageHexBin = function(options)
{	options = options || {} ;
	var source = new ol.source.Vector();
	hexbinInit.call (this, source, options);
	options.source = source;
	// Create source
	ol.source.ImageVector.call (this, options);	
};
ol.inherits (ol.source.ImageHexBin, ol.source.ImageVector);

/**
* Get the orginal source 
* @return {ol.source.Vector} 
*/
ol.source.ImageHexBin.prototype.getOriginSource = function()
{	return this._origin;
};

})();