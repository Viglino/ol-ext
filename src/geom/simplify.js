import { ol_coordinate_equal } from './GeomUtils.js'
import ol_Feature from 'ol/Feature.js'
import ol_geom_LineString from 'ol/geom/LineString.js'

var ol_geom_simplify;

(function() {

function getArcs(coords, arcs, contour) {
  // New contour
  if (coords[0][0][0].length) {
    coords.forEach(function(c, i) {
      getArcs(c, arcs, contour + '-' + i)
    })
  } else {
    coords.forEach(function(c, k) {
      var p1, p0 = c[0];
      var ct = contour + '-' + k;
      for (var i=1; i<c.length; i++) {
        p1 = c[i];
        if (!ol_coordinate_equal(p0, p1)) {
          arcs.push({ seg: [p0, p1], contour: ct });
        }
        p0 = p1;
      }
    });
  }
  return arcs
}

/*
function equalSeg(a, b) {
  return (ol_coordinate_equal(a[0], b[0]) && ol_coordinate_equal(a[1], b[1]))
    || (ol_coordinate_equal(a[0], b[1]) && ol_coordinate_equal(a[1], b[0]))
}

function getFeaturesAtCoordinate(c, source) {
  var result = []
  source.forEachFeatureInExtent([c[0],c[1],c[0],c[1]], function(f) {
    if (ol_coordinate_equal(f.getGeometry().getFirstCoordinate(), c) 
    || ol_coordinate_equal(f.getGeometry().getLastCoordinate(), c)) {
      result.push(f);
    }
  });
  return result;
}
*/

function chainEdges(edges) {
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
      var feat = new ol_Feature({
        geometry: new ol_geom_LineString(f.geometry),
        geom: new ol_geom_LineString(f.geometry),
        edge: f.edge,
        prev: f.prev
      });
      result.push(feat);
    }
  })
  return result;
}


function getEdges(features) {
  var edges = {};
  var prev, prevEdge;
  
  function createEdge(f, a) {
    var id = a.seg[0].join() + '-' + a.seg[1].join();
    // Existing edge
    var e = edges[id];
    // Test revert
    if (!e) {
      id = a.seg[1].join() + '-' + a.seg[0].join();
      e = edges[id];
    }
    // Add or create a new one
    if (e) {
      e.edge.push({ feature: f, contour: a.contour })
    } else {
      var edge = {
        geometry: a.seg,
        edge: [{ feature: f, contour: a.contour }],
        prev: prev === a.contour ? prevEdge : false
      };
      prev = a.contour;
      // For back chain
      prevEdge = edge;
      edges[id] = edge
    }
  }

  // Get all edges
  features.forEach(function(f) {
    var arcs = getArcs(f.getGeometry().getCoordinates(), [], '0');
    // Create edges for arcs
    prev = '';
    arcs.forEach(function (a) { createEdge(f, a) });
  })

  // Convert to Array
  var tedges = [];
  for (var i in edges) tedges.push(edges[i])

  return tedges;
}

/** Simply geometries in the source
 * @param {ol_source_Vector} source
 * @returns {Array<ol_Features>}
 */
ol_geom_simplify = function (source) {
  var features = source.getFeatures();

  console.time('arcs')
  var edges = getEdges(features)
  console.timeLog('arcs')

  console.time('chain')
  features = chainEdges(edges)
  console.timeLog('chain')
  
  console.time('Filter')
  // Filter
  features.forEach(function(f) {
    // f.setGeometry(f.getGeometry().simplify(100))
    f.setGeometry(f.getGeometry().simplifyVisvalingam({
      ratio: .5,
      // pointsToKeep: 4,
      // dist: 1000
      // area: 100000
      minPoints: 4
    }))
  })
  console.timeLog('Filter')

  // DEBUG
  return features;
}

})();

export default ol_geom_simplify
