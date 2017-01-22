/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Make a map or layer look like made of a set of Lego bricks.
*	@requires ol.filter
*	@extends {ol.filter.Base}
*	@param {ol.filter.LegoOptions}
*		- brickSize {Number} size of te brick, default 30
*		- crossOrigin {null | string | undefined} crossOrigin attribute for loaded images.
*/
ol.filter.Lego = function(options)
{	if (!options) options = {};
	ol.filter.Base.call(this, options);

	var img = new Image();
	// Default image
	img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAYAAAAfrhY5AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMi8xOS8xNvX4BJkAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAADB0lEQVRIieWXTU8TQRjHfw8t5b2AUFuDB6PSxEhiop75FNz5Dhz4EHwkEu7UcvFIiDFZQ0rrQikUS6m742Gekd3SpVtI5OA/2exs5pn5P+8zK8A8T4QsgDFmBgiAUN9ubPRhwPhRbxGZz0YUqT/KjAdg7F8TDiIP/jtyF/NwhDUl4AUwp99doA20gCZwNSp5GsvzwAdsaTaAb0rW1fkMkANmgU6aPdOSPwc+ATdABfg5QCbQeQAZRhwlN/fIzAOfgQvgS4TgPhgRGQemdF180pgYeQwi4oQE6+proCIivRTEDj1gERsKf5CAy/Yky0vYWH8dkdihAbwGJu8jT8IKUBeR0wcQO9SAd4MmhsV8GjgyxowBrwBfRC70ewVboh3gGfADmMG62iXclSr+FlgAzkchB1u/+UajIcViURyx53lBtVrNr66uzvZ6vdze3t7S9vb25P7+/szOzs7J+vr6dLlcXtb1RhVsRbmGub2rz8Lu7m4Xm+krvu9Pe55XyOfzEgRBpl6vs7a2tnR8fDxeq9V6xWKRzc1N0+l0rtQLgs38WIIPS7hLIO/7/kSpVCo0m82S53lBoVCoHRwctMIwzFWr1fbh4aGfy+WyR0dHU3Nzc5NbW1vLlUrlZmNj41QJDbYJxcgFmDfGXHPbqaKl9hJoiEgWGI8oeq1emNVNLwdYFqrcElDGdsPvwJUxJnaeJ1neVNKkft2OjJNkCtiad11UHN+9MReR1IdEAhawfaKrCsQwLOYAHe10oyKLLTEXpjuHzUDLXe8FEJFQRFzCpEUOeI/tbJfAb1Ugeg9MrvOoAqrErMoP63aLwBtgAttUQlXghttLaYw8DVrYXv8R2zJb2DiGSrQALGMvGQFwpuvOlfiGPren6XBRnGCzuow9MMa4zd4Qm1gXEaVaSviL22v5X7g6b/dP9MPVviKjVuaJe89gLexg4+xiHahCBmxI09R5EgLscXmGTaoM8eR1ZGFkfAejxLwfRjftRcglMmeUONGw1Jb3Z38f3C/WSHjSPxbhCf9S/wDtsjUwAVrtqgAAAABJRU5ErkJggg==";
	img.crossOrigin = options.crossOrigin || null;
	
	// and pattern 
	this.pattern = 
	{	canvas: document.createElement('canvas')
	};
	this.setBrick (options.brickSize, img);
	this.internal_ = document.createElement('canvas');
}
ol.inherits(ol.filter.Lego, ol.filter.Base);

/** Overwrite to handle brickSize
* @param {string} key
* @param {} val
*/
ol.filter.Lego.prototype.set = function (key, val)
{	ol.filter.Base.prototype.set.call(this, key, val);
	if (key=="brickSize" && this.pattern.canvas.width!=val)
	{	this.setBrick(val);
	}
}

/** Set the current brick
*	@param {Number} width the pattern width, default 30
*	@param {Image|undefined} img a square image to use as pattern
*/
ol.filter.Lego.prototype.setBrick = function (width, img)
{	width = Number(width) || 30;
	if (img) this.pattern.img = img;
	if (!this.pattern.img.width)
	{	var self = this;
		this.pattern.img.onload = function()
		{	self.setBrick(width,img);
		}
		return;
	}
	this.pattern.canvas.width = this.pattern.canvas.height = width;
	this.pattern.ctx = this.pattern.canvas.getContext("2d");
	this.pattern.ctx.fillStyle = this.pattern.ctx.createPattern (this.pattern.img, 'repeat');
	this.set("brickSize", width);
};

/** Get translated pattern
*	@param {number} offsetX x offset
*	@param {number} offsetY y offset
*/
ol.filter.Lego.prototype.getPattern = function (offsetX, offsetY)
{	
	if (!this.pattern.ctx) return "transparent";
	//return this.pattern.ctx.fillStyle

	var c = this.pattern.canvas;
	var ctx = this.pattern.ctx;
	var sc = c.width / this.pattern.img.width;
	
	ctx.save();
		ctx.clearRect(0,0,c.width,c.height);

		ctx.scale(sc,sc);
		offsetX /= sc;
		offsetY /= sc;

		ctx.translate(offsetX, offsetY);
		ctx.beginPath();
		ctx.clearRect(-2*c.width, -2*c.height, 4*c.width, 4*c.height);
		ctx.rect(-offsetX, -offsetY, 2*c.width/sc, 2*c.height/sc);
		ctx.fill(); 
	ctx.restore();
	return ctx.createPattern(c, 'repeat');
};

/** Postcompose operation
*/
ol.filter.Lego.prototype.postcompose = function(e)
{	// Set back color hue
	var ctx = e.context;
	var canvas = ctx.canvas;
	var ratio = e.frameState.pixelRatio;

	ctx.save();

		// resize 
		var step = this.pattern.canvas.width*ratio, step2 = step/2;
		var p = e.frameState.extent;
		var res = e.frameState.viewState.resolution/ratio;
		var offset = [ -Math.round((p[0]/res)%step), Math.round((p[1]/res)%step) ];
		var ctx2 = this.internal_.getContext("2d");
		var w = this.internal_.width = canvas.width;
		var h = this.internal_.height = canvas.height;

		// No smoothing please
		ctx2.webkitImageSmoothingEnabled = false;
		ctx2.mozImageSmoothingEnabled = false;
		ctx2.imageSmoothingEnabled = false;
/**/
		var w2 = Math.floor((w-offset[0])/step);
		var h2 = Math.floor((h-offset[1])/step);
		ctx2.drawImage (canvas, offset[0], offset[1], w2*step, h2*step, 0, 0, w2, h2);
		ctx.webkitImageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;
		ctx.imageSmoothingEnabled = false; //future
		ctx.clearRect (0, 0, w,h);
		ctx.drawImage (this.internal_, 0,0, w2,h2, offset[0],offset[1], w2*step, h2*step);
/* /
		for (var x=offset[0]; x<w; x+=step) for (var y=offset[1]; y<h; y+=step)
		{	if (x>=0 && y<h) ctx2.drawImage (canvas, x, y, 1, 1, x, y, step, step);
		}
		ctx.clearRect (0, 0, w,h);
		ctx.drawImage (c, 0, 0);
/**/
		// Draw brick stud
		ctx.scale(ratio,ratio);
		ctx.fillStyle = this.getPattern (offset[0]/ratio, offset[1]/ratio);
		ctx.rect(0,0, w, h);
		ctx.fill(); 

	ctx.restore();
};
