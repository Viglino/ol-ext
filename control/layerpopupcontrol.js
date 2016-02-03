/**
 * OpenLayers 3 Layer Switcher Control.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
ol.control.LayerPopup = function(options) 
{	options = options || {};
	options.switcherClass="ol-layerswitcher-popup";
	ol.control.LayerSwitcher.call(this, options);
};
ol.inherits(ol.control.LayerPopup, ol.control.LayerSwitcher);

/**
*	Render a list of layer
*/
ol.control.LayerPopup.prototype.drawList = function(ul, layers)
{	var self=this;
	
	var setVisibility = function(e) 
	{	e.preventDefault(); 
		var l = $(this).data("layer");
		self.switchLayerVisibility(l,layers);
	};

	for (var i=0; i<layers.length; i++)
	{	var layer = layers[i];
		if (layer.get("displayInLayerSwitcher")===false) continue;
		var d = $("<li>").text(layer.get("title") || layer.get("name"))
				.data ('layer', layer)
				.click (setVisibility)
				.on ("touchstart", setVisibility)
				.appendTo(ul);
		if (this.testLayerVisibility(layer)) d.addClass("ol-layer-hidden");
		if (layer.getVisible()) d.addClass("select");
	}
};
