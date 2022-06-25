export default ol_interaction_Transform;
/** Interaction rotate
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @fires select | rotatestart | rotating | rotateend | translatestart | translating | translateend | scalestart | scaling | scaleend
 * @param {any} options
 *  @param {function} options.filter A function that takes a Feature and a Layer and returns true if the feature may be transformed or false otherwise.
 *  @param {Array<ol.Layer>} options.layers array of layers to transform,
 *  @param {ol.Collection<ol.Feature>} options.features collection of feature to transform,
 *	@param {ol.EventsConditionType|undefined} options.condition A function that takes an ol.MapBrowserEvent and a feature collection and returns a boolean to indicate whether that event should be handled. default: ol.events.condition.always.
 *	@param {ol.EventsConditionType|undefined} options.addCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event should be handled ie. the feature will be added to the transforms features. default: ol.events.condition.never.
 *	@param {number | undefined} options.hitTolerance Tolerance to select feature in pixel, default 0
 *	@param {bool} options.translateFeature Translate when click on feature
 *	@param {bool} options.translate Can translate the feature
 *  @param {bool} options.translateBBox Enable translate when the user drags inside the bounding box
 *	@param {bool} options.stretch can stretch the feature
 *	@param {bool} options.scale can scale the feature
 *	@param {bool} options.rotate can rotate the feature
 *	@param {bool} options.noFlip prevent the feature geometry to flip, default false
 *	@param {bool} options.selection the intraction handle selection/deselection, if not use the select prototype to add features to transform, default true
 *	@param {ol.events.ConditionType | undefined} options.keepAspectRatio A function that takes an ol.MapBrowserEvent and returns a boolean to keep aspect ratio, default ol.events.condition.shiftKeyOnly.
 *	@param {ol.events.ConditionType | undefined} options.modifyCenter A function that takes an ol.MapBrowserEvent and returns a boolean to apply scale & strech from the center, default ol.events.condition.metaKey or ol.events.condition.ctrlKey.
 *	@param {boolean} options.enableRotatedTransform Enable transform when map is rotated
 *	@param {boolean} [options.keepRectangle=false] keep rectangle when possible
 *	@param {*} options.style list of ol.style for handles
 *  @param {number|Array<number>|function} [options.pointRadius=0] radius for points or a function that takes a feature and returns the radius (or [radiusX, radiusY]). If not null show handles to transform the points
 */
declare class ol_interaction_Transform {
    constructor(options: any);
    selection_: ol_Collection<any>;
    handles_: ol_Collection<any>;
    overlayLayer_: ol_layer_Vector<ol_source_Vector<import("ol/geom/Geometry").default>>;
    features_: any;
    _filter: any;
    layers_: any;
    _handleEvent: any;
    addFn_: any;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    previousCursor_: any;
    isTouch: boolean;
    /**
     * Activate/deactivate interaction
     * @param {bool}
     * @api stable
     */
    setActive(b: any): void;
    /** Set default sketch style
     * @param {Object|undefined} options
     *  @param {ol_style_Stroke} stroke stroke style for selection rectangle
     *  @param {ol_style_Fill} fill fill style for selection rectangle
     *  @param {ol_style_Stroke} pointStroke stroke style for handles
     *  @param {ol_style_Fill} pointFill fill style for handles
     */
    setDefaultStyle(options: any | undefined): void;
    /** Style for handles */
    style: {
        default: ol_style_Style[];
        translate: ol_style_Style[];
        rotate: ol_style_Style[];
        rotate0: ol_style_Style[];
        scale: ol_style_Style[];
        scale1: ol_style_Style[];
        scale2: ol_style_Style[];
        scale3: ol_style_Style[];
        scalev: ol_style_Style[];
        scaleh1: ol_style_Style[];
        scalev2: ol_style_Style[];
        scaleh3: ol_style_Style[];
    };
    /**
     * Set sketch style.
     * @param {style} style Style name: 'default','translate','rotate','rotate0','scale','scale1','scale2','scale3','scalev','scaleh1','scalev2','scaleh3'
     * @param {ol.style.Style|Array<ol.style.Style>} olstyle
     * @api stable
     */
    setStyle(style: any, olstyle: ol.style.Style | Array<ol.style.Style>): void;
    /** Get Feature at pixel
     * @param {ol.Pixel}
     * @return {ol.feature}
     * @private
     */
    private getFeatureAtPixel_;
    /** Rotate feature from map view rotation
     * @param {ol.Feature} f the feature
     * @param {boolean} clone clone resulting geom
     * @param {ol.geom.Geometry} rotated geometry
     */
    getGeometryRotateToZero_(f: ol.Feature, clone: boolean): any;
    /** Test if rectangle
     * @param {ol.Geometry} geom
     * @returns {boolean}
     * @private
     */
    private _isRectangle;
    /** Draw transform sketch
    * @param {boolean} draw only the center
    */
    drawSketch_(center: any): void;
    bbox_: ol_Feature<ol_geom_Polygon>;
    /** Select a feature to transform
    * @param {ol.Feature} feature the feature to transform
    * @param {boolean} add true to add the feature to the selection, default false
    */
    select(feature: ol.Feature, add: boolean): void;
    ispt_: boolean;
    iscircle_: boolean;
    /** Update the selection collection.
    * @param {ol.Collection<ol.Feature>} features the features to transform
    */
    setSelection(features: ol.Collection<ol.Feature>): void;
    /** Watch selected features
     * @private
     */
    private watchFeatures_;
    _featureListeners: any[];
    /**
     * @param {ol.MapBrowserEvent} evt Map browser event.
     * @return {boolean} `true` to start the drag sequence.
     * @private
     */
    private handleDownEvent_;
    mode_: any;
    opt_: any;
    constraint_: any;
    coordinate_: any;
    pixel_: any;
    geoms_: any[];
    rotatedGeoms_: any[];
    extent_: import("ol/coordinate").Coordinate[];
    rotatedExtent_: import("ol/coordinate").Coordinate[];
    center_: any;
    angle_: number;
    /**
     * Get features to transform
     * @return {ol.Collection<ol.Feature>}
     */
    getFeatures(): ol.Collection<ol.Feature>;
    /**
     * Get the rotation center
     * @return {ol.coordinates|undefined}
     */
    getCenter(): ol.coordinates | undefined;
    /**
     * Set the rotation center
     * @param {ol.coordinates|undefined} c the center point, default center on the objet
     */
    setCenter(c: ol.coordinates | undefined): any;
    /**
     * @param {ol.MapBrowserEvent} evt Map browser event.
     * @private
     */
    private handleDragEvent_;
    isUpdating_: boolean;
    /**
     * @param {ol.MapBrowserEvent} evt Event.
     * @private
     */
    private handleMoveEvent_;
    /**
     * @param {ol.MapBrowserEvent} evt Map browser event.
     * @return {boolean} `false` to stop the drag sequence.
     */
    handleUpEvent_(evt: ol.MapBrowserEvent): boolean;
    /** Set the point radius to calculate handles on points
     *  @param {number|Array<number>|function} [pointRadius=0] radius for points or a function that takes a feature and returns the radius (or [radiusX, radiusY]). If not null show handles to transform the points
     */
    setPointRadius(pointRadius?: number | Array<number> | Function): void;
    _pointRadius: Function | (() => number | number[]);
    /** Cursors for transform
    */
    Cursors: {
        default: string;
        select: string;
        translate: string;
        rotate: string;
        rotate0: string;
        scale: string;
        scale1: string;
        scale2: string;
        scale3: string;
        scalev: string;
        scaleh1: string;
        scalev2: string;
        scaleh3: string;
    };
}
import ol_Collection from "ol/Collection";
import ol_source_Vector from "ol/source/Vector";
import ol_layer_Vector from "ol/layer/Vector";
import ol_style_Style from "ol/style/Style";
import ol_geom_Polygon from "ol/geom/Polygon";
import ol_Feature from "ol/Feature";
