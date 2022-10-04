/*	Copyright (c) 2016 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_control_Toggle from './Toggle.js'
import ol_interaction_GeolocationDraw from '../interaction/GeolocationDraw.js'

/** Geolocation bar
 * The control bar is a container for other controls. It can be used to create toolbars.
 * Control bars can be nested and combined with ol.control.Toggle to handle activate/deactivate.
 *
 * @constructor
 * @fires tracking
 * @extends {ol_control_Toggle}
 * @param {Object=} options ol.interaction.GeolocationDraw option.
 *  @param {String} options.className class of the control
 *  @param {String} options.title title of the control to display as tooltip, default Geolocation
 *  @param {number} options.delay delay before removing the location in ms, delfaut 3000 (3s)
 */
var ol_control_GeolocationButton = class olcontrolGeolocationButton extends ol_control_Toggle {
  constructor(options) {
    options = options || {};
    // Geolocation draw interaction
    options.followTrack = options.followTrack || 'auto';
    options.zoom = options.zoom || 16;
    //options.minZoom = options.minZoom || 16;
    var interaction = new ol_interaction_GeolocationDraw(options);

    super({
      className: options.className = ((options.className || '') + ' ol-geobt').trim(),
      interaction: interaction,
      title: options.title || 'Geolocation',
      onToggle: function () {
        interaction.pause(true);
        interaction.setFollowTrack(options.followTrack || 'auto');
      }
    });
    this.setActive(false);

    interaction.on('tracking', function (e) {
      this.dispatchEvent({ type: 'position', coordinate: e.geolocation.getPosition() });
    }.bind(this));


    // Timeout delay
    var tout;
    interaction.on('change:active', function () {
      this.dispatchEvent({ type: 'position' });
      if (tout) {
        clearTimeout(tout);
        tout = null;
      }
      if (interaction.getActive()) {
        tout = setTimeout(function () {
          interaction.setActive(false);
          tout = null;
        }.bind(this), options.delay || 3000);
      }
    }.bind(this));

  }
}

export default ol_control_GeolocationButton
