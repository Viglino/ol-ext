export default ol_control_Timeline;
/** Timeline control
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires select
 * @fires scroll
 * @fires collapse
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {Array<ol.Feature>} options.features Features to show in the timeline
 *	@param {ol.SourceImageOptions.vector} options.source class of the control
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
declare class ol_control_Timeline {
    constructor(options: any);
    _scrollDiv: HTMLElement | Text;
    _buttons: HTMLElement | Text;
    _intervalDiv: HTMLElement | Text;
    _tline: any[];
    _scrollLeft: number;
    /** Default html to show in the line
     * @param {ol.Feature} feature
     * @return {DOMElement|string}
     * @private
     */
    private _getHTML;
    /** Default function to get the date of a feature, returns the date attribute
     * @param {ol.Feature} feature
     * @return {Data|string}
     * @private
     */
    private _getFeatureDate;
    /** Default function to get the end date of a feature, return undefined
     * @param {ol.Feature} feature
     * @return {Data|string}
     * @private
     */
    private _endFeatureDate;
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
    addButton(button: any): void;
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
     * @param {Array<ol.Features>|ol.source.Vector} features An array of features or a vector source
     * @param {number} zoom zoom to draw the line default 1
     */
    setFeatures(features: Array<ol.Features> | ol.source.Vector, zoom: number): void;
    _features: any[];
    _source: ol_source_Vector<any>;
    /**
     * Get features
     * @return {Array<ol.Feature>}
     */
    getFeatures(): Array<ol.Feature>;
    /**
     * Refresh the timeline with new data
     * @param {Number} zoom Zoom factor from 0.25 to 10, default 1
     */
    refresh(zoom: number, first: any): void;
    _minDate: any;
    _maxDate: any;
    _scale: number;
    _nbline: number;
    /** Get offset given a date
     * @param {Date} date
     * @return {number}
     * @private
     */
    private _getOffsetFromDate;
    /** Get date given an offset
     * @param {Date} date
     * @return {number}
     * @private
     */
    private _getDateFromOffset;
    /** Set the current position
     * @param {number} scrollLeft current position (undefined when scrolling)
     * @returns {number}
     * @private
     */
    private _setScrollLeft;
    /** Get the current position
     * @returns {number}
     * @private
     */
    private _getScrollLeft;
    /**
     * Draw dates on line
     * @private
     */
    private _drawTime;
    /** Center timeline on a date
     * @param {Date|String|ol.feature} feature a date or a feature with a date
     * @param {Object} options
     *  @param {boolean} options.anim animate scroll
     *  @param {string} options.position start, end or middle, default middle
     */
    setDate(feature: Date | string | ol.feature, options: {
        anim: boolean;
        position: string;
    }): void;
    _select: any;
    /** Get round date (sticked to mn, hour day or month)
     * @param {Date} d
     * @param {string} stick sticking option to stick date to: 'mn', 'hour', 'day', 'month', default no stick
     * @return {Date}
     */
    roundDate(d: Date, stick: string): Date;
    /** Get the date of the center
     * @param {string} position position to get 'start', 'end' or 'middle', default middle
     * @param {string} stick sticking option to stick date to: 'mn', 'hour', 'day', 'month', default no stick
     * @return {Date}
     */
    getDate(position: string, stick: string): Date;
    /** Round number to
     * @param {number} d
     * @param {number} r
     * @return {number}
     * @private
     */
    private _roundTo;
    /** Get the start date of the control
     * @return {Date}
     */
    getStartDate(): Date;
    /** Get the end date of the control
     * @return {Date}
     */
    getEndDate(): Date;
}
import ol_source_Vector from "ol/source/Vector";
