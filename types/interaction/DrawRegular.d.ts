import { Map as _ol_Map_ } from 'ol';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { Point, Polygon } from 'ol/geom';
import { Layer } from 'ol/layer';
import { StyleLike } from 'ol/style/Style';
import { Interaction } from 'ol/interaction';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Condition as EventsConditionType } from 'ol/events/condition';
/** Interaction rotate
 * @constructor
 * @extends {Interaction}
 * @fires drawstart, drawing, drawend, drawcancel
 * @param {olx.interaction.TransformOptions} options
 *  @param {Array<Layer>} source Destination source for the drawn features
 *  @param {Collection<Feature>} features Destination collection for the drawn features
 *  @param {Style | Array.<Style> | StyleFunction | undefined} style style for the sketch
 *  @param {number} sides number of sides, default 0 = circle
 *  @param { events.ConditionType | undefined } squareCondition A function that takes an MapBrowserEvent and returns a boolean to draw square features.
 *  @param { events.ConditionType | undefined } centerCondition A function that takes an MapBrowserEvent and returns a boolean to draw centered features.
 *  @param { bool } canRotate Allow rotation when centered + square, default: true
 *  @param { number } clickTolerance click tolerance on touch devices, default: 6
 *  @param { number } maxCircleCoordinates Maximum number of point on a circle, default: 100
 */
export class DrawRegular extends Interaction {
    constructor(options: {
        source: Layer[];
        features: Collection<Feature>;
        style: StyleLike;
        sides: number;
        squareCondition: EventsConditionType | undefined;
        centerCondition: EventsConditionType | undefined;
        canRotate: boolean;
        clickTolerance: number;
        maxCircleCoordinates: number;
    });
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /**
     * Activate/deactivate the interaction
     * @param {boolean}
     * @api stable
     */
    setActive(b: boolean): void;
    /**
     * Reset the interaction
     * @api stable
     */
    reset(): void;
    /**
     * Set the number of sides.
     * @param {number} number of sides.
     * @api stable
     */
    setSides(number: number): void;
    /**
     * Allow rotation when centered + square
     * @param {bool}
     * @api stable
     */
    canRotate(b: boolean): void;
    /**
     * Get the number of sides.
     * @return {number} number of sides.
     * @api stable
     */
    getSides(): number;
    /** Default start angle array for each sides
     */
    startAngle: any;
    /** Get geom of the current drawing
    * @return {Polygon | Point}
     */
    getGeom_(): Polygon | Point;
    /** Draw sketch
    * @return {Feature} The feature being drawn.
     */
    drawSketch_(): Feature;
    /** Draw sketch (Point)
     */
    drawPoint_(): void;
    /**
     * @param {MapBrowserEvent} evt Map browser event.
     */
    handleEvent_(evt: MapBrowserEvent): void;
    /** Stop drawing.
     */
    finishDrawing(): void;
    /**
     * @param {MapBrowserEvent} evt Event.
     */
    handleMoveEvent_(evt: MapBrowserEvent): void;
    /** Start an new draw
     * @param {MapBrowserEvent} evt Map browser event.
     * @return {boolean} `false` to stop the drag sequence.
     */
    start_(evt: MapBrowserEvent): boolean;
    /** End drawing
     * @param {MapBrowserEvent} evt Map browser event.
     * @return {boolean} `false` to stop the drag sequence.
     */
    end_(evt: MapBrowserEvent): boolean;
}
