export default ol_control_EditBar;
/** Control bar for editing in a layer
 * @constructor
 * @extends {ol_control_Bar}
 * @fires info
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {String} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {boolean} options.edition false to remove the edition tools, default true
 *	@param {Object} options.interactions List of interactions to add to the bar
 *    ie. Select, Delete, Info, DrawPoint, DrawLine, DrawPolygon
 *    Each interaction can be an interaction or true (to get the default one) or false to remove it from bar
 *	@param {ol.source.Vector} options.source Source for the drawn features.
 */
declare class ol_control_EditBar {
    constructor(options: any);
    _source: any;
    _interactions: {};
    /**
     * Set the map instance the control is associated with
     * and add its controls associated to this map.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    /** Get an interaction associated with the bar
     * @param {string} name
     */
    getInteraction(name: string): any;
    /** Get the option title */
    _getTitle(option: any): any;
    /** Add selection tool:
     * 1. a toggle control with a select interaction
     * 2. an option bar to delete / get information on the selected feature
     * @private
     */
    private _setSelectInteraction;
    /** Add editing tools
     * @private
     */
    private _setEditInteraction;
    /**
     * @private
     */
    private _setDrawPolygon;
    /** Add modify tools
     * @private
     */
    private _setModifyInteraction;
}
