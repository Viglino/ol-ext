/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Colorize map or layer
*	@requires ol.filter
*	@extends {ol.filter.Base}
*	@param {ol.filter.compositeOptions}
*		- operation {string} composite operation
*/
ol.filter.Composite = function(options)
{	ol.filter.Base.call(this, options);

	this.set("operation", options.operation || "source-over");
}
ol.inherits(ol.filter.Composite, ol.filter.Base);

/** Change the current operation
*	@param {string} operation composite function
*/
ol.filter.Composite.prototype.setOperation = function(operation)
{	this.set(operation || "source-over");
}

ol.filter.Composite.prototype.precompose = function(e)
{	var ctx = e.context;
	ctx.save();
	ctx.globalCompositeOperation = this.get('operation');
}

ol.filter.Composite.prototype.postcompose = function(e)
{	e.context.restore();
}
