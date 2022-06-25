export default ol_control_Legend;
/** Create a legend for styles
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @fires select
 * @param {*} options
 *  @param {String} options.className class of the control
 *  @param {ol_legend_Legend} options.legend
 *  @param {boolean | undefined} options.collapsed Specify if legend should be collapsed at startup. Default is true.
 *  @param {boolean | undefined} options.collapsible Specify if legend can be collapsed, default true.
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 */
declare class ol_control_Legend {
    constructor(options: any);
    _legend: any;
    /** Get the legend associated with the control
     * @returns {ol_legend_Legend}
     */
    getLegend(): ol_legend_Legend;
    /** Draw control on canvas
     * @param {boolean} b draw on canvas.
     */
    setCanvas(b: boolean): void;
    _onCanvas: boolean;
    /** Is control on canvas
     * @returns {boolean}
     */
    onCanvas(): boolean;
    /** Draw legend on canvas
     * @private
     */
    private _draw;
    /** Show control
     */
    show(): void;
    /** Hide control
     */
    hide(): void;
    /** Show/hide control
     * @returns {boolean}
     */
    collapse(b: any): boolean;
    /** Is control collapsed
     * @returns {boolean}
     */
    isCollapsed(): boolean;
    /** Toggle control
     */
    toggle(): void;
}
import ol_legend_Legend from "../legend/Legend";
