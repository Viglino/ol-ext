/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {inherits as ol_inherits} from 'ol'
import ol_filter_Base from './Base'
import ol_filter_Texture_Image from './TextureImage'

/** Add texture effects on maps or layers
* @constructor
* @requires ol.filter
* @extends {ol_filter_Base}
* @param {*} options
*  @param {Image | undefined} options.img Image object for the texture
*  @param {string} options.src Image source URI
*  @param {number} options.scale scale to draw the image. Default 1.
*  @param {bool} options.rotate Whether to rotate the texture with the view (may cause animation lags on mobile or slow devices). Default is true.
*  @param {null | string | undefined} options.crossOrigin The crossOrigin attribute for loaded images.
*/
var ol_filter_Texture = function(options)
{	ol_filter_Base.call(this, options);

	this.setFilter(options);
}
ol_inherits(ol_filter_Texture, ol_filter_Base);

/** Set texture
* @param {*} options
*  @param {Image | undefined} options.img Image object for the texture
*  @param {string} options.src Image source URI
*  @param {number} options.scale scale to draw the image. Default 1.
*  @param {bool} options.rotate Whether to rotate the texture with the view (may cause animation lags on mobile or slow devices). Default is true.
*  @param {null | string | undefined} options.crossOrigin The crossOrigin attribute for loaded images.
*/
ol_filter_Texture.prototype.setFilter = function(options)
{	var img;
	options = options || {};
	if (options.img) img = option.img;
	else 
	{	img = new Image();
		if (options.src) {
			// Look for a texture stored in ol_filter_Texture_Image
			if (ol_filter_Texture_Image && ol_filter_Texture_Image[options.src]) {
				img.src = ol_filter_Texture_Image[options.src];
			} 
			// default source
			else {
				if (!img.src) img.src = options.src;
			}
		}
		img.crossOrigin = options.crossOrigin || null;
	}

	this.set('rotateWithView', options.rotateWithView !== false);
	this.set('opacity', typeof(options.opacity)=='number' ? options.opacity : 1);
	
	this.set('ready', false);
	var self = this;
	function setPattern(img)
	{	self.pattern = {};
		self.pattern.scale = options.scale || 1;
		self.pattern.canvas = document.createElement('canvas');
		self.pattern.canvas.width = img.width * self.pattern.scale;
		self.pattern.canvas.height = img.height * self.pattern.scale;
		self.pattern.canvas.width = img.width;// * self.pattern.scale;
		self.pattern.canvas.height = img.height;// * self.pattern.scale;
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
ol_filter_Texture.prototype.getPattern = function (offsetX, offsetY)
{	var c = this.pattern.canvas;
	var ctx = this.pattern.ctx;
	ctx.save();
	/*
		offsetX /= this.pattern.scale;
		offsetY /= this.pattern.scale;
		ctx.scale(this.pattern.scale,this.pattern.scale);
	*/
		ctx.translate(-offsetX, offsetY);
		ctx.beginPath();
		ctx.rect(offsetX, -offsetY, c.width, c.height);
		ctx.fill();
	ctx.restore();
	return ctx.createPattern(c, 'repeat');
}

/** Draw pattern over the map on postcompose
*/
ol_filter_Texture.prototype.postcompose = function(e)
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
		ctx.scale(ratio*this.pattern.scale,ratio*this.pattern.scale);

		if (this.get('rotateWithView'))
		{	// Translate pattern
			res *= this.pattern.scale
			ctx.fillStyle = this.getPattern ((w*mt[0] + h*mt[1] + mt[4])/res, (w*mt[2] + h*mt[3] + mt[5])/res);

			// Rotate on canvas center and fill
			ctx.translate(w/this.pattern.scale, h/this.pattern.scale);
			ctx.rotate(e.frameState.viewState.rotation);
			ctx.beginPath();
			ctx.rect(-w-m, -h-m, 2*m, 2*m);
			ctx.fill(); 
		}
		else
		{
			/**/
				var dx = -(w*mt[0] + h*mt[1] + mt[4])/res;
				var dy = (w*mt[2] + h*mt[3] + mt[5])/res;
			
				var cos = Math.cos(e.frameState.viewState.rotation);
				var sin = Math.sin(e.frameState.viewState.rotation);
				var offsetX = (dx*cos - dy*sin) / this.pattern.scale;
				var offsetY = (dx*sin + dy*cos) / this.pattern.scale;

				ctx.translate(offsetX, offsetY);
				ctx.beginPath();
				ctx.fillStyle = this.pattern.ctx.fillStyle;
				ctx.rect(-offsetX -m , -offsetY -m, 2*m, 2*m);
				ctx.fill(); 
			/*	//old version without centered rotation
				var offsetX = -(e.frameState.extent[0]/res) % this.pattern.canvas.width;
				var offsetY = (e.frameState.extent[1]/res) % this.pattern.canvas.height;
				ctx.rotate(e.frameState.viewState.rotation);
				ctx.translate(offsetX, offsetY);
				ctx.beginPath();
				ctx.fillStyle = this.pattern.ctx.fillStyle
				ctx.rect(-offsetX -m , -offsetY -m, 2*m, 2*m);
				ctx.fill(); 
			*/
		}

	ctx.restore();
}

export default ol_filter_Texture
