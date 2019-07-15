import { Map as _ol_Map_, Overlay } from 'ol';
import { Options as OverlayOptions } from 'ol/Overlay';
/**
 * @classdesc
 *	The Magnify overlay add a "magnifying glass" effect to an OL3 map that displays
 *	a portion of the map in a different zoom (and actually display different content).
 *
 * @constructor
 * @extends {Overlay}
 * @param {olx.OverlayOptions} options Overlay options
 * @api stable
 */
export class Magnify extends Overlay {
    constructor(options?: OverlayOptions);
    /**
     * Set the map instance the overlay is associated with.
     * @param {Map} map The map instance.
     */
    setMap(map: _ol_Map_): void;
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
    setActive(active: boolean): void;
}
