import { Coordinate } from 'ol/coordinate';
import Projection from 'ol/proj/Projection';
/** Coordinate is valid for DFCI
 * @param {Coordinate} coord
 * @param {Projection} projection result projection, default EPSG:27572
 * @return {boolean}
 */
export function validDFCICoord(coord: Coordinate, projection: Projection): boolean;
