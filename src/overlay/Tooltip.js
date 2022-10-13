/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_interaction_Interaction from 'ol/interaction/Interaction.js'
import {getArea as ol_sphere_getArea} from 'ol/sphere.js';
import {getLength as ol_sphere_getLength} from 'ol/sphere.js';
import ol_Overlay_Popup from './Popup.js'

/** A tooltip element to be displayed over the map and attached on the cursor position.
 * @constructor
 * @extends {ol_Overlay_Popup}
 * @param {} options Extend Popup options 
 *	@param {String} options.popupClass the a class of the overlay to style the popup.
 *  @param {number} options.maximumFractionDigits maximum digits to display on measure, default 2
 *  @param {function} options.formatLength a function that takes a number and returns the formated value, default length in meter
 *  @param {function} options.formatArea a function that takes a number and returns the formated value, default length in square-meter
 *  @param {function} options.getHTML a function that takes a feature and the info string and return a formated info to display in the tooltip, default display feature measure & info
 *	@param {Number|Array<number>} options.offsetBox an offset box
 *	@param {ol.OverlayPositioning | string | undefined} options.positionning 
 *		the 'auto' positioning var the popup choose its positioning to stay on the map.
 * @api stable
 */
var ol_Overlay_Tooltip = class olOverlayTooltip extends ol_Overlay_Popup {
  constructor(options) {
    options = options || {};

    options.popupClass = options.popupClass || options.className || 'tooltips black';
    options.positioning = options.positioning || 'center-left';
    options.stopEvent = !!(options.stopEvent);
    super(options);

    this.set('maximumFractionDigits', options.maximumFractionDigits || 2);
    if (typeof (options.formatLength) === 'function') this.formatLength = options.formatLength;
    if (typeof (options.formatArea) === 'function') this.formatArea = options.formatArea;
    if (typeof (options.getHTML) === 'function') this.getHTML = options.getHTML;

    this._interaction = new ol_interaction_Interaction({
      handleEvent: function (e) {
        if (e.type === 'pointermove' || e.type === 'click') {
          var info = this.getHTML(this._feature, this.get('info'));
          if (info) {
            this.show(e.coordinate, info);
          }
          else
            this.hide();
          this._coord = e.coordinate;
        }
        return true;
      }.bind(this)
    });
  }
  /**
   * Set the map instance the control is associated with
   * and add its controls associated to this map.
   * @param {_ol_Map_} map The map instance.
   */
  setMap(map) {
    if (this.getMap()) this.getMap().removeInteraction(this._interaction);
    super.setMap(map);
    if (this.getMap()) this.getMap().addInteraction(this._interaction);
  }
  /** Get the information to show in the tooltip
   * The area/length will be added if a feature is attached.
   * @param {ol.Feature|undefined} feature the feature
   * @param {string} info the info string
   * @api
   */
  getHTML(feature, info) {
    if (this.get('measure'))
      return this.get('measure') + (info ? '<br/>' + info : '');
    else
      return info || '';
  }
  /** Set the Tooltip info
   * If information is not null it will be set with a delay,
   * thus watever the information is inserted, the significant information will be set.
   * ie. ttip.setInformation('ok'); ttip.setInformation(null); will set 'ok'
   * ttip.set('info','ok'); ttip.set('info', null); will set null
   * @param {string} what The information to display in the tooltip, default remove information
   */
  setInfo(what) {
    if (!what) {
      this.set('info', '');
      this.hide();
    }
    else
      setTimeout(function () {
        this.set('info', what);
        this.show(this._coord, this.get('info'));
      }.bind(this));
  }
  /** Remove the current featue attached to the tip
   * Similar to setFeature() with no argument
   */
  removeFeature() {
    this.setFeature();
  }
  /** Format area to display in the popup.
   * Can be overwritten to display measure in a different unit (default: square-metter).
   * @param {number} area area in m2
   * @return {string} the formated area
   * @api
   */
  formatArea(area) {
    if (area > Math.pow(10, -1 * this.get('maximumFractionDigits'))) {
      if (area > 10000) {
        return (area / 1000000).toLocaleString(undefined, { maximumFractionDigits: this.get('maximumFractionDigits)') }) + ' km²';
      } else {
        return area.toLocaleString(undefined, { maximumFractionDigits: this.get('maximumFractionDigits') }) + ' m²';
      }
    } else {
      return '';
    }
  }
  /** Format area to display in the popup
   * Can be overwritten to display measure in different unit (default: meter).
   * @param {number} length length in m
   * @return {string} the formated length
   * @api
   */
  formatLength(length) {
    if (length > Math.pow(10, -1 * this.get('maximumFractionDigits'))) {
      if (length > 100) {
        return (length / 1000).toLocaleString(undefined, { maximumFractionDigits: this.get('maximumFractionDigits') }) + ' km';
      } else {
        return length.toLocaleString(undefined, { maximumFractionDigits: this.get('maximumFractionDigits') }) + ' m';
      }
    } else {
      return '';
    }
  }
  /** Set a feature associated with the tooltips, measure info on the feature will be added in the tooltip
   * @param {ol.Feature|ol.Event} feature an ol.Feature or an event (object) with a feature property
   */
  setFeature(feature) {
    // Handle event with a feature as property.
    if (feature && feature.feature)
      feature = feature.feature;
    // The feature
    this._feature = feature;
    if (this._listener) {
      this._listener.forEach(function (l) {
        ol_Observable_unByKey(l);
      });
    }
    this._listener = [];
    this.set('measure', '');
    if (feature) {
      this._listener.push(feature.getGeometry().on('change', function (e) {
        var geom = e.target;
        var measure;
        if (geom.getArea) {
          measure = this.formatArea(ol_sphere_getArea(geom, { projection: this.getMap().getView().getProjection() }));
        } else if (geom.getLength) {
          measure = this.formatLength(ol_sphere_getLength(geom, { projection: this.getMap().getView().getProjection() }));
        }
        this.set('measure', measure);
      }.bind(this)));
    }
  }
}

export default ol_Overlay_Tooltip
