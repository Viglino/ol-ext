import { Map as _ol_Map_ } from 'ol';
import { CoordinateFormat } from 'ol/coordinate';
import { ProjectionLike } from 'ol/proj';
import { Style } from 'ol/style';
import { CanvasBase } from './CanvasBase';
/**
 * A title Control integrated in the canvas (for jpeg/png
 *
 * @constructor
 * @extends {contrCanvasBase}
 * @param {Object=} options extend the control options.
 *  @param {string} options.className CSS class name
 *  @param {Style} options.style style used to draw in the canvas
 *  @param {ProjectionLike} options.projection	Projection. Default is the view projection.
 *  @param {Coordinate.CoordinateFormat} options.coordinateFormat A function that takes a Coordinate and transforms it into a string.
 *  @param {boolean} options.canvas true to draw in the canvas
 */
export class CenterPosition extends CanvasBase {
    constructor(options?: {
        className: string;
        style: Style;
        projection: ProjectionLike;
        coordinateFormat: CoordinateFormat;
        canvas: boolean;
    });
    /**
     * Change the control style
     * @param {Style} style
     */
    setStyle(style: Style): void;
    /**
     * Draw on canvas
     * @param {boolean} b draw the attribution on canvas.
     */
    setCanvas(b: boolean): void;
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
