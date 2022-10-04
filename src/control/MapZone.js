/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_control_Control from 'ol/control/Control.js'
import {getCenter as ol_extent_getCenter} from 'ol/extent.js'
import ol_Map from 'ol/Map.js'
import ol_View from 'ol/View.js'
import {transformExtent as ol_proj_transformExtent} from 'ol/proj.js'
import ol_ext_element from 'ol-ext/util/element.js'

/** A control to jump from one zone to another.
 * @constructor
 * @fires select
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *	@param {string} options.className class name
 *  @param {Array<any>} options.zone an array of zone: { name, extent (in EPSG:4326) }
 *	@param {ol.layer.Layer|function} options.layer layer to display in the control or a function that takes a zone and returns a layer to add to the control
 *	@param {ol.ProjectionLike} options.projection projection of the control, Default is EPSG:3857 (Spherical Mercator).
 *  @param {bolean} options.centerOnClick center on click when a zone is clicked (or listen to 'select' event to do something), default true
 */
var ol_control_MapZone = class olcontrolMapZone extends ol_control_Control {
  constructor(options) {
    options = options || {}

    var element = element = ol_ext_element.create('DIV', {
      className: options.className || 'ol-mapzone'
    })
    super({
      element: element,
      target: options.target
    })

    if (!options.target) {
      ['ol-unselectable', 'ol-control', 'ol-collapsed'].forEach(function(c) {
        element.classList.add(c)
      })
      var bt = ol_ext_element.create('BUTTON', {
        type: 'button',
        on: {
          'click': function () {
            element.classList.toggle("ol-collapsed")
            maps.forEach(function (m) {
              m.updateSize()
            })
          }.bind(this)
        },
        parent: element
      })
      ol_ext_element.create('I', {
        parent: bt
      })
    }

    this.set('centerOnClick', options.centerOnClick)

    // Create maps
    var maps = this._maps = []
    this._projection = options.projection
    this._layer = options.layer
    options.zones.forEach(this.addZone.bind(this))

    // Refresh the maps
    setTimeout(function () {
      maps.forEach(function (m) {
        m.updateSize()
      })
    })
  }
  /** Collapse the control
   * @param {boolean} b
   */
  setCollapsed(b) {
    if (b) {
      this.element.classList.remove('ol-collapsed')
      // Force map rendering
      this.getMaps().forEach(function (m) {
        m.updateSize()
      })
    } else {
      this.element.classList.add('ol-collapsed')
    }
  }
  /** Show the control
   * @param {boolean} b
   */
  setVisible(b) {
    this.setCollapsed(!b);
  }
  /** Get control collapsed
   * @return {boolean}
   */
  getCollapsed() {
    return this.element.classList.contains('ol-collapsed')
  }
  /** Get associated maps
   * @return {ol.Map}
   */
  getMaps() {
    return this._maps
  }
  /** Get nb zone */
  getLength() {
    return this._maps.length
  }
  /** Add a new zone to the control
   * @param {Object} z
   *  @param {string} title
   *  @param {ol.extent} extent if map is not defined
   *  @param {ol.Map} map if map is defined use the map extent
   *  @param {ol.layer.Layer} [layer] layer of the zone, default use default control layer
   */
  addZone(z) {
    var view = new ol_View({ zoom: 6, center: [0, 0], projection: this._projection })
    var extent
    if (z.map) {
      extent = ol_proj_transformExtent(z.map.getView().calculateExtent(), z.map.getView().getProjection(), view.getProjection())
    } else {
      extent = ol_proj_transformExtent(z.extent, 'EPSG:4326', view.getProjection())
    }
    // console.log(extent, z.extent)
    var div = ol_ext_element.create('DIV', {
      className: 'ol-mapzonezone',
      parent: this.element,
      click: function () {
        // Get index
        var index = -1
        this._maps.forEach(function (m, i) {
          if (m.get('zone') === z) {
            index = i
          }
        })
        this.dispatchEvent({
          type: 'select',
          zone: z,
          index: index,
          coordinate: ol_extent_getCenter(extent),
          extent: extent
        })
        if (this.get('centerOnClick') !== false) {
          this.getMap().getView().fit(extent)
        }
        this.setVisible(false)
      }.bind(this)
    })
    var layer
    if (z.layer) {
      layer = z.layer
    } else if (typeof (this._layer) === 'function') {
      layer = this._layer(z)
    } else {
      // Try to clone the layer
      layer = new this._layer.constructor({
        source: this._layer.getSource()
      })
    }
    var map = new ol_Map({
      target: div,
      view: view,
      controls: [],
      interactions: [],
      layers: [layer]
    })
    map.set('zone', z)
    this._maps.push(map)
    view.fit(extent)
    // Name
    ol_ext_element.create('P', {
      html: z.title,
      parent: div
    })
  }
  /** Remove a zone from the control
   * @param {number} index
   */
  removeZone(index) {
    var z = this.element.querySelectorAll('.ol-mapzonezone')[index]
    if (z) {
      z.remove()
      this._maps.splice(index, 1)
    }
  }
}

/** Pre-defined zones */
ol_control_MapZone.zones = {};
  
/** French overseas departments  */
ol_control_MapZone.zones.DOM = [{
  "title": "Guadeloupe",
  "extent": [ -61.898594315312444, 15.75623038647845, -60.957887532935324, 16.575317670979473 ]
},{
  "title": "Guyane",
  "extent": [ -54.72525931072715, 2.1603763430019, -51.528236062921344, 5.7984307809552575 ]
},{
  "title": "Martinique",
  "extent": [ -61.257556528564756, 14.387506317407514, -60.76934912110432, 14.895067461729951 ]
},{
  "title": "Mayotte",
  "extent": [ 44.959844536967815, -13.01674138212816, 45.35328866510648, -12.65521942207829 ]
},{
  "title": "La réunion",
  "extent": [ 55.17059012967656, -21.407680069231688, 55.88195702001797, -20.85560221637526 ]
}];

/** French overseas territories */
ol_control_MapZone.zones.TOM = [{
  "title": "Polynésie Française",
  "extent": [ 206.23664226630862, -22.189040615809787, 221.85920743981987, -10.835039595040698 ]
},{
  "title": "Nouvelle Calédonie",
  "extent": [ 163.76420580160925, -22.581641092751838, 167.66984709498706, -19.816411635668445 ]
},{
  "title": "St-Pierre et Miquelon",
  "extent": [ -56.453698765748676, 46.74449858188555, -56.0980198121544, 47.14669874229787 ]
},{
  "title": "Wallis et Futuna",
  "extent": [ 181.7588623143665, -14.7341169873267, 183.95612353301715, -13.134720799175085 ]
},{
  "title": "St-Martin St-Barthélemy",
  "extent": [ -63.1726389501678, 17.806097291313506, -62.7606535945649, 18.13267688837938 ]
}];

/** French overseas departments and territories */
ol_control_MapZone.zones.DOMTOM = [{
  title: 'Métropole',
  extent: [ -5.318421740712579, 41.16082274292913, 9.73284186155716, 51.21957336557702 ]
}].concat(ol_control_MapZone.zones.DOM, ol_control_MapZone.zones.TOM);

export default ol_control_MapZone
