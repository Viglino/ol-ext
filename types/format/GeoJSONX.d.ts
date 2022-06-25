export default ol_format_GeoJSONX;
/** Feature format for reading and writing data in the GeoJSONX format.
 * @constructor
 * @extends {ol_format_GeoJSON}
 * @param {*} options options.
 *  @param {number} options.decimals number of decimals to save, default 7 for EPSG:4326, 2 for other projections
 *  @param {boolean|Array<*>} options.deleteNullProperties An array of property values to remove, if false, keep all properties, default [null,undefined,""]
 *  @param {boolean|Array<*>} options.extended Decode/encode extended GeoJSON with foreign members (id, bbox, title, etc.), default false
 *  @param {Array<string>|function} options.whiteList A list of properties to keep on features when encoding or a function that takes a property name and retrun true if the property is whitelisted
 *  @param {Array<string>|function} options.blackList A list of properties to remove from features when encoding or a function that takes a property name and retrun true if the property is blacklisted
 *  @param {string} [options.layout='XY'] layout layout (XY or XYZ or XYZM)
 *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
 *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
 */
declare class ol_format_GeoJSONX {
    constructor(options: any);
    _hash: {};
    _count: number;
    _extended: any;
    _whiteList: any;
    _blackList: any;
    _deleteNull: boolean | string[];
    _decimals: number;
    /** Set geometry layout
     * @param {string} layout the geometry layout (XY or XYZ or XYZM)
     */
    setLayout(layout: string): void;
    _layout: string;
    /** Get geometry layout
     * @return {string} layout
     */
    getLayout(): string;
    /** Encode a number
     * @param {number} number Number to encode
     * @param {number} decimals Number of decimals
     * @param {string}
     */
    encodeNumber(number: number, decimals: number): string;
    /** Decode a number
     * @param {string} s
     * @param {number} decimals Number of decimals
     * @return {number}
     */
    decodeNumber(s: string, decimals: number): number;
    /** Encode coordinates
     * @param {ol.coordinate|Array<ol.coordinate>} v
     * @param {number} decimal
     * @return {string|Array<string>}
     * @api
     */
    encodeCoordinates(v: ol.coordinate | Array<ol.coordinate>, decimal: number): string | Array<string>;
    /** Decode coordinates
     * @param {string|Array<string>}
     * @param {number} decimal Number of decimals
     * @return {ol.coordinate|Array<ol.coordinate>} v
     * @api
     */
    decodeCoordinates(v: any, decimals: any): ol.coordinate | Array<ol.coordinate>;
    /** Encode an array of features as a GeoJSONX object.
     * @param {Array<ol.Feature>} features Features.
     * @param {*} options Write options.
     * @return {*} GeoJSONX Object.
     * @override
     * @api
     */
    override writeFeaturesObject(features: Array<ol.Feature>, options: any): any;
    /** Encode a set of features as a GeoJSONX object.
     * @param {ol.Feature} feature Feature
     * @param {*} options Write options.
     * @return {*} GeoJSONX Object.
     * @override
     * @api
     */
    override writeFeatureObject(source: any, options: any): any;
    /** Encode a geometry as a GeoJSONX object.
     * @param {ol.geom.Geometry} geometry Geometry.
     * @param {*} options Write options.
     * @return {*} Object.
     * @override
     * @api
     */
    override writeGeometryObject(source: any, options: any): any;
    /** Decode a GeoJSONX object.
     * @param {*} object GeoJSONX
     * @param {*} options Read options.
     * @return {Array<ol.Feature>}
     * @override
     * @api
     */
    override readFeaturesFromObject(object: any, options: any): Array<ol.Feature>;
    _hashProperties: any;
    /** Decode GeoJSONX Feature object.
     * @param {*} object GeoJSONX
     * @param {*} options Read options.
     * @return {ol.Feature}
     */
    readFeatureFromObject(f0: any, options: any): ol.Feature;
    /** Radix */
    _radix: string;
    /** Radix size */
    _size: number;
    /** GeoSJON types */
    _type: {
        Point: number;
        LineString: number;
        Polygon: number;
        MultiPoint: number;
        MultiLineString: number;
        MultiPolygon: number;
        GeometryCollection: any;
    };
    /** GeoSJONX types */
    _toType: string[];
}
