export default ol_interaction_GeolocationDraw;
/** Interaction to draw on the current geolocation
 *	It combines a draw with a ol_Geolocation
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires drawstart, drawend, drawing, tracking, follow
 * @param {any} options
 *  @param { ol.Collection.<ol.Feature> | undefined } option.features Destination collection for the drawn features.
 *  @param { ol.source.Vector | undefined } options.source Destination source for the drawn features.
 *  @param {ol.geom.GeometryType} options.type Drawing type ('Point', 'LineString', 'Polygon'), default LineString.
 *  @param {Number | undefined} options.minAccuracy minimum accuracy underneath a new point will be register (if no condition), default 20
 *  @param {function | undefined} options.condition a function that take a ol_Geolocation object and return a boolean to indicate whether location should be handled or not, default return true if accuracy < minAccuracy
 *  @param {Object} options.attributes a list of attributes to register as Point properties: {accuracy:true,accuracyGeometry:true,heading:true,speed:true}, default none.
 *  @param {Number} options.tolerance tolerance to add a new point (in meter), default 5
 *  @param {Number} options.zoom zoom for tracking, default 16
 *  @param {Number} options.minZoom min zoom for tracking, if zoom is less it will zoom to it, default use zoom option
 *  @param {boolean|auto|position|visible} options.followTrack true if you want the interaction to follow the track on the map, default true
 *  @param { ol.style.Style | Array.<ol.style.Style> | ol.StyleFunction | undefined } options.style Style for sketch features.
 */
declare class ol_interaction_GeolocationDraw {
    constructor(options: any);
    geolocation: ol_Geolocation;
    path_: any[];
    lastPosition_: boolean;
    locStyle: {
        error: ol_style_Style;
        warn: ol_style_Style;
        ok: ol_style_Style;
    };
    overlayLayer_: ol_layer_Vector<ol_source_Vector<import("ol/geom/Geometry").default>>;
    sketch_: ol_Feature<import("ol/geom/Geometry").default>[];
    features_: any;
    source_: any;
    condition_: any;
    /** Simplify 3D geometry
     * @param {ol.geom.Geometry} geo
     * @param {number} tolerance
     */
    simplify3D(geo: ol.geom.Geometry, tolerance: number): ol.geom.Geometry;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    /** Activate or deactivate the interaction.
     * @param {boolean} active
     */
    setActive(active: boolean): void;
    /** Simulate a track and override current geolocation
     * @param {Array<ol.coordinate>|boolean} track a list of point or false to stop
     * @param {*} options
     *  @param {number} delay delay in ms, default 1000 (1s)
     *  @param {number} accuracy gps accuracy, default 10
     *  @param {boolean} repeat repeat track, default true
     */
    simulate(track: Array<ol.coordinate> | boolean, options: any): void;
    _track: boolean | {
        track: true | ol.coordinate[];
        pos: number;
        timeout: number;
    };
    /** Is simulation on ?
     * @returns {boolean}
     */
    simulating(): boolean;
    /** Reset drawing
    */
    reset(): void;
    /** Start tracking = setActive(true)
     */
    start(): void;
    /** Stop tracking = setActive(false)
     */
    stop(): void;
    /** Pause drawing
     * @param {boolean} b
     */
    pause(b: boolean): void;
    pause_: boolean;
    /** Is paused
     * @return {boolean} b
     */
    isPaused(): boolean;
    /** Enable following the track on the map
    * @param {boolean|auto|position|visible} follow,
    *	false: don't follow,
    *	true: follow (position+zoom),
    *	'position': follow only position,
    *	'auto': start following until user move the map,
    *	'visible': center when position gets out of the visible extent
    */
    setFollowTrack(follow: boolean | auto | position | visible): void;
    /** Add a new point to the current path
     * @private
     */
    private draw_;
    /** Get a position according to the geolocation
     * @param {Geolocation} loc
     * @returns {Array<any>} an array of measure X,Y,Z,T
     * @api
     */
    getPosition(loc: Geolocation): Array<any>;
}
import ol_Geolocation from "ol/Geolocation";
import ol_style_Style from "ol/style/Style";
import ol_source_Vector from "ol/source/Vector";
import ol_layer_Vector from "ol/layer/Vector";
import ol_Feature from "ol/Feature";
