/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
ol.filter = {};
/**
 * @classdesc 
 *   Abstract base class; normally only used for creating subclasses and not instantiated in apps. 
 *   Used to create filters
 *
 * @constructor
 * @extends {ol.Object}
 * @param {Object=} Control options. The style {ol.style.Style} option is usesd to draw the text.
 */
ol.filter.Base = function(options) 
{	ol.Object.call(this);
	if (options && options.active===false) this.set('active', false);
	else this.set('active', true);
}
ol.inherits(ol.filter.Base, ol.Object);

/** Activate / deactivate filter
*	@param {bool}
*/
ol.filter.Base.prototype.setActive = function (b)
{	this.set('active', b===true);
}

/** Get filter active
*	@return {bool}
*/
ol.filter.Base.prototype.getActive = function (b)
{	return this.set('active');
}

/** Add a filter to an ol object
*	@private
*/
ol.filter.Base.prototype.addFilter_ = function(filter)
{	if (!this.filters_) this.filters_ = [];
	this.filters_.push(filter);
	if (filter.precompose) this.on('precompose', function(e)
		{	if (filter.get('active')) filter.precompose(e)
		}, this);
	if (filter.postcompose) this.on('postcompose', function(e)
		{	if (filter.get('active')) filter.postcompose(e)
		}, this);
	filter.on('propertychange', function()
		{	if (this.renderSync) this.renderSync();
			else this.changed(); 
		}, this);
}

/** Add a filter to an ol.Map
*	@param {ol.filter}
*/
ol.Map.prototype.addFilter = function (filter)
{	ol.filter.Base.prototype.addFilter_.call (this, filter);
}
/** Get filters associated with an ol.Map
*	@return {Array<ol.filter>}
*/
ol.Map.prototype.getFilters = function ()
{	return this.filters_;
}

/** Add a filter to an ol.Layer
*	@param {ol.filter}
*/
ol.layer.Base.prototype.addFilter = function (filter)
{	ol.filter.Base.prototype.addFilter_.call (this, filter);
}
/** Get filters associated with an ol.Map
*	@return {Array<ol.filter>}
*/
ol.layer.Base.prototype.getFilters = function ()
{	return this.filters_;
}

