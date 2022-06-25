export default ol_particule_Base;
/** Abstract base class; normally only used for creating subclasses.
 * An object with coordinates, draw and update
 * @constructor
 * @extends {ol_Object}
 * @param {*} options
 *  @param {ol.Overlay} options.overlay
 *  @param {ol.pixel} coordinate the position of the particule
 */
declare class ol_particule_Base {
    constructor(options: any);
    coordinate: any;
    /** Set the particule overlay
     * @param {ol.Overlay} overl
     */
    setOverlay(overlay: any): void;
    _overlay: any;
    /** Get the particule overlay
     * @return {ol.Overlay}
     */
    getOverlay(): ol.Overlay;
    /** Draw the particule
     * @param { CanvasRenderingContext2D } ctx
     */
    draw(): void;
    /** Update the particule
     * @param {number} dt timelapes since last call
     */
    update(): void;
    /** Update the particule
     * @param {number} dt timelapes since last call
     */
    getRandomCoord(dt: number): any;
}
