export default ol_featureAnimation_Bounce;
/** Bounce animation:
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationBounceOptions} options
 *	@param {Integer} options.bounce number of bounce, default 3
 *	@param {Integer} options.amplitude bounce amplitude,default 40
 *	@param {ol.easing} options.easing easing used for decaying amplitude, use function(){return 0} for no decay, default ol.easing.linear
 *	@param {Integer} options.duration duration in ms, default 1000
 */
declare class ol_featureAnimation_Bounce {
    constructor(options: any);
    amplitude_: any;
    bounce_: number;
    /** Animate
    * @param {ol_featureAnimationEvent} e
    */
    animate(e: ol_featureAnimationEvent): boolean;
}
