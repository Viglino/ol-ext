/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_interaction_Interaction from 'ol/interaction/Interaction.js'
import ol_Map from 'ol/Map.js'
import ol_Overlay from 'ol/Overlay.js'

/** Interaction synchronize
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {*} options
 *  @param {Array<ol.Map>} options maps An array of maps to synchronize with the map of the interaction
 */
var ol_interaction_Synchronize = class olinteractionSynchronize extends ol_interaction_Interaction {
  constructor(options) {
    options = options || {}
    super({
      handleEvent: function (e) {
        if (e.type == "pointermove") { this.handleMove_(e)} 
        return true
      }
    })

    this.maps = options.maps || []
    if (options.active === false) this.setActive(false)
  }
  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {ol_Map} map Map.
   * @api stable
   */
  setMap(map) {
    if (this._listener) {
      ol_Observable_unByKey(this._listener.center)
      ol_Observable_unByKey(this._listener.rotation)
      ol_Observable_unByKey(this._listener.resolution)
      this.getMap().getTargetElement().removeEventListener('mouseout', this._listener.mouseout)
    }
    this._listener = null

    super.setMap(map)

    if (map) {
      this._listener = {}
      this._listener.center = this.getMap().getView().on('change:center', this.syncMaps.bind(this))
      this._listener.rotation = this.getMap().getView().on('change:rotation', this.syncMaps.bind(this))
      this._listener.resolution = this.getMap().getView().on('change:resolution', this.syncMaps.bind(this))
      this._listener.mouseout = this.handleMouseOut_.bind(this)
      if (this.getMap().getTargetElement()) {
        this.getMap().getTargetElement().addEventListener('mouseout', this._listener.mouseout)
      }
      this.syncMaps()
    }
  }
  /** Auto activate/deactivate controls in the bar
   * @param {boolean} b activate/deactivate
   */
  setActive(b) {
    super.setActive(b)
    this.syncMaps()
  }
  /** Synchronize the maps
   */
  syncMaps() {
    if (!this.getActive())
      return
    var map = this.getMap()
    if (map) {
      if (map.get('lockView'))
        return
      for (var i = 0; i < this.maps.length; i++) {
        this.maps[i].set('lockView', true)
        // sync
        if (this.maps[i].getView().getRotation() != map.getView().getRotation()) {
          this.maps[i].getView().setRotation(map.getView().getRotation())
        }
        if (this.maps[i].getView().getCenter() != map.getView().getCenter()) {
          this.maps[i].getView().setCenter(map.getView().getCenter())
        }
        if (this.maps[i].getView().getResolution() != map.getView().getResolution()) {
          this.maps[i].getView().setResolution(map.getView().getResolution())
        }
        this.maps[i].set('lockView', false)
      }
    }
  }
  /** Cursor move > tells other maps to show the cursor
  * @param {ol.event} e "move" event
  */
  handleMove_(e) {
    for (var i = 0; i < this.maps.length; i++) {
      this.maps[i].showTarget(e.coordinate)
    }
    this.getMap().showTarget()
  }
  /** Cursor out of map > tells other maps to hide the cursor
  * @param {event} e "mouseOut" event
  */
  handleMouseOut_( /*e*/) {
    for (var i = 0; i < this.maps.length; i++) {
      if (this.maps[i]._targetOverlay)
        this.maps[i]._targetOverlay.setPosition(undefined)
    }
  }
}

/** Show a target overlay at coord
 * @param {ol.coordinate} coord
 */
ol_Map.prototype.showTarget = function(coord) {
  if (!this._targetOverlay) {
    var elt = document.createElement("div");
    elt.classList.add("ol-target");
    this._targetOverlay = new ol_Overlay({ element: elt });
    this._targetOverlay.setPositioning('center-center');
    this.addOverlay(this._targetOverlay);
    elt.parentElement.classList.add("ol-target-overlay");
    // hack to render targetOverlay before positioning it
    this._targetOverlay.setPosition([0,0]);
  }
  this._targetOverlay.setPosition(coord);
};

/** Hide the target overlay
 */
ol_Map.prototype.hideTarget = function() {
  this.removeOverlay(this._targetOverlay);
  this._targetOverlay = undefined;
};

export default ol_interaction_Synchronize
