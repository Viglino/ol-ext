export default ol_Overlay_Popup;
/**
 * @classdesc
 * A popup element to be displayed over the map and attached to a single map
 * location. The popup are customized using CSS.
 *
 * @example
var popup = new ol_Overlay_Popup();
map.addOverlay(popup);
popup.show(coordinate, "Hello!");
popup.hide();
*
* @constructor
* @extends {ol_Overlay}
* @fires show
* @fires hide
* @param {} options Extend Overlay options
*	 @param {String} [options.popupClass] the a class of the overlay to style the popup.
*	 @param {boolean} [options.anim Animate=false] the popup the popup, default false.
*	 @param {bool} [options.closeBox=false] popup has a close box, default false.
*	 @param {function|undefined} [options.onclose] callback function when popup is closed
*	 @param {function|undefined} [options.onshow] callback function when popup is shown
*	 @param {Number|Array<number>} [options.offsetBox] an offset box
*	 @param {ol.OverlayPositioning | string | undefined} options.positioning
*		the 'auto' positioning var the popup choose its positioning to stay on the map.
*	 @param {boolean} [options.minibar=false] add a mini vertical bar
* @api stable
*/
declare class ol_Overlay_Popup {
    constructor(options: any);
    offsetBox: any;
    closeBox: any;
    onclose: any;
    onshow: any;
    content: HTMLElement | Text;
    _elt: HTMLDivElement;
    /**
     * Get CSS class of the popup according to its positioning.
     * @private
     */
    private getClassPositioning;
    /**
     * Set a close box to the popup.
     * @param {bool} b
     * @api stable
     */
    setClosebox(b: bool): void;
    /**
     * Set the CSS class of the popup.
     * @param {string} c class name.
     * @api stable
     */
    setPopupClass(c: string): void;
    /**
     * Add a CSS class to the popup.
     * @param {string} c class name.
     * @api stable
     */
    addPopupClass(c: string): void;
    /**
     * Remove a CSS class to the popup.
     * @param {string} c class name.
     * @api stable
     */
    removePopupClass(c: string): void;
    /**
     * Set positionning of the popup
     * @param {ol.OverlayPositioning | string | undefined} pos an ol.OverlayPositioning
     * 		or 'auto' to var the popup choose the best position
     * @api stable
     */
    setPositioning(pos: ol.OverlayPositioning | string | undefined): void;
    autoPositioning: any;
    /** @private
     * @param {ol.OverlayPositioning | string | undefined} pos
     */
    private setPositioning_;
    /** Check if popup is visible
    * @return {boolean}
    */
    getVisible(): boolean;
    /**
     * Set the position and the content of the popup.
     * @param {ol.Coordinate|string} coordinate the coordinate of the popup or the HTML content.
     * @param {string|undefined} html the HTML content (undefined = previous content).
     * @example
    var popup = new ol_Overlay_Popup();
    // Show popup
    popup.show([166000, 5992000], "Hello world!");
    // Move popup at coord with the same info
    popup.show([167000, 5990000]);
    // set new info
    popup.show("New informations");
    * @api stable
    */
    show(coordinate: ol.Coordinate | string, html: string | undefined): void;
    prevHTML: any;
    _tout: number;
    /**
     * Hide the popup
     * @api stable
     */
    hide(): void;
}
