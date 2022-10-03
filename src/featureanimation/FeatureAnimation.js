/*
  Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL license (http://www.cecill.info/).
*/

import ol_Object from 'ol/Object.js'
import {linear as ol_easing_linear} from 'ol/easing.js'
import ol_Map from 'ol/Map.js'
import {getCenter as ol_extent_getCenter} from 'ol/extent.js'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_layer_Base from 'ol/layer/Base.js'
import ol_style_Style from 'ol/style/Style.js'
import ol_style_Circle from 'ol/style/Circle.js'
import ol_style_Stroke from 'ol/style/Stroke.js'
import ol_layer_Vector from 'ol/layer/Vector.js'
import ol_source_Vector from 'ol/source/Vector.js'

import ol_render_getVectorContext from '../util/getVectorContext.js';
import ol_ext_getVectorContextStyle from '../util/getVectorContextStyle.js'

/** Feature animation base class
 * Use the {@link ol.Map#animateFeature} or {@link ol.layer.Vector#animateFeature} to animate a feature
 * on postcompose in a map or a layer
* @constructor
* @fires animationstart
* @fires animating
* @fires animationend
* @param {ol_featureAnimationOptions} options
*	@param {Number} options.duration duration of the animation in ms, default 1000
*	@param {bool} options.revers revers the animation direction
*	@param {Number} options.repeat number of time to repeat the animation, default 0
*	@param {ol.style.Style} options.hiddenStyle a style to display the feature when playing the animation
*	  to be used to make the feature selectable when playing animation 
*	  (@see {@link ../examples/map.featureanimation.select.html}), default the feature 
*	  will be hidden when playing (and not selectable)
*	@param {ol_easing_Function} options.fade an easing function used to fade in the feature, default none
*	@param {ol_easing_Function} options.easing an easing function for the animation, default ol_easing_linear
*/
var ol_featureAnimation = class olfeatureAnimation extends ol_Object {
  constructor(options) {
    options = options || {}
    super();

    this.duration_ = typeof (options.duration) == 'number' ? (options.duration >= 0 ? options.duration : 0) : 1000
    this.fade_ = typeof (options.fade) == 'function' ? options.fade : null
    this.repeat_ = Number(options.repeat)

    var easing = typeof (options.easing) == 'function' ? options.easing : ol_easing_linear
    if (options.revers)
      this.easing_ = function (t) { return (1 - easing(t)) }
    else
      this.easing_ = easing

    this.hiddenStyle = options.hiddenStyle
  }
  /** Draw a geometry
  * @param {olx.animateFeatureEvent} e
  * @param {ol.geom} geom geometry for shadow
  * @param {ol.geom} shadow geometry for shadow (ie. style with zIndex = -1)
  * @private
  */
  drawGeom_(e, geom, shadow) {
    if (this.fade_) {
      e.context.globalAlpha = this.fade_(1 - e.elapsed)
    }
    var style = e.style
    for (var i = 0; i < style.length; i++) {
      // Prevent crach if the style is not ready (image not loaded)
      try {
        var vectorContext = e.vectorContext || ol_render_getVectorContext(e)
        var s = ol_ext_getVectorContextStyle(e, style[i])
        vectorContext.setStyle(s)
        if (s.getZIndex() < 0)
          vectorContext.drawGeometry(shadow || geom)
        else
          vectorContext.drawGeometry(geom)
      } catch (e) { /* ok */ }
    }
  }
  /** Function to perform manipulations onpostcompose.
   * This function is called with an ol_featureAnimationEvent argument.
   * The function will be overridden by the child implementation.
   * Return true to keep this function for the next frame, false to remove it.
   * @param {ol_featureAnimationEvent} e
   * @return {bool} true to continue animation.
   * @api
   */
  animate( /* e */) {
    return false
  }
}

/** Hidden style: a transparent style
 */
ol_featureAnimation.hiddenStyle = new ol_style_Style({ 
  image: new ol_style_Circle({}), 
  stroke: new ol_style_Stroke({ 
    color: 'transparent' 
  }) 
});

/** An animation controler object an object to control animation with start, stop and isPlaying function.    
 * To be used with {@link olx.Map#animateFeature} or {@link ol.layer.Vector#animateFeature}
 * @typedef {Object} animationControler
 * @property {function} start - start animation.
 * @property {function} stop - stop animation option arguments can be passed in animationend event.
 * @property {function} isPlaying - return true if animation is playing.
 */

/** Animate feature on a map
 * @function 
 * @param {ol.Feature} feature Feature to animate
 * @param {ol_featureAnimation|Array<ol_featureAnimation>} fanim the animation to play
 * @return {animationControler} an object to control animation with start, stop and isPlaying function
 */
ol_Map.prototype.animateFeature = function(feature, fanim) {
  // Get or create an animation layer associated with the map 
  var layer = this._featureAnimationLayer;
  if (!layer) {
    layer = this._featureAnimationLayer = new ol_layer_Vector({ source: new ol_source_Vector() });
    layer.setMap(this);
  }
  // Animate feature on this layer
  layer.getSource().addFeature(feature);
  var listener = fanim.on('animationend', function(e) {
    if (e.feature===feature) {
      // Remove feature on end
      layer.getSource().removeFeature(feature);
      ol_Observable_unByKey(listener);
    }
  });
  layer.animateFeature(feature, fanim);
};

/** Animate feature on a vector layer 
 * @fires animationstart, animationend
 * @param {ol.Feature} feature Feature to animate
 * @param {ol_featureAnimation|Array<ol_featureAnimation>} fanim the animation to play
 * @param {boolean} useFilter use the filters of the layer
 * @return {animationControler} an object to control animation with start, stop and isPlaying function
 */
ol_layer_Base.prototype.animateFeature = function(feature, fanim, useFilter) {
  var self = this;
  var listenerKey;

  // Save style
  var style = feature.getStyle();
  var flashStyle = style || (this.getStyleFunction ? this.getStyleFunction()(feature) : null);
  if (!flashStyle) flashStyle=[];
  if (!(flashStyle instanceof Array)) flashStyle = [flashStyle];

  // Structure pass for animating
  var event = {
    // Frame context
    vectorContext: null,
    frameState: null,
    start: 0,
    time: 0,
    elapsed: 0,
    extent: false,
    // Feature information
    feature: feature,
    geom: feature.getGeometry(),
    typeGeom: feature.getGeometry().getType(),
    bbox: feature.getGeometry().getExtent(),
    coord: ol_extent_getCenter(feature.getGeometry().getExtent()),
    style: flashStyle
  };

  if (!(fanim instanceof Array)) fanim = [fanim];
  // Remove null animations
  for (var i=fanim.length-1; i>=0; i--) {
    if (fanim[i].duration_===0) fanim.splice(i,1);
  }

  var nb=0, step = 0;
  // Filter availiable on the layer
  var filters = (useFilter && this.getFilters) ? this.getFilters() : [];

  function animate(e) {
    event.type = e.type;
    try {
      event.vectorContext = e.vectorContext || ol_render_getVectorContext(e);
    } catch(e) { /* nothing todo */ }
    event.frameState = e.frameState;
    event.inversePixelTransform = e.inversePixelTransform;
    if (!event.extent) {
      event.extent = e.frameState.extent;
      event.start = e.frameState.time;
      event.context = e.context;
    }
    event.time = e.frameState.time - event.start;
    event.elapsed = event.time / fanim[step].duration_;
    if (event.elapsed > 1) event.elapsed = 1;

    // Filter
    e.context.save();
    filters.forEach(function(f) {
      if (f.get('active')) f.precompose(e);
    });
    if (this.getOpacity) {
      e.context.globalAlpha = this.getOpacity();
    }
    

    // Stop animation?
    if (!fanim[step].animate(event)) {
      nb++;
      // Repeat animation
      if (nb < fanim[step].repeat_) {
        event.extent = false;
      } else if (step < fanim.length-1) {
        // newt step
        fanim[step].dispatchEvent({ type:'animationend', feature: feature });
        step++;
        nb=0;
        event.extent = false;
      } else {
        // the end
        stop();
      }
    } else {
      var animEvent = { 
        type: 'animating', 
        step: step,
        start: event.start,
        time: event.time,
        elapsed: event.elapsed,
        rotation: event.rotation||0,
        geom: event.geom,
        coordinate: event.coord,
        feature: feature,
        extra: event.extra || {}
      };
      fanim[step].dispatchEvent(animEvent);
      self.dispatchEvent(animEvent);
    }

    filters.forEach(function(f) {
      if (f.get('active')) f.postcompose(e);
    });
    e.context.restore();

    // tell OL3 to continue postcompose animation
    e.frameState.animate = true;
  }

  // Stop animation
  function stop(options) {
    ol_Observable_unByKey(listenerKey);
    listenerKey = null;
    feature.setStyle(style);
    event.stop = (new Date).getTime();
    // Send event
    var eventEnd = { type:'animationend', feature: feature };
    if (options) {
      for (var i in options) if (options.hasOwnProperty(i)) {
        eventEnd[i] = options[i]; 
      }
    }
    fanim[step].dispatchEvent(eventEnd);
    self.dispatchEvent(eventEnd);
  }

  // Launch animation
  function start(options) {
    if (fanim.length && !listenerKey) {
      // Restart at stop time
      if (event.stop) {
        event.start = (new Date).getTime() - event.stop + event.start;
        event.stop = 0;
      }
      // Compose
      listenerKey = self.on(['postcompose','postrender'], animate.bind(self));
      // map or layer?
      if (self.renderSync) {
        try { self.renderSync(); } catch(e) { /* ok */ }
      } else {
        self.changed();
      }
      // Hide feature while animating
      feature.setStyle(fanim[step].hiddenStyle || ol_featureAnimation.hiddenStyle);
      // Send event
      var eventStart = { type:'animationstart', feature: feature };
      if (options) {
        for (var i in options) if (options.hasOwnProperty(i)) {
          eventStart[i] = options[i]; 
        }
      }
      fanim[step].dispatchEvent(eventStart);
      self.dispatchEvent(eventStart);
    }
  }
  start();

  // Return animation controler
  return {
    start: start,
    stop: stop,
    isPlaying: function() { return (!!listenerKey); }
  };
};

export default ol_featureAnimation
