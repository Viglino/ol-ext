export default ol_interaction_ClipMap;
/** Clip interaction to clip layers in a circle
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {ol_interaction_ClipMap.options} options flashlight  param
 *  @param {number} options.radius radius of the clip, default 100 (px)
 */
declare class ol_interaction_ClipMap {
    constructor(options: any);
    layers_: any[];
    pos: number[];
    radius: any;
    /** Set the map > start postcompose
    */
    setMap(map: any): void;
    _listener: any;
    /** Set clip radius
     *	@param {integer} radius
     */
    setRadius(radius: integer): void;
    /** Get clip radius
     *	@returns {integer} radius
     */
    getRadius(): integer;
    /** Set position of the clip
     * @param {ol.coordinate} coord
     */
    setPosition(coord: ol.coordinate): void;
    /** Get position of the clip
     * @returns {ol.coordinate}
     */
    getPosition(): ol.coordinate;
    /** Set position of the clip
     * @param {ol.Pixel} pixel
     */
    setPixelPosition(pixel: ol.Pixel): void;
    /** Get position of the clip
     * @returns {ol.Pixel} pixel
     */
    getPixelPosition(): ol.Pixel;
    /** Set position of the clip
     * @param {ol.MapBrowserEvent} e
     * @privata
     */
    _setPosition(e: ol.MapBrowserEvent): void;
    /** Clip
     * @private
     */
    private _clip;
}
