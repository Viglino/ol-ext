/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  
  ol_source_GeoImage is a layer source with georeferencement to place it on a map.
*/
/** @typedef {Object} GeoImageOptions
 * @property {url} url url of the static image
 * @property {image} image the static image, if not provided, use url to load an image
 * @property {ol.Coordinate} imageCenter coordinate of the center of the image
 * @property {ol.Size|number} imageScale [scalex, scaley] of the image
 * @property {number} imageRotate angle of the image in radian, default 0
 * @property {ol.Extent} imageCrop of the image to be show (in the image) default: [0,0,imageWidth,imageHeight]
 * @property {Array.<ol.Coordinate>} imageMask linestring to mask the image on the map
 */

import ol_ext_inherits from '../util/ext'
import ol_source_ImageCanvas from 'ol/source/ImageCanvas'
import ol_geom_Polygon from 'ol/geom/Polygon'
import {boundingExtent as ol_extent_boundingExtent} from 'ol/extent'
import {fromExtent as ol_geom_Polygon_fromExtent} from 'ol/geom/Polygon'

/** Layer source with georeferencement to place it on a map
 * @constructor 
 * @extends {ol_source_ImageCanvas}
 * @param {GeoImageOptions} options
 */
var ol_source_GeoImage = function(opt_options) {
  var options = { 
    attributions: opt_options.attributions,
    logo: opt_options.logo,
    projection: opt_options.projection
  };
  
  // options.projection = opt_options.projection;

  // Load Image
  this._image = (opt_options.image ? opt_options.image : new Image );
  this._image.crossOrigin = opt_options.crossOrigin; // 'anonymous';
  // Show image on load
  var self = this;
  this._image.onload = function() {
    self.setCrop (self.crop);
    self.changed();
  }
  if (!opt_options.image) this._image.src = opt_options.url;

  // Draw image on canvas
  options.canvasFunction = this.calculateImage;

  ol_source_ImageCanvas.call (this, options);	
  
  // Coordinate of the image center 
  this.center = opt_options.imageCenter;
  // Image scale 
  this.setScale(opt_options.imageScale);
  // Rotation of the image
  this.rotate = opt_options.imageRotate ? opt_options.imageRotate : 0;
  // Crop of the image
  this.crop = opt_options.imageCrop;
  // Mask of the image
  this.mask = opt_options.imageMask;
  // Crop
  this.setCrop (this.crop);

  // Calculate extent on change
  this.on('change', function() {
    this.set('extent', this.calculateExtent());
  }.bind(this));
};
ol_ext_inherits(ol_source_GeoImage, ol_source_ImageCanvas);

/** calculate image at extent / resolution
 * @param {ol/extent/Extent} extent
 * @param {number} resolution
 * @param {number} pixelRatio
 * @param {ol/size/Size} size
 * @return {HTMLCanvasElement}
 */
ol_source_GeoImage.prototype.calculateImage = function(extent, resolution, pixelRatio, size) {
  if (!this.center) return;
  var canvas = document.createElement('canvas');
  canvas.width = size[0];
  canvas.height = size[1];
  var ctx = canvas.getContext('2d');

  if (!this._imageSize) return canvas;
  // transform coords to pixel
  function tr(xy) {
    return [
      (xy[0]-extent[0])/(extent[2]-extent[0]) * size[0],
      (xy[1]-extent[3])/(extent[1]-extent[3]) * size[1]
    ];
  }
  // Clipping mask
  if (this.mask) {
    ctx.beginPath();
    var p = tr(this.mask[0]);
    ctx.moveTo(p[0],p[1]);
    for (var i=1; i<this.mask.length; i++) {
      p = tr(this.mask[i]);
      ctx.lineTo(p[0],p[1]);
    }
    ctx.clip();
  }
  
  // Draw
  var pixel = tr(this.center);
  var dx = (this._image.naturalWidth/2 - this.crop[0]) *this.scale[0] /resolution *pixelRatio;
  var dy = (this._image.naturalHeight/2 - this.crop[1]) *this.scale[1] /resolution *pixelRatio;
  var sx = this._imageSize[0]*this.scale[0]/resolution *pixelRatio;
  var sy = this._imageSize[1]*this.scale[1]/resolution *pixelRatio;

  ctx.translate(pixel[0],pixel[1]);
  if (this.rotate) ctx.rotate(this.rotate);
  ctx.drawImage(this._image, this.crop[0], this.crop[1], this._imageSize[0], this._imageSize[1], -dx, -dy, sx,sy);
  return canvas;
}

/**
 * Get coordinate of the image center.
 * @return {ol.Coordinate} coordinate of the image center.
 * @api stable
 */
ol_source_GeoImage.prototype.getCenter = function() {
  return this.center;
}
/**
 * Set coordinate of the image center.
 * @param {ol.Coordinate} coordinate of the image center.
 * @api stable
 */
ol_source_GeoImage.prototype.setCenter = function(center) {
  this.center = center;
  this.changed();
}

/**
 * Get image scale.
 * @return {ol.size} image scale (along x and y axis).
 * @api stable
 */
ol_source_GeoImage.prototype.getScale = function() {
  return this.scale;
}
/**
 * Set image scale.
 * @param {ol.size|Number} image scale (along x and y axis or both).
 * @api stable
 */
ol_source_GeoImage.prototype.setScale = function(scale) {
  switch (typeof(scale)) {
    case 'number':
      scale = [scale,scale];
      break;
    case 'object': 
      if (scale.length != 2) return;
      break;
    default: return;
  }
  this.scale = scale;
  this.changed();
};

/**
 * Get image rotation.
 * @return {Number} rotation in degre.
 * @api stable
 */
ol_source_GeoImage.prototype.getRotation = function() {
  return this.rotate;
};
/**
 * Set image rotation.
 * @param {Number} rotation in radian.
 * @api stable
 */
ol_source_GeoImage.prototype.setRotation = function(angle) {
  this.rotate = angle;
  this.changed();
};

/**
 * Get the image.
 * @api stable
 */
ol_source_GeoImage.prototype.getGeoImage = function() {
  return this._image;
};

/**
 * Get image crop extent.
 * @return {ol.extent} image crop extent.
 * @api stable
 */
ol_source_GeoImage.prototype.getCrop = function() {
  return this.crop;
};


/**
 * Set image mask.
 * @param {ol.geom.LineString} coords of the mask
 * @api stable
 */
ol_source_GeoImage.prototype.setMask = function(mask) {
  this.mask = mask;
  this.changed();
};

/**
 * Get image mask.
 * @return {ol.geom.LineString} coords of the mask
 * @api stable
 */
ol_source_GeoImage.prototype.getMask = function() {
  return this.mask;
};

/**
 * Set image crop extent.
 * @param {ol.extent|Number} image crop extent or a number to crop from original size.
 * @api stable
 */
ol_source_GeoImage.prototype.setCrop = function(crop) {
  // Image not loaded => get it latter
  if (!this._image.naturalWidth) {
    this.crop = crop;
    return;
  }
  if (crop) {
    switch (typeof(crop)) {
      case 'number':
        crop = [crop,crop,this._image.naturalWidth-crop,this._image.naturalHeight-crop];
        break;
      case 'object': 
        if (crop.length != 4) return;
        break;
      default: return;
    }
    crop = ol_extent_boundingExtent([ [crop[0],crop[1]], [crop[2],crop[3]] ]);
    this.crop = [ Math.max(0,crop[0]), Math.max(0,crop[1]), Math.min(this._image.naturalWidth,crop[2]), Math.min(this._image.naturalHeight,crop[3]) ];
  }
  else this.crop = [0,0, this._image.naturalWidth,this._image.naturalHeight];
  if (this.crop[2]<=this.crop[0]) this.crop[2] = this.crop[0]+1;
  if (this.crop[3]<=this.crop[1]) this.crop[3] = this.crop[1]+1;
  this._imageSize = [ this.crop[2]-this.crop[0], this.crop[3]-this.crop[1] ];
  this.changed();
};

/** Get the extent of the source.
 * @param {module:ol/extent~Extent} extent If provided, no new extent will be created. Instead, that extent's coordinates will be overwritten.
 * @return {ol.extent}
 */
ol_source_GeoImage.prototype.getExtent = function(opt_extent) {
  var ext = this.get('extent');
  if (!ext) ext = this.calculateExtent();
  if (opt_extent) {
    for (var i=0; i<opt_extent.length; i++) {
      opt_extent[i] = ext[i];
    }
  }
  return ext;
};

/** Calculate the extent of the source image.
 * @param {boolean} usemask return the mask extent, default return the image extent
 * @return {ol.extent}
 */
ol_source_GeoImage.prototype.calculateExtent = function(usemask) {
  var polygon;
  if (usemask!==false && this.getMask()) {
    polygon = new ol_geom_Polygon([this.getMask()])
  } else {
    var center = this.getCenter();
    var scale = this.getScale();
    var width = this.getGeoImage().width * scale[0];
    var height = this.getGeoImage().height * scale[1];
    var extent = ol_extent_boundingExtent([
      [ center[0]-width/2, center[1]-height/2 ],
      [ center[0]+width/2, center[1]+height/2 ]
    ]);
    polygon = ol_geom_Polygon_fromExtent(extent);
    polygon.rotate(-this.getRotation(), center);
  }
  var ext = polygon.getExtent();
  return ext;
};

export default ol_source_GeoImage
