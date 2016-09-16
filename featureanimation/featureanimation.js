/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/** 

/** Feature aniomation base class
*	@fire animationstart|animationend
*	@param {ol.featureAnimationOptions} options
*		- duration {number}
*		- revers {bool}
*		- fade {ol.easing}
*/
ol.featureAnimation = function(options)
{	options = options || {};
	
	this.duration_ = typeof (options.duration)=='number' ? (options.duration>=0 ? options.duration : 0) : 1000;
	this.fade_ = typeof(options.fade) == 'function' ? options.fade : null;
	this.repeat_ = Number(options.repeat);

	var easing = typeof(options.easing) =='function' ? options.easing : ol.easing.linear;
	if (options.revers) this.easing_ = function(t) { return 1 - easing(t) };
	else this.easing_ = easing;

	this.hiddenStyle = options.hiddenStyle;

	ol.Object.call(this);
}
ol.inherits(ol.featureAnimation, ol.Object);

/** Draw a geometry 
*	@param {olx.animateFeatureEvent} e
*	@param {ol.geom} geom geometry for shadow
*	@param {ol.geom} shadow geometry for shadow (ie. style with zIndex = -1)
*/
ol.featureAnimation.prototype.drawGeom_ = function (e, geom, shadow)
{	if (this.fade_) 
	{	e.context.globalAlpha = this.fade_(1-e.elapsed);
	}
	var style = e.style;
	for (var i=0; i<style.length; i++)
	{	var imgs = style[i].getImage();
		if (imgs) 
		{	var sc = imgs.getScale(); 
			imgs.setScale(e.frameState.pixelRatio*sc);
		}
		e.vectorContext.setStyle(style[i]);
		if (style[i].getZIndex()<0) e.vectorContext.drawGeometry(shadow||geom);
		else e.vectorContext.drawGeometry(geom);
		if (imgs) imgs.setScale(sc);
	}
}

/** Function to perform manipulations onpostcompose. 
*	This function is called with an olx.animateFeature argument. 
*	Return true to keep this function for the next frame, false to remove it.
* @param {ol.featureAnimation.event} e
* @return {bool} true to continue animation.
* @api 
*/
ol.featureAnimation.prototype.animate = function (e)
{	return false;
}

/** Animate feature on a map
*	@fires animationend
*	@param {ol.Feature} feature Feature to animate
*	@param {ol.featureAnimation|Array<ol.featureAnimation>} fanim the animation to play
*/
ol.Map.prototype.animateFeature = 

/** Animate feature on a vector layer 
*	@fires animationend
*	@param {ol.Feature} feature Feature to animate
*	@param {ol.featureAnimation|Array<ol.featureAnimation>} fanim the animation to play
*	@return {animationControler} an object to control animation with start|stop[isPlaying function
*		- start {function} start animation
*		- stop {function} stop animation option arguments can be passed and propagate in animationend event
*		- isPlaying {function} return true if animation is playing
*/
ol.layer.Vector.prototype.animateFeature = function(feature, fanim)
{	var self = this;
	var listenerKey;
	
	// Save style
	var style = feature.getStyle();
	var flashStyle = style || (this.getStyleFunction ? this.getStyleFunction()(feature) : null);
	if (!flashStyle) return;
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
			coord: ol.extent.getCenter(feature.getGeometry().getExtent()),
			style: flashStyle
		};

	if (!(fanim instanceof Array)) fanim = [fanim];
	// Remove null animations
	for (var i=fanim.length-1; i>=0; i--)
	{	if (fanim[i].duration_==0) fanim.splice(i,1);
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
	{	ol.Observable.unByKey(listenerKey);
		listenerKey = null;
		feature.setStyle(style);
		// Send event
		var event = { type:'animationend', feature: feature };
		if (options) for (var i in options) event[i] = options[i];
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
			if (options) for (var i in options) event[i] = options[i];
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
	}
}
