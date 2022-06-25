export default ol_featureAnimation_Show;
/** Show an object for a given duration
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationOptions} options
 */
declare class ol_featureAnimation_Show {
    constructor(options: any);
    /** Animate: just show the object during the laps time
    * @param {ol_featureAnimationEvent} e
    */
    animate(e: ol_featureAnimationEvent): boolean;
}
