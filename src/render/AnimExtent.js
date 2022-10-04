/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_Map from 'ol/Map.js'
import {transformExtent as ol_proj_transformExtent} from 'ol/proj.js'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import {upAndDown as ol_easing_upAndDown} from 'ol/easing.js'

/** Pulse an extent on postcompose
*	@param {ol.coordinates} point to pulse
*	@param {ol.pulse.options} options pulse options param
*	  @param {ol.projectionLike|undefined} options.projection projection of coords, default no transform
*	  @param {Number} options.duration animation duration in ms, default 2000
*	  @param {ol.easing} options.easing easing function, default ol.easing.upAndDown
*	  @param {ol.style.Stroke} options.style stroke style, default 2px red
*/
ol_Map.prototype.animExtent = function(extent, options){
  var listenerKey;
  options = options || {};

  // Change to map's projection
  if (options.projection) {
    extent = ol_proj_transformExtent (extent, options.projection, this.getView().getProjection());
  }
  
  // options
  var start = new Date().getTime();
  var duration = options.duration || 1000;
  var easing = options.easing || ol_easing_upAndDown;
  var width = options.style ? options.style.getWidth() || 2 : 2;
  var color = options.style ? options.style.getColr() || 'red' : 'red';

  // Animate function
  function animate(event) {
    var frameState = event.frameState;
    var ratio = frameState.pixelRatio;
    var elapsed = frameState.time - start;
    if (elapsed > duration) {
      ol_Observable_unByKey(listenerKey);
    } else {
      var elapsedRatio = elapsed / duration;
      var p0 = this.getPixelFromCoordinate([extent[0],extent[1]]);
      var p1 = this.getPixelFromCoordinate([extent[2],extent[3]]);

      var context = event.context;
      context.save();
      context.scale(ratio,ratio);
      context.beginPath();
      // var e = easing(elapsedRatio)
      context.globalAlpha = easing(1 - elapsedRatio);
      context.lineWidth = width;
      context.strokeStyle = color;
      context.rect(p0[0], p0[1], p1[0]-p0[0], p1[1]-p0[1]);
      context.stroke();
      context.restore();
      // tell OL3 to continue postcompose animation
      frameState.animate = true;
    }
  }

  // Launch animation
  listenerKey = this.on('postcompose', animate.bind(this));
  try { this.renderSync(); } catch(e) { /* ok */ }
}
