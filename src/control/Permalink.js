/*	Copyright (c) 2015-2018 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_control_Control from 'ol/control/Control.js'
import {transform as ol_proj_transform} from 'ol/proj.js'
import ol_ext_element from '../util/element.js'
import { toLonLat as ol_geohash_toLonLat } from '../geom/geohash.js'
import { fromLonLat as ol_geohash_fromLonLat } from '../geom/geohash.js'

/**
 * Set an hyperlink that will return the user to the current map view.
 * Just add a `permalink`property to layers to be handled by the control (and added in the url). 
 * The layer's permalink property is used to name the layer in the url.
 * The control must be added after all layer are inserted in the map to take them into acount.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options
 *  @param {boolean} options.urlReplace replace url or not, default true
 *  @param {boolean|string} [options.localStorage=false] save current map view in localStorage, if 'position' only store map position
 *  @param {boolean} options.geohash use geohash instead of lonlat, default false
 *  @param {integer} options.fixed number of digit in coords, default 6
 *  @param {boolean} options.anchor use "#" instead of "?" in href
 *  @param {boolean} options.visible hide the button on the map, default true
 *  @param {boolean} options.hidden hide the button on the map, default false DEPRECATED: use visible instead
 *  @param {function} options.onclick a function called when control is clicked
 */
var ol_control_Permalink = class olcontrolPermalink extends ol_control_Control {
  constructor(opt_options) {
    var options = opt_options || {}

    var element = document.createElement('div')
    super({
      element: element,
      target: options.target
    })
    
    var self = this
    var button = document.createElement('button')
    ol_ext_element.create('I', { parent: button })
    this.replaceState_ = (options.urlReplace !== false)
    this.fixed_ = options.fixed || 6
    this.hash_ = options.anchor ? "#" : "?"
    this._localStorage = options.localStorage
    if (!this._localStorage) {
      try {
        localStorage.removeItem('ol@permalink')
      } catch (e) { console.warn('Failed to access localStorage...')} 
    }

    function linkto() {
      if (typeof (options.onclick) == 'function'){
        options.onclick(self.getLink())
      } else {
        self.setUrlReplace(!self.replaceState_)
      }
    }
    button.addEventListener('click', linkto, false)
    button.addEventListener('touchstart', linkto, false)

    element.className = (options.className || "ol-permalink") + " ol-unselectable ol-control"
    element.appendChild(button)
    if (options.hidden || options.visible === false) ol_ext_element.hide(element)

    this.set('geohash', options.geohash)
    this.set('initial', false)

    this.on('change', this.viewChange_.bind(this))

    // Save search params
    this.search_ = {}
    var init = {}
    var hash = document.location.hash || document.location.search || ''
    //  console.log('hash', hash)
    if (this.replaceState_ && !hash && this._localStorage) {
      try {
        hash = localStorage['ol@permalink']
      } catch (e) { console.warn('Failed to access localStorage...')} 
    }
    if (hash) {
      hash = hash.replace(/(^#|^\?)/, "").split("&")
      for (var i = 0; i < hash.length; i++) {
        var t = hash[i].split("=")
        switch (t[0]) {
          case 'lon':
          case 'lat':
          case 'z':
          case 'r': {
            init[t[0]] = t[1]
            break
          }
          case 'gh': {
            const ghash = t[1].split('-')
            const lonlat = ol_geohash_toLonLat(ghash[0])
            init.lon = lonlat[0]
            init.lat = lonlat[1]
            init.z = ghash[1]
            break
          }
          case 'l': break
          default: this.search_[t[0]] = t[1]
        }
      }
    }
    if (init.hasOwnProperty('lon')) {
      this.set('initial', init)
    }

    // Decode permalink
    if (this.replaceState_) this.setPosition()
  }

  /**
   * Get the initial position passed by the url
   */
  getInitialPosition() {
    return this.get('initial')
  }

  /**
   * Set the map instance the control associated with.
   * @param {ol.Map} map The map instance.
   */
  setMap(map) {
    if (this._listener) {
      ol_Observable_unByKey(this._listener.change)
      ol_Observable_unByKey(this._listener.moveend)
    }
    this._listener = null

    super.setMap.call(this, map)

    // Get change 
    if (map) {
      this._listener = {
        change: map.getLayerGroup().on('change', this.layerChange_.bind(this)),
        moveend: map.on('moveend', this.viewChange_.bind(this))
      }
      this.setPosition()
    }
  }
  /** Get layer given a permalink name (permalink propertie in the layer)
  *	@param {string} the permalink to search for
  *	@param {Array<ol.layer>|undefined} an array of layer to search in
  *	@return {ol.layer|false}
  */
  getLayerByLink(id, layers) {
    if (!layers && this.getMap())
      layers = this.getMap().getLayers().getArray()
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].get('permalink') == id)
        return layers[i]
      // Layer Group
      if (layers[i].getLayers) {
        var li = this.getLayerByLink(id, layers[i].getLayers().getArray())
        if (li)
          return li
      }
    }
    return false
  }
  /** Set coordinates as geohash
   * @param {boolean}
   */
  setGeohash(b) {
    this.set('geohash', b)
    this.setUrlParam()
  }
  /** Set map position according to the current link
   * @param {boolean} [force=false] if true set the position even if urlReplace is disabled
   */
  setPosition(force) {
    var map = this.getMap()
    if (!map)
      return

    var hash = (this.replaceState_ || force) ? document.location.hash || document.location.search : ''
    if (!hash && this._localStorage) {
      try {
        hash = localStorage['ol@permalink']
      } catch (e) { console.warn('Failed to access localStorage...')} 
    }
    if (!hash)
      return

    var i, t, param = {}
    hash = hash.replace(/(^#|^\?)/, "").split("&")
    for (i = 0; i < hash.length; i++) {
      t = hash[i].split("=")
      param[t[0]] = t[1]
    }
    if (param.gh) {
      var ghash = param.gh.split('-')
      var lonlat = ol_geohash_toLonLat(ghash[0])
      param.lon = lonlat[0]
      param.lat = lonlat[1]
      param.z = ghash[1]
    }
    var c = ol_proj_transform([Number(param.lon), Number(param.lat)], 'EPSG:4326', map.getView().getProjection())
    if (c[0] && c[1])
      map.getView().setCenter(c)
    if (param.z)
      map.getView().setZoom(Number(param.z))
    if (param.r)
      map.getView().setRotation(Number(param.r))

    // Reset layers visibility
    function resetLayers(layers) {
      if (!layers)
        layers = map.getLayers().getArray()
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].get('permalink')) {
          layers[i].setVisible(false)
          // console.log("hide "+layers[i].get('permalink'));
        }
        if (layers[i].getLayers) {
          resetLayers(layers[i].getLayers().getArray())
        }
      }
    }

    if (param.l) {
      resetLayers()

      var l = param.l.split("|")
      for (i = 0; i < l.length; i++) {
        t = l[i].split(":")
        var li = this.getLayerByLink(t[0])
        var op = Number(t[1])
        if (li) {
          li.setOpacity(op)
          li.setVisible(true)
        }
      }
    }
  }
  /**
   * Get the parameters added to the url. The object can be changed to add new values.
   * @return {Object} a key value object added to the url as &key=value
   * @api stable
   */
  getUrlParams() {
    return this.search_
  }
  /**
   * Set a parameter to the url.
   * @param {string} key the key parameter
   * @param {string|undefined} value the parameter's value, if undefined or empty string remove the parameter
   * @api stable
   */
  setUrlParam(key, value) {
    if (key) {
      if (value === undefined || value === '')
        delete (this.search_[encodeURIComponent(key)])
      else
        this.search_[encodeURIComponent(key)] = encodeURIComponent(value)
    }
    this.viewChange_()
  }
  /**
   * Get a parameter url.
   * @param {string} key the key parameter
   * @return {string} the parameter's value or empty string if not set
   * @api stable
   */
  getUrlParam(key) {
    return decodeURIComponent(this.search_[encodeURIComponent(key)] || '')
  }
  /**
   * Has a parameter url.
   * @param {string} key the key parameter
   * @return {boolean}
   * @api stable
   */
  hasUrlParam(key) {
    return this.search_.hasOwnProperty(encodeURIComponent(key))
  }
  /** Get the permalink
   * @param {boolean|string} [search=false] false: return full link | true: return the search string only | 'position': return position string
   * @return {permalink}
   */
  getLink(search) {
    var map = this.getMap()
    var c = ol_proj_transform(map.getView().getCenter(), map.getView().getProjection(), 'EPSG:4326')
    var z = Math.round(map.getView().getZoom() * 10) / 10
    var r = map.getView().getRotation()
    var l = this.layerStr_

    // Change anchor
    var anchor = (r ? "&r=" + (Math.round(r * 10000) / 10000) : "") + (l ? "&l=" + l : "")
    if (this.get('geohash')) {
      var ghash = ol_geohash_fromLonLat(c, 8)
      anchor = "gh=" + ghash + '-' + z + anchor
    } else {
      anchor = "lon=" + c[0].toFixed(this.fixed_) + "&lat=" + c[1].toFixed(this.fixed_) + "&z=" + z + anchor
    }

    if (search === 'position')
      return anchor

    // Add other params
    for (var i in this.search_) {
      anchor += "&" + i + (typeof (this.search_[i]) !== 'undefined' ? "=" + this.search_[i] : '')
    }
    if (search)
      return anchor

    //return document.location.origin+document.location.pathname+this.hash_+anchor;
    return document.location.protocol + "//" + document.location.host + document.location.pathname + this.hash_ + anchor
  }
  /** Check if urlreplace is on
   * @return {boolean}
   */
  getUrlReplace() {
    return this.replaceState_
  }
  /** Enable / disable url replacement (replaceSate)
   *	@param {bool}
   */
  setUrlReplace(replace) {
    try {
      this.replaceState_ = replace
      if (!replace) {
        var s = ""
        for (var i in this.search_) {
          s += (s == "" ? "?" : "&") + i + (typeof (this.search_[i]) !== 'undefined' ? "=" + this.search_[i] : '')
        }
        window.history.replaceState(null, null, document.location.origin + document.location.pathname + s)
      }
      else
        window.history.replaceState(null, null, this.getLink())
    } catch (e) { /* ok */ }
    /*
    if (this._localStorage) {
      localStorage['ol@permalink'] = this.getLink(true);
    }
    */
  }
  /**
   * On view change refresh link
   * @param {ol.event} The map instance.
   * @private
   */
  viewChange_() {
    try {
      if (this.replaceState_)
        window.history.replaceState(null, null, this.getLink())
    } catch (e) { /* ok */ }
    if (this._localStorage) {
      try {
        localStorage['ol@permalink'] = this.getLink(this._localStorage)
      } catch (e) { console.warn('Failed to access localStorage...')} 
    }
  }
  /**
   * Layer change refresh link
   * @private
   */
  layerChange_() {
    // Prevent multiple change at the same time
    if (this._tout) {
      clearTimeout(this._tout)
      this._tout = null
    }
    this._tout = setTimeout(function () {
      this._tout = null
      // Get layers
      var l = ""
      function getLayers(layers) {
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].getVisible() && layers[i].get("permalink")) {
            if (l)
              l += "|"
            l += layers[i].get("permalink") + ":" + layers[i].get("opacity")
          }
          // Layer Group
          if (layers[i].getLayers)
            getLayers(layers[i].getLayers().getArray())
        }
      }
      getLayers(this.getMap().getLayers().getArray())
      this.layerStr_ = l

      this.viewChange_()
    }.bind(this), 200)
  }
}

export default ol_control_Permalink
