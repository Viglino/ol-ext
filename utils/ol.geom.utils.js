/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).

	Usefull function to handle geometric operations
*/

import ol_geom_LineString from 'ol/geom/linestring'
import ol_coordinate from 'ol/coordinate'
import ol_extent from 'ol/extent'

/** Distance beetween 2 points
*	Usefull geometric functions
* @param {ol.coordinate} p1 first point
* @param {ol.coordinate} p2 second point
* @return {number} distance
*/
var ol_coordinate_dist2d = function(p1, p2)
{	var dx = p1[0]-p2[0];
	var dy = p1[1]-p2[1];
	return Math.sqrt(dx*dx+dy*dy);
}
/** 2 points are equal
*	Usefull geometric functions
* @param {ol.coordinate} p1 first point
* @param {ol.coordinate} p2 second point
* @return {boolean}
*/
var ol_coordinate_equal = function(p1, p2)
{	return (p1[0]==p2[0] && p1[1]==p2[1]);
}

/** Get center coordinate of a feature
* @param {ol.Feature} f
* @return {ol.coordinate} the center
*/
var ol_coordinate_getFeatureCenter = function(f)
{	return ol_coordinate.getGeomCenter (f.getGeometry());
};

/** Get center coordinate of a geometry
* @param {ol.Feature} geom
* @return {ol.coordinate} the center
*/
var ol_coordinate_getGeomCenter = function(geom)
{	switch (geom.getType())
	{	case 'Point': 
			return geom.getCoordinates();
		case "MultiPolygon":
			geom = geom.getPolygon(0);
		case "Polygon":
			return geom.getInteriorPoint().getCoordinates();
		default:
			return geom.getClosestPoint(ol_extent.getCenter(geom.getExtent()));
	};
};

/** Split a lineString by a point or a list of points
*	NB: points must be on the line, use getClosestPoint() to get one
* @param {ol.Coordinate | Array<ol.Coordinate>} pt points to split the line
* @param {Number} tol distance tolerance for 2 points to be equal
*/
ol_geom_LineString.prototype.splitAt = function(pt, tol)
{	if (!pt) return [this];
	if (!tol) tol = 1e-10;
	// Test if list of points
	if (pt.length && pt[0].length)
	{	var result = [this];
		for (var i=0; i<pt.length; i++)
		{	var r = [];
			for (var k=0; k<result.length; k++)
			{	var ri = result[k].splitAt(pt[i], tol);
				r = r.concat(ri);
			}
			result = r;
		}
		return result;
	}
	// Nothing to do
	if (ol_coordinate.equal(pt,this.getFirstCoordinate())
	 || ol_coordinate.equal(pt,this.getLastCoordinate()))
	{	return [this];
	}
	// Get 
	var c0 = this.getCoordinates();
	var ci=[c0[0]], p0, p1;
	var c = [];
	for (var i=0; i<c0.length-1; i++)
	{	// Filter equal points
		if (ol_coordinate.equal(c0[i],c0[i+1])) continue;
		// Extremity found  
		if (ol_coordinate.equal(pt,c0[i+1]))
		{	ci.push(c0[i+1]);
			c.push(new ol.geom.LineString(ci));
			ci = [];
		}
		// Test alignement
		else if (!ol_coordinate.equal(pt,c0[i]))
		{	var d1, d2;
			if (c0[i][0] == c0[i+1][0])
			{	d1 = d2 = (c0[i][1]-pt[1]) / (c0[i][1]-c0[i+1][1]);
			}
			else if (c0[i][1] == c0[i+1][1])
			{	d1 = d2 = (c0[i][0]-pt[0]) / (c0[i][0]-c0[i+1][0]);
			}
			else
			{	d1 = (c0[i][0]-pt[0]) / (c0[i][0]-c0[i+1][0]);
				d2 = (c0[i][1]-pt[1]) / (c0[i][1]-c0[i+1][1]);
			}
			if (Math.abs(d1-d2)<tol && 0<=d1 && d1<=1)
			{	ci.push(pt);
				c.push (new ol.geom.LineString(ci));
				ci = [pt];
			}
		}
		ci.push(c0[i+1]);
	}
	if (ci.length>1) c.push (new ol_geom_LineString(ci));
	if (c.length) return c;
	else return [this];
}

