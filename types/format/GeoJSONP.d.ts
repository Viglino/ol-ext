export default ol_format_GeoJSONP;
/** Feature format for reading and writing data in the GeoJSONP format,
 * using Polyline Algorithm to encode geometry.
 * @constructor
 * @extends {ol_format_GeoJSON}
 * @param {*} options options.
 *  @param {number} options.decimals number of decimals to save, default 6
 *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
 *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
 */
declare class ol_format_GeoJSONP {
    constructor(options: any);
    _lineFormat: ol_format_Polyline;
    /** Encode coordinates
     * @param {ol.coordinate|Array<ol.coordinate>} v
     * @return {string|Array<string>}
     * @api
     */
    encodeCoordinates(v: ol.coordinate | Array<ol.coordinate>): string | Array<string>;
    /** Decode coordinates
     * @param {string|Array<string>}
     * @return {ol.coordinate|Array<ol.coordinate>} v
     * @api
     */
    decodeCoordinates(v: any): ol.coordinate | Array<ol.coordinate>;
}
import ol_format_Polyline from "ol/format/Polyline";
