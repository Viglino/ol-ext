/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_style_Style_defaultStyle from '../style/defaultStyle.js'
import ol_interaction_TouchCursor from './TouchCursor.js'

/** A TouchCursor to select objects on hovering the cursor
 * @constructor
 * @extends {ol_interaction_DragOverlay}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {string} options.className cursor class name
 *  @param {ol.coordinate} options.coordinate position of the cursor
 */
var ol_interaction_TouchCursorSelect = class olinteractionTouchCursorSelect extends ol_interaction_TouchCursor {
  constructor(options) {
    options = options || {};

    super({
      className: 'ol-select ' + (options.className || ''),
      coordinate: options.coordinate
    });

    this._selection = null;
    this._layerFilter = options.layerFilter;
    this._filter = options.filter;
    this._style = options.style || ol_style_Style_defaultStyle(true);
    this.set('hitTolerance', options.hitTolerance || 0);

    this.on(['change:active', 'dragging'], function () { this.select(); });
  }
  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {_ol_Map_} map Map.
   * @api stable
   */
  setMap(map) {
    super.setMap(map);

    if (map) {
      // Select on move end
      this._listeners.movend = map.on('moveend', function () {
        this.select();
      }.bind(this));
    }
  }
  /** Get current selection
   * @return {ol.Feature|null}
   */
  getSelection() {
    return this._selection ? this._selection.feature : null;
  }
  /** Set position
   * @param {ol.coordinate} coord
   */
  setPosition(coord) {
    super.setPosition(coord);
    this.select();
  }
  /** Select feature
   * @param {ol.Feature|undefined} f a feature to select or select at the cursor position
   */
  select(f) {
    var current = this._selection;
    if (this.getActive() && this.getPosition()) {
      if (!f) {
        var sel = this.getMap().getFeaturesAtPixel(this.getPixel(), {
          layerFilter: this._layerFilter,
          filter: this._filter,
          hitTolerance: this.get('hitTolerance')
        });
        f = sel ? sel[0] : null;
      }
      if (f) {
        if (current && f === current.feature) {
          current = null;
        } else {
          this._selection = {
            feature: f,
            style: f.getStyle()
          };
          f.setStyle(this._style);
          this.dispatchEvent({ type: 'select', selected: [f], deselected: current ? [current.feature] : [] });
        }
      } else {
        this._selection = null;
        this.dispatchEvent({ type: 'select', selected: [], deselected: current ? [current.feature] : [] });
      }
    } else {
      this._selection = null;
      this.dispatchEvent({ type: 'select', selected: [], deselected: current ? [current.feature] : [] });
    }
    // Restore current style
    if (current) {
      current.feature.setStyle(current.style);
    }
    // 
    if (this._selection)
      this.getOverlayElement().classList.remove('disable');
    else
      this.getOverlayElement().classList.add('disable');
  }
}

export default ol_interaction_TouchCursorSelect
