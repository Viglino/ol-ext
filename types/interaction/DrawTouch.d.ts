import { Map as _ol_Map_ } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Vector as VectorSource } from 'ol/source';
import { Style } from 'ol/style';
import GeometryType from 'ol/geom/GeometryType';
import { CenterTouch } from './CenterTouch';
/** Interaction DrawTouch :
 * @constructor
 * @extends {interaction.CenterTouch}
 * @param {olx.interaction.DrawOptions} options
 *	- source {VectorSource | undefined} Destination source for the drawn features.
 *	- type {GeometryType} Drawing type ('Point', 'LineString', 'Polygon') not ('MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle'). Required.
 *	- tap {boolean} enable on tap, default true
 *	Inherited params
 *  - targetStyle {Style|Array<Style>} a style to draw the target point, default cross style
 *  - composite {string} composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
export class DrawTouch extends CenterTouch {
    constructor(options: {
        source: VectorSource | undefined;
        type: GeometryType;
        tap: boolean;
        targetStyle: Style | Style[];
        composite: string;
    });
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /** Start drawing and add the sketch feature to the target layer.
    * The interaction.Draw.EventType.DRAWSTART event is dispatched before inserting the feature.
     */
    startDrawing(): void;
    /** Get geometry type
    * @return {GeometryType}
     */
    getGeometryType(): GeometryType;
    /** Start drawing and add the sketch feature to the target layer.
    * The interaction.Draw.EventType.DRAWEND event is dispatched before inserting the feature.
     */
    finishDrawing(): void;
    /** Add a new Point to the drawing
     */
    addPoint(): void;
    /** Remove last point of the feature currently being drawn.
     */
    removeLastPoint(): void;
    /**
     * Activate or deactivate the interaction.
     * @param {boolean} active Active.
     * @observable
     * @api
     */
    setActive(active: boolean): void;
    /** Get the position of the target
     * @return {Coordinate}
     */
    getPosition(): Coordinate;
}
