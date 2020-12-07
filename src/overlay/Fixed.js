/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_Overlay from 'ol/Overlay'

/**
 * @classdesc
 * An overlay fixed on the map. 
 * Use setPosition(coord, true) to force the overlay position otherwise the position will be ignored.
 *
 * @example
var popup = new ol_Overlay_Fixed();
map.addOverlay(popup);
popup.setposition(position, true);
*
* @constructor
* @extends {ol_Overlay}
* @param {} options Extend Overlay options 
* @api stable
*/
var ol_Overlay_Fixed = function (options) {
  ol_Overlay.call(this, options);
};
ol_ext_inherits(ol_Overlay_Fixed, ol_Overlay);

/** Prevent modifying position and use a force argument to force positionning.
 * @param {ol.coordinate} position
 * @param {boolean} force true to change the position, default false
 */
ol_Overlay_Fixed.prototype.setPosition = function(position, force) {
  if (this.getMap() && position) {
    this._pixel = this.getMap().getPixelFromCoordinate(position);
  }
  ol_Overlay.prototype.setPosition.call(this, position)
  if (force) {
    ol_Overlay.prototype.updatePixelPosition.call(this);
  } 
};

/** Update position according the pixel position
 */
ol_Overlay_Fixed.prototype.updatePixelPosition = function() {
  if (this.getMap() && this._pixel && this.getPosition()) {
    var pixel = this.getMap().getPixelFromCoordinate(this.getPosition())
    if (Math.round(pixel[0]*1000) !== Math.round(this._pixel[0]*1000) 
      || Math.round(pixel[0]*1000) !== Math.round(this._pixel[0]*1000) ) {
      this.setPosition(this.getMap().getCoordinateFromPixel(this._pixel));
    }
  }
};

export default ol_Overlay_Fixed
