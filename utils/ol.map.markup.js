/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Show a markup a point on postcompose
*	@param {ol.coordinates} point to pulse
*	@param {ol.markup.options} pulse options param
*		- projection {ol.projection|String|undefined} projection of coords, default none
*		- delay {Number} delay before mark fadeout
*		- maxZoom {Number} zoom when mark fadeout
*		- style {ol.style.Image|ol.style.Style|Array<ol.style.Style>} Image to draw as markup, default red circle
*	@return Unique key for the listener with a stop function to stop animation
*/
ol.Map.prototype.markup = function(coords, options)
{	var listenerKey;
	var self = this;
	options = options || {};

	// Change to map's projection
	if (options.projection)
	{	coords = ol.proj.transform(coords, options.projection, this.getView().getProjection());
	}
	
	// options
	var start = new Date().getTime();
	var delay = options.delay || 3000;
	var duration = 1000;
	var maxZoom = options.maxZoom || 100;
	var easing = ol.easing.easeOut;
	var style = options.style;
	if (!style) style = new ol.style.Circle({ radius:10, stroke:new ol.style.Stroke({color:'red', width:2 }) });
	if (style instanceof ol.style.Image) style = new ol.style.Style({ image: style });
	if (!(style instanceof Array)) style = [style];

	// Animate function
	function animate(event) 
	{	var frameState = event.frameState;
		var elapsed = frameState.time - start;
		if (elapsed > delay+duration) 
		{	ol.Observable.unByKey(listenerKey);
			listenerKey = null;
		}
		else 
		{	if (delay>elapsed && this.getView().getZoom()>maxZoom) delay = elapsed;
			var ratio = frameState.pixelRatio;
			var elapsedRatio = 0;
			if (elapsed > delay) elapsedRatio = (elapsed-delay) / duration;
			var context = event.context;
			context.save();
			context.beginPath();
			context.globalAlpha = easing(1 - elapsedRatio);
			for (var i=0; i<style.length; i++)
			{	var imgs = style[i].getImage();
				var sc = imgs.getScale(); 
				imgs.setScale(sc*ratio);
				event.vectorContext.setStyle(style[i]);
				event.vectorContext.drawGeometry(new ol.geom.Point(coords));
				imgs.setScale(sc);
			}
			context.restore();
			// tell OL3 to continue postcompose animation
			if (elapsed >= delay) frameState.animate = true;
		}
	}
			
	setTimeout (function()
		{	if (listenerKey) self.renderSync(); 
		}, delay);

	// Launch animation
	listenerKey = this.on('postcompose', animate, this);
	this.renderSync();
	listenerKey.stop = function()
	{	delay = duration = 0;
		this.target.renderSync();
	};
	return listenerKey;
}