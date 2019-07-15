import { featureAnimation } from './FeatureAnimation';
/** Do nothing
 * @constructor
 * @extends {featureAnimation}
 */
export class Null extends featureAnimation {
    /** Function to perform manipulations onpostcompose.
     * This function is called with an featureAnimationEvent argument.
     * The function will be overridden by the child implementation.
     * Return true to keep this function for the next frame, false to remove it.
     * @param {featureAnimationEvent} e
     * @return {bool} true to continue animation.
     * @api
     */
    animate(e: featureAnimationEvent): boolean;
}
