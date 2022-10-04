import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_interaction_Interaction from 'ol/interaction/Interaction.js'
import ol_ext_element from '../util/element.js'

/** An interaction to focus on the map on click. Usefull when using keyboard event on the map.
 * @deprecated use ol/interaction/CurrentMap instead
 * @constructor
 * @fires focus
 * @extends {ol_interaction_Interaction}
 */
var ol_interaction_FocusMap = class olinteractionFocusMap extends ol_interaction_Interaction {
  constructor() {
    //
    super({});

    // Focus (hidden) button to focus on the map when click on it 
    this.focusBt = ol_ext_element.create('BUTTON', {
      on: {
        focus: function () {
          this.dispatchEvent({ type: 'focus' });
        }.bind(this)
      },
      style: {
        position: 'absolute',
        zIndex: -1,
        top: 0,
        opacity: 0
      }
    });
  }
  /** Set the map > add the focus button and focus on the map when pointerdown to enable keyboard events.
   */
  setMap(map) {
    if (this._listener) ol_Observable_unByKey(this._listener);
    this._listener = null;
    if (this.getMap()) { this.getMap().getViewport().removeChild(this.focusBt); }

    super.setMap(map);

    if (this.getMap()) {
      // Force focus on the clicked map
      this._listener = this.getMap().on('pointerdown', function () {
        if (this.getActive())
          this.focusBt.focus();
      }.bind(this));
      this.getMap().getViewport().appendChild(this.focusBt);
    }
  }
}

export default ol_interaction_FocusMap
