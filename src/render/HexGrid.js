/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_Object from 'ol/Object.js'

/** @typedef {'pointy' | 'flat'} HexagonLayout
 *  Layout of a Hexagon. Flat means the bottom part of the hexagon is flat.
 */

/**
* Hexagonal grids
* @classdesc ol_HexGrid is a class to compute hexagonal grids
* @see http://www.redblobgames.com/grids/hexagons
*
* @constructor ol_HexGrid
* @extends {ol_Object}
* @param {Object} [options]
*	@param {number} [options.size] size of the exagon in map units, default 80000
*	@param {ol.Coordinate} [options.origin] orgin of the grid, default [0,0]
*	@param {HexagonLayout} [options.layout] grid layout, default pointy
*/
var ol_HexGrid = class olHexGrid extends ol_Object {
  constructor(options) {
    options = options || {};

    super(options);

    // Options
    this.size_ = options.size || 80000;
    this.origin_ = options.origin || [0, 0];
    this.layout_ = this.layout[options.layout] || this.layout.pointy;

  }
  /** Set layout
  * @param {HexagonLayout | undefined} layout name, default pointy
  */
  setLayout(layout) {
    this.layout_ = this.layout[layout] || this.layout.pointy;
    this.changed();
  }
  /** Get layout
  * @return {HexagonLayout} layout name
  */
  getLayout() {
    return (this.layout_[9] != 0 ? 'pointy' : 'flat');
  }
  /** Set hexagon origin
  * @param {ol.Coordinate} coord origin
  */
  setOrigin(coord) {
    this.origin_ = coord;
    this.changed();
  }
  /** Get hexagon origin
  * @return {ol.Coordinate} coord origin
  */
  getOrigin() {
    return this.origin_;
  }
  /** Set hexagon size
  * @param {number} hexagon size
  */
  setSize(s) {
    this.size_ = s || 80000;
    this.changed();
  }
  /** Get hexagon size
  * @return {number} hexagon size
  */
  getSize() {
    return this.size_;
  }
  /** Convert cube to axial coords
  * @param {ol.Coordinate} c cube coordinate
  * @return {ol.Coordinate} axial coordinate
  */
  cube2hex(c) {
    return [c[0], c[2]];
  }
  /** Convert axial to cube coords
  * @param {ol.Coordinate} h axial coordinate
  * @return {ol.Coordinate} cube coordinate
  */
  hex2cube(h) {
    return [h[0], -h[0] - h[1], h[1]];
  }
  /** Convert offset to axial coords
  * @param {ol.Coordinate} h axial coordinate
  * @return {ol.Coordinate} offset coordinate
  */
  hex2offset(h) {
    if (this.layout_[9])
      return [h[0] + (h[1] - (h[1] & 1)) / 2, h[1]];
    else
      return [h[0], h[1] + (h[0] + (h[0] & 1)) / 2];
  }
  /** Convert axial to offset coords
  * @param {ol.Coordinate} o offset coordinate
  * @return {ol.Coordinate} axial coordinate
  */
  offset2hex(o) {
    if (this.layout_[9])
      return [o[0] - (o[1] - (o[1] & 1)) / 2, o[1]];
    else
      return [o[0], o[1] - (o[0] + (o[0] & 1)) / 2];
  }
  /** Convert offset to cube coords
  * @param {ol.Coordinate} c cube coordinate
  * @return {ol.Coordinate} offset coordinate
  * /
  cube2offset(c) {
    return this.hex2offset(this.cube2hex(c));
  };
  
  /** Convert cube to offset coords
  * @param {ol.Coordinate} o offset coordinate
  * @return {ol.Coordinate} cube coordinate
  * /
  offset2cube(o) {
    return this.hex2cube(this.offset2Hex(o));
  };
  
  /** Round cube coords
  * @param {ol.Coordinate} h cube coordinate
  * @return {ol.Coordinate} rounded cube coordinate
  */
  cube_round(h) {
    var rx = Math.round(h[0]);
    var ry = Math.round(h[1]);
    var rz = Math.round(h[2]);

    var x_diff = Math.abs(rx - h[0]);
    var y_diff = Math.abs(ry - h[1]);
    var z_diff = Math.abs(rz - h[2]);

    if (x_diff > y_diff && x_diff > z_diff)
      rx = -ry - rz;
    else if (y_diff > z_diff)
      ry = -rx - rz;
    else
      rz = -rx - ry;

    return [rx, ry, rz];
  }
  /** Round axial coords
  * @param {ol.Coordinate} h axial coordinate
  * @return {ol.Coordinate} rounded axial coordinate
  */
  hex_round(h) {
    return this.cube2hex(this.cube_round(this.hex2cube(h)));
  }
  /** Get hexagon corners
  */
  hex_corner(center, size, i) {
    return [center[0] + size * this.layout_[8 + (2 * (i % 6))], center[1] + size * this.layout_[9 + (2 * (i % 6))]];
  }
  /** Get hexagon coordinates at a coordinate
  * @param {ol.Coordinate} coord
  * @return {Arrary<ol.Coordinate>}
  */
  getHexagonAtCoord(coord) {
    return (this.getHexagon(this.coord2hex(coord)));
  }
  /** Get hexagon coordinates at hex
  * @param {ol.Coordinate} hex
  * @return {Arrary<ol.Coordinate>}
  */
  getHexagon(hex) {
    var p = [];
    var c = this.hex2coord(hex);
    for (var i = 0; i <= 7; i++) {
      p.push(this.hex_corner(c, this.size_, i, this.layout_[8]));
    }
    return p;
  }
  /** Convert hex to coord
  * @param {ol.hex} hex
  * @return {ol.Coordinate}
  */
  hex2coord(hex) {
    return [
      this.origin_[0] + this.size_ * (this.layout_[0] * hex[0] + this.layout_[1] * hex[1]),
      this.origin_[1] + this.size_ * (this.layout_[2] * hex[0] + this.layout_[3] * hex[1])
    ];
  }
  /** Convert coord to hex
  * @param {ol.Coordinate} coord
  * @return {ol.hex}
  */
  coord2hex(coord) {
    var c = [(coord[0] - this.origin_[0]) / this.size_, (coord[1] - this.origin_[1]) / this.size_];
    var q = this.layout_[4] * c[0] + this.layout_[5] * c[1];
    var r = this.layout_[6] * c[0] + this.layout_[7] * c[1];
    return this.hex_round([q, r]);
  }
  /** Calculate distance between to hexagon (number of cube)
  * @param {ol.Coordinate} a first cube coord
  * @param {ol.Coordinate} a second cube coord
  * @return {number} distance
  */
  cube_distance(a, b) {
    return (Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2])));
  }
  /** Line interpolation (for floats)
   * @private
   */
  lerp(a, b, t) {
    return a + (b - a) * t;
  }
  /** Line interpolation (for hexes)
   * @private
   */
  cube_lerp(a, b, t) {
    return [
      this.lerp(a[0] + 1e-6, b[0], t),
      this.lerp(a[1] + 1e-6, b[1], t),
      this.lerp(a[2] + 1e-6, b[2], t)
    ];
  }
  /** Calculate line between to hexagon
  * @param {ol.Coordinate} a first cube coord
  * @param {ol.Coordinate} b second cube coord
  * @return {Array<ol.Coordinate>} array of cube coordinates
  */
  cube_line(a, b) {
    var d = this.cube_distance(a, b);
    if (!d)
      return [a];
    var results = [];
    for (var i = 0; i <= d; i++) {
      results.push(this.cube_round(this.cube_lerp(a, b, i / d)));
    }
    return results;
  }
  /** Get the neighbors for an hexagon
  * @param {ol.Coordinate} h axial coord
  * @param {number} direction
  * @return { ol.Coordinate | Array<ol.Coordinate> } neighbor || array of neighbors
  */
  hex_neighbors(h, d) {
    if (d !== undefined) {
      return [h[0] + this.neighbors.hex[d % 6][0], h[1] + this.neighbors.hex[d % 6][1]];
    }

    else {
      var n = [];
      for (d = 0; d < 6; d++) {
        n.push([h[0] + this.neighbors.hex[d][0], h[1] + this.neighbors.hex[d][1]]);
      }
      return n;
    }
  }
  /** Get the neighbors for an hexagon
  * @param {ol.Coordinate} c cube coord
  * @param {number} direction
  * @return { ol.Coordinate | Array<ol.Coordinate> } neighbor || array of neighbors
  */
  cube_neighbors(c, d) {
    if (d !== undefined) {
      return [c[0] + this.neighbors.cube[d % 6][0], c[1] + this.neighbors.cube[d % 6][1], c[2] + this.neighbors.cube[d % 6][2]];
    }

    else {
      var n = [];
      for (d = 0; d < 6; d++) {
        n.push([c[0] + this.neighbors.cube[d][0], c[1] + this.neighbors.cube[d][1], c[2] + this.neighbors.cube[d][2]]);
      }
      for (d = 0; d < 6; d++)
        n[d] = this.cube2hex(n[d]);
      return n;
    }
  }
}

/** Grid layout
 */
ol_HexGrid.prototype.layout = {
  pointy: [
    Math.sqrt(3), Math.sqrt(3)/2, 0, 3/2, 
    Math.sqrt(3)/3, -1/3, 0, 2/3, 
    // corners
    Math.cos(Math.PI / 180 * (60 * 0 + 30)), Math.sin(Math.PI / 180 * (60 * 0 + 30)), 
    Math.cos(Math.PI / 180 * (60 * 1 + 30)), Math.sin(Math.PI / 180 * (60 * 1 + 30)), 
    Math.cos(Math.PI / 180 * (60 * 2 + 30)), Math.sin(Math.PI / 180 * (60 * 2 + 30)), 
    Math.cos(Math.PI / 180 * (60 * 3 + 30)), Math.sin(Math.PI / 180 * (60 * 3 + 30)), 
    Math.cos(Math.PI / 180 * (60 * 4 + 30)), Math.sin(Math.PI / 180 * (60 * 4 + 30)), 
    Math.cos(Math.PI / 180 * (60 * 5 + 30)), Math.sin(Math.PI / 180 * (60 * 5 + 30))
  ],
  flat: [
    3/2, 0, Math.sqrt(3)/2, Math.sqrt(3), 2/3, 
    0, -1/3, Math.sqrt(3) / 3, 
    // corners
    Math.cos(Math.PI / 180 * (60 * 0)), Math.sin(Math.PI / 180 * (60 * 0)), 
    Math.cos(Math.PI / 180 * (60 * 1)), Math.sin(Math.PI / 180 * (60 * 1)), 
    Math.cos(Math.PI / 180 * (60 * 2)), Math.sin(Math.PI / 180 * (60 * 2)), 
    Math.cos(Math.PI / 180 * (60 * 3)), Math.sin(Math.PI / 180 * (60 * 3)), 
    Math.cos(Math.PI / 180 * (60 * 4)), Math.sin(Math.PI / 180 * (60 * 4)), 
    Math.cos(Math.PI / 180 * (60 * 5)), Math.sin(Math.PI / 180 * (60 * 5))
  ]
};

/** Neighbors list
 * @private
 */
ol_HexGrid.prototype.neighbors = {
  'cube':	[ [+1, -1,  0], [+1,  0, -1], [0, +1, -1], [-1, +1,  0], [-1,  0, +1], [0, -1, +1] ],
  'hex':	[ [+1, 0], [+1,  -1], [0, -1], [-1, 0], [-1, +1], [0, +1] ]
};

export default ol_HexGrid
