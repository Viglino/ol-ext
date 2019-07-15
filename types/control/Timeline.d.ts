import { Map as _ol_Map_ } from 'ol';
import ol_control_Control from 'ol/control/Control';
import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
/** Timeline control
 *
 * @constructor
 * @extends {contrControl}
 * @fires select
 * @fires scroll
 * @fires collapse
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {Array<Feature>} options.features Features to show in the timeline
 *	@param {SourceImageOptions.vector} options.source class of the control
 *	@param {Number} options.interval time interval length in ms or a text with a format d, h, mn, s (31 days = '31d'), default none
 *	@param {String} options.maxWidth width of the time line in px, default 2000px
 *	@param {String} options.minDate minimum date
 *	@param {String} options.maxDate maximum date
 *	@param {Number} options.minZoom Minimum zoom for the line, default .2
 *	@param {Number} options.maxZoom Maximum zoom for the line, default 4
 *	@param {boolean} options.zoomButton Are zoom buttons avaliable, default false
 *	@param {function} options.getHTML a function that takes a feature and returns the html to display
 *	@param {function} options.getFeatureDate a function that takes a feature and returns its date, default the date propertie
 *	@param {function} options.endFeatureDate a function that takes a feature and returns its end date, default no end date
 *	@param {String} options.graduation day|month to show month or day graduation, default show only years
 *	@param {String} options.scrollTimeout Time in milliseconds to get a scroll event, default 15ms
 */
export class Timeline extends ol_control_Control {
    constructor(options?: {
        className: string;
        features: Feature[];
        source: VectorSource;
        interval: number;
        maxWidth: string;
        minDate: string;
        maxDate: string;
        minZoom: number;
        maxZoom: number;
        zoomButton: boolean;
        getHTML: (...params: any[]) => any;
        getFeatureDate: (...params: any[]) => any;
        endFeatureDate: (...params: any[]) => any;
        graduation: string;
        scrollTimeout: string;
    });
    /**
     * Set the map instance the control is associated with
     * and add interaction attached to it to this map.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    /** Add a button on the timeline
     * @param {*} button
     *  @param {string} button.className
     *  @param {title} button.className
     *  @param {Element|string} button.html Content of the element
     *  @param {function} button.click a function called when the button is clicked
     */
    addButton(button: {
        title: string;
        html: Element | string;
        click: (...params: any[]) => any;
    }): void;
    /** Set an interval
     * @param {number|string} length the interval length in ms or a farmatted text ie. end with y, 1d, h, mn, s (31 days = '31d'), default none
     */
    setInterval(length: number | string): void;
    /** Is the line collapsed
     * @return {boolean}
     */
    isCollapsed(): boolean;
    /** Collapse the line
     * @param {boolean} b
     */
    collapse(b: boolean): void;
    /** Collapse the line
     */
    toggle(): void;
    /** Set the features to display in the timeline
     * @param {Array<Features>|VectorSource} features An array of features or a vector source
     * @param {number} zoom zoom to draw the line default 1
     */
    setFeatures(features: Feature[] | VectorSource, zoom: number): void;
    /**
     * Get features
     * @return {Array<Feature>}
     */
    getFeatures(): Feature[];
    /**
     * Refresh the timeline with new data
     * @param {Number} zoom Zoom factor from 0.25 to 10, default 1
     */
    refresh(zoom: number): void;
    /** Center timeline on a date
     * @param {Date|String|feature} feature a date or a feature with a date
     * @param {Object} options
     *  @param {boolean} options.anim animate scroll
     *  @param {string} options.position start, end or middle, default middle
     */
    setDate(feature: Date | string | Feature, options: {
        anim: boolean;
        position: string;
    }): void;
    /** Get the date of the center
     * @param {string} position start, end or middle, default middle
     * @return {Date}
     */
    getDate(position: string): Date;
}
