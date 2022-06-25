export default ol_interaction_Delete;
/** A Select interaction to delete features on click.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires deletestart
 * @fires deleteend
 * @param {*} options ol.interaction.Select options
 */
declare class ol_interaction_Delete {
    constructor(options: any);
    /** Get vector source of the map
     * @return {Array<ol.source.Vector>}
     */
    _getSources(layers: any): Array<ol.source.Vector>;
    /** Delete features: remove the features from the map (from all layers in the map)
     * @param {ol.Collection<ol.Feature>|Array<ol.Feature>} features The features to delete
     * @api
     */
    delete(features: ol.Collection<ol.Feature> | Array<ol.Feature>): void;
}
