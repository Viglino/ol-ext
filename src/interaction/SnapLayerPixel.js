/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_Interaction from 'ol/interaction/Interaction'
import {altKeyOnly as ol_events_condition_altKeyOnly} from 'ol/events/condition'

/** An interaction to snap on pixel on a layer
 * The CenterTouch interaction modifies map browser event coordinate and pixel properties to force pointer on the viewport center to any interaction that them.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {ol.layer.Layer} options.layer layer to snap on
 */
var ol_interaction_SnapLayerPixel = function(options) {
  options = options || {};

  // Get layer canevas context
  this._layer = options.layer;
  this._layer.on(['postcompose', 'postrender'], function(e) {
    this._ctx = e.context;
  }.bind(this));

  var radius = options.radius || 8;
  var size = 2*radius;
  ol_interaction_Interaction.call(this, {
    handleEvent: function(e) {
      if (this._layer.getVisible() && this._layer.getOpacity() 
      && ol_events_condition_altKeyOnly(e) && this.getMap()) {
        var x0 = e.pixel[0] - radius;
        var y0 = e.pixel[1] - radius;
        var imgd = this._ctx.getImageData(x0, y0, size, size);
        var pix = imgd.data;
        // Loop over each pixel and invert the color.
        var x, y, xm, ym, max=-1; 
        var t = [];
        for (x=0; x < size; x++) {
          t.push([])
          for (y=0; y < size; y++) {
            var l = pix[3+ 4 * (x + y*size)];
            t[x].push(l>10 ? l : 0)
          }
        }
        for (x=1; x < size-1; x++) {
          for (y=1; y < size-1; y++) {
            var m = t[x][y+1] + t[x][y] + t[x][y+1] 
              + t[x-1][y-1] + t[x-1][y] + t[x-1][y+1] 
              + t[x+1][y-1] + t[x+1][y] + t[x+1][y+1];
            if (m > max) {
              max = m;
              xm = x;
              ym = y;
            } 
          }
        }
        e.pixel = [x0+xm, y0+ym];
        e.coordinate = this.getMap().getCoordinateFromPixel(e.pixel);

        /*
        e.coordinate = this.getMap().getView().getCenter();
        e.pixel = this.getMap().getSize();
        e.pixel = [ e.pixel[0]/2, e.pixel[1]/2 ];
        */
      }
      return true; 
    }
  });
};
ol_ext_inherits(ol_interaction_SnapLayerPixel, ol_interaction_Interaction);

export default ol_interaction_SnapLayerPixel
