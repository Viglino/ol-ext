import ol_Object from 'ol/Object.js'
import { ol_coordinate_equal } from './GeomUtils.js'
import ol_Feature from 'ol/Feature.js'
// import ol_source_Vector from 'ol/source/Vector.js'
import ol_geom_LineString from './visvalingam.js'

/** An object to simplify geometry
 * @extends {ol_Object}
 * @param {Object=} options 
 * @api
 */
var ol_geom_Simplificator = class olgeomSimplificator extends ol_Object {
  constructor(options) {
    super(options);
    this._edges = [];
  }

  /** Get source edge
   */
  getEdges() {
    return this._edges;
  }

  /** Set the features to process
   * @param {Array<ol_Feature>} features
   * @param {number} [round] round features
   */
  setFeatures(features, round) {
    console.time('arcs')
    if (round) round = Math.pow(10, round);
    var edges = this._calcEdges(features, round)
    console.timeLog('arcs')
    /* DEBUG * /
    this._edges.clear(true);
    var eds = []
    edges.forEach(function(e) {
      eds.push(e.feature);
    })
    this._edges.addFeatures(eds)
    /**/

    console.time('chain')
    this._edges = this._chainEdges(edges);
    console.timeLog('chain')
    return this._edges
  }

  /** Get the simplified features
   * @returns {Array<ol_Feature>}
   */
  getFeatures() {
    var features = [];
    this._edges.forEach(function(edge) {
      edge.get('edge').forEach(function(ed) {
        // Already inserted?
        var f = features.find(function(e) {
          return ed.feature === e.feature;
        })
        // New one
        if (!f) {
          f = {
            feature: ed.feature,
            contour: {}
          }
          features.push(f)
        }
        // add contour
        if (!f.contour[ed.contour]) f.contour[ed.contour] = [];
        f.contour[ed.contour].push({
          edge: edge,
          index: ed.index
        })
      })
    })
    // Recreate objects
    features.forEach(function(f) {
      f.typeGeom = f.feature.getGeometry().getType();
      f.nom = f.feature.get('nom');
      var g = [];
      // console.log(f.contour)
      for (let c in f.contour) {
        var t = c.split('-');
        t.shift();
        var coordinates = g;
        while (t.length) {
          var i = parseInt(t.shift())
          if (!coordinates[i]) {
            coordinates[i] = [];
          }
          coordinates = coordinates[i];
        }
        // Join
        f.contour[c].sort(function(a,b) { return a.index - b.index; });
        f.contour[c].forEach(function(contour) {
          var coord = contour.edge.getGeometry().getCoordinates();
          if (!coordinates.length || ol_coordinate_equal(coordinates[coordinates.length-1], coord[0])) {
            for (let i= coordinates.length ? 1 : 0; i<coord.length; i++) {
              coordinates.push(coord[i]);
            }
          } else if (ol_coordinate_equal(coordinates[0], coord[0])) {
            for (let i=1; i<coord.length; i++) {
              coordinates.unshift(coord[i]);
            }
          } else if (ol_coordinate_equal(coordinates[0], coord[coord.length-1])) {
            for (let i=coord.length-2; i>=0; i--) {
              coordinates.unshift(coord[i]);
            }
          } else {
            // revert
            for (let i=coord.length-2; i>=0; i--) {
              coordinates.push(coord[i]);
            }
          }
          // console.log(c, coordinates.length, coord.length)
        })
      }
      f.geom = g;
      // console.log(g)
      f.feature.getGeometry().setCoordinates(g);
    })
    //
    return features;
  }

  /** Simplify edges using Visvalingam algorithm
   * @param {Object} options
   *  @param {string} options.algo
   */
  simplifyVisvalingam(options) {
    this._edges.forEach(function(f) {
      var gtype = f.get('edge')[0].feature.getGeometry().getType();
      f.setGeometry(f.get('geom').simplifyVisvalingam({
        area: options.area,
        dist: options.dist,
        ratio: options.ratio,
        minPoints: options.minPoints,
        keepEnds: /Polygon/.test(gtype) ? true : options.keepEnds
      }))
    })
  }

  /** Simplify edges using  Douglas Peucker algorithm
   * @param {number} tolerance
   */
  simplify(tolerance) {
    this._edges.forEach(function(f) {
      f.setGeometry(f.get('geom').simplify(tolerance))
    })
  }

  /** Calculate edges
   * @param {Array<ol_Features>} features 
   * @returns {Array<Object>}
   * @private
   */
  _calcEdges(features, round) {
    var edges = {};
    var prev, prevEdge;
    
    function createEdge(f, a, i) {
      var id = a.seg[0] +'-'+ a.seg[1];
      // Existing edge
      var e = edges[id];
      // Test revert
      if (!e) {
        id = a.seg[1] +'-'+ a.seg[0];
        e = edges[id];
      }
      // Add or create a new one
      if (e) {
        e.edge.push({ feature: f, contour: a.contour, index: i })
        prev = '';
      } else {
        var edge = {
          geometry: a.seg,
          edge: [{ feature: f, contour: a.contour, index: i }],
          prev: prev === a.contour ? prevEdge : false
        };
        /* DEBUG * /
        edge.feature = new ol_Feature({
          geometry: new ol_geom_LineString(a.seg),
          edge: edge.edge,
          prev: edge.prev
        })
        /* */
        prev = a.contour;
        // For back chain
        prevEdge = edge;
        edges[id] = edge
      }
    }
  
    // Get all edges
    features.forEach(function(f) {
      if (!/Point/.test(f.getGeometry().getType())) {
        var arcs = this._getArcs(f.getGeometry().getCoordinates(), [], '0', round);
        // Create edges for arcs
        prev = '';
        arcs.forEach(function (a, i) { createEdge(f, a, i) });
      }
    }.bind(this))
  
    // Convert to Array
    var tedges = [];
    for (var i in edges) tedges.push(edges[i])
  
    return tedges;
  }

  /** Retrieve edges of arcs
   * @param {*} coords 
   * @param {*} arcs 
   * @param {*} contour 
   * @returns Array
   * @private
   */
  _getArcs(coords, arcs, contour, round) {
    // New contour
    if (coords[0][0][0].length) {
      coords.forEach(function(c, i) {
        this._getArcs(c, arcs, contour + '-' + i, round)
      }.bind(this))
    } else {
      coords.forEach(function(c, k) {
        var p1, p0 = c[0];
        // p0 = round ? [Math.round(c[0][0] * round) / round, Math.round(c[0][1] * round) / round] : c[0];
        var ct = contour + '-' + k;
        for (var i=1; i<c.length; i++) {
          p1 = c[i];
          // p1 = round ? [Math.round(c[i][0] * round) / round, Math.round(c[i][1] * round) / round] : c[i];
          if (!ol_coordinate_equal(p0, p1)) {
            arcs.push({ seg: [p0, p1], contour: ct });
          }
          p0 = p1;
        }
      });
    }
    return arcs
  }

  /** Chain edges backward
   * @param {*} edges 
   * @returns {Array<ol_Feature>}
   */
  _chainEdges(edges) {
    // 2 edges are connected
    function isConnected(edge1, edge2) {
      if (edge1.length === edge2.length) {
        var connected, e1, e2;
        for (var i=0; i < edge1.length; i++) {
          e1 = edge1[i]
          connected = false;
          for (var j=0; j < edge2.length; j++) {
            e2 = edge2[j];
            if (e1.feature === e2.feature && e1.contour === e2.contour) {
              connected = true;
              break;
            }
          }
          if (!connected) return false;
        }
        return true
      }
      return false;
    }
    // Chain features back
    function chainBack(f) {
      if (f.del) return;
      // Previous edge
      var prev = f.prev;
      if (!prev) return;
      // Merge edges
      if (isConnected(f.edge, prev.edge)) {
        // Remove prev...
        prev.del = true;
        // ...and  merge with current
        var g = prev.geometry;
        var g1 = f.geometry;
        g1.shift();
        f.geometry = g.concat(g1);
        f.prev = prev.prev;
        // Chain
        chainBack(f);
      }
    }
  
    // Chain features back
    edges.forEach(chainBack)
  
    // New arcs features
    var result = [];
    edges.forEach(function(f) { 
      if (!f.del) {
        result.push(new ol_Feature({
          geometry: new ol_geom_LineString(f.geometry),
          geom: new ol_geom_LineString(f.geometry),
          edge: f.edge,
          prev: f.prev
        }));
      }
    })
    return result;
  }
}

export default ol_geom_Simplificator
