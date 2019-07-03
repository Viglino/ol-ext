/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_control_CanvasBase from './CanvasBase'
import ol_style_Style from 'ol/style/Style'
import ol_style_Stroke from 'ol/style/Stroke'

/**
 * Draw a compass on the map. The position/size of the control is defined in the css.
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object=} options Control options. The style {_ol_style_Stroke_} option is usesd to draw the text.
 *  @param {string} options.className class name for the control
 *  @param {Image} options.image an image, default use the src option or a default image
 *  @param {string} options.src image src, default use the image option or a default image
 *  @param {boolean} options.rotateVithView rotate vith view (false to show watermark), default true
 *  @param {ol_style_Stroke} options.style style to draw the lines, default draw no lines
 */
var ol_control_Compass = function(options) {
  var self = this;
  if (!options) options = {};
  
  // Initialize parent
  var elt = document.createElement("div");
  elt.className = "ol-compassctrl ol-unselectable ol-hidden" + (options.className ? " "+options.className : "");
  elt.style.position = "absolute";
  elt.style.visibility = "hidden";
  
  var style = (options.style instanceof ol_style_Stroke) ? new ol_style_Style({stroke: options.style}) : options.style;
  if (!options.style) {
    style = new ol_style_Style({stroke: new ol_style_Stroke({width:0}) });
  }
  ol_control_CanvasBase.call(this, { 
    element: elt,
    style: style
  });

  this.set('rotateVithView', options.rotateWithView!==false);

  // The image
  if (options.image) {
    this.img_ = options.image;
  }
  else if (options.src) {
    this.img_ = new Image();
    this.img_.onload = function(){ if (self.getMap()) self.getMap().renderSync(); }
    this.img_.src = options.src;
  } else {
    this.img_ = this.defaultCompass_(this.element.clientWidth, this.getStroke().getColor());
  }

  // 8 angles
  this.da_ = [];
  for (var i=0; i<8; i++) this.da_[i] = [ Math.cos(Math.PI*i/8), Math.sin(Math.PI*i/8) ];
};
ol_ext_inherits(ol_control_Compass, ol_control_CanvasBase);

/**
 * Create a default image.
 * @param {number} s the size of the compass
 * @private
 */
ol_control_Compass.prototype.defaultCompass_ = function (s, color) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext("2d");
  s = canvas.width = canvas.height = s || 150;
  var r = s/2;
  var r2 = 0.22*r;

  function draw (r, r2) {
    ctx.fillStyle = color ||"#963";
    ctx.beginPath();
    ctx.moveTo (0,0); 
    ctx.lineTo (r,0); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (-r,0); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
    ctx.lineTo (0,r); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (0,-r); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
    ctx.fill();
    ctx.stroke();
  }
    
  function draw2 (r, r2) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo (0,0); 
    ctx.lineTo (r,0); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
    ctx.lineTo (-r,0); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (0,r); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (0,-r); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
    ctx.fill();
    ctx.globalCompositeOperation="source-over";
    ctx.beginPath();
    ctx.moveTo (0,0); 
    ctx.lineTo (r,0); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
    ctx.lineTo (-r,0); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (0,r); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (0,-r); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
    ctx.stroke();
  }

  ctx.translate(r,r);
  ctx.strokeStyle = color || "#963";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc (0,0, s*0.41, 0, 2*Math.PI);
  ctx.arc (0,0, s*0.44, 0, 2*Math.PI);
  ctx.stroke();

  ctx.rotate(Math.PI/4)
  draw (r*0.9, r2*0.8);
  draw2 (r*0.9, r2*0.8);

  ctx.rotate(-Math.PI/4)
  draw (r, r2);
  draw2 (r, r2);
  
  return canvas;
};

/** Draw compass
* @param {ol.event} e postcompose event
* @private
*/
ol_control_Compass.prototype._draw = function(e) {
  var ctx = this.getContext(e);
  if (!ctx) return;
  var canvas = ctx.canvas;

  // Retina device
  var ratio = e.frameState.pixelRatio;
  ctx.save();
  ctx.scale(ratio,ratio);

  var w = this.element.clientWidth;
  var h = this.element.clientHeight;
  var pos = {left: this.element.offsetLeft, top: this.element.offsetTop};
  
  var compass = this.img_;
  var rot = e.frameState.viewState.rotation;
  
  ctx.beginPath();
    ctx.translate(pos.left+w/2, pos.top+h/2);
    if (this.get('rotateVithView')) ctx.rotate(rot);
    /*
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = this.opacity || 1;
    */
    if (this.getStroke().getWidth()) {
      ctx.beginPath();
        ctx.strokeStyle = this.getStroke().getColor();
        ctx.lineWidth = this.getStroke().getWidth();
        var m = Math.max(canvas.width, canvas.height);
        for (var i=0; i<8; i++) {
          ctx.moveTo (-this.da_[i][0]*m, -this.da_[i][1]*m);
          ctx.lineTo (this.da_[i][0]*m, this.da_[i][1]*m);
        }
      ctx.stroke();
    }
    
    if (compass.width) {
      ctx.drawImage (compass, -w/2, -h/2, w, h);
    }

  ctx.closePath();

  ctx.restore();
};

export default ol_control_Compass