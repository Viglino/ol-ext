import { featureAnimation } from './FeatureAnimation';
/** Fade animation: feature fade in
 * @constructor
 * @extends {featureAnimation}
 * @param {featureAnimationOptions} options
 */
export class Fade extends featureAnimation {
    constructor(options: featureAnimationOptions);
    /** Animate
    * @param {featureAnimationEvent} e
     */
    animate(e: featureAnimationEvent): boolean;
}
