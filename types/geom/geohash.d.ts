/** Encodes latitude/longitude to geohash, either to specified precision or to automatically
 * evaluated precision.
 * @param   {ol.coordinate} lonlat Longitude, Latitude in degrees.
 * @param   {number} [precision] Number of characters in resulting geohash.
 * @returns {string} Geohash of supplied latitude/longitude.
 */
declare function ol_geohash_fromLonLat(lonlat: ol.coordinate, precision?: number): string;
/** Decode geohash to latitude/longitude
 * (location is approximate centre of geohash cell, to reasonable precision).
 * @param   {string} geohash - Geohash string to be converted to latitude/longitude.
 * @returns {ol.coordinate}
 */
declare function ol_geohash_toLonLat(geohash: string): ol.coordinate;
/** Returns SW/NE latitude/longitude bounds of specified geohash.
 * @param   {string} geohash Cell that bounds are required of.
 * @returns {ol.extent | false}
 */
declare function ol_geohash_getExtent(geohash: string): ol.extent | false;
/** Determines adjacent cell in given direction.
 * @param   {string} geohash Geohash cel
 * @param   {string} direction direction as char : N/S/E/W.
 * @returns {string|false}
 */
declare function ol_geohash_getAdjacent(geohash: string, direction: string): string | false;
/** Returns all 8 adjacent cells to specified geohash.
 * @param   {string} geohash Geohash neighbours are required of.
 * @returns {{n,ne,e,se,s,sw,w,nw: string}}
 */
declare function ol_geohash_getNeighbours(geohash: string): {
    n;
    ne;
    e;
    se;
    s;
    sw;
    w;
    nw: string;
};
export { ol_geohash_fromLonLat as fromLonLat, ol_geohash_toLonLat as toLonLat, ol_geohash_getExtent as getExtent, ol_geohash_getAdjacent as getAdjacent, ol_geohash_getNeighbours as getNeighbours };
