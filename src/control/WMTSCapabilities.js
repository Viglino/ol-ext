import ol_control_WMSCapabilities from './WMSCapabilities.js';

import ol_View from 'ol/View.js'
import ol_tilegrid_WMTS from 'ol/tilegrid/WMTS.js'
import ol_format_WMTSCapabilities from 'ol/format/WMTSCapabilities.js'
import ol_layer_Tile from 'ol/layer/Tile.js'
import ol_source_WMTS from 'ol/source/WMTS.js'
import { get as ol_proj_get } from 'ol/proj.js'
import { transformExtent as ol_proj_transformExtent } from 'ol/proj.js'
import { getWidth as ol_extent_getWidth } from 'ol/extent.js'

/** WMTSCapabilities
 * @constructor
 * @fires load
 * @fires capabilities
 * @extends {ol_control_WMSCapabilities}
 * @param {*} options
 *  @param {string|Element} [options.target] the target to set the dialog, use document.body to have fullwindow dialog
 *  @param {string} [options.proxy] proxy to use when requesting Getcapabilites, default none (suppose the service use CORS)
 *  @param {string} [options.placeholder='service url...'] input placeholder, default 'service url...'
 *  @param {string} [options.title=WMTS] dialog title, default 'WMTS'
 *  @param {string} [options.searchLabel='search'] Label for search button, default 'search'
 *  @param {string} [options.loadLabel='load'] Label for load button, default 'load'
 *  @param {Array<string>} [options.srs] an array of supported srs, default map projection code or 'EPSG:3857'
 *  @param {number} [options.timeout=1000] Timeout for getCapabilities request, default 1000
 *  @param {boolean} [options.cors=false] Use CORS, default false
 *  @param {string} [options.optional] a list of optional url properties (when set in the request url), separated with ','
 *  @param {boolean} [options.trace=false] Log layer info, default false
 *  @param {*} [options.services] a key/url object of services for quick access in a menu
 */
var ol_control_WMTSCapabilities = class olcontrolWMTSCapabilities extends ol_control_WMSCapabilities {
  constructor(options) {
    options = options || {};
    options.title = options.title || 'WMTS';

    super(options);

    this.getDialog().element.classList.add('ol-wmtscapabilities');
  }
  /** Get service parser
   * @private
   */
  _getParser() {
    var pars = new ol_format_WMTSCapabilities();
    return {
      read: function (data) {
        var resp = pars.read(data);
        resp.Capability = {
          Layer: resp.Contents,
        };
        // Generic attribution for layers
        resp.Capability.Layer.Attribution = {
          Title: resp.ServiceProvider.ProviderName
        };
        // Remove non image format
        var layers = [];
        resp.Contents.Layer.forEach(function (l) {
          if (l.Format && /jpeg|png/.test(l.Format[0])) {
            layers.push(l);
          }
        });
        resp.Contents.Layer = layers;
        return resp;
      }.bind(this)
    };
  }
  /** Get Capabilities request parameters
   * @param {*} options
   */
  getRequestParam(options) {
    return {
      SERVICE: 'WMTS',
      REQUEST: 'GetCapabilities',
      VERSION: options.version || '1.0.0'
    };
  }
  /** Get tile grid options only for EPSG:3857 projection
   * @returns {*}
   * @private
   */
  _getTG(tileMatrixSet, minZoom, maxZoom, tilePrefix) {
    var matrixIds = new Array();
    var resolutions = new Array();
    var size = ol_extent_getWidth(ol_proj_get('EPSG:3857').getExtent()) / 256;
    for (var z = 0; z <= (maxZoom ? maxZoom : 20); z++) {
      var id = tilePrefix ? tileMatrixSet + ':' + z : z;
      matrixIds[z] = id;
      resolutions[z] = size / Math.pow(2, z);
    }
    return {
      origin: [-20037508, 20037508],
      resolutions: resolutions,
      matrixIds: matrixIds,
      minZoom: (minZoom ? minZoom : 0)
    };
  }
  /** Get WMTS tile grid (only EPSG:3857)
   * @param {sting} tileMatrixSet
   * @param {number} minZoom
   * @param {number} maxZoom
   * @param {boolean} tilePrefix
   * @returns {ol_tilegrid_WMTS}
   * @private
   */
  getTileGrid(tileMatrixSet, minZoom, maxZoom, tilePrefix) {
    return new ol_tilegrid_WMTS(this._getTG(tileMatrixSet, minZoom, maxZoom, tilePrefix));
  }
  /** Check if the TileMatrixSet is supported
   * @param {Object} tm
   * @returns {boolean}
   */
  isSupportedSet(tm) {
    return tm.TileMatrixSet === 'PM' 
    || tm.TileMatrixSet === '3857' 
    || tm.TileMatrixSet === 'EPSG:3857' 
    || tm.TileMatrixSet === 'webmercator'
    || tm.TileMatrixSet === 'GoogleMapsCompatible'
  }
  /** Return a WMTS options for the given capabilities
   * @param {*} caps layer capabilities (read from the capabilities)
   * @param {*} parent capabilities
   * @return {*} options
   */
  getOptionsFromCap(caps, parent) {
    var bbox = caps.WGS84BoundingBox;
    if (bbox) bbox = ol_proj_transformExtent(bbox, 'EPSG:4326', this.getMap().getView().getProjection());

    // Tilematrix zoom
    var minZoom = Infinity, maxZoom = -Infinity;
    var tmatrix;
    caps.TileMatrixSetLink.forEach(function (tm) {
      if (this.isSupportedSet(tm)) {
        tmatrix = tm;
        caps.TileMatrixSet = tm.TileMatrixSet;
      }
    }.bind(this));
    if (!tmatrix) {
      this.showError({ type: 'TileMatrix' });
      return;
    }
    if (tmatrix.TileMatrixSetLimits) {
      var tilePrefix = tmatrix.TileMatrixSetLimits[0].TileMatrix.split(':').length > 1;
      tmatrix.TileMatrixSetLimits.forEach(function (tm) {
        var zoom = tm.TileMatrix.split(':').pop();
        minZoom = Math.min(minZoom, parseInt(zoom));
        maxZoom = Math.max(maxZoom, parseInt(zoom));
      });
    } else {
      minZoom = 0;
      maxZoom = 20;
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
      matrixSet: caps.TileMatrixSet,
      format: caps.Format[0] || 'image/jpeg',
      projection: 'EPSG:3857',
      //tileGrid: tg,
      tilePrefix: tilePrefix,
      minZoom: minZoom,
      maxZoom: maxZoom,
      style: caps.Style ? caps.Style[0].Identifier : 'normal',
      attributions: caps.Attribution.Title,
      crossOrigin: this.get('cors') ? 'anonymous' : null,
      wrapX: (this.get('wrapX') !== false),
    };

    // Fill form
    this._fillForm({
      title: layer_opt.title,
      layers: source_opt.layer,
      style: source_opt.style,
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
      // Source
      source_opt.tileGrid = 'TILEGRID';
      var tso = JSON.stringify([source_opt], null, "\t").replace(/\\"/g, '"');
      tso = tso.replace('"TILEGRID"', 'new ol_tilegrid_WMTS('
        + JSON.stringify(this._getTG(source_opt.matrixSet, source_opt.minZoom, source_opt.maxZoom, source_opt.tilePrefix), null, '\t').replace(/\n/g, '\n\t\t')
        + ')'
      );
      delete source_opt.tileGrid;
      // Layer
      layer_opt.source = "SOURCE";
      var t = "new ol.layer.Tile (" + JSON.stringify(layer_opt, null, "\t") + ")";
      t = t.replace(/\\"/g, '"')
        .replace('"SOURCE"', "new ol.source.WMTS(" + tso + ")")
        .replace(/\\t/g, "\t").replace(/\\n/g, "\n")
        .replace(/"tileGrid": {/g, '"tileGrid": new ol.tilegrid.WMTS({')
        .replace(/},\n(\t*)"style"/g, '}),\n$1"style"')
        .replace("([\n\t", "(")
        .replace("}\n])", "})");
      console.log(t);
      delete layer_opt.source;
    }
    var returnedLegend = undefined;
    if (caps.Style && caps.Style[0] && caps.Style[0].LegendURL && caps.Style[0].LegendURL[0]) {
      returnedLegend = [ caps.Style[0].LegendURL[0].href ];
    }
    return ({
      layer: layer_opt,
      source: source_opt,
      data: {
        title: caps.Title,
        abstract: caps.Abstract,
        legend: returnedLegend,
      }
    });
  }
  /** Get WMS options from control form
   * @return {*} original original options
   * @return {*} options
   * @private
   */
  _getFormOptions() {
    var options = this._currentOptions || {};
    if (!options.layer)
      options.layer = {};
    if (!options.source)
      options.source = {};
    if (!options.data)
      options.data = {};

    var minZoom = parseInt(this._elements.formMinZoom.value) || 0;
    var maxZoom = parseInt(this._elements.formMaxZoom.value) || 20;
    var ext = [];
    if (this._elements.formExtent.value) {
      this._elements.formExtent.value.split(',').forEach(function (b) {
        ext.push(parseFloat(b));
      });
    }
    if (ext.length !== 4)
      ext = undefined;
    var attributions = [];
    if (this._elements.formAttribution.value)
      attributions.push(this._elements.formAttribution.value);

    var view = new ol_View({
      projection: this.getMap().getView().getProjection()
    });
    view.setZoom(minZoom);
    var layer_opt = {
      title: this._elements.formTitle.value,
      extent: ext,
      abstract: options.layer.abstract || '',
      maxResolution: view.getResolution()
    };

    var source_opt = {
      url: this._elements.input.value,
      layer: this._elements.formLayer.value,
      matrixSet: options.source.matrixSet || 'PM',
      format: this._elements.formFormat.options[this._elements.formFormat.selectedIndex].value,
      projection: 'EPSG:3857',
      minZoom: minZoom,
      maxZoom: maxZoom,
      // tileGrid: this._getTG(options.source.matrixSet || 'PM', minZoom, maxZoom),
      style: this._elements.formStyle.value || 'normal',
      attributions: attributions,
      crossOrigin: this._elements.formCrossOrigin.checked ? 'anonymous' : null,
      wrapX: (this.get('wrapX') !== false),
    };

    return ({
      layer: layer_opt,
      source: source_opt,
      data: {
        title: this._elements.formTitle.value,
        abstract: options.data.abstract,
        legend: options.data.legend,
      }
    });
  }
  /** Create a new layer using options received by getOptionsFromCap method
   * @param {*} options
   */
  getLayerFromOptions(options) {
    if (!options)
      return;
    options.source.tileGrid = this.getTileGrid(options.source.matrixSet, options.source.minZoom, options.source.maxZoom, options.source.tilePrefix);
    options.layer.source = new ol_source_WMTS(options.source);
    var layer = new ol_layer_Tile(options.layer);
    // Restore options
    delete options.layer.source;
    delete options.source.tileGrid;
    return layer;
  }
}

export default ol_control_WMTSCapabilities
