import { featureAnimation } from './FeatureAnimation';
/** Bounce animation:
 * @constructor
 * @extends {featureAnimation}
 * @param {featureAnimationBounceOptions} options
 *	@param {number} options.bounce number of bounce, default 3
 *	@param {number} options.amplitude bounce amplitude,default 40
 *	@param {easing} options.easing easing used for decaying amplitude, use function(){return 0} for no decay, default easing.linear
 *	@param {number} options.duration duration in ms, default 1000
 */
export class Bounce extends featureAnimation {
    constructor(options: {
        bounce: number;
        amplitude: number;
        easing: ((p0: number) => number);
        duration: number;
    });
    /** Animate
    * @param {featureAnimationEvent} e
     */
    animate(e: featureAnimationEvent): boolean;
}
