/* Copyright (c) IGN-2015 - Jean-Marc.Viglino [at]ign.fr
*  Add a chart style to display charts (pies or bars) on a map 
*/
/**
 * @requires ol.style.Circle
 * @requires ol.structs.IHasChecksum
 */


/**
 * @classdesc
 * Set chart style for vector features.
 *
 * @constructor
 * @param {olx.style.FontSymbolOptions=} opt_options Options.
 * @extends {ol.style.RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
ol.style.Chart = function(opt_options) 
{	options = opt_options || {};
	var strokeWidth = 0;
	if (opt_options.stroke) strokeWidth = opt_options.stroke.getWidth();
	ol.style.RegularShape.call (this,
		{	radius: options.radius + strokeWidth, 
			fill: new ol.style.Fill({color: [0,0,0]}),
			rotation: options.rotation,
			snapToPixel: options.snapToPixel
		});
	if (options.scale) this.setScale(options.scale);

	this.stroke_ = options.stroke;
	this.fill_ = options.fill;
	this.radius_ = options.radius;
	this.type_ = options.type;
	this.offset_ = [options.offsetX ? options.offsetX :0, options.offsetY ? options.offsetY :0];

	this.data_ = options.data;
	var colors;
	switch (options.colors)
	{	case "classic": colors = "#ffa500,blue,red,green,cyan,magenta,yellow,#0f0"; break;
		case "dark": colors = "#960,#003,#900,#060,#099,#909,#990,#090"; break;
		case "pale": colors = "#fd0,#369,#f64,#3b7,#880,#b5d,#666"; break;
		case "pastel": colors = "#fb4,#79c,#f66,#7d7,#acc,#fdd,#ff9,#b9b"; break;
		case "neon": colors = "#ff0,#0ff,#0f0,#f0f,#f00,#00f"; break;
		default:
			if (/,/.test(options.colors)) colors = options.colors;
			else colors = "#ffa500,blue,red,green,cyan,magenta,yellow,#0f0";
			break;
	}
	this.colors_ = colors.split(',');

	this.renderChart_();
};
ol.inherits(ol.style.Chart, ol.style.RegularShape);


ol.style.Chart.prototype.getData = function() 
{	return this.data_;
}
ol.style.Chart.prototype.setData = function(data) 
{	this.data_ = data;
}


ol.style.Chart.prototype.renderChart_ = function(atlasManager) 
{
	var strokeStyle;
	var strokeWidth = 0;

	if (this.stroke_) 
	{	strokeStyle = ol.color.asString(this.stroke_.getColor());
		strokeWidth = this.stroke_.getWidth();
	}

	// no atlas manager is used, create a new canvas
	var canvas = this.getImage();
	//console.log(this.getImage().width+" / "+(2 * (this.radius_ + strokeWidth) + 1));

	// draw the circle on the canvas
	var context = (canvas.getContext('2d'));
	context.clearRect(0, 0, canvas.width, canvas.height);

	var sum=0;
	for (var i=0; i<this.data_.length; i++)
		sum += this.data_[i];

	// reset transform
	context.setTransform(1, 0, 0, 1, 0, 0);

	// then move to (x, y)
	context.translate(0,0);
	
	// Draw pie
	switch (this.type_)
	{	case "pie":
		{	var a, a0 = -Math.PI/2;
			var c = canvas.width/2;
			context.strokeStyle = strokeStyle;
			context.lineWidth = strokeWidth;
			for (var i=0; i<this.data_.length; i++)
			{	context.beginPath();
				context.moveTo(c,c);
				context.fillStyle = this.colors_[i%this.colors_.length];
				a = a0 + 2*Math.PI*this.data_[i]/sum;
				context.arc ( c, c, this.radius_, a0, a);
				context.closePath();
				context.fill();
				context.stroke();
				a0 = a;
			}
			break;
		}
		case "bar":
		default:
		{	var max=0;
			for (var i=0; i<this.data_.length; i++)
			{	if (max < this.data_[i]) max = this.data_[i];
			}
			var s = Math.min(5,2*this.radius_/this.data_.length);
			var c = canvas.width/2;
			var b = canvas.width - strokeWidth;
			var x, x0 = c - this.data_.length*s/2
			context.strokeStyle = strokeStyle;
			context.lineWidth = strokeWidth;
			for (var i=0; i<this.data_.length; i++)
			{	context.beginPath();
				context.fillStyle = this.colors_[i%this.colors_.length];
				x = x0 + s;
				context.rect ( x0, b-this.data_[i]/max*2*this.radius_, s, this.data_[i]/max*2*this.radius_);
				//console.log ( x0+", "+(b-this.data_[i]/max*2*this.radius_)+", "+x+", "+b);
				context.closePath();
				context.fill();
				context.stroke();
				x0 = x;
			}

		}
	}

	// Set Anchor
	var a = this.getAnchor();
	a[0] = c - this.offset_[0];
	a[1] = c - this.offset_[1];

};


/**
 * @inheritDoc
 */
ol.style.Chart.prototype.getChecksum = function() 
{
	var strokeChecksum = (this.stroke_!==null) ?
		this.stroke_.getChecksum() : '-';
	var fillChecksum = (this.fill_!==null) ?
		this.fill_.getChecksum() : '-';

	var recalculate = (this.checksums_===null) ||
		(strokeChecksum != this.checksums_[1] ||
		fillChecksum != this.checksums_[2] ||
		this.radius_ != this.checksums_[3] ||
		this.data_.join('|') != this.checksums_[4]);

	if (recalculate) {
		var checksum = 'c' + strokeChecksum + fillChecksum 
			+ ((this.radius_ !== void 0) ? this.radius_.toString() : '-')
			+ this.data_.join('|');
		this.checksums_ = [checksum, strokeChecksum, fillChecksum, this.radius_, this.data_.join('|')];
	}

	return this.checksums_[0];
};
