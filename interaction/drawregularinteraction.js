/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction rotate
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires drawstart, drawing, drawend, drawcancel
 * @param {olx.interaction.TransformOptions} options
 *  @param {Array<ol.Layer>} source Destination source for the drawn features
 *  @param {ol.Collection<ol.Feature>} features Destination collection for the drawn features 
 *	@param {ol.style.Style | Array.<ol.style.Style> | ol.style.StyleFunction | undefined} style style for the sketch
 *	@param {integer} sides number of sides, default 0 = circle
 *	@param { ol.events.ConditionType | undefined } squareCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw square features.
 *	@param { ol.events.ConditionType | undefined } centerCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw centered features.
 *	@param { bool } canRotate Allow rotation when centered + square, default: true
 *	@param { number } clickTolerance click tolerance on touch devices, default: 6
 *	@param { number } maxCircleCoordinates Maximum number of point on a circle, default: 100
 */
ol.interaction.DrawRegular = function(options) 
{	if (!options) options={};
	var self = this;

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
			style: options.style || defaultStyle
		});

	ol.interaction.Interaction.call(this, 
		{	
			/*
			handleDownEvent: this.handleDownEvent_,
			handleMoveEvent: this.handleMoveEvent_,
			handleUpEvent: this.handleUpEvent_,
			*/
			handleEvent: this.handleEvent_
		});
};
ol.inherits(ol.interaction.DrawRegular, ol.interaction.Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setMap = function(map) 
{	if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
	ol.interaction.Interaction.prototype.setMap.call (this, map);
	this.overlayLayer_.setMap(map);
};

/**
 * Activate/deactivate the interaction
 * @param {boolean}
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setActive = function(b) 
{	this.reset();
	ol.interaction.Interaction.prototype.setActive.call (this, b);
}

/**
 * Reset the interaction
 * @api stable
 */
ol.interaction.DrawRegular.prototype.reset = function() 
{	this.overlayLayer_.getSource().clear();
	this.started_ = false;
}

/**
 * Set the number of sides.
 * @param {int} number of sides.
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setSides = function (nb)
{	nb = parseInt(nb);
	this.sides_ = nb>2 ? nb : 0;
}

/**
 * Allow rotation when centered + square
 * @param {bool} 
 * @api stable
 */
ol.interaction.DrawRegular.prototype.canRotate = function (b)
{	if (b===true || b===false) this.canRotate_ = b;
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

		// Special case: circle
		if (!this.sides_ && this.square_ && !this.centered_){
			center = [(coord[0] + center[0])/2, (coord[1] + center[1])/2];
			var d = [coord[0] - center[0], coord[1] - center[1]];
			var r = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
			var circle = new ol.geom.Circle(center, r, 'XY');
			// Optimize points on the circle
			var centerPx = this.getMap().getPixelFromCoordinate(center);
			var dmax = Math.max (100, Math.abs(centerPx[0]-this.coordPx_[0]), Math.abs(centerPx[1]-this.coordPx_[1]));
			dmax = Math.min ( this.maxCircleCoordinates_, Math.round(dmax / 3 ));
			return ol.geom.Polygon.fromCircle (circle, dmax, 0);
		}
		else {
			var hasrotation = this.canRotate_ && this.centered_ && this.square_;
			var d = [coord[0] - center[0], coord[1] - center[1]];
			if (this.square_ && !hasrotation) 
			{	//var d = [coord[0] - center[0], coord[1] - center[1]];
				var dm = Math.max (Math.abs(d[0]), Math.abs(d[1])); 
				coord[0] = center[0] + (d[0]>0 ? dm:-dm);
				coord[1] = center[1] + (d[1]>0 ? dm:-dm);
			}
			var r = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
			if (r>0)
			{	var circle = new ol.geom.Circle(center, r, 'XY');
				var a;
				if (hasrotation) a = Math.atan2(d[1], d[0]);
				else a = this.startAngle[this.sides_] || this.startAngle['default'];

				if (this.sides_) g = ol.geom.Polygon.fromCircle (circle, this.sides_, a);
				else
				{	// Optimize points on the circle
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
			if (this.coord_ && this.square_ && ((this.canRotate_ && this.centered_ && this.coord_) || (!this.sides_ && !this.centered_)))
			{	this.overlayLayer_.getSource().addFeature(new ol.Feature(new ol.geom.LineString([this.center_,this.coord_])));
			}
			return f;
		}
	}
};

/** Draw sketch (Point)
*/
ol.interaction.DrawRegular.prototype.drawPoint_ = function(pt, noclear)
{	if (!noclear) this.overlayLayer_.getSource().clear();
	this.overlayLayer_.getSource().addFeature(new ol.Feature(new ol.geom.Point(pt)));
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ol.interaction.DrawRegular.prototype.handleEvent_ = function(evt) 
{	switch (evt.type)
	{	case "pointerdown": {
			this.downPx_ = evt.pixel;
			this.start_(evt);
		}
		break;
		case "pointerup":
			// Started and fisrt move
			if (this.started_ && this.coord_)
			{	var dx = this.downPx_[0] - evt.pixel[0];
				var dy = this.downPx_[1] - evt.pixel[1];
				if (dx*dx + dy*dy <= this.squaredClickTolerance_) 
				{	// The pointer has moved
					if ( this.lastEvent == "pointermove" )
					{	this.end_(evt);
					}
					// On touch device there is no move event : terminate = click on the same point
					else
					{	dx = this.upPx_[0] - evt.pixel[0];
						dy = this.upPx_[1] - evt.pixel[1];
						if ( dx*dx + dy*dy <= this.squaredClickTolerance_)
						{	this.end_(evt);
						}
						else 
						{	this.handleMoveEvent_(evt);
							this.drawPoint_(evt.coordinate,true);
						}
					}
				}
			}
			this.upPx_ = evt.pixel;	
		break;
		case "pointerdrag":
			if (this.started_)
			{	var centerPx = this.getMap().getPixelFromCoordinate(this.center_);
				var dx = centerPx[0] - evt.pixel[0];
				var dy = centerPx[1] - evt.pixel[1];
				if (dx*dx + dy*dy <= this.squaredClickTolerance_) 
				{ 	this.reset();
				}
			}
			break;
		case "pointermove":
			if (this.started_)
			{	var dx = this.downPx_[0] - evt.pixel[0];
				var dy = this.downPx_[1] - evt.pixel[1];
				if (dx*dx + dy*dy > this.squaredClickTolerance_) 
				{	this.handleMoveEvent_(evt);
					this.lastEvent = evt.type;
				}
			}
			break;
		default:
			this.lastEvent = evt.type;
			// Prevent zoom in on dblclick
			if (this.started_ && evt.type==='dblclick') 
			{	//evt.stopPropagation();
				return false;
			}
			break;
	}
	return true;
}

/** Stop drawing.
 */
ol.interaction.DrawRegular.prototype.finishDrawing = function() 
{	if (this.started_ && this.coord_)
	{	this.end_({ pixel: this.upPx_, coordinate: this.coord_});
	}
};

/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol.interaction.DrawRegular.prototype.handleMoveEvent_ = function(evt) 
{	if (this.started_)
	{	this.coord_ = evt.coordinate;
		this.coordPx_ = evt.pixel;
		var f = this.drawSketch_(evt);
		this.dispatchEvent({ type:'drawing', feature: f, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
	}
	else 
	{	this.drawPoint_(evt.coordinate);
	}
};

/** Start an new draw
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol.interaction.DrawRegular.prototype.start_ = function(evt) 
{	if (!this.started_)
	{	this.started_ = true;
		this.center_ = evt.coordinate;
		this.coord_ = null;
		var f = this.feature_ = new ol.Feature();
		this.drawSketch_(evt);
		this.dispatchEvent({ type:'drawstart', feature: f, pixel: evt.pixel, coordinate: evt.coordinate });
	}
	else 
	{	this.coord_ = evt.coordinate;
	}
};

/** End drawing
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol.interaction.DrawRegular.prototype.end_ = function(evt) 
{	this.coord_ = evt.coordinate;
	this.started_ = false;
	// Add new feature
	if (this.coord_ && this.center_[0]!=this.coord_[0] && this.center_[1]!=this.coord_[1])
	{	var f = this.feature_;
		f.setGeometry(this.getGeom_());
		if (this.source_) this.source_.addFeature(f);
		else if (this.features_) this.features_.push(f);
		this.dispatchEvent({ type:'drawend', feature: f, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
	}
	else
	{	this.dispatchEvent({ type:'drawcancel', feature: null, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
	}

	this.center_ = this.coord_ = null;
	this.drawSketch_();
};