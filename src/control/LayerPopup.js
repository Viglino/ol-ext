/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_control_LayerSwitcher from './LayerSwitcher.js'
import ol_ext_element from '../util/element.js';

/**
 * OpenLayers Layer Switcher Control.
 *
 * @constructor
 * @extends {ol_control_LayerSwitcher}
 * @param {Object=} options Control options.
 */
var ol_control_LayerPopup = class olcontrolLayerPopup extends ol_control_LayerSwitcher {
	constructor(options) {
		options = options || {};
		options.switcherClass = 'ol-layerswitcher-popup' + (options.switcherClass ? ' ' + options.switcherClass : '');
		if (options.mouseover !== false) options.mouseover = true;
		super(options);
	}
	/** Disable overflow
	*/
	overflow() { }
	/** Render a list of layer
	 * @param {elt} element to render
	 * @layers {Array{ol.layer}} list of layer to show
	 * @api stable
	 */
	drawList(ul, layers) {
		var self = this;

		var setVisibility = function (e) {
			e.preventDefault();
			var l = self._getLayerForLI(this);
			self.switchLayerVisibility(l, layers);
			if (e.type === 'touchstart')
				self.element.classList.add('ol-collapsed');
		};

		layers.forEach(function (layer) {
			if (self.displayInLayerSwitcher(layer)) {
				var d = ol_ext_element.create('LI', {
					html: layer.get('title') || layer.get('name'),
					on: { 'click touchstart': setVisibility },
					parent: ul
				});
				self._setLayerForLI(d, layer);

				if (self.testLayerVisibility(layer))
					d.classList.add('ol-layer-hidden');
				if (layer.getVisible())
					d.classList.add('ol-visible');
			}
		});
	}
}

export default ol_control_LayerPopup
