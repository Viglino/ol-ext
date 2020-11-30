/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_DragOverlay from './DragOverlay'

/** Handle a touch cursor to defer event position on overlay position
 * It can be used as abstract base class used for creating subclasses. 
 * The TouchCursor interaction modifies map browser event coordinate and pixel properties to force pointer on the graphic cursor on the screen to any interaction that them.
 * @constructor
 * @extends {ol_interaction_DragOverlay}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {ol.coordinate} coordinate position of the 
 */
var ol_interaction_TouchCursor = function(options) {
  options = options || {};

  // List of listerner on the object
  this._listener = {};

  // Interaction to defer position on top of the interaction 
  // this is done to enable other coordinates manipulation inserted after the interaction (snapping)
  var offset = [-20,-20];
  this.ctouch = new ol_interaction_Interaction({
    handleEvent: function(e) {
      if (!/drag/.test(e.type) && this.getMap()) {
        e.coordinate = this.overlay.getPosition();
        e.pixel = this.getMap().getPixelFromCoordinate(e.coordinate);
      } else {
        var res = e.frameState.viewState.resolution
        e.coordinate = [e.coordinate[0] + offset[0]*res, e.coordinate[1] - offset[1]*res];
        e.pixel = this.getMap().getPixelFromCoordinate(e.coordinate);
      }
      this._lastEvent = e;
      return true; 
    }.bind(this)
  });

  // Add Overlay
  this.overlay = new ol_Overlay({
    className: 'ol-touch-cursor',
    position: options.coordinate,
    positioning: 'top-left',
    element: ol_ext_element.create('DIV', {}),
    stopEvent: false,
  });
  if (options.buttons) {
    var elt = this.overlay.element;
    var start = options.buttons.length > 4 ? 0 : 1;
    options.buttons.forEach((function (b, i) {
      ol_ext_element.create('DIV', {
        className: (b.className||'')+' ol-button ol-button-' + (i+start),
        html: ol_ext_element.create('DIV', { html: b.html }),
        click: b.click,
        on: b.on,
        parent: elt
      })
    }))
  }

  ol_interaction_DragOverlay.call(this, {
    centerOnClick: false,
    //offset: [-20,-20],
    overlays: this.overlay
  });

  // Replace events to handle click
  var dragging = false;
  var start = false;
  this.on('dragstart', function (e) {
    start = e;
    return !e.overlay;
  })
  this.on('dragend', function (e) {
    if (!e.overlay) return true;
    if (dragging) {
      this.dispatchEvent({
        type: 'dragend', 
        dragging: dragging,
        originalEvent: e.originalEvent, 
        frameState: e.frameState,
        pixel: map.getPixelFromCoordinate(this.overlay.getPosition()),
        coordinate: this.overlay.getPosition() 
      });
      dragging = false;
    } else {
      if (e.originalEvent.target === this.overlay.element) {
        this.dispatchEvent({ 
          type: 'click', 
          dragging: dragging,
          originalEvent: e.originalEvent, 
          frameState: e.frameState,
          pixel: map.getPixelFromCoordinate(this.overlay.getPosition()),
          coordinate: this.overlay.getPosition() 
        });
      }
    }
    return false;
  })
  this.on('dragging', function (e) {
    if (!e.overlay) return true;
    dragging = true;
    if (start) {
      this.dispatchEvent({ 
        type: 'dragstart', 
        dragging: dragging,
        originalEvent: start.originalEvent, 
        frameState: e.frameState,
        pixel: map.getPixelFromCoordinate(start.coordinate),
        coordinate: start.coordinate
      });
      start = false;
    }
    this.dispatchEvent({ 
      type: 'dragging', 
      dragging: dragging,
      originalEvent: e.originalEvent, 
      frameState: e.frameState,
      pixel: map.getPixelFromCoordinate(this.overlay.getPosition()),
      coordinate: this.overlay.getPosition() 
    });
    return false;
  })
};
ol_ext_inherits(ol_interaction_TouchCursor, ol_interaction_DragOverlay);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_interaction_TouchCursor.prototype.setMap = function(map) {
  if (this.getMap()) {
    this.getMap().removeInteraction(this.ctouch);
    this.getMap().removeOverlay(this.overlay);
  }

  ol_interaction_DragOverlay.prototype.setMap.call (this, map);

  if (this.getMap()) {
    this.getMap().addOverlay(this.overlay);
    this.getMap().addInteraction(this.ctouch);
  }
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @param {ol.coordinate|null} position position of the cursor (when activating), default viewport center.
 * @observable
 * @api
 */
ol_interaction_TouchCursor.prototype.setActive = function(b, position) {
  ol_interaction_DragOverlay.prototype.setActive.call (this, b);
  this.ctouch.setActive(b);
  if (!b) {
    this.overlay.setPosition();
    this.overlay.element.classList.remove('active');
    return;
  } else if (position) {
    this.overlay.setPosition(position);
  } else if (this.getMap()) {
    this.overlay.setPosition(this.getMap().getView().getCenter());
  }
  setTimeout(function() {
    this.overlay.element.classList.add('active');
  }.bind(this), 100);
};

/** Set the position of the target
 * @param {ol.coordinate} coord
 */
ol_interaction_TouchCursor.prototype.setPosition = function (coord) {
  this.overlay.setPosition(coord); 
};

/** Get the position of the target
 * @return {ol.coordinate}
 */
ol_interaction_TouchCursor.prototype.getPosition = function () {
  return this.overlay.getPosition(); 
};

export default ol_interaction_TouchCursor
