export default ol_featureAnimation_Teleport;
/** Teleport a feature at a given place
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationOptions} options
 */
declare class ol_featureAnimation_Teleport {
    constructor(options: any);
    /** Animate
    * @param {ol_featureAnimationEvent} e
    */
    animate(e: ol_featureAnimationEvent): boolean;
}
