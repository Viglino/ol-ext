import Collection from 'ol/Collection';
import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
import { Interaction } from 'ol/interaction';
/** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
 * @constructor
 * @extends {Interaction}
 * @fires  beforesplit, aftersplit
 * @param {olx.interaction.SplitOptions}
 *	- source {VectorSource|Array{VectorSource}} The target source (or array of source) with features to be split (configured with useSpatialIndex set to true)
 *	- triggerSource {VectorSource} Any newly created or modified features from this source will be used to split features on the target source. If none is provided the target source is used instead.
 *	- features {Collection.<Feature>} A collection of feature to be split (replace source target).
 *	- triggerFeatures {Collection.<Feature>} Any newly created or modified features from this collection will be used to split features on the target source (replace triggerSource).
 *	- filter {function|undefined} a filter that takes a feature and return true if the feature is eligible for splitting, default always split.
 *	- tolerance {function|undefined} Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split. Default is 1e-10.
 * @todo verify auto intersection on features that split.
 */
export class Splitter extends Interaction {
    constructor(options: {
        source: VectorSource | VectorSource[];
        triggerSource: VectorSource;
        features: Collection<Feature>;
        filter: (f: Feature) => boolean | undefined;
        tolerance: ((...params: any[]) => number) | undefined;
    });
    /** Calculate intersection on 2 segs
    * @param {Array<Coordinate>} s1 first seg to intersect (2 points)
    * @param {Array<Coordinate>} s2 second seg to intersect (2 points)
    * @return { boolean | Coordinate } intersection point or false no intersection
     */
    intersectSegs(s1: Coordinate[], s2: Coordinate[]): boolean | Coordinate;
    /** Split the source using a feature
    * @param {Feature} feature The feature to use to split.
     */
    splitSource(feature: Feature): void;
    /** New feature source is added
     */
    onAddFeature(): void;
    /** Feature source is removed > count features added/removed
     */
    onRemoveFeature(): void;
    /** Feature source is changing
     */
    onChangeFeature(): void;
}
