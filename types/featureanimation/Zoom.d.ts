import { featureAnimation } from './FeatureAnimation';
/** Zoom animation: feature zoom in (for points)
 * @constructor
 * @extends {featureAnimation}
 * @param {featureAnimationZoomOptions} options
 *  @param {bool} options.zoomOut to zoom out
 */
export class Zoom extends featureAnimation {
    constructor(options: {
        zoomOut: boolean;
    });
    /** Animate
    * @param {featureAnimationEvent} e
     */
    animate(e: featureAnimationEvent): boolean;
}
