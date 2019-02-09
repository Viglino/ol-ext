/*	Copyright (c) 2019 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

//import {inherits as ol_inherits} from 'ol'
import ol_control_Control from 'ol/control/Control'
import {getCenter as ol_extent_getCenter} from 'ol/extent'

import {ol_ext_inherits} from '../util/ext'

/** A control to jump from one zone to another.
 *
 * @constructor
 * @fires select
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *	@param {string} options.className class name
 *	@param {ol.layer.Layer} options.layer layer to display in the control
 *	@param {ol.ProjectionLike} options.prokjection projection of the control, Default is EPSG:3857 (Spherical Mercator).
 *  @param {Array<any>} options.zone a list of zone: { name, extent }
 *  @param {bolean} options.centerOnClick center on click when click on zones, default true
 */
var ol_control_MapZone = function(options) {
	if (!options) options={};
	
	var element = document.createElement("div");
  if (options.target) {
    element = ol_ext_element.create('DIV', {
      className: options.className || "ol-mapzone"
    });
  } else {
    element = ol_ext_element.create('DIV', {
      className: (options.className || "ol-mapzone") +' ol-unselectable ol-control ol-collapsed'
		});
		var bt = ol_ext_element.create('BUTTON', {
			type: 'button',
			on: {
				'click': function() {
					element.classList.toggle("ol-collapsed");
					maps.forEach(function (m) {
						m.updateSize();
					});
				}.bind(this)
			},
      parent: element
		});
		ol_ext_element.create('I', {
			parent: bt
		});
	}

	// Parent control
	ol_control_Control.call(this, {
		element: element,
		target: options.target
	});
	
	// Create maps
	var maps = [];
	options.zones.forEach(function(z) {
		var div = ol_ext_element.create('DIV', {
			className: 'ol-mapzonezone',
			parent: element,
			click : function() {
				this.dispatchEvent({
					type: 'select',
					coordinate: ol_extent_getCenter(z.extent),
					extent: z.extent
				});
				if (options.centerOnClick !== false) {
					this.getMap().getView().fit(z.extent);
				};
				this.setVisible(false);
			}.bind(this)
		});
		var layer = new options.layer.constructor({
			source: options.layer.getSource()
		});
		var view = new ol.View({ zoom: 6, center: [0,0], projection: options.projection });
		var map = new ol.Map({
			target: div,
			view: view,
			controls: [],
			interactions:[],
			layers: [layer]
		});
		maps.push(map);
		view.fit(z.extent);
		// Nmae
		ol_ext_element.create('P', {
			html: z.title,
			parent: div
		});
	}.bind(this));

	// Refresh the maps
	setTimeout(function() {
		maps.forEach(function (m) {
			m.updateSize();
		});
	});
};
ol_ext_inherits(ol_control_MapZone, ol_control_Control);

/** Set the control visibility
* @param {boolean} b
*/
ol_control_MapZone.prototype.setVisible = function (b) {
	if (b) this.element.classList.remove('ol-collapsed');
	else this.element.classList.add('ol-collapsed');
};

/** Pre-defined zones
 * - French Terrritory
 */
ol_control_MapZone.zones = {
	'DOMTOM': [{
			title: 'Métropole',
			extent: [-592044, 5036092, 1083455, 6660226]
		}, {
			title: 'Guadeloupe',
			extent: [-6890520, 1776510, -6785801, 1871445]
		},{
			title: 'Martinique',
			extent: [-6819160, 1618712, -6764813, 1677110]
		},{
			title: 'Guyane',
			extent: [-6091988, 240549, -5736097, 646583]
		},{
			title: 'La réunion',
			extent: [6141562, -2440557, 6220751, -2374669]
		},{
			title: 'Mayotte',
			extent: [5004907, -1461645, 5048705, -1420369]
		},{
			title: 'Polynésie Française',
			extent:  [22958158, -2534237, 24697254, -1213405]
		},{
			title: 'Nouvelle Calédonie',
			extent:  [18230148, -2581503, 18664922, -2251295]
		},{
			title: 'St-Pierre et Miquelon',
			extent:  [-6284397, 5900469, -6244803, 5966052]
		}]
};

export default ol_control_MapZone
