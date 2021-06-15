/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_Interaction from 'ol/interaction/Interaction'

/** Interaction to handle longtouch events
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {olx.interaction.LongTouchOptions} 
 * 	@param {function | undefined} options.handleLongTouchEvent Function handling 'longtouch' events, it will receive a mapBrowserEvent. Or listen to the map 'longtouch' event.
 *	@param {integer | undefined} [options.pixelTolerance=0] pixel tolerance before drag, default 0
 *	@param {integer | undefined} [options.delay=1000] The delay for a long touch in ms, default is 1000
 */
var ol_interaction_LongTouch = function(options) {
  if (!options) options = {};

  this.delay_ = options.delay || 1000;
  var ltouch = options.handleLongTouchEvent || function(){};
  
  var _timeout = null;
  var position, event;
  var tol = options.pixelTolerance || 0;
  ol_interaction_Interaction.call(this, {
    handleEvent: function(e) {
      if (this.getActive()) {
        switch (e.type) {
          case 'pointerdown': {
            if (_timeout) clearTimeout(_timeout);
            position = e.pixel;
            event = {
              type: 'longtouch',
              originalEvent: e.originalEvent,
              frameState: e.frameState,
              pixel: e.pixel,
              coordinate: e.coordinate,
              map: this.getMap()
            }
            _timeout = setTimeout (function() {
              ltouch(event);
              event.map.dispatchEvent(event);
            }, this.delay_);
            break;
          }
          case 'pointerdrag': {
            // Check if dragging over tolerance
            if (_timeout && (Math.abs(e.pixel[0] - position[0]) > tol || Math.abs(e.pixel[1] - position[1]) > tol)) {
              clearTimeout(_timeout);
              _timeout = null;
            }
            break;
          }
          case 'pointerup': {
            if (_timeout) {
              clearTimeout(_timeout);
              _timeout = null;
            }
            break;
          }
          default: break;
        }
      } else {
        if (_timeout) {
          clearTimeout(_timeout);
          _timeout = null;
        }
      }
      return true;
    }
  });

};
ol_ext_inherits(ol_interaction_LongTouch, ol_interaction_Interaction);

export default ol_interaction_LongTouch
