export default ol_interaction_Splitter;
/** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires  beforesplit, aftersplit
 * @param {options}
 *  @param {ol.source.Vector|Array{ol.source.Vector}} options.source The target source (or array of source) with features to be split (configured with useSpatialIndex set to true)
 *  @param {ol.source.Vector} options.triggerSource Any newly created or modified features from this source will be used to split features on the target source. If none is provided the target source is used instead.
 *  @param {ol_Collection.<ol.Feature>} options.features A collection of feature to be split (replace source target).
 *  @param {ol_Collection.<ol.Feature>} options.triggerFeatures Any newly created or modified features from this collection will be used to split features on the target source (replace triggerSource).
 *  @param {function|undefined} options.filter a filter that takes a feature and return true if the feature is eligible for splitting, default always split.
 *  @param {function|undefined} options.tolerance Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split. Default is 1e-10.
 * @todo verify auto intersection on features that split.
 */
declare class ol_interaction_Splitter {
    constructor(options: any);
    added_: any[];
    removed_: any[];
    source_: any;
    tolerance_: any;
    filterSplit_: any;
    /** Calculate intersection on 2 segs
    * @param {Array<_ol_coordinate_>} s1 first seg to intersect (2 points)
    * @param {Array<_ol_coordinate_>} s2 second seg to intersect (2 points)
    * @return { boolean | _ol_coordinate_ } intersection point or false no intersection
    */
    intersectSegs(s1: Array<_ol_coordinate_>, s2: Array<_ol_coordinate_>): boolean | _ol_coordinate_;
    /** Split the source using a feature
    * @param {ol.Feature} feature The feature to use to split.
    * @private
    */
    private splitSource;
    /** Split the source using a feature
    * @param {ol.Feature} feature The feature to use to split.
    * @private
    */
    private _splitSource;
    splitting: boolean;
    /** New feature source is added
     * @private
    */
    private onAddFeature;
    /** Feature source is removed > count features added/removed
     * @private
    */
    private onRemoveFeature;
    /** Feature source is changing
     * @private
    */
    private onChangeFeature;
    lastEvent_: any;
}
