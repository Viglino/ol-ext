/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import {asString as ol_color_asString} from 'ol/color'
import ol_style_Style from 'ol/style/Style'
import ol_control_CanvasBase from './CanvasBase'

/**
 * OpenLayers 3 Title Control integrated in the canvas (for jpeg/png export purposes).
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object=} options extend the ol.control options. 
 * 	@param {ol_style_Style} options.style style usesd to draw the title.
 */
var ol_control_CanvasTitle = function(options)
{	if (!options) options={};
	
	// Get style options
	if (!options.style) options.style = new ol_style_Style();
	this.setStyle(options.style);

	// Initialize parent
	var elt = document.createElement('div');
	elt.textContent = this.text_;
	elt.className = 'ol-title ol-unselectable';
	var css = {
		font: this.font_,
		position: 'absolute',
		top:0,
		left:0,
		right:0,
		display: 'block',
		visibility: 'hidden'
	};
	Object.keys(css).forEach(function(key) {
		elt.style[key] = css[key];
	});

	ol_control_CanvasBase.call(this,
	{	element: elt,
		target: options.target
	});
}
ol_ext_inherits(ol_control_CanvasTitle, ol_control_CanvasBase);

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_control_CanvasTitle.prototype.setMap = function (map)
{	var oldmap = this.getMap();
	if (this._listener) ol_Observable_unByKey(this._listener);
	this._listener = null;
	
	ol_control_CanvasBase.prototype.setMap.call(this, map);
	if (oldmap) oldmap.renderSync();

	// Get change (new layer added or removed)
	if (map) {
		this._listener = map.on('postcompose', this.drawTitle_.bind(this));
	}
}


/**
 * Change the control style
 * @param {ol_style_Style} style
 */
ol_control_CanvasTitle.prototype.setStyle = function (style)
{	var text = style.getText();
	this.font_ = text ? text.getFont() || "20px Arial" : "20px Arial";
	this.text_ = text ? text.getText() : "";
	var stroke = text ? text.getStroke() : null;
	var fill = text ? text.getFill() : null;
	this.strokeStyle_ = stroke ? ol_color_asString(stroke.getColor()) : "#fff";
	this.fillStyle_ = fill ? ol_color_asString(fill.getColor()) : "#000";
	if (this.element) 
	{	this.element.textContent = this.text_;
		this.element.style.font = this.font_;
	}
	// refresh
	if (this.getMap()) this.getMap().render();
}

/**
 * Set the map title 
 * @param {string} map title.
 * @api stable
 */
ol_control_CanvasTitle.prototype.setTitle = function (title)
{	this.text_ = title;
	this.element.textContent = this.text_;
	if (this.getMap()) this.getMap().renderSync();
}

/**
 * Get the map title 
 * @param {string} map title.
 * @api stable
 */
ol_control_CanvasTitle.prototype.getTitle = function ()
{	return this.text_;
}


/**
 * Set control visibility
 * @param {bool} b
 * @api stable
 */
ol_control_CanvasTitle.prototype.setVisible = function (b)
{	if (b) this.element.style.display = '';
	else this.element.style.display = 'none';
	if (this.getMap()) this.getMap().renderSync();
}

/**
 * Get control visibility
 * @return {bool} 
 * @api stable
 */
ol_control_CanvasTitle.prototype.getVisible = function ()
{	return this.element.style.display !== 'none';
}

/** Draw scale line in the final canvas
*/
ol_control_CanvasTitle.prototype.drawTitle_ = function(e)
{	if (!this.getVisible()) return;
	var ctx = e.context;
	if (!ctx) {
		var c = this.getMap().getViewport().querySelectorAll('canvas')
		ctx = c[c.length-1].getContext('2d');
	}
	
	// Retina device
	var ratio = e.frameState.pixelRatio;
	ctx.save();
	ctx.scale(ratio,ratio);

	var w = ctx.canvas.width/ratio;
	var h = this.element.clientHeight;
	var position = { top:0, left:w/2 };

	ctx.beginPath();
	ctx.fillStyle = this.strokeStyle_;
	ctx.rect(0,0, w, h);
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.fillStyle = this.fillStyle_;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = this.font_;
	ctx.fillText(this.text_, position.left, position.top +h/2);
	ctx.closePath();

	ctx.restore();
}

export default ol_control_CanvasTitle