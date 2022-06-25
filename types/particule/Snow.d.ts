export default ol_particule_Snow;
/** Rain particules to display clouds over the map
 * @constructor
 * @extends {ol_particule_Base}
 * @param {*} options
 *  @param {ol.Overlay} options.overlay
 *  @param {ol.pixel} coordinate the position of the particule
 */
declare class ol_particule_Snow {
    constructor(options: any);
    z: number;
    angle: number;
    image: HTMLElement;
    /** Draw the particule
     * @param {CanvasRenderingContext2D } ctx
     */
    draw(ctx: CanvasRenderingContext2D): void;
    /** Update the particule
     * @param {number} dt timelapes since last call
     */
    update(dt: number): void;
}
