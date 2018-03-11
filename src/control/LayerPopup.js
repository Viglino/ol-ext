/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol from 'ol'
import ol_control_LayerSwitcher from './LayerSwitcher'

/**
 * OpenLayers 3 Layer Switcher Control.
 * @require jQuery
 *
 * @constructor
 * @extends {ol_control_LayerSwitcher}
 * @param {Object=} options Control options.
 */
ol_control_LayerPopup = function(options)
{	options = options || {};
	options.switcherClass="ol-layerswitcher-popup";
	if (options.mouseover!==false) options.mouseover=true;
	ol_control_LayerSwitcher.call(this, options);
};
ol.inherits(ol_control_LayerPopup, ol_control_LayerSwitcher);

/** Disable overflow
*/
ol_control_LayerPopup.prototype.overflow = function(){};

/** Render a list of layer
 * @param {elt} element to render
 * @layers {Array{ol.layer}} list of layer to show
 * @api stable
 */
ol_control_LayerPopup.prototype.drawList = function(ul, layers)
{	var self=this;
	
	var setVisibility = function(e) 
	{	e.preventDefault(); 
		var l = $(this).data("layer");
		self.switchLayerVisibility(l,layers);
	};

	layers.forEach(function(layer)
	{	if (this.displayInLayerSwitcher(layer)) 
		{	var d = $("<li>").text(layer.get("title") || layer.get("name"))
					.data ('layer', layer)
					.click (setVisibility)
					.on ("touchstart", setVisibility)
					.appendTo(ul);
			if (self.testLayerVisibility(layer)) d.addClass("ol-layer-hidden");
			if (layer.getVisible()) d.addClass("select");
		}
	});
};

export default ol_control_LayerPopup
