/** Interaction rotate
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @fires drawstart, drawing, drawend
 * @param {olx.interaction.TransformOptions} 
 *  - source {Array<ol.Layer>} Destination source for the drawn features
 *  - features {ol.Collection<ol.Feature>} Destination collection for the drawn features 
 *	- style {ol.style.Style | Array.<ol.style.Style> | ol.style.StyleFunction | undefined} style for the sketch
 *	- sides {integer} nimber of sides, default 0 = circle
 *	- squareCondition { ol.events.ConditionType | undefined } A function that takes an ol.MapBrowserEvent and returns a boolean to draw square features.
 *	- centerCondition { ol.events.ConditionType | undefined } A function that takes an ol.MapBrowserEvent and returns a boolean to draw centered features.
 *	- canRotate { bool } Allow rotation when centered + square, default: true
 */
ol.interaction.DrawRegular = function(options) 
{	if (!options) options={};
	var self = this;

	ol.interaction.Pointer.call(this, 
	{	handleDownEvent: this.handleDownEvent_,
		handleMoveEvent: this.handleMoveEvent_,
		handleUpEvent: this.handleUpEvent_,
		handleEvent: this.handleEvent_
	});

	this.squaredClickTolerance_ = options.clickTolerance ? options.clickTolerance * options.clickTolerance : 36;
	this.maxCircleCoordinates_ = options.maxCircleCoordinates || 100;

	// Collection of feature to transform 
	this.features_ = options.features;
	// List of layers to transform 
	this.source_ = options.source;
	// Square condition
	this.squareFn_ = options.squareCondition;
	// Centered condition
	this.centeredFn_ = options.centerCondition;
	// Allow rotation when centered + square
	this.canRotate_ = (options.canRotate !== false);

	// Number of sides (default=0: circle)
	this.setSides(options.sides);

	// Style
	var white = [255, 255, 255, 1];
	var blue = [0, 153, 255, 1];
	var width = 3;
	var defaultStyle = [
		new ol.style.Style({
			stroke: new ol.style.Stroke({ color: white, width: width + 2 })
		}),
		new ol.style.Style({
			image: new ol.style.Circle({
				radius: width * 2,
				fill: new ol.style.Fill({ color: blue }),
				stroke: new ol.style.Stroke({ color: white, width: width / 2 })
			}),
			stroke: new ol.style.Stroke({ color: blue, width: width }),
			fill: new ol.style.Fill({
				color: [255, 255, 255, 0.5]
			})
		})
	];

	// Create a new overlay layer for the sketch
	this.sketch_ = new ol.Collection();
	this.overlayLayer_ = new ol.layer.Vector(
		{	source: new ol.source.Vector({
				features: this.sketch_,
				useSpatialIndex: false
			}),
			name:'DrawRegular overlay',
			displayInLayerSwitcher: false,
			style: this.style || defaultStyle
		});
};
ol.inherits(ol.interaction.DrawRegular, ol.interaction.Pointer);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setMap = function(map) 
{	if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
	ol.interaction.Pointer.prototype.setMap.call (this, map);
	this.overlayLayer_.setMap(map);
};

/**
 * Activate/deactivate the interaction
 * @param {boolean}
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setActive = function(b) 
{	this.overlayLayer_.getSource().clear();
	ol.interaction.Pointer.prototype.setActive.call (this, b);
}

/**
 * Set the number of sides.
 * @param {int} number of sides.
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setSides = function (nb)
{	
	nb = parseInt(nb);
	this.sides_ = nb>2 ? nb : 0;
}

/**
 * Allow rotation when centered + square
 * @param {bool} 
 * @api stable
 */
ol.interaction.DrawRegular.prototype.canRotate = function (b)
{	if (b===true ||b===false) this.canRotate_ = b;
	return this.canRotate_;
}

/**
 * Get the number of sides.
 * @return {int} number of sides.
 * @api stable
 */
ol.interaction.DrawRegular.prototype.getSides = function ()
{	return this.sides_;
}

/** Default start angle array for each sides
*/
ol.interaction.DrawRegular.prototype.startAngle =
{	'default':Math.PI/2,
	3: -Math.PI/2,
	4: Math.PI/4
};

/** Get geom of the current drawing
* @return {ol.geom.Polygon | ol.geom.Point}
*/
ol.interaction.DrawRegular.prototype.getGeom_ = function ()
{	this.overlayLayer_.getSource().clear();
	if (!this.center_) return false;
	var g;
	if (this.coord_)
	{	var center = this.center_;
		var coord = this.coord_;
		var hasrotation = this.canRotate_ && this.centered_ && this.square_;
		if (this.square_ && !hasrotation) 
		{	var d = [coord[0] - center[0], coord[1] - center[1]];
			var dm = Math.max (Math.abs(d[0]), Math.abs(d[1])); 
			coord[0] = center[0] + (d[0]>0 ? dm:-dm);
			coord[1] = center[1] + (d[1]>0 ? dm:-dm);
		}
		var d = [coord[0] - center[0], coord[1] - center[1]];
		var r = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
		if (r>0)
		{	var circle = new ol.geom.Circle(center, r, 'XY');
			var a;
			if (hasrotation) a = Math.atan2(d[1], d[0]);
			else a = this.startAngle[this.sides_] || this.startAngle['default'];

			if (this.sides_) g = ol.geom.Polygon.fromCircle (circle, this.sides_, a);
			else
			{	// Opimize points on the circle
				var centerPx = this.getMap().getPixelFromCoordinate(this.center_);
				var dmax = Math.max (100, Math.abs(centerPx[0]-this.coordPx_[0]), Math.abs(centerPx[1]-this.coordPx_[1]));
				dmax = Math.min ( this.maxCircleCoordinates_, Math.round(dmax / (this.centered_ ? 3:5) ));
				g = ol.geom.Polygon.fromCircle (circle, dmax, 0);
			}

			if (hasrotation) return g;

			// Scale polygon to fit extent
			var ext = g.getExtent();
			if (!this.centered_) center = this.center_;
			else center = [ 2*this.center_[0]-this.coord_[0], 2*this.center_[1]-this.coord_[1] ];
			var scx = (center[0] - coord[0]) / (ext[0] - ext[2]);
			var scy = (center[1] - coord[1]) / (ext[1] - ext[3]);
			if (this.square_) 
			{	var sc = Math.min(Math.abs(scx),Math.abs(scy));
				scx = Math.sign(scx)*sc;
				scy = Math.sign(scy)*sc;
			}
			var t = [ center[0] - ext[0]*scx, center[1] - ext[1]*scy ];

			g.applyTransform(function(g1, g2, dim)
			{	for (i=0; i<g1.length; i+=dim)
				{	g2[i] = g1[i]*scx + t[0];
					g2[i+1] = g1[i+1]*scy + t[1];
				}
				return g2;
			});
			return g;
		}
	}
	// No geom => return a point
	return new ol.geom.Point(this.center_);
};

/** Draw sketch
* @return {ol.Feature} The feature being drawn.
*/
ol.interaction.DrawRegular.prototype.drawSketch_ = function(evt)
{	this.overlayLayer_.getSource().clear();
	if (evt)
	{	this.square_ = this.squareFn_ ? this.squareFn_(evt) : evt.originalEvent.shiftKey;
		this.centered_ = this.centeredFn_ ? this.centeredFn_(evt) : evt.originalEvent.metaKey || evt.originalEvent.ctrlKey;
		var g = this.getGeom_();
		if (g) 
		{	var f = this.feature_;
			f.setGeometry (g);
			this.overlayLayer_.getSource().addFeature(f);
			if (this.canRotate_ && this.centered_ && this.square_ && this.coord_) 
			{	this.overlayLayer_.getSource().addFeature(new ol.Feature(new ol.geom.LineString([this.center_,this.coord_])));
			}
			return f;
		}
	}
};

/** Draw sketch (Point)
*/
ol.interaction.DrawRegular.prototype.drawPoint_ = function(pt)
{	this.overlayLayer_.getSource().clear();
	this.overlayLayer_.getSource().addFeature(new ol.Feature(new ol.geom.Point(pt)));
};

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ol.interaction.DrawRegular.prototype.handleDownEvent_ = function(evt) 
{	this.downPx_ = evt.pixel;
	return true;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ol.interaction.DrawRegular.prototype.handleEvent_ = function(evt) 
{	ol.interaction.Pointer.handleEvent.call(this, evt) 
	return true;
}

/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol.interaction.DrawRegular.prototype.handleMoveEvent_ = function(evt) 
{	
	if (this.started_)
	{	this.coord_ = evt.coordinate;
		this.coordPx_ = evt.pixel;
		var f = this.drawSketch_(evt);
		this.dispatchEvent({ type:'drawing', feature: f, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
	}
	else this.drawPoint_(evt.coordinate);
	return false;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol.interaction.DrawRegular.prototype.handleUpEvent_ = function(evt) 
{	var downPx = this.downPx_;
	var clickPx = evt.pixel;
	var dx = downPx[0] - clickPx[0];
	var dy = downPx[1] - clickPx[1];

	if (dx*dx + dy*dy <= this.squaredClickTolerance_) 
	{	if (!this.started_)
		{	this.started_ = true;
			this.center_ = evt.coordinate;
			this.coord_ = null;
			var f = this.feature_ = new ol.Feature();
			this.drawSketch_(evt);
			this.dispatchEvent({ type:'drawstart', feature: f, pixel: evt.pixel, coordinate: evt.coordinate });
		}
		else 
		{	this.started_ = false;
			// Add new feature
			if (this.coord_ && this.center_[0]!=this.coord_[0] && this.center_[1]!=this.coord_[1])
			{	var f = this.feature_;
				f.setGeometry(this.getGeom_());
				if (this.source_) this.source_.addFeature(f);
				else if (this.features_) this.features_.push(f);
				this.dispatchEvent({ type:'drawend', feature: f, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
			}
			else
			{	this.dispatchEvent({ type:'drawend', feature: null, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
			}

			this.center_ = this.coord_ = null;
			this.drawSketch_();
		}
		return false;
	}
	return true;
};
