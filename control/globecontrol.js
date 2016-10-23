/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * OpenLayers 3 Layer Overview Control.
 * The overview can rotate with map. 
 * Zoom levels are configurable.
 * Click on the overview will center the map.
 * Change width/height of the overview trough css.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 *	- rotation {boolean} enable rotation, default false
 *	- align {top|bottom-left|right} position
 *	- layers {Array<ol.layer>} list of layers
 *	- style {ol.style.Style | Array.<ol.style.Style> | undefined} style to draw the map extent on the overveiw
 */
ol.control.Globe = function(opt_options) 
{	var options = opt_options || {};
	var self = this;

	// API 
	var element;
	if (options.target) 
	{	element = $("<div>");
		this.panel_ = $(options.target);
	}
	else
	{	element = $("<div>").addClass('ol-globe ol-unselectable ol-control');
		if (/top/.test(options.align)) element.addClass('ol-control-top');
		if (/right/.test(options.align)) element.addClass('ol-control-right');
		this.panel_ = $("<div>").addClass("panel")
					.appendTo(element);
		this.pointer_ = $("<div>").addClass("ol-pointer")
					.appendTo(element);
		
	}

	ol.control.Control.call(this, 
	{	element: element.get(0),
		target: options.target
	});

	

// http://openlayers.org/en/latest/examples/sphere-mollweide.html ???

	// Create a globe map
	this.ovmap_ = new ol.Map(
	{	controls: new ol.Collection(),
		interactions: new ol.Collection(),
		target: this.panel_.get(0),
		view: new ol.View
			({	zoom: 0,
				center: [0,0]
			}),
		layers: options.layers
	});
	
	setTimeout (function()
	{	self.ovmap_.updateSize(); 
	}, 0);

	this.set('follow', options.follow || false);

	// Cache extent
	this.extentLayer = new ol.layer.Vector(
	{	name: 'Cache extent',
		source: new ol.source.Vector(),
		style: options.style || [new ol.style.Style(
					{	image: new ol.style.Circle(
						{	fill: new ol.style.Fill({
								color: 'rgba(255,0,0, 1)'
							}),
							stroke: new ol.style.Stroke(
							{	width: 7,
								color: 'rgba(255,0,0, 0.8)'
							}),
							radius: 5
						})
					}
				)]
	})
	this.ovmap_.addLayer(this.extentLayer);
};
ol.inherits(ol.control.Globe, ol.control.Control);


/**
 * Set the map instance the control associated with.
 * @param {ol.Map} map The map instance.
 */
ol.control.Globe.prototype.setMap = function(map) 
{	if (this.getMap()) this.getMap().getView().un('propertychange', this.setView, this);

	ol.control.Control.prototype.setMap.call(this, map);

	// Get change (new layer added or removed)
	if (map) 
	{	map.getView().on('propertychange', this.setView, this);
		this.setView();
	}
};

/** Set the globe center with the map center
*/
ol.control.Globe.prototype.setView = function() 
{	if (this.getMap() && this.get('follow'))
	{	this.setCenter(this.getMap().getView().getCenter());
	}
}


/** Get globe map
*	@return {ol.Map}
*/
ol.control.Globe.prototype.getGlobe = function() 
{	return this.ovmap_;
}

/** Show/hide the globe
*/
ol.control.Globe.prototype.show = function(b) 
{	if (b!==false) $(this.element).removeClass("ol-collapsed");
	else $(this.element).addClass("ol-collapsed");
	this.ovmap_.updateSize();
}

/** Set position on the map
*	@param {top|bottom-left|right} 
*/
ol.control.Globe.prototype.setPosition = function(align) 
{	if (/top/.test(align)) $(this.element).addClass("ol-control-top");
	else $(this.element).removeClass("ol-control-top");
	if (/right/.test(align)) $(this.element).addClass("ol-control-right");
	else $(this.element).removeClass("ol-control-right");
}

/** Set the globe center
* @param {ol.coordinate} center the point to center to
* @param {boolean} show true to show a pointer 
*/
ol.control.Globe.prototype.setCenter = function (center, show) 
{	var self = this;
	this.pointer_.addClass("hidden");
	if (center)
	{	var map = this.ovmap_;
		// var extent = ov.oview_.getProjection().getExtent();
		var pan = ol.animation.pan(
			{	duration: 800,
				source: map.getView().getCenter()
			});
		var p = map.getPixelFromCoordinate(center);
		var h = $(this.element).height();
		//this.pointer_.css('top', Math.min(Math.max(p[1],0),h));
		// this.pointer_.css({ 'top': Math.min(Math.max(p[1],0),h) , 'left': p[0] } );
		map.beforeRender(function(map, frameState)
		{	var b = pan(map, frameState);
			if (!b && show!==false) 
			{	self.pointer_
					.css({ 'top': Math.min(Math.max(p[1],0),h) , 'left': "50%" } )
					.removeClass("hidden");
			}
			return b;
		});
		map.getView().setCenter([center[0],0]);
	}
};
