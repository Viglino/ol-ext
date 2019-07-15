import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
import { AttributionLike } from 'ol/source/Source';
import { Options as VectorSourceOptions } from 'ol/source/Vector';
/**
* @constructor source.Mapillary
* @extends {VectorSource}
* @param {olx.source.Mapillary=} options
 */
export class Mapillary extends VectorSource {
    constructor(options?: VectorSourceOptions);
    /** Max resolution to load features
     */
    _maxResolution: any;
    /** Query limit
     */
    _limit: any;
    /** Decode wiki attributes and choose to add feature to the layer
    * @param {feature} the feature
    * @param {attributes} wiki attributes
    * @return {boolean} true: add the feature to the layer
    * @API stable
     */
    readFeature(featue: Feature, attributes: AttributionLike): boolean;
    /** Overwrite Vector clear to fire clearstart / clearend event
     */
    clear(): void;
}
