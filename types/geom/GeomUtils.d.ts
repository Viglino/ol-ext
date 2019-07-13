import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature'
/** Distance beetween 2 points
*	Useful geometric functions
* @param {ol.Coordinate} p1 first point
* @param {ol.Coordinate} p2 second point
* @return {number} distance
*/
export function dist2d(p1: Coordinate, p2: Coordinate): number;
/** 2 points are equal
   * Useful geometric functions
   * @param {Coordinate} p1 first point
   * @param {Coordinate} p2 second point
   * @return {boolean}
    */
export function equal(p1: Coordinate, p2: Coordinate): boolean;
/** Get center coordinate of a feature
* @param {Feature} f
* @return {Coordinate} the center
 */
export function getFeatureCenter(f: Feature): Coordinate;
/** Get center coordinate of a geometry
* @param {Feature} geom
* @return {Coordinate} the center
 */
export function getGeomCenter(geom: Feature): Coordinate;
/** Offset a polyline
 * @param {Array<Coordinate>} coords
 * @param {number} offset
 * @return {Array<Coordinate>} resulting coord
 * @see http://stackoverflow.com/a/11970006/796832
 * @see https://drive.google.com/viewerng/viewer?a=v&pid=sites&srcid=ZGVmYXVsdGRvbWFpbnxqa2dhZGdldHN0b3JlfGd4OjQ4MzI5M2Y0MjNmNzI2MjY
 */
export function offsetCoords(coords: Coordinate[], offset: number): Coordinate[];
/** Find the segment a point belongs to
 * @param {Coordinate} pt
 * @param {Array<Coordinate>} coords
 * @return {} the index (-1 if not found) and the segment
 */
export function findSegment(pt: Coordinate, coords: Coordinate[]): any;
/**
 * Split a Polygon geom with horizontal lines
 * @param {Array<Coordinate>} geom
 * @param {number} y the y to split
 * @param {number} n contour index
 * @return {Array<Array<Coordinate>>}
 */
export function splitH(geom: Coordinate[], y: number, n: number): Coordinate[][];