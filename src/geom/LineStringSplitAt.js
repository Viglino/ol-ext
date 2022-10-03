import {ol_coordinate_equal} from "./GeomUtils.js";
import ol_geom_LineString from "ol/geom/LineString.js";

/** Split a lineString by a point or a list of points
 *	NB: points must be on the line, use getClosestPoint() to get one
 * @param {ol.Coordinate | Array<ol.Coordinate>} pt points to split the line
 * @param {Number} tol distance tolerance for 2 points to be equal
 */
ol_geom_LineString.prototype.splitAt = function(pt, tol) {
  var i;
  if (!pt) return [this];
    if (!tol) tol = 1e-10;
    // Test if list of points
    if (pt.length && pt[0].length) {
      var result = [this];
      for (i=0; i<pt.length; i++) {
        var r = [];
        for (var k=0; k<result.length; k++) {
          var ri = result[k].splitAt(pt[i], tol);
          r = r.concat(ri);
        }
        result = r;
      }
      return result;
    }
    // Nothing to do
    if (ol_coordinate_equal(pt,this.getFirstCoordinate())
    || ol_coordinate_equal(pt,this.getLastCoordinate())) {
      return [this];
    }
    // Get
    var c0 = this.getCoordinates();
    var ci=[c0[0]];
    var c = [];
    for (i=0; i<c0.length-1; i++) {
      // Filter equal points
      if (ol_coordinate_equal(c0[i],c0[i+1])) continue;
      // Extremity found
      if (ol_coordinate_equal(pt,c0[i+1])) {
        ci.push(c0[i+1]);
        c.push(new ol_geom_LineString(ci));
        ci = [];
      }
      // Test alignement
      else if (!ol_coordinate_equal(pt,c0[i])) {
        var d1, d2, split=false;
        if (c0[i][0] == c0[i+1][0]) {
          d1 = (c0[i][1]-pt[1]) / (c0[i][1]-c0[i+1][1]);
          split = (c0[i][0] == pt[0]) && (0 < d1 && d1 <= 1)
        } else if (c0[i][1] == c0[i+1][1]) {
          d1 = (c0[i][0]-pt[0]) / (c0[i][0]-c0[i+1][0]);
          split = (c0[i][1] == pt[1]) && (0 < d1 && d1 <= 1)
        } else {
          d1 = (c0[i][0]-pt[0]) / (c0[i][0]-c0[i+1][0]);
          d2 = (c0[i][1]-pt[1]) / (c0[i][1]-c0[i+1][1]);
          split = (Math.abs(d1-d2) <= tol && 0 < d1 && d1 <= 1)
        }
        // pt is inside the segment > split
        if (split) {
          ci.push(pt);
          c.push (new ol_geom_LineString(ci));
          ci = [pt];
        }
      }
      ci.push(c0[i+1]);
    }
    if (ci.length>1) c.push (new ol_geom_LineString(ci));
    if (c.length) return c;
    else return [this];
}

// import('ol-ext/geom/LineStringSplitAt')