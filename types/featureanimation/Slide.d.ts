export default ol_featureAnimation_Slide;
/** Slice animation: feature enter from left
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationSlideOptions} options
 *  @param {Number} options.speed speed of the animation, if 0 the duration parameter will be used instead, default 0
 */
declare class ol_featureAnimation_Slide {
    constructor(options: any);
    speed_: any;
    side_: any;
    /** Animate
    * @param {ol_featureAnimationEvent} e
    */
    animate(e: ol_featureAnimationEvent): boolean;
    dx: number;
    duration_: number;
}
