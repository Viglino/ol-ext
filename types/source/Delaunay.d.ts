import { Vector as VectorSource } from 'ol/source';
/** Delaunay source
 * Calculate a delaunay triangulation from points in a source
 * @param {*} options extend Vector options
 *  @param {Vector} options.source the source that contains the points
 */
export function Delaunay(options: {
    source: VectorSource;
}): void;
