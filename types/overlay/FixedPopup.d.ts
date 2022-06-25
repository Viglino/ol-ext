export default ol_Overlay_FixedPopup;
/**
 * A popup element to be displayed over the map and attached to a single map
 * location. The popup are customized using CSS.
 *
 * @constructor
 * @extends {ol_Overlay_Popup}
 * @fires show
 * @fires hide
 * @param {} options Extend Overlay options
 *	@param {String} options.popupClass the a class of the overlay to style the popup.
 *	@param {ol.style.Style} options.style a style to style the link on the map.
 *	@param {number} options.minScale min scale for the popup, default .5
 *	@param {number} options.maxScale max scale for the popup, default 2
 *	@param {bool} options.closeBox popup has a close box, default false.
 *	@param {function|undefined} options.onclose: callback function when popup is closed
 *	@param {function|undefined} options.onshow callback function when popup is shown
 *	@param {Number|Array<number>} options.offsetBox an offset box
 *	@param {ol.OverlayPositioning | string | undefined} options.positioning
 *		the 'auto' positioning var the popup choose its positioning to stay on the map.
 * @api stable
 */
declare class ol_Overlay_FixedPopup {
    constructor(options: any);
    _overlay: ol_layer_Image<ol_source_ImageCanvas>;
    _style: any;
    /**
     * Set the map instance the control is associated with
     * and add its controls associated to this map.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    _listener: any;
    /** Update pixel position
     * @return {boolean}
     * @private
     */
    private updatePixelPosition;
    _pixel: any;
    /** updateRenderedPosition
     * @private
     */
    private updateRenderedPosition;
    /** Set pixel position
     * @param {ol.pixel} pix
     * @param {string} position top/bottom/middle-left/right/center
     */
    setPixelPosition(pix: ol.pixel, position: string): void;
    /** Set pixel position
     * @returns {ol.pixel}
     */
    getPixelPosition(): ol.pixel;
    /**
     * Set the CSS class of the popup.
     * @param {string} c class name.
     * @api stable
     */
    setPopupClass(c: string): void;
    /** Set poppup rotation
     * @param {number} angle
     * @param {booelan} update update popup, default true
     * @api
     */
    setRotation(angle: number, update: booelan): void;
    /** Set poppup scale
     * @param {number} scale
     * @param {booelan} update update popup, default true
     * @api
     */
    setScale(scale: number, update: booelan): void;
    /** Set link style
     * @param {ol.style.Style} style
     */
    setLinkStyle(style: ol.style.Style): void;
    /** Get link style
     * @return {ol.style.Style} style
     */
    getLinkStyle(): ol.style.Style;
}
import ol_source_ImageCanvas from "ol/source/ImageCanvas";
import ol_layer_Image from "ol/layer/Image";
