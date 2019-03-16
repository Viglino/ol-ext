/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_interaction_Interaction from 'ol/interaction/Interaction'
import {getArea as ol_sphere_getArea} from 'ol/sphere.js';
import {getLength as ol_sphere_getLength} from 'ol/sphere.js';
import ol_Overlay_Popup from 'Popup'

/** A tooltip element to be displayed over the map and attached on the cursor position.
 * @constructor
 * @extends {ol_Overlay_Popup}
 * @param {} options Extend Popup options 
 *	@param {String} options.popupClass the a class of the overlay to style the popup.
 *	@param {Number|Array<number>} options.offsetBox an offset box
 *	@param {ol.OverlayPositioning | string | undefined} options.positionning 
 *		the 'auto' positioning var the popup choose its positioning to stay on the map.
 * @api stable
 */
var ol_Overlay_Tooltip = function (options) {
  options = options || {};

  options.popupClass = options.popupClass || options.className || 'tooltips black';
  options.positioning = options.positioning || 'center-left';
	ol_Overlay_Popup.call(this, options);

  this._interaction = new ol_interaction_Interaction({
    handleEvent: function(e){
      if (e.type==='pointermove' || e.type==='click') {
        if (this.get('info')) {
          this.show(e.coordinate, this.get('info'));
        }
        else this.hide();
        this._coord = e.coordinate;
      }
      return true;
    }.bind(this)
  });
};
ol_ext_inherits(ol_Overlay_Tooltip, ol_Overlay_Popup);

/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol_Overlay_Tooltip.prototype.setMap = function (map) {
  if (this.getMap()) this.getMap().removeInteraction(this._interaction);
  ol_Overlay_Popup.prototype.setMap.call(this, map);
  if (this.getMap()) this.getMap().addInteraction(this._interaction);
};

/** Show the popup. If a feature has been passed to the 
 * Tooltip the area/length will be added to the Tooltip
 * @param {ol.Coordinate|string} coordinate the coordinate of the popup or the HTML content.
 * @param {string|undefined} html the HTML content (undefined = previous content).
 */
ol_Overlay_Tooltip.prototype.show = function(coord, html) {
  // Add measure
  if (this.get('measure')) html = this.get('measure') +'<br/>'+ html;
  // Show popup
  ol_Overlay_Popup.prototype.show.call(this, coord, html);
};

/** Set the Tooltip info
 * If information is not null it will be set with a delay,
 * thus watever the information is inserted, the significant information will be set.
 * ie. ttip.setInformation('ok'); ttip.setInformation(null); will set 'ok' 
 * ttip.set('info,'ok'); ttip.set('info', null); will set null
 * @param {string} what The information to display in the tooltip, default remove information
 */
ol_Overlay_Tooltip.prototype.setInfo = function(what) {
  if (!what) {
    this.set('info','');
    this.hide();
  }
  else setTimeout(function() { 
    this.set('info', what); 
    this.show(this._coord, this.get('info'));
  }.bind(this));
};

/** Set a feature associated with the tooltips
 * @param {ol.Feature} feature
 */
ol_Overlay_Tooltip.prototype.setFeature = function(feature) {
  this._feature = feature;
  if (this._listener) {
    this._listener.forEach(function(l) {
      ol_Observable_unByKey(l);
    });
  }
  this._listener = [];
  this.set('measure', '');
  if (feature) {
    this._listener.push(feature.getGeometry().on('change', function(e){ 
      var geom = e.target;
      var measure;
      if (geom.getArea) {
        var area = ol_sphere_getArea(geom, { projection: this.getMap().getView().getProjection() });
        area = Math.round(area*100) / 100;
        if (area) {
          if (area>10000) {
            area = (area/1000000).toLocaleString(undefined, {maximumFractionDigits:2}) + ' km²';
          } else {
            area = area.toLocaleString(undefined, {maximumFractionDigits:2}) + ' m²';
          }
        }
        measure = area;
      } else if (geom.getLength) {
        var length = ol_sphere_getLength(geom, { projection: this.getMap().getView().getProjection() });
        length = Math.round(length*100) / 100;
        if (length) {
          if (length>100) {
            length = (length/1000).toLocaleString(undefined, {maximumFractionDigits:2}) + ' km';
          } else {
            length = length.toLocaleString(undefined, {maximumFractionDigits:2}) + ' m';
          }
        }
        measure = length;
      }
      this.set('measure', measure);
    }.bind(this)));
  }
};

export default ol_Overlay_Tooltip