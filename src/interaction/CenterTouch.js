/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_interaction_Interaction from 'ol/interaction/Interaction.js'
import ol_control_Target from '../control/Target.js'

/** Handles coordinates on the center of the viewport.
 * It can be used as abstract base class used for creating subclasses. 
 * The CenterTouch interaction modifies map browser event coordinate and pixel properties to force pointer on the viewport center to any interaction that them.
 * Only pointermove pointerup are concerned with it.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {ol_style_Style|Array<ol_style_Style>} options.targetStyle a style to draw the target point, default cross style
 *  @param {string} options.composite composite operation for the target : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
var ol_interaction_CenterTouch = class olinteractionCenterTouch extends ol_interaction_Interaction {
  constructor(options) {
    options = options || {};

    super({
      handleEvent: function (e) {
        if (rex.test(e.type)) this.pos_ = e.coordinate;
        if (options.handleEvent) return options.handleEvent.call(this, e);
        return true;
      }
    });

    // List of listerner on the object
    this._listener = {};

    // Filter event
    var rex = /^pointermove$|^pointerup$/;

    // Interaction to defer center on top of the interaction 
    // this is done to enable other coordinates manipulation inserted after the interaction (snapping)
    this.ctouch = new ol_interaction_Interaction({
      handleEvent: function (e) {
        if (rex.test(e.type) && this.getMap()) {
          e.coordinate = this.getMap().getView().getCenter();
          e.pixel = this.getMap().getSize();
          e.pixel = [e.pixel[0] / 2, e.pixel[1] / 2];
        }
        return true;
      }
    });

    // Target on map center
    this._target = new ol_control_Target({
      style: options.targetStyle,
      composite: options.composite
    });
  }
  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {_ol_Map_} map Map.
   * @api stable
   */
  setMap(map) {
    if (this.getMap()) {
      this.getMap().removeInteraction(this.ctouch);
      this.getMap().removeInteraction(this._target);
    }

    super.setMap(map);

    if (this.getMap()) {
      if (this.getActive()) {
        this.getMap().addInteraction(this.ctouch);
        this.getMap().addControl(this._target);
      }
    }
  }
  /**
   * Activate or deactivate the interaction.
   * @param {boolean} active Active.
   * @observable
   * @api
   */
  setActive(b) {
    super.setActive(b);

    this.pos_ = null;

    if (this.getMap()) {
      if (this.getActive()) {
        this.getMap().addInteraction(this.ctouch);
        this.getMap().addControl(this._target);
      } else {
        this.getMap().removeInteraction(this.ctouch);
        this.getMap().removeControl(this._target);
      }
    }

  }
  /** Get the position of the target
   * @return {ol.coordinate}
   */
  getPosition() {
    if (!this.pos_) {
      var px = this.getMap().getSize();
      px = [px[0] / 2, px[1] / 2];
      this.pos_ = this.getMap().getCoordinateFromPixel(px);
    }
    return this.pos_;
  }
}

export default ol_interaction_CenterTouch
