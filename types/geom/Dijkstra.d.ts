export default ol_graph_Dijskra;
export var ol_graph: {};
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
declare class ol_graph_Dijskra {
    constructor(options: any);
    source: any;
    nodes: ol_source_Vector<import("ol/geom/Geometry").default>;
    maxIteration: any;
    stepIteration: any;
    astar: boolean;
    candidat: any[];
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
    weight(): number;
    /** Get the edge direction
     * -  0 : the road is blocked
     * -  1 : direct way
     * - -1 : revers way
     * -  2 : both way
     * @param {ol/Feature} feature
     * @return {Number} 0: blocked, 1: direct way, -1: revers way, 2:both way
     * @api
     */
    direction(): number;
    /** Calculate the length of an edge
     * @param {ol/Feature|ol/geom/LineString} geom
     * @return {number}
     * @api
     */
    getLength(geom: any): number;
    /** Get the nodes source concerned in the calculation
     * @return {ol/source/Vector}
     */
    getNodeSource(): ol;
    /** Get all features at a coordinate
     * @param {ol/coordinate} coord
     * @return {Array<ol/Feature>}
     */
    getEdges(coord: any): Array<ol>;
    /** Get a node at a coordinate
     * @param {ol/coordinate} coord
     * @return {ol/Feature} the node
     */
    getNode(coord: any): ol;
    /** Add a node
     * @param {ol/coorindate} p
     * @param {number} wdist the distance to reach this node
     * @param {ol/Feature} from the feature used to come to this node
     * @param {ol/Feature} prev the previous node
     * @return {ol/Feature} the node
     * @private
     */
    private addNode;
    wdist: number;
    /** Get the closest coordinate of a node in the graph source (an edge extremity)
     * @param {ol/coordinate} p
     * @return {ol/coordinate}
     * @private
     */
    private closestCoordinate;
    /** Calculate a path beetween 2 points
     * @param {ol/coordinate} start
     * @param {ol/coordinate} end
     * @return {boolean|Array<ol/coordinate>} false if don't start (still running) or start and end nodes
     */
    path(start: any, end: any): boolean | Array<ol>;
    end: ol;
    running: boolean;
    arrival: ol;
    nb: number;
    /** Restart after pause
     */
    resume(): void;
    /** Pause
     */
    pause(): void;
    /** Get the current 'best way'.
     * This may be used to animate while calculating.
     * @return {Array<ol/Feature>}
     */
    getBestWay(): Array<ol>;
    /** Go on searching new candidats
     * @private
     */
    private _resume;
    /** Get the route to a node
     * @param {ol/Feature} node
     * @return {Array<ol/Feature>}
     * @private
     */
    private getRoute;
}
import ol_source_Vector from "ol/source/Vector";
