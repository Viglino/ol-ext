export default ol_coordinate_cspline;
/** Calculate cspline on coordinates
 * @param {Array<ol_geom_Geometry.coordinate>} line
 * @param {} options
 *	@param {Number} options.tension a [0,1] number / can be interpreted as the "length" of the tangent, default 0.5
 *  @param {Number} options.resolution size of segment to split
 *	@param {Integer} options.pointsPerSeg number of points per segment to add if no resolution is provided, default add 10 points per segment
 * @return {Array<ol_geom_Geometry.coordinate>}
 */
declare function ol_coordinate_cspline(line: Array<ol_geom_Geometry.coordinate>, options: any): Array<ol_geom_Geometry.coordinate>;
