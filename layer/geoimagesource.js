/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	
	ol.source.GeoImage is a layer source with georeferencement to place it on a map.
	
	olx.source.GeoImageOptions:
	{	url: {string} url of the static image
		image: {image} the static image, if not provided, use url to load an image
		imageCenter: {ol.Coordinate} of the center of the image
		imageScale: {ol.Size|Number} [scalex, scaley] of the image
		imageRotate: {number} angle of the image in radian, default 0
		imageCrop: {ol.Extent} of the image to be show (in the image) default: [0,0,imageWidth,imageHeight]
		imageMask: {Array.<ol.Coordinate>} - linestring to mask the image on the map
	}
*/

/**
* @constructor GeoImage
* @extends {ol.source.ImageCanvas}
* @param {olx.source.GeoImageOptions=} options
* @todo 
*/
ol.source.GeoImage = function(opt_options)
{	var options = { 
		attributions: opt_options.attributions,
		logo: opt_options.logo,
		projection: opt_options.projection
	};
	
	// options.projection = opt_options.projection;

	// Coordinate of the image center 
	this.center = opt_options.imageCenter;
	// Scale of the image 
	this.scale = opt_options.imageScale;
	// Rotation of the image
	this.rotate = opt_options.imageRotate ? opt_options.imageRotate : 0;
	// Crop of the image
	this.crop = opt_options.imageCrop;
	// Mask of the image
	this.mask = opt_options.imageMask;

	// Load Image
	this.image = (opt_options.image ? opt_options.image : new Image );
	this.image.crossOrigin = opt_options.crossOrigin; // 'anonymous';
	// Show image on load
	var self = this;
	this.image.onload = function()
	{	self.setCrop (self.crop);
		self.changed();
	}
	if (!opt_options.image) this.image.src = opt_options.url;

	// Draw image on canvas
	options.canvasFunction = function(extent, resolution, pixelRatio, size, projection) 
	{	var canvas = document.createElement('canvas');
		canvas.width = size[0];
		canvas.height = size[1];
		var ctx = canvas.getContext('2d');

		if (!this.imageSize) return canvas;
		// transform coords to pixel
		function tr(xy)
		{	return [(xy[0]-extent[0])/(extent[2]-extent[0]) * size[0],
					(xy[1]-extent[3])/(extent[1]-extent[3]) * size[1]
					];
		}
		// Clipping mask
		if (this.mask)
		{	ctx.beginPath();
			var p = tr(this.mask[0]);
			ctx.moveTo(p[0],p[1]);
			for (var i=1; i<this.mask.length; i++) 
			{	p = tr(this.mask[i]);
				ctx.lineTo(p[0],p[1]);
			}
			ctx.clip();
		}
		
		// Draw
		var pixel = tr(this.center);
		var dx = (this.image.naturalWidth/2 - this.crop[0]) *this.scale[0] /resolution *pixelRatio;
		var dy = (this.image.naturalHeight/2 - this.crop[1]) *this.scale[1] /resolution *pixelRatio;
		var sx = this.imageSize[0]*this.scale[0]/resolution *pixelRatio;
		var sy = this.imageSize[1]*this.scale[1]/resolution *pixelRatio;

		ctx.translate(pixel[0],pixel[1]);
		if (this.rotate) ctx.rotate(this.rotate);
		ctx.drawImage(this.image, this.crop[0], this.crop[1], this.imageSize[0], this.imageSize[1], -dx, -dy, sx,sy);
		return canvas;
	}

	ol.source.ImageCanvas.call (this, options);	
	this.setCrop (this.crop);
};
ol.inherits (ol.source.GeoImage, ol.source.ImageCanvas);

/**
 * Get coordinate of the image center.
 * @return {ol.Coordinate} coordinate of the image center.
 * @api stable
 */
ol.source.GeoImage.prototype.getCenter = function()
{	return this.center;
}
/**
 * Set coordinate of the image center.
 * @param {ol.Coordinate} coordinate of the image center.
 * @api stable
 */
ol.source.GeoImage.prototype.setCenter = function(center)
{	this.center = center;
	this.changed();
}

/**
 * Get image scale.
 * @return {ol.size} image scale (along x and y axis).
 * @api stable
 */
ol.source.GeoImage.prototype.getScale = function()
{	return this.scale;
}
/**
 * Set image scale.
 * @param {ol.size|Number} image scale (along x and y axis or both).
 * @api stable
 */
ol.source.GeoImage.prototype.setScale = function(scale)
{	switch (typeof(scale))
	{	case 'number':
			scale = [scale,scale];
			break;
		case 'object': 
			if (scale.length != 2) return;
			break;
		default: return;
	}
	this.scale = scale;
	this.changed();
}

/**
 * Get image rotation.
 * @return {Number} rotation in degre.
 * @api stable
 */
 ol.source.GeoImage.prototype.getRotation = function()
{	return this.rotate;
}
/**
 * Set image rotation.
 * @param {Number} rotation in radian.
 * @api stable
 */
 ol.source.GeoImage.prototype.setRotation = function(angle)
{	this.rotate = angle;
	this.changed();
}

/**
 * Get the image.
 * @api stable
 */
 ol.source.GeoImage.prototype.getImage = function()
{	return this.image;
}

/**
 * Get image crop extent.
 * @return {ol.extent} image crop extent.
 * @api stable
 */
 ol.source.GeoImage.prototype.getCrop = function()
{	return this.crop;
}


/**
 * Set image mask.
 * @param {ol.geom.LineString} coords of the mask
 * @api stable
 */
 ol.source.GeoImage.prototype.setMask = function(mask)
{	this.mask = mask;
	this.changed();
}

/**
 * Get image mask.
 * @return {ol.geom.LineString} coords of the mask
 * @api stable
 */
 ol.source.GeoImage.prototype.getMask = function()
{	return this.mask;
}

/**
 * Set image crop extent.
 * @param {ol.extent|Number} image crop extent or a number to crop from original size.
 * @api stable
 */
 ol.source.GeoImage.prototype.setCrop = function(crop)
{	// Image not loaded => get it latter
	if (!this.image.naturalWidth) 
	{	this.crop = crop;
		return;
	}
	if (crop) 
	{	switch (typeof(crop))
		{	case 'number':
				crop = [crop,crop,this.image.naturalWidth-crop,this.image.naturalHeight-crop];
				break;
			case 'object': 
				if (crop.length != 4) return;
				break;
			default: return;
		}
		var crop = ol.extent.boundingExtent([ [crop[0],crop[1]], [crop[2],crop[3]] ]);
		this.crop = [ Math.max(0,crop[0]), Math.max(0,crop[1]), Math.min(this.image.naturalWidth,crop[2]), Math.min(this.image.naturalHeight,crop[3]) ];
	}
	else this.crop = [0,0, this.image.naturalWidth,this.image.naturalHeight];
	if (this.crop[2]<=this.crop[0]) this.crop[2] = this.crop[0]+1;
	if (this.crop[3]<=this.crop[1]) this.crop[3] = this.crop[1]+1;
	this.imageSize = [ this.crop[2]-this.crop[0], this.crop[3]-this.crop[1] ];
	this.changed();
}
