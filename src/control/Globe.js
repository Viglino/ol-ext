/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_control_Control from 'ol/control/Control'
import ol_Map from 'ol/Map'
import ol_Collection from 'ol/Collection'
import ol_View from 'ol/View'
import ol_layer_Vector from 'ol/layer/Vector'
import ol_style_Style from 'ol/style/Style'
import ol_style_Circle from 'ol/style/Circle'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_source_Vector from 'ol/source/Vector'

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
	{	element = document.createElement("div");
		this.panel_ = options.target;
	}
	else
	{	element = document.createElement("div");
		element.classList.add('ol-globe', 'ol-unselectable', 'ol-control');
		if (/top/.test(options.align)) element.classList.add('ol-control-top');
		if (/right/.test(options.align)) element.classList.add('ol-control-right');
		this.panel_ = document.createElement("div");
		this.panel_.classList.add("panel")
		element.appendChild(this.panel_);
		this.pointer_ = document.createElement("div");
		this.pointer_.classList.add("ol-pointer");
		element.appendChild(this.pointer_);
	}

	ol_control_Control.call(this,
	{	element: element,
		target: options.target
	});


// http://openlayers.org/en/latest/examples/sphere-mollweide.html ???

	// Create a globe map
	this.ovmap_ = new ol_Map(
	{	controls: new ol_Collection(),
		interactions: new ol_Collection(),
		target: this.panel_,
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
ol_ext_inherits(ol_control_Globe, ol_control_Control);


/**
 * Set the map instance the control associated with.
 * @param {ol.Map} map The map instance.
 */
ol_control_Globe.prototype.setMap = function(map) {
	if (this._listener) ol_Observable_unByKey(this._listener);
	this._listener = null;

	ol_control_Control.prototype.setMap.call(this, map);

	// Get change (new layer added or removed)
	if (map) 
	{	this._listener = map.getView().on('propertychange', this.setView.bind(this));
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
{	if (b!==false) this.element.classList.remove("ol-collapsed");
	else this.element.classList.add("ol-collapsed");
	this.ovmap_.updateSize();
}

/** Set position on the map
*	@param {top|bottom-left|right}  align
*/
ol_control_Globe.prototype.setPosition = function(align)
{	if (/top/.test(align)) this.element.classList.add("ol-control-top");
	else this.element.classList.remove("ol-control-top");
	if (/right/.test(align)) this.element.classList.add("ol-control-right");
	else this.element.classList.remove("ol-control-right");
}

/** Set the globe center
* @param {_ol_coordinate_} center the point to center to
* @param {boolean} show show a pointer on the map, defaylt true
*/
ol_control_Globe.prototype.setCenter = function (center, show)
{	var self = this;
	this.pointer_.classList.add("hidden");
	if (center)
	{	var map = this.ovmap_;
		var p = map.getPixelFromCoordinate(center);
		if (p) {
			if (show!==false) {
				var h = this.element.clientHeight;
				setTimeout(function() {
					self.pointer_.style.top = String(Math.min(Math.max(p[1],0),h)) + 'px';
					self.pointer_.style.left = "50%";
					self.pointer_.classList.remove("hidden");
				}, 800);
			}
			map.getView().animate({ center: [center[0],0] });
		}
	}
};

export default ol_control_Globe
