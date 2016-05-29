/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*
*  Shadow image style for point vector features
*/
/**
 * @requires ol.style.Circle
 * @requires ol.structs.IHasChecksum
 */


/**
 * @classdesc
 * Set Shadow style for point vector features.
 *
 * @constructor
 * @param {olx.style.PhotoSymbolOptions=} opt_options Options.
 * @extends {ol.style.RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
ol.style.Shadow = function(opt_options) 
{	options = opt_options || {};
	if (!options.fill) options.fill = new ol.style.Fill({ color: "rgba(0,0,0,0.5)" });
	ol.style.RegularShape.call (this,{ radius: options.radius, fill: options.fill });

	this.fill_ = options.fill;
	this.radius_ = options.radius;
	this.blur_ = options.blur===0 ? 0 : options.blur || options.radius/3;
	this.offset_ = [options.offsetX ? options.offsetX : 0, options.offsetY ? options.offsetY : 0];

	this.render_();
};
ol.inherits(ol.style.Shadow, ol.style.RegularShape);

/**
 * @private
 */
ol.style.Shadow.prototype.render_ = function() 
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
	context.shadowOffsetY = radius;

	context.closePath();
    context.fill();

	context.shadowColor = 'transparent';
    
	// Set anchor
	var a = this.getAnchor();
	a[0] = canvas.width /2 -this.offset_[0];
	a[1] = canvas.height/5 -this.offset_[1];
}


/**
 * @inheritDoc
 */
ol.style.Shadow.prototype.getChecksum = function() 
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
