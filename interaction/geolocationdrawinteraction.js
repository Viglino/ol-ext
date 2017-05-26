/** Interaction to draw on the current geolocation
 *	It combines a draw with a ol.Geolocation
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires drawstart, drawend, drawing
 * @param {olx.interaction.GeolocationDrawOption} 
 *	- features { ol.Collection.<ol.Feature> | undefined } Destination collection for the drawn features.
 *	- source { ol.source.Vector | undefined } Destination source for the drawn features.
 *	- type {ol.geom.GeometryType} Drawing type ('Point', 'LineString', 'Polygon'). Required.
 *	- tolerance {Number} tolerance to add a new point (in projection unit), use ol.geom.LineString.simplify() method, default 5
 *	- zoom {Number} zoom for tracking, default 16
 *	- preventTracking {boolean} true if you don't want the interaction to track on the map, default false
 *	- style { ol.style.Style | Array.<ol.style.Style> | ol.StyleFunction | undefined } Style for sketch features.
 *	- minAccuracy {Number} minimum accuracy underneath a new point will be register (if no condition), default 20
 *	- condition {} a function that take a ol.Geolocation object and return a boolean to indicate whether location should be handled or not, default return true if accuraty < minAccuraty
 */
ol.interaction.GeolocationDraw = function(options) 
{	if (!options) options={};
	var self = this;

	// Geolocation
	var geoloc = this.geolocation = new ol.Geolocation(/** @type {olx.GeolocationOptions} */ 
	({	projection: "EPSG:4326",
		trackingOptions: 
		{	maximumAge: 10000,
			enableHighAccuracy: true,
			timeout: 600000
		}
	}));
	this.geolocation.on('change', this.draw_, this);

	// Current path
	this.path_ = [];

	// Default style
	var white = [255, 255, 255, 1];
	var blue = [0, 153, 255, 1];
	var width = 3;
	var style = 
	[	new ol.style.Style(
		{	stroke: new ol.style.Stroke({ color: white, width: width + 2 })
		}),
		new ol.style.Style(
		{	stroke: new ol.style.Stroke({ color: blue, width: width }),
			fill: new ol.style.Fill({
				color: [255, 255, 255, 0.5]
			})
		}),
		new ol.style.Style(
		{	image: new ol.style.RegularShape(
			{	radius: width * 3.5,
				points: 3,
				rotation: 0,
				fill: new ol.style.Fill({ color: blue }),
				stroke: new ol.style.Stroke({ color: white, width: width / 2 })
			})
		})
	];
	// stretch the symbol
	var c = style[2].getImage().getImage();
	var ctx = c.getContext("2d");
		var c2 = document.createElement('canvas');
		c2.width = c2.height = c.width;
		c2.getContext("2d").drawImage(c, 0,0);
	ctx.clearRect(0,0,c.width,c.height);
	ctx.drawImage(c2, 0,0, c.width, c.height, width, 0, c.width-2*width, c.height);

	var defaultStyle = function(f)
	{	style[2].getImage().setRotation( f.get('heading') || 0);
		return style;
	}
	// Style for the accuracy geometry
	this.locStyle = 
		{	error: new ol.style.Style({ fill: new ol.style.Fill({ color: [255, 0, 0, 0.2] }) }),
			warn: new ol.style.Style({ fill: new ol.style.Fill({ color: [255, 192, 0, 0.2] }) }),
			ok: new ol.style.Style({ fill: new ol.style.Fill({ color: [0, 255, 0, 0.2] }) }),
		};

	// Create a new overlay layer for the sketch
	this.overlayLayer_ = new ol.layer.Vector(
	{	source: new ol.source.Vector(),
		name:'GeolocationDraw overlay',
		style: options.style || defaultStyle
	});

	this.sketch_ = [new ol.Feature(), new ol.Feature(), new ol.Feature()];
	this.overlayLayer_.getSource().addFeatures(this.sketch_);

	this.features_ = options.features;
	this.source_ = options.source;

	this.condition_ = options.condition || function(loc) { return loc.getAccuracy() < this.get("minAccuracy") };

	// Prevent interaction when tracking
	ol.interaction.Interaction.call(this, 
	{	handleEvent: function()
		{	return (this.get('preventTracking') || !geoloc.getTracking());
		}
	});

	this.set("type", options.type||"LineString");
	this.set("minAccuracy", options.minAccuracy||20);
	this.set("tolerance", options.tolerance||5);
	this.set("zoom", options.zoom||16);
	this.set("preventTracking", options.preventTracking||false);

};
ol.inherits(ol.interaction.GeolocationDraw, ol.interaction.Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.GeolocationDraw.prototype.setMap = function(map) 
{	if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
	ol.interaction.Pointer.prototype.setMap.call (this, map);
	this.overlayLayer_.setMap(map);
	if (map) this.geolocation.setProjection(map.getView().getProjection());
};

/** Activate or deactivate the interaction.
* @param {boolean} active
*/
ol.interaction.GeolocationDraw.prototype.setActive = function(active)
{	ol.interaction.Interaction.prototype.setActive.call(this, active);
	this.overlayLayer_.setVisible(active);
	this.reset();
	if (this.getMap())
	{	this.geolocation.setTracking(active);
		this.getMap().renderSync();
	}
};

/** Reset drawing
*/
ol.interaction.GeolocationDraw.prototype.reset = function()
{	this.sketch_[1].setGeometry();
	this.path_ = [];
};

/** Force drawing
*/
ol.interaction.GeolocationDraw.prototype.start = function()
{	this.pause(false);
	// Start drawing
	this.dispatchEvent({ type:'drawstart', feature: this.sketch_[1]});
	// Get a point if got one
	//if (this.get("type")=="Point") this.stop(); 
};

/** Stop drawing
*/
ol.interaction.GeolocationDraw.prototype.stop = function()
{	var f = this.sketch_[1].clone();
	if (f.getGeometry())
	{	if (this.features_) this.features_.push(f);
		if (this.source_) this.source_.addFeature(f);
		this.dispatchEvent({ type:'drawend', feature: this.sketch_[1]});
	}
	this.reset();
	this.pause(true);
};

/** Pause drawing
* @param {boolean} b 
*/
ol.interaction.GeolocationDraw.prototype.pause = function(b)
{	this.pause_ = b;
};

/** Add a new point to the current path
* @private
*/
ol.interaction.GeolocationDraw.prototype.draw_ = function(active)
{	var map = this.getMap();
	if (!map) return;
	var loc = this.geolocation;
	var accu = loc.getAccuracy();
	var pos = loc.getPosition();
	pos.push(loc.getAltitude());
	var p = loc.getAccuracyGeometry();

	// Center on point
	if (!this.get('preventTracking'))
	{	map.getView().setCenter( pos );
		map.getView().setZoom( this.get("zoom") || 16 );
		if (!ol.extent.containsExtent(map.getView().calculateExtent(map.getSize()), p.getExtent()))
		{	map.getView().fit(p.getExtent());
		}
	}
	
	// Draw occuracy
	var f = this.sketch_[0];
	f.setGeometry(p);
	if (accu < this.get("minAccuracy")/2) f.setStyle(this.locStyle.ok);
	else if (accu < this.get("minAccuracy")) f.setStyle(this.locStyle.warn);
	else f.setStyle(this.locStyle.error);

	var geo;
	if (!this.pause_ && this.condition_.call(this, loc))
	{	f = this.sketch_[1];
		this.path_.push(pos);
		switch (this.get("type"))
		{	case "Point":
				this.path_ = [pos];
				f.setGeometry(new ol.geom.Point(pos));
				break;
			case "LineString":
				if (this.path_.length>1)
				{	geo = new ol.geom.LineString(this.path_);
					geo.simplify (this.get("tolerance"));
					f.setGeometry(geo);
				}
				else f.setGeometry();
				break;
			case "Polygon":
				if (this.path_.length>2)
				{	geo = new ol.geom.Polygon([this.path_]);
					geo.simplify (this.get("tolerance"));
					f.setGeometry(geo);
				}
				else f.setGeometry();
				break;
		}
		this.sketch_[2].setGeometry(new ol.geom.Point(pos));
		this.sketch_[2].set("heading",loc.getHeading());
		$("#heading").val(loc.getHeading());
	}
	// Drawing
	this.dispatchEvent({ type:'drawing', feature: this.sketch_[1], geolocation: loc });
};
