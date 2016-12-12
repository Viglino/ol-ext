/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction to snap to guidelines
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires  
 * @param {olx.interaction.SnapGuidesOptions} 
 *	- pixelTolerance {number | undefined} distance (in px) to snap to a guideline, default 10 px
 *	- style {ol.style.Style | Array<ol.style.Style> | undefined} Style for the sektch features. 
 */
ol.interaction.SnapGuides = function(options) 
{	if (!options) options = {};

	// Intersect 2 guides
	function getIntersectionPoint (d1, d2)
	{	var d1x = d1[1][0] - d1[0][0];
		var d1y = d1[1][1] - d1[0][1];
		var d2x = d2[1][0] - d2[0][0];
		var d2y = d2[1][1] - d2[0][1];
		var det = d1x * d2y - d1y * d2x;
 
		if (det != 0)
		{	var k = (d1x * d1[0][1] - d1x * d2[0][1] - d1y * d1[0][0] + d1y * d2[0][0]) / det;
			return [d2[0][0] + k*d2x, d2[0][1] + k*d2y];
		}
		else return false;
	}
	function dist2D (p1,p2)
	{	var dx = p1[0]-p2[0];
		var dy = p1[1]-p2[1];
		return Math.sqrt(dx*dx+dy*dy);
	}

	// Use snap interaction
	ol.interaction.Interaction.call(this, 
	{	handleEvent: function(e)
		{	if (this.getActive())
			{	var features = this.overlayLayer_.getSource().getFeatures();
				var prev = null;
				var p = null;
				var res = e.frameState.viewState.resolution;
				for (var i=0, f; f = features[i]; i++)
				{	var c = f.getGeometry().getClosestPoint(e.coordinate);
					if ( dist2D(c, e.coordinate) / res < this.snapDistance_)
					{	// Intersection on 2 lines
						if (prev)
						{	var c2 = getIntersectionPoint(prev.getGeometry().getCoordinates(),  f.getGeometry().getCoordinates());
							if (c2) 
							{	if (dist2D(c2, e.coordinate) / res < this.snapDistance_)
								{	p = c2;
								}
							}
						}
						else
						{	p = c;
						}
						prev = f;
					}
				}
				if (p) e.coordinate = p;
			}
			return true;
		}
	});

	// Snap distance (in px)
	this.snapDistance_ = options.pixelTolerance || 10;

	// Default style
 	var sketchStyle = 
	[	new ol.style.Style({
			stroke: new ol.style.Stroke(
			{	color: '#ffcc33',
				lineDash: [8,5],
				width: 1.25
			})
	   })
	 ];

	// Custom style
	if (options.style) sketchStyle = options.style instanceof Array ? options.style : [options.style];

	// Create a new overlay for the sketch
	this.overlayLayer_ = new ol.layer.Vector(
	{	source: new ol.source.Vector({
			features: new ol.Collection(),
			useSpatialIndex: false
		}),
		name:'Snap overlay',
		displayInLayerSwitcher: false,
		style: function(f)
		{	return sketchStyle;
		}
	});

};
ol.inherits(ol.interaction.SnapGuides, ol.interaction.Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.SnapGuides.prototype.setMap = function(map) 
{	if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
	ol.interaction.Interaction.prototype.setMap.call (this, map);
	this.overlayLayer_.setMap(map);
};

/** Activate or deactivate the interaction.
* @param {boolean} active
*/
ol.interaction.SnapGuides.prototype.setActive = function(active) 
{	this.overlayLayer_.setVisible(active);
	ol.interaction.Interaction.prototype.setActive.call (this, active);
}

/** Clear previous added guidelines
* @param {Array<ol.Feature> | undefined} features a list of feature to remove, default remove all feature
*/
ol.interaction.SnapGuides.prototype.clearGuides = function(features) 
{	if (!features) this.overlayLayer_.getSource().clear();
	else
	{	for (var i=0, f; f=features[i]; i++)
		{	this.overlayLayer_.getSource().removeFeature(f);
		}
	}
}

/** Get guidelines
* @return {ol.Collection} guidelines features
*/
ol.interaction.SnapGuides.prototype.getGuides = function(features) 
{	return this.overlayLayer_.getSource().getFeaturesCollection();
}

/** Add a new guide to snap to
* @param {Array<ol.coordinate>} v the direction vector
* @return {ol.Feature} feature guide
*/
ol.interaction.SnapGuides.prototype.addGuide = function(v) 
{	if (v)
	{	var dx = v[0][0] - v[1][0];
		var dy = v[0][1] - v[1][1];
		var d = 1e8 / Math.sqrt(dx*dx+dy*dy);
		var p1 = [ v[0][0] + dx*d, v[0][1] + dy*d];
		var p2 = [ v[0][0] - dx*d, v[0][1] - dy*d];
		var f = new ol.Feature(new ol.geom.LineString([p1,p2]));
		this.overlayLayer_.getSource().addFeature(f);
		return f;
	}
};

/** Add a new orthogonal guide to snap to
* @param {Array<ol.coordinate>} v the direction vector
* @return {ol.Feature} feature guide
*/
ol.interaction.SnapGuides.prototype.addOrthoGuide = function(v) 
{	if (v)
	{	var dx = v[0][0] - v[1][0];
		var dy = v[0][1] - v[1][1];
		var d = 1e8 / Math.sqrt(dx*dx+dy*dy);
		var p1 = [ v[0][0] + dy*d, v[0][1] - dx*d];
		var p2 = [ v[0][0] - dy*d, v[0][1] + dx*d];
		var f = new ol.Feature(new ol.geom.LineString([p1,p2]));
		this.overlayLayer_.getSource().addFeature(f);
		return f;
	}
};

/** Listen to draw event to add orthogonal guidelines on the first and last point.
* @param {ol.interaction.Draw} drawi a draw interaction to listen to
* @api
*/
ol.interaction.SnapGuides.prototype.setDrawInteraction = function(drawi)
{	// Number of points currently drawing
	var nb = 0;
	// Current guidelines
	var features = [];
	function setGuides(e)
	{	var coord = [];
		var s = 2;
		switch (e.target.getType())
		{	case 'LineString':
				coord = e.target.getCoordinates();
				s = 2;
				break;
			case 'Polygon':
				coord = e.target.getCoordinates()[0];
				s = 3;
				break;
			default: break;
		}
		var l = coord.length;
		if (l != nb && l > s)
		{	snapi.clearGuides(features);
			features = [
					snapi.addOrthoGuide([coord[l-s],coord[l-s-1]]),
					snapi.addGuide([coord[0],coord[1]]),
					snapi.addOrthoGuide([coord[0],coord[1]])
				];
			nb = l;
		}
	};
	// New drawing
	drawi.on ("drawstart", function(e)
	{	// When geom is changing add a new orthogonal direction 
		e.feature.getGeometry().on("change", setGuides);
	});
	// end drawing, clear directions
	drawi.on ("drawend", function(e)
	{	snapi.clearGuides(features);
		e.feature.getGeometry().un("change", setGuides);
		nb = 0;
		features = [];
	});
};