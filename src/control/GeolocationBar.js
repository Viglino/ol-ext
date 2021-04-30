/*	Copyright (c) 2016 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_control_Bar from './Bar'
import ol_control_Toggle from './Toggle'
import ol_control_Button from './Button'
import ol_control_TextButton from './TextButton'
import ol_interaction_GeolocationDraw from '../interaction/GeolocationDraw'


/** Geolocation bar
 * The control bar is a container for other controls. It can be used to create toolbars.
 * Control bars can be nested and combined with ol.control.Toggle to handle activate/deactivate.
 *
 * @constructor
 * @extends {ol_control_Bar}
 * @param {Object=} options Control bar options.
 *  @param {String} options.className class of the control
 *  @param {String} options.centerLabel label for center button, default center
 *  @param {String} options.position position of the control, default bottom-right
 */
var ol_control_GeolocationBar = function(options) {
  if (!options) options = {};

  options.className = options.className || 'ol-geobar';
  ol_control_Bar.call(this, options);
  this.setPosition(options.position || 'bottom-right');

  var element = this.element;

  // Geolocation draw interaction
  var interaction = new ol_interaction_GeolocationDraw({
    source: options.source,
    zoom: options.zoom,
    minZoom: options.minZoom,
    tolerance: options.tolerance,
    followTrack: options.followTrack,
    minAccuracy: options.minAccuracy || 10000
  });
  this._geolocBt = new ol_control_Toggle ({
    className: 'geolocBt',
    interaction: interaction,
    onToggle: function() {
      interaction.pause(true);
      interaction.setFollowTrack(options.followTrack);
      element.classList.remove('pauseTrack');
    }
  });
  this.addControl(this._geolocBt);
  this._geolocBt.setActive(false);

  // Buttons
  var bar = new ol_control_Bar();
  this.addControl(bar);

  var centerBt = new ol_control_TextButton ({
    className: 'centerBt',
    html: options.centerLabel ||'center',
    handleClick: function() {
      interaction.setFollowTrack('auto');
    }
  });
  bar.addControl(centerBt);
  var startBt = new ol_control_Button ({
    className: 'startBt',
    handleClick: function(){
      interaction.pause(false);
      interaction.setFollowTrack('auto');
      element.classList.add('pauseTrack');
    }
  });
  bar.addControl(startBt);
  var pauseBt = new ol_control_Button ({
    className: 'pauseBt',
    handleClick: function(){
      interaction.pause(true);
      interaction.setFollowTrack('auto');
      element.classList.remove('pauseTrack');
    }
  });
  bar.addControl(pauseBt);

  interaction.on('follow', function(e) {
    if (e.following) {
      element.classList.remove('centerTrack');
    } else {
      element.classList.add('centerTrack');
    }
  });

  // Activate
  this._geolocBt.on('change:active', function(e) {
    if (e.active) {
      element.classList.add('ol-active');
    } else {
      element.classList.remove('ol-active');
    }
  });
};
ol_ext_inherits(ol_control_GeolocationBar, ol_control_Bar);

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_control_GeolocationBar.prototype.setMap = function (map) {
  if (this._listener) ol_Observable_unByKey(this._listener);
  this._listener = null;
  
  ol_control_Bar.prototype.setMap.call(this, map);

  // Get change (new layer added or removed)
  if (map) {
    this._listener = map.on('moveend', function() {
      var geo = this.getInteraction();
      if (geo.getActive() && geo.get('followTrack') === 'auto' && geo.path_.length) {
        if (geo.path_[geo.path_.length-1][0] !== map.getView().getCenter()[0]) {
          this.element.classList.add('centerTrack');
        }
      }
    }.bind(this));
  }
};

/** Get the ol.interaction.GeolocationDraw associatedwith the bar
 * @return {ol.interaction.GeolocationDraw}
 */
ol_control_GeolocationBar.prototype.getInteraction = function () {
  return this._geolocBt.getInteraction();
};

export default ol_control_GeolocationBar
