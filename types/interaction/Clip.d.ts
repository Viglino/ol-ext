export default ol_interaction_Clip;
/** Clip interaction to clip layers in a circle
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {ol_interaction_Clip.options} options flashlight  param
 *  @param {number} options.radius radius of the clip, default 100
 *	@param {ol.layer|Array<ol.layer>} options.layers layers to clip
 */
declare class ol_interaction_Clip {
    constructor(options: any);
    layers_: any[];
    precomposeBind_: any;
    postcomposeBind_: any;
    pos: boolean;
    radius: any;
    /** Set the map > start postcompose
    */
    setMap(map: any): void;
    /** Set clip radius
     *	@param {integer} radius
     */
    setRadius(radius: integer): void;
    /** Get clip radius
     *	@returns {integer} radius
     */
    getRadius(): integer;
    /** Add a layer to clip
     *	@param {ol.layer|Array<ol.layer>} layer to clip
    */
    addLayer(layers: any): void;
    /** Remove all layers
     */
    removeLayers(): void;
    /** Remove a layer to clip
     *	@param {ol.layer|Array<ol.layer>} layer to clip
    */
    removeLayer(layers: any): void;
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
    precompose_(e: any): void;
    postcompose_(e: any): void;
    /**
     * Activate or deactivate the interaction.
     * @param {boolean} active Active.
     * @observable
     * @api
     */
    setActive(b: any): void;
}
