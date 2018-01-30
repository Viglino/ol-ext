/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol from 'ol'
import ol_control_ScaleLine from 'ol/control/scaleline'
import ol_style_Style from 'ol/style/style'
import ol_color from 'ol/color'

/**
 * @classdesc 
 *    OpenLayers 3 Scale Line Control integrated in the canvas (for jpeg/png export purposes).
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol_control_ScaleLine}
 * @param {Object=} options extend the ol_control_ScaleLine options.
 * 	@param {ol_style_Style} options.style used to draw the scale line (default is black/white, 10px Arial).
 */
var ol_control_CanvasScaleLine = function(options)
{	ol_control_ScaleLine.call(this, options);
	
	this.scaleHeight_ = 6;

	// Get style options
	if (!options) options={};
	if (!options.style) options.style = new ol_style_Style();
	this.setStyle(options.style);
}
ol.inherits(ol_control_CanvasScaleLine, ol_control_ScaleLine);

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_control_CanvasScaleLine.prototype.setMap = function (map)
{	var oldmap = this.getMap();
	if (oldmap) oldmap.un('postcompose', this.drawScale_, this);
	
	ol_control_ScaleLine.prototype.setMap.call(this, map);
	if (oldmap) oldmap.renderSync();

	// Add postcompose on the map
	if (map) map.on('postcompose', this.drawScale_, this);

	// Hide the default DOM element
	this.$element = $(this.element).css("visibility","hidden");
	this.olscale = $(".ol-scale-line-inner", this.element);
}


/**
 * Change the control style
 * @param {_ol_style_Style_} style
 */
ol_control_CanvasScaleLine.prototype.setStyle = function (style)
{	var stroke = style.getStroke();
	this.strokeStyle_ = stroke ? ol_color.asString(stroke.getColor()) : "#000";
	this.strokeWidth_ = stroke ? stroke.getWidth() : 2;

	var fill = style.getFill();
	this.fillStyle_ = fill ? ol_color.asString(fill.getColor()) : "#fff";
	
	var text = style.getText();
	this.font_ = text ? text.getFont() : "10px Arial";
	stroke = text ? text.getStroke() : null;
	fill = text ? text.getFill() : null;
	this.fontStrokeStyle_ = stroke ? ol_color.asString(stroke.getColor()) : this.fillStyle_;
	this.fontStrokeWidth_ = stroke ? stroke.getWidth() : 3;
	this.fontFillStyle_ = fill ? ol_color.asString(fill.getColor()) : this.strokeStyle_;
	// refresh
	if (this.getMap()) this.getMap().render();
}

/** 
 * Draw attribution in the final canvas
 * @private
 */
ol_control_CanvasScaleLine.prototype.drawScale_ = function(e)
{	if ( this.$element.css("display")==="none" ) return;
	var ctx = e.context;

	// Get size of the scale div
	var scalewidth = this.olscale.width();
	if (!scalewidth) return;
	var text = this.olscale.text();
	var position = this.$element.position();
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

	// On top
	position.top += this.$element.height() - this.scaleHeight_;

	// Draw scale text
	ctx.beginPath();
    ctx.strokeStyle = this.fontStrokeStyle_;
    ctx.fillStyle = this.fontFillStyle_;
    ctx.lineWidth = this.fontStrokeWidth_;
    ctx.textAlign = "center";
	ctx.textBaseline ="bottom";
    ctx.font = this.font_;
	ctx.strokeText(text, position.left+scalewidth/2, position.top);
    ctx.fillText(text, position.left+scalewidth/2, position.top);
	ctx.closePath();

	// Draw scale bar
	position.top += 2;
	ctx.lineWidth = this.strokeWidth_;
	ctx.strokeStyle = this.strokeStyle_;
	var max = 4;
	var n = parseInt(text);
	while (n%10 === 0) n/=10;
	if (n%5 === 0) max = 5;
	for (var i=0; i<max; i++)
	{	ctx.beginPath();
		ctx.fillStyle = i%2 ? this.fillStyle_ : this.strokeStyle_;
		ctx.rect(position.left+i*scalewidth/max, position.top, scalewidth/max, this.scaleHeight_);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	}
	ctx.restore();
}

export default ol_control_CanvasScaleLine