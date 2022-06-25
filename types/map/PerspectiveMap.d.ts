export default ol_PerspectiveMap;
/** A map with a perspective
 * @constructor
 * @extends {ol.Map}
 * @fires change:perspective
 * @param {olx.MapOptions=} options
 *  @param {ol.events.condition} tiltCondition , default altKeyOnly
 */
declare class ol_PerspectiveMap {
    constructor(options: any);
    _tiltCondition: any;
    /** Get pixel ratio for the map
     */
    getPixelRatio(): number;
    /** Set perspective angle
     * @param {number} angle the perspective angle 0 (vertical) - 30 (max), default 0
     * @param {*} options
     *  @param {number} options.duration The duration of the animation in milliseconds, default 500
     *  @param {function} options.easing The easing function used during the animation, defaults to ol.easing.inAndOut).
     */
    setPerspective(angle: number, options: any): void;
    /** Animate the perspective
     * @param {number} t0 starting timestamp
     * @param {number} t current timestamp
     * @param {CSSStyleDeclaration} style style to modify
     * @param {number} fromAngle starting angle
     * @param {number} toAngle ending angle
     * @param {number} duration The duration of the animation in milliseconds, default 500
     * @param {function} easing The easing function used during the animation, defaults to ol.easing.inAndOut).
     * @private
     */
    private _animatePerpective;
    _angle: number;
    /** Convert to pixel coord according to the perspective
     * @param {MapBrowserEvent} mapBrowserEvent The event to handle.
     */
    handleMapBrowserEvent(e: any): void;
    _dragging: any;
    /** Get map full teansform matrix3D
     * @return {Array<Array<number>>}
     */
    getMatrix3D(compute: any): Array<Array<number>>;
    _matrixTransform: number[][];
    /** Get pixel at screen from coordinate.
     * The default getPixelFromCoordinate get pixel in the perspective.
     * @param {ol.coordinate} coord
     * @param {ol.pixel}
     */
    getPixelScreenFromCoordinate(coord: ol.coordinate): number[];
    /** Not working...
     *
     */
    getPixelFromPixelScreen(px: any): number[];
}
