import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_interaction_Interaction from 'ol/interaction/Interaction'
import ol_ext_element from '../util/element'

/** An interaction to focus on the map on click. Usefull when using keyboard event on the map.
 * @constructor
 * @fires focus
 * @extends {ol_interaction_Interaction}
 */
var ol_interaction_FocusMap = function() {
  //
  ol_interaction_Interaction.call(this, {});

  // Focus (hidden) button to focus on the map when click on it 
  this.focusBt = ol_ext_element.create('BUTTON', {
    on: {
      focus: function() {
        this.dispatchEvent({ type:'focus' });
      }.bind(this)
    },
    style: {
      position: 'absolute',
      zIndex: -1,
      top: 0,
      opacity: 0
    }
  });
};
ol_ext_inherits(ol_interaction_FocusMap, ol_interaction_Interaction);

/** Set the map > add the focus button and focus on the map when pointerdown to enable keyboard events.
 */
ol_interaction_FocusMap.prototype.setMap = function(map) {
  if (this._listener) ol_Observable_unByKey(this._listener);
  this._listener = null;
  if (this.getMap()) { this.getMap().getViewport().removeChild(this.focusBt); }

  ol_interaction_Interaction.prototype.setMap.call (this, map);

  if (this.getMap()) {
    // Force focus on the clicked map
    this._listener = this.getMap().on('pointerdown', function() {
      if (this.getActive()) this.focusBt.focus();
    }.bind(this));
    this.getMap().getViewport().appendChild(this.focusBt); 
  }
};

export default ol_interaction_FocusMap
