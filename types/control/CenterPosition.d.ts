export default ol_control_CenterPosition;
/**
 * A Control to display map center coordinates on the canvas.
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object=} options extend the ol.control options.
 *  @param {string} options.className CSS class name
 *  @param {ol.style.Style} options.style style used to draw in the canvas
 *  @param {ol.proj.ProjectionLike} options.projection	Projection. Default is the view projection.
 *  @param {ol.coordinate.CoordinateFormat} options.coordinateFormat A function that takes a ol.Coordinate and transforms it into a string.
 *  @param {boolean} options.canvas true to draw in the canvas
 */
declare class ol_control_CenterPosition {
    constructor(options: any);
    _format: any;
    /**
     * Change the control style
     * @param {ol_style_Style} style
     */
    setStyle(style: ol_style_Style): void;
    /**
     * Draw on canvas
     * @param {boolean} b draw the attribution on canvas.
     */
    setCanvas(b: boolean): void;
    /**
     * Set control visibility
     * @param {bool} b
     * @api stable
     */
    setVisible(b: bool): void;
    /**
     * Get control visibility
     * @return {bool}
     * @api stable
     */
    getVisible(): bool;
    /** Draw position in the final canvas
     * @private
    */
    private _draw;
}
