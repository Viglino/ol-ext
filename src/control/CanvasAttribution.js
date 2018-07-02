/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {inherits as ol_inherits} from 'ol'
import ol_Observable from 'ol/Observable'
import ol_control_Attribution from 'ol/control/attribution'
import ol_style_Style from 'ol/style/style'
import {asString as ol_color_asString} from 'ol/color'
import ol_control_ScaleLine from 'ol/control/scaleline'

/**
 * @classdesc 
 *   OpenLayers 3 Attribution Control integrated in the canvas (for jpeg/png export purposes).
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol_control_Attribution}
 * @param {Object=} options extend the ol_control_Attribution options.
 * 	@param {ol_style_Style} options.style  option is usesd to draw the text.
 */
var ol_control_CanvasAttribution = function(options)
{	if (!options) options = {};
	ol_control_Attribution.call(this, options);

	// Draw in canvas
	this.isCanvas_ = !!options.canvas;

	// Get style options
	if (!options) options={};
	if (!options.style) options.style = new ol_style_Style();
	this.setStyle (options.style);
}
ol_inherits(ol_control_CanvasAttribution, ol_control_Attribution);

/**
 * Draw attribution on canvas
 * @param {boolean} b draw the attribution on canvas.
 */
ol_control_CanvasAttribution.prototype.setCanvas = function (b)
{	this.isCanvas_ = b;
	$(this.element).css("visibility", b ? "hidden":"visible");
	if (this.map_) this.map_.renderSync();
};

/**
 * Change the control style
 * @param {ol_style_Style} style
 */
ol_control_CanvasAttribution.prototype.setStyle = function (style)
{	var text = style.getText();
	this.font_ = text ? text.getFont() : "10px Arial";
	var stroke = text ? text.getStroke() : null;
	var fill = text ? text.getFill() : null;
	this.fontStrokeStyle_ = stroke ? ol_color_asString(stroke.getColor()) : "#fff";
	this.fontFillStyle_ = fill ? ol_color_asString(fill.getColor()) : "#000";
	this.fontStrokeWidth_ = stroke ? stroke.getWidth() : 3;
	if (this.getMap()) this.getMap().render();
};

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_control_CanvasAttribution.prototype.setMap = function (map)
{	var oldmap = this.getMap();
	if (this._listener) ol_Observable.unByKey(this._listener);
	this._listener = null;
	
	ol_control_ScaleLine.prototype.setMap.call(this, map);
	if (oldmap) oldmap.renderSync();

	// Get change (new layer added or removed)
	if (map) {
		this._listener = map.on('postcompose', this.drawAttribution_.bind(this));
	}
	this.map_ = map;
	
	this.setCanvas (this.isCanvas_);
}

/** 
 * Draw attribution in the final canvas
 * @private
 */
ol_control_CanvasAttribution.prototype.drawAttribution_ = function(e)
{	var ctx = e.context;
	if (!this.isCanvas_) return;

	var text = "";
	$("li", this.element).each (function()
	{	if ($(this).css("display")!="none") text += (text ? " - ":"") + $(this).text();
	});

	// Get size of the scale div
	var position = $(this.element).position();
	// Retina device
	var ratio = e.frameState.pixelRatio;
	ctx.save();
	ctx.scale(ratio,ratio);

	// Position if transform:scale()
	var container = $(this.getMap().getViewport()).parent();
	var scx = container.outerWidth() / container.get(0).getBoundingClientRect().width;
	var scy = container.outerHeight() / container.get(0).getBoundingClientRect().height;
	position.left *= scx;
	position.top *= scy;

	position.right = position.left + $(this.element).outerWidth();
	position.bottom = position.top + $(this.element).outerHeight();

	// Draw scale text
	ctx.beginPath();
    ctx.strokeStyle = this.fontStrokeStyle_;
    ctx.fillStyle = this.fontFillStyle_;
    ctx.lineWidth = this.fontStrokeWidth_;
    ctx.textAlign = "right";
	ctx.textBaseline ="bottom";
    ctx.font = this.font_;
	ctx.strokeText(text, position.right, position.bottom);
    ctx.fillText(text, position.right, position.bottom);
	ctx.closePath();

	ctx.restore();
};

export default ol_control_CanvasAttribution