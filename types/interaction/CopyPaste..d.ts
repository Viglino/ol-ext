import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
import { Interaction } from 'ol/interaction';
/** An interaction to copy/paste features on a map
 * @constructor
 * @fires focus
 * @fires copy
 * @fires paste
 * @extends {Interaction}
 * @param {Object} options Options
 *  @param {function} options.condition a function that take a mapBrowserEvent and return the actio nto perform: 'copy', 'cut' or 'paste', default Ctrl+C / Ctrl+V
 *  @param {Collection<Feature>} options.features list of features to copy
 *  @param {VectorSource | Array<VectorSource>} options.sources the source to copy from (used for cut), if not defined, it will use the destination
 *  @param {VectorSource} options.destination the source to copy to
 */
export class CopyPaste extends Interaction {
    constructor(options: {
        condition: (...params: any[]) => any;
        features: Collection<Feature>;
        sources: VectorSource | VectorSource[];
        destination: VectorSource;
    });
    /** Sources to cut feature from
     * @param { VectorSource | Array<VectorSource> } sources
     */
    setSources(sources: VectorSource | VectorSource[]): void;
    /** Get sources to cut feature from
     * @return { Array<VectorSource> }
     */
    getSources(): VectorSource[];
    /** Source to paste features
     * @param { VectorSource } source
     */
    setDestination(source: VectorSource): void;
    /** Get source to paste features
     * @param { VectorSource }
     */
    getDestination(): void;
    /** Get current feature to copy
     * @return {Array<Feature>}
     */
    getFeatures(): Feature[];
    /** Set current feature to copy
     * @param {Object} options
     *  @param {Array<Feature> | Collection<Feature>} options.features feature to copy, default get in the provided collection
     *  @param {boolean} options.cut try to cut feature from the sources, default false
     *  @param {boolean} options.silent true to send an event, default true
     */
    copy(options: {
        features: Feature[] | Collection<Feature>;
        cut: boolean;
        silent: boolean;
    }): void;
    /** Paste features
     * @param {Object} options
     *  @param {Array<Feature> | Collection<Feature>} features feature to copy, default get current features
     *  @param {VectorSource} options.destination Source to paste to, default the current source
     *  @param {boolean} options.silent true to send an event, default true
     */
    paste(options: {
        destination: VectorSource;
        silent: boolean;
    }, features: Feature[] | Collection<Feature>): void;
}
