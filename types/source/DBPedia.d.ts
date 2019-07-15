import Feature from 'ol/Feature';
import { FeatureLoader } from 'ol/featureloader';
import { Vector as VectorSource } from 'ol/source';
import { AttributionLike } from 'ol/source/Source';
import { LoadingStrategy } from 'ol/source/Vector';
/**
* @constructor source.DBPedia
* @extends {VectorSource}
* @param {olx.source.DBPedia=} opt_options
 */
export class DBPedia extends VectorSource {
    constructor(opt_options?: {
        loader: FeatureLoader;
        url?: string;
        maxResolution?: number;
        lang?: string;
        limit: number;
        attributions?: AttributionLike;
        stragety: LoadingStrategy;
    });
    /** Decode RDF attributes and choose to add feature to the layer
    * @param {feature} the feature
    * @param {attributes} RDF attributes
    * @param {lastfeature} last feature added (null if none)
    * @return {boolean} true: add the feature to the layer
    * @API stable
     */
    readFeature(feature: Feature, attributes: any[], lastfeature: Feature): boolean;
    /** Set RDF query subject, default: select label, thumbnail, abstract and type
    * @API stable
     */
    querySubject(): void;
    /** Set RDF query filter, default: select language
    * @API stable
     */
    queryFilter(): void;
    /** Overwrite Vector clear to fire clearstart / clearend event
     */
    clear(): void;
}
