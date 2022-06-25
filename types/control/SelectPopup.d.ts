export default ol_control_SelectPopup;
/**
 * Select features by property using a popup
 *
 * @constructor
 * @extends {ol_control_SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {string} options.property property to select on
 *  @param {number} options.max max feature to test to get the values, default 10000
 *  @param {number} options.selectAll select all features if no option selected
 *  @param {string} options.defaultLabel label for the default selection
 *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
 */
declare class ol_control_SelectPopup {
    constructor(options: any);
    _input: HTMLElement | Text;
    _selectAll: any;
    _onchoice: any;
    /**
    * Set the map instance the control associated with.
    * @param {o.Map} map The map instance.
    */
    setMap(map: o.Map): void;
    /** Select features by attributes
     */
    doSelect(options: any): any;
    /** Set the popup values
     * @param {Object} values a key/value list with key = property value, value = title shown in the popup, default search values in the sources
     */
    setValues(options: any): void;
}
