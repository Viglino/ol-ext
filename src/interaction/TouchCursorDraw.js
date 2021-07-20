/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_TouchCursor from './TouchCursor'

import ol_layer_SketchOverlay from '../layer/SketchOverlay'

/** TouchCursor interaction + ModifyFeature
 * @constructor
 * @extends {ol_interaction_TouchCursor}
 * @fires drawend
 * @fires change:type
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {string} options.className cursor class name
 *  @param {ol.coordinate} options.coordinate cursor position
 *  @param {string} options.type geometry type
 *  @param {Array<string>} options.types geometry types avaliable, default none
 *  @param {ol.source.Vector} options.source Destination source for the drawn features
 *  @param {ol.Collection<ol.Feature>} options.features Destination collection for the drawn features
 *  @param {number} options.clickTolerance The maximum distance in pixels for "click" event to add a point/vertex to the geometry being drawn. default 6
 *  @param {number} options.snapTolerance Pixel distance for snapping to the drawing finish, default 12
 *  @param {number} options.maxPoints The number of points that can be drawn before a polygon ring or line string is finished. By default there is no restriction.
 *  @param {number} options.minPoints The number of points that must be drawn before a polygon ring or line string can be finished. Default is 3 for polygon rings and 2 for line strings.
 *  @param {ol.style.Style} options.style Style for sketch features.
 *  @param {function} options.geometryFunction Function that is called when a geometry's coordinates are updated.
 *  @param {string} options.geometryName Geometry name to use for features created by the draw interaction.
 *  @param {boolean} options.wrapX Wrap the world horizontally on the sketch overlay, default false
 */
var ol_interaction_TouchCursorDraw = function(options) {
  options = options || {};

  // Draw 
  var sketch = this.sketch = new ol_layer_SketchOverlay({
    type: options.type
  });

  sketch.on('drawend', function(e) {
    if (e.valid && options.source) options.source.addFeature(e.feature);
    this.getOverlayElement().classList.add('nodrawing');
    this.dispatchEvent(e);
  }.bind(this));
  sketch.on('drawstart', function(e) {
    this.getOverlayElement().classList.remove('nodrawing');
    this.dispatchEvent(e);
  }.bind(this));
  sketch.on('drawabort', function(e) {
    this.getOverlayElement().classList.add('nodrawing');
    this.dispatchEvent(e);
  }.bind(this));

  // Create cursor
  ol_interaction_TouchCursor.call(this, {
    className: options.className,
    coordinate: options.coordinate,
  });
  this.getOverlayElement().classList.add('nodrawing');

  this.set('types', options.types);
  this.setType(options.type);

  this.on('click', function() {
    this.sketch.addPoint(this.getPosition());
  }.bind(this))

  this.on('dragging', function() {
    this.sketch.setPosition(this.getPosition());
  }.bind(this))
};
ol_ext_inherits(ol_interaction_TouchCursorDraw, ol_interaction_TouchCursor);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_interaction_TouchCursorDraw.prototype.setMap = function(map) {
  ol_interaction_TouchCursor.prototype.setMap.call (this, map);

  this.sketch.setMap(map);
  if (map) {
    this._listeners.movend = map.on('moveend', function() {
      this.sketch.setPosition(this.getPosition())
    }.bind(this))
  }
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @param {ol.coordinate|null} position position of the cursor (when activating), default viewport center.
 * @observable
 * @api
 */
ol_interaction_TouchCursorDraw.prototype.setActive = function(b, position) {
  ol_interaction_TouchCursor.prototype.setActive.call (this, b, position);
  this.sketch.abortDrawing();
  this.sketch.setPosition(position);
  this.sketch.setVisible(b);
};

/**
 * Set Geometry type
 * @param {string} type Geometry type
 */
ol_interaction_TouchCursorDraw.prototype.setType = function(type) {
  this.removeButton();
  var sketch = this.sketch;
  this.getOverlayElement().classList.remove(sketch.getGeometryType());
  // Set type
  var oldValue = sketch.setGeometryType();
  type = sketch.setGeometryType(type);
  this.getOverlayElement().classList.add(type);

  this.dispatchEvent({
    type: 'change:type',
    oldValue: oldValue
  });

  // Next type
  var types = this.get('types');
  if (types && types.length) {
    var next = types[(types.indexOf(type) + 1) % types.length];
    this.addButton({
      className: 'ol-button-type '+next, 
      click: function() {
        this.setType(next)
      }.bind(this)
    });
  }
  // Add buttons
  if (type !== 'Point') {
    // Cancel drawing
    this.addButton({
      className: 'ol-button-x', 
      click: function() {
        sketch.abortDrawing();
      }
    });
    if (type !== 'Circle') {
      // Add a new point (nothing to do, just click)
      this.addButton({ 
        className: 'ol-button-check',
        click: function() {
          sketch.finishDrawing(true);
        }
      });
      // Remove last point
      this.addButton({  
        className: 'ol-button-remove', 
        click: function() {
          sketch.removeLastPoint();
        }
      });
    }
  }
};

/** Get geometry type
 */
ol_interaction_TouchCursorDraw.prototype.getType = function() {
  return this.sketch.getGeometryType();
};


export default ol_interaction_TouchCursorDraw
