import {ol_ext_inherits} from '../util/ext'
import ol_control_WMSCapabilities from './WMSCapabilities';

import ol_View from 'ol/View'
import ol_tilegrid_WMTS from 'ol/tilegrid/WMTS'
import ol_format_WMTSCapabilities from 'ol/format/WMTSCapabilities'
import ol_layer_Tile from 'ol/layer/Tile'
import ol_source_WMTS from 'ol/source/WMTS'
import { get as ol_proj_get } from 'ol/proj'
import { transformExtent as ol_proj_transformExtent } from 'ol/proj'
import { getWidth as ol_extent_getWidth } from 'ol/extent'

/** WMTSCapabilities
 * @constructor
 * @fires load
 * @fires capabilities
 * @extends {ol_control_WMSCapabilities}
 * @param {*} options
 *  @param {string|Element} options.target the target to set the dialog, use document.body to have fullwindow dialog
 *  @param {string} options.proxy proxy to use when requesting Getcapabilites, default none (suppose the service use CORS)
 *  @param {string} options.placeholder input placeholder, default 'service url...'
 *  @param {string} options.title dialog title, default 'WMS'
 *  @param {string} options.searchLabel Label for search button, default 'search'
 *  @param {string} options.loadLabel Label for load button, default 'load'
 *  @param {boolean} options.popupLayer Use a popup for the layers, default false
 *  @param {*} options.services a key/url object of services for quick access in a menu
 *  @param {Array<string>} options.srs an array of supported srs, default map projection code or 'EPSG:3857'
 *  @param {number} options.timeout Timeout for getCapabilities request, default 1000
 *  @param {boolean} options.cors Use CORS, default false
 *  @param {boolean} options.trace Log layer info, default false
 */
var ol_control_WMTSCapabilities = function (options) {
  options = options || {};
  options.title = options.title || 'WMTS';

  ol_control_WMSCapabilities.call(this, options);

  this.getDialog().element.classList.add('ol-wmtscapabilities');
};
ol_ext_inherits(ol_control_WMTSCapabilities, ol_control_WMSCapabilities);

/** Get service parser
 */
 ol_control_WMTSCapabilities.prototype._getParser = function() {
  var pars = new ol_format_WMTSCapabilities();
  return {
    read: function(data) {
      var resp = pars.read(data);
      resp.Capability = {
        Layer: resp.Contents,
      }
      // Generic attribution for layers
      resp.Capability.Layer.Attribution = {
        Title: resp.ServiceProvider.ProviderName
      }
      // Remove non image format
      var layers = [];
      resp.Contents.Layer.forEach(function(l) {
        if (l.Format && /jpeg|png/.test(l.Format[0])) {
          layers.push(l);
        }
      })
      resp.Contents.Layer = layers;
      return resp;
    }
  }
};

/** Get Capabilities request parameters
 * @param {*} options
 */
 ol_control_WMTSCapabilities.prototype.getRequestParam = function(options) {
  return {
    SERVICE: 'WMTS',
    REQUEST: 'GetCapabilities',
    VERSION: options.version || '1.0.0'
  }
};

/** Return a WMTS options for the given capabilities
 * @param {*} caps layer capabilities (read from the capabilities)
 * @param {*} parent capabilities
 * @return {*} options
 */
ol_control_WMTSCapabilities.prototype.getOptionsFromCap = function(caps, parent) {
  var bbox = caps.WGS84BoundingBox;
  if (bbox) bbox = ol_proj_transformExtent(bbox, 'EPSG:4326', this.getMap().getView().getProjection());

  // Tilematrix zoom
  var minZoom = Infinity, maxZoom = -Infinity;
  caps.TileMatrixSetLink[0].TileMatrixSetLimits.forEach(function(tm) {
    minZoom = Math.min(minZoom, parseInt(tm.TileMatrix));
    maxZoom = Math.max(maxZoom, parseInt(tm.TileMatrix));
  });

  // Tilematrix
  var matrixIds = new Array();
  var resolutions = new Array();
  var size = ol_extent_getWidth(ol_proj_get('EPSG:3857').getExtent()) / 256;
  for (var z=0; z <= (maxZoom ? maxZoom : 20) ; z++) {
    matrixIds[z] = z ; 
    resolutions[z] = size / Math.pow(2, z);
  }
  var tg = {
    origin: [-20037508, 20037508],
    resolutions: resolutions,
    matrixIds: matrixIds,
    minZoom: (minZoom ? minZoom : 0)
  }

  var view = new ol_View();
  view.setZoom(minZoom);
  var layer_opt = {
    title: caps.Title,
    extent: bbox,
    abstract: caps.Abstract,
    maxResolution: view.getResolution()
  };

  var source_opt = {
    url: parent.OperationsMetadata.GetTile.DCP.HTTP.Get[0].href,
    layer: caps.Identifier,
    matrixSet: 'PM',
    format: caps.Format[0] || 'image/jpeg',
    projection: 'EPSG:3857',
    tileGrid: tg,
    style: caps.Style ? caps.Style[0].Identifier : 'normal',
    attributions: caps.Attribution.Title,
    crossOrigin: this.get('cors') ? 'anonymous' : null,
    wrapX: (this.get('wrapX') !== false),
  };

  // Fill form
  this._fillForm({
    title: layer_opt.title,
    layers: source_opt.layer,
    format: source_opt.format,
    minZoom: minZoom,
    maxZoom: maxZoom,
    extent: bbox ? bbox.join(',') : '',
    projection: source_opt.projection,
    attribution: source_opt.attributions || '',
    version: '1.0.0'
  });
  
  // Trace
  if (this.get('trace')) {
    var tso = JSON.stringify([ source_opt ], null, "\t").replace(/\\"/g,'"');
    layer_opt.source = "SOURCE";
    layer_opt.source.tileGrid = "new ol_tilegrid_WMTS("+layer_opt.source.tileGrid+")";
    var t = "new ol.layer.Tile (" +JSON.stringify(layer_opt, null, "\t")+ ")" 
    t = t.replace(/\\"/g,'"')
      .replace('"SOURCE"', "new ol.source.WMTS("+tso+")")
      .replace(/\\t/g,"\t").replace(/\\n/g,"\n")
      .replace(/"tileGrid": {/g, '"tileGrid": new ol.tilegrid.WMTS({')
      .replace(/},\n(\t*)"style"/g, '}),\n$1"style"')
      .replace("([\n\t","(")
      .replace("}\n])","})");
    console.log(t);
    delete layer_opt.source;
  }
  
  return ({ 
    layer: layer_opt, 
    source: source_opt,
    data: {
      title: caps.Title,
      abstract: caps.Abstract,
      legend: caps.Style ? caps.Style[0].LegendURL[0].href : undefined,
    } 
  });
};

/** Create a new layer using options received by getOptionsFromCap method
 * @param {*} options
 */
ol_control_WMTSCapabilities.prototype.getLayerFromOptions = function (options) {
  var tg = options.source.tileGrid;
  options.source.tileGrid = new ol_tilegrid_WMTS(tg);
  options.layer.source = new ol_source_WMTS(options.source);
  var layer = new ol_layer_Tile(options.layer);
  // Restore options
  delete options.layer.source;
  options.source.tileGrid = tg;
  return layer;
};

export default ol_control_WMTSCapabilities
