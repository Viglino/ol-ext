import { Coordinate } from 'ol/coordinate';
import Projection from 'ol/proj/Projection';
import { WMTS } from 'ol/source';
/** IGN's Geoportail WMTS source
 * @constructor
 * @extends {WMTS}
 * @param {String=} layer Layer name.
 * @param {olx.source.OSMOptions=} options WMTS options
 *  @param {number} options.minZoom
 *  @param {number} options.maxZoom
 *  @param {string} options.server
 *  @param {string} options.gppKey api key, default 'choisirgeoportail'
 *  @param {string} options.authentication basic authentication associated with the gppKey as btoa("login:pwd")
 *  @param {string} options.format image format, default 'image/jpeg'
 *  @param {string} options.style layer style, default 'normal'
 *  @param {string} options.crossOrigin default 'anonymous'
 *  @param {string} options.wrapX default true
 */
export class Geoportail extends WMTS {
    constructor(layer?: string, options?: {
        minZoom: number;
        maxZoom: number;
        server: string;
        gppKey: string;
        authentication: string;
        format: string;
        style: string;
        crossOrigin: string;
        wrapX: string;
    });
    /** Standard IGN-GEOPORTAIL attribution
     */
    attribution: any;
    /** Get service URL according to server url or standard url
     */
    serviceURL(): void;
    /**
     * Return the associated API key of the Map.
     * @function
     * @return the API key.
     * @api stable
     */
    getGPPKey(): any;
    /**
     * Set the associated API key to the Map.
     * @param {String} key the API key.
     * @param {String} authentication as btoa("login:pwd")
     * @api stable
     */
    setGPPKey(key: string, authentication: string): void;
    /** Return the GetFeatureInfo URL for the passed coordinate, resolution, and
     * projection. Return `undefined` if the GetFeatureInfo URL cannot be
     * constructed.
     * @param {Coordinate} coord
     * @param {Number} resolution
     * @param {Projection} projection default the source projection
     * @param {Object} options
     *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
     * @return {String|undefined} GetFeatureInfo URL.
     */
    getFeatureInfoUrl(coord: Coordinate, resolution: number, projection: Projection, options: {
        INFO_FORMAT: string;
    }): string | undefined;
    /** Get feature info
     * @param {Coordinate} coord
     * @param {Number} resolution
     * @param {Projection} projection default the source projection
     * @param {Object} options
     *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
     *  @param {function} options.callback a function that take the response as parameter
     *  @param {function} options.error function called when an error occurred
     */
    getFeatureInfo(coord: Coordinate, resolution: number, projection: Projection, options: {
        INFO_FORMAT: string;
        callback: (...params: any[]) => any;
        error: (...params: any[]) => any;
    }): void;
    /** Get a tile load function to load tiles with basic authentication
     * @param {string} authentication as btoa("login:pwd")
     * @param {string} format mime type
     * @return {function} tile load function to load tiles with basic authentication
     */
    static tileLoadFunctionWithAuthentication(authentication: string, format: string): (...params: any[]) => any;
}
