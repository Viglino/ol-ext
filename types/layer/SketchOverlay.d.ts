export default ol_layer_SketchOverlay;
/** A sketch layer used as overlay to handle drawing sketch (helper for drawing tools)
 * @constructor
 * @extends {ol/layer/Vector}
 * @fires drawstart
 * @fires drawend
 * @fires drawabort
 * @param {*} options
 *  @param {string} options.type Geometry type, default LineString
 *  @param {ol_style_Style|Array<ol_style_Style>} options.style Drawing style
 *  @param {ol_style_Style|Array<ol_style_Style>} options.sketchStyle Sketch style
 */
declare class ol_layer_SketchOverlay {
    constructor(options: any);
    _geom: any[];
    /** Set geometry type
     * @param {string} type Geometry type
     * @return {string} the current type
     */
    setGeometryType(type: string): string;
    _type: any;
    /** Get geometry type
     * @return {string} Geometry type
     */
    getGeometryType(): string;
    /** Add a new Point to the sketch
     * @param {ol.coordinate} coord
     * @return {boolean} true if point has been added, false if same coord
     */
    addPoint(coord: ol.coordinate): boolean;
    _lastCoord: any;
    _position: any;
    /** Remove the last Point from the sketch
     */
    removeLastPoint(): void;
    /** Strat a new drawing
     * @param {*} options
     *  @param {string} type Geometry type, default the current type
     *  @param {Array<ol.coordinate>} coordinates a list of coordinates to extend
     *  @param {ol.Feature} feature a feature to extend (LineString or Polygon only)
     *  @param {boolean} atstart extent coordinates or feature at start, default false (extend at end)
     */
    startDrawing(options: any): void;
    _drawing: boolean;
    /** Finish drawing
     * @return {ol.Feature} the drawed feature
     */
    finishDrawing(valid: any): ol.Feature;
    /** Abort drawing
     */
    abortDrawing(): void;
    /** Set current position
     * @param {ol.coordinate} coord
     */
    setPosition(coord: ol.coordinate): void;
    /** Get current position
     * @return {ol.coordinate}
     */
    getPosition(): ol.coordinate;
    /** Draw/refresh link
     */
    drawLink(): void;
    /** Get current feature
     */
    getFeature(): any;
    /** Draw/refresh sketch
     */
    drawSketch(): void;
}
