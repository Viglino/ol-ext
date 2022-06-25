export default ol_featureAnimation_None;
/** Do nothing for a given duration
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationShowOptions} options
 *
 */
declare class ol_featureAnimation_None {
    constructor(options: any);
    /** Animate: do nothing during the laps time
    * @param {ol_featureAnimationEvent} e
    */
    animate(e: ol_featureAnimationEvent): boolean;
}
