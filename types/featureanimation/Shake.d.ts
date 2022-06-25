export default ol_featureAnimation_Shake;
/** Shakee animation:
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationShakeOptions} options
 *	@param {Integer} options.bounce number o bounds, default 6
 *	@param {Integer} options.amplitude amplitude of the animation, default 40
 *	@param {bool} options.horizontal shake horizontally default false (vertical)
 */
declare class ol_featureAnimation_Shake {
    constructor(options: any);
    amplitude_: any;
    bounce_: number;
    horizontal_: any;
    /** Animate
    * @param {ol_featureAnimationEvent} e
    */
    animate(e: ol_featureAnimationEvent): boolean;
}
