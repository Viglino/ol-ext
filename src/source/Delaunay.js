/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import ol_source_Vector from 'ol/source/Vector.js'
import ol_Feature from 'ol/Feature.js'
import ol_geom_Polygon from 'ol/geom/Polygon.js'
import {boundingExtent as ol_extent_boundingExtent} from 'ol/extent.js'
import {buffer as ol_extent_buffer} from 'ol/extent.js'
import {ol_coordinate_equal, ol_coordinate_dist2d} from '../geom/GeomUtils.js'
import ol_coordinate_convexHull from '../geom/ConvexHull.js'

/** Delaunay source
 * Calculate a delaunay triangulation from points in a source
 * @param {*} options extend ol/source/Vector options
 *  @param {ol/source/Vector} options.source the source that contains the points
 */
var ol_source_Delaunay = class olsourceDelaunay extends ol_source_Vector {
  constructor(options) {
    options = options || {}
    var source = options.source
    delete options.source
    super(options)
    
    // Source
    this._nodes = source;
    
    // Convex hull
    this.hull = []

    // A new node is added to the source node: calculate the new triangulation
    this._nodes.on('addfeature', this._onAddNode.bind(this))
    // A new node is removed from the source node: calculate the new triangulation
    this._nodes.on('removefeature', this._onRemoveNode.bind(this))

    this.set('epsilon', options.epsilon || .0001)
  }
  /** Clear source (and points)
   * @param {boolean} opt_fast
   */
  clear(opt_fast) {
    super.clear(opt_fast)
    this.getNodeSource().clear(opt_fast)
  }
  /** Add a new triangle in the source
   * @param {Array<ol/coordinates>} pts
   */
  _addTriangle(pts) {
    pts.push(pts[0])
    var triangle = new ol_Feature(new ol_geom_Polygon([pts]))
    this.addFeature(triangle)
    this.flip.push(triangle)
    return triangle
  }
  /** Get nodes
   */
  getNodes() {
    return this._nodes.getFeatures()
  }
  /** Get nodes source
   */
  getNodeSource() {
    return this._nodes
  }
  /**
   * A point has been removed
   * @param {ol/source/Vector.Event} evt
   */
  _onRemoveNode(evt) {
    // console.log(evt)
    var pt = evt.feature.getGeometry().getCoordinates()
    if (!pt)
      return
    // Still there (when removing duplicated points)
    if (this.getNodesAt(pt).length)
      return
    // console.log('removenode', evt.feature)
    // Get associated triangles
    var triangles = this.getTrianglesAt(pt)

    this.flip = []

    // Get hole
    var i
    var edges = []
    while (triangles.length) {
      var tr = triangles.pop()
      this.removeFeature(tr)
      tr = tr.getGeometry().getCoordinates()[0]
      var pts = []
      for (i = 0; i < 3; i++) {
        p = tr[i]
        if (!ol_coordinate_equal(p, pt)) {
          pts.push(p)
        }
      }
      edges.push(pts)
    }
    pts = edges.pop()

    /* DEBUG
    var se = '';
    edges.forEach(function(e){
      se += ' - '+this.listpt(e);
    }.bind(this));
    console.log('EDGES', se);
    */
    i = 0
    function testEdge(p0, p1, index) {
      if (ol_coordinate_equal(p0, pts[index])) {
        if (index)
          pts.push(p1)
        else
          pts.unshift(p1)
        return true
      }
      return false
    }
    while (true) {
      var e = edges[i]
      if (testEdge(e[0], e[1], 0)
        || testEdge(e[1], e[0], 0)
        || testEdge(e[0], e[1], pts.length - 1)
        || testEdge(e[1], e[0], pts.length - 1)) {
        edges.splice(i, 1)
        i = 0
      } else {
        i++
      }
      if (!edges.length)
        break
      if (i >= edges.length) {
        //      console.log(this.listpt(pts), this.listpt(edges));
        throw '[DELAUNAY:removePoint] No edge found'
      }
    }
    // Closed = interior
    // console.log('PTS', this.listpt(pts))
    var closed = ol_coordinate_equal(pts[0], pts[pts.length - 1])
    if (closed)
      pts.pop()

    // Update convex hull: remove pt + add new ones
    var p
    for (i; p = this.hull[i]; i++) {
      if (ol_coordinate_equal(pt, p)) {
        this.hull.splice(i, 1)
        break
      }
    }
    this.hull = ol_coordinate_convexHull(this.hull.concat(pts))
    // select.getFeatures().clear();
    // 
    var clockwise = function (t) {
      var i1, s = 0
      for (var i = 0; i < t.length; i++) {
        i1 = (i + 1) % t.length
        s += (t[i1][0] - t[i][0]) * (t[i1][1] + t[i][1])
      }
      //    console.log(s)
      return (s >= 0 ? 1 : -1)
    }
    // Add ears
    // interior point : ear area and object area have the same sign
    // extrior point : add a new point and close
    var clock
    var enveloppe = pts.slice()
    if (closed) {
      clock = clockwise(pts)
    } else {
      //    console.log('ouvert', pts, pts.slice().push(pt))
      enveloppe.push(pt)
      clock = clockwise(enveloppe)
    }

    // console.log('S=',clock,'CLOSED',closed)
    // console.log('E=',this.listpt(enveloppe))
    for (i = 0; i <= pts.length + 1; i++) {
      if (pts.length < 3)
        break
      var t = [
        pts[i % pts.length],
        pts[(i + 1) % pts.length],
        pts[(i + 2) % pts.length]
      ]
      if (clockwise(t) === clock) {
        var ok = true
        for (var k = i + 3; k < i + pts.length; k++) {
          //        console.log('test '+k, this.listpt([pts[k % pts.length]]))
          if (this.inCircle(pts[k % pts.length], t)) {
            ok = false
            break
          }
        }
        if (ok) {
          // console.log(this.listpt(t),'ok');
          this._addTriangle(t)
          // remove
          pts.splice((i + 1) % pts.length, 1)
          // and restart
          i = -1
        }
      }
      // else console.log(this.listpt(t),'nok');
    }

    /* DEBUG * /
    if (pts.length>3) console.log('oops');
    console.log('LEAV',this.listpt(pts));
    
    var ul = $('ul.triangles').html('');
    $('<li>')
    .text('E:'+this.listpt(enveloppe)+' - '+clock+' - '+closed)
    .data('triangle', new ol_Feature(new ol_geom_Polygon([enveloppe])))
    .click(function(){
      var t = $(this).data('triangle');
      select.getFeatures().clear();
      select.getFeatures().push(t);
    })
    .appendTo(ul);
    for (var i=0; i<this.flip.length; i++) {
      $('<li>')
        .text(this.listpt(this.flip[i].getGeometry().getCoordinates()[0])
            +' - ' + clockwise(this.flip[i].getGeometry().getCoordinates()[0]))
        .data('triangle', this.flip[i])
        .click(function(){
          var t = $(this).data('triangle');
          select.getFeatures().clear();
          select.getFeatures().push(t);
        })
        .appendTo(ul);
    }
    /**/
    // Flip?
    this.flipTriangles()
  }
  /**
   * A new point has been added
   * @param {ol/source/VectorEvent} e
   */
  _onAddNode(e) {
    var finserted = e.feature
    var i, p

    // Not a point!
    if (finserted.getGeometry().getType() !== 'Point') {
      this._nodes.removeFeature(finserted)
      return
    }

    // Reset flip table
    this.flip = []

    var nodes = this.getNodes()
    // The point
    var pt = finserted.getGeometry().getCoordinates()
    // Test existing point
    if (this.getNodesAt(pt).length > 1) {
      // console.log('remove duplicated points')
      this._nodes.removeFeature(finserted)
      return
    }

    // Triangle needs at least 3 points
    if (nodes.length <= 3) {
      if (nodes.length === 3) {
        var pts = []
        for (i = 0; i < 3; i++)
          pts.push(nodes[i].getGeometry().getCoordinates())
        this._addTriangle(pts)
        this.hull = ol_coordinate_convexHull(pts)
      }
      return
    }

    // Get the triangle
    var t = this.getFeaturesAtCoordinate(pt)[0]
    if (t) {
      this.removeFeature(t)
      t.set('del', true)
      var c = t.getGeometry().getCoordinates()[0]
      for (i = 0; i < 3; i++) {
        this._addTriangle([pt, c[i], c[(i + 1) % 3]])
      }
    } else {
      // Calculate new convex hull
      var hull2 = this.hull.slice()
      hull2.push(pt)
      hull2 = ol_coordinate_convexHull(hull2)
      // Search for points
      for (i = 0; p = hull2[i]; i++) {
        if (ol_coordinate_equal(p, pt))
          break
      }
      i = (i !== 0 ? i - 1 : hull2.length - 1)
      var p0 = hull2[i]
      var stop = hull2[(i + 2) % hull2.length]
      for (i = 0; p = this.hull[i]; i++) {
        if (ol_coordinate_equal(p, p0))
          break
      }
      // Connect to the hull
      while (true) {
        // DEBUG: prevent infinit loop
        if (i > 1000) {
          console.error('[DELAUNAY:addPoint] Too many iterations')
          break
        }
        i++
        p = this.hull[i % this.hull.length]
        this._addTriangle([pt, p, p0])
        p0 = p
        if (p[0] === stop[0] && p[1] === stop[1])
          break
      }
      this.hull = hull2
    }

    this.flipTriangles()
  }
  /** Flipping algorithme: test new inserted triangle and flip
   */
  flipTriangles() {
    var count = 1000 // Count to prevent too many iterations
    var pi
    while (this.flip.length) {
      // DEBUG: prevent infinite loop
      if (count-- < 0) {
        console.error('[DELAUNAY:flipTriangles] Too many iterations')
        break
      }
      var tri = this.flip.pop()
      if (tri.get('del'))
        continue
      var ti = tri.getGeometry().getCoordinates()[0]
      for (var k = 0; k < 3; k++) {
        // Get facing triangles
        var mid = [(ti[(k + 1) % 3][0] + ti[k][0]) / 2, (ti[(k + 1) % 3][1] + ti[k][1]) / 2]
        var triangles = this.getTrianglesAt(mid)
        var pt1 = null
        // Get opposite point
        if (triangles.length > 1) {
          var t0 = triangles[0].getGeometry().getCoordinates()[0]
          var t1 = triangles[1].getGeometry().getCoordinates()[0]
          for (pi = 0; pi < t1.length; pi++) {
            if (!this._ptInTriangle(t1[pi], t0)) {
              pt1 = t1[pi]
              break
            }
          }
        }
        if (pt1) {
          // Is in circle ?
          if (this.inCircle(pt1, t0)) {
            var pt2
            // Get opposite point
            for (pi = 0; pi < t0.length; pi++) {
              if (!this._ptInTriangle(t0[pi], t1)) {
                pt2 = t0.splice(pi, 1)[0]
                break
              }
            }
            // Flip triangles
            if (this.intersectSegs([pt1, pt2], t0)) {
              while (triangles.length) {
                var tmp = triangles.pop()
                tmp.set('del', true)
                this.removeFeature(tmp)
              }
              this._addTriangle([pt1, pt2, t0[0]])
              this._addTriangle([pt1, pt2, t0[1]])
            }
          }
        }
      }
    }
  }
  /** Test intersection beetween 2 segs
   * @param {Array<ol.coordinates>} d1
   * @param {Array<ol.coordinates>} d2
   * @return {bbolean}
   */
  intersectSegs(d1, d2) {
    var d1x = d1[1][0] - d1[0][0]
    var d1y = d1[1][1] - d1[0][1]
    var d2x = d2[1][0] - d2[0][0]
    var d2y = d2[1][1] - d2[0][1]
    var det = d1x * d2y - d1y * d2x

    if (det != 0) {
      var k = (d1x * d1[0][1] - d1x * d2[0][1] - d1y * d1[0][0] + d1y * d2[0][0]) / det
      // Intersection: return [d2[0][0] + k*d2x, d2[0][1] + k*d2y];
      return (0 < k && k < 1)
    }
    else
      return false
  }
  /** Test pt is a triangle's node
   * @param {ol.coordinate} pt
   * @param {Array<ol.coordinate>} triangle
   * @return {boolean}
   */
  _ptInTriangle(pt, triangle) {
    for (var i = 0, p; p = triangle[i]; i++) {
      if (ol_coordinate_equal(pt, p))
        return true
    }
    return false
  }
  /** List points in a triangle (assume points get an id) for debug purposes
   * @param {Array<ol.coordinate>} pts
   * @return {String} ids list
   */
  listpt(pts) {
    var s = ''
    for (var i = 0, p; p = pts[i]; i++) {
      var c = this._nodes.getClosestFeatureToCoordinate(p)
      if (!ol_coordinate_equal(c.getGeometry().getCoordinates(), p))
        c = null
      s += (s ? ', ' : '') + (c ? c.get('id') : '?')
    }
    return s
  }
  /** Test if coord is within triangle's circumcircle
   * @param {ol.coordinate} coord
   * @param {Array<ol.coordinate>} triangle
   * @return {boolean}
   */
  inCircle(coord, triangle) {
    var c = this.getCircumCircle(triangle)
    return ol_coordinate_dist2d(coord, c.center) < c.radius
  }
  /** Calculate the circumcircle of a triangle
   * @param {Array<ol.coordinate>} triangle
   * @return {*}
   */
  getCircumCircle(triangle) {
    var x1 = triangle[0][0]
    var y1 = triangle[0][1]
    var x2 = triangle[1][0]
    var y2 = triangle[1][1]
    var x3 = triangle[2][0]
    var y3 = triangle[2][1]

    var m1 = (x1 - x2) / (y2 - y1)
    var m2 = (x1 - x3) / (y3 - y1)
    var b1 = ((y1 + y2) / 2) - m1 * (x1 + x2) / 2
    var b2 = ((y1 + y3) / 2) - m2 * (x1 + x3) / 2
    var cx = (b2 - b1) / (m1 - m2)
    var cy = m1 * cx + b1

    var center = [cx, cy]
    return {
      center: center,
      radius: ol_coordinate_dist2d(center, triangle[0])
    }
  }
  /** Get triangles at a point
   */
  getTrianglesAt(coord) {
    var extent = ol_extent_buffer(ol_extent_boundingExtent([coord]), this.get('epsilon'))
    var result = []
    this.forEachFeatureIntersectingExtent(extent, function (f) {
      result.push(f)
    })
    return result
  }
  /** Get nodes at a point
   */
  getNodesAt(coord) {
    var extent = ol_extent_buffer(ol_extent_boundingExtent([coord]), this.get('epsilon'))
    return this._nodes.getFeaturesInExtent(extent)
  }
  /** Get Voronoi
   * @param {boolean} border include border, default false
   * @return { Array< ol.geom.Polygon > }
   */
  calculateVoronoi(border) {
    var voronoi = []
    this.getNodes().forEach(function (f) {
      var pt = f.getGeometry().getCoordinates()
      var isborder = false
      if (border !== true) {
        for (var i = 0; i < this.hull.length; i++) {
          if (ol_coordinate_equal(pt, this.hull[i])) {
            isborder = true
            break
          }
        }
      }
      if (!isborder) {
        var tr = this.getTrianglesAt(pt)
        var pts = []
        tr.forEach(function (triangle) {
          var c = this.getCircumCircle(triangle.getGeometry().getCoordinates()[0])
          pts.push({
            pt: c.center,
            d: Math.atan2(c.center[1] - pt[1], c.center[0] - pt[0])
          })
        }.bind(this))
        pts.sort(function (a, b) { return a.d - b.d })
        var poly = []
        pts.forEach(function (p) {
          poly.push(p.pt)
        })
        poly.push(poly[0])
        var prop = f.getProperties()
        prop.geometry = new ol_geom_Polygon([poly])
        voronoi.push(new ol_Feature(prop))
      }
    }.bind(this))
    return voronoi
  }
}

export default ol_source_Delaunay