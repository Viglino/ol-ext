import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import { LineString } from 'ol/geom';
import { Vector } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
/** Algorithms to on a graph (shortest path).
 * @namespace graph
 */
/**
 * @classdesc
 * Compute the shortest paths between nodes in a graph source
 * The source must only contains LinesString.
 *
 * It uses a A* optimisation.
 * You can overwrite methods to customize the result.
 * @see https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
 * @constructor
 * @fires calculating
 * @fires start
 * @fires finish
 * @fires pause
 * @param {any} options
 *  @param {Vector} options.source the source for the edges
 *  @param {number} [options.maxIteration=20000] maximum iterations before a pause event is fired, default 20000
 *  @param {number} [options.stepIteration=2000] number of iterations before a calculating event is fired, default 2000
 *  @param {number} [options.epsilon=1E-6] geometric precision (min distance beetween 2 points), default 1E-6
 */
export class Dijskra {
    constructor(options: {
        source: Vector;
        maxIteration?: number;
        stepIteration?: number;
        epsilon?: number;
    });
    /** Get the weighting of the edge, for example a speed factor
     * The function returns a value beetween ]0,1]
     * - 1   = no weighting
     * - 0.5 = goes twice more faster on this road
     *
     * If no feature is provided you must return the lower weighting you're using
     * @param {Feature} feature
     * @return {number} a number beetween 0-1
     * @api
     */
    weight(feature: Feature): number;
    /** Get the edge direction
     * -  0 : the road is blocked
     * -  1 : direct way
     * - -1 : revers way
     * -  2 : both way
     * @param {Feature} feature
     * @return {Number} 0: blocked, 1: direct way, -1: revers way, 2:both way
     * @api
     */
    direction(feature: Feature): number;
    /** Calculate the length of an edge
     * @param {Feature|LineString} geom
     * @return {number}
     * @api
     */
    getLength(geom: Feature | LineString): number;
    /** Get the nodes source concerned in the calculation
     * @return {VectorSource}
     */
    getNodeSource(): VectorSource;
    /** Get all features at a coordinate
     * @param {Coordinate} coord
     * @return {Array<Feature>}
     */
    getEdges(coord: Coordinate): Feature[];
    /** Get a node at a coordinate
     * @param {Coordinate} coord
     * @return {Feature} the node
     */
    getNode(coord: Coordinate): Feature;
    /** Calculate a path beetween 2 points
     * @param {Coordinate} start
     * @param {Coordinate} end
     * @return {boolean|Array<Coordinate>} false if don't start (still running) or start and end nodes
     */
    path(start: Coordinate, end: Coordinate): boolean | Coordinate[];
    /** Restart after pause
     */
    resume(): void;
    /** Pause
     */
    pause(): void;
    /** Get the current 'best way'.
     * This may be used to animate while calculating.
     * @return {Array<Feature>}
     */
    getBestWay(): Feature[];
}
