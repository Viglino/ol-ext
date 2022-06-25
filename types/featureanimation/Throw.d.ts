export default ol_featureAnimation_Throw;
/** Slice animation: feature enter from left
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationThrowOptions} options
 *  @param {left|right} options.side side of the animation, default left
 */
declare class ol_featureAnimation_Throw {
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
