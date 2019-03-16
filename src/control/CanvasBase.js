import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'

/**
 * @classdesc 
 *   OpenLayers 3 Attribution Control integrated in the canvas (for jpeg/png export purposes).
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol_control_Control}
 */
var ol_control_CanvasBase = function(options) {
  ol_control_Control.call(this, options);
}
ol_ext_inherits(ol_control_CanvasBase, ol_control_Control);

/** Get map Canvas
 * @private
 */
ol_control_CanvasBase.prototype.getContext = function(e) {
  var ctx = e.context;
  if (!ctx) {
    var c = this.getMap().getViewport().querySelectorAll('canvas');
    for (var i=c.length-1; i>=0; i--) {
      ctx = c[i].getContext('2d');
      if (ctx.canvas.width && ctx.canvas.height) break;
    }
  }
  return ctx;
};

export default ol_control_CanvasBase
