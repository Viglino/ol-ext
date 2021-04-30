import ol_geom_Geometry from 'ol/geom/Geometry'
import ol_geom_GeometryCollection from 'ol/geom/GeometryCollection'
import ol_geom_MultiLineString from 'ol/geom/MultiLineString'
import ol_geom_Polygon from 'ol/geom/Polygon'
import ol_geom_MultiPolygon from 'ol/geom/MultiPolygon'
import ol_geom_LineString from 'ol/geom/LineString'
import { ol_coordinate_dist2d } from '../geom/GeomUtils'

/** Create a cardinal spline version of this geometry.
 *	Original https://github.com/epistemex/cardinal-spline-js
 *	@see https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Cardinal_spline
 *
 * @param {} options
 *	@param {Number} options.tension a [0,1] number / can be interpreted as the "length" of the tangent, default 0.5
 *  @param {Number} options.resolution size of segment to split
 *	@param {Integer} options.pointsPerSeg number of points per segment to add if no resolution is provided, default add 10 points per segment
 */

/** Cache cspline calculation on a geometry
 * @param {} options
 *	@param {Number} options.tension a [0,1] number / can be interpreted as the "length" of the tangent, default 0.5
 *  @param {Number} options.resolution size of segment to split
 *	@param {Integer} options.pointsPerSeg number of points per segment to add if no resolution is provided, default add 10 points per segment
 * @return {ol_geom_Geometry}
 */
ol_geom_Geometry.prototype.cspline = function(options){
  // Calculate cspline
  if (this.calcCSpline_){
    if (this.csplineGeometryRevision != this.getRevision() 
      || this.csplineOption != JSON.stringify(options)) {
      this.csplineGeometry_ = this.calcCSpline_(options)
      this.csplineGeometryRevision = this.getRevision();
      this.csplineOption = JSON.stringify(options);
    }
    return this.csplineGeometry_;
  } else {	
    // Default do nothing
    return this;
  }
};

ol_geom_GeometryCollection.prototype.calcCSpline_ = function(options) {
  var g=[], g0=this.getGeometries();
  for (var i=0; i<g0.length; i++) {
    g.push(g0[i].cspline(options));
  }
  return new ol_geom_GeometryCollection(g);
};

ol_geom_MultiLineString.prototype.calcCSpline_ = function(options) {
  var g=[], lines = this.getLineStrings();
  for (var i=0; i<lines.length; i++) {
    g.push(lines[i].cspline(options).getCoordinates());
  }
  return new ol_geom_MultiLineString(g);
};

ol_geom_Polygon.prototype.calcCSpline_ = function(options){
  var g=[], g0=this.getCoordinates();
  for (var i=0; i<g0.length; i++){
    g.push((new ol_geom_LineString(g0[i])).cspline(options).getCoordinates());
  }
  return new ol_geom_Polygon(g);
};

ol_geom_MultiPolygon.prototype.calcCSpline_ = function(options) {
  var g=[], g0=this.getPolygons();
  for (var i=0; i<g0.length; i++) {
    g.push(g0[i].cspline(options).getCoordinates());
  }
  return new ol_geom_MultiPolygon(g);
}

/** Calculate cspline on coordinates
 * @param {Array<ol_geom_Geometry.coordinate>} line
 * @param {} options
 *	@param {Number} options.tension a [0,1] number / can be interpreted as the "length" of the tangent, default 0.5
 *  @param {Number} options.resolution size of segment to split
 *	@param {Integer} options.pointsPerSeg number of points per segment to add if no resolution is provided, default add 10 points per segment
 * @return {Array<ol_geom_Geometry.coordinate>}
 */
var ol_coordinate_cspline = function(line, options) {
  if (!options) options={};
  var tension = typeof options.tension === "number" ? options.tension : 0.5;
  var length = 0;
  var p0 = line[0];
  line.forEach(function(p) {
    length += ol_coordinate_dist2d(p0, p);
    p0 = p;
  })
  var resolution = options.resolution || (length / line.length / (options.pointsPerSeg || 10));

  var pts, res = [],    // clone array
    x, y,               // our x,y coords
    t1x, t2x, t1y, t2y,	// tension vectors
    c1, c2, c3, c4,     // cardinal points
    st, t, i;           // steps based on num. of segments

  // clone array so we don't change the original
  //
  pts = line.slice(0);

  // The algorithm require a previous and next point to the actual point array.
  // Check if we will draw closed or open curve.
  // If closed, copy end points to beginning and first points to end
  // If open, duplicate first points to beginning, end points to end
  if (line.length>2 && line[0][0]==line[line.length-1][0] && line[0][1]==line[line.length-1][1]) {
    pts.unshift(line[line.length-2]);
    pts.push(line[1]);
  } else {
    pts.unshift(line[0]);
    pts.push(line[line.length-1]);
  }

  // ok, lets start..
  function dist2d(x1, y1, x2, y2) {
    var dx = x2-x1;
    var dy = y2-y1;
    return Math.sqrt(dx*dx+dy*dy);
  }

  // 1. loop goes through point array
  // 2. loop goes through each segment between the 2 pts + 1e point before and after
  for (i=1; i < (pts.length - 2); i++) {
    var d1 = dist2d (pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1]);
    var numOfSegments = Math.round(d1/resolution);
    
    var d=1;
    if (options.normalize) {
      d1 = dist2d (pts[i+1][0], pts[i+1][1], pts[i-1][0], pts[i-1][1]);
      var d2 = dist2d (pts[i+2][0], pts[i+2][1], pts[i][0], pts[i][1]);
      if (d1<d2) d = d1/d2;
      else d = d2/d1;
    }

    // calc tension vectors
    t1x = (pts[i+1][0] - pts[i-1][0]) * tension *d;
    t2x = (pts[i+2][0] - pts[i][0]) * tension *d;

    t1y = (pts[i+1][1] - pts[i-1][1]) * tension *d;
    t2y = (pts[i+2][1] - pts[i][1]) * tension *d;

    for (t=0; t <= numOfSegments; t++) {
      // calc step
      st = t / numOfSegments;

      // calc cardinals
      c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1; 
      c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2); 
      c3 = 	   Math.pow(st, 3)    - 2 * Math.pow(st, 2) + st; 
      c4 = 	   Math.pow(st, 3)    - 	  Math.pow(st, 2);

      // calc x and y cords with common control vectors
      x = c1 * pts[i][0] + c2 * pts[i+1][0] + c3 * t1x + c4 * t2x;
      y = c1 * pts[i][1] + c2 * pts[i+1][1] + c3 * t1y + c4 * t2y;

      //store points in array
      if (x && y) res.push([x,y]);
    }
  }

  return res;
};

/** @private */
ol_geom_LineString.prototype.calcCSpline_ = function(options) {
  var line = this.getCoordinates();

  var res = ol_coordinate_cspline(line, options)

  return new ol_geom_LineString(res);
}

// To use this module with ol/geom/Geometry
// import 'ol-ext/utils/cspline'

export default ol_coordinate_cspline
