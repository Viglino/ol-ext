import { Overlay } from 'ol';
import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import OverlayPositioning from 'ol/OverlayPositioning';




/** Template attributes for popup
 * @typedef {Object} TemplateAttributes
 * @property {string} title
 * @property {function} format a function that takes an attribute and a feature and returns the formated attribute
 * @property {string} before string to instert before the attribute (prefix)
 * @property {string} after string to instert after the attribute (sudfix)
 * @property {boolean|function} visible boolean or a function (feature, value) that decides the visibility of a attribute entry
 */
export declare type TemplateAttributes = {
    title: string;
    format: (...params: any[]) => any;
    before: string;
    after: string;
    visible: boolean | ((...params: any[]) => any);
};

/** Template
 * @typedef {Object} Template
 * @property {string|function} title title of the popup, attribute name or a function that takes a feature and returns the title
 * @property {Object.<TemplateAttributes>} attributes a list of template attributes
 */
export declare type Template = {
    title: string | ((...params: any[]) => any);
    attributes: {
        [key: string]: any;
    };
};


/** Openlayers Overlay.
 * An element to be displayed over the map and attached to a single map location.
 * @namespace Overlay
 * @see {@link http://openlayers.org/en/latest/apidoc/module-ol_Overlay.html}
 */
/**
 * @classdesc
 * A popup element to be displayed over the map and attached to a single map
 * location. The popup are customized using CSS.
 *
 * @example
var popup = new Overlay.Popup();
map.addOverlay(popup);
popup.show(coordinate, "Hello!");
popup.hide();
*
* @constructor
* @extends {Overlay}
* @param {} options Extend Overlay options
*	@param {String} options.popupClass the a export class of the overlay to style the popup.
*	@param {bool} options.closeBox popup has a close box, default false.
*	@param {function|undefined} options.onclose: callback function when popup is closed
*	@param {function|undefined} options.onshow callback function when popup is shown
*	@param {Number|Array<number>} options.offsetBox an offset box
*	@param {OverlayPositioning | string | undefined} options.positionning
*		the 'auto' positioning var the popup choose its positioning to stay on the map.
* @api stable
 */
export class Popup extends Overlay {
    constructor(options: {
        popupClass: string;
        closeBox: boolean;
        onclose: ((...params: any[]) => any) | undefined;
        onshow: ((...params: any[]) => any) | undefined;
        offsetBox: number | number[];
        positionning: OverlayPositioning | string | undefined;
    });
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
