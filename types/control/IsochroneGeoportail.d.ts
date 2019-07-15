import { Map as _ol_Map_ } from 'ol';
import ol_control_Control from 'ol/control/Control';
import { Coordinate } from 'ol/coordinate';
/**
 * Geoportail isochrone Contr
 * @see https://geoservices.ign.fr/documentation/geoservices/isochrones.html
 * @constructor
 * @extends {contrControl}
 * @fires isochrone
 * @fires error
 * @param {Object=} options
 *	@param {string} options.className control class name
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {string | undefined} options.inputLabel label for the input, default none
 *	@param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
 *	@param {number | undefined} options.minLength minimum length to start searching, default 1
 *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *	@param {number | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index.
 *	@param {function} options.autocomplete a function that take a search string and callback function to send an array
 *
 *  @param {string} options.exclusions Exclusion list separate with a comma 'Toll,Tunnel,Bridge'
 */
export class IsochroneGeoportail extends ol_control_Control {
    constructor(options?: {
        className: string;
        target: Element | string | undefined;
        label: string | undefined;
        placeholder: string | undefined;
        inputLabel: string | undefined;
        noCollapse: string | undefined;
        typing: number | undefined;
        minLength: number | undefined;
        maxItems: number | undefined;
        maxHistory: number | undefined;
        getTitle: (...params: any[]) => any;
        autocomplete: (...params: any[]) => any;
        exclusions: string;
    });
    /**
     * Set the map instance the control is associated with
     * and add its controls associated to this map.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    /** Set the travel method
     * @param [string] method The method (time or distance)
     */
    setMethod(string?: any): void;
    /** Set mode
     * @param {string} mode The mode: 'car' or 'pedestrian', default 'car'
     */
    setMode(mode: string): void;
    /** Set direction
     * @param {string} direction The direction: 'direct' or 'reverse', default direct
     */
    setDirection(direction: string): void;
    /** Calculate an isochrone
     * @param {Coordinate} coord
     * @param {number|string} option A number as time (in second) or distance (in meter), depend on method propertie
     * or a string with a unit (s, mn, h for time or km, m)
     */
    search(coord: Coordinate, option: number | string): void;
}
