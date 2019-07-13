import { Map as _ol_Map_ } from 'ol';
import { Modify } from 'ol/interaction';
import Event from 'ol/events/Event';
/** Modify interaction with a popup to delet a point on touch device
 * @constructor
 * @fires showpopup
 * @fires hidepopup
 * @extends {interaction.Modify}
 * @param {olx.interaction.ModifyOptions} options
 *  @param {String|undefined} options.title title to display, default "remove point"
 *  @param {Boolean|undefined} options.usePopup use a popup, default true
 */
export class ModifyTouch extends Modify {
    constructor(options: {
        title: string | undefined;
        usePopup: boolean | undefined;
    });
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /** Activate the interaction and remove popup
     * @param {Boolean} b
     */
    setActive(b: boolean): void;
    /**
     * Remove the current point
     */
    removePoint(): boolean;
    /**
     * Show the delete button (menu)
     * @param {Event} e
     * @api stable
     */
    showDeleteBt(e: Event): void;
    /**
     * Change the popup content
     * @param {DOMElement} html
     */
    setPopupContent(html: Element): void;
    /**
     * Get the popup content
     * @return {DOMElement}
     */
    getPopupContent(): Element;
}
