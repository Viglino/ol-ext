import { Map as _ol_Map_ } from 'ol';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { Layer } from 'ol/layer';
import { Style } from 'ol/style';
import { Pointer } from 'ol/interaction';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Condition as EventsConditionType } from 'ol/events/condition';
/** Interaction rotate
 * @constructor
 * @extends {interaction.Pointer}
 * @fires select | rotatestart | rotating | rotateend | translatestart | translating | translateend | scalestart | scaling | scaleend
 * @param {any} options
 *  @param {function} options.filter A function that takes a Feature and a Layer and returns true if the feature may be transformed or false otherwise.
 *  @param {Array<Layer>} options.layers array of layers to transform,
 *  @param {Collection<Feature>} options.features collection of feature to transform,
 *	@param {EventsConditionType|undefined} options.addCondition A function that takes an MapBrowserEvent and returns a boolean to indicate whether that event should be handled. default: events.condition.never.
 *	@param {number | undefined} options.hitTolerance Tolerance to select feature in pixel, default 0
 *	@param {bool} options.translateFeature Translate when click on feature
 *	@param {bool} options.translate Can translate the feature
 *	@param {bool} options.stretch can stretch the feature
 *	@param {bool} options.scale can scale the feature
 *	@param {bool} options.rotate can rotate the feature
 *	@param {bool} options.noFlip prevent the feature geometry to flip, default false
 *	@param {bool} options.selection the intraction handle selection/deselection, if not use the select prototype to add features to transform, default true
 *	@param {events.ConditionType | undefined} options.keepAspectRatio A function that takes an MapBrowserEvent and returns a boolean to keep aspect ratio, default events.condition.shiftKeyOnly.
 *	@param {events.ConditionType | undefined} options.modifyCenter A function that takes an MapBrowserEvent and returns a boolean to apply scale & strech from the center, default events.condition.metaKey or events.condition.ctrlKey.
 *	@param {} options.style list of style for handles
 *
 */
export class Transform extends Pointer {
    constructor(options: {
        filter: (f: Feature, l: Layer) => boolean;
        layers: Layer[];
        features: Collection<Feature>;
        addCondition: EventsConditionType | undefined;
        hitTolerance: number | undefined;
        translateFeature: boolean;
        translate: boolean;
        stretch: boolean;
        scale: boolean;
        rotate: boolean;
        noFlip: boolean;
        selection: boolean;
        keepAspectRatio: EventsConditionType | undefined;
        modifyCenter: EventsConditionType | undefined;
        style: any;
    });
    /** Cursors for transform
     */
    Cursors: any;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /**
     * Activate/deactivate interaction
     * @param {bool}
     * @api stable
     */
    setActive(b: boolean): void;
    /** Set efault sketch style
     */
    setDefaultStyle(): void;
    /** Style for handles
     */
    style: any;
    /**
     * Set sketch style.
     * @param {style} style Style name: 'default','translate','rotate','rotate0','scale','scale1','scale2','scale3','scalev','scaleh1','scalev2','scaleh3'
     * @param {Style|Array<Style>} olstyle
     * @api stable
     */
    setStyle(style: Style, olstyle: Style | Style[]): void;
    /** Draw transform sketch
    * @param {boolean} draw only the center
     */
    drawSketch_(draw: boolean): void;
    /** Select a feature to transform
    * @param {Feature} feature the feature to transform
    * @param {boolean} add true to add the feature to the selection, default false
     */
    select(feature: Feature, add: boolean): void;
    /**
     * @param {MapBrowserEvent} evt Map browser event.
     * @return {boolean} `true` to start the drag sequence.
     */
    handleDownEvent_(evt: MapBrowserEvent): boolean;
    /**
     * Get features to transform
     * @return {Collection<Feature>}
     */
    getFeatures(): Collection<Feature>;
    /**
     * Get the rotation center
     * @return {Coordinates|undefined}
     */
    getCenter(): Coordinates | undefined;
    /**
     * Set the rotation center
     * @param {Coordinates|undefined} c the center point, default center on the objet
     */
    setCenter(c: Coordinates | undefined): void;
    /**
     * @param {MapBrowserEvent} evt Map browser event.
     */
    handleDragEvent_(evt: MapBrowserEvent): void;
    /**
     * @param {MapBrowserEvent} evt Event.
     */
    handleMoveEvent_(evt: MapBrowserEvent): void;
    /**
     * @param {MapBrowserEvent} evt Map browser event.
     * @return {boolean} `false` to stop the drag sequence.
     */
    handleUpEvent_(evt: MapBrowserEvent): boolean;
}
