/** French Geoportail alti coding
 * @param {ol.geom.Geometry} geom
 * @param {Object} options
 *  @param {ol/proj~ProjectionLike} [options.projection='EPSG:3857'] geometry projection, default 'EPSG:3857'
 *  @param {string} [options.apiKey='essentiels'] Geoportail API key
 *  @param {number} [options.sampling=0] number of resulting point, max 5000, if none keep input points or use samplingDist
 *  @param {number} [options.samplingDist=0] distance for sampling the line or use sampling if lesser
 *  @param {string} options.success a function that takes the resulting XYZ geometry
 *  @param {string} options.error
 */
export function ol_geom_GPAltiCode(geom: ol.geom.Geometry, options: any): void;
/** Calculate elevation on coordinates or on a set of coordinates
 * @param {ol.coordinate|Array<ol.coordinate>} coord coordinate or an array of coordinates
 * @param {Object} options
 *  @param {ol/proj~ProjectionLike} [options.projection='EPSG:3857'] geometry projection, default 'EPSG:3857'
 *  @param {string} [options.apiKey='essentiels'] Geoportail API key
 *  @param {number} [options.sampling=0] number of resulting point, max 5000, if none keep input points or use samplingDist
 *  @param {number} [options.samplingDist=0] distance for sampling the line or use sampling if lesser
 *  @param {string} options.success a function that takes the resulting XYZ coordinates
 *  @param {string} options.error
 */
export function ol_coordinate_GPAltiCode(coord: ol.coordinate | Array<ol.coordinate>, options: any): void;
