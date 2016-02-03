/*
	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (http://www.cecill.info/).
*/
/**
 * @classdesc OpenLayers 3 Layer Switcher Control.
 * @require layer.getPreview
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
ol.control.LayerSwitcherImage = function(options) 
{	options = options || {};
	options.switcherClass="ol-layerswitcher-image";
	ol.control.LayerSwitcher.call(this, options);
};
ol.inherits(ol.control.LayerSwitcherImage, ol.control.LayerSwitcher);

/**
*	Render a list of layer
*/
ol.control.LayerSwitcherImage.prototype.drawList = function(ul, layers)
{	var self = this;
	
	var setVisibility = function(e) 
	{	e.preventDefault(); 
		var l = $(this).data("layer");
		self.switchLayerVisibility(l,layers);
	};
	
	for (var i=0; i<layers.length; i++)
	{	var layer = layers[i];
		if (layer.get("displayInLayerSwitcher")===false) continue;
		var prev = layer.getPreview ? layer.getPreview() : ["none"];
		var d = $("<li>").addClass("ol-imgcontainer")
					.data ('layer', layer)
					.click (setVisibility)
					.on ("touchstart", setVisibility);
		if (layer.getVisible()) d.addClass("select");
		for (var k=0; k<prev.length; k++)
		{	$("<img>").attr('src', prev[k])
					.appendTo(d);
		}
		$("<p>").text(layer.get("title") || layer.get("name")).appendTo(d);

		if (this.testLayerVisibility(layer)) d.addClass("ol-layer-hidden");
		d.appendTo(ul);
	}
};
