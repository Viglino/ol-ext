/** Create a geometry given a type and coordinates */
export function ol_geom_createFromType(type: any, coordinates: any): ol_geom_LinearRing | ol_geom_LineString | ol_geom_MultiLineString | ol_geom_Point | ol_geom_MultiPoint | ol_geom_Polygon | ol_geom_MultiPolygon;
/** Distance beetween 2 points
 *	Usefull geometric functions
 * @param {ol.Coordinate} p1 first point
 * @param {ol.Coordinate} p2 second point
 * @return {number} distance
 */
export function ol_coordinate_dist2d(p1: ol.Coordinate, p2: ol.Coordinate): number;
/** 2 points are equal
 *	Usefull geometric functions
 * @param {ol.Coordinate} p1 first point
 * @param {ol.Coordinate} p2 second point
 * @return {boolean}
 */
export function ol_coordinate_equal(p1: ol.Coordinate, p2: ol.Coordinate): boolean;
/** Find the segment a point belongs to
 * @param {ol.Coordinate} pt
 * @param {Array<ol.Coordinate>} coords
 * @return {} the index (-1 if not found) and the segment
 */
export function ol_coordinate_findSegment(pt: ol.Coordinate, coords: Array<ol.Coordinate>): any;
/** Get center coordinate of a feature
 * @param {ol.Feature} f
 * @return {ol.coordinate} the center
 */
export function ol_coordinate_getFeatureCenter(f: ol.Feature): ol.coordinate;
/** Get center coordinate of a geometry
* @param {ol.geom.Geometry} geom
* @return {ol.Coordinate} the center
*/
export function ol_coordinate_getGeomCenter(geom: ol.geom.Geometry): ol.Coordinate;
/** Offset a polyline
 * @param {Array<ol.Coordinate>} coords
 * @param {number} offset
 * @return {Array<ol.Coordinate>} resulting coord
 * @see http://stackoverflow.com/a/11970006/796832
 * @see https://drive.google.com/viewerng/viewer?a=v&pid=sites&srcid=ZGVmYXVsdGRvbWFpbnxqa2dhZGdldHN0b3JlfGd4OjQ4MzI5M2Y0MjNmNzI2MjY
 */
export function ol_coordinate_offsetCoords(coords: Array<ol.Coordinate>, offset: number): Array<ol.Coordinate>;
/**
 * Split a Polygon geom with horizontal lines
 * @param {Array<ol.Coordinate>} geom
 * @param {number} y the y to split
 * @param {number} n contour index
 * @return {Array<Array<ol.Coordinate>>}
 */
export function ol_coordinate_splitH(geom: Array<ol.Coordinate>, y: number, n: number): Array<Array<ol.Coordinate>>;
/** Intersect 2 lines
 * @param {Arrar<ol.coordinate>} d1
 * @param {Arrar<ol.coordinate>} d2
 */
export function ol_coordinate_getIntersectionPoint(d1: Arrar<ol.coordinate>, d2: Arrar<ol.coordinate>): false | any[];
export var ol_extent_intersection: any;
/** Add points along a segment
 * @param {ol_Coordinate} p1
 * @param {ol_Coordinate} p2
 * @param {number} d
 * @param {boolean} start include starting point, default true
 * @returns {Array<ol_Coordinate>}
 */
export function ol_coordinate_sampleAt(p1: ol_Coordinate, p2: ol_Coordinate, d: number, start: boolean): Array<ol_Coordinate>;
import ol_geom_LinearRing from "ol/geom/LinearRing";
import ol_geom_LineString from "ol/geom/LineString";
import ol_geom_MultiLineString from "ol/geom/MultiLineString";
import ol_geom_Point from "ol/geom/Point";
import ol_geom_MultiPoint from "ol/geom/MultiPoint";
import ol_geom_Polygon from "ol/geom/Polygon";
import ol_geom_MultiPolygon from "ol/geom/MultiPolygon";
