export default ol_control_Profil;
/**
 * @classdesc OpenLayers 3 Profil Control.
 * Draw a profile of a feature (with a 3D geometry)
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires over
 * @fires out
 * @fires show
 * @fires dragstart
 * @fires dragging
 * @fires dragend
 * @fires dragcancel
 * @param {Object=} options
 *  @param {string} options.className
 *	@param {String} options.title button title
 *  @param {ol.style.Style} [options.style] style to draw the profil, default darkblue
 *  @param {ol.style.Style} [options.selectStyle] style for selection, default darkblue fill
 *  @param {*} options.info keys/values for i19n
 *  @param {number} [options.width=300]
 *  @param {number} [options.height=150]
 *  @param {ol.Feature} [options.feature] the feature to draw profil
 *  @param {boolean} [options.selectable=false] enable selection on the profil, default false
 *  @param {boolean} [options.zoomable=false] can zoom in the profil
 */
declare class ol_control_Profil {
    constructor(options: any);
    info: any;
    button: HTMLButtonElement;
    _style: any;
    _selectStyle: any;
    ratio: number;
    canvas_: HTMLCanvasElement;
    margin_: {
        top: number;
        left: number;
        bottom: number;
        right: number;
    };
    bar_: HTMLDivElement;
    cursor_: HTMLDivElement;
    popup_: HTMLDivElement;
    tab_: any[];
    /** Show popup info
    * @param {string} info to display as a popup
    * @api stable
    */
    popup(info: string): void;
    /** Show point on profil
     * @param {*} p
     * @param {number} dx
     * @private
     */
    private _drawAt;
    /** Show point at coordinate or a distance on the profil
     * @param { ol.coordinates|number } where a coordinate or a distance from begining, if none it will hide the point
     * @return { ol.coordinates } current point
     */
    showAt(where: ol.coordinates | number): ol.coordinates;
    /** Show point at a time on the profil
     * @param { Date|number } time a Date or a DateTime (in s) to show the profile on, if none it will hide the point
     * @param { booelan } delta true if time is a delta from the start, default false
     * @return { ol.coordinates } current point
     */
    showAtTime(time: Date | number, delta: booelan): ol.coordinates;
    /** Get the point at a given time on the profil
     * @param { number } time time at which to show the point
     * @return { ol.coordinates } current point
     */
    pointAtTime(time: number): ol.coordinates;
    /** Mouse move over canvas
     */
    onMove(e: any): void;
    _dragging: boolean | {
        event: {
            type: string;
            index: number;
            coord: any;
            time: any;
            distance: any;
        };
        pageX: any;
        pageY: any;
    };
    /** Show panel
    * @api stable
    */
    show(): void;
    /** Hide panel
    * @api stable
    */
    hide(): void;
    /** Toggle panel
    * @api stable
    */
    toggle(): void;
    /** Is panel visible
    */
    isShown(): boolean;
    /** Get selection
     * @param {number} starting point
     * @param {number} ending point
     * @return {Array<ol.coordinate>}
     */
    getSelection(start: any, end: any): Array<ol.coordinate>;
    /** Draw the graph
     * @private
     */
    private _drawGraph;
    /**
     * Set the geometry to draw the profil.
     * @param {ol.Feature|ol.geom.Geometry} f the feature.
     * @param {Object=} options
     *  @param {ol.ProjectionLike} [options.projection] feature projection, default projection of the map
     *  @param {string} [options.zunit='m'] 'm' or 'km', default m
     *  @param {string} [options.unit='km'] 'm' or 'km', default km
     *  @param {Number|undefined} [options.zmin=0] default 0
     *  @param {Number|undefined} options.zmax default max Z of the feature
     *  @param {integer|undefined} [options.zDigits=0] number of digits for z graduation, default 0
     *  @param {integer|undefined} [options.zMaxChars] maximum number of chars to be used for z graduation before switching to scientific notation
     *  @param {Number|undefined} [options.graduation=100] z graduation default 100
     *  @param {integer|undefined} [options.amplitude] amplitude of the altitude, default zmax-zmin
     * @api stable
     */
    setGeometry(g: any, options?: any | undefined): void;
    _geometry: any[];
    _z: number[];
    /** Refresh the profil
     */
    refresh(): void;
    dy_: number;
    scale_: number[];
    /** Get profil image
    * @param {string|undefined} type image format or 'canvas' to get the canvas image, default image/png.
    * @param {Number|undefined} encoderOptions between 0 and 1 indicating image quality image/jpeg or image/webp, default 0.92.
    * @return {string} requested data uri
    * @api stable
    */
    getImage(type: string | undefined, encoderOptions: number | undefined): string;
}
