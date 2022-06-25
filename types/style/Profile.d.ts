export default ol_style_Profile;
/** Profile style
 * Draw a profile on the map
 * @extends {ol_style_Style}
 * @constructor
 * @param {Object} options
 *  @param {ol.style.Stroke} options.stroke
 *  @param {ol.style.Fill} options.fill
 *  @param {number} options.scale z scale
 *  @param {number} options.zIndex
 *  @param {ol.geom.Geometry} options.geometry
 */
declare class ol_style_Profile {
    constructor(options: any);
    /** Set style stroke
     * @param {ol.style.Stroke}
     */
    setStroke(stroke: any): void;
    _stroke: any;
    /** Get style stroke
     * @return {ol.style.Stroke}
     */
    getStroke(): ol.style.Stroke;
    /** Set style stroke
     * @param {ol.style.Fill}
     */
    setFill(fill: any): void;
    _fill: any;
    /** Get style stroke
     * @return {ol.style.Fill}
     */
    getFill(): ol.style.Fill;
    /** Set z scale
     * @param {number}
     */
    setScale(sc: any): void;
    _scale: any;
    /** Get z scale
     * @return {number}
     */
    getScale(): number;
    /** Renderer function
     * @param {Array<ol.coordinate>} geom The pixel coordinates of the geometry in GeoJSON notation
     * @param {ol.render.State} e The olx.render.State of the layer renderer
     */
    _render(geom: Array<ol.coordinate>, e: ol.render.State): void;
    /** @private */
    private _renderLine;
}
