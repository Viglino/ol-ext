/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_TouchCursor from './TouchCursor'
import ol_interaction_Draw from 'ol/interaction/Draw'

/** TouchCursor interaction + ModifyFeature
 * @constructor
 * @extends {ol_interaction_TouchCursor}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {string} options.className cursor class name
 *  @param {ol.coordinate} options.coordinate cursor position
 *  @param {string} options.type geometry type
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

  // Add point when click on the cursor
  var addPoint = false;

  // Modify interaction
  var draw = this._draw = new ol_interaction_Draw ({ 
    source: options.source,
    features: options.features,
    condition: function() {
      if (addPoint) {
        addPoint = false;
        return true;
      } else {
        return false;
      }
    },
    clickTolerance: options.clickTolerance,
    snapTolerance: options.snapTolerance,
    maxPoints: options.maxPoints,
    minPoints: options.minPoints,
    style: options.style,
    geometryFunction: options.geometryFunction,
    geometryName: options.geometryName,
    wrapX: options.wrapX,
    type: options.type || 'LineString'
  });
  draw.set('type', options.type);

  // Buttons
  var buttons = [];
  if (options.type !== 'Point') {
    buttons =[{
      // Cancel drawing
      className: 'ol-button-x', 
      click: function() {
        draw.abortDrawing();
      }
    }, { 
      // Add a new point (nothing to do, just click)
      className: 'ol-button-check',
      click: function() {
        draw.finishDrawing();
      }
    }, { 
      // Remove a point
      className: 'ol-button-remove', 
      click: function() {
        draw.removeLastPoint();
        if (draw.sketchFeature_) {
          var c = draw.sketchLineCoords_ ? draw.sketchLineCoords_.slice() : draw.sketchCoords_.slice();
          c.pop();
          if (!c.length) {
            draw.abortDrawing();
          } else {
            if (draw.get('type')==='Polygon') {
              draw.sketchLine_.getGeometry().setCoordinates(c);
              c.push(c[0])
              draw.sketchFeature_.getGeometry().setCoordinates([c]);
              c.pop();
            } else {
              draw.sketchFeature_.getGeometry().setCoordinates(c);
            }
            var p = c.pop();
            if (p) draw.sketchPoint_.getGeometry().setCoordinates(p);
            else draw.abortDrawing();
          }
        }
      }
    }]
  }
  
  // Create cursor
  ol_interaction_TouchCursor.call(this, {
    className: options.className,
    coordinate: options.coordinate,
    buttons: buttons
  });

  // Add point when click on the element
  this.getOverlayElement().addEventListener('pointerdown', function(e) {
    if (e.target === this.getOverlayElement()) {
      addPoint = true;
    }
  }.bind(this));
};
ol_ext_inherits(ol_interaction_TouchCursorDraw, ol_interaction_TouchCursor);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_interaction_TouchCursorDraw.prototype.setMap = function(map) {
  if (this.getMap()) {
    this.getMap().removeInteraction(this._modify);
  }

  if (map) {
    map.addInteraction(this._draw);
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
ol_interaction_TouchCursorDraw.prototype.setActive = function(b, position) {
  ol_interaction_TouchCursor.prototype.setActive.call (this, b, position);
  this._draw.setActive(b);
};

/**
 * Get the draw interaction.
 * @retunr {ol.interaction.ModifyFeature} 
 * @observable
 * @api
 */
ol_interaction_TouchCursorDraw.prototype.getInteraction = function() {
  return this._draw;
};

export default ol_interaction_TouchCursorDraw
