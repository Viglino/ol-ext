export default ol_layer_AnimatedCluster;
/**
 *  A vector layer for animated cluster
 * @constructor
 * @extends {ol.layer.Vector}
 * @param {olx.layer.AnimatedClusterOptions=} options extend olx.layer.Options
 *  @param {Number} options.animationDuration animation duration in ms, default is 700ms
 *  @param {ol.easingFunction} animationMethod easing method to use, default ol.easing.easeOut
 */
declare class ol_layer_AnimatedCluster {
    constructor(opt_options: any);
    oldcluster: ol_source_Vector<import("ol/geom/Geometry").default>;
    clusters: any[];
    animation: {
        start: boolean;
    };
    /** save cluster features before change
     * @private
     */
    private saveCluster;
    sourceChanged: boolean;
    /**
     * Get the cluster that contains a feature
     * @private
    */
    private getClusterForFeature;
    /**
     * Stop animation
     * @private
     */
    private stopAnimation;
    /**
     * animate the cluster
     * @private
     */
    private animate;
    clip_: boolean;
    /**
     * remove clipping after the layer is drawn
     * @private
     */
    private postanimate;
}
import ol_source_Vector from "ol/source/Vector";
