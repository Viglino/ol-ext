export default ol_Overlay_AnimatedCanvas;
/** An overlay to play animations on top of the map
 * The overlay define a set of particules animated on top of the map.
 * Particules are objects with coordinates.
 * They are dawn in a canvas using the draw particule method.
 * The update particule method updates the particule position according to the timelapse
 *
 * @constructor
 * @extends {ol_Overlay}
 * @param {*} options
 *  @param {String} options.className class of the Overlay
 *  @param {number} option.density particule density, default .5
 *  @param {number} option.speed particule speed, default 4
 *  @param {number} option.angle particule angle in radian, default PI/4
 *  @param {boolean} options.animate start animation, default true
 *  @param {number} options.fps frame per second, default 25
 */
declare class ol_Overlay_AnimatedCanvas {
    constructor(options: any);
    _canvas: HTMLElement | Text;
    _ctx: any;
    _listener: any[];
    _time: number;
    _particuleClass: any;
    /** Create a particule
     * @private
     */
    private _createParticule;
    _fps: number;
    _psize: any;
    /** Set the visibility
     * @param {boolean} b
     */
    setVisible(b: boolean): void;
    /** Get the visibility
     * @return {boolean} b
     */
    getVisible(): boolean;
    /** No update for this overlay
     */
    updatePixelPosition(): void;
    /**
     * Set the map instance the overlay is associated with
     * @param {ol.Map} map The map instance.
     */
    setMap(map: ol.Map): void;
    /** Create particules or return exiting ones
     */
    getParticules(): any[];
    _particules: any[];
    /** Get random coordinates on canvas
     */
    randomCoord(): number[];
    /** Draw canvas overlay (draw each particules)
     * @param {number} dt timelapes since last call
     */
    draw(dt: number): void;
    /** Test if particule exit the canvas and add it on other side
     * @param {*} p the point to test
     * @param {ol.size} size size of the overlap
     */
    testExit(p: any): void;
    /** Clear canvas
     */
    clear(): void;
    /** Get overlay canvas
     * @return {CanvasElement}
     */
    getCanvas(): CanvasElement;
    /** Set canvas animation
     * @param {boolean} anim, default true
     * @api
     */
    setAnimation(anim: boolean): void;
    _pause: boolean;
    /**
     * @private
     */
    private _animate;
}
