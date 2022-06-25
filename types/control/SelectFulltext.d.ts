export default ol_control_SelectFulltext;
/**
 * Select features by property using a simple text input
 *
 * @constructor
 * @extends {ol_control_SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {string} options.property property to select on
 *  @param {function|undefined} options.onchoice function triggered the text change, default nothing
 */
declare class ol_control_SelectFulltext {
    constructor(options: any);
    _input: HTMLElement | Text;
    _onchoice: any;
    /** Select features by condition
     */
    doSelect(options: any): any;
}
