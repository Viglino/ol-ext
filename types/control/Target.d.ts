export default ol_control_Target;
/** ol_control_Target draw a target at the center of the map.
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object} options
 *  @param {ol.style.Style|Array<ol.style.Style>} options.style
 *  @param {string} options.composite composite operation = difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
declare class ol_control_Target {
    constructor(options: any);
    style: any[];
    composite: any;
    /** Set the control visibility
     * @paraam {boolean} b
     */
    setVisible(b: any): void;
    /** Get the control visibility
     * @return {boolean} b
     */
    getVisible(): boolean;
    /** Draw the target
     * @private
     */
    private _draw;
}
