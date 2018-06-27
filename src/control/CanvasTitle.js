/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol from 'ol'
import ol_control_Control from 'ol/control/control'
import ol_color from 'ol/color'
import ol_style_Style from 'ol/style/style'

/**
 * OpenLayers 3 Title Control integrated in the canvas (for jpeg/png export purposes).
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options extend the ol.control options. 
 * 	@param {ol_style_Style} options.style style usesd to draw the title.
 */
var ol_control_CanvasTitle = function(options)
{	if (!options) options={};
	
	// Get style options
	if (!options.style) options.style = new ol_style_Style();
	this.setStyle(options.style);

	// Initialize parent
	var elt = $("<div>").text(this.text_)
				.addClass("ol-title ol-unselectable")
				.css(
				{	font: this.font_,
					position: 'absolute',
					top:0, left:0, right:0,
					display: 'block',
					visibility: 'hidden'
				});

	ol_control_Control.call(this,
	{	element: elt.get(0),
		target: options.target
	});
}
ol.inherits(ol_control_CanvasTitle, ol_control_Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_control_CanvasTitle.prototype.setMap = function (map)
{	var oldmap = this.getMap();
	if (this._listener) ol.Observable.unByKey(this._listener);
	this._listener = null;
	
	ol_control_Control.prototype.setMap.call(this, map);
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
	this.strokeStyle_ = stroke ? ol_color.asString(stroke.getColor()) : "#fff";
	this.fillStyle_ = fill ? ol_color.asString(fill.getColor()) : "#000";
	if (this.element) 
	{	$(this.element).text(this.text_).css ({font: this.font_});
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
	$(this.element).text(title);
	if (this.getMap()) this.getMap().renderSync();
}

/**
 * Get the map title 
 * @param {string} map title.
 * @api stable
 */
ol_control_CanvasTitle.prototype.getTitle = function (title)
{	return this.text_;
}


/**
 * Set control visibility
 * @param {bool} b
 * @api stable
 */
ol_control_CanvasTitle.prototype.setVisible = function (b)
{	if (b) $(this.element).show();
	else $(this.element).hide();
	if (this.getMap()) this.getMap().renderSync();
}

/**
 * Get control visibility
 * @return {bool} 
 * @api stable
 */
ol_control_CanvasTitle.prototype.getVisible = function (b)
{	return ($(this.element).css('display') !== 'none');
}

/** Draw scale line in the final canvas
*/
ol_control_CanvasTitle.prototype.drawTitle_ = function(e)
{	if (!this.getVisible()) return;
	var ctx = e.context;
	
	// Retina device
	var ratio = e.frameState.pixelRatio;
	ctx.save();
	ctx.scale(ratio,ratio);

	var w = ctx.canvas.width/ratio;
	var h = $(this.element).height();
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