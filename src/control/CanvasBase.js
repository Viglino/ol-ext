import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_style_Style from 'ol/style/Style'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Text from 'ol/style/Text'
import ol_layer_Image from 'ol/layer/Image'
import ol_source_ImageCanvas from 'ol/source/ImageCanvas'

/**
 * @classdesc 
 *   OpenLayers 3 Attribution Control integrated in the canvas (for jpeg/png export purposes).
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options extend the ol.control options. 
 *  @param {ol_style_Style} options.style style used to draw the title.
 */
var ol_control_CanvasBase = function(options) {
  if (!options) options = {};

  // Define a style to draw on the canvas
  this.setStyle(options.style);

  ol_control_Control.call(this, options);
}
ol_ext_inherits(ol_control_CanvasBase, ol_control_Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {o.Map} map Map.
 * @api stable
 */
ol_control_CanvasBase.prototype.setMap = function (map) {
  var oldmap = this.getMap();
  if (this._listener) {
    ol_Observable_unByKey(this._listener);
    this._listener = null;
  }
  
  ol_control_Control.prototype.setMap.call(this, map);
  if (oldmap) oldmap.renderSync();

  if (map) {
    this._listener = map.on('postcompose', this._draw.bind(this));
    // Get a canvas layer on top of the map
  }
};

/** Get map Canvas
 * @private
 */
ol_control_CanvasBase.prototype.getContext = function(e) {
  var ctx = e.context;
  if (!ctx && this.getMap()) {
    var c = this.getMap().getViewport().getElementsByClassName('ol-fixedoverlay')[0];
    var ctx = c ? c.getContext('2d') : null;
    if (!ctx) {
      // Add a fixed canvas layer on top of the map
      var canvas = document.createElement('canvas');
      canvas.className = 'ol-fixedoverlay';
      this.getMap().getViewport().querySelector('.ol-layers').after(canvas);
      ctx = canvas.getContext('2d');
      canvas.width = this.getMap().getSize()[0] * e.frameState.pixelRatio;
      canvas.height = this.getMap().getSize()[1] * e.frameState.pixelRatio;
      this.getMap().on('change:size', function() {
        canvas.width = this.getMap().getSize()[0] * e.frameState.pixelRatio;
        canvas.height = this.getMap().getSize()[1] * e.frameState.pixelRatio;
      }.bind(this))
    }
  }
  return ctx;
};

/** Set Style
 * @api
 */
ol_control_CanvasBase.prototype.setStyle = function(style) {
  this._style = style ||  new ol_style_Style ({});
};

/** Get style
 * @api
 */
ol_control_CanvasBase.prototype.getStyle = function() {
  return this._style;
};

/** Get stroke
 * @api
 */
ol_control_CanvasBase.prototype.getStroke = function() {
  var t = this._style.getStroke();
  if (!t) this._style.setStroke(new ol_style_Stroke ({ color:'#000', width:1.25 }));
  return this._style.getStroke();
};

/** Get fill
 * @api
 */
ol_control_CanvasBase.prototype.getFill = function() {
  var t = this._style.getFill();
  if (!t) this._style.setFill(new ol_style_Fill ({ color:'#fff' }));
  return this._style.getFill();
};

/** Get stroke
 * @api
 */
ol_control_CanvasBase.prototype.getTextStroke = function() {
  var t = this._style.getText();
  if (!t) t = new ol_style_Text({});
  if (!t.getStroke()) t.setStroke(new ol_style_Stroke ({ color:'#fff', width:3 }));
  return t.getStroke();
};

/** Get text fill
 * @api
 */
ol_control_CanvasBase.prototype.getTextFill = function() {
  var t = this._style.getText();
  if (!t) t = new ol_style_Text({});
  if (!t.getFill()) t.setFill(new ol_style_Fill ({ color:'#fff', width:3 }));
  return t.getFill();
};

/** Get text font
 * @api
 */
ol_control_CanvasBase.prototype.getTextFont = function() {
  var t = this._style.getText();
  if (!t) t = new ol_style_Text({});
  if (!t.getFont()) t.setFont('12px sans-serif');
  return t.getFont();
};

/** Draw the control on canvas
 * @private
 */
ol_control_CanvasBase.prototype._draw = function(/* e */) {
  console.warn('[CanvasBase] draw function not implemented.');
};

export default ol_control_CanvasBase
