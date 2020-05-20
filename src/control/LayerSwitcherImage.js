/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_control_LayerSwitcher from './LayerSwitcher'
import '../layer/GetPreview'
import ol_ext_element from '../util/element';

/**
 * @classdesc OpenLayers Layer Switcher Control.
 * @require layer.getPreview
 *
 * @constructor
 * @extends {ol_control_LayerSwitcher}
 * @param {Object=} options Control options.
 */
var ol_control_LayerSwitcherImage = function(options) {
  options = options || {};
	options.switcherClass = "ol-layerswitcher-image";
	if (options.mouseover!==false) options.mouseover=true;
	ol_control_LayerSwitcher.call(this, options);
};
ol_ext_inherits(ol_control_LayerSwitcherImage, ol_control_LayerSwitcher);

/** Render a list of layer
 * @param {elt} element to render
 * @layers {Array{ol.layer}} list of layer to show
 * @api stable
 */
ol_control_LayerSwitcherImage.prototype.drawList = function(ul, layers) {
  var self = this;
	
	var setVisibility = function(e) {
    e.preventDefault(); 
		var l = self._getLayerForLI(this);
		self.switchLayerVisibility(l,layers);
		if (e.type=="touchstart") self.element.classList.add("ol-collapsed");
	};
	
	ol_ext_element.setStyle(ul, { height: 'auto' });

	layers.forEach(function(layer) {
    if (self.displayInLayerSwitcher(layer)) {
      var preview = layer.getPreview ? layer.getPreview() : ["none"];
      var d = ol_ext_element.create('LI', {
        className: 'ol-imgcontainer' + (layer.getVisible() ? ' ol-visible':''),
        on: { 'touchstart click': setVisibility },
        parent: ul
      });
      self._setLayerForLI(d, layer);
      preview.forEach(function(img){
        ol_ext_element.create('IMG', {
          src: img,
          parent: d
        })
      });
			ol_ext_element.create('p', {
        html: layer.get("title") || layer.get("name"),
        parent: d
      });

			if (self.testLayerVisibility(layer)) d.classList.add('ol-layer-hidden');
		}
	});
};


/** Disable overflow
*/
ol_control_LayerSwitcherImage.prototype.overflow = function(){};

export default ol_control_LayerSwitcherImage
