import { featureAnimation } from './FeatureAnimation';
/** Show an object for a given duration
 * @constructor
 * @extends {featureAnimation}
 * @param {featureAnimationOptions} options
 */
export class Show extends featureAnimation {
    constructor(options: featureAnimationOptions);
    /** Animate: just show the object during the laps time
    * @param {featureAnimationEvent} e
     */
    animate(e: featureAnimationEvent): boolean;
}
