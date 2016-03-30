/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * OpenLayers 3 Layer Switcher Control.
 * @require jQuery
 *
 * @constructor
 * @extends {ol.control.LayerSwitcher}
 * @param {Object=} opt_options Control options.
 */
ol.control.LayerPopup = function(options) 
{	options = options || {};
	options.switcherClass="ol-layerswitcher-popup";
	if (options.mouseover!==false) options.mouseover=true;
	ol.control.LayerSwitcher.call(this, options);
};
ol.inherits(ol.control.LayerPopup, ol.control.LayerSwitcher);

/** Render a list of layer
 * @param {elt} element to render
 * @layers {Array{ol.layer}} list of layer to show
 * @api stable
 */
ol.control.LayerPopup.prototype.drawList = function(ul, layers)
{	var self=this;
	
	var setVisibility = function(e) 
	{	e.preventDefault(); 
		var l = $(this).data("layer");
		self.switchLayerVisibility(l,layers);
	};

	layers.forEach(function(layer)
	{	if (layer.get("displayInLayerSwitcher")!==false) 
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
