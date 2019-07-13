import { Map as _ol_Map_ } from 'ol';
import ol_control_Control from 'ol/control/Control';
import { Layer } from 'ol/layer';
/**
 * Permalink Contr
 *
 *	Add a `permalink`property to layers to be handled by the control (and added in the url).
 *  The layer's permalink property is used to name the layer in the url.
 *	The control must be added after all layer are inserted in the map to take them into acount.
 *
 * @constructor
 * @extends {contrControl}
 * @param {Object=} options
 *	@param {bool} options.urlReplace replace url or not, default true
 *	@param {number} options.fixed number of digit in coords, default 6
 *	@param {bool} options.anchor use "#" instead of "?" in href
 *	@param {bool} options.hidden hide the button on the map, default false
 *	@param {function} options.onclick a function called when control is clicked
 */
export class Permalink extends ol_control_Control {
    constructor(options?: {
        urlReplace: boolean;
        fixed: number;
        anchor: boolean;
        hidden: boolean;
        onclick: (...params: any[]) => any;
    });
    /**
     * Set the map instance the control associated with.
     * @param {Map} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    /** Get layer given a permalink name (permalink propertie in the layer)
    *	@param {string} the permalink to search for
    *	@param {Array<layer>|undefined} an array of layer to search in
    *	@return {layer|false}
     */
    getLayerByLink(the: string, an: Layer[] | undefined): Layer | false;
    /** Set map position according to the current link
     */
    setPosition(): void;
    /**
     * Get the parameters added to the url. The object can be changed to add new values.
     * @return {Object} a key value object added to the url as &key=value
     * @api stable
     */
    getUrlParams(): any;
    /**
     * Set a parameter to the url.
     * @param {string} key the key parameter
     * @param {string|undefined} value the parameter's value, if undefined or empty string remove the parameter
     * @api stable
     */
    setUrlParam(key: string, value: string | undefined): void;
    /**
     * Get a parameter url.
     * @param {string} key the key parameter
     * @return {string} the parameter's value or empty string if not set
     * @api stable
     */
    getUrlParam(key: string): string;
    /**
     * Has a parameter url.
     * @param {string} key the key parameter
     * @return {boolean}
     * @api stable
     */
    hasUrlParam(key: string): boolean;
    /**
     * Get the permalink
     * @return {permalink}
     */
    getLink(): string;
    /**
     * Enable / disable url replacement (replaceSate)
     *	@param {bool}
     */
    setUrlReplace(replace: boolean): void;
}
