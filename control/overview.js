/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * OpenLayers 3 Layer Overview Control.
 * The overview can rotate with map. 
 * Zoom levels are configurable.
 * Click on the overview will center the map.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
ol.control.Overview = function(opt_options) 
{	var options = opt_options || {};
	var self = this;

	// API 
	this.minZoom = options.minZoom || 0;
	this.maxZoom = options.maxZoom || 18;
	this.rotation = options.rotation;

	var element;
	if (options.target) 
	{	element = $("<div>");
		this.panel_ = $(options.target);
	}
	else
	{	element = $("<div>").addClass('ol-overview ol-unselectable ol-control ol-collapsed');
		if (/top/.test(options.align)) element.addClass('ol-control-top');
		if (/right/.test(options.align)) element.addClass('ol-control-right');
		$("<button>").on("touchstart", function(e){ self.toggleMap(); e.preventDefault(); })
					.click (function(){self.toggleMap()})
					.appendTo(element);
		this.panel_ = $("<div>").addClass("panel")
					.appendTo(element);
	}

	ol.control.Control.call(this, 
	{	element: element.get(0),
		target: options.target
	});

	// Create a overview map
	this.ovmap_ = new ol.Map(
	{	controls: new ol.Collection(),
		interactions: new ol.Collection(),
		target: this.panel_.get(0),
		view: new ol.View
			({	zoom: 14,
				center: [270148, 6247782]
			}),
		layers: options.layers
	});

	this.oview_ = this.ovmap_.getView();

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
						}),
						stroke: new ol.style.Stroke(
						{	width: 5,
							color: "rgba(255,0,0,0.8)"
						})
					}
				)]
	})
	this.ovmap_.addLayer(this.extentLayer);

	/** Elastic bounce
	*	@param {Int} number of bounce
	*	@prama {Number} [0,1] amplitude of the bounce
	*/
	ol.easing.bounceFn = function (bounce, amplitude)
	{	var a = (2*bounce+1) * Math.PI/2;
		var b = amplitude>0 ? -1/amplitude : -100;
		var c = - Math.cos(a) * Math.pow(2, b);
		return function(t)
		{	t = 1-Math.cos(t*Math.PI/2);
			return 1 + Math.abs( Math.cos(a*t) ) * Math.pow(2, b*t) + c*t;
		}
	}
	ol.easing.elasticFn = function (bounce, amplitude)
	{	var a = 3*bounce * Math.PI/2;
		var b = amplitude>0 ? -1/amplitude : -100;
		var c = Math.cos(a) * Math.pow(2, b);
		return function(t)
		{	t = 1-Math.cos(t*Math.PI/2);
			return 1 - Math.cos(a*t) * Math.pow(2, b*t) + c*t;
		}
	}
	// Click on the preview center the map
	this.ovmap_.addInteraction (new ol.interaction.Pointer(
	{	handleDownEvent: function(evt)
		{	var pan;
			if (options.panAnimation !==false)
			{	if (options.elasticPan) 
				{	pan = ol.animation.pan(
					{	duration: 1000,
						easing: ol.easing.elasticFn(2,0.3),
						source: self.map_.getView().getCenter()
					});
				}
				else
				{	pan = ol.animation.pan(
					{	duration: 300,
						source: self.map_.getView().getCenter()
					});
				}
				
			}
			self.map_.beforeRender(pan);
			self.map_.getView().setCenter(evt.coordinate);
			return false;
		}
	}));
};
ol.inherits(ol.control.Overview, ol.control.Control);

/** Get overview map
*	@return {ol.Map}
*/
ol.control.Overview.prototype.getOverviewMap = function() 
{	return this.ovmap_;
}

/** Toggle overview map
*/
ol.control.Overview.prototype.toggleMap = function() 
{	$(this.element).toggleClass("ol-collapsed");
	this.ovmap_.updateSize();
}

/** Set overview map position
*	@param {top|bottom-left|right} 
*/
ol.control.Overview.prototype.setPosition = function(align) 
{	if (/top/.test(align)) $(this.element).addClass("ol-control-top");
	else $(this.element).removeClass("ol-control-top");
	if (/right/.test(align)) $(this.element).addClass("ol-control-right");
	else $(this.element).removeClass("ol-control-right");
}

/**
 * Set the map instance the control associated with.
 * @param {ol.Map} map The map instance.
 */
ol.control.Overview.prototype.setMap = function(map) 
{   ol.control.Control.prototype.setMap.call(this, map);

	this.map_ = map;
	map.getView().un('propertychange', this.setView, this);
	// Get change (new layer added or removed)
	if (map) 
	{	map.getView().on('propertychange', this.setView, this);
		this.setView();
	}

};

/** Calculate the extent of the map and draw it on the overview
*/
ol.control.Overview.prototype.calcExtent_ = function(extent)
{	var map = this.map_;
	if (!map) return;
	
	var source = this.extentLayer.getSource();
	source.clear();
	var f = new ol.Feature();

	var size = map.getSize();
	var resolution = map.getView().getResolution();
	var rotation = map.getView().getRotation();
	var center = map.getView().getCenter();
	if (!resolution) return;

	var dx = resolution * size[0] / 2;
	var dy = resolution * size[1] / 2;
	var res2 = this.oview_.getResolution();
	if (dx/res2>5 || dy/res2>5)
	{	var cos = Math.cos(rotation);
		var sin = Math.sin(rotation);
		var i, x, y;
		extent=[[-dx,-dy],[-dx,dy],[dx,dy],[dx,-dy]];
		for (i = 0; i < 4; ++i) 
		{	x = extent[i][0];
			y = extent[i][1];
			extent[i][0] = center[0] + x * cos - y * sin;
			extent[i][1] = center[1] + x * sin + y * cos;
		}
		f.setGeometry (new ol.geom.Polygon( [ extent ]));
	}
	else 
	{	f.setGeometry (new ol.geom.Point( center ));
	}
	source.addFeature(f);
}

/**
*	@private
*/
ol.control.Overview.prototype.setView = function(e) 
{	if (!e) 
	{	// refresh all
		this.setView({key:'rotation'});
		this.setView({key:'resolution'});
		this.setView({key:'center'});
		return;
	}
	// Set the view params
	switch (e.key)
	{	case 'rotation':
			if (this.rotation) this.oview_.setRotation(this.map_.getView().getRotation());
			else if (this.oview_.getRotation()) this.oview_.setRotation(0);
			break;
		case 'center': 
		{	var mapExtent = this.map_.getView().calculateExtent(this.map_.getSize());
			var extent = this.oview_.calculateExtent(this.ovmap_.getSize());
			if (mapExtent[0]<extent[0] || mapExtent[1]<extent[1] 
				|| mapExtent[2]>extent[2] || mapExtent[3]>extent[3])
			{	this.oview_.setCenter(this.map_.getView().getCenter()); 
			}
			break;
		}	
		case 'resolution':
		{	var z = Math.round(this.map_.getView().getZoom()/2)*2-4;
			z = Math.min ( this.maxZoom, Math.max(this.minZoom, z) );
			this.oview_.setZoom(z);
			break;
		}
		default: break;
	}
	this.calcExtent_();
}
