/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_Interaction from 'ol/interaction/Interaction'
import ol_style_Style_defaultStyle from '../style/defaultStyle'
import ol_Collection from 'ol/Collection'
import ol_layer_Vector from 'ol/layer/Vector'
import ol_source_Vector from 'ol/source/Vector'
import ol_geom_Circle from 'ol/geom/Circle'
import {fromCircle as ol_geom_Polygon_fromCircle} from 'ol/geom/Polygon'
import ol_geom_Point from 'ol/geom/Point'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_geom_Polygon from 'ol/geom/Polygon'
import ol_Feature from 'ol/Feature'

/** Interaction rotate
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires drawstart, drawing, drawend, drawcancel
 * @param {olx.interaction.TransformOptions} options
 *  @param {Array<ol.Layer>} options.source Destination source for the drawn features
 *  @param {ol.Collection<ol.Feature>} options.features Destination collection for the drawn features 
 *  @param {ol.style.Style | Array.<ol.style.Style> | ol.style.StyleFunction | undefined} options.style style for the sketch
 *  @param {integer} options.sides number of sides, default 0 = circle
 *  @param { ol.events.ConditionType | undefined } options.condition A function that takes an ol.MapBrowserEvent and returns a boolean that event should be handled. By default module:ol/events/condition.always.
 *  @param { ol.events.ConditionType | undefined } options.squareCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw square features. Default test shift key
 *  @param { ol.events.ConditionType | undefined } options.centerCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw centered features. Default check Ctrl key
 *  @param { bool } options.canRotate Allow rotation when centered + square, default: true
 *  @param { string } [options.geometryName=geometry] 
 *  @param { number } options.clickTolerance click tolerance on touch devices, default: 6
 *  @param { number } options.maxCircleCoordinates Maximum number of point on a circle, default: 100
 */
var ol_interaction_DrawRegular = function(options) {
  if (!options) options={};

  this.squaredClickTolerance_ = options.clickTolerance ? options.clickTolerance * options.clickTolerance : 36;
  this.maxCircleCoordinates_ = options.maxCircleCoordinates || 100;

  // Collection of feature to transform 
  this.features_ = options.features;
  // List of layers to transform 
  this.source_ = options.source;
  // Square condition
  this.conditionFn_ = options.condition;
  // Square condition
  this.squareFn_ = options.squareCondition;
  // Centered condition
  this.centeredFn_ = options.centerCondition;
  // Allow rotation when centered + square
  this.canRotate_ = (options.canRotate !== false);
  // Specify custom geometry name
  this.geometryName_ = options.geometryName;

  // Number of sides (default=0: circle)
  this.setSides(options.sides);

  // Style
  var defaultStyle = ol_style_Style_defaultStyle(true);

  // Create a new overlay layer for the sketch
  this.sketch_ = new ol_Collection();
  this.overlayLayer_ = new ol_layer_Vector({
    source: new ol_source_Vector({
      features: this.sketch_,
      useSpatialIndex: false
    }),
    name:'DrawRegular overlay',
    displayInLayerSwitcher: false,
    style: options.style || defaultStyle
  });

  ol_interaction_Interaction.call(this, {	
      /*
      handleDownEvent: this.handleDownEvent_,
      handleMoveEvent: this.handleMoveEvent_,
      handleUpEvent: this.handleUpEvent_,
      */
      handleEvent: this.handleEvent_
    });
};
ol_ext_inherits(ol_interaction_DrawRegular, ol_interaction_Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_DrawRegular.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
  ol_interaction_Interaction.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
};

/**
 * Activate/deactivate the interaction
 * @param {boolean}
 * @api stable
 */
ol_interaction_DrawRegular.prototype.setActive = function(b) {
  this.reset();
  ol_interaction_Interaction.prototype.setActive.call (this, b);
}

/**
 * Reset the interaction
 * @api stable
 */
ol_interaction_DrawRegular.prototype.reset = function() {
  this.overlayLayer_.getSource().clear();
  this.started_ = false;
}

/**
 * Set the number of sides.
 * @param {int} number of sides.
 * @api stable
 */
ol_interaction_DrawRegular.prototype.setSides = function (nb) {
  nb = parseInt(nb);
  this.sides_ = nb>2 ? nb : 0;
}

/**
 * Allow rotation when centered + square
 * @param {bool} 
 * @api stable
 */
ol_interaction_DrawRegular.prototype.canRotate = function (b) {
  if (b===true || b===false) this.canRotate_ = b;
  return this.canRotate_;
}

/**
 * Get the number of sides.
 * @return {int} number of sides.
 * @api stable
 */
ol_interaction_DrawRegular.prototype.getSides = function () {
  return this.sides_;
}

/** Default start angle array for each sides
*/
ol_interaction_DrawRegular.prototype.startAngle = {
  'default':Math.PI/2,
  3: -Math.PI/2,
  4: Math.PI/4
};

/** Get geom of the current drawing
* @return {ol.geom.Polygon | ol.geom.Point}
*/
ol_interaction_DrawRegular.prototype.getGeom_ = function () {
  this.overlayLayer_.getSource().clear();
  if (!this.center_) return false;

  var g;
  if (this.coord_) {
    var center = this.center_;
    var coord = this.coord_;

    // Specific case: circle
    var d, dmax, r, circle, centerPx;
    if (!this.sides_ && this.square_ && !this.centered_) {
      center = [(coord[0] + center[0])/2, (coord[1] + center[1])/2];
      d = [coord[0] - center[0], coord[1] - center[1]];
      r = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
      circle = new ol_geom_Circle(center, r, 'XY');
      // Optimize points on the circle
      centerPx = this.getMap().getPixelFromCoordinate(center);
      dmax = Math.max (100, Math.abs(centerPx[0]-this.coordPx_[0]), Math.abs(centerPx[1]-this.coordPx_[1]));
      dmax = Math.min ( this.maxCircleCoordinates_, Math.round(dmax / 3 ));
      return ol_geom_Polygon_fromCircle (circle, dmax, 0);
    } else {
      var hasrotation = this.canRotate_ && this.centered_ && this.square_;
      d = [coord[0] - center[0], coord[1] - center[1]];
      if (this.square_ && !hasrotation) {
        //var d = [coord[0] - center[0], coord[1] - center[1]];
        var dm = Math.max (Math.abs(d[0]), Math.abs(d[1])); 
        coord = [ 
          center[0] + (d[0]>0 ? dm:-dm),
          center[1] + (d[1]>0 ? dm:-dm)
        ];
      }
      r = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
      if (r>0) {
        circle = new ol_geom_Circle(center, r, 'XY');
        var a;
        if (hasrotation) a = Math.atan2(d[1], d[0]);
        else a = this.startAngle[this.sides_] || this.startAngle['default'];

        if (this.sides_) {
          g = ol_geom_Polygon_fromCircle (circle, this.sides_, a);
        } else {
          // Optimize points on the circle
          centerPx = this.getMap().getPixelFromCoordinate(this.center_);
          dmax = Math.max (100, Math.abs(centerPx[0]-this.coordPx_[0]), Math.abs(centerPx[1]-this.coordPx_[1]));
          dmax = Math.min ( this.maxCircleCoordinates_, Math.round(dmax / (this.centered_ ? 3:5) ));
          g = ol_geom_Polygon_fromCircle (circle, dmax, 0);
        }

        if (hasrotation) return g;
      
        // Scale polygon to fit extent
        var ext = g.getExtent();
        if (!this.centered_) center = this.center_;
        else center = [ 2*this.center_[0]-this.coord_[0], 2*this.center_[1]-this.coord_[1] ];
        var scx = (center[0] - coord[0]) / (ext[0] - ext[2]);
        var scy = (center[1] - coord[1]) / (ext[1] - ext[3]);
        if (this.square_) {
          var sc = Math.min(Math.abs(scx),Math.abs(scy));
          scx = Math.sign(scx)*sc;
          scy = Math.sign(scy)*sc;
        }
        var t = [ center[0] - ext[0]*scx, center[1] - ext[1]*scy ];
      
        g.applyTransform(function(g1, g2, dim) {
          for (var i=0; i<g1.length; i+=dim) {
            g2[i] = g1[i]*scx + t[0];
            g2[i+1] = g1[i+1]*scy + t[1];
          }
          return g2;
        });
        return g;
      }
    }
  }

  // No geom => return a point
  return new ol_geom_Point(this.center_);
};

/** Draw sketch
* @return {ol.Feature} The feature being drawn.
*/
ol_interaction_DrawRegular.prototype.drawSketch_ = function(evt) {
  this.overlayLayer_.getSource().clear();
  if (evt) {
    this.square_ = this.squareFn_ ? this.squareFn_(evt) : evt.originalEvent.shiftKey;
    this.centered_ = this.centeredFn_ ? this.centeredFn_(evt) : evt.originalEvent.metaKey || evt.originalEvent.ctrlKey;
    var g = this.getGeom_();
    if (g) {
      var f = this.feature_;

      //f.setGeometry (g);
      if (g.getType()==='Polygon') f.getGeometry().setCoordinates(g.getCoordinates());
      this.overlayLayer_.getSource().addFeature(f);
      if (this.coord_ 
        && this.square_ 
        && ((this.canRotate_ && this.centered_ && this.coord_) || (!this.sides_ && !this.centered_))) {
        this.overlayLayer_.getSource().addFeature(new ol_Feature(new ol_geom_LineString([this.center_,this.coord_])));
      }
      return f;
    }
  }
};

/** Draw sketch (Point)
*/
ol_interaction_DrawRegular.prototype.drawPoint_ = function(pt, noclear) {
  if (!noclear) this.overlayLayer_.getSource().clear();
  this.overlayLayer_.getSource().addFeature(new ol_Feature(new ol_geom_Point(pt)));
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ol_interaction_DrawRegular.prototype.handleEvent_ = function(evt) {
  var dx, dy;
  // Event date time
  this._eventTime = new Date();
  switch (evt.type) {
    case "pointerdown": {
      if (this.conditionFn_ && !this.conditionFn_(evt)) break;
      this.downPx_ = evt.pixel;
      this.start_(evt);
      // Test long touch
      var dt = 500;
      this._longTouch = false;
      setTimeout(function() {
        this._longTouch = (new Date() - this._eventTime > .9*dt);
        if (this._longTouch) this.handleMoveEvent_(evt);
      }.bind(this), dt);
      break;
    }
    case "pointerup": {
      // Started and fisrt move
      if (this.started_ && this.coord_) {
        dx = this.downPx_[0] - evt.pixel[0];
        dy = this.downPx_[1] - evt.pixel[1];
        if (dx*dx + dy*dy <= this.squaredClickTolerance_) {
          // The pointer has moved
          if ( this.lastEvent == "pointermove" || this.lastEvent == "keydown" ) {
            this.end_(evt);
          }
          // On touch device there is no move event : terminate = click on the same point
          else {
            dx = this.upPx_[0] - evt.pixel[0];
            dy = this.upPx_[1] - evt.pixel[1];
            if ( dx*dx + dy*dy <= this.squaredClickTolerance_) {
              this.end_(evt);
            } else  {
              this.handleMoveEvent_(evt);
              this.drawPoint_(evt.coordinate,true);
            }
          }
        }
      }
      this.upPx_ = evt.pixel;	
      break;
    }
    case "pointerdrag": {
      if (this.started_) {
        var centerPx = this.getMap().getPixelFromCoordinate(this.center_);
        dx = centerPx[0] - evt.pixel[0];
        dy = centerPx[1] - evt.pixel[1];
        if (dx*dx + dy*dy <= this.squaredClickTolerance_) {
          this.reset();
        }
      }
      return !this._longTouch;
      // break;
    }
    case "pointermove": {
      if (this.started_) {
        dx = this.downPx_[0] - evt.pixel[0];
        dy = this.downPx_[1] - evt.pixel[1];
        if (dx*dx + dy*dy > this.squaredClickTolerance_) {
          this.handleMoveEvent_(evt);
          this.lastEvent = evt.type;
        }
      }
      break;
    }
    default: {
      this.lastEvent = evt.type;
      // Prevent zoom in on dblclick
      if (this.started_ && evt.type==='dblclick') {
        //evt.stopPropagation();
        return false;
      }
      break;
    }
  }
  return true;
}

/** Stop drawing.
 */
ol_interaction_DrawRegular.prototype.finishDrawing = function() {
  if (this.started_ && this.coord_) {
    this.end_({ pixel: this.upPx_, coordinate: this.coord_});
  }
};

/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol_interaction_DrawRegular.prototype.handleMoveEvent_ = function(evt) {
  if (this.started_) {
    this.coord_ = evt.coordinate;
    this.coordPx_ = evt.pixel;
    var f = this.drawSketch_(evt);
    this.dispatchEvent({ 
      type:'drawing', 
      feature: f, 
      pixel: evt.pixel, 
      startCoordinate: this.center_,
      coordinate: evt.coordinate, 
      square: this.square_, 
      centered: this.centered_ 
    });
  } else  {
    this.drawPoint_(evt.coordinate);
  }
};

/** Start an new draw
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol_interaction_DrawRegular.prototype.start_ = function(evt) {
  if (!this.started_) {
    this.started_ = true;
    this.center_ = evt.coordinate;
    this.coord_ = null;
    var f = this.feature_ = new ol_Feature({});
    f.setGeometryName(this.geometryName_);
    f.setGeometry(new ol_geom_Polygon([[evt.coordinate,evt.coordinate,evt.coordinate]]));
    this.drawSketch_(evt);
    this.dispatchEvent({ type:'drawstart', feature: f, pixel: evt.pixel, coordinate: evt.coordinate });
  } else {
    this.coord_ = evt.coordinate;
  }
};

/** End drawing
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol_interaction_DrawRegular.prototype.end_ = function(evt) {
  this.coord_ = evt.coordinate;
  this.started_ = false;
  if (this.coord_ && (this.center_[0]!==this.coord_[0] || this.center_[1]!==this.coord_[1])) {
    var f = this.feature_;

    f.setGeometry(this.getGeom_());
    if (this.source_) this.source_.addFeature(f);
    else if (this.features_) this.features_.push(f);
    this.dispatchEvent({ type:'drawend', feature: f, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
  } else {
    this.dispatchEvent({ type:'drawcancel', feature: null, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
  }

  this.center_ = this.coord_ = null;
  this.drawSketch_();
};

export default ol_interaction_DrawRegular
