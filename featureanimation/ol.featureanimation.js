/*
	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/**
*/
ol.featureAnimation = function(options)
{	options = options || {};
	this.duration_ = options.duration || 1000;

	var easing = options.easing || ol.easing.easeIn;
	if (options.revers) this.easing_ = function(t) { return 1 - easing(t) };
	else this.easing_ = easing;

	ol.Object.call(this);
}
ol.inherits(ol.featureAnimation, ol.Object);

/** Draw a geometry 
*/
ol.featureAnimation.prototype.drawGeom_ = function (e, geom)
{	var style = e.style;
	for (var i=0; i<style.length; i++)
	{	e.vectorContext.setStyle(style[i]);
		e.vectorContext.drawGeometry(geom);
	}
}
/** Function to perform manipulations onpostcompose. 
*	This function is called with an olx.animateFeature argument. 
*	Return true to keep this function for the next frame, false to remove it.
* @param {ol.featureAnimation.event}
* @api 
*/
ol.featureAnimation.prototype.animate = function (e)
{	return false;
}


/** Drop animation: drop a feature on the map
*/
ol.featureAnimation.Drop = function(options)
{	options = options || {};
	this.speed_ = options.speed || 0;
	ol.featureAnimation.call(this, options);
}
ol.inherits(ol.featureAnimation.Drop, ol.featureAnimation);

/** Animate
*/
ol.featureAnimation.Drop.prototype.animate = function (e)
{	// First time > calculate duration / speed
	if (!e.time && this.speed_) 
	{	this.duration_ = Math.abs(e.coord[1]-e.extent[3])/this.speed_/e.frameState.viewState.resolution;
	}
	// Animate
	// var resolution = e.frameState.viewState.resolution;
	var flashGeom = new ol.geom.Point([ e.coord[0], e.extent[3] + (e.coord[1]-e.extent[3])*this.easing_(e.elapsed) ]);
	this.drawGeom_(e, flashGeom);
	
	return (e.time <= this.duration_);
}

/** Slice animation: feature enter from left
*/
ol.featureAnimation.Slice = function(options)
{	options = options || {};
	this.speed_ = options.speed || 0;
	ol.featureAnimation.call(this, options);
}
ol.inherits(ol.featureAnimation.Slice, ol.featureAnimation);

/** Animate
*/
ol.featureAnimation.Slice.prototype.animate = function (e)
{	// First time > calculate duration / speed
	if (!e.time && this.speed_) 
	{	this.duration_ = Math.abs(e.coord[0]-e.extent[0])/this.speed_/e.frameState.viewState.resolution;
	}
	// Animate
	var flashGeom = new ol.geom.Point([ e.extent[0] + (e.coord[0]-e.extent[0])*this.easing_(e.elapsed), e.coord[1] ]);
	this.drawGeom_(e, flashGeom);
	
	return (e.time <= this.duration_);
}

/** Fade animation: feature fade in
*/
ol.featureAnimation.Fade = function(options)
{	options = options || {};
	this.speed_ = options.speed || 0;
	ol.featureAnimation.call(this, options);
}
ol.inherits(ol.featureAnimation.Fade, ol.featureAnimation);

/** Animate
*/
ol.featureAnimation.Fade.prototype.animate = function (e)
{	e.context.globalAlpha = this.easing_(e.elapsed);
	this.drawGeom_(e, e.geom);
	
	return (e.time <= this.duration_);
}

/**

/** Drop a feature on a map
*	@param {ol.Feature} Feature to animate
*	@param {ol.featureAnimation} 
*/
ol.layer.Vector.prototype.animateFeature = function(feature, fanim)
{	var self = this;
	var listenerKey;
	
	// Save style and hide feature
	var style = feature.getStyle();
	feature.setStyle([]);
	var flashStyle = style || this.getStyleFunction()(feature);
	if (!(flashStyle instanceof Array)) flashStyle = [flashStyle];
	//
	var event = 
		{	start: new Date().getTime(),
			feature: feature,
			geom: feature.getGeometry(),
			typeGeom: feature.getGeometry().getType(),
			coord: feature.getGeometry().getCoordinates(),
			style: flashStyle
		};

	function animate(e) 
	{	event.vectorContext = e.vectorContext;
		event.frameState = e.frameState;
		if (!event.extent) 
		{	event.extent = e.frameState.extent;
			event.start = e.frameState.time;
			event.context = e.context;
		}
		event.time = e.frameState.time - event.start;
		event.elapsed = event.time / fanim.duration_;
		if (event.elapsed > 1) event.elapsed = 1;

		e.context.save();
		// Stop animation?
		if (!fanim.animate(event))
		{	ol.Observable.unByKey(listenerKey);
			feature.setStyle(style);
			self.dispatchEvent({ type:'animationend', feature: feature });
		};
		e.context.restore();

		// tell OL3 to continue postcompose animation
		e.frameState.animate = true;
	}

	// Launch animation
	listenerKey = this.on('postcompose', animate, this);
	this.changed();
}

