export default ol_control_CanvasTitle;
/**
 * A title Control integrated in the canvas (for jpeg/png export purposes).
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object=} options extend the ol.control options.
 *  @param {string} options.title the title, default 'Title'
 *  @param {ol_style_Style} options.style style used to draw the title.
 */
declare class ol_control_CanvasTitle {
    constructor(options: any);
    /**
     * Change the control style
     * @param {ol_style_Style} style
     */
    setStyle(style: ol_style_Style): void;
    /**
     * Set the map title
     * @param {string} map title.
     * @api stable
     */
    setTitle(title: any): void;
    /**
     * Get the map title
     * @param {string} map title.
     * @api stable
     */
    getTitle(): any;
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
    /** Draw title in the final canvas
     * @private
    */
    private _draw;
}
