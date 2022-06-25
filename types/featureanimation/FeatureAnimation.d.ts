export default ol_featureAnimation;
/**
 * An animation controler object an object to control animation with start, stop and isPlaying function.
 * To be used with {@link olx.MapanimateFeature } or {@link ol.layer.VectoranimateFeature }
 */
export type animationControler = {
    /**
     * - start animation.
     */
    start: Function;
    /**
     * - stop animation option arguments can be passed in animationend event.
     */
    stop: Function;
    /**
     * - return true if animation is playing.
     */
    isPlaying: Function;
};
/** Feature animation base class
 * Use the {@link ol.Map#animateFeature} or {@link ol.layer.Vector#animateFeature} to animate a feature
 * on postcompose in a map or a layer
* @constructor
* @fires animationstart
* @fires animating
* @fires animationend
* @param {ol_featureAnimationOptions} options
*	@param {Number} options.duration duration of the animation in ms, default 1000
*	@param {bool} options.revers revers the animation direction
*	@param {Number} options.repeat number of time to repeat the animation, default 0
*	@param {ol.style.Style} options.hiddenStyle a style to display the feature when playing the animation
*	  to be used to make the feature selectable when playing animation
*	  (@see {@link ../examples/map.featureanimation.select.html}), default the feature
*	  will be hidden when playing (and not selectable)
*	@param {ol_easing_Function} options.fade an easing function used to fade in the feature, default none
*	@param {ol_easing_Function} options.easing an easing function for the animation, default ol_easing_linear
*/
declare class ol_featureAnimation {
    constructor(options: any);
    duration_: any;
    fade_: any;
    repeat_: number;
    easing_: any;
    hiddenStyle: any;
    /** Draw a geometry
    * @param {olx.animateFeatureEvent} e
    * @param {ol.geom} geom geometry for shadow
    * @param {ol.geom} shadow geometry for shadow (ie. style with zIndex = -1)
    * @private
    */
    private drawGeom_;
    /** Function to perform manipulations onpostcompose.
     * This function is called with an ol_featureAnimationEvent argument.
     * The function will be overridden by the child implementation.
     * Return true to keep this function for the next frame, false to remove it.
     * @param {ol_featureAnimationEvent} e
     * @return {bool} true to continue animation.
     * @api
     */
    animate(): bool;
}
declare namespace ol_featureAnimation {
    const hiddenStyle: ol_style_Style;
}
import ol_style_Style from "ol/style/Style";
