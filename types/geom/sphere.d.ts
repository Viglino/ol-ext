/** Compute great circle bearing of two points.
 * @See http://www.movable-type.co.uk/scripts/latlong.html for the original code
 * @param {ol.coordinate} origin origin in lonlat
 * @param {ol.coordinate} destination destination in lonlat
 * @return {number} bearing angle in radian
 */
declare function ol_sphere_greatCircleBearing(origin: ol.coordinate, destination: ol.coordinate): number;
/**
 * Computes the destination point given an initial point, a distance and a bearing
 * @See http://www.movable-type.co.uk/scripts/latlong.html for the original code
 * @param {ol.coordinate} origin stating point in lonlat coords
 * @param {number} distance
 * @param {number} bearing bearing angle in radian
 * @param {*} options
 *  @param {booelan} normalize normalize longitude beetween -180/180, deafulet true
 *  @param {number|undefined} options.radius sphere radius, default 6371008.8
 */
declare function ol_sphere_computeDestinationPoint(origin: ol.coordinate, distance: number, bearing: number, options: any): number[];
/** Calculate a track along the great circle given an origin and a destination
 * @param {ol.coordinate} origin origin in lonlat
 * @param {ol.coordinate} destination destination in lonlat
 * @param {number} distance distance between point along the track in meter, default 1km (1000)
 * @param {number|undefined} radius sphere radius, default 6371008.8
 * @return {Array<ol.coordinate>}
 */
declare function ol_sphere_greatCircleTrack(origin: ol.coordinate, destination: ol.coordinate, options: any): Array<ol.coordinate>;
/** Get map scale factor
 * @param {ol_Map} map
 * @param {number} [dpi=96] dpi, default 96
 * @return {number}
 */
declare function ol_sphere_getMapScale(map: ol_Map, dpi?: number): number;
/** Set map scale factor
 * @param {ol_Map} map
 * @param {number|string} scale the scale factor or a scale string as 1/xxx
 * @param {number} [dpi=96] dpi, default 96
 * @return {number} scale factor
 */
declare function ol_sphere_setMapScale(map: ol_Map, scale: number | string, dpi?: number): number;
export { ol_sphere_greatCircleBearing as greatCircleBearing, ol_sphere_computeDestinationPoint as computeDestinationPoint, ol_sphere_greatCircleTrack as greatCircleTrack, ol_sphere_getMapScale as getMapScale, ol_sphere_setMapScale as setMapScale };
