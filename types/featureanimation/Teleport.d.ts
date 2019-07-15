import { featureAnimation } from './FeatureAnimation';
/** Teleport a feature at a given place
 * @constructor
 * @extends {featureAnimation}
 * @param {featureAnimationOptions} options
 */
export class Teleport extends featureAnimation {
    constructor(options: featureAnimationOptions);
    /** Animate
    * @param {featureAnimationEvent} e
     */
    animate(e: featureAnimationEvent): boolean;
}
