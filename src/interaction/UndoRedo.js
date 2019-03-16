import ol_ext_inherits from '../util/ext'
import ol_interaction_Interaction from 'ol/interaction/Interaction'
import ol_layer_Vector from 'ol/layer/Vector'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import '../source/Vector' 

/** Undo/redo interaction
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires undo
 * @fires redo
 * @param {*} options
 */
var ol_interaction_UndoRedo = function(options) {
  if (!options) options = {};

	ol_interaction_Interaction.call(this, {	
    handleEvent: function() { 
      return true; 
    }
  });

  this._undoStack = [];
  this._redoStack = [];
  // Block counter
  this._block = 0;
  // Start recording
  this._record = true;
  // Custom definitions
  this._defs = {};
};
ol_ext_inherits(ol_interaction_UndoRedo, ol_interaction_Interaction);

/** Add a custom undo/redo
 * @param {string} action the action key name
 * @param {function} undoFn function called when undoing
 * @param {function} redoFn function called when redoing
 * @api
 */
ol_interaction_UndoRedo.prototype.define = function(action, undoFn, redoFn) {
  this._defs['_'+action] = { undo: undoFn, redo: redoFn };
};

/** Set a custom undo/redo
 * @param {string} action the action key name
 * @param {any} prop an object that will be passed in the undo/redo fucntions of the action
 * @return {boolean} true if the action is defined
 */
ol_interaction_UndoRedo.prototype.push = function(action, prop) {
  if (this._defs['_'+action]) {
    this._undoStack.push({type: '_'+action, prop: prop });
    return true;
  } else {
    return false;
  }
};

/** Activate or deactivate the interaction, ie. records or not events on the map.
 * @param {boolean} active
 * @api stable
 */
ol_interaction_UndoRedo.prototype.setActive = function(active) {
  ol_interaction_Interaction.prototype.setActive.call (this, active);
  this._record = active;
};

/**
 * Remove the interaction from its current map, if any, and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_UndoRedo.prototype.setMap = function(map) {
  ol_interaction_Interaction.prototype.setMap.call (this, map);
  // Watch sources
  this._watchSources();
  this._watchInteractions();
};

/** Watch for changes in the map sources
 * @private
 */
ol_interaction_UndoRedo.prototype._watchSources = function() {
  var map = this.getMap();
  // Clear listeners
  if (this._sourceListener) {
    this._sourceListener.forEach(function(l) { ol_Observable_unByKey(l); })
  }
  this._sourceListener = [];

  // Ges vector layers 
  function getVectorLayers(layers, init) {
    if (!init) init = [];
    layers.forEach(function(l) {
      if (l instanceof ol_layer_Vector) {
        init.push(l);
      } else if (l.getLayers) {
        getVectorLayers(l.getLayers(), init);
      }
    });
    return init;
  }

  if (map) {
    // Watch the vector sources in the map 
    var vectors = getVectorLayers(map.getLayers());
    vectors.forEach((function(l) {
      var s = l.getSource();
      this._sourceListener.push( s.on(['addfeature', 'removefeature'], this._onAddRemove.bind(this)) );
      this._sourceListener.push( s.on('clearstart', this.blockStart.bind(this)) );
      this._sourceListener.push( s.on('clearend', this.blockEnd.bind(this)) );
    }).bind(this));

    // Watch new inserted/removed
    this._sourceListener.push( map.getLayers().on(['add', 'remove'], this._watchSources.bind(this) ) );
  }
};

/** Watch for interactions
 * @private
 */
ol_interaction_UndoRedo.prototype._watchInteractions = function() {
  var map = this.getMap();
  // Clear listeners
  if (this._interactionListener) {
    this._interactionListener.forEach(function(l) { ol_Observable_unByKey(l); })
  }
  this._interactionListener = [];

  if (map) {
    // Watch the interactions in the map 
    map.getInteractions().forEach((function(i) {
      this._interactionListener.push(i.on(
        ['setattributestart', 'modifystart', 'rotatestart', 'translatestart', 'scalestart', 'deletestart', 'deleteend', 'beforesplit', 'aftersplit'], 
        this._onInteraction.bind(this)
      ));
    }).bind(this));

    // Watch new inserted / unwatch removed
    this._interactionListener.push( map.getInteractions().on(
      ['add', 'remove'], 
      this._watchInteractions.bind(this)
    ));
  }
};

/** A feature is added / removed
 */
ol_interaction_UndoRedo.prototype._onAddRemove = function(e) {
  if (this._record) {
    this._undoStack.push({type: e.type, source: e.target, feature: e.feature });
    this._redoStack = [];
  }
};

ol_interaction_UndoRedo.prototype._onInteraction = function(e) {
  var fn = this._onInteraction[e.type];
  if (fn) fn.call(this,e);
};

/** Set attribute
 * @private
 */
ol_interaction_UndoRedo.prototype._onInteraction.setattributestart = function(e) {
  this.blockStart();
  var newp = Object.assign({}, e.properties);
  e.features.forEach(function(f) {
    var oldp = {};
    for (var p in newp) {
      oldp[p] = f.get(p);
    }
    this._undoStack.push({
      type: 'changeattribute', 
      feature: f, 
      newProperties: newp,
      oldProperties: oldp
    });
  }.bind(this));
  this.blockEnd();
};

ol_interaction_UndoRedo.prototype._onInteraction.rotatestart = 
ol_interaction_UndoRedo.prototype._onInteraction.translatestart = 
ol_interaction_UndoRedo.prototype._onInteraction.scalestart = 
ol_interaction_UndoRedo.prototype._onInteraction.modifystart = function (e) {
  this.blockStart();
  e.features.forEach(function(m) {
    this._undoStack.push({type: 'changefeature', feature: m, oldFeature: m.clone()  });
  }.bind(this));
  this.blockEnd();
};

/** Start an undo block
 * @api
 */
ol_interaction_UndoRedo.prototype.blockStart = function () {
  this._undoStack.push({ type: 'blockstart' });
  this._redoStack = [];
};

/** @private
 */
ol_interaction_UndoRedo.prototype._onInteraction.beforesplit =
ol_interaction_UndoRedo.prototype._onInteraction.deletestart =
ol_interaction_UndoRedo.prototype.blockStart;

/** End an undo block
 * @api
 */
ol_interaction_UndoRedo.prototype.blockEnd = function () {
  this._undoStack.push({ type: 'blockend' });
};

/** @private
 */
ol_interaction_UndoRedo.prototype._onInteraction.aftersplit =
ol_interaction_UndoRedo.prototype._onInteraction.deleteend =
ol_interaction_UndoRedo.prototype.blockEnd;

/** handle undo/redo
 * @private
 */
ol_interaction_UndoRedo.prototype._handleDo = function(e, undo) {
  // Not active
  if (!this.getActive()) return;

  // Stop recording while undoing
  this._record = false;
  switch (e.type) {
    case 'addfeature': {
      if (undo) e.source.removeFeature(e.feature);
      else e.source.addFeature(e.feature);
      break;
    }
    case 'removefeature': {
      if (undo) e.source.addFeature(e.feature);
      else e.source.removeFeature(e.feature);
      break;
    }
    case 'changefeature': {
      var geom = e.feature.getGeometry();
      e.feature.setGeometry(e.oldFeature.getGeometry());
      e.oldFeature.setGeometry(geom);
      break;
    }
    case 'changeattribute': {
      var newp = e.newProperties;
      var oldp = e.oldProperties;
      for (var p in oldp) {
        if (oldp === undefined) e.feature.unset(p);
        else e.feature.set(p, oldp[p]);
      }
      e.oldProperties = newp;
      e.newProperties = oldp;
      break;
    }
    case 'blockstart': {
      this._block += undo ? -1 : 1;
      break;
    }
    case 'blockend': {
      this._block += undo ? 1 : -1;
      break;
    }
    default: {
      if (this._defs[e.type]) {
        if (undo) this._defs[e.type].undo(e.prop);
        else this._defs[e.type].redo(e.prop);
      } else {
        console.warn('[UndoRedoInteraction]: "'+e.type.substr(1)+'" is not defined.');
      }
    }
  }

  // Handle block
  if (this._block<0) this._block = 0;
  if (this._block) {
    if (undo) this.undo();
    else this.redo();
  }
  this._record = true;

  // Dispatch event
  this.dispatchEvent( { 
    type: undo ? 'undo' : 'redo',
    action: e
  });
};

/** Undo last operation
 * @api
 */
ol_interaction_UndoRedo.prototype.undo = function() {
  var e = this._undoStack.pop();
  if (!e) return;
  this._redoStack.push(e);
  this._handleDo(e, true);
};

/** Redo last operation
 * @api
 */
ol_interaction_UndoRedo.prototype.redo = function() {
  var e = this._redoStack.pop();
  if (!e) return;
  this._undoStack.push(e);
  this._handleDo(e, false);
};

/** Clear undo stack
 * @api
 */
ol_interaction_UndoRedo.prototype.clear = function() {
  this._undoStack = [];
  this._redoStack = [];
};

/** Check if undo is avaliable
 * @return {number} the number of undo 
 * @api
 */
ol_interaction_UndoRedo.prototype.hasUndo = function() {
  return this._undoStack.length;
};

/** Check if redo is avaliable
 * @return {number} the number of redo
 * @api
 */
ol_interaction_UndoRedo.prototype.hasRedo = function() {
  return this._redoStack.length;
};

export default ol_interaction_UndoRedo
