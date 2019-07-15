import { Map as _ol_Map_ } from 'ol';
import Collection from 'ol/Collection';
import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import { Style } from 'ol/style';
import GeometryType from 'ol/geom/GeometryType';
import { Pointer } from 'ol/interaction';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Condition as EventsConditionType } from 'ol/events/condition';
/** Interaction for modifying feature geometries. Similar to the core ol/interaction/Modify.
 * The interaction is more suitable to use to handle feature modification: only features concerned
 * by the modification are passed to the events (instead of all feature with ol/interaction/Modify)
 * - the modifystart event is fired before the feature is modified (no points still inserted)
 * - the modifyend event is fired after the modification
 * - it fires a modifying event
 * @constructor
 * @extends {interaction.Pointer}
 * @fires modifystart
 * @fires modifying
 * @fires modifyend
 * @param {*} options
 *	@param {VectorSource|Array{VectorSource}} options.source a list of source to modify (configured with useSpatialIndex set to true)
 *  @param {Collection.<Feature>} options.features collection of feature to modify
 *  @param {number} options.pixelTolerance Pixel tolerance for considering the pointer close enough to a segment or vertex for editing. Default is 10.
 *  @param {function|undefined} options.filter a filter that takes a feature and return true if it can be modified, default always true.
 *  @param {Style | Array<Style> | undefined} options.style Style for the sketch features.
 *  @param {EventsConditionType | undefined} options.condition A function that takes an MapBrowserEvent and returns a boolean to indicate whether that event will be considered to add or move a vertex to the sketch. Default is events.condition.primaryAction.
 *  @param {EventsConditionType | undefined} options.deleteCondition A function that takes an MapBrowserEvent and returns a boolean to indicate whether that event should be handled. By default, events.condition.singleClick with events.condition.altKeyOnly results in a vertex deletion.
 *  @param {EventsConditionType | undefined} options.insertVertexCondition A function that takes an MapBrowserEvent and returns a boolean to indicate whether a new vertex can be added to the sketch features. Default is events.condition.always
 */
export class ModifyFeature extends Pointer {
    constructor(options: {
        features: Collection<Feature>;
        pixelTolerance: number;
        filter: ((...params: any[]) => any) | undefined;
        style: Style | Style[] | undefined;
        condition: EventsConditionType | undefined;
        deleteCondition: EventsConditionType | undefined;
        insertVertexCondition: EventsConditionType | undefined;
    });
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /**
     * Activate or deactivate the interaction + remove the sketch.
     * @param {boolean} active.
     * @api stable
     */
    setActive(): void;
    /** Get nearest coordinate in a list
    * @param {Coordinate} pt the point to find nearest
    * @param {geom} coords list of coordinates
    * @return {*} the nearest point with a coord (projected point), dist (distance to the geom), ring (if Polygon)
     */
    getNearestCoord(pt: Coordinate, coords: GeometryType): any;
    /** Get arcs concerned by a modification
     * @param {geom} geom the geometry concerned
     * @param {Coordinate} coord pointed coordinates
     */
    getArcs(geom: GeometryType, coord: Coordinate): void;
    /**
     * @param {MapBrowserEvent} evt Map browser event.
     * @return {boolean} `true` to start the drag sequence.
     */
    handleDownEvent(evt: MapBrowserEvent): boolean;
    /** Get modified features
     * @return {Array<Feature>} list of modified features
     */
    getModifiedFeatures(): Feature[];
    /** Removes the vertex currently being pointed.
     */
    removePoint(): void;
}
