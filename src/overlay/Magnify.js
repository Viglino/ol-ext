/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_Collection from 'ol/Collection'
import ol_View from 'ol/View'
import ol_Overlay from 'ol/Overlay'
import ol_Map from 'ol/Map'

/**
 * @classdesc
 *	The Magnify overlay add a "magnifying glass" effect to an OL3 map that displays 
*	a portion of the map in a different zoom (and actually display different content).
*
* @constructor
* @extends {ol_Overlay}
* @param {olx.OverlayOptions} options Overlay options 
* @api stable
*/
var ol_Overlay_Magnify = function (options) {
  var elt = document.createElement("div");
      elt.className = "ol-magnify";
  this._elt = elt;

  ol_Overlay.call(this, {
    positioning: options.positioning || "center-center",
    element: this._elt,
    stopEvent: false
  });
  // Create magnify map
  this.mgmap_ = new ol_Map({
    controls: new ol_Collection(),
    interactions: new ol_Collection(),
    target: options.target || this._elt,
    view: new ol_View({ projection: options.projection }),
    layers: options.layers
  });
  this.mgview_ = this.mgmap_.getView();

  this.external_ = options.target?true:false;

  this.set("zoomOffset", options.zoomOffset||1);
  this.set("active", true);
  this.on("propertychange", this.setView_.bind(this));
};
ol_ext_inherits(ol_Overlay_Magnify, ol_Overlay);

/**
 * Set the map instance the overlay is associated with.
 * @param {ol.Map} map The map instance.
 */
ol_Overlay_Magnify.prototype.setMap = function(map) {
  if (this.getMap()) {
    this.getMap().getViewport().removeEventListener("mousemove", this.onMouseMove_);
  }
  if (this._listener) ol_Observable_unByKey(this._listener);
  this._listener = null;

  ol_Overlay.prototype.setMap.call(this, map);
  map.getViewport().addEventListener("mousemove", this.onMouseMove_.bind(this));
  this._listener = map.getView().on('propertychange', this.setView_.bind(this));

  this.setView_();
};

/** Get the magnifier map
*	@return {_ol_Map_}
*/
ol_Overlay_Magnify.prototype.getMagMap = function() {
  return this.mgmap_;
};

/** Magnify is active
*	@return {boolean}
*/
ol_Overlay_Magnify.prototype.getActive = function() {
  return this.get("active");
};

/** Activate or deactivate
*	@param {boolean} active
*/
ol_Overlay_Magnify.prototype.setActive = function(active) {
  return this.set("active", active);
};

/** Mouse move
 * @private
 */
ol_Overlay_Magnify.prototype.onMouseMove_ = function(e) {
  var self = this;
  if (!self.get("active")) {
    self.setPosition();
  } else {
    var px = self.getMap().getEventCoordinate(e);
    if (!self.external_) self.setPosition(px);
    self.mgview_.setCenter(px);
    if (!self._elt.querySelector('canvas') || self._elt.querySelector('canvas').style.display =="none") self.mgmap_.updateSize();
  }
};

/** View has changed
 * @private
 */
ol_Overlay_Magnify.prototype.setView_ = function(e) {
  if (!this.get("active")) {
    this.setPosition();
    return;
  }

  if (!e) {
    // refresh all
    this.setView_({key:'rotation'});
    this.setView_({key:'resolution'});
    return;
  }

  // Set the view params
  switch (e.key) {
    case 'rotation':
      this.mgview_.setRotation(this.getMap().getView().getRotation());
      break;
    case 'zoomOffset':
    case 'resolution': {
      var z = Math.max(0,this.getMap().getView().getZoom()+Number(this.get("zoomOffset")));
      this.mgview_.setZoom(z);
      break;
    }
    default: break;
  }
};

export default ol_Overlay_Magnify
