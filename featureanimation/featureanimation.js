/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
*/

import ol from 'ol'
import ol_Object from 'ol/object'
import ol_easing from 'ol/easing'
import ol_Map from 'ol/map'
import ol_layer_Vector from 'ol/layer/vector'
import ol_extent from 'ol/extent'
import ol_Observable from 'ol/observable'

/** Feature animation base class
 * Use the {@link _ol_Map_#animateFeature} or {@link _ol_layer_Vector_#animateFeature} to animate a feature
 * on postcompose in a map or a layer
* @constructor
* @fires animationstart|animationend
* @param {ol_featureAnimationOptions} options
*	@param {Number} options.duration duration of the animation in ms, default 1000
*	@param {bool} options.revers revers the animation direction
*	@param {Number} options.repeat number of time to repeat the animation, default 0
*	@param {oo.style.Style} options.hiddenStyle a style to display the feature when playing the animation
*		to be used to make the feature selectable when playing animation 
*		(@see {@link ../examples/map.featureanimation.select.html}), default the feature 
*		will be hidden when playing (and niot selectable)
*	@param {ol_easing Function} options.fade an easing function used to fade in the feature, default none
*	@param {ol_easing Function} options.easing an easing function for the animation, default ol_easing.linear
*/
var ol_featureAnimation = function(options)
{	options = options || {};
	
	this.duration_ = typeof (options.duration)=='number' ? (options.duration>=0 ? options.duration : 0) : 1000;
	this.fade_ = typeof(options.fade) == 'function' ? options.fade : null;
	this.repeat_ = Number(options.repeat);

	var easing = typeof(options.easing) =='function' ? options.easing : ol_easing.linear;
	if (options.revers) this.easing_ = function(t) { return (1 - easing(t)); };
	else this.easing_ = easing;

	this.hiddenStyle = options.hiddenStyle;

	ol_Object.call(this);
};
ol.inherits(ol_featureAnimation, ol_Object);

/** Draw a geometry 
* @param {olx.animateFeatureEvent} e
* @param {ol.geom} geom geometry for shadow
* @param {ol.geom} shadow geometry for shadow (ie. style with zIndex = -1)
* @private
*/
ol_featureAnimation.prototype.drawGeom_ = function (e, geom, shadow)
{	if (this.fade_) 
	{	e.context.globalAlpha = this.fade_(1-e.elapsed);
	}
	var style = e.style;
	for (var i=0; i<style.length; i++)
	{	var sc=0;
		// OL < v4.3 : setImageStyle doesn't check retina
		var imgs = ol_Map.prototype.getFeaturesAtPixel ? false : style[i].getImage();
		if (imgs) 
		{	sc = imgs.getScale(); 
			imgs.setScale(e.frameState.pixelRatio*sc);
		}
		// Prevent crach if the style is not ready (image not loaded)
		try{
			e.vectorContext.setStyle(style[i]);
			if (style[i].getZIndex()<0) e.vectorContext.drawGeometry(shadow||geom);
			else e.vectorContext.drawGeometry(geom);
		} catch(e) {};
		if (imgs) imgs.setScale(sc);
	}
};

/** Function to perform manipulations onpostcompose. 
 * This function is called with an ol_featureAnimationEvent argument.
 * The function will be overridden by the child implementation.    
 * Return true to keep this function for the next frame, false to remove it.
 * @param {ol_featureAnimationEvent} e
 * @return {bool} true to continue animation.
 * @api 
 */
ol_featureAnimation.prototype.animate = function (e)
{	return false;
};

/** An animation controler object an object to control animation with start, stop and isPlaying function.    
 * To be used with {@link olx.Map#animateFeature} or {@link ol.layer.Vector#animateFeature}
 * @typedef {Object} ol.animationControler
 * @property {function} start - start animation.
 * @property {function} stop - stop animation option arguments can be passed in animationend event.
 * @property {function} isPlaying - return true if animation is playing.
 */

/** Animate feature on a map
 * @function 
 * @fires animationstart, animationend
 * @param {ol.Feature} feature Feature to animate
 * @param {ol_featureAnimation|Array<ol_featureAnimation>} fanim the animation to play
 * @return {olx.animationControler} an object to control animation with start, stop and isPlaying function
 */
ol_Map.prototype.animateFeature =

/** Animate feature on a vector layer 
 * @fires animationstart, animationend
 * @param {ol.Feature} feature Feature to animate
 * @param {ol_featureAnimation|Array<ol_featureAnimation>} fanim the animation to play
 * @return {olx.animationControler} an object to control animation with start, stop and isPlaying function
*/
ol_layer_Vector.prototype.animateFeature = function(feature, fanim)
{	var self = this;
	var listenerKey;
	
	// Save style
	var style = feature.getStyle();
	var flashStyle = style || (this.getStyleFunction ? this.getStyleFunction()(feature) : null);
	if (!flashStyle) flashStyle=[];
	if (!(flashStyle instanceof Array)) flashStyle = [flashStyle];

	// Hide feature while animating
	feature.setStyle(fanim.hiddenStyle || []);

	// Structure pass for animating
	var event = 
		{	// Frame context
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
			coord: ol_extent.getCenter(feature.getGeometry().getExtent()),
			style: flashStyle
		};

	if (!(fanim instanceof Array)) fanim = [fanim];
	// Remove null animations
	for (var i=fanim.length-1; i>=0; i--)
	{	if (fanim[i].duration_===0) fanim.splice(i,1);
	}

	var nb=0, step = 0;

	function animate(e) 
	{	event.vectorContext = e.vectorContext;
		event.frameState = e.frameState;
		if (!event.extent) 
		{	event.extent = e.frameState.extent;
			event.start = e.frameState.time;
			event.context = e.context;
		}
		event.time = e.frameState.time - event.start;
		event.elapsed = event.time / fanim[step].duration_;
		if (event.elapsed > 1) event.elapsed = 1;
		
		// Stop animation?
		if (!fanim[step].animate(event))
		{	nb++;
			// Repeat animation
			if (nb < fanim[step].repeat_)
			{	event.extent = false;
			}
			// newt step
			else if (step < fanim.length-1)
			{	fanim[step].dispatchEvent({ type:'animationend', feature: feature });
				step++;
				nb=0;
				event.extent = false;
			}
			// the end
			else 
			{	stop();
			}
			
		}

		// tell OL3 to continue postcompose animation
		e.frameState.animate = true;
	}

	// Stop animation
	function stop(options)
	{	ol_Observable.unByKey(listenerKey);
		listenerKey = null;
		feature.setStyle(style);
		// Send event
		var event = { type:'animationend', feature: feature };
		if (options) 
		{	for (var i in options) if (options.hasOwnProperty(i))
			{ 	event[i] = options[i]; 
			}
		}
		fanim[step].dispatchEvent(event);
		self.dispatchEvent(event);
	}

	// Launch animation
	function start(options)
	{	if (fanim.length && !listenerKey)
		{	listenerKey = self.on('postcompose', animate, self);
			// map or layer?
			if (self.renderSync) self.renderSync();
			else self.changed();
			// Send event
			var event = { type:'animationstart', feature: feature };
			if (options) 
			{	for (var i in options) if (options.hasOwnProperty(i))
				{ 	event[i] = options[i]; 
				}
			}
			fanim[step].dispatchEvent(event);
			self.dispatchEvent(event);
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
