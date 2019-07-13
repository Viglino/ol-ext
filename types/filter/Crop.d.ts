import Feature from 'ol/Feature';
import { Mask } from './Mask';
/** Crop drawing using an Feature
* @constructor
* @requires filter
* @requires filter.Mask
* @extends {filter.Mask}
* @param {Object} [options]
*  @param {Feature} [options.feature] feature to crop with
*  @param {boolean} [options.inner=false] mask inner, default false
 */
export class Crop extends Mask {
    constructor(options?: {
        feature?: Feature;
        inner?: boolean;
    });
    /** Draw the feature into canvas
     */
    drawFeaturePath_(): void;
    /** Activate / deactivate filter
    *	@param {boolean} b
     */
    setActive(b: boolean): void;
    /** Get filter active
    *	@return {boolean}
     */
    getActive(): boolean;
}
