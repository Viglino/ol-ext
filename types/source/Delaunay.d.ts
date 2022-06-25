export default ol_source_Delaunay;
/** Delaunay source
 * Calculate a delaunay triangulation from points in a source
 * @param {*} options extend ol/source/Vector options
 *  @param {ol/source/Vector} options.source the source that contains the points
 */
declare class ol_source_Delaunay {
    constructor(options: any);
    _nodes: any;
    hull: any[];
    /** Clear source (and points)
     * @param {boolean} opt_fast
     */
    clear(opt_fast: boolean): void;
    /** Add a new triangle in the source
     * @param {Array<ol/coordinates>} pts
     */
    _addTriangle(pts: any): ol_Feature<ol_geom_Polygon>;
    /** Get nodes
     */
    getNodes(): any;
    /** Get nodes source
     */
    getNodeSource(): any;
    /**
     * A point has been removed
     * @param {ol/source/Vector.Event} evt
     */
    _onRemoveNode(evt: any): void;
    flip: any[];
    /**
     * A new point has been added
     * @param {ol/source/VectorEvent} e
     */
    _onAddNode(e: any): void;
    /** Flipping algorithme: test new inserted triangle and flip
     */
    flipTriangles(): void;
    /** Test intersection beetween 2 segs
     * @param {Array<ol.coordinates>} d1
     * @param {Array<ol.coordinates>} d2
     * @return {bbolean}
     */
    intersectSegs(d1: Array<ol.coordinates>, d2: Array<ol.coordinates>): bbolean;
    /** Test pt is a triangle's node
     * @param {ol.coordinate} pt
     * @param {Array<ol.coordinate>} triangle
     * @return {boolean}
     */
    _ptInTriangle(pt: ol.coordinate, triangle: Array<ol.coordinate>): boolean;
    /** List points in a triangle (assume points get an id) for debug purposes
     * @param {Array<ol.coordinate>} pts
     * @return {String} ids list
     */
    listpt(pts: Array<ol.coordinate>): string;
    /** Test if coord is within triangle's circumcircle
     * @param {ol.coordinate} coord
     * @param {Array<ol.coordinate>} triangle
     * @return {boolean}
     */
    inCircle(coord: ol.coordinate, triangle: Array<ol.coordinate>): boolean;
    /** Calculate the circumcircle of a triangle
     * @param {Array<ol.coordinate>} triangle
     * @return {*}
     */
    getCircumCircle(triangle: Array<ol.coordinate>): any;
    /** Get triangles at a point
     */
    getTrianglesAt(coord: any): any[];
    /** Get nodes at a point
     */
    getNodesAt(coord: any): any;
    /** Get Voronoi
     * @param {boolean} border include border, default false
     * @return { Array< ol.geom.Polygon > }
     */
    calculateVoronoi(border: boolean): Array<ol.geom.Polygon>;
}
import ol_geom_Polygon from "ol/geom/Polygon";
import ol_Feature from "ol/Feature";
