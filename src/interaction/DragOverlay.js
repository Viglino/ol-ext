import ol_ext_inherits from '../util/ext'
import ol_interaction_Pointer from 'ol/interaction/Pointer'

/** Drag an overlay on the map
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @fires dragstart
 * @fires dragging
 * @fires dragend
 * @param {any} options
 *  @param {ol.Overlay|Array<ol.Overlay>} options.overlays the overlays to drag
 *  @param {ol.Size} options.offset overlay offset, default [0,0]
 */
var ol_interaction_DragOverlay = function(options) {
  if (!options) options = {};

  var offset = options.offset || [0,0];

  // Extend pointer
  ol_interaction_Pointer.call(this, {
    // start draging on an overlay
    handleDownEvent: function(evt) {
      var res = evt.frameState.viewState.resolution
      var coordinate = [evt.coordinate[0] + offset[0]*res, evt.coordinate[1] - offset[1]*res];
      // Click on a button (closeBox) or on a link: don't drag!
      if (/^(BUTTON|A)$/.test(evt.originalEvent.target.tagName)) {
        this._dragging = false;
        return true;
      }
      // Start dragging
      if (this._dragging) {
        if (options.centerOnClick !== false) {
          this._dragging.setPosition(coordinate, true);
        } else {
          coordinate = this._dragging.getPosition();
        }
        this.dispatchEvent({ 
          type: 'dragstart',
          overlay: this._dragging,
          originalEvent: evt.originalEvent,
          frameState: evt.frameState,
          coordinate: coordinate
        });
        return true;
      }
      return false;
    },
    // Drag
    handleDragEvent: function(evt) {
      var res = evt.frameState.viewState.resolution
      var coordinate = [evt.coordinate[0] + offset[0]*res, evt.coordinate[1] - offset[1]*res];
      if (this._dragging) {
        this._dragging.setPosition(coordinate, true);
        this.dispatchEvent({ 
          type: 'dragging',
          overlay: this._dragging,
          originalEvent: evt.originalEvent,
          frameState: evt.frameState,
          coordinate: coordinate
        });
      }
    },
    // Stop dragging
    handleUpEvent: function(evt) {
      var res = evt.frameState.viewState.resolution
      var coordinate = [evt.coordinate[0] + offset[0]*res, evt.coordinate[1] - offset[1]*res];
      if (this._dragging) {
        this.dispatchEvent({ 
          type: 'dragend',
          overlay: this._dragging,
          originalEvent: evt.originalEvent,
          frameState: evt.frameState,
          coordinate: coordinate
        });
        this._dragging = false;
        return true;
      }
      return false;
    }
  });

  // List of overlays / listeners
  this._overlays = [];
  if (!(options.overlays instanceof Array)) options.overlays = [options.overlays];
  options.overlays.forEach(this.addOverlay.bind(this));
};
ol_ext_inherits(ol_interaction_DragOverlay, ol_interaction_Pointer);

/** Add an overlay to the interacton
 * @param {ol.Overlay} ov
 */
ol_interaction_DragOverlay.prototype.addOverlay = function (ov) {
  for (var i=0, o; o=this._overlays[i]; i++) {
    if (o===ov) return;
  }
  // Stop event overlay
  if (ov.element.parentElement && ov.element.parentElement.classList.contains('ol-overlaycontainer-stopevent')) {
    console.warn('[DragOverlay.addOverlay] overlay must be created with stopEvent set to false!');
    return;
  }
  // Add listener on overlay of the same map
  var handler = function() {
    if (this.getMap()===ov.getMap()) this._dragging = ov;
  }.bind(this);
  this._overlays.push({
    overlay: ov,
    listener: handler
  });
  ov.element.addEventListener('pointerdown', handler);
};

/** Remove an overlay from the interacton
 * @param {ol.Overlay} ov
 */
ol_interaction_DragOverlay.prototype.removeOverlay = function (ov) {
  for (var i=0, o; o=this._overlays[i]; i++) {
    if (o.overlay===ov) {
      var l = this._overlays.splice(i,1)[0];
      ov.element.removeEventListener('pointerdown', l.listener);
      break;
    }
  }
};

export default ol_interaction_DragOverlay
