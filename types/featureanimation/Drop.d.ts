export default ol_featureAnimation_Drop;
/** Drop animation: drop a feature on the map
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationDropOptions} options
 *  @param {Number} options.speed speed of the feature if 0 the duration parameter will be used instead, default 0
 *  @param {Number} options.side top or bottom, default top
 */
declare class ol_featureAnimation_Drop {
    constructor(options: any);
    speed_: any;
    side_: any;
    /** Animate
    * @param {ol_featureAnimationEvent} e
    */
    animate(e: ol_featureAnimationEvent): boolean;
    dx: number;
    dy: number;
    duration_: number;
}
