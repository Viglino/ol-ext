/** Interaction rotate
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @fires select | rotatestart | rotating | rotateend | translatestart | translating | translateend | scalestart | scaling | scaleend
 * @param {olx.interaction.TransformOptions} 
 *  - layers {Array<ol.Layer>} array of layers to transform, 
 *  - features {ol.Collection<ol.Feature>} collection of feature to transform, 
 *	- translateFeature {bool} Translate when click on feature
 *	- translate {bool} Can translate the feature
 *	- stretch {bool} can stretch the feature
 *	- scale {bool} can scale the feature
 *	- rotate {bool} can rotate the feature
 *	- style {} list of ol.style for handles
 *
 */
ol.interaction.Transform = function(options) 
{	if (!options) options={};
	var self = this;

	ol.interaction.Pointer.call(this, 
	{	handleDownEvent: this.handleDownEvent_,
		handleDragEvent: this.handleDragEvent_,
		handleMoveEvent: this.handleMoveEvent_,
		handleUpEvent: this.handleUpEvent_
	});

	/** Collection of feature to transform */
	this.features_ = options.features;
	/** List of layers to transform */
	this.layers_ = options.layers ? (options.layers instanceof Array) ? options.layers:[options.layers] : null;

	/** Translate when click on feature */
	this.set('translateFeature', (options.translateFeature!==false));
	/** Can translate the feature */
	this.set('translate', (options.translate!==false));
	/** Can stretch the feature */
	this.set('stretch', (options.stretch!==false));
	/** Can scale the feature */
	this.set('scale', (options.scale!==false));
	/** Can rotate the feature */
	this.set('rotate', (options.rotate!==false));

	// Force redraw when changed
	this.on ('propertychange', function()
	{	this.drawSketch_();
	});

	// Create a new overlay layer for the sketch
	this.handles_ = new ol.Collection();
	this.overlayLayer_ = new ol.layer.Vector(
		{	source: new ol.source.Vector({
				features: this.handles_,
				useSpatialIndex: false
			}),
			name:'Transform overlay',
			displayInLayerSwitcher: false,
			// Return the style according to the handle type
			style: function (feature)
				{	return (self.style[(feature.get('handle')||'default')+(feature.get('constraint')||'')+(feature.get('option')||'')]);
				}
		});

	// setstyle
	this.setDefaultStyle();

};
ol.inherits(ol.interaction.Transform, ol.interaction.Pointer);

/** Cursors for transform
*/
ol.interaction.Transform.prototype.Cursors = 
{	'default':	'auto',
	'select':	'pointer',
	'translate':'move',
	'rotate':	'move',
	'scale':	'ne-resize', 
	'scale1':	'nw-resize', 
	'scale2':	'ne-resize', 
	'scale3':	'nw-resize',
	'scalev':	'e-resize', 
	'scaleh1':	'n-resize', 
	'scalev2':	'e-resize', 
	'scaleh3':	'n-resize'
};

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.Transform.prototype.setMap = function(map) 
{	if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
	ol.interaction.Pointer.prototype.setMap.call (this, map);
	this.overlayLayer_.setMap(map);
	this.isTouch = /touch/.test(map.getViewport().className);
	this.setDefaultStyle();
};

/**
 * Activate/deactivate interaction
 * @param {bool} 
 * @api stable
 */
ol.interaction.Transform.prototype.setActive = function(b) 
{	ol.interaction.Pointer.prototype.setActive.call (this, b);
	if (b) this.select(null);
};


/** Set efault sketch style
*/
ol.interaction.Transform.prototype.setDefaultStyle = function() 
{	// Style
	var stroke = new ol.style.Stroke({ color: [255,0,0,1], width: 1 });
	var strokedash = new ol.style.Stroke({ color: [255,0,0,1], width: 1, lineDash:[4,4] });
	var fill0 = new ol.style.Fill({ color:[255,0,0,0.01] });
	var fill = new ol.style.Fill({ color:[255,255,255,0.8] });
	var circle = new ol.style.RegularShape({
					fill: fill,
					stroke: stroke,
					radius: this.isTouch ? 12 : 6,
					points: 15
				});
	circle.getAnchor()[0] = this.isTouch ? -10 : -5;
	var bigpt = new ol.style.RegularShape({
					fill: fill,
					stroke: stroke,
					radius: this.isTouch ? 16 : 8,
					points: 4,
					angle: Math.PI/4
				});
	var smallpt = new ol.style.RegularShape({
					fill: fill,
					stroke: stroke,
					radius: this.isTouch ? 12 : 6,
					points: 4,
					angle: Math.PI/4
				});
	function createStyle (img, stroke, fill) 
	{	return [ new ol.style.Style({image:img, stroke:stroke, fill:fill}) ];
	}
	/** Style for handles */
	this.style = 
	{	'default': createStyle (bigpt, strokedash, fill0),
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
ol.interaction.Transform.prototype.setStyle = function(style, olstyle) 
{	if (!olstyle) return;
	if (olstyle instanceof Array) this.style[style] = olstyle;
	else this.style[style] = [ olstyle ];
	for (var i=0; i<this.style[style].length; i++)
	{	var im = this.style[style][i].getImage();
		if (im) 
		{	if (style == 'rotate') im.getAnchor()[0] = -5;
			if (this.isTouch) im.setScale(1.8);
		}
		var tx = this.style[style][i].getText();
		if (tx) 
		{	if (style == 'rotate') tx.setOffsetX(this.isTouch ? 14 : 7);
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
ol.interaction.Transform.prototype.getFeatureAtPixel_ = function(pixel) 
{	return this.getMap().forEachFeatureAtPixel(pixel,
		function(feature, layer) 
		{	var found = false;
			// Overlay ?
			if (!layer)
			{	if (feature===this.bbox_) return false;
				this.handles_.forEach (function(f) { if (f===feature) found=true; });
				if (found) return { feature: feature, handle:feature.get('handle'), constraint:feature.get('constraint'), option:feature.get('option') };
			}
			// feature belong to a layer
			if (this.layers_)
			{	for (var i=0; i<this.layers_.length; i++)
				{	if (this.layers_[i]===layer) return { feature: feature };
				}
				return null;
			}
			// feature in the collection
			else if (this.features_)
			{	this.features_.forEach (function(f) { if (f===feature) found=true; });
				if (found) return { feature: feature };
				else return null;
			}
			// Others
			else return { feature: feature };
		}, this) || {};
}

/** Draw transform sketch
* @param {boolean} draw only the center
*/
ol.interaction.Transform.prototype.drawSketch_ = function(center)
{
	this.overlayLayer_.getSource().clear();
	if (!this.feature_) return;
	if (center===true)
	{	if (!this.ispt_) 
		{	this.overlayLayer_.getSource().addFeature(new ol.Feature( { geometry: new ol.geom.Point(this.center_), handle:'rotate0' }) );
			var ext = this.feature_.getGeometry().getExtent();
			var geom = ol.geom.Polygon.fromExtent(ext);
			var f = this.bbox_ = new ol.Feature(geom);
			this.overlayLayer_.getSource().addFeature (f);
		}
	}
	else
	{	var ext = this.feature_.getGeometry().getExtent();
		if (this.ispt_) 
		{	var p = this.getMap().getPixelFromCoordinate([ext[0], ext[1]]);
			ext = ol.extent.boundingExtent(
				[	this.getMap().getCoordinateFromPixel([p[0]-10, p[1]-10]),
					this.getMap().getCoordinateFromPixel([p[0]+10, p[1]+10])
				]);
		}
		var geom = ol.geom.Polygon.fromExtent(ext);
		var f = this.bbox_ = new ol.Feature(geom);
		var features = [];
		var g = geom.getCoordinates()[0];
		if (!this.ispt_) 
		{	features.push(f);
			// Middle
			if (this.get('stretch') && this.get('scale')) for (var i=0; i<g.length-1; i++)
			{	f = new ol.Feature( { geometry: new ol.geom.Point([(g[i][0]+g[i+1][0])/2,(g[i][1]+g[i+1][1])/2]), handle:'scale', constraint:i%2?"h":"v", option:i });
				features.push(f);
			}
			// Handles
			if (this.get('scale')) for (var i=0; i<g.length-1; i++)
			{	f = new ol.Feature( { geometry: new ol.geom.Point(g[i]), handle:'scale', option:i });
				features.push(f);
			}
			// Center
			if (this.get('translate') && !this.get('translateFeature'))
			{	f = new ol.Feature( { geometry: new ol.geom.Point([(g[0][0]+g[2][0])/2, (g[0][1]+g[2][1])/2]), handle:'translate' });
				features.push(f);
			}
		}
		// Rotate
		if (this.get('rotate')) 
		{	f = new ol.Feature( { geometry: new ol.geom.Point(g[3]), handle:'rotate' });
			features.push(f);
		}
		// Add sketch
		this.overlayLayer_.getSource().addFeatures(features);
	}

};

/** Select a feature to transform
* @param {ol.Feature} the feature to transform
*/
ol.interaction.Transform.prototype.select = function(feature)
{	this.feature_ = feature;
	this.ispt_ = this.feature_ ? (this.feature_.getGeometry().getType() == "Point") : false;
	this.drawSketch_();
	this.dispatchEvent({ type:'select', feature: this.feature_ });
}

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ol.interaction.Transform.prototype.handleDownEvent_ = function(evt) 
{
	var sel = this.getFeatureAtPixel_(evt.pixel);
	var feature = sel.feature;
	if (this.feature_ && this.feature_==feature && ((this.ispt_ && this.get('translate')) || this.get('translateFeature')))
	{	sel.handle = 'translate';
	}
	if (sel.handle)
	{	this.mode_ = sel.handle;
		this.opt_ = sel.option;
		this.constraint_ = sel.constraint;
		// Save info
		this.coordinate_ = evt.coordinate;
		this.pixel_ = evt.pixel;
		this.geom_ = this.feature_.getGeometry().clone();
		this.extent_ = (ol.geom.Polygon.fromExtent(this.geom_.getExtent())).getCoordinates()[0];
		this.center_ = ol.extent.getCenter(this.geom_.getExtent());
		this.angle_ = Math.atan2(this.center_[1]-evt.coordinate[1], this.center_[0]-evt.coordinate[0]);

		this.dispatchEvent({ type:this.mode_+'start', feature: this.feature_, pixel: evt.pixel, coordinate: evt.coordinate });
		return true;
	}
	else
	{	this.feature_ = feature;
		this.ispt_ = this.feature_ ? (this.feature_.getGeometry().getType() == "Point") : false;
		this.drawSketch_();
		this.dispatchEvent({ type:'select', feature: this.feature_, pixel: evt.pixel, coordinate: evt.coordinate });
		return false;
	}

};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ol.interaction.Transform.prototype.handleDragEvent_ = function(evt) 
{
	switch (this.mode_)
	{	case 'rotate':
		{	var a = Math.atan2(this.center_[1]-evt.coordinate[1], this.center_[0]-evt.coordinate[0]);
			if (!this.ispt)
			{	var geometry = this.geom_.clone();
				geometry.rotate(a-this.angle_, this.center_);
				
				this.feature_.setGeometry(geometry);
			}
			this.drawSketch_(true);
			this.dispatchEvent({ type:'rotating', feature: this.feature_, angle: a-this.angle_, pixel: evt.pixel, coordinate: evt.coordinate });
			break;
		}
		case 'translate':
		{	var deltaX = evt.coordinate[0] - this.coordinate_[0];
			var deltaY = evt.coordinate[1] - this.coordinate_[1];

			this.feature_.getGeometry().translate(deltaX, deltaY);
			this.handles_.forEach(function(f)
			{	f.getGeometry().translate(deltaX, deltaY);
			});

			this.coordinate_ = evt.coordinate;
			this.dispatchEvent({ type:'translating', feature: this.feature_, delta:[deltaX,deltaY], pixel: evt.pixel, coordinate: evt.coordinate });
			break;
		}
		case 'scale':
		{	var center = this.center_;
			if (evt.originalEvent.metaKey || evt.originalEvent.ctrlKey)
			{	center = this.extent_[(Number(this.opt_)+2)%4];
			}

			var scx = (evt.coordinate[0] - center[0]) / (this.coordinate_[0] - center[0]);
			var scy = (evt.coordinate[1] - center[1]) / (this.coordinate_[1] - center[1]);

			if (this.constraint_)
			{	if (this.constraint_=="h") scx=1;
				else scy=1;
			}
			else
			{	if (evt.originalEvent.shiftKey)
				{	scx = scy = Math.min(scx,scy);
				}
			}

			var geometry = this.geom_.clone();
			geometry.applyTransform(function(g1, g2, dim)
			{	if (dim<2) return g2;
				
				for (i=0; i<g1.length; i+=dim)
				{	if (scx!=1) g2[i] = center[0] + (g1[i]-center[0])*scx;
					if (scy!=1) g2[i+1] = center[1] + (g1[i+1]-center[1])*scy;
				}
				return g2;
			});
			this.feature_.setGeometry(geometry);
			this.drawSketch_();
			this.dispatchEvent({ type:'scaling', feature: this.feature_, scale:[scx,scy], pixel: evt.pixel, coordinate: evt.coordinate });
		}
		default: break;
	}
};

/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol.interaction.Transform.prototype.handleMoveEvent_ = function(evt) 
{
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
ol.interaction.Transform.prototype.handleUpEvent_ = function(evt) 
{	//dispatchEvent 
	this.dispatchEvent({ type:this.mode_+'end', feature: this.feature_, oldgeom: this.geom_ });
	
	this.drawSketch_();
	this.mode_ = null;
	return false;
};
