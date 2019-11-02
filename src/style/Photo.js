/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*
*  Photo style for vector features
*/

import ol_ext_inherits from '../util/ext'
import ol_style_RegularShape from 'ol/style/RegularShape'
import {asString as ol_color_asString} from 'ol/color'
import ol_style_Stroke from 'ol/style/Stroke'

/**
 * @classdesc
 * Set Photo style for vector features.
 *
 * @constructor
 * @param {} options
 *  @param { default | square | round | anchored | folio } options.kind
 *  @param {boolean} options.crop crop within square, default is false
 *  @param {Number} options.radius symbol size
 *  @param {boolean} options.shadow drop a shadow
 *  @param {ol_style_Stroke} options.stroke
 *  @param {String} options.src image src
 *  @param {String} options.crossOrigin The crossOrigin attribute for loaded images. Note that you must provide a crossOrigin value if you want to access pixel data with the Canvas renderer.
 *  @param {Number} options.offsetX Horizontal offset in pixels. Default is 0.
 *  @param {Number} options.offsetY Vertical offset in pixels. Default is 0.
 *  @param {function} options.onload callback when image is loaded (to redraw the layer)
 * @extends {ol_style_RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
var ol_style_Photo = function(options) {
  options = options || {};
  this.sanchor_ = options.kind=="anchored" ? 8:0;
  this.shadow_ = Number(options.shadow) || 0;
  if (!options.stroke) {
    options.stroke = new ol_style_Stroke({ width: 0, color: "#000"})
  }
  var strokeWidth = options.stroke.getWidth();
  if (strokeWidth<0) strokeWidth = 0;
  if (options.kind=='folio') strokeWidth += 6;
  options.stroke.setWidth(strokeWidth);
  ol_style_RegularShape.call (this, {
    radius: options.radius + strokeWidth + this.sanchor_/2 + this.shadow_/2, 
    points:0
  //	fill:new ol.style.Fill({color:"red"}) // No fill to create a hit detection Image
  });
  // Hack to get the hit detection Image (no API exported)
  if (!this.hitDetectionCanvas_) {
    var img = this.getImage();
    for (var i in this) {
      if (this[i] && this[i].getContext && this[i]!==img) {
        this.hitDetectionCanvas_ = this[i];
        break;
      }
    }
  }
  // Clone canvas for hit detection
  this.hitDetectionCanvas_ = document.createElement('canvas');
  this.hitDetectionCanvas_.width = this.getImage().width;
  this.hitDetectionCanvas_.height = this.getImage().height;
  
  this.stroke_ = options.stroke;
  this.fill_ = options.fill;
  this.crop_ = options.crop;
  this.crossOrigin_ = options.crossOrigin;
  this.kind_ = options.kind || "default";
  
  this.radius_ = options.radius;
  this.src_ = options.src;

  this.offset_ = [options.offsetX ? options.offsetX :0, options.offsetY ? options.offsetY :0];
  
  this.onload_ = options.onload;

  if (typeof(options.opacity)=='number') this.setOpacity(options.opacity);
  if (typeof(options.rotation)=='number') this.setRotation(options.rotation);
  this.renderPhoto_();
};
ol_ext_inherits(ol_style_Photo, ol_style_RegularShape);


/**
 * Clones the style. 
 * @return {ol_style_Photo}
 */
ol_style_Photo.prototype.clone = function() {
  return new ol_style_Photo({
    stroke: this.stroke_,
    fill: this.fill_,
    shadow: this.shadow_,
    crop: this.crop_,
    crossOrigin: this.crossOrigin_,
    kind: this.kind_,
    radius: this.radius_,
    src: this.src_,
    offsetX: this.offset_[0],
    offsetY: this.offset_[1],
    opacity: this.getOpacity(),
    rotation: this.getRotation()
  });
};

/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * Draw a rectangle if the radius is null.
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius.
 */
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (!r) {
    this.rect(x,y,w,h);
  } else {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y, x+w, y+h, r);
    this.arcTo(x+w, y+h, x, y+h, r);
    this.arcTo(x, y+h, x, y, r);
    this.arcTo(x, y, x+w, y, r);
    this.closePath();
  }
  return this;
};

/**
 * Draw the form without the image
 * @private
 */
ol_style_Photo.prototype.drawBack_ = function(context, color, strokeWidth) {
  var canvas = context.canvas;
  context.beginPath();
  context.fillStyle = color;
  context.clearRect(0, 0, canvas.width, canvas.height);
  switch (this.kind_) {
    case 'square': {
      context.rect(0,0,canvas.width-this.shadow_, canvas.height-this.shadow_);
      break;
    }
    case 'circle': {
      context.arc(this.radius_+strokeWidth, this.radius_+strokeWidth, this.radius_+strokeWidth, 0, 2 * Math.PI, false);
      break;
    }
    case 'folio': {
      var offset = 6;
      strokeWidth -= offset;
      context.strokeStyle = 'rgba(0,0,0,0.5)';
      var w = canvas.width-this.shadow_-2*offset;
      var a = Math.atan(6/w);
      context.save();
      context.rotate(-a);
      context.translate(-6,2);
      context.beginPath();
      context.rect(offset,offset,w,w);
      context.stroke();
      context.fill();
      context.restore();
      context.save();
      context.translate(6,-1);
      context.rotate(a);
      context.beginPath();
      context.rect(offset,offset,w,w);
      context.stroke();
      context.fill();
      context.restore();
      context.beginPath();
      context.rect(offset,offset,w,w);
      context.stroke();
      break;
    }
    case 'anchored': {
      context.roundRect(this.sanchor_/2,0,canvas.width-this.sanchor_-this.shadow_, canvas.height-this.sanchor_-this.shadow_, strokeWidth);
      context.moveTo(canvas.width/2-this.sanchor_-this.shadow_/2,canvas.height-this.sanchor_-this.shadow_);
      context.lineTo(canvas.width/2+this.sanchor_-this.shadow_/2,canvas.height-this.sanchor_-this.shadow_);
      context.lineTo(canvas.width/2-this.shadow_/2,canvas.height-this.shadow_);break;
    }
    default: {
      // roundrect
      context.roundRect(0,0,canvas.width-this.shadow_, canvas.height-this.shadow_, strokeWidth);
      break;
    }
  }
  context.closePath();
};

/**
 * @private
 */
ol_style_Photo.prototype.renderPhoto_ = function() {
  var strokeStyle;
  var strokeWidth = 0;
  if (this.stroke_) {
    strokeStyle = ol_color_asString(this.stroke_.getColor());
    strokeWidth = this.stroke_.getWidth();
  }
  var canvas = this.getImage();

  // Draw hitdetection image
  var context = this.hitDetectionCanvas_.getContext('2d');
  this.drawBack_(context,"#000",strokeWidth);
  context.fill();

  // Draw the image
  context = canvas.getContext('2d');
  this.drawBack_(context,strokeStyle,strokeWidth);
  
  // Draw a shadow
  if (this.shadow_) {
    context.shadowColor = 'rgba(0,0,0,0.5)';
    context.shadowBlur = this.shadow_/2;
    context.shadowOffsetX = this.shadow_/2;
    context.shadowOffsetY = this.shadow_/2;
  }
  context.fill();
  context.shadowColor = 'transparent';
    
  var self = this;
  var img = this.img_ = new Image();
  if (this.crossOrigin_) img.crossOrigin = this.crossOrigin_;
  img.src = this.src_;
  
  // Draw image
  if (img.width) {
    self.drawImage_(img);
  } else {
    img.onload = function() {
      self.drawImage_(img);
      // Force change (?!)
      // self.setScale(1);
      if (self.onload_) self.onload_();
    };
  }
  
  // Set anchor
  var a = this.getAnchor();
  a[0] = (canvas.width - this.shadow_)/2;
  a[1] = (canvas.height - this.shadow_)/2;
  if (this.sanchor_) {
    a[1] = canvas.height - this.shadow_;
  }
};

/**
 * Draw an timage when loaded
 * @private
 */
ol_style_Photo.prototype.drawImage_ = function(img) {
  var canvas = this.getImage();
  // Remove the circle on the canvas
  var context = (canvas.getContext('2d'));

  var strokeWidth = 0;
  if (this.stroke_) strokeWidth = this.stroke_.getWidth();
  var size = 2*this.radius_;

  context.save();
  if (this.kind_=='circle') {
    context.beginPath();
    context.arc(this.radius_+strokeWidth, this.radius_+strokeWidth, this.radius_, 0, 2 * Math.PI, false);
    context.clip();
  }
  var s, x, y, w, h, sx, sy, sw, sh;
  // Crop the image to a square vignette
  if (this.crop_) {
    s = Math.min (img.width/size, img.height/size);
    sw = sh = s*size;
    sx = (img.width-sw)/2;
    sy = (img.height-sh)/2;

    x = y = 0;
    w = h = size+1;
  } else {
    // Fit the image to the size
    s = Math.min (size/img.width, size/img.height);
    sx = sy = 0;
    sw = img.width;
    sh = img.height;

    w = s*sw;
    h = s*sh;
    x = (size-w)/2;
    y = (size-h)/2;
  }
  x += strokeWidth + this.sanchor_/2;
  y += strokeWidth;

  context.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  context.restore();

  // Draw a circle to avoid aliasing on clip
  if (this.kind_=='circle' && strokeWidth) {
    context.beginPath();
    context.strokeStyle = ol_color_asString(this.stroke_.getColor());
    context.lineWidth = strokeWidth/4;
    context.arc(this.radius_+strokeWidth, this.radius_+strokeWidth, this.radius_, 0, 2 * Math.PI, false);
    context.stroke();
  }
};

export default ol_style_Photo
