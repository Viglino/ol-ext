/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_source_WMTS from 'ol/source/WMTS'
import {ol_ext_inherits} from '../util/ext'
import {getWidth as ol_extent_getWidth} from 'ol/extent'
import ol_tilegrid_WMTS from 'ol/tilegrid/WMTS'
import {get as ol_proj_get} from 'ol/proj' 

/** IGN's Geoportail WMTS source
 * @constructor
 * @extends {ol.source.WMTS}
 * @param {String=} layer Layer name.
 * @param {olx.source.OSMOptions=} options WMTS options 
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
var ol_source_Geoportail = function (layer, options) {
  options = options || {};
  
  var matrixIds = new Array();
	var resolutions = new Array();//[156543.03392804103,78271.5169640205,39135.75848201024,19567.879241005125,9783.939620502562,4891.969810251281,2445.9849051256406,1222.9924525628203,611.4962262814101,305.74811314070485,152.87405657035254,76.43702828517625,38.218514142588134,19.109257071294063,9.554628535647034,4.777314267823517,2.3886571339117584,1.1943285669558792,0.5971642834779396,0.29858214173896974,0.14929107086948493,0.07464553543474241];
	var size = ol_extent_getWidth(ol_proj_get('EPSG:3857').getExtent()) / 256;
	for (var z=0; z <= (options.maxZoom ? options.maxZoom : 20) ; z++) {
    matrixIds[z] = z ; 
		resolutions[z] = size / Math.pow(2, z);
	}
	var tg = new ol_tilegrid_WMTS ({
    origin: [-20037508, 20037508],
    resolutions: resolutions,
    matrixIds: matrixIds
  });
	tg.minZoom = (options.minZoom ? options.minZoom : 0);
	var attr = [ ol_source_Geoportail.prototype.attribution ];
	if (options.attributions) attr = options.attributions;

	this._server = options.server;
	this._gppKey = options.gppKey || 'choisirgeoportail';

	var wmts_options = {
    url: this.serviceURL(),
		layer: layer,
		matrixSet: 'PM',
		format: options.format ? options.format : 'image/jpeg',
		projection: 'EPSG:3857',
		tileGrid: tg,
		style: options.style ? options.style : 'normal',
		attributions: attr,
		crossOrigin: (typeof options.crossOrigin == 'undefined') ? 'anonymous' : options.crossOrigin,
		wrapX: !(options.wrapX===false)
	};

  ol_source_WMTS.call(this, wmts_options);

	// Load url using basic authentification
	if (options.authentication) {
		this.setTileLoadFunction(ol_source_Geoportail.tileLoadFunctionWithAuthentication(options.authentication, this.getFormat()));
	}

};
ol_ext_inherits(ol_source_Geoportail, ol_source_WMTS);

/** Standard IGN-GEOPORTAIL attribution 
*/
ol_source_Geoportail.prototype.attribution = '<a href="http://www.geoportail.gouv.fr/">Géoportail</a> &copy; <a href="http://www.ign.fr/">IGN-France</a>';

/** Get service URL according to server url or standard url
*/
ol_source_Geoportail.prototype.serviceURL = function() {
  if (this._server) {
    return this._server.replace (/^(https?:\/\/[^/]*)(.*)$/, "$1/"+this._gppKey+"$2") ;
	} else {
    return (window.geoportailConfig ? window.geoportailConfig.url : "https://wxs.ign.fr/") +this._gppKey+ "/geoportail/wmts" ;
  }
};

/**
 * Return the associated API key of the Map.
 * @function
 * @return the API key.
 * @api stable
 */
ol_source_Geoportail.prototype.getGPPKey = function() {
  return this._gppKey;
};

/**
 * Set the associated API key to the Map.
 * @param {String} key the API key.
 * @param {String} authentication as btoa("login:pwd")
 * @api stable
 */
ol_source_Geoportail.prototype.setGPPKey = function(key, authentication) {
  this._gppKey = key;
	var serviceURL = this.serviceURL();
	this.setTileUrlFunction (function() {
    var url = ol_source_Geoportail.prototype.getTileUrlFunction().apply(this, arguments);
		if (url) {
      var args = url.split("?");
			return serviceURL+"?"+args[1];
		}
		else return url;
	});
	// Load url using basic authentification
	if (authentication) {
		this.setTileLoadFunction(ol_source_Geoportail.tileLoadFunctionWithAuthentication(authentication, this.getFormat()));
	}
};

/** Get a tile load function to load tiles with basic authentication
 * @param {string} authentication as btoa("login:pwd")
 * @param {string} format mime type
 * @return {function} tile load function to load tiles with basic authentication
 */
ol_source_Geoportail.tileLoadFunctionWithAuthentication = function(authentication, format) {
	if (!authentication) return undefined;
	return function(tile, src) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", src);
		xhr.setRequestHeader("Authorization", "Basic " + authentication);
		xhr.responseType = "arraybuffer";
		xhr.onload = function () {
			var arrayBufferView = new Uint8Array(this.response);
			var blob = new Blob([arrayBufferView], { type: format });
			var urlCreator = window.URL || window.webkitURL;
			var imageUrl = urlCreator.createObjectURL(blob);
			tile.getImage().src = imageUrl;
		};
		xhr.onerror = function () {
			tile.getImage().src = "";
		};
		xhr.send();
	};
};

export default ol_source_Geoportail
