export default ol_interaction_Ripple;
/**
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {*} options
 *  @param {ol/layer/Layer} options.layer layer to animate
 *  @param {number} options.radius raindrop radius
 *  @param {number} options.interval raindrop interval (in ms), default 1000
 */
declare class ol_interaction_Ripple {
    constructor(options: any);
    riprad: any;
    ripplemap: any[];
    last_map: any[];
    /** Generate random rain drop
    *	@param {integer} interval
    */
    rains(interval: integer): void;
    /** Disturb water at specified point
    *	@param {ol.Pixel|ol.MapBrowserEvent}
    */
    rainDrop(e: any): void;
    /** Postcompose function
    */
    postcompose_(e: any): void;
    width: any;
    height: any;
    ratio: any;
    half_width: number;
    half_height: number;
    size: number;
    oldind: any;
    newind: any;
    texture: any;
    ripple: any;
}
