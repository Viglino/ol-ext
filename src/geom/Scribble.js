/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).

	Usefull function to handle geometric operations
*/
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/

import ol_geom_MultiLineString from 'ol/geom/MultiLineString'
import ol_geom_Polygon from 'ol/geom/Polygon'
import ol_geom_MultiPolygon from 'ol/geom/multipolygon'
import '../render/Cspline'
import {ol_coordinate_splitH} from "./GeomUtils";

/**
 * Calculate a MultiPolyline to fill a Polygon with a scribble effect that appears hand-made
 * @param {} options
 *  @param {Number} options.interval interval beetween lines
 *  @param {Number} options.angle hatch angle in radian, default PI/2
 * @return {ol_geom_MultiLineString|null} the resulting MultiLineString geometry or null if none
 */
ol_geom_MultiPolygon.prototype.scribbleFill = function (options) {
  var scribbles = [];
  var poly = this.getPolygons();
  var i, p, s;
  for (i=0; p=poly[i]; i++) {
    var mls = p.scribbleFill(options);
    if (mls) scribbles.push(mls);
  } 
  if (!scribbles.length) return null;
  // Merge scribbles
  var scribble = scribbles[0];
    var ls;
    for (i = 0; s = scribbles[i]; i++) {
        ls = s.getLineStrings();
        for (var k = 0; k < ls.length; k++) {
            scribble.appendLineString(ls[k]);
        }
    }
  return scribble;
};

/**
 * Calculate a MultiPolyline to fill a Polygon with a scribble effect that appears hand-made
 * @param {} options
 *  @param {Number} options.interval interval beetween lines
 *  @param {Number} options.angle hatch angle in radian, default PI/2
 * @return {ol_geom_MultiLineString|null} the resulting MultiLineString geometry or null if none
 */
ol_geom_Polygon.prototype.scribbleFill = function (options) {
	var step = options.interval;
  var angle = options.angle || Math.PI/2;
  var i, k,l;
  
  // Geometry + rotate
	var geom = this.clone();
	geom.rotate(angle, [0,0]);
  var coords = geom.getCoordinates();
  // Merge holes
  var coord = coords[0];
  for (i=1; i<coords.length; i++) {
    // Add a separator
    coord.push([]);
    // Add the hole
    coord = coord.concat(coords[i]);
  }
  // Extent 
	var ext = geom.getExtent();
  
	// Split polygon with horizontal lines
  var lines = [];
	for (var y = (Math.floor(ext[1]/step)+1)*step; y<ext[3]; y += step) {
    l = ol_coordinate_splitH(coord, y, i);
    lines = lines.concat(l);
  }
  
  if (!lines.length) return null;
  // Order lines on segment index
  var mod = coord.length-1;
	var first = lines[0][0].index;
	for (k=0; l=lines[k]; k++) {
		lines[k][0].index = (lines[k][0].index-first+mod) % mod;
		lines[k][1].index = (lines[k][1].index-first+mod) % mod;
	}

  var scribble = [];

  while (true) {
    for (k=0; l=lines[k]; k++) {
      if (!l[0].done) break;
    }
    if (!l) break;
    var scrib = [];
    while (l) {
      l[0].done = true;
      scrib.push(l[0].pt);
      scrib.push(l[1].pt);
      var nexty = l[0].pt[1] + step;
      var d0 = Infinity;
      var l2 = null;
      while (lines[k]) {
        if (lines[k][0].pt[1] > nexty) break;
        if (lines[k][0].pt[1] === nexty) {
          var d = Math.min(
            (lines[k][0].index - l[0].index + mod) % mod,
            (l[0].index - lines[k][0].index + mod) % mod
          );
          var d2 = Math.min(
            (l[1].index - l[0].index + mod) % mod,
            (l[0].index - l[1].index + mod) % mod
          );
          if (d<d0 && d<d2) {
            d0 = d;
            if (!lines[k][0].done) l2 = lines[k];
            else l2 = null;
          }
        }
        k++;
      }
      l = l2;
    }
    if (scrib.length) {
      scribble.push(scrib);
    }
  }

  // Return the scribble as MultiLineString
  if (!scribble.length) return null;
  var mline = new ol_geom_MultiLineString(scribble);
  mline.rotate(-angle,[0,0]);
	return mline.cspline({ pointsPerSeg:8, tension:.9 });
};

// import('ol-ext/geom/Scribble')