import { Map as _ol_Map_ } from 'ol';
import { Style } from 'ol/style';
import { CanvasBase } from './CanvasBase';
/**
 * A title Control integrated in the canvas (for jpeg/png
 *
 * @constructor
 * @extends {contrCanvasBase}
 * @param {Object=} options extend the control options.
 *  @param {string} options.title the title, default 'Title'
 *  @param {Style} options.style style used to draw the title.
 */
export class CanvasTitle extends CanvasBase {
    constructor(options?: {
        title: string;
        style: Style;
    });
    /**
     * Change the control style
     * @param {Style} style
     */
    setStyle(style: Style): void;
    /**
     * Set the map title
     * @param {string} map title.
     * @api stable
     */
    setTitle(map: string): void;
    /**
     * Get the map title
     * @param {string} map title.
     * @api stable
     */
    getTitle(map: string): void;
    /**
     * Set control visibility
     * @param {bool} b
     * @api stable
     */
    setVisible(b: boolean): void;
    /**
     * Get control visibility
     * @return {bool}
     * @api stable
     */
    getVisible(): boolean;
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {_ol_Map_} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /** Get canvas overlay
     */
    getCanvas(): void;
    /** Get style
     * @api
     */
    getStyle(): void;
    /** Get stroke
     * @api
     */
    getStroke(): void;
    /** Get fill
     * @api
     */
    getFill(): void;
    /** Get stroke
     * @api
     */
    getTextStroke(): void;
    /** Get text fill
     * @api
     */
    getTextFill(): void;
    /** Get text font
     * @api
     */
    getTextFont(): void;
}
