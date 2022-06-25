export default ol_control_SelectMulti;
/**
 * A multiselect control.
 * A container that manage other control Select
 *
 * @constructor
 * @extends {ol_control_SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {Array<ol.control.SelectBase>} options.controls an array of controls
 */
declare class ol_control_SelectMulti {
    constructor(options: any);
    _container: HTMLElement | Text;
    _controls: any[];
    /**
    * Set the map instance the control associated with.
    * @param {o.Map} map The map instance.
    */
    setMap(map: o.Map): void;
    /** Add a new control
     * @param {ol.control.SelectBase} c
     */
    addControl(c: ol.control.SelectBase): void;
    /** Get select controls
     * @return {Aray<ol.control.SelectBase>}
     */
    getControls(): Aray<ol.control.SelectBase>;
    /** Select features by condition
     */
    doSelect(): any[];
}
