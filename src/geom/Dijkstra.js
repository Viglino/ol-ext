/*
	Copyright (c) 2018 Jean-Marc VIGLINO,
	released under the CeCILL-B license (http://www.cecill.info/).
*/

import ol_ext_inherits from '../util/ext'
import ol_Object from 'ol/Object';
import ol_geom_LineString from 'ol/geom/LineString';
import ol_geom_Point from 'ol/geom/Point';
import ol_Feature from 'ol/Feature';
import ol_source_Vector from 'ol/source/Vector'
import {boundingExtent as ol_extent_boundingExtent} from 'ol/extent'
import {buffer as ol_extent_buffer} from 'ol/extent'
import {ol_coordinate_dist2d} from "../geom/GeomUtils";

/* Define namespace
 */
var ol_graph = {};
export {ol_graph};

/** 
 * @classdesc 
 * Compute the shortest paths between nodes in a graph source
 * The source must only contains LinesString.
 * 
 * It uses a A* optimisation.
 * You can overwrite methods to customize the result.
 * @see https://en.wikipedia.org/wiki/Dijkstras_algorithm
 * @constructor
 * @fires calculating 
 * @fires start
 * @fires finish
 * @fires pause
 * @param {any} options
 *  @param {ol/source/Vector} options.source the source for the edges 
 *  @param {integer} [options.maxIteration=20000] maximum iterations before a pause event is fired, default 20000
 *  @param {integer} [options.stepIteration=2000] number of iterations before a calculating event is fired, default 2000
 *  @param {number} [options.epsilon=1E-6] geometric precision (min distance beetween 2 points), default 1E-6
 */
var ol_graph_Dijskra = function (options) {
  options = options || {};

  this.source = options.source;
  this.nodes = new ol_source_Vector();

  // Maximum iterations
  this.maxIteration = options.maxIteration || 20000;
  this.stepIteration = options.stepIteration || 2000;
  // A* optimisation
  this.astar = true;
  this.candidat = [];

  ol_Object.call (this);

  this.set ('epsilon', options.epsilon || 1E-6);
};
ol_ext_inherits(ol_graph_Dijskra, ol_Object);

/** Get the weighting of the edge, for example a speed factor
 * The function returns a value beetween ]0,1]
 * - 1   = no weighting
 * - 0.5 = goes twice more faster on this road
 * 
 * If no feature is provided you must return the lower weighting you're using
 * @param {ol/Feature} feature
 * @return {number} a number beetween 0-1 
 * @api
 */
ol_graph_Dijskra.prototype.weight = function(/* feature */) {
  return 1;
};

/** Get the edge direction
 * -  0 : the road is blocked
 * -  1 : direct way
 * - -1 : revers way
 * -  2 : both way
 * @param {ol/Feature} feature
 * @return {Number} 0: blocked, 1: direct way, -1: revers way, 2:both way 
 * @api
 */
ol_graph_Dijskra.prototype.direction = function(/* feature */) {
  return 2;
};

/** Calculate the length of an edge
 * @param {ol/Feature|ol/geom/LineString} geom
 * @return {number}
 * @api
 */
ol_graph_Dijskra.prototype.getLength = function(geom) {
  if (geom.getGeometry) geom = geom.getGeometry();
  return geom.getLength();
};

/** Get the nodes source concerned in the calculation
 * @return {ol/source/Vector}
 */
ol_graph_Dijskra.prototype.getNodeSource = function() {
  return this.nodes;
};

/** Get all features at a coordinate
 * @param {ol/coordinate} coord
 * @return {Array<ol/Feature>}
 */
ol_graph_Dijskra.prototype.getEdges = function(coord) {
  var extent = ol_extent_buffer (ol_extent_boundingExtent([coord]), this.get('epsilon'));
  var result = [];
  this.source.forEachFeatureIntersectingExtent(extent, function(f){
    result.push(f);
  });
  return result;
};

/** Get a node at a coordinate
 * @param {ol/coordinate} coord
 * @return {ol/Feature} the node
 */
ol_graph_Dijskra.prototype.getNode = function(coord) {
  var extent = ol_extent_buffer (ol_extent_boundingExtent([coord]), this.get('epsilon'));
  var result = [];
  this.nodes.forEachFeatureIntersectingExtent(extent, function(f){
    result.push(f);
  });
  return result[0];
};

/** Add a node
 * @param {ol/coorindate} p
 * @param {number} wdist the distance to reach this node
 * @param {ol/Feature} from the feature used to come to this node
 * @param {ol/Feature} prev the previous node
 * @return {ol/Feature} the node
 * @private
 */
ol_graph_Dijskra.prototype.addNode = function(p, wdist, dist, from, prev) {
  // Final condition
  if (this.wdist && wdist > this.wdist) return false;
  // Look for existing point
  var node = this.getNode(p);
  // Optimisation ?
  var dtotal = wdist + this.getLength(new ol_geom_LineString([this.end, p])) * this.weight();
  if (this.astar && this.wdist && dtotal > this.wdist) return false;

  if (node) {
    // Allready there
    if (node!==this.arrival && node.get('wdist') <= wdist) return node;
    // New candidat
    node.set('dist', dist);
    node.set('wdist', wdist);
    node.set('dtotal', dtotal);
    node.set('from', from);
    node.set('prev', prev);
    if (node===this.arrival) {
      this.wdist = wdist;
    }
    this.candidat.push (node);
  } else {
    // New candidat
    node =  new ol_Feature({
      geometry: new ol_geom_Point(p),
      from: from, 
      prev: prev, 
      dist: dist || 0, 
      wdist: wdist, 
      dtotal: dtotal, 
    });
    if (wdist<0) {
      node.set('wdist', false);
    }
    else this.candidat.push (node);
    // Add it in the node source
    this.nodes.addFeature(node);
  }
  return node;
};

/** Get the closest coordinate of a node in the graph source (an edge extremity)
 * @param {ol/coordinate} p
 * @return {ol/coordinate} 
 * @private
 */
ol_graph_Dijskra.prototype.closestCoordinate = function(p) {
  var e = this.source.getClosestFeatureToCoordinate(p);
  var p0 = e.getGeometry().getFirstCoordinate();
  var p1 = e.getGeometry().getLastCoordinate();
  if (ol_coordinate_dist2d(p, p0) < ol_coordinate_dist2d(p, p1)) return p0;
  else return p1;
};

/** Calculate a path beetween 2 points
 * @param {ol/coordinate} start
 * @param {ol/coordinate} end
 * @return {boolean|Array<ol/coordinate>} false if don't start (still running) or start and end nodes
 */
ol_graph_Dijskra.prototype.path = function(start, end) {
  if (this.running) return false;

  // Starting nodes
  start = this.closestCoordinate(start);
  this.end = this.closestCoordinate(end);
  if (start[0]===this.end[0] 
    && start[1]===this.end[1]) {
      this.dispatchEvent({
        type: 'finish',
        route: [],
        wDistance: -1,
        distance: this.wdist
      });
      return false;
    }

  // Initialize
  var self = this;
  this.nodes.clear();
  this.candidat = [];
  this.wdist = 0;
  this.running = true;

  // Starting point
  this.addNode(start, 0);
  // Arrival
  this.arrival = this.addNode(this.end, -1);

  // Start
  this.nb = 0;
  this.dispatchEvent({
    type: 'start'
  });
  setTimeout(function() { self._resume(); });

  return [start, this.end];
};

/** Restart after pause
 */
ol_graph_Dijskra.prototype.resume = function() {
  if (this.running) return;
  if (this.candidat.length) {
    this.running = true;
    this.nb = 0;
    this._resume();
  }
};

/** Pause 
 */
ol_graph_Dijskra.prototype.pause = function() {
  if (!this.running) return;
  this.nb = -1;
};

/** Get the current 'best way'.
 * This may be used to animate while calculating.
 * @return {Array<ol/Feature>}
 */
ol_graph_Dijskra.prototype.getBestWay = function() {
  var node, max = -1;
  for (var i=0, n; n = this.candidat[i]; i++) {
    if (n.get('wdist') > max) {
      node = n;
      max = n.get('wdist');
    }
  }
  // Calculate route to this node
  return this.getRoute(node);
};

/** Go on searching new candidats
 * @private
 */
ol_graph_Dijskra.prototype._resume = function() {
  if (!this.running) return;
  while (this.candidat.length) {
    // Sort by wdist
    this.candidat.sort (function(a,b) {
      return (a.get('dtotal') < b.get('dtotal') ? 1 : a.get('dtotal')===b.get('dtotal') ? 0 : -1);
    });

    // First candidate
    var node = this.candidat.pop();
    var p = node.getGeometry().getCoordinates();
    // Find connected edges
    var edges = this.getEdges(p);

    for (var i=0, e; e=edges[i]; i++) {
      if (node.get('from')!==e) {
        var dist = this.getLength (e);
        if (dist < 0) {
          console.log ('distance < 0!');
          // continue;
        }
        var wdist = node.get('wdist') + dist * this.weight(e);
        dist = node.get('dist') + dist;
        var pt1 = e.getGeometry().getFirstCoordinate();
        var pt2 = e.getGeometry().getLastCoordinate();
        var sens = this.direction(e);
        if (sens!==0) {
          if (p[0]===pt1[0] && p[1]===pt1[1] && sens!==-1) {
            this.addNode(pt2, wdist, dist, e, node);
          }
          if (p[0]===pt2[0] && p[0]===pt2[0] && sens!==1) {
            this.addNode(pt1, wdist, dist, e, node);
          }
        }
      }
      // Test overflow or pause
      if (this.nb === -1 || this.nb++ > this.maxIteration) {
        this.running = false;
        this.dispatchEvent({
          type: 'pause',
          overflow: (this.nb !== -1)
        });
        return;
      }
      // Take time to do something
      if (!(this.nb % this.stepIteration)){
        var self = this;
        window.setTimeout(function() { self._resume() }, 5);
        this.dispatchEvent({
          type: 'calculating'
        });
        return;
      }
    }
  }

  // Finish!
  this.nodes.clear();
  this.running = false;
  this.dispatchEvent({
    type: 'finish',
    route: this.getRoute(this.arrival),
    wDistance: this.wdist,
    distance: this.arrival.get('dist')
  });
};

/** Get the route to a node
 * @param {ol/Feature} node
 * @return {Array<ol/Feature>}
 * @private
 */
ol_graph_Dijskra.prototype.getRoute = function(node) {
  var route = [];
  while (node) {
    route.unshift(node.get('from'));
    node = node.get('prev');
  }
  route.shift();
  return route;
};

export default ol_graph_Dijskra;