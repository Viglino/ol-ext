/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Crop drawing using an ol.Feature
*	@requires ol.filter
*	@requires ol.filter.Mask
*	@extends {ol.filter.Mask}
*	@param {ol.filter.cropOptions}
*		- feature {ol.Feature} feature to crop with
*		- inner {bool} crop inner, default false
*/
ol.filter.Crop = function(options)
{	options = options || {};
	ol.filter.Mask.call(this, options);
}
ol.inherits(ol.filter.Crop, ol.filter.Mask);

ol.filter.Crop.prototype.precompose = function(e)
{	if (!this.feature_) return;
	
	var ctx = e.context;
	ctx.save();
	this.drawFeaturePath_(e, this.get("inner"));
	ctx.clip("evenodd");
}

ol.filter.Crop.prototype.postcompose = function(e)
{	if (this.feature_) e.context.restore();
}
