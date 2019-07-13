import { featureAnimation } from './FeatureAnimation';
/** Do nothing for a given duration
 * @constructor
 * @extends {featureAnimation}
 * @param {featureAnimationShowOptions} options
 *
 */
export class None extends featureAnimation {
    constructor(options: featureAnimationShowOptions);
    /** Animate: do nothing during the laps time
    * @param {featureAnimationEvent} e
     */
    animate(e: featureAnimationEvent): boolean;
}
