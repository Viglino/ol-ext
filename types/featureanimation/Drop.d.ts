import { featureAnimation } from './FeatureAnimation';
/** Drop animation: drop a feature on the map
 * @constructor
 * @extends {featureAnimation}
 * @param {featureAnimationDropOptions} options
 *  @param {Number} options.speed speed of the feature if 0 the duration parameter will be used instead, default 0
 *  @param {Number} options.side top or bottom, default top
 */
export class Drop extends featureAnimation {
    constructor(options: {
        speed: number;
        side: number;
    });
    /** Animate
    * @param {featureAnimationEvent} e
     */
    animate(e: featureAnimationEvent): boolean;
}
