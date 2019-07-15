import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { Interaction } from 'ol/interaction';
/** A Select interaction to delete features on click.
 * @constructor
 * @extends {Interaction}
 * @fires deletestart
 * @fires deleteend
 * @param {*} options interaction.Select options
 */
export class Delete extends Interaction {
    constructor(options: any);
    /** Get vector source of the map
     * @return {Array<VectorSource}
     */
    _getSources(): any;
    /** Delete features: remove the features from the map (from all layers in the map)
     * @param {Collection<Feature>|Array<Feature>} features The features to delete
     * @api
     */
    delete(features: Collection<Feature> | Feature[]): void;
}
