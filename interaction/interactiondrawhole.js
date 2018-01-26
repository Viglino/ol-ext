/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol from 'ol'
import ol_interaction_Interaction from 'ol/interaction/interaction'
import ol_geom_Polygon from 'ol/geom/polygon'
import ol_geom_LinearRing from 'ol/geom/linearring'
import ol_interaction_Draw from 'ol/interaction/draw'
import ol_interaction_Select from 'ol/interaction/select'

/** Interaction draw hole
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires drawstart, drawend
 * @param {olx.interaction.DrawHoleOptions} options extend olx.interaction.DrawOptions
 * 	@param {Array<ol.layer.Vector> | undefined} options.layers A list of layers from which polygons should be selected. Alternatively, a filter function can be provided. default: all visible layers
 */
var ol_interaction_DrawHole = function(options)
{	if (!options) options = {};
	var self = this;

	// Select interaction for the current feature
	this._select = new ol_interaction_Select();
	this._select.setActive(false);

	// Geometry function that test points inside the current
	var geometryFn, geomFn = options.geometryFunction;
	if (geomFn)
	{	geometryFn = function(c,g) 
		{ 	g = self._geometryFn (c, g);
			return geomFn (c,g);
		}
	}
	else
	{	geometryFn = function(c,g) { return self._geometryFn (c, g); }
	}

	// Create draw interaction
	options.type = "Polygon";
	options.geometryFunction = geometryFn;
	ol_interaction_Draw.call(this, options);

	// Layer filter function
	if (options.layers) 
	{	if (typeof (options.layers) === 'function') this.layers_ = options.layers;
		else if (options.layers.indexOf) 
		{	this.layers_ = function(l) 
			{ return (options.layers.indexOf(l) >= 0); 
			};
		}
	}

	// Start drawing if inside a feature
	this.on('drawstart', this._startDrawing, this );
	// End drawing add the hole to the current Polygon
	this.on('drawend', this._finishDrawing, this);
};
ol.inherits(ol_interaction_DrawHole, ol_interaction_Draw);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_DrawHole.prototype.setMap = function(map)
{	if (this.getMap()) this.getMap().removeInteraction(this._select);
	if (map) map.addInteraction(this._select);
	ol_interaction_Draw.prototype.setMap.call (this, map);
};

/**
 * Activate/deactivate the interaction
 * @param {boolean}
 * @api stable
 */
ol_interaction_DrawHole.prototype.setActive = function(b)
{	this._select.getFeatures().clear();
	ol_interaction_Draw.prototype.setActive.call (this, b);
};

/**
 * Remove last point of the feature currently being drawn 
 * (test if points to remove before).
 */
ol_interaction_DrawHole.prototype.removeLastPoint = function()
{	if (this._feature && this._feature.getGeometry().getCoordinates()[0].length>2) 
	{	ol_interaction_Draw.prototype.removeLastPoint.call(this);
	}
};

/** 
 * Get the current polygon to hole
 * @return {ol.Feature}
 */
ol_interaction_DrawHole.prototype.getPolygon = function()
{	return this._select.getFeatures().item(0);
};

/**
 * Get current feature to add a hole and start drawing
 * @param {ol_interaction_Draw.Event} e
 * @private
 */
ol_interaction_DrawHole.prototype._startDrawing = function(e)
{	var map = this.getMap();
	var layersFilter = this.layers_;
	this._feature = e.feature;
	coord = e.feature.getGeometry().getCoordinates()[0][0];
	// Check object under the pointer
	var features = map.getFeaturesAtPixel(
		map.getPixelFromCoordinate(coord),
		{ 	layerFilter: layersFilter
		}
	);
	var current = null;
	if (features)
	{	if (features[0].getGeometry().getType() !== "Polygon") current = null;
		else if (features[0].getGeometry().intersectsCoordinate(coord)) current = features[0];
		else current = null;
	}
	else current = null;
	
	if (!current)
	{	this.setActive(false);
		this.setActive(true);
		this._select.getFeatures().clear();
	}
	else
	{	this._select.getFeatures().push(current);
	}
};

/**
 * Stop drawing and add the sketch feature to the target feature. 
 * @param {ol_interaction_Draw.Event} e
 * @private
 */
ol_interaction_DrawHole.prototype._finishDrawing = function(e)
{	var c = e.feature.getGeometry().getCoordinates()[0];
	if (c.length > 3) this.getPolygon().getGeometry().appendLinearRing(new ol_geom_LinearRing(c));
	this._feature = null;
	this._select.getFeatures().clear();
};

/**
 * Function that is called when a geometry's coordinates are updated.
 * @param {Array<ol.coordinate>} coordinates
 * @param {ol_geom_Polygon} geometry
 * @return {ol_geom_Polygon}
 * @private
 */
ol_interaction_DrawHole.prototype._geometryFn = function(coordinates, geometry)
{	var coord = coordinates[0].pop();
	if (!this.getPolygon() || this.getPolygon().getGeometry().intersectsCoordinate(coord))
	{	this.lastOKCoord = [coord[0],coord[1]];
	}
	coordinates[0].push([this.lastOKCoord[0],this.lastOKCoord[1]]);

	if (geometry) 
	{	geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
	} 
	else 
	{	geometry = new ol_geom_Polygon(coordinates);
	}
	return geometry;
};

export default ol_interaction_DrawHole