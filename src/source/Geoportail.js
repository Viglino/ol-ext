/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_source_WMTS from 'ol/source/WMTS.js'
import {getWidth as ol_extent_getWidth} from 'ol/extent.js'
import ol_tilegrid_WMTS from 'ol/tilegrid/WMTS.js'
import {get as ol_proj_get} from 'ol/proj.js' 
import ol_ext_Ajax from '../util/Ajax.js'

/** IGN's Geoportail WMTS source
 * @constructor
 * @extends {ol.source.WMTS}
 * @param {olx.source.Geoportail=} options WMTS options 
 *  @param {string=} options.layer Geoportail layer name
 *  @param {number} options.minZoom
 *  @param {number} options.maxZoom
 *  @param {string} options.server
 *  @param {string} options.gppKey api key, default 'choisirgeoportail'
 *  @param {string} options.authentication basic authentication associated with the gppKey as btoa("login:pwd")
 *  @param {string} options.format image format, default 'image/jpeg'
 *  @param {string} options.style layer style, default 'normal'
 *  @param {string} options.crossOrigin default 'anonymous'
 *  @param {string} options.wrapX default true
 */
var ol_source_Geoportail = class olsourceGeoportail extends ol_source_WMTS {
  constructor(layer, options) {
    options = options || {}
    if (layer.layer) {
      options = layer
      layer = options.layer
    }

    var matrixIds = new Array()
    var resolutions = new Array() //[156543.03392804103,78271.5169640205,39135.75848201024,19567.879241005125,9783.939620502562,4891.969810251281,2445.9849051256406,1222.9924525628203,611.4962262814101,305.74811314070485,152.87405657035254,76.43702828517625,38.218514142588134,19.109257071294063,9.554628535647034,4.777314267823517,2.3886571339117584,1.1943285669558792,0.5971642834779396,0.29858214173896974,0.14929107086948493,0.07464553543474241];
    var size = ol_extent_getWidth(ol_proj_get('EPSG:3857').getExtent()) / 256
    for (var z = 0; z <= (options.maxZoom ? options.maxZoom : 20); z++) {
      matrixIds[z] = z
      resolutions[z] = size / Math.pow(2, z)
    }
    var tg = new ol_tilegrid_WMTS({
      origin: [-20037508, 20037508],
      resolutions: resolutions,
      matrixIds: matrixIds
    })
    tg.minZoom = (options.minZoom ? options.minZoom : 0)
    var attr = [ ol_source_Geoportail.defaultAttribution ]
    if (options.attributions) attr = options.attributions
    var server = options.server || 'https://wxs.ign.fr/geoportail/wmts'
    var gppKey = options.gppKey || options.key || 'choisirgeoportail'

    var wmts_options = {
      url: ol_source_Geoportail.getServiceURL(server, gppKey),
      layer: layer,
      matrixSet: 'PM',
      format: options.format ? options.format : 'image/jpeg',
      projection: 'EPSG:3857',
      tileGrid: tg,
      style: options.style ? options.style : 'normal',
      attributions: attr,
      crossOrigin: (typeof options.crossOrigin == 'undefined') ? 'anonymous' : options.crossOrigin,
      wrapX: !(options.wrapX === false)
    }

    super(wmts_options)
    this._server = server
    this._gppKey = gppKey
    // Load url using basic authentification
    if (options.authentication) {
      this.setTileLoadFunction(ol_source_Geoportail.tileLoadFunctionWithAuthentication(options.authentication, this.getFormat()))
    }
  }
  /** Get a tile load function to load tiles with basic authentication
   * @param {string} authentication as btoa("login:pwd")
   * @param {string} format mime type
   * @return {function} tile load function to load tiles with basic authentication
   */
  static tileLoadFunctionWithAuthentication(authentication, format) {
    if (!authentication)
      return undefined
    return function (tile, src) {
      var xhr = new XMLHttpRequest()
      xhr.open("GET", src)
      xhr.setRequestHeader("Authorization", "Basic " + authentication)
      xhr.responseType = "arraybuffer"
      xhr.onload = function () {
        var arrayBufferView = new Uint8Array(this.response)
        var blob = new Blob([arrayBufferView], { type: format })
        var urlCreator = window.URL || window.webkitURL
        var imageUrl = urlCreator.createObjectURL(blob)
        tile.getImage().src = imageUrl
      }
      xhr.onerror = function () {
        tile.getImage().src = ""
      }
      xhr.send()
    }
  }
  /** Get service URL according to server url or standard url
   */
  serviceURL() {
    return ol_source_Geoportail.getServiceURL(this._server, this._gppKey)
  }
  /**
   * Return the associated API key of the Map.
   * @function
   * @return the API key.
   * @api stable
   */
  getGPPKey() {
    return this._gppKey
  }
  /**
   * Set the associated API key to the Map.
   * @param {String} key the API key.
   * @param {String} authentication as btoa("login:pwd")
   * @api stable
   */
  setGPPKey(key, authentication) {
    this._gppKey = key
    var serviceURL = this.serviceURL()
    this.setTileUrlFunction(function () {
      var url = ol_source_Geoportail.prototype.getTileUrlFunction().apply(this, arguments)
      if (url) {
        var args = url.split("?")
        return serviceURL + "?" + args[1]
      }
      else
        return url
    })
    // Load url using basic authentification
    if (authentication) {
      this.setTileLoadFunction(ol_source_Geoportail.tileLoadFunctionWithAuthentication(authentication, this.getFormat()))
    }
  }
  /** Return the GetFeatureInfo URL for the passed coordinate, resolution, and
   * projection. Return `undefined` if the GetFeatureInfo URL cannot be
   * constructed.
   * @param {ol.Coordinate} coord
   * @param {Number} resolution
   * @param {ol.proj.Projection} projection default the source projection
   * @param {Object} options
   *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
   * @return {String|undefined} GetFeatureInfo URL.
   */
  getFeatureInfoUrl(coord, resolution, projection, options) {
    options = options || {}
    if (!projection)
      projection = this.getProjection()
    var tileCoord = this.tileGrid.getTileCoordForCoordAndResolution(coord, resolution)
    var ratio = 1
    var url = this.getTileUrlFunction()(tileCoord, ratio, projection)
    if (!url)
      return url

    var tileResolution = this.tileGrid.getResolution(tileCoord[0])
    var tileExtent = this.tileGrid.getTileCoordExtent(tileCoord)
    var i = Math.floor((coord[0] - tileExtent[0]) / (tileResolution / ratio))
    var j = Math.floor((tileExtent[3] - coord[1]) / (tileResolution / ratio))

    return url.replace(/Request=GetTile/i, 'Request=getFeatureInfo')
      + '&INFOFORMAT=' + (options.INFO_FORMAT || 'text/plain')
      + '&I=' + i
      + '&J=' + j
  }
  /** Get feature info
   * @param {ol.Coordinate} coord
   * @param {Number} resolution
   * @param {ol.proj.Projection} projection default the source projection
   * @param {Object} options
   *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
   *  @param {function} options.callback a function that take the response as parameter
   *  @param {function} options.error function called when an error occurred
   */
  getFeatureInfo(coord, resolution, options) {
    var url = this.getFeatureInfoUrl(coord, resolution, null, options)
    ol_ext_Ajax.get({
      url: url,
      dataType: options.format || 'text/plain',
      options: {
        encode: false
      },
      success: function (resp) {
        if (options.callback)
          options.callback(resp)
      },
      error: options.error || function () { }
    })
  }
}

/** Standard IGN-GEOPORTAIL attribution 
 */
ol_source_Geoportail.defaultAttribution = '<a href="http://www.geoportail.gouv.fr/">Géoportail</a> &copy; <a href="http://www.ign.fr/">IGN-France</a>';

/** Get service URL according to server url or standard url
 */
ol_source_Geoportail.getServiceURL = function(server, gppKey) {
  if (server) {
    return server.replace(/^(https?:\/\/[^/]*)(.*)$/, "$1/" + gppKey + "$2")
  } else {
    return (window.geoportailConfig ? window.geoportailConfig.url : "https://wxs.ign.fr/") + gppKey + "/geoportail/wmts"
  }
}

export default ol_source_Geoportail
