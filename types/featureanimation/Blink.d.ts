export default ol_featureAnimation_Blink;
/** Blink a feature
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationOptions} options
 *  @param {Number} options.nb number of blink, default 10
 */
declare class ol_featureAnimation_Blink {
    constructor(options: any);
    /** Animate: Show or hide feature depending on the laptimes
    * @param {ol_featureAnimationEvent} e
    */
    animate(e: ol_featureAnimationEvent): boolean;
}
