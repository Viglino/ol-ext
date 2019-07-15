import { featureAnimation } from './FeatureAnimation';
/** Slice animation: feature enter from left
 * @constructor
 * @extends {featureAnimation}
 * @param {featureAnimationThrowOptions} options
 *  @param {left|right} options.side side of the animation, default left
 */
export class Throw extends featureAnimation {
    constructor(options: {
        side: 'left' | 'right';
    });
    /** Animate
    * @param {featureAnimationEvent} e
     */
    animate(e: featureAnimationEvent): boolean;
}
