/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction split interaction for splitting feature geometry
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires  beforesplit, aftersplit
 * @param {olx.interaction.SplitOptions} 
 *	- source {ol.source.Vector|Array{ol.source.Vector}} a list of source to split (configured with useSpatialIndex set to true)
 *	- features {ol.Collection.<ol.Feature>} collection of feature to split
 *	- snapDistance {integer} distance (in px) to snap to an object, default 25px
 *	- filter {function|undefined} a filter that takes a feature and return true if it can be clipped, default always split.
 *	- featureStyle {ol.style.Style | Array<ol.style.Style> | false | undefined} Style for the selected features, choose false if you don't want feature selection. By default the default edit style is used.
 *	- sketchStyle {ol.style.Style | Array<ol.style.Style> | undefined} Style for the sektch features. 
 *	- tolerance {function|undefined} Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split.  Default is 1e-10.
 */
ol.interaction.Split = function(options) 
{	if (!options) options = {};

	ol.interaction.Interaction.call(this, 
	{	handleEvent: function(e)
		{	switch (e.type)
			{	case "singleclick":
					return this.handleDownEvent(e);
				case "pointermove":
					return this.handleMoveEvent(e);
				default: 
					return true;
			}
			return true;
		}
	});

	// Snap distance (in px)
	this.snapDistance_ = options.snapDistance || 25;
	// Split tolerance between the calculated intersection and the geometry
	this.tolerance_ = options.tolerance || 1e-10;

	// List of source to split
	this.sources_ = options.sources ? (options.sources instanceof Array) ? options.sources:[options.sources] : [];

	if (options.features)
	{	this.sources_.push (new ol.source.Vector({ features: features }));
	}

	// Get all features candidate
	this.filterSplit_ = options.filter || function(){ return true; };

	// Default style
	var white = [255, 255, 255, 1];
	var blue = [0, 153, 255, 1];
	var width = 3;
	var fill = new ol.style.Fill({ color: 'rgba(255,255,255,0.4)' });
	var stroke = new ol.style.Stroke({
		color: '#3399CC',
		width: 1.25
	});
 	var sketchStyle = 
	[	new ol.style.Style({
			image: new ol.style.Circle({
				fill: fill,
				stroke: stroke,
				radius: 5
			}),
			fill: fill,
			stroke: stroke
	   })
	 ];
	var featureStyle =
	[	new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: white,
				width: width + 2
			})
		}),
		new ol.style.Style({
			image: new ol.style.Circle({
				radius: 2*width,
				fill: new ol.style.Fill({
					color: blue
				}),
				stroke: new ol.style.Stroke({
					color: white,
					width: width/2
				})
			}),
			stroke: new ol.style.Stroke({
					color: blue,
					width: width
				})
		}),
	];

	// Custom style
	if (options.sketchStyle) sketchStyle = options.sketchStyle instanceof Array ? options.sketchStyle : [options.sketchStyle];
	if (options.featureStyle) featureStyle = options.featureStyle instanceof Array ? options.featureStyle : [options.featureStyle];

	// Create a new overlay for the sketch
	this.overlayLayer_ = new ol.layer.Vector(
	{	source: new ol.source.Vector({
			useSpatialIndex: false
		}),
		name:'Split overlay',
		displayInLayerSwitcher: false,
		style: function(f)
		{	if (f._sketch_) return sketchStyle;
			else return featureStyle;
		}
	});

};
ol.inherits(ol.interaction.Split, ol.interaction.Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.Split.prototype.setMap = function(map) 
{	if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
	ol.interaction.Interaction.prototype.setMap.call (this, map);
	this.overlayLayer_.setMap(map);
};

/** Get closest feature at pixel
 * @param {ol.Pixel} 
 * @return {ol.feature} 
 * @private
 */
ol.interaction.Split.prototype.getClosestFeature = function(e) 
{	var f, c, g, d = this.snapDistance_+1;
	for (var i=0; i<this.sources_.length; i++)
	{	var source = this.sources_[i];
		f = source.getClosestFeatureToCoordinate(e.coordinate);
		if (f.getGeometry().splitAt, this.tolerance_) 
		{	c = f.getGeometry().getClosestPoint(e.coordinate);
			g = new ol.geom.LineString([e.coordinate,c]);
			d = g.getLength() / e.frameState.viewState.resolution;
			break;
		}
	}
	if (d > this.snapDistance_) return false;
	else 
	{	// Snap to node
		var coord = this.getNearestCoord (c, f.getGeometry().getCoordinates());
		var p = this.getMap().getPixelFromCoordinate(coord);
		if (ol.coordinate.dist2d(e.pixel, p) < this.snapDistance_) 
		{	c = coord;
		}
		//
		return { source:source, feature:f, coord: c, link: g };
	}
}

/** Get nearest coordinate in a list 
* @param {ol.coordinate} pt the point to find nearest
* @param {Array<ol.coordinate>} coords list of coordinates
* @return {ol.coordinate} the nearest coordinate in the list
*/
ol.interaction.Split.prototype.getNearestCoord = function(pt, coords)
{	var d, dm=Number.MAX_VALUE, p0;
	for (var i=0; i < coords.length; i++)
	{	d = ol.coordinate.dist2d (pt, coords[i]);
		if (d < dm)
		{	dm = d;
			p0 = coords[i];
		}
	}
	return p0;
};

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ol.interaction.Split.prototype.handleDownEvent = function(evt) 
{	// Something to split ?
	var current = this.getClosestFeature(evt);

	if (current)
	{	var self = this;
		self.overlayLayer_.getSource().clear();
		var split = current.feature.getGeometry().splitAt(current.coord, this.tolerance_);
		if (split.length > 1)
		{	var tosplit = [];
			for (var i=0; i<split.length; i++)
			{	var f = current.feature.clone();
				f.setGeometry(split[i]);
				tosplit.push(f);
			}
			self.dispatchEvent({ type:'beforesplit', original: current.feature, features: tosplit });
			current.source.dispatchEvent({ type:'beforesplit', original: current.feature, features: tosplit });
			current.source.removeFeature(current.feature);
			for (var i=0; i<tosplit.length; i++)
			{	current.source.addFeature(tosplit[i]);
			}
			self.dispatchEvent({ type:'aftersplit', original: current.feature, features: tosplit });
			current.source.dispatchEvent({ type:'aftersplit', original: current.feature, features: tosplit });
		}
	}
	return false;
};

/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol.interaction.Split.prototype.handleMoveEvent = function(e) 
{	var map = e.map;
	this.overlayLayer_.getSource().clear();
	var current = this.getClosestFeature(e);

	if (current && this.filterSplit_(current.feature)) 
	{	var coord, p, l;
		// Draw sketch
		this.overlayLayer_.getSource().addFeature(current.feature);
		p = new ol.Feature(new ol.geom.Point(current.coord));
		p._sketch_ = true;
		this.overlayLayer_.getSource().addFeature(p);
		//
		l = new ol.Feature(new ol.geom.LineString([e.coordinate,current.coord]));
		l._sketch_ = true;
		this.overlayLayer_.getSource().addFeature(l);
	}

	var element = map.getTargetElement();
	if (this.cursor_) 
	{	if (current) 
		{	if (element.style.cursor != this.cursor_) 
			{	this.previousCursor_ = element.style.cursor;
				element.style.cursor = this.cursor_;
			}
		} 
		else if (this.previousCursor_ !== undefined) 
		{	element.style.cursor = this.previousCursor_;
			this.previousCursor_ = undefined;
		}
	}
};

