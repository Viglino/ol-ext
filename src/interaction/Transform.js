
import ol from 'ol'
import ol_style_Style from 'ol/style/style'
import ol_style_Stroke from 'ol/style/stroke'
import ol_source_Vector from 'ol/source/vector'
import ol_style_Fill from 'ol/style/fill'
import ol_layer_Vector from 'ol/layer/vector'
import ol_geom_Point from 'ol/geom/point'
import ol_Feature from 'ol/feature'
import ol_Collection from 'ol/collection'
import ol_interaction_Pointer from 'ol/interaction/pointer'
import ol_style_RegularShape from 'ol/style/regularshape'
import ol_geom_Polygon from 'ol/geom/polygon'
import ol_extent from 'ol/extent'

/** Interaction rotate
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @fires select | rotatestart | rotating | rotateend | translatestart | translating | translateend | scalestart | scaling | scaleend
 * @param {any} options
 *  @param {Array<ol.Layer>} options.layers array of layers to transform,
 *  @param {ol.Collection<ol.Feature>} options.features collection of feature to transform,
 *	@param {ol.EventsConditionType|undefined} options.addCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event should be handled. default: ol.events.condition.never.
 *	@param {number | undefined} options.hitTolerance Tolerance to select feature in pixel, default 0
 *	@param {bool} options.translateFeature Translate when click on feature
 *	@param {bool} options.translate Can translate the feature
 *	@param {bool} options.stretch can stretch the feature
 *	@param {bool} options.scale can scale the feature
 *	@param {bool} options.rotate can rotate the feature
 *	@param {ol.events.ConditionType | undefined} options.keepAspectRatio A function that takes an ol.MapBrowserEvent and returns a boolean to keep aspect ratio, default ol.events.condition.shiftKeyOnly.
 *	@param {} options.style list of ol.style for handles
 *
 */
var ol_interaction_Transform = function(options) {
  if (!options) options = {};
	var self = this;

	// Create a new overlay layer for the sketch
	this.handles_ = new ol_Collection();
	this.overlayLayer_ = new ol_layer_Vector({
    source: new ol_source_Vector({
      features: this.handles_,
      useSpatialIndex: false
    }),
    name:'Transform overlay',
    displayInLayerSwitcher: false,
    // Return the style according to the handle type
    style: function (feature) {
      return (self.style[(feature.get('handle')||'default')+(feature.get('constraint')||'')+(feature.get('option')||'')]);
    }
  });

	// Extend pointer
	ol_interaction_Pointer.call(this, {
    handleDownEvent: this.handleDownEvent_,
		handleDragEvent: this.handleDragEvent_,
		handleMoveEvent: this.handleMoveEvent_,
		handleUpEvent: this.handleUpEvent_
	});

	/** Collection of feature to transform */
	this.features_ = options.features;
	/** List of layers to transform */
	this.layers_ = options.layers ? (options.layers instanceof Array) ? options.layers:[options.layers] : null;

	this.addFn_ = options.addCondition || function() { return false; };
	/* Translate when click on feature */
	this.set('translateFeature', (options.translateFeature!==false));
	/* Can translate the feature */
	this.set('translate', (options.translate!==false));
	/* Can stretch the feature */
	this.set('stretch', (options.stretch!==false));
	/* Can scale the feature */
	this.set('scale', (options.scale!==false));
	/* Can rotate the feature */
	this.set('rotate', (options.rotate!==false));
	/* Keep aspect ratio */
	this.set('keepAspectRatio', (options.keepAspectRatio || function(e){ return e.originalEvent.shiftKey }));
	/*  */
	this.set('hitTolerance', (options.hitTolerance || 0));

  this.selection_ = [];

	// Force redraw when changed
	this.on ('propertychange', function() {
    this.drawSketch_();
	});

	// setstyle
  this.setDefaultStyle();
};
ol.inherits(ol_interaction_Transform, ol_interaction_Pointer);

/** Cursors for transform
*/
ol_interaction_Transform.prototype.Cursors = {
  'default': 'auto',
  'select': 'pointer',
  'translate': 'move',
  'rotate': 'url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXAgMAAACdRDwzAAAAAXNSR0IArs4c6QAAAAlQTFRF////////AAAAjvTD7AAAAAF0Uk5TAEDm2GYAAAABYktHRACIBR1IAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH2wwSEgUFmXJDjQAAAEZJREFUCNdjYMAOuCCk6goQpbp0GpRSAFKcqdNmQKgIILUoNAxIMUWFhoKosNDQBKDgVAilCqcaQBogFFNoGNjsqSgUTgAAM3ES8k912EAAAAAASUVORK5CYII=\') 5 5, auto',
  'rotate0': 'url(\'data:image/png;base64,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\') 5 5, auto',
  'scale': 'nesw-resize',
  'scale1': 'nwse-resize',
  'scale2': 'nesw-resize',
  'scale3': 'nwse-resize',
  'scalev': 'ew-resize',
  'scaleh1': 'ns-resize',
  'scalev2': 'ew-resize',
  'scaleh3': 'ns-resize'
};

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_Transform.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
	ol_interaction_Pointer.prototype.setMap.call (this, map);
	this.overlayLayer_.setMap(map);
 	if (map !== null) {
		this.isTouch = /touch/.test(map.getViewport().className);
		this.setDefaultStyle();
	}
};

/**
 * Activate/deactivate interaction
 * @param {bool}
 * @api stable
 */
ol_interaction_Transform.prototype.setActive = function(b) {
  this.select(null);
	this.overlayLayer_.setVisible(b);
	ol_interaction_Pointer.prototype.setActive.call (this, b);
};

/** Set efault sketch style
*/
ol_interaction_Transform.prototype.setDefaultStyle = function() {
  // Style
	var stroke = new ol_style_Stroke({ color: [255,0,0,1], width: 1 });
	var strokedash = new ol_style_Stroke({ color: [255,0,0,1], width: 1, lineDash:[4,4] });
	var fill0 = new ol_style_Fill({ color:[255,0,0,0.01] });
	var fill = new ol_style_Fill({ color:[255,255,255,0.8] });
	var circle = new ol_style_RegularShape({
      fill: fill,
      stroke: stroke,
      radius: this.isTouch ? 12 : 6,
      points: 15
    });
	circle.getAnchor()[0] = this.isTouch ? -10 : -5;
	var bigpt = new ol_style_RegularShape({
      fill: fill,
      stroke: stroke,
      radius: this.isTouch ? 16 : 8,
      points: 4,
      angle: Math.PI/4
    });
	var smallpt = new ol_style_RegularShape({
      fill: fill,
      stroke: stroke,
      radius: this.isTouch ? 12 : 6,
      points: 4,
      angle: Math.PI/4
    });
	function createStyle (img, stroke, fill) {
    return [ new ol_style_Style({image:img, stroke:stroke, fill:fill}) ];
	}
	/** Style for handles */
	this.style = {
    'default': createStyle (bigpt, strokedash, fill0),
		'translate': createStyle (bigpt, stroke, fill),
		'rotate': createStyle (circle, stroke, fill),
		'rotate0': createStyle (bigpt, stroke, fill),
		'scale': createStyle (bigpt, stroke, fill),
		'scale1': createStyle (bigpt, stroke, fill),
		'scale2': createStyle (bigpt, stroke, fill),
		'scale3': createStyle (bigpt, stroke, fill),
		'scalev': createStyle (smallpt, stroke, fill),
		'scaleh1': createStyle (smallpt, stroke, fill),
		'scalev2': createStyle (smallpt, stroke, fill),
		'scaleh3': createStyle (smallpt, stroke, fill),
	};
	this.drawSketch_();
}

/**
 * Set sketch style.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_Transform.prototype.setStyle = function(style, olstyle) {
  if (!olstyle) return;
	if (olstyle instanceof Array) this.style[style] = olstyle;
	else this.style[style] = [ olstyle ];
	for (var i=0; i<this.style[style].length; i++) {
    var im = this.style[style][i].getImage();
		if (im) {
      if (style == 'rotate') im.getAnchor()[0] = -5;
			if (this.isTouch) im.setScale(1.8);
		}
		var tx = this.style[style][i].getText();
		if (tx) {
      if (style == 'rotate') tx.setOffsetX(this.isTouch ? 14 : 7);
			if (this.isTouch) tx.setScale(1.8);
		}
	}
	this.drawSketch_();
};

/** Get Feature at pixel
 * @param {ol.Pixel}
 * @return {ol.feature}
 * @private
 */
ol_interaction_Transform.prototype.getFeatureAtPixel_ = function(pixel) {
	var self = this;
	return this.getMap().forEachFeatureAtPixel(pixel,
		function(feature, layer) {
      var found = false;
			// Overlay ?
			if (!layer) {
        if (feature===self.bbox_) return false;
				self.handles_.forEach (function(f) { if (f===feature) found=true; });
				if (found) return { feature: feature, handle:feature.get('handle'), constraint:feature.get('constraint'), option:feature.get('option') };
			}
			// feature belong to a layer
			if (self.layers_) {
        for (var i=0; i<self.layers_.length; i++) {
          if (self.layers_[i]===layer) return { feature: feature };
				}
				return null;
			}
			// feature in the collection
			else if (self.features_) {
        self.features_.forEach (function(f) { if (f===feature) found=true; });
				if (found) return { feature: feature };
				else return null;
			}
			// Others
			else return { feature: feature };
		},
		{ hitTolerance: this.get('hitTolerance') }
	) || {};
}

/** Draw transform sketch
* @param {boolean} draw only the center
*/
ol_interaction_Transform.prototype.drawSketch_ = function(center) {
	this.overlayLayer_.getSource().clear();
	if (!this.selection_.length) return;
  var ext = this.selection_[0].getGeometry().getExtent();
  // Clone and extend
  ext = ol.extent.buffer(ext, 0);
  for (var i=1, f; f = this.selection_[i]; i++) {
    ol.extent.extend(ext, f.getGeometry().getExtent());
  }
  if (center===true) {
    if (!this.ispt_) {
      this.overlayLayer_.getSource().addFeature(new ol_Feature( { geometry: new ol_geom_Point(this.center_), handle:'rotate0' }) );
			var geom = ol_geom_Polygon.fromExtent(ext);
			var f = this.bbox_ = new ol_Feature(geom);
			this.overlayLayer_.getSource().addFeature (f);
		}
	}
	else {
		if (this.ispt_) {
      var p = this.getMap().getPixelFromCoordinate([ext[0], ext[1]]);
			ext = ol_extent.boundingExtent([
        this.getMap().getCoordinateFromPixel([p[0]-10, p[1]-10]),
        this.getMap().getCoordinateFromPixel([p[0]+10, p[1]+10])
      ]);
		}
		var geom = ol_geom_Polygon.fromExtent(ext);
		var f = this.bbox_ = new ol_Feature(geom);
		var features = [];
		var g = geom.getCoordinates()[0];
		if (!this.ispt_) {
      features.push(f);
			// Middle
			if (this.get('stretch') && this.get('scale')) for (var i=0; i<g.length-1; i++) {
        f = new ol_Feature( { geometry: new ol_geom_Point([(g[i][0]+g[i+1][0])/2,(g[i][1]+g[i+1][1])/2]), handle:'scale', constraint:i%2?"h":"v", option:i });
				features.push(f);
			}
			// Handles
			if (this.get('scale')) for (var i=0; i<g.length-1; i++) {
        f = new ol_Feature( { geometry: new ol_geom_Point(g[i]), handle:'scale', option:i });
				features.push(f);
			}
			// Center
			if (this.get('translate') && !this.get('translateFeature')) {
        f = new ol_Feature( { geometry: new ol_geom_Point([(g[0][0]+g[2][0])/2, (g[0][1]+g[2][1])/2]), handle:'translate' });
				features.push(f);
			}
		}
		// Rotate
		if (this.get('rotate')) {
      f = new ol_Feature( { geometry: new ol_geom_Point(g[3]), handle:'rotate' });
			features.push(f);
		}
		// Add sketch
		this.overlayLayer_.getSource().addFeatures(features);
	}

};

/** Select a feature to transform
* @param {ol.Feature} feature the feature to transform
* @param {boolean} add true to add the feature to the selection, default false
*/
ol_interaction_Transform.prototype.select = function(feature, add) {
	if (add) this.selection_.push(feature);
	else this.selection_ = [feature];
	this.ispt_ = this.selection_.length===1 ? (this.selection_[0].getGeometry().getType() == "Point") : false;
	this.drawSketch_();
	this.dispatchEvent({ type:'select', feature: feature });
}

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ol_interaction_Transform.prototype.handleDownEvent_ = function(evt) {
	var sel = this.getFeatureAtPixel_(evt.pixel);
	var feature = sel.feature;
	if (this.selection_.length
		&& this.selection_.indexOf(feature) >=0
		&& ((this.ispt_ && this.get('translate')) || this.get('translateFeature'))
	){
		sel.handle = 'translate';
	}
	if (sel.handle) {
		this.mode_ = sel.handle;
		this.opt_ = sel.option;
		this.constraint_ = sel.constraint;
		// Save info
		this.coordinate_ = evt.coordinate;
		this.pixel_ = evt.pixel;
		this.geoms_ = [];
		var extent = ol.extent.createEmpty();
    for (var i=0, f; f=this.selection_[i]; i++) {
			this.geoms_.push(f.getGeometry().clone());
			extent = ol.extent.extend(extent, f.getGeometry().getExtent());
    }
		this.extent_ = (ol_geom_Polygon.fromExtent(extent)).getCoordinates()[0];
		if (this.mode_==='rotate') {
			this.center_ = this.getCenter() || ol_extent.getCenter(extent);

			// we are now rotating (cursor down on rotate mode), so apply the grabbing cursor
			var element = evt.map.getTargetElement();
			element.style.cursor = this.Cursors.rotate0;
			this.previousCursor_ = element.style.cursor;
		} else {
			this.center_ = ol_extent.getCenter(extent);
		}
		this.angle_ = Math.atan2(this.center_[1]-evt.coordinate[1], this.center_[0]-evt.coordinate[0]);

		this.dispatchEvent({
			type: this.mode_+'start',
			feature: this.selection_[0], // backward compatibility
			features: this.selection_,
			pixel: evt.pixel,
			coordinate: evt.coordinate
		});
		return true;
	}
	else {
    if (feature){
      if (!this.addFn_(evt)) this.selection_ = [];
      var index = this.selection_.indexOf(feature);
      if (index < 0) this.selection_.push(feature);
      else this.selection_.splice(index,1);
    } else {
      this.selection_ = [];
    }
		this.ispt_ = this.selection_.length===1 ? (this.selection_[0].getGeometry().getType() == "Point") : false;
		this.drawSketch_();
		this.dispatchEvent({ type:'select', feature: this.selection_, pixel: evt.pixel, coordinate: evt.coordinate });
		return false;
	}
};

/**
 * Get the rotation center
 * @return {ol.coordinates|undefined}
 */
ol_interaction_Transform.prototype.getCenter = function() {
	return this.get('center');
}

/**
 * Set the rotation center
 * @param {ol.coordinates|undefined} c the center point, default center on the objet
 */
ol_interaction_Transform.prototype.setCenter = function(c) {
	return this.set('center', c);
}

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ol_interaction_Transform.prototype.handleDragEvent_ = function(evt) {
	switch (this.mode_) {
		case 'rotate': {
			var a = Math.atan2(this.center_[1]-evt.coordinate[1], this.center_[0]-evt.coordinate[0]);
			if (!this.ispt) {
				// var geometry = this.geom_.clone();
				// geometry.rotate(a-this.angle_, this.center_);
				// this.feature_.setGeometry(geometry);
				for (var i=0, f; f=this.selection_[i]; i++) {
					var geometry = this.geoms_[i].clone();
					geometry.rotate(a - this.angle_, this.center_);
					f.setGeometry(geometry);
				}
			}
			this.drawSketch_(true);
			this.dispatchEvent({
				type:'rotating',
				feature: this.selection_[0],
				features: this.selection_,
				angle: a-this.angle_,
				pixel: evt.pixel,
				coordinate: evt.coordinate
			});
			break;
		}
		case 'translate': {
			var deltaX = evt.coordinate[0] - this.coordinate_[0];
			var deltaY = evt.coordinate[1] - this.coordinate_[1];

      //this.feature_.getGeometry().translate(deltaX, deltaY);
      for (var i=0, f; f=this.selection_[i]; i++) {
        f.getGeometry().translate(deltaX, deltaY);
      }
			this.handles_.forEach(function(f) {
				f.getGeometry().translate(deltaX, deltaY);
			});

			this.coordinate_ = evt.coordinate;
			this.dispatchEvent({
				type:'translating',
				feature: this.selection_[0],
				features: this.selection_,
				delta:[deltaX,deltaY],
				pixel: evt.pixel,
				coordinate: evt.coordinate
			});
			break;
		}
		case 'scale': {
			var center = this.center_;
			if (evt.originalEvent.metaKey || evt.originalEvent.ctrlKey) {
				center = this.extent_[(Number(this.opt_)+2)%4];
			}

			var scx = (evt.coordinate[0] - center[0]) / (this.coordinate_[0] - center[0]);
			var scy = (evt.coordinate[1] - center[1]) / (this.coordinate_[1] - center[1]);

			if (this.constraint_) {
				if (this.constraint_=="h") scx=1;
				else scy=1;
			} else {
				if (this.get('keepAspectRatio')(evt)) {
					scx = scy = Math.min(scx,scy);
				}
			}

      for (var i=0, f; f=this.selection_[i]; i++) {
        var geometry = this.geoms_[i].clone();
        geometry.applyTransform(function(g1, g2, dim) {
          if (dim<2) return g2;

          for (var i=0; i<g1.length; i+=dim) {
            if (scx!=1) g2[i] = center[0] + (g1[i]-center[0])*scx;
            if (scy!=1) g2[i+1] = center[1] + (g1[i+1]-center[1])*scy;
          }
          return g2;
        });
        f.setGeometry(geometry);
      }
			this.drawSketch_();
			this.dispatchEvent({
				type:'scaling',
				feature: this.selection_[0],
				features: this.selection_,
				scale:[scx,scy],
				pixel: evt.pixel,
				coordinate: evt.coordinate
			});
		}
		default: break;
	}
};

/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol_interaction_Transform.prototype.handleMoveEvent_ = function(evt) {
	// console.log("handleMoveEvent");
	if (!this.mode_)
	{	var map = evt.map;
		var sel = this.getFeatureAtPixel_(evt.pixel);
		var element = evt.map.getTargetElement();
		if (sel.feature)
		{	var c = sel.handle ? this.Cursors[(sel.handle||'default')+(sel.constraint||'')+(sel.option||'')] : this.Cursors.select;

			if (this.previousCursor_===undefined)
			{	this.previousCursor_ = element.style.cursor;
			}
			element.style.cursor = c;
		}
		else
		{	if (this.previousCursor_!==undefined) element.style.cursor = this.previousCursor_;
			this.previousCursor_ = undefined;
		}
	}
};

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol_interaction_Transform.prototype.handleUpEvent_ = function(evt) {
  // remove rotate0 cursor on Up event, otherwise it's stuck on grab/grabbing
  if (this.mode_ === 'rotate') {
    var element = evt.map.getTargetElement();
    element.style.cursor = this.Cursors.default;
    this.previousCursor_ = undefined;
  }

  //dispatchEvent
	this.dispatchEvent({
		type:this.mode_+'end',
		feature: this.selection_[0],
		features: this.selection_,
		oldgeom: this.geoms_[0],
		oldgeoms: this.geoms_
	});

	this.drawSketch_();
	this.mode_ = null;
	return false;
};

export default ol_interaction_Transform
