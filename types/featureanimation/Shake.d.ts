import { featureAnimation } from './FeatureAnimation';
/** Shakee animation:
 * @constructor
 * @extends {featureAnimation}
 * @param {featureAnimationShakeOptions} options
 *	@param {number} options.bounce number o bounds, default 6
 *	@param {number} options.amplitude amplitude of the animation, default 40
 *	@param {bool} options.horizontal shake horizontally default false (vertical)
 */
export class Shake extends featureAnimation {
    constructor(options: {
        bounce: number;
        amplitude: number;
        horizontal: boolean;
    });
    /** Animate
    * @param {featureAnimationEvent} e
     */
    animate(e: featureAnimationEvent): boolean;
}
