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

/** Show a markup a point on postcompose
*	@deprecated use map.animateFeature instead
*	@param {ol.coordinates} point to pulse
*	@param {ol.markup.options} pulse options param
*		- projection {ol.projection|String|undefined} projection of coords, default none
*		- delay {Number} delay before mark fadeout
*		- maxZoom {Number} zoom when mark fadeout
*		- style {ol.style.Image|ol.style.Style|Array<ol.style.Style>} Image to draw as markup, default red circle
*	@return Unique key for the listener with a stop function to stop animation
*/
ol_Map.prototype.markup = function(coords, options)
{	var listenerKey;
	var self = this;
	options = options || {};

	// Change to map's projection
	if (options.projection)
	{	coords = ol_proj_transform(coords, options.projection, this.getView().getProjection());
	}
	
	// options
	var start = new Date().getTime();
	var delay = options.delay || 3000;
	var duration = 1000;
	var maxZoom = options.maxZoom || 100;
	var easing = ol_easing_easeOut;
	var style = options.style;
	if (!style) style = new ol_style_Circle({ radius:10, stroke:new ol_style_Stroke({color:'red', width:2 }) });
	if (style instanceof ol_style_Image) style = new ol_style_Style({ image: style });
	if (!(style instanceof Array)) style = [style];

	// Animate function
	function animate(event) 
	{	var frameState = event.frameState;
		var elapsed = frameState.time - start;
		if (elapsed > delay+duration) 
		{	ol_Observable_unByKey(listenerKey);
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
				event.vectorContext.drawGeometry(new ol_geom_Point(coords));
				imgs.setScale(sc);
			}
			context.restore();
			// tell OL3 to continue postcompose animation
			if (elapsed >= delay) frameState.animate = true;
		}
	}
			
	setTimeout (function() {
		if (listenerKey) {
			try { self.renderSync(); } catch(e) { /* ok */ }
		}
	}, delay);

	// Launch animation
	listenerKey = this.on('postcompose', animate.bind(this));
	try { this.renderSync(); } catch(e) { /* ok */ }
	listenerKey.stop = function()
	{	delay = duration = 0;
		try { this.target.renderSync(); } catch(e) { /* ok */ }
	};
	return listenerKey;
}