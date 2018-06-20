/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol from 'ol'
import ol_control_Control from 'ol/control/control'
import ol_Map from 'ol/map'
import ol_Collection from 'ol/collection'
import ol_View from 'ol/view'
import ol_layer_Vector from 'ol/layer/vector'
import ol_style_Style from 'ol/style/style'
import ol_style_Circle from 'ol/style/circle'
import ol_style_Fill from 'ol/style/fill'
import ol_style_Stroke from 'ol/style/stroke'
import ol_source_Vector from 'ol/source/vector'

/**
 * OpenLayers 3 lobe Overview Control.
 * The globe can rotate with map (follow.) 
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * 	@param {boolean} follow follow the map when center change, default false
 * 	@param {top|bottom-left|right} align position as top-left, etc.
 * 	@param {Array<ol.layer>} layers list of layers to display on the globe
 * 	@param {ol.style.Style | Array.<ol.style.Style> | undefined} style style to draw the position on the map , default a marker
 */
var ol_control_Globe = function(opt_options)
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

	ol_control_Control.call(this,
	{	element: element.get(0),
		target: options.target
	});

	

// http://openlayers.org/en/latest/examples/sphere-mollweide.html ???

	// Create a globe map
	this.ovmap_ = new ol_Map(
	{	controls: new ol_Collection(),
		interactions: new ol_Collection(),
		target: this.panel_.get(0),
		view: new ol_View
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
						})
					}
				)]
	})
	this.ovmap_.addLayer(this.extentLayer);
};
ol.inherits(ol_control_Globe, ol_control_Control);


/**
 * Set the map instance the control associated with.
 * @param {ol.Map} map The map instance.
 */
ol_control_Globe.prototype.setMap = function(map)
{	if (this.getMap()) this.getMap().getView().un('propertychange', this.setView, this);

	ol_control_Control.prototype.setMap.call(this, map);

	// Get change (new layer added or removed)
	if (map) 
	{	map.getView().on('propertychange', this.setView, this);
		this.setView();
	}
};

/** Set the globe center with the map center
*/
ol_control_Globe.prototype.setView = function()
{	if (this.getMap() && this.get('follow'))
	{	this.setCenter(this.getMap().getView().getCenter());
	}
}


/** Get globe map
*	@return {ol_Map}
*/
ol_control_Globe.prototype.getGlobe = function()
{	return this.ovmap_;
}

/** Show/hide the globe
*/
ol_control_Globe.prototype.show = function(b)
{	if (b!==false) $(this.element).removeClass("ol-collapsed");
	else $(this.element).addClass("ol-collapsed");
	this.ovmap_.updateSize();
}

/** Set position on the map
*	@param {top|bottom-left|right}  align
*/
ol_control_Globe.prototype.setPosition = function(align)
{	if (/top/.test(align)) $(this.element).addClass("ol-control-top");
	else $(this.element).removeClass("ol-control-top");
	if (/right/.test(align)) $(this.element).addClass("ol-control-right");
	else $(this.element).removeClass("ol-control-right");
}

/** Set the globe center
* @param {_ol_coordinate_} center the point to center to
* @param {boolean} show true to show a pointer 
*/
ol_control_Globe.prototype.setCenter = function (center, show)
{	var self = this;
	this.pointer_.addClass("hidden");
	if (center)
	{	var map = this.ovmap_;
		var p = map.getPixelFromCoordinate(center);
		var h = $(this.element).height();
		setTimeout(function() {
			self.pointer_.css({ 'top': Math.min(Math.max(p[1],0),h) , 'left': "50%" } )
				.removeClass("hidden");
		}, 800);
		map.getView().animate({ center: [center[0],0] });
	}
};

export default ol_control_Globe