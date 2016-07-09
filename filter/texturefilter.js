/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Add texture effects on maps or layers
*	@requires ol.filter
*	@extends {ol.filter.Base}
*	@param {ol.filter.cropOptions}
*		- feature {ol.Feature} feature to mask with
*		- fill {ol.style.Fill} style to fill with
*		- inner {bool} mask inner, default false
*/
ol.filter.Texture = function(options)
{	ol.filter.Base.call(this, options);

	this.setFilter(options);
}
ol.inherits(ol.filter.Texture, ol.filter.Base);

/** Set texture
*	@option {ol.filter.TextureOptions}
*		- img {Image | undefined} Image object for the texture
*		- src {string} Image source URI
*		- rotateWithView {bool} Whether to rotate the texttue with the view. Default is true.
*		- crossOrigin {null | string | undefined} The crossOrigin attribute for loaded images.
* todo: scale, ...
*/
ol.filter.Texture.prototype.setFilter = function(options)
{	var img;
	options = options || {};
	if (options.img) img = option.img;
	else 
	{	img = new Image();
		if (options.src) img.src = ol.filter.Texture[options.src] || options.src;
		img.crossOrigin = options.crossOrigin || null;
	}

	this.set('rotateWithView', options.rotateWithView !== false);
	this.set('opacity', typeof(options.opacity)=='number' ? options.opacity : 1);
	
	this.set('ready', false);
	var self = this;
	function setPattern(img)
	{	self.pattern = {};
		self.pattern.canvas = document.createElement('canvas');
		self.pattern.canvas.width = img.width;
		self.pattern.canvas.height = img.height;
		self.pattern.ctx = self.pattern.canvas.getContext("2d");
		self.pattern.ctx.fillStyle = self.pattern.ctx.createPattern(img, 'repeat');
		// Force refresh
		self.set('ready', true);
	};

	if (img.width) 
	{	setPattern(img);
	}
	else
	{	img.onload = function()
		{	setPattern(img);
		}
	}
}

/** Get translated pattern
*	@param {number} x offset
*	@param {number} y offset
*/
ol.filter.Texture.prototype.getPattern = function (offsetX, offsetY)
{	var c = this.pattern.canvas;
	var ctx = this.pattern.ctx;
	ctx.save();
		ctx.translate(-offsetX, offsetY);
		ctx.beginPath();
		ctx.rect(offsetX, -offsetY, c.width, c.height);
		ctx.fill(); 
	ctx.restore();
	return ctx.createPattern(c, 'repeat');
}

/** Draw pattern over the map on postcompose
*/
ol.filter.Texture.prototype.postcompose = function(e)
{	// not ready
	if (!this.pattern) return;
	
	// Set back color hue
	var ctx = e.context;
	var canvas = ctx.canvas;
	
	var m = 1.5 * Math.max(canvas.width, canvas.height);
	var mt = e.frameState.pixelToCoordinateTransform;
	// Old version (matrix)
	if (!mt)
	{	mt = e.frameState.pixelToCoordinateMatrix,
		mt[2] = mt[4];
		mt[3] = mt[5];
		mt[4] = mt[12];
		mt[5] = mt[13];
	}
	var ratio = e.frameState.pixelRatio;
	var res = e.frameState.viewState.resolution;
	var w = canvas.width/2, 
		h = canvas.height/2;

	ctx.save();

		ctx.globalCompositeOperation = "multiply";
		//ctx.globalCompositeOperation = "overlay";
		//ctx.globalCompositeOperation = "color";
		ctx.globalAlpha = this.get('opacity');
		ctx.scale(ratio,ratio);
		
		if (this.get('rotateWithView'))
		{	// Translate pattern
			ctx.fillStyle = this.getPattern ((w*mt[0] + h*mt[1] + mt[4])/res, (w*mt[2] + h*mt[3] + mt[5])/res);

			// Rotate on canvas center and fill
			ctx.translate(w, h);
			ctx.rotate(e.frameState.viewState.rotation);
			ctx.beginPath();
			ctx.rect(-w-m, -h-m, 2*m, 2*m);
			ctx.fill(); 
		}
		else
		{	var dx = -(w*mt[0] + h*mt[1] + mt[4])/res;
			var dy = (w*mt[2] + h*mt[3] + mt[5])/res;
			
			var cos = Math.cos(e.frameState.viewState.rotation);
			var sin = Math.sin(e.frameState.viewState.rotation);
			var offsetX = dx*cos - dy*sin;
			var offsetY = dx*sin + dy*cos;

			ctx.translate(offsetX, offsetY);
			ctx.beginPath();
			ctx.fillStyle = this.pattern.ctx.fillStyle
			ctx.rect(-offsetX -m , -offsetY -m, 2*m, 2*m);
			ctx.fill(); 
		}
	/*	old version without centered rotation
		var offsetX = -(e.frameState.extent[0]/res) % this.pattern.canvas.width;
		var offsetY = (e.frameState.extent[1]/res) % this.pattern.canvas.height;
		ctx.rotate(e.frameState.viewState.rotation);
		ctx.translate(offsetX, offsetY);
		ctx.beginPath();
		ctx.fillStyle = this.pattern.ctx.fillStyle
		ctx.rect(-offsetX -m , -offsetY -m, 2*m, 2*m);
		ctx.fill(); 
	*/

	ctx.restore();
}
