/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_interaction_Interaction from 'ol/interaction/Interaction'
import ol_Map from 'ol/Map'
import ol_Overlay from 'ol/Overlay'

/** Interaction synchronize
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {olx.interaction.SynchronizeOptions} 
 *  - maps {Array<ol.Map>} An array of maps to synchronize with the map of the interaction
 */
var ol_interaction_Synchronize = function(options) {
  if (!options) options={};
  var self = this;

  ol_interaction_Interaction.call(this, {
    handleEvent: function(e) {
      if (e.type=="pointermove") { self.handleMove_(e); }
      return true;
    }
  });

  this.maps = options.maps;

};
ol_ext_inherits(ol_interaction_Synchronize, ol_interaction_Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol_Map} map Map.
 * @api stable
 */
ol_interaction_Synchronize.prototype.setMap = function(map) {
  if (this._listener) {
    ol_Observable_unByKey(this._listener.center);
    ol_Observable_unByKey(this._listener.rotation);
    ol_Observable_unByKey(this._listener.resolution);
    this.getMap().getTargetElement().removeEventListener('mouseout', this._listener.mouseout);
  }
  this._listener = null;

  ol_interaction_Interaction.prototype.setMap.call (this, map);

  if (map) {
    this._listener = {};
    this._listener.center = this.getMap().getView().on('change:center', this.syncMaps.bind(this));
    this._listener.rotation = this.getMap().getView().on('change:rotation', this.syncMaps.bind(this));
    this._listener.resolution = this.getMap().getView().on('change:resolution', this.syncMaps.bind(this));
    this._listener.mouseout = this.handleMouseOut_.bind(this);
    if (this.getMap().getTargetElement()) {
      this.getMap().getTargetElement().addEventListener('mouseout', this._listener.mouseout);
    }
    this.syncMaps();
  }
};

/** Synchronize the maps
*/
ol_interaction_Synchronize.prototype.syncMaps = function(e) {
  var map = this.getMap();
  if (!e) e = { type:'all' };
  if (map) {
    for (var i=0; i<this.maps.length; i++) {
      switch (e.type) {
        case 'change:rotation': {
          if (this.maps[i].getView().getRotation() != map.getView().getRotation())
            this.maps[i].getView().setRotation(map.getView().getRotation()); 
          break;
        }
        case 'change:center': {
          if (this.maps[i].getView().getCenter() != map.getView().getCenter()) {
            this.maps[i].getView().setCenter(map.getView().getCenter()); 
          }
          break;
        }
        case 'change:resolution': {
          if (this.maps[i].getView().getResolution() != map.getView().getResolution()) {
            this.maps[i].getView().setResolution(map.getView().getResolution());
          }
          break;
        }
        default: {
          this.maps[i].getView().setRotation(map.getView().getRotation());
          this.maps[i].getView().setCenter(map.getView().getCenter());
          this.maps[i].getView().setResolution(map.getView().getResolution());
          break;
        }
      }
    }
  }
};

/** Cursor move > tells other maps to show the cursor
* @param {ol.event} e "move" event
*/
ol_interaction_Synchronize.prototype.handleMove_ = function(e) {
  for (var i=0; i<this.maps.length; i++) {
    this.maps[i].showTarget(e.coordinate);
  }
  this.getMap().showTarget();
};


/** Cursor out of map > tells other maps to hide the cursor
* @param {event} e "mouseOut" event
*/
ol_interaction_Synchronize.prototype.handleMouseOut_ = function(/*e*/) {
  for (var i=0; i<this.maps.length; i++) {
    this.maps[i].targetOverlay_.setPosition(undefined);
  }
};

/** Show a target overlay at coord
* @param {ol.coordinate} coord
*/
ol_Map.prototype.showTarget = function(coord) {
  if (!this.targetOverlay_) {
    var elt = document.createElement("div");
    elt.classList.add("ol-target");
    this.targetOverlay_ = new ol_Overlay({ element: elt });
    this.targetOverlay_.setPositioning('center-center');
    this.addOverlay(this.targetOverlay_);
    elt.parentElement.classList.add("ol-target-overlay");
    // hack to render targetOverlay before positioning it
    this.targetOverlay_.setPosition([0,0]);
  }
  this.targetOverlay_.setPosition(coord);
};

/** Hide the target overlay
*/
ol_Map.prototype.hideTarget = function() {
  this.removeOverlay(this.targetOverlay_);
  this.targetOverlay_ = undefined;
};

export default ol_interaction_Synchronize
