export default ol_featureAnimation_Fade;
/** Fade animation: feature fade in
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationOptions} options
 */
declare class ol_featureAnimation_Fade {
    constructor(options: any);
    speed_: any;
    /** Animate
    * @param {ol_featureAnimationEvent} e
    */
    animate(e: ol_featureAnimationEvent): boolean;
}
