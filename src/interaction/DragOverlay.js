import ol_interaction_Pointer from 'ol/interaction/Pointer.js'

/** Drag an overlay on the map
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @fires dragstart
 * @fires dragging
 * @fires dragend
 * @param {any} options
 *  @param {ol.Overlay|Array<ol.Overlay>} options.overlays the overlays to drag
 *  @param {ol.Size} options.offset overlay offset, default [0,0]
 *  @param {boolean} options.centerOnClick wheter a click inside the popup should move it to the click coordinates, default false
 */
var ol_interaction_DragOverlay = class olinteractionDragOverlay extends ol_interaction_Pointer {
  constructor(options) {
    options = options || {};

    var offset = options.offset || [0, 0];
    var centerOnClick = options.centerOnClick || false;

    // Extend pointer
    super({
      // start draging on an overlay
      handleDownEvent: function (evt) {
        var res = evt.frameState.viewState.resolution;
        var coordinate = [evt.coordinate[0] + offset[0] * res, evt.coordinate[1] - offset[1] * res];
        // Click on a button (closeBox) or on a link: don't drag!
        if (/^(BUTTON|A)$/.test(evt.originalEvent.target.tagName)) {
          this._dragging = false;
          return true;
        }
        // Start dragging
        if (this._dragging) {
          if (centerOnClick) {
            this._dragging.setPosition(coordinate, true);
          }
          var coordinateInitial = this._dragging.getPosition();
          this._dragging.offsetClick = [coordinate[0]-coordinateInitial[0], coordinate[1]-coordinateInitial[1]];
          this.dispatchEvent({
            type: 'dragstart',
            overlay: this._dragging,
            originalEvent: evt.originalEvent,
            frameState: evt.frameState,
            coordinate: coordinateInitial
          });
          return true;
        }
        return false;
      },
      // Drag
      handleDragEvent: function (evt) {
        var res = evt.frameState.viewState.resolution;
        var coordinate = [evt.coordinate[0] + offset[0] * res, evt.coordinate[1] - offset[1] * res];
        if (this._dragging) {
          coordinate = [coordinate[0]-this._dragging.offsetClick[0], coordinate[1]-this._dragging.offsetClick[1]];
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
      handleUpEvent: function (evt) {
        var res = evt.frameState.viewState.resolution;
        var coordinate = [evt.coordinate[0] + offset[0] * res, evt.coordinate[1] - offset[1] * res];
        if (this._dragging) {
          coordinate = [coordinate[0]-this._dragging.offsetClick[0], coordinate[1]-this._dragging.offsetClick[1]];
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
  }
  /** Add an overlay to the interacton
   * @param {ol.Overlay} ov
   */
  addOverlay(ov) {
    for (var i = 0, o; o = this._overlays[i]; i++) {
      if (o === ov)
        return;
    }
    var element = ov.getElement();
    // Stop event overlay
    if (element.parentElement && element.parentElement.classList.contains('ol-overlaycontainer-stopevent')) {
      console.warn('[DragOverlay.addOverlay] overlay must be created with stopEvent set to false!');
      return;
    }
    // Add listener on overlay of the same map
    var handler = function () {
      if (this.getMap() === ov.getMap()) {
        this._dragging = ov;
      }
    }.bind(this);
    this._overlays.push({
      overlay: ov,
      listener: handler
    });
    // element.addEventListener('pointerdown', handler);
    element.parentNode.addEventListener('pointerdown', handler)
  }
  /** Remove an overlay from the interacton
   * @param {ol.Overlay} ov
   */
  removeOverlay(ov) {
    for (var i = 0, o; o = this._overlays[i]; i++) {
      if (o.overlay === ov) {
        var l = this._overlays.splice(i, 1)[0];
        ov.getElement().parentNode.removeEventListener('pointerdown', l.listener);
        break;
      }
    }
  }
}

export default ol_interaction_DragOverlay
