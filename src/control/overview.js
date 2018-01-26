/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol from 'ol'
import ol_control_Control from 'ol/control/control'
import ol_geom_Polygon from 'ol/geom/polygon'
import ol_geom_Point from 'ol/geom/point'
import ol_interaction_Pointer from 'ol/interaction/pointer'
import ol_easing from 'ol/easing'
import ol_Map from 'ol/map'
import ol_Collection from 'ol/collection'
import ol_View from 'ol/view'
import ol_source_Vector from 'ol/source/vector'
import ol_style_Style from 'ol/style/style'
import ol_style_Circle from 'ol/style/circle'
import ol_style_Fill from 'ol/style/fill'
import ol_style_Stroke from 'ol/style/stroke'
import ol_layer_Vector from 'ol/layer/vector'
//TODO: replace ol.animation.pan with new {ol_interaction_Interaction.pan}
//import ol_interaction_Interaction from 'ol/interaction/interaction'

/**
 * OpenLayers 3 Layer Overview Control.
 * The overview can rotate with map. 
 * Zoom levels are configurable.
 * Click on the overview will center the map.
 * Change width/height of the overview trough css.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *	@param {ol.ProjectionLike} options.projection The projection. Default is EPSG:3857 (Spherical Mercator).
 *	@param {Number} options.minZoom default 0
 *	@param {Number} options.maxZoom default 18
 *	@param {boolean} options.rotation enable rotation, default false
 *	@param {top|bottom-left|right} options.align position
 *	@param {Array<ol.layer>} options.layers list of layers
 *	@param {ol.style.Style | Array.<ol.style.Style> | undefined} options.style style to draw the map extent on the overveiw
 *	@param {bool|elastic} options.panAnimation use animation to center map on click, default true
 */
var ol_control_Overview = function(options)
{	options = options || {};
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
					.attr('type','button')
					.click (function(){self.toggleMap()})
					.appendTo(element);
		this.panel_ = $("<div>").addClass("panel")
					.appendTo(element);
	}

	ol_control_Control.call(this,
	{	element: element.get(0),
		target: options.target
	});

	// Create a overview map
	this.ovmap_ = new ol_Map(
	{	controls: new ol_Collection(),
		interactions: new ol_Collection(),
		target: this.panel_.get(0),
		view: new ol_View
			({	zoom: 14,
				center: [270148, 6247782],
				projection: options.projection
			}),
		layers: options.layers
	});

	this.oview_ = this.ovmap_.getView();

	// Cache extent
	this.extentLayer = new ol_layer_Vector(
	{	name: 'Cache extent',
		source: new ol_source_Vector(),
		style: options.style || [new ol_style_Style(
					{	image: new ol_style_Circle(
						{	fill: new ol_style_Fill({
								color: 'rgba(255,0,0, 1)'
							}),
							stroke: new ol_style_Stroke(
							{	width: 7,
								color: 'rgba(255,0,0, 0.8)'
							}),
							radius: 5
						}),
						stroke: new ol_style_Stroke(
						{	width: 5,
							color: "rgba(255,0,0,0.8)"
						})
					}
				)]
	})
	this.ovmap_.addLayer(this.extentLayer);

	/** Elastic bounce
	*	@param {Int} bounce number of bounce
	*	@param {Number} amplitude amplitude of the bounce [0,1] 
	*	@return {Number}
	*/
	ol_easing.bounceFn = function (bounce, amplitude)
	{	var a = (2*bounce+1) * Math.PI/2;
		var b = amplitude>0 ? -1/amplitude : -100;
		var c = - Math.cos(a) * Math.pow(2, b);
		return function(t)
		{	t = 1-Math.cos(t*Math.PI/2);
			return 1 + Math.abs( Math.cos(a*t) ) * Math.pow(2, b*t) + c*t;
		}
	}
	/** Elastic bounce
	*	@param {Int} bounce number of bounce
	*	@param {Number} amplitude amplitude of the bounce [0,1] 
	*	@return {Number}
	*/
	ol_easing.elasticFn = function (bounce, amplitude)
	{	var a = 3*bounce * Math.PI/2;
		var b = amplitude>0 ? -1/amplitude : -100;
		var c = Math.cos(a) * Math.pow(2, b);
		return function(t)
		{	t = 1-Math.cos(t*Math.PI/2);
			return 1 - Math.cos(a*t) * Math.pow(2, b*t) + c*t;
		}
	}

	// Click on the preview center the map
	this.ovmap_.addInteraction (new ol_interaction_Pointer(
	{	handleDownEvent: function(evt)
		{	//TODO: Old version OL3
			if (ol.animation) 
			{	var pan;
				if (options.panAnimation !==false)
				{	if (options.panAnimation=="elastic" || options.elasticPan) 
					{	pan = ol.animation.pan(
						{	duration: 1000,
							easing: ol_easing.elasticFn(2,0.3),
							source: self.getMap().getView().getCenter()
						});
					}
					else
					{	pan = ol.animation.pan(
						{	duration: 300,
							source: self.getMap().getView().getCenter()
						});
					}
				
				}
				self.getMap().beforeRender(pan);
				self.getMap().getView().setCenter(evt.coordinate);
			}
			else
			{	if (options.panAnimation !==false)
				{	if (options.panAnimation=="elastic" || options.elasticPan) 
					{	self.getMap().getView().animate(
						{	center: evt.coordinate,
							easing: ol_easing.elasticFn(2,0.3),
							duration: 1000
						});
					}
					else
					{	self.getMap().getView().animate(
						{	center: evt.coordinate,
							duration: 300
						});
					}
				}
				else self.getMap().getView().setCenter(evt.coordinate);
			}
			return false;
		}
	}));
};
ol.inherits(ol_control_Overview, ol_control_Control);

/** Get overview map
*	@return {ol.Map}
*/
ol_control_Overview.prototype.getOverviewMap = function()
{	return this.ovmap_;
}

/** Toggle overview map
*/
ol_control_Overview.prototype.toggleMap = function()
{	$(this.element).toggleClass("ol-collapsed");
	this.ovmap_.updateSize();
}

/** Set overview map position
*	@param {top|bottom-left|right} 
*/
ol_control_Overview.prototype.setPosition = function(align)
{	if (/top/.test(align)) $(this.element).addClass("ol-control-top");
	else $(this.element).removeClass("ol-control-top");
	if (/right/.test(align)) $(this.element).addClass("ol-control-right");
	else $(this.element).removeClass("ol-control-right");
}

/**
 * Set the map instance the control associated with.
 * @param {ol.Map} map The map instance.
 */
ol_control_Overview.prototype.setMap = function(map)
{   if (this.getMap())
	{	this.getMap().getView().un('propertychange', this.setView, this);
	}
	ol_control_Control.prototype.setMap.call(this, map);
	if (map) 
	{	map.getView().on('propertychange', this.setView, this);
		this.setView();
	}

};

/** Calculate the extent of the map and draw it on the overview
*/
ol_control_Overview.prototype.calcExtent_ = function(extent)
{	var map = this.getMap();
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
		f.setGeometry (new ol_geom_Polygon( [ extent ]));
	}
	else 
	{	f.setGeometry (new ol_geom_Point( center ));
	}
	source.addFeature(f);
}

/**
*	@private
*/
ol_control_Overview.prototype.setView = function(e)
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
			if (this.rotation) this.oview_.setRotation(this.getMap().getView().getRotation());
			else if (this.oview_.getRotation()) this.oview_.setRotation(0);
			break;
		case 'center': 
		{	var mapExtent = this.getMap().getView().calculateExtent(this.getMap().getSize());
			var extent = this.oview_.calculateExtent(this.ovmap_.getSize());
			if (mapExtent[0]<extent[0] || mapExtent[1]<extent[1] 
				|| mapExtent[2]>extent[2] || mapExtent[3]>extent[3])
			{	this.oview_.setCenter(this.getMap().getView().getCenter()); 
			}
			break;
		}	
		case 'resolution':
		{	var z = Math.round(this.getMap().getView().getZoom()/2)*2-4;
			z = Math.min ( this.maxZoom, Math.max(this.minZoom, z) );
			this.oview_.setZoom(z);
			break;
		}
		default: break;
	}
	this.calcExtent_();
}

export default ol_control_Overview