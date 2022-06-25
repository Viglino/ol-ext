export default ol_Overlay_Magnify;
/**
 * @classdesc
 *	The Magnify overlay add a "magnifying glass" effect to an OL3 map that displays
*	a portion of the map in a different zoom (and actually display different content).
*
* @constructor
* @extends {ol_Overlay}
* @param {olx.OverlayOptions} options Overlay options
* @api stable
*/
declare class ol_Overlay_Magnify {
    constructor(options: any);
    _elt: HTMLDivElement;
    mgmap_: ol_Map;
    mgview_: ol_View;
    external_: boolean;
    /**
     * Set the map instance the overlay is associated with.
     * @param {ol.Map} map The map instance.
     */
    setMap(map: ol.Map): void;
    _listener: any;
    /** Get the magnifier map
    *	@return {_ol_Map_}
    */
    getMagMap(): _ol_Map_;
    /** Magnify is active
    *	@return {boolean}
    */
    getActive(): boolean;
    /** Activate or deactivate
    *	@param {boolean} active
    */
    setActive(active: boolean): any;
    /** Mouse move
     * @private
     */
    private onMouseMove_;
    /** View has changed
     * @private
     */
    private setView_;
}
import ol_Map from "ol/Map";
import ol_View from "ol/View";
