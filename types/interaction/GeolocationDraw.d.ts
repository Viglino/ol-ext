import { Map as _ol_Map_ } from 'ol';
import { Vector as VectorSource } from 'ol/source';
import { StyleLike } from 'ol/style/Style';
import GeometryType from 'ol/geom/GeometryType';
import { Interaction } from 'ol/interaction';
/** Interaction to draw on the current geolocation
 *	It combines a draw with a Geolocation
 * @constructor
 * @extends {Interaction}
 * @fires drawstart, drawend, drawing, tracking, follow
 * @param {any} options
 *	@param { Collection.<Feature> | undefined } option.features Destination collection for the drawn features.
 *	@param { VectorSource | undefined } options.source Destination source for the drawn features.
 *	@param {GeometryType} options.type Drawing type ('Point', 'LineString', 'Polygon'), default LineString.
 *	@param {Number | undefined} options.minAccuracy minimum accuracy underneath a new point will be register (if no condition), default 20
 *	@param {function | undefined} options.condition a function that take a Geolocation object and return a boolean to indicate whether location should be handled or not, default return true if accuraty < minAccuraty
 *	@param {Object} options.attributes a list of attributes to register as Point properties: {accuracy:true,accuracyGeometry:true,heading:true,speed:true}, default none.
 *	@param {Number} options.tolerance tolerance to add a new point (in projection unit), use LineString.simplify() method, default 5
 *	@param {Number} options.zoom zoom for tracking, default 16
 *	@param {boolean|auto|position|visible} options.followTrack true if you want the interaction to follow the track on the map, default true
 *	@param { Style | Array.<Style> | StyleFunction | undefined } options.style Style for sketch features.
 */
export class GeolocationDraw extends Interaction {
    constructor(options: {
        source: VectorSource | undefined;
        type: GeometryType;
        minAccuracy: number | undefined;
        condition: ((...params: any[]) => any) | undefined;
        attributes: any;
        tolerance: number;
        zoom: number;
        followTrack: boolean | 'auto' | 'position' | 'visible';
        style: StyleLike | undefined;
    });
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /** Activate or deactivate the interaction.
    * @param {boolean} active
     */
    setActive(active: boolean): void;
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
    *	'visible': center when position gets out of the visible Extent
     */
    setFollowTrack(follow: boolean | 'auto' | 'position' | 'visible'): void;
}
