export default ol_control_Swipe;
/**
 * @classdesc Swipe Control.
 * @fires moving
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} Control options.
 *  @param {ol.layer} options.layers layer to swipe
 *  @param {ol.layer} options.rightLayer layer to swipe on right side
 *  @param {string} options.className control class name
 *  @param {number} options.position position propertie of the swipe [0,1], default 0.5
 *  @param {string} options.orientation orientation propertie (vertical|horizontal), default vertical
 */
declare class ol_control_Swipe {
    constructor(options: any);
    precomposeRight_: any;
    precomposeLeft_: any;
    postcompose_: any;
    layers: any[];
    /**
     * Set the map instance the control associated with.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    _listener: any[];
    /** @private
    */
    private isLayer_;
    /** Add a layer to clip
     *	@param {ol.layer|Array<ol.layer>} layer to clip
     *	@param {bool} add layer in the right part of the map, default left.
     */
    addLayer(layers: any, right: any): void;
    /** Remove all layers
     */
    removeLayers(): void;
    /** Remove a layer to clip
     *	@param {ol.layer|Array<ol.layer>} layer to clip
     */
    removeLayer(layers: any): void;
    /** Get visible rectangle
     * @returns {ol.extent}
     */
    getRectangle(): ol.extent;
    /** @private
     */
    private move;
    _movefn: any;
    /** @private
     */
    private _transformPt;
    /** @private
     */
    private _drawRect;
    /** @private
    */
    private precomposeLeft;
    /** @private
    */
    private precomposeRight;
    /** @private
    */
    private postcompose;
}
