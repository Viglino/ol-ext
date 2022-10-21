/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_Map from 'ol/Map.js'
import {transform as ol_proj_transform} from 'ol/proj.js'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import {easeOut as ol_easing_easeOut} from 'ol/easing.js'
import ol_style_Circle from 'ol/style/Circle.js'
import ol_style_Stroke from 'ol/style/Stroke.js'
import ol_style_Image from 'ol/style/Image.js'
import ol_style_Style from 'ol/style/Style.js'
import ol_geom_Point from 'ol/geom/Point.js'

/** Pulse a point on postcompose
*	@deprecated use map.animateFeature instead
*	@param {ol.coordinates} point to pulse
*	@param {ol.pulse.options} pulse options param
*		- projection {ol.projection||String} projection of coords
*		- duration {Number} animation duration in ms, default 3000
*		- amplitude {Number} movement amplitude 0: none - 0.5: start at 0.5*radius of the image - 1: max, default 1
*		- easing {ol.easing} easing function, default ol.easing.easeOut
*		- style {ol.style.Image|ol.style.Style|Array<ol.style.Style>} Image to draw as markup, default red circle
*/
ol_Map.prototype.pulse = function(coords, options) {
  var listenerKey;
  options = options || {};

  // Change to map's projection
  if (options.projection) {
    coords = ol_proj_transform(coords, options.projection, this.getView().getProjection());
  }
  
  // options
  var start = new Date().getTime();
  var duration = options.duration || 3000;
  var easing = options.easing || ol_easing_easeOut;
  
  var style = options.style;
  if (!style) style = new ol_style_Circle({ radius:30, stroke:new ol_style_Stroke({color:'red', width:2 }) });
  if (style instanceof ol_style_Image) style = new ol_style_Style({ image: style });
  if (!(style instanceof Array)) style = [style];

  var amplitude = options.amplitude || 1;
  if (amplitude<0) amplitude=0;

  var maxRadius = options.radius || 15;
  if (maxRadius<0) maxRadius = 5;
  /*
  var minRadius = maxRadius - (options.amplitude || maxRadius); //options.minRadius || 0;
  var width = options.lineWidth || 2;
  var color = options.color || 'red';
  console.log("pulse")
  */
  // Animate function
  function animate(event) {
    var frameState = event.frameState;
    var ratio = frameState.pixelRatio;
    var elapsed = frameState.time - start;
    if (elapsed > duration) {
      ol_Observable_unByKey(listenerKey);
    } else {	var elapsedRatio = elapsed / duration;
      var context = event.context;
      context.save();
      context.beginPath();
      var e = easing(elapsedRatio)
      context.globalAlpha = easing(1 - elapsedRatio);
      // console.log("anim")
      for (var i=0; i<style.length; i++) {
        var imgs = style[i].getImage();
        var sc = imgs.getScale(); 
        imgs.setScale(ratio*sc*(1+amplitude*(e-1)));
        event.vectorContext.setStyle(style[i]);
        event.vectorContext.drawGeometry(new ol_geom_Point(coords));
        imgs.setScale(sc);
      }
      context.restore();
      // tell OL3 to continue postcompose animation
      frameState.animate = true;
    }
  }

  // Launch animation
  listenerKey = this.on('postcompose', animate.bind(this));
  try { this.renderSync(); } catch(e) { /* ok */ }
}

