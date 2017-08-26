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
};

function removeFeature(f)
{	var h = this._hexgrid.coord2hex(f.getGeometry().getFirstCoordinate());
	var id = h.toString();
	if (this._bin[id]) 
	{	var features = this._bin[id].get('features');
		var index = features.indexOf(f);
		if (index > -1) { features.splice(index, 1); }
		if (!features.length)
		{	this._source.removeFeature(this._bin[id])
			delete this._bin[id];
		}
	}
	else console.error("oops");
};

function hexbinInit(source, options)
{	// The HexGrid
	this._hexgrid = new ol.HexGrid(options);
	this._bin = {};
	// Source and origin
	this._source = source;
	this._origin = options.source;
	// Existing features
	var features = this._origin.getFeatures();
	for (var i=0, f; f=features[i]; i++)
	{	addFeature.call (this,f);
	};
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