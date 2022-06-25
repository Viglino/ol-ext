export default ol_interaction_TouchCursor;
/** Handle a touch cursor to defer event position on overlay position
 * It can be used as abstract base class used for creating subclasses.
 * The TouchCursor interaction modifies map browser event coordinate and pixel properties to force pointer on the graphic cursor on the screen to any interaction that them.
 * @constructor
 * @extends {ol_interaction_DragOverlay}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {string} options.className cursor class name
 *  @param {ol.coordinate} options.coordinate position of the cursor
 *  @param {Array<*>} options.buttons an array of buttons
 *  @param {number} options.maxButtons maximum number of buttons (default 5)
 */
declare class ol_interaction_TouchCursor {
    constructor(options: any);
    _listeners: {};
    ctouch: ol_interaction_Interaction;
    overlay: ol_Overlay_Fixed;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {_ol_Map_} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /**
     * Activate or deactivate the interaction.
     * @param {boolean} active Active.
     * @param {ol.coordinate|null} position position of the cursor (when activating), default viewport center.
     * @observable
     * @api
     */
    setActive(b: any, position: ol.coordinate | null): void;
    _activate: number;
    /** Set the position of the target
     * @param {ol.coordinate} coord
     */
    setPosition(coord: ol.coordinate): void;
    _pixel: any;
    /** Offset the target position
     * @param {ol.coordinate} coord
     */
    offsetPosition(coord: ol.coordinate): void;
    /** Get the position of the target
     * @return {ol.coordinate}
     */
    getPosition(): ol.coordinate;
    /** Get pixel position
     * @return {ol.pixel}
     */
    getPixel(): ol.pixel;
    /** Get cursor overlay
     * @return {ol.Overlay}
     */
    getOverlay(): ol.Overlay;
    /** Get cursor overlay element
     * @return {Element}
     */
    getOverlayElement(): Element;
    /** Get cursor button element
     * @param {string|number} button the button className or the button index
     * @return {Element}
     */
    getButtonElement(button: string | number): Element;
    /** Remove a button element
     * @param {string|number|undefined} button the button className or the button index, if undefined remove all buttons, default remove all
     * @return {Element}
     */
    removeButton(button: string | number | undefined): Element;
    /** Add a button element
     * @param {*} button
     *  @param {string} options.className button class name
     *  @param {DOMElement|string} options.html button content
     *  @param {function} options.click onclick function
     *  @param {*} options.on an object with
     *  @param {boolean} options.before
     */
    addButton(b: any): void;
}
import ol_interaction_Interaction from "ol/interaction/Interaction";
import ol_Overlay_Fixed from "../overlay/Fixed";
