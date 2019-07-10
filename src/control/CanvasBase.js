import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_style_Style from 'ol/style/Style'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Text from 'ol/style/Text'

/**
 * @classdesc
 *   Attribution Control integrated in the canvas (for jpeg/png export purposes).
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options extend the ol.control options.
 *  @param {ol_style_Style} options.style style used to draw the title.
 */
class ol_control_CanvasBase {
  constructor(options) {
    if (!options)
      options = {};
    // Define a style to draw on the canvas
    this.setStyle(options.style);
    ol_control_Control.call(this, options);
  }
  /**
   * Remove the control from its current map and attach it to the new map.
   * Subclasses may set up event handlers to get notified about changes to
   * the map here.
   * @param {o.Map} map Map.
   * @api stable
   */
  setMap(map) {
    this.getCanvas(map);
    var oldmap = this.getMap();
    if (this._listener) {
      ol_Observable_unByKey(this._listener);
      this._listener = null;
    }
    ol_control_Control.prototype.setMap.call(this, map);
    if (oldmap)
      oldmap.renderSync();
    if (map) {
      this._listener = map.on('postcompose', this._draw.bind(this));
      // Get a canvas layer on top of the map
    }
  }
  /** Get canvas overlay
   */
  getCanvas(map) {
    if (!map)
      return null;
    var canvas = map.getViewport().getElementsByClassName('ol-fixedoverlay')[0];
    if (!canvas && map.getViewport().querySelector('.ol-layers')) {
      // Add a fixed canvas layer on top of the map
      canvas = document.createElement('canvas');
      canvas.className = 'ol-fixedoverlay';
      map.getViewport().querySelector('.ol-layers').after(canvas);
      // Clear before new compose
      map.on('precompose', function (e) {
        canvas.width = map.getSize()[0] * e.frameState.pixelRatio;
        canvas.height = map.getSize()[1] * e.frameState.pixelRatio;
      });
    }
    return canvas;
  }
  /** Get map Canvas
   * @private
   */
  getContext(e) {
    var ctx = e.context;
    if (!ctx && this.getMap()) {
      var c = this.getMap().getViewport().getElementsByClassName('ol-fixedoverlay')[0];
      ctx = c ? c.getContext('2d') : null;
    }
    return ctx;
  }
  /** Set Style
   * @api
   */
  setStyle(style) {
    this._style = style || new ol_style_Style({});
  }
  /** Get style
   * @api
   */
  getStyle() {
    return this._style;
  }
  /** Get stroke
   * @api
   */
  getStroke() {
    var t = this._style.getStroke();
    if (!t)
      this._style.setStroke(new ol_style_Stroke({ color: '#000', width: 1.25 }));
    return this._style.getStroke();
  }
  /** Get fill
   * @api
   */
  getFill() {
    var t = this._style.getFill();
    if (!t)
      this._style.setFill(new ol_style_Fill({ color: '#fff' }));
    return this._style.getFill();
  }
  /** Get stroke
   * @api
   */
  getTextStroke() {
    var t = this._style.getText();
    if (!t)
      t = new ol_style_Text({});
    if (!t.getStroke())
      t.setStroke(new ol_style_Stroke({ color: '#fff', width: 3 }));
    return t.getStroke();
  }
  /** Get text fill
   * @api
   */
  getTextFill() {
    var t = this._style.getText();
    if (!t)
      t = new ol_style_Text({});
    if (!t.getFill())
      t.setFill(new ol_style_Fill({ color: '#fff', width: 3 }));
    return t.getFill();
  }
  /** Get text font
   * @api
   */
  getTextFont() {
    var t = this._style.getText();
    if (!t)
      t = new ol_style_Text({});
    if (!t.getFont())
      t.setFont('12px sans-serif');
    return t.getFont();
  }
  /** Draw the control on canvas
   * @private
   */
  _draw( /* e */) {
    console.warn('[CanvasBase] draw function not implemented.');
  }
}
ol_ext_inherits(ol_control_CanvasBase, ol_control_Control);












export default ol_control_CanvasBase
