import ol_interaction_Interaction from 'ol/interaction/Interaction.js'

/** An interaction to check the current map and add key events listeners.
 * It will fire a 'focus' event on the map when map is focused (use mapCondition option to handle the condition when the map is focused).
 * @constructor
 * @fires focus
 * @param {*} options
 *  @param {function} condition a function that takes a mapBrowserEvent and returns true if the map must be activated, default always true
 *  @param {function} onKeyDown a function that takes a keydown event is fired on the active map
 *  @param {function} onKeyPress a function that takes a keypress event is fired on the active map
 *  @param {function} onKeyUp a function that takes a keyup event is fired on the active map
 * @extends {ol_interaction_Interaction}
 */
var ol_interaction_CurrentMap = class olinteractionCurrentMap extends ol_interaction_Interaction {
  constructor(options) {
    options = options || {};

    var condition = options.condition || function () {
      return true;
    };
    // Check events on the map
    super({
      handleEvent: function (e) {
        if (condition(e)) {
          if (!this.isCurrentMap()) {
            this.setCurrentMap(this.getMap());
            this.dispatchEvent({ type: 'focus', map: this.getMap() });
            this.getMap().dispatchEvent({ type: 'focus', map: this.getMap() });
          }
        }
        return true;
      }
    });

    // Add a key listener
    if (options.onKeyDown) {
      document.addEventListener('keydown', function (e) {
        if (this.isCurrentMap() && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
          options.onKeyDown({ type: e.type, map: this.getMap(), originalEvent: e });
        }
      }.bind(this));
    }
    if (options.onKeyPress) {
      document.addEventListener('keydown', function (e) {
        if (this.isCurrentMap() && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
          options.onKeyPress({ type: e.type, map: this.getMap(), originalEvent: e });
        }
      }.bind(this));
    }
    if (options.onKeyUp) {
      document.addEventListener('keydown', function (e) {
        if (this.isCurrentMap() && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
          options.onKeyUp({ type: e.type, map: this.getMap(), originalEvent: e });
        }
      }.bind(this));
    }
  }
  /** Check if is the current map
   * @return {boolean}
   */
  isCurrentMap() {
    return this.getMap() === ol_interaction_CurrentMap.prototype._currentMap;
  }
  /** Get the current map
   * @return {ol.Map}
   */
  getCurrentMap() {
    return ol_interaction_CurrentMap.prototype._currentMap;
  }
  /** Set the current map
   * @param {ol.Map} map
   */
  setCurrentMap(map) {
    ol_interaction_CurrentMap.prototype._currentMap = map;
  }
}

/** The current map */
ol_interaction_CurrentMap.prototype._currentMap = undefined;

export default ol_interaction_CurrentMap
