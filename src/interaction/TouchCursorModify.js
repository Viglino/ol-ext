/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_TouchCursor from './TouchCursor'

/** TouchCursor interaction + ModifyFeature
 * @constructor
 * @extends {ol_interaction_DragOverlay}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {ol.source.Vector} source a source to modify
 *  @param {ol.source.Vector|Array<ol.source.Vector} sources a list of sources to modify
 */
var ol_interaction_TouchCursorModify = function(options) {
  options = options || {};

  var drag = false;
  var dragging = false;
  var del = false;

  // Modify interaction
  var mod = this._modify = new ol.interaction.ModifyFeature ({ 
    source: options.source,
    sources: options.sources,
    condition: function(e) {
      return e.dragging || dragging;
    },
    deleteCondition: function(e) {
      return del;
    }
  });

  ol_interaction_TouchCursor.call(this, {
    coordinate: options.coordinate,
    buttons: [{ 
        className: 'ol-button-x', 
        on: { 
          pointerdown: function() { drag = true; },
          pointerup: function() { drag = false; }
        }
      }, { 
        className: 'ol-button-add', 
        click: function() { 
          dragging = true;
          mod.handleDownEvent(cursor._lastEvent);
          mod.handleUpEvent(cursor._lastEvent);
          dragging = false;
        }
      }, { 
        className: 'ol-button-remove', 
        click: function() { 
          del = true;
          mod.handleDownEvent(cursor._lastEvent); 
          del = false;
        }
      }
    ]
  });

  // Handle dragging
  this.on('dragstart', function(e) {
    if (drag) mod.handleDownEvent(e);
  });
  this.on('dragging', function(e) {
    if (drag) mod.handleDragEvent(e);
  });
  this.on('dragend', function(e) {
    mod.handleUpEvent(e);
    drag = false;
  });
};
ol_ext_inherits(ol_interaction_TouchCursorModify, ol_interaction_TouchCursor);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_interaction_TouchCursorModify.prototype.setMap = function(map) {
  if (this.getMap()) {
    this.getMap().removeInteraction(this._modify);
  }

  if (map) {
    map.addInteraction(this._modify);
  }

  ol_interaction_TouchCursor.prototype.setMap.call (this, map);
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @param {ol.coordinate|null} position position of the cursor (when activating), default viewport center.
 * @observable
 * @api
 */
ol_interaction_TouchCursorModify.prototype.setActive = function(b, position) {
  ol_interaction_TouchCursor.prototype.setActive.call (this, b);
  this._modify.setActive(b);
};

export default ol_interaction_TouchCursorModify
