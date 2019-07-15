import { featureAnimation } from './FeatureAnimation';
/** Slice animation: feature enter from left
 * @constructor
 * @extends {featureAnimation}
 * @param {featureAnimationSlideOptions} options
 *  @param {Number} options.speed speed of the animation, if 0 the duration parameter will be used instead, default 0
 */
export class Slide extends featureAnimation {
    constructor(options: {
        speed: number;
    });
    /** Animate
    * @param {featureAnimationEvent} e
     */
    animate(e: featureAnimationEvent): boolean;
}
