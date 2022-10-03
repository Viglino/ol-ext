import ol_Collection from 'ol/Collection.js'
import ol_interaction_Interaction from 'ol/interaction/Interaction.js'
import ol_layer_Vector from 'ol/layer/Vector.js'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import '../source/Vector.js'

/** Undo/redo interaction
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires undo
 * @fires redo
 * @fires change:add
 * @fires change:remove
 * @fires change:clear
 * @param {Object} options
 *  @param {number=} options.maxLength max undo stack length (0=Infinity), default Infinity
 *  @param {Array<ol.Layer>} options.layers array of layers to undo/redo
 */
var ol_interaction_UndoRedo = class olinteractionUndoRedo extends ol_interaction_Interaction {
  constructor(options) {
    options = options || {}

    super({
      handleEvent: function () {
        return true
      }
    })

    //array of layers to undo/redo
    this._layers = options.layers

    this._undoStack = new ol_Collection()
    this._redoStack = new ol_Collection()
    // Zero level stack
    this._undo = []
    this._redo = []
    this._undoStack.on('add', function (e) {
      if (e.element.level === undefined) {
        e.element.level = this._level
        if (!e.element.level) {
          e.element.view = {
            center: this.getMap().getView().getCenter(),
            zoom: this.getMap().getView().getZoom()
          }
          this._undo.push(e.element)
        }
      } else {
        if (!e.element.level)
          this._undo.push(this._redo.shift())
      }
      if (!e.element.level) {
        this.dispatchEvent({
          type: 'stack:add',
          action: e.element
        })
      }
      this._reduce()
    }.bind(this))
    this._undoStack.on('remove', function (e) {
      if (!e.element.level) {
        if (this._doShift) {
          this._undo.shift()
        } else {
          if (this._undo.length)
            this._redo.push(this._undo.pop())
        }
        if (!this._doClear) {
          this.dispatchEvent({
            type: 'stack:remove',
            action: e.element,
            shift: this._doShift
          })
        }
      }
    }.bind(this))
    // Block counter
    this._block = 0
    this._level = 0
    // Shift an undo action ?
    this._doShift = false
    // Start recording
    this._record = true
    // Custom definitions
    this._defs = {}
  }
  /** Add a custom undo/redo
   * @param {string} action the action key name
   * @param {function} undoFn function called when undoing
   * @param {function} redoFn function called when redoing
   * @api
   */
  define(action, undoFn, redoFn) {
    this._defs[action] = { undo: undoFn, redo: redoFn }
  }
  /** Get first level undo / redo length
   * @param {string} [type] get redo stack length, default get undo
   * @return {number}
   */
  length(type) {
    return (type === 'redo') ? this._redo.length : this._undo.length
  }
  /** Set undo stack max length
   * @param {number} length
   */
  setMaxLength(length) {
    length = parseInt(length)
    if (length && length < 0)
      length = 0
    this.set('maxLength', length)
    this._reduce()
  }
  /** Get undo / redo size (includes all block levels)
   * @param {string} [type] get redo stack length, default get undo
   * @return {number}
   */
  size(type) {
    return (type === 'redo') ? this._redoStack.getLength() : this._undoStack.getLength()
  }
  /** Set undo stack max size
   * @param {number} size
   */
  setMaxSize(size) {
    size = parseInt(size)
    if (size && size < 0)
      size = 0
    this.set('maxSize', size)
    this._reduce()
  }
  /** Reduce stack: shift undo to set size
   * @private
   */
  _reduce() {
    if (this.get('maxLength')) {
      while (this.length() > this.get('maxLength')) {
        this.shift()
      }
    }
    if (this.get('maxSize')) {
      while (this.length() > 1 && this.size() > this.get('maxSize')) {
        this.shift()
      }
    }
  }
  /** Get first level undo / redo first level stack
   * @param {string} [type] get redo stack, default get undo
   * @return {Array<*>}
   */
  getStack(type) {
    return (type === 'redo') ? this._redo : this._undo
  }
  /** Add a new custom undo/redo
   * @param {string} action the action key name
   * @param {any} prop an object that will be passed in the undo/redo functions of the action
   * @param {string} name action name
   * @return {boolean} true if the action is defined
   */
  push(action, prop, name) {
    if (this._defs[action]) {
      this._undoStack.push({
        type: action,
        name: name,
        custom: true,
        prop: prop
      })
      return true
    } else {
      console.warn('[UndoRedoInteraction]: "' + action + '" is not defined.')
      return false
    }
  }
  /** Remove undo action from the beginning of the stack.
   * The action is not returned.
   */
  shift() {
    this._doShift = true
    var a = this._undoStack.removeAt(0)
    this._doShift = false
    // Remove all block
    if (a.type === 'blockstart') {
      a = this._undoStack.item(0)
      while (this._undoStack.getLength() && a.level > 0) {
        this._undoStack.removeAt(0)
        a = this._undoStack.item(0)
      }
    }
  }
  /** Activate or deactivate the interaction, ie. records or not events on the map.
   * @param {boolean} active
   * @api stable
   */
  setActive(active) {
    super.setActive(active)
    this._record = active
  }
  /**
   * Remove the interaction from its current map, if any, and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {ol.Map} map Map.
   * @api stable
   */
  setMap(map) {
    if (this._mapListener) {
      this._mapListener.forEach(function (l) { ol_Observable_unByKey(l) })
    }
    this._mapListener = []
    super.setMap(map)
    // Watch blocks
    if (map) {
      this._mapListener.push(map.on('undoblockstart', this.blockStart.bind(this)))
      this._mapListener.push(map.on('undoblockend', this.blockEnd.bind(this)))
    }
    // Watch sources
    this._watchSources()
    this._watchInteractions()
  }
  /** Watch for changes in the map sources
   * @private
   */
  _watchSources() {
    var map = this.getMap()
    // Clear listeners
    if (this._sourceListener) {
      this._sourceListener.forEach(function (l) { ol_Observable_unByKey(l) })
    }
    this._sourceListener = []

    var self = this

    // Ges vector layers 
    function getVectorLayers(layers, init) {
      if (!init)
        init = []
      layers.forEach(function (l) {
        if (l instanceof ol_layer_Vector) {
          if (!self._layers || self._layers.indexOf(l) >= 0) {
            init.push(l)
          }
        } else if (l.getLayers) {
          getVectorLayers(l.getLayers(), init)
        }
      })
      return init
    }

    if (map) {
      // Watch the vector sources in the map 
      var vectors = getVectorLayers(map.getLayers())
      vectors.forEach((function (l) {
        var s = l.getSource()
        this._sourceListener.push(s.on(['addfeature', 'removefeature'], this._onAddRemove.bind(this)))
        this._sourceListener.push(s.on('clearstart', function () {
          this.blockStart('clear')
        }.bind(this)))
        this._sourceListener.push(s.on('clearend', this.blockEnd.bind(this)))
      }).bind(this))

      // Watch new inserted/removed
      this._sourceListener.push(map.getLayers().on(['add', 'remove'], this._watchSources.bind(this)))
    }
  }
  /** Watch for interactions
   * @private
   */
  _watchInteractions() {
    var map = this.getMap()
    // Clear listeners
    if (this._interactionListener) {
      this._interactionListener.forEach(function (l) { ol_Observable_unByKey(l) })
    }
    this._interactionListener = []

    if (map) {
      // Watch the interactions in the map 
      map.getInteractions().forEach((function (i) {
        this._interactionListener.push(i.on(
          ['setattributestart', 'modifystart', 'rotatestart', 'translatestart', 'scalestart', 'deletestart', 'deleteend', 'beforesplit', 'aftersplit'],
          this._onInteraction.bind(this)
        ))
      }).bind(this))

      // Watch new inserted / unwatch removed
      this._interactionListener.push(map.getInteractions().on(
        ['add', 'remove'],
        this._watchInteractions.bind(this)
      ))
    }
  }
  /** A feature is added / removed
   */
  _onAddRemove(e) {
    if (this._record) {
      this._redoStack.clear()
      this._redo.length = 0
      this._undoStack.push({
        type: e.type,
        source: e.target,
        feature: e.feature
      })
    }
  }
  /** Perform an interaction
   * @private
   */
  _onInteraction(e) {
    var fn = this._onInteraction[e.type]
    if (fn)
      fn.call(this, e)
  }
  /** Start an undo block
   * @param {string} [name] name f the action
   * @api
   */
  blockStart(name) {
    this._redoStack.clear()
    this._redo.length = 0
    this._undoStack.push({
      type: 'blockstart',
      name: name
    })
    this._level++
  }
  /** End an undo block
   * @api
   */
  blockEnd() {
    this._undoStack.push({ type: 'blockend' })
    this._level--
  }
  /** handle undo/redo
   * @private
   */
  _handleDo(e, undo) {
    // Not active
    if (!this.getActive())
      return

    // Stop recording while undoing
    this._record = false
    if (e.custom) {
      if (this._defs[e.type]) {
        if (undo)
          this._defs[e.type].undo(e.prop)
        else
          this._defs[e.type].redo(e.prop)
      } else {
        console.warn('[UndoRedoInteraction]: "' + e.type + '" is not defined.')
      }
    } else {
      switch (e.type) {
        case 'addfeature': {
          if (undo)
            e.source.removeFeature(e.feature)
          else
            e.source.addFeature(e.feature)
          break
        }
        case 'removefeature': {
          if (undo)
            e.source.addFeature(e.feature)
          else
            e.source.removeFeature(e.feature)
          break
        }
        case 'changegeometry': {
          var geom = e.feature.getGeometry()
          e.feature.setGeometry(e.oldGeom)
          e.oldGeom = geom
          break
        }
        case 'changeattribute': {
          var newp = e.newProperties
          var oldp = e.oldProperties
          for (var p in oldp) {
            if (oldp === undefined)
              e.feature.unset(p)
            else
              e.feature.set(p, oldp[p])
          }
          e.oldProperties = newp
          e.newProperties = oldp
          break
        }
        case 'blockstart': {
          this._block += undo ? -1 : 1
          break
        }
        case 'blockend': {
          this._block += undo ? 1 : -1
          break
        }
        default: {
          console.warn('[UndoRedoInteraction]: "' + e.type + '" is not defined.')
        }
      }
    }

    // Handle block
    if (this._block < 0)
      this._block = 0
    if (this._block) {
      if (undo)
        this.undo()
      else
        this.redo()
    }
    this._record = true

    // Dispatch event
    this.dispatchEvent({
      type: undo ? 'undo' : 'redo',
      action: e
    })
  }
  /** Undo last operation
   * @api
   */
  undo() {
    var e = this._undoStack.item(this._undoStack.getLength() - 1)
    if (!e)
      return
    this._redoStack.push(e)
    this._undoStack.pop()
    this._handleDo(e, true)
  }
  /** Redo last operation
   * @api
   */
  redo() {
    var e = this._redoStack.item(this._redoStack.getLength() - 1)
    if (!e)
      return
    this._undoStack.push(e)
    this._redoStack.pop()
    this._handleDo(e, false)
  }
  /** Clear undo stack
   * @api
   */
  clear() {
    this._doClear = true
    this._undo.length = this._redo.length = 0
    this._undoStack.clear()
    this._redoStack.clear()
    this._doClear = false
    this.dispatchEvent({ type: 'stack:clear' })
  }
  /** Check if undo is avaliable
   * @return {number} the number of undo
   * @api
   */
  hasUndo() {
    return this._undoStack.getLength()
  }
  /** Check if redo is avaliable
   * @return {number} the number of redo
   * @api
   */
  hasRedo() {
    return this._redoStack.getLength()
  }
}

/** Set attribute
 * @private
 */
ol_interaction_UndoRedo.prototype._onInteraction.setattributestart = function(e) {
  this.blockStart(e.target.get('name') || 'setattribute');
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
  this.blockStart(e.type.replace(/start$/,''));
  e.features.forEach(function(m) {
    this._undoStack.push({ 
      type: 'changegeometry', 
      feature: m, 
      oldGeom: m.getGeometry().clone() 
    });
  }.bind(this));
  this.blockEnd();
};


/** @private
 */
ol_interaction_UndoRedo.prototype._onInteraction.beforesplit = function() {
  // Check modify before split
  var l = this._undoStack.getLength();
  if (l>2 
    && this._undoStack.item(l-1).type === 'blockend'
    && this._undoStack.item(l-2).type === 'changegeometry') {
    this._undoStack.pop();
  } else {
    this.blockStart('split');
  }
};
ol_interaction_UndoRedo.prototype._onInteraction.deletestart = function() {
  this.blockStart('delete');
}


/** @private
 */
ol_interaction_UndoRedo.prototype._onInteraction.aftersplit =
ol_interaction_UndoRedo.prototype._onInteraction.deleteend =
ol_interaction_UndoRedo.prototype.blockEnd;

export default ol_interaction_UndoRedo
