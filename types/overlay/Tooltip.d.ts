import { Map as _ol_Map_ } from 'ol';
import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import Event from 'ol/events/Event';
import OverlayPositioning from 'ol/OverlayPositioning';
import { Popup } from './Popup';
/** A tooltip element to be displayed over the map and attached on the cursor position.
 * @constructor
 * @extends {Overlay.Popup}
 * @param {} options Extend Popup options
 *	@param {String} options.popupClass the a export class of the overlay to style the popup.
 *  @param {number} options.maximumFractionDigits maximum digits to display on measure, default 2
 *  @param {function} options.formatLength a function that takes a number and returns the formated value, default length in meter
 *  @param {function} options.formatArea a function that takes a number and returns the formated value, default length in square-meter
 *  @param {function} options.getHTML a function that takes a feature and the info string and return a formated info to display in the tooltip, default display feature measure & info
 *	@param {Number|Array<number>} options.offsetBox an offset box
 *	@param {OverlayPositioning | string | undefined} options.positionning
 *		the 'auto' positioning var the popup choose its positioning to stay on the map.
 * @api stable
 */
export class Tooltip extends Popup {
    constructor(options: {
        popupClass: string;
        maximumFractionDigits: number;
        formatLength: (...params: any[]) => any;
        formatArea: (...params: any[]) => any;
        getHTML: (...params: any[]) => any;
        offsetBox: number | number[];
        positionning: OverlayPositioning | string | undefined;
    });
    /**
     * Set the map instance the control is associated with
     * and add its controls associated to this map.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    /** Get the information to show in the tooltip
     * The area/length will be added if a feature is attached.
     * @param {Feature|undefined} feature the feature
     * @param {string} info the info string
     * @api
     */
    getHTML(feature: Feature | undefined, info: string): void;
    /** Set the Tooltip info
     * If information is not null it will be set with a delay,
     * thus watever the information is inserted, the significant information will be set.
     * ie. ttip.setInformation('ok'); ttip.setInformation(null); will set 'ok'
     * ttip.set('info','ok'); ttip.set('info', null); will set null
     * @param {string} what The information to display in the tooltip, default remove information
     */
    setInfo(what: string): void;
    /** Remove the current featue attached to the tip
     * Similar to setFeature() with no argument
     */
    removeFeature(): void;
    /** Format area to display in the popup.
     * Can be overwritten to display measure in a different unit (default: square-metter).
     * @param {number} area area in m2
     * @return {string} the formated area
     * @api
     */
    formatArea(area: number): string;
    /** Format area to display in the popup
     * Can be overwritten to display measure in different unit (default: meter).
     * @param {number} length length in m
     * @return {string} the formated length
     * @api
     */
    formatLength(length: number): string;
    /** Set a feature associated with the tooltips, measure info on the feature will be added in the tooltip
     * @param {Feature|Event} feature an Feature or an event (object) with a feature property
     */
    setFeature(feature: Feature | Event): void;
    /**
     * Set a close box to the popup.
     * @param {bool} b
     * @api stable
     */
    setClosebox(b: boolean): void;
    /**
     * Set the CSS export class of the popup.
     * @param {string} c export class name.
     * @api stable
     */
    setPopupClass(c: string): void;
    /**
     * Add a CSS export class to the popup.
     * @param {string} c export class name.
     * @api stable
     */
    addPopupClass(c: string): void;
    /**
     * Remove a CSS export class to the popup.
     * @param {string} c export class name.
     * @api stable
     */
    removePopupClass(c: string): void;
    /**
     * Set positionning of the popup
     * @param {OverlayPositioning | string | undefined} pos an OverlayPositioning
     * 		or 'auto' to var the popup choose the best position
     * @api stable
     */
    setPositioning(pos: OverlayPositioning | string | undefined): void;
    /** Check if popup is visible
    * @return {boolean}
     */
    getVisible(): boolean;
    /**
     * Set the position and the content of the popup.
     * @param {Coordinate|string} coordinate the coordinate of the popup or the HTML content.
     * @param {string|undefined} html the HTML content (undefined = previous content).
     * @example
    var popup = new Overlay.Popup();
    // Show popup
    popup.show([166000, 5992000], "Hello world!");
    // Move popup at coord with the same info
    popup.show([167000, 5990000]);
    // set new info
    popup.show("New informations");
    * @api stable
     */
    show(coordinate: Coordinate | undefined, features: Feature | Feature[]): void;
    /**
     * Hide the popup
     * @api stable
     */
    hide(): void;
}
