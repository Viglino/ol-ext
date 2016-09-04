/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc
 *	The Magnify overlay add a "magnifying glass" effect to an OL3 map that displays 
 *	a portion of the map in a different zoom (and actually display different content).
 *
 * @constructor
 * @extends {ol.Overlay}
 * @param {olx.OverlayOptions} options Overlay options 
 * @api stable
 */
ol.Overlay.Magnify = function (options)
{	var self = this;
	
	var elt = $("<div>").addClass("ol-magnify");
	this.element = elt.get(0);

	ol.Overlay.call(this, 
		{	positioning: options.positioning || "center-center",
			element: this.element,
			stopEvent: false
		});

	// Create magnify map
	this.mgmap_ = new ol.Map(
	{	controls: new ol.Collection(),
		interactions: new ol.Collection(),
		target: options.target || this.element,
		view: new ol.View(),
		layers: options.layers
	});
	this.mgview_ = this.mgmap_.getView();
	
	this.external_ = options.target?true:false;

	this.set("zoomOffset", options.zoomOffset||1);
	this.set("active", true);
	this.on("propertychange", this.setView_, this);
}
ol.inherits(ol.Overlay.Magnify, ol.Overlay);

/**
 * Set the map instance the overlay is associated with.
 * @param {ol.Map} map The map instance.
 */
ol.Overlay.Magnify.prototype.setMap = function(map)
{	if (this.getMap())
	{	$(this.getMap().getViewport()).off("mousemove", this.onMouseMove_);
		this.getMap().getView().un('propertychange', this.setView_, this);
	}

	ol.Overlay.prototype.setMap.call(this, map);
	var self = this;
	$(map.getViewport()).on("mousemove", {self:this}, this.onMouseMove_);
	map.getView().on('propertychange', this.setView_, this);

	this.setView_();
}

/** Get the magnifier map
*	@return {ol.Map}
*/
ol.Overlay.Magnify.prototype.getMagMap = function()
{	return this.mgmap_;
}

/** Magnify is active
*	@return {boolean}
*/
ol.Overlay.Magnify.prototype.getActive = function()
{	return this.get("active");
}

/** Activate or deactivate 
*	@param {boolean} active
*/
ol.Overlay.Magnify.prototype.setActive = function(active)
{	return this.set("active", active);
}

/** Mouse move
*/
ol.Overlay.Magnify.prototype.onMouseMove_ = function(e)
{	var self = e.data.self;
	if (!self.get("active"))
	{	self.setPosition();
	}
	else
	{	var px = self.getMap().getEventCoordinate(e);
		if (!self.external_) self.setPosition(px);
		self.mgview_.setCenter(px);
		if ($("canvas", self.element).css("display")=="none") self.mgmap_.updateSize();
	}
}

/** View has changed
*/
ol.Overlay.Magnify.prototype.setView_ = function(e)
{	if (!this.get("active"))
	{	this.setPosition();
		return;
	}
	
	if (!e) 
	{	// refresh all
		this.setView_({key:'rotation'});
		this.setView_({key:'resolution'});
		return;
	}

	// Set the view params
	switch (e.key)
	{	case 'rotation':
			this.mgview_.setRotation(this.getMap().getView().getRotation());
			break;
		case 'zoomOffset':
		case 'resolution':
		{	var z = Math.max(0,this.getMap().getView().getZoom()+Number(this.get("zoomOffset")));
			this.mgview_.setZoom(z);
			break;
		}
		default: break;
	}
}