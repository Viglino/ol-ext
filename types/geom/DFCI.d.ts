/** Convert coordinate to French DFCI grid
 * @param {ol/coordinate} coord
 * @param {number} level [0-3]
 * @param {ol/proj/Projection} projection of the coord, default EPSG:27572
 * @return {String} the DFCI index
 */
export function ol_coordinate_toDFCI(coord: any, level: number, projection: any): string;
/** Get coordinate from French DFCI index
 * @param {String} index the DFCI index
 * @param {ol/proj/Projection} projection result projection, default EPSG:27572
 * @return {ol/coordinate} coord
 */
export function ol_coordinate_fromDFCI(index: string, projection: any): ol;
/** The string is a valid DFCI index
 * @param {string} index DFCI index
 * @return {boolean}
 */
export function ol_coordinate_validDFCI(index: string): boolean;
/** Coordinate is valid for DFCI
 * @param {ol/coordinate} coord
 * @param {ol/proj/Projection} projection result projection, default EPSG:27572
 * @return {boolean}
 */
export function ol_coordinate_validDFCICoord(coord: any, projection: any): boolean;
