import Feature from 'ol/Feature';
import { LineString } from 'ol/geom';
import { featureAnimation } from './FeatureAnimation';
/** Path animation: feature follow a path
 * @constructor
 * @extends {featureAnimation}
 * @param {featureAnimationPathOptions} options extend featureAnimation options
 *  @param {Number} options.speed speed of the feature, if 0 the duration parameter will be used instead, default 0
 *  @param {Number|boolean} options.rotate rotate the symbol when following the path, true or the initial rotation, default false
 *  @param {LineString|Feature} options.path the path to follow
 */
export class Path extends featureAnimation {
    constructor(options: {
        speed: number;
        rotate: number | boolean;
        path: LineString | Feature;
    });
    /** Animate
    * @param {featureAnimationEvent} e
     */
    animate(e: featureAnimationEvent): boolean;
}
