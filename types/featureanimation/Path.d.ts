export default ol_featureAnimation_Path;
/** Path animation: feature follow a path
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationPathOptions} options extend ol.featureAnimation options
 *  @param {Number} options.speed speed of the feature, if 0 the duration parameter will be used instead, default 0
 *  @param {Number|boolean} options.rotate rotate the symbol when following the path, true or the initial rotation, default false
 *  @param {ol.geom.LineString|ol.Feature} options.path the path to follow
 *  @param {Number} options.duration duration of the animation in ms
 */
declare class ol_featureAnimation_Path {
    constructor(options: any);
    speed_: any;
    path_: any;
    rotate_: any;
    dist_: any;
    duration_: number;
    /** Animate
    * @param {ol_featureAnimationEvent} e
    */
    animate(e: ol_featureAnimationEvent): boolean;
}
