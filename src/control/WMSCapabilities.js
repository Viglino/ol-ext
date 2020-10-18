/* 
  WMS Layer with EPSG:4326 projection.
  The tiles will be reprojected to map pojection (EPSG:3857).
  NB: reduce tileSize to minimize deformations on small scales.
*/
import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'
import ol_source_TileWMS from 'ol/source/TileWMS'
import ol_layer_Tile from 'ol/layer/Tile'
import {transformExtent as ol_proj_transformExtent} from 'ol/proj'
import {get as ol_proj_get} from 'ol/proj'
import ol_format_WMSCapabilities from 'ol/format/WMSCapabilities'
import ol_ext_element from '../util/element'
import ol_ext_Ajax from '../util/Ajax'
import '../layer/GetPreview';
import ol_control_Button from './Button'

/** WMSCapabilities
 * @constructor
 * @param {*} options
 *  @param {string} options.proxy proxy to use when requesting Getcapabilites, default none (suppose the service use CORS)
 *  @param {string} options.placeholder input placeholder
 *  @param {string} options.srs the layer SRS code, default map projection code or 'EPSG:3857'
 *  @param {number} options.timeout Timeout for getCapabilities request, default 1000
 *  @param {boolean} options.cors Use CORS, default false
 *  @param {boolean} options.trace Log layer info, default false
 */
var ol_control_WMSCapabilities = function (options) {
  options = Object.assign({}, options || {});
  this._proxy = options.proxy;

  this.createDialog(options);

  if (options.target===document.body) delete options.target;
  if (options.target) {
    options.className = ((options.className||'') + ' ol-wmscapabilities ol-hidden').trim();
    delete options.target;
  } else {
    options.className = ((options.className||'') + ' ol-wmscapabilities').trim();
    options.handleClick = function() {
      this.showError();
      this._dialog.show(this._elements.element);
    }.bind(this);
  }
  console.log('options', options)
  ol_control_Button.call(this, options);

  // WMS options
  this.set('srs', options.srs);
  this.set('cors', options.cors);
  this.set('trace', options.trace);

  // Ajax request
  var parser = new ol_format_WMSCapabilities();
  this._ajax = new ol_ext_Ajax({ dataType:'text', auth: options.authentication });
  this._ajax.on('success', function (e) {
    try {
      var caps = parser.read(e.response);
      this.showCapabilitis(caps)
    } catch (e) {
      this.showError({ type: 'parser', error: e });
    }
  }.bind(this));
  this._ajax.on('error', function(e) {
    this.showError({ type: 'load', error: e });
  }.bind(this));

  // Handle waiting
  this._ajax.on('loadstart', function() {
    this.element.classList.add('ol-searching');
    this.clearForm();
  }.bind(this));
  this._ajax.on('loadend', function() {
    this.element.classList.remove('ol-searching');
  }.bind(this));
};
ol_ext_inherits(ol_control_WMSCapabilities, ol_control_Button);

/** Create dialog
 * @private
 */
ol_control_WMSCapabilities.prototype.createDialog = function (options) {
  var target = options.target;
  if (!target || target===document.body) {
    this._dialog = new ol_control_Dialog({
      className: 'ol-wmscapabilities',
      closeBox: true,
      onSubmit: false,
      target: options.target
    });
    this._dialog.on('button', function(e) {
      if (e.button==='submit') {
        e.inputs.url.value
      }
    })
    target = null;
  }
  var element = ol_ext_element.create('DIV', {
    className: ('ol-wmscapabilities '+(options.className||'')).trim(),
    parent: target
  });
  this._elements = {
    element: element
  };
  var inputdiv = ol_ext_element.create('DIV', {
    parent: element
  });
  var input = this._elements.input = ol_ext_element.create('INPUT', {
    className: 'url',
    placeholder: options.placeholder || 'service url...',
    parent: inputdiv
  });
  ol_ext_element.create('BUTTON', {
    click: function() {
      this.getCapabilities(input.value, options);
    }.bind(this),
    html: options.loadLabel || 'search',
    parent: inputdiv
  });
  // Errors
  this._elements.error = ol_ext_element.create('DIV', {
    className: 'ol-error',
    parent: inputdiv
  });
  // Result div
  var rdiv = this._elements.result = ol_ext_element.create('DIV', {
    className: 'ol-result',
    parent: element
  });
  // Preview
  var preview = ol_ext_element.create('DIV', {
    className: 'ol-preview',
    html: options.previewLabel || 'preview',
    parent: rdiv
  });
  this._elements.preview = ol_ext_element.create('IMG', {
    parent: preview
  });
  // Select list
  this._elements.select = ol_ext_element.create('UL', {
    className: 'ol-select-list',
    parent: rdiv
  });
  // Info data
  this._elements.data = ol_ext_element.create('DIV', {
    className: 'ol-data',
    parent: rdiv
  });
  this._elements.buttons = ol_ext_element.create('DIV', {
    className: 'ol-buttons',
    parent: rdiv
  });
  this._elements.legend = ol_ext_element.create('IMG', {
    className: 'ol-legend',
    parent: rdiv
  });
  return element;
};

/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol_control_WMSCapabilities.prototype.setMap = function (map) {
  ol_control_Button.prototype.setMap.call(this, map);
  if (this._dialog) this._dialog.setMap(map);
  console.log(map)
  if (map && map.getView() && !this.get('srs')) {
    this.set('srs', map.getView().getProjection().getCode());
  }
};

/** Get WMS capabilities for a server
 * @param {string} url service url
 * @param {*} options 
 *  @param {string} options.version WMS version, default 1.3.0
 *  @param {Number} options.timeout
 *  @param {string} options.map WMS map
 * @return {*} PromiseLike to handle response
 */
ol_control_WMSCapabilities.prototype.getCapabilities = function(url, options, success, error) {
  this._elements.input.value = url;
  options = options || {};

  var request = {
    SERVICE: 'WMS',
    REQUEST: 'GetCapabilities',
    VERSION: options.version || '1.3.0'
  }
  if (options.map) request.map = options.map;

  if (this._proxy) {
    var q = '';
    for (var r in request) q += (q?'&':'')+r+'='+request[r];
    this._ajax.send(this._proxy, {
      url: q
    }, {
      timeout: options.timeout || 10000
    });
  } else {
    this._ajax.send(url, request, {
      timeout: options.timeout || 10000
    });
  }
};

ol_control_WMSCapabilities.prototype.error = {
};

/** Display error
 * @param {*} error event
 */
ol_control_WMSCapabilities.prototype.showError = function(e) {
  if (!e) this._elements.error.innerHTML = '';
  else this._elements.error.innerHTML = this.error[e.type] || ('ERROR ('+e.type+')');
  console.log(e);
};

/** Clear form
 */
ol_control_WMSCapabilities.prototype.clearForm = function() {
  this._elements.result.classList.remove('ol-visible')
  this._elements.error.innerHTML = '';
  this._elements.select.innerHTML = '';
  this._elements.data.innerHTML = '';
  this._elements.preview.src = '';
  this._elements.legend.src = '';
};

/** Display capabilities in the dialog
 * @param {*} caps JSON capabilities
 */
ol_control_WMSCapabilities.prototype.showCapabilitis = function(caps) {
  this._elements.result.classList.add('ol-visible')
  console.log(caps)
  var list = [];
  var addLayers = function(parent, ul) {
    parent.Layer.forEach(function(l) {
      if (!l.Attribution) l.Attribution = parent.Attribution;
      if (!l.EX_GeographicBoundingBox) l.EX_GeographicBoundingBox = parent.EX_GeographicBoundingBox;
      var li = ol_ext_element.create('LI', {
        className: l.Layer ? 'ol-title' : '',
        html: l.Name,
        click: function() {
          // Load layer
          var options = this.getOptionsFromCap(l, caps);
          console.log(options)
          options.layer.source = new ol_source_TileWMS(options.source);
          var layer = new ol_layer_Tile(options.layer);
          delete options.layer.source;
          //
          list.forEach(function(i) {
            i.classList.remove('selected');
          })
          li.classList.add('selected');
          this._elements.buttons.innerHTML = '';
          ol_ext_element.create('BUTTON', {
            html: 'Load',
            click: function() {
              this.dispatchEvent({type: 'load', layer: layer, options: options });
              if (this._dialog) this._dialog.hide();
            }.bind(this),
            parent: this._elements.buttons
          });
          // Show preview
          var c = this.getMap().getView().getCenter();
          var r = this.getMap().getView().getResolution();
          this._elements.preview.src = layer.getPreview(c, r);
          // ShowInfo
          this._elements.data.innerHTML = '';
          ol_ext_element.create('p', {
            className: 'ol-title',
            html: options.data.title,
            parent: this._elements.data
          });
          ol_ext_element.create('p', {
            html: options.data.abstract,
            parent: this._elements.data
          });
          if (options.data.legend.length) {
            this._elements.legend.src = options.data.legend[0];
          } else {
            this._elements.legend.src = '';
          }
        }.bind(this),
        parent: ul || this._elements.select
      });
      list.push(li);
      if (l.Layer) {
        var lu = ol_ext_element.create('UL', {
          parent: ul || this._elements.select
        });
        addLayers(l, lu);
      }
    }.bind(this));
  }.bind(this);
  this._elements.select.innerHTML = '';
  addLayers(caps.Capability.Layer);
};

/** Get resolution for a layer
 * @param {string} 'min' or 'max'
 * @param {*} layer
 * @param {number} val
 * @return {number}
 * @private
 */
ol_control_WMSCapabilities.prototype.getLayerResolution = function(m, layer, val) {
  var att = m==='min' ? 'MinScaleDenominator' : 'MaxScaleDenominator';

  if (layer[att] !== undefined) return layer[att]/(72/2.54*100);

  if (!layer.Layer) return (m==='min' ? 0 : 156543.03392804097);

  // Get min / max of contained layers
  val = (m==='min' ? 156543.03392804097 : 0);
  for (var i=0; i<layer.Layer.length; i++) {
    var res = this.getLayerResolution(m, layer.Layer[i], val);
    if (res !== undefined) val = Math[m](val, res);
  }
  return val;
};

/** Return a WMS ol.layer.Tile for the given capabilities
 * @param {*} caps layer capabilities (read from the capabilities)
 * @return {*} parent capabilities
 */
ol_control_WMSCapabilities.prototype.getOptionsFromCap = function(caps, parent) {
  var formats = parent.Capability.Request.GetMap.Format;
  // Look for prefered format first
  var pref =[/png/,/jpeg/,/gif/];
  for (i=0; i<3; i++) {
    for (var f=0; f<formats.length; f++) {
      if (pref[i].test(formats[f])) {
        format = formats[f];
        break;
      }
    }
    if (format) break;
  }
  if (!format) format = formats[0];  

  // Check srs
  var srs = this.get('srs') || 'EPSG:3857';
  if (!caps.CRS || caps.CRS.indexOf(srs)<0) {
    // try to set EPSG:4326 instead
    if (caps.CRS && caps.CRS.indexOf("EPSG:4326")>=0) {
      srs = "EPSG:4326";
    } else  {
      this.showError({ type:'srs' });
    }
  }

  var bbox = caps.EX_GeographicBoundingBox;
  bbox = ol_proj_transformExtent(bbox, 'EPSG:4326', srs);

  var attributions = [];
  if (caps.Attribution) {
    attributions.push('<a href="'+encodeURI(caps.Attribution.OnlineResource)+'">&copy; '+caps.Attribution.Title.replace(/</g,'&lt;')+'</a>');
  }

  var layer_opt = {
    title: caps.Title,
    extent: bbox,
    minResolution: this.getLayerResolution('min', caps),
    maxResolution: this.getLayerResolution('max', caps) || 156543.03392804097
  };

  var source_opt = {
    url: parent.Service.OnlineResource,
    projection: srs,
    attributions: attributions,
    crossOrigin: this.get('cors') ? 'anonymous' : null,
    params: {
      'LAYERS': caps.Name,
      'FORMAT': format,
      'VERSION': parent.version || '1.3.0'
    }
  }

  // Trace
  if (this.get('trace')) {
    var tso = JSON.stringify([ source_opt ], null, "\t").replace(/\\"/g,'"');
    layer_opt.source = "new ol.source.TileWMS("+tso+")";
    var t = "new ol.layer.Tile (" +JSON.stringify(layer_opt, null, "\t")+ ")" 
    t = t.replace(/\\"/g,'"')
      .replace(/"new/g,'new')
      .replace(/\)"/g,')')
      .replace(/\\t/g,"\t").replace(/\\n/g,"\n")
      .replace("([\n\t","(")
      .replace("}\n])","})");
    console.log(t);
    delete layer_opt.source;
  }

  // Legend ?
  var legend = [];
  caps.Style.forEach(function(s) {
    if (s.LegendURL) {
      legend.push(s.LegendURL[0].OnlineResource);
    }
  });

  return ({ 
    layer: layer_opt, 
    source: source_opt,
    data: {
      title: caps.Title,
      abstract: caps.Abstract,
      logo: caps.Attribution && caps.Attribution.LogoURL ? caps.Attribution.LogoURL.OnlineResource : undefined,
      keyword: caps.KeywordList,
      legend: legend,
      opaque: caps.opaque,
      queryable: caps.queryable
    } 
  });
};

/*
ol_control_WMSCapabilities.prototype.getOptionsFromCap = function(layer, options) {
  var i;
  if (!options) options={};
  options = $.extend({
    isBaseLayer: false,
    minScale: layer.MinScaleDenominator,
    maxScale: layer.MaxScaleDenominator,
    attribution: layer.Attribution
  }, options);
  var format = false;
  // Look for prefered format first
  var pref =[/png/,/jpeg/,/gif/];
  for (i=0; i<3; i++) {
    for (var f=0; f<layer.Format.length; f++) {
      if (pref[i].test(layer.Format[f])) {
        format=layer.Format[f];
        break;
      }
    }
    if (format) break;
  }
  if (!format) format = layer.Format[0];

  // Check srs
  var srs = options.srs || 'EPSG:3857';
//	var srserror = false;

  if (!layer.CRS || layer.CRS.indexOf(srs)<0) {
    //srserror = true;
    if (window.proj4) {
      //if (layer.CRS && layer.CRS.indexOf("EPSG:4326")>=0) srs = "EPSG:4326";
//			console.log(layer.CRS)
      if (layer.CRS && layer.CRS.indexOf("EPSG:2154")>=0) srs = "EPSG:2154";
      else if (layer.CRS && layer.CRS.indexOf("EPSG:4326")>=0) srs = "EPSG:4326";
      else console.log("ERROR "+srs);
    }
  }
  
  var bbox, bb = layer.BoundingBox;
  if (bb) {
    for (i = 0; i < bb.length; i++) {
      // On reconstruit les extent pour avoir la bonne etendue
      var ext = bb[i].extent;
      var extent = [ext[1], ext[0], ext[3], ext[2]];
      
      // le formatage des extent n'est pas standard, donc on gere differents cas
      if (/4326/.test(bb[i].crs) || /CRS:84/.test(bb[i].crs)) {
        if (bb[i].extent[0] > 100) bbox = extent;
        else {
          if (ext[1] < 0) {
            bbox = ol_proj_transformExtent(extent, bb[i].crs, 'EPSG:3857');
          } else {
            bbox = ol_proj_transformExtent(ext, bb[i].crs, 'EPSG:3857');
          }
          var world = ol_proj_get("EPSG:3857").getExtent();
          for (var p=0; p<4; p++) {
            if (!bbox[p]) bbox[p] = world[p];
          }
        }
        break;
      }

      if (/3857/.test(bb[i].crs)) {
        bbox = ext;
        break;
      }
    }
  }
  
  function getresolution(m, layer, val) {
    var att;
    if (m=="min") att = "MinScaleDenominator";
    else att = "MaxScaleDenominator";

    if (typeof (layer[att]) != "undefined") return layer[att]/(72/2.54*100);

    if (!layer.Layer) return (m=="min" ? 0 : 156543.03392804097);

    // Get min / max of contained layers
    val = (m=="min" ? 156543.03392804097 : 0);
    for (var i=0; i<layer.Layer.length; i++) {
      var res = getresolution(m, layer.Layer[i], val);
      if (typeof(res) != "undefined") val = Math[m](val, res);
    }
    return val;
  }
  
  function getattribution(layer) {
    if (layer.Attribution) {
      return "<a href='"+layer.Attribution.OnlineResource+"'>&copy; "+layer.Attribution.Title+'</a>';
    }
    if (layer.Layer) {
      for (var i=0; i<layer.Layer.length; i++) {
        var attrib = getattribution(layer.Layer[i]);
        if (attrib) return attrib;
      }
    }
    return null;
  }
  var originator;
  if (layer.Attribution) {
    originator = {};
    originator[layer.Attribution.Title] = {
      attribution: layer.Attribution.Title,
      constraint: [],
      href: layer.Attribution.OnlineResource,
      logo: layer.Attribution.LogoURL ? layer.Attribution.LogoURL.OnlineResource : null
    }
  }
  var layer_opt = {
    title: options.title || layer.Title,
    extent: bbox,
    minResolution: getresolution("min",layer),
    maxResolution: getresolution("max",layer)
  };
  if (layer_opt.maxResolution==0) layer_opt.maxResolution = 156543.03392804097;

  var attr_opt = 	{ html:getattribution(layer) };
  var source_opt = {
    url: layer.url,
    projection: srs,
    crossOrigin: options.cors ? 'anonymous':null,
    params: {
      'LAYERS': layer.Name,
      'FORMAT': format,
//			'EXCEPTIONS': 'application/vnd.ogc.se_xml', // 'application/vnd.ogc.se_inimage' 'application/vnd.ogc.se_blank'
      'VERSION': layer.version || "1.3.0"
    }
  }
  // Set map if exists
  if (layer.map) source_opt.params.MAP = layer.map;

  // Trace
  if (this.trace) {
    if (attr_opt.html) source_opt.attributions = [	"new ol.Attribution("+JSON.stringify(attr_opt).replace(/\\"/g,'"')+")" ];
    var tso = JSON.stringify([ source_opt ], null, "\t").replace(/\\"/g,'"');
    layer_opt.source = "new ol.source.TileWMS("+tso+")";
    var t = "new ol.layer.Tile (" +JSON.stringify(layer_opt, null, "\t")+ ")" 
    t = t.replace(/\\"/g,'"')
      .replace(/"new/g,'new')
      .replace(/\)"/g,')')
      .replace(/\\t/g,"\t").replace(/\\n/g,"\n")
      .replace("([\n\t","(")
      .replace("}\n])","})");
    console.log(t);
  }

  // Legend
  var legend = [];
  for (i in layer.Style) if (layer.Style[i].LegendURL) {
    legend.push(layer.Style[i].LegendURL[0].OnlineResource);
  }

  return { 
    layer: layer_opt, 
    source: source_opt, 
    attribution: attr_opt, 
    originator: originator, 
    legend: legend 
  };
};

/** Return a WMS ol.layer.Tile for the given options
 * @param {} options
 * @static
 * /
ol_control_WMSCapabilities.getLayer = function(options) {
  var opt = $.extend(true, {}, options);

  // Create layer
  if (opt.attribution.html) opt.source.attributions = [ 
    opt.attribution.html 
  ];

  opt.layer.source = new ol_source_TileWMS(opt.source);
  var wms = new ol_layer_Tile (opt.layer);
  wms._originators = opt.originator;
  // Save WMS options
  // wms.WMSParams = options;
  wms.set('wmsparam', options);
  return wms;
}

/** Return a WMS ol.layer.Tile for the given capabilities
 * @param {} layer layer capabilities (read from the capabilities)
 * @param {} options 
 * /
ol_control_WMSCapabilities.prototype.getLayerFromCap = function(layer, options) {
  var opt = this.getOptionsFromCap(layer, options);
  return WMSCapabilities.getLayer(opt);
}


/** Gets all layers for a server
 * @param {string} url service url
 * @param {function} callback function called with a list of layers 
* /
ol_control_WMSCapabilities.prototype.getLayers = function(url, callback) {
  var self = this;
  this.get(url, function(layers) {
    if (layers) for (var i=0; i<layers.length; i++) {
      layers[i] = self.getLayerFromCap(layers[i]);
    }
    if (callback) callback (layers);
  });
};
/**/

export default ol_control_WMSCapabilities
