export default ol_interaction_SelectCluster;
/**
 * @classdesc
 * Interaction for selecting vector features in a cluster.
 * It can be used as an ol.interaction.Select.
 * When clicking on a cluster, it springs apart to reveal the features in the cluster.
 * Revealed features are selectable and you can pick the one you meant.
 * Revealed features are themselves a cluster with an attribute features that contain the original feature.
 *
 * @constructor
 * @extends {ol.interaction.Select}
 * @param {olx.interaction.SelectOptions=} options SelectOptions.
 *  @param {ol.style} options.featureStyle used to style the revealed features as options.style is used by the Select interaction.
 * 	@param {boolean} options.selectCluster false if you don't want to get cluster selected
 * 	@param {Number} options.pointRadius to calculate distance between the features
 * 	@param {bool} options.spiral means you want the feature to be placed on a spiral (or a circle)
 * 	@param {Number} options.circleMaxObjects number of object that can be place on a circle
 * 	@param {Number} options.maxObjects number of object that can be drawn, other are hidden
 * 	@param {bool} options.animate if the cluster will animate when features spread out, default is false
 * 	@param {Number} options.animationDuration animation duration in ms, default is 500ms
 * 	@param {boolean} options.autoClose if selecting a cluster should close previously selected clusters. False to get toggle feature. Default is true
 * @fires ol.interaction.SelectEvent
 * @api stable
 */
declare class ol_interaction_SelectCluster {
    constructor(options: any);
    pointRadius: any;
    circleMaxObjects: any;
    maxObjects: any;
    spiral: boolean;
    animate: any;
    animationDuration: any;
    selectCluster_: boolean;
    _autoClose: boolean;
    overlayLayer_: ol_layer_Vector<ol_source_Vector<import("ol/geom/Geometry").default>>;
    filter_: any;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    _listener: any;
    /**
     * Clear the selection, close the cluster and remove revealed features
     * @api stable
     */
    clear(): void;
    /**
     * Get the layer for the revealed features
     * @api stable
     */
    getLayer(): ol_layer_Vector<ol_source_Vector<import("ol/geom/Geometry").default>>;
    /**
     * Select a cluster
     * @param {ol.SelectEvent | ol.Feature} a cluster feature ie. a feature with a 'features' attribute.
     * @api stable
     */
    selectCluster(e: any): void;
    /**
     * Animate the cluster and spread out the features
     * @param {ol.Coordinates} the center of the cluster
     */
    animateCluster_(center: any, features: any): void;
    listenerKey_: import("ol/events").EventsKey & import("ol/events").EventsKey[];
    /** Helper function to get the extent of a cluster
     * @param {ol.feature} feature
     * @return {ol.extent|null} the extent or null if extent is empty (no cluster or superimposed points)
     */
    getClusterExtent(feature: ol.feature): ol.extent | null;
}
import ol_source_Vector from "ol/source/Vector";
import ol_layer_Vector from "ol/layer/Vector";
