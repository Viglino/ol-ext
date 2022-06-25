export default ol_control_Gauge;
/** A simple gauge control to display level information on the map.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *  @param {String} options.className class of the control
 *  @param {String} options.title title of the control
 *  @param {number} options.max maximum value, default 100;
 *  @param {number} options.val the value, default 0
 */
declare class ol_control_Gauge {
    constructor(options: any);
    title_: HTMLElement | Text;
    gauge_: HTMLElement | Text;
    /** Set the control title
    * @param {string} title
    */
    setTitle(title: string): void;
    /** Set/get the gauge value
    * @param {number|undefined} v the value or undefined to get it
    * @return {number} the value
    */
    val(v: number | undefined): number;
    val_: number;
}
