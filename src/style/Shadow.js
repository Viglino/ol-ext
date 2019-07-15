/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*
*  Shadow image style for point vector features
*/

import ol_ext_inherits from '../util/ext'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_RegularShape from 'ol/style/RegularShape'

/**
 * @requires ol.style.Circle
 * @requires ol.structs.IHasChecksum
 */


/**
 * @classdesc
 * Set Shadow style for point vector features.
 *
 * @constructor
 * @param {} options Options.
 *   @param {ol.style.Fill | undefined} options.fill fill style, default rgba(0,0,0,0.5)
 *   @param {number} options.radius point radius
 * 	 @param {number} options.blur lur radius, default radius/3
 * 	 @param {number} options.offsetX x offset, default 0
 * 	 @param {number} options.offsetY y offset, default 0
 * @extends {ol_style_RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
var ol_style_Shadow = function(options)
{	options = options || {};
	if (!options.fill) options.fill = new ol_style_Fill({ color: "rgba(0,0,0,0.5)" });
	ol_style_RegularShape.call (this,{ radius: options.radius, fill: options.fill });

	this.fill_ = options.fill;
	this.radius_ = options.radius;
	this.blur_ = options.blur===0 ? 0 : options.blur || options.radius/3;
	this.offset_ = [options.offsetX ? options.offsetX : 0, options.offsetY ? options.offsetY : 0];

	this.renderShadow_();
};
ol_ext_inherits(ol_style_Shadow, ol_style_RegularShape);

/**
 * Clones the style. 
 * @return {ol_style_Shadow}
 */
ol_style_Shadow.prototype.clone = function()
{	var s = new ol_style_Shadow(
	{	fill: this.fill_,
		radius: this.radius_,
		blur: this.blur_,
		offsetX: this.offset_[0],
		offsetY: this.offset_[1]
	});
	s.setScale(this.getScale());
	s.setOpacity(this.getOpacity());
	return s;
};

/**
 * @private
 */
ol_style_Shadow.prototype.renderShadow_ = function()
{	
	var radius = this.radius_;
	
	var canvas = this.getImage();
	var s = [canvas.width, canvas.height];
	s[1] = radius;
	// Remove the circle on the canvas
	var context = (canvas.getContext('2d'));

	context.beginPath();
	context.clearRect(0, 0, canvas.width, canvas.height);

	context.scale(1,0.5);
	context.arc(radius, -radius, radius-this.blur_, 0, 2 * Math.PI, false);
    context.fillStyle = '#000';

	context.shadowColor = this.fill_.getColor();
	context.shadowBlur = 0.7*this.blur_;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 1.5*radius;

	context.closePath();
    context.fill();

	context.shadowColor = 'transparent';
    
	// Set anchor
	var a = this.getAnchor();
	a[0] = canvas.width /2 -this.offset_[0];
	a[1] = canvas.height/2 -this.offset_[1];
}


/**
 * @inheritDoc
 */
ol_style_Shadow.prototype.getChecksum = function()
{
	var strokeChecksum = (this.stroke_!==null) ?
		this.stroke_.getChecksum() : '-';
	var fillChecksum = (this.fill_!==null) ?
		this.fill_.getChecksum() : '-';

	var recalculate = (this.checksums_===null) ||
		(strokeChecksum != this.checksums_[1] ||
		fillChecksum != this.checksums_[2] ||
		this.radius_ != this.checksums_[3] ||
		this.form_+"-"+this.glyphs_ != this.checksums_[4]);

	if (recalculate) {
		var checksum = 'c' + strokeChecksum + fillChecksum 
			+ ((this.radius_ !== void 0) ? this.radius_.toString() : '-')
			+ this.form_+"-"+this.glyphs_;
		this.checksums_ = [checksum, strokeChecksum, fillChecksum, this.radius_, this.form_+"-"+this.glyphs_];
	}

	return this.checksums_[0];
};

export default ol_style_Shadow
