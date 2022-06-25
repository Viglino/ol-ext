export default ol_layer_Vector3D;
/**
 * @classdesc 3D vector layer rendering
 * @constructor
 * @extends {pl.layer.Image}
 * @param {Object} options
 *  @param {ol.layer.Vector} options.source the source to display in 3D
 *  @param {ol.style.Style} options.styler drawing style
 *  @param {number} options.maxResolution  max resolution to render 3D
 *  @param {number} options.defaultHeight default height if none is return by a propertie
 *  @param {function|string|Number} options.height a height function (returns height giving a feature) or a popertie name for the height or a fixed value
 *  @param {Array<number>} options.center center of the view, default [.5,1]
 */
declare class ol_layer_Vector3D {
    constructor(options: any);
    _source: any;
    height_: Function;
    /**
     * Set the height function for the layer
     * @param {function|string|Number} height a height function (returns height giving a feature) or a popertie name or a fixed value
     */
    setHeight(height: Function | string | number): void;
    /**
     * Set style associated with the layer
     * @param {ol.style.Style} s
     */
    setStyle(s: ol.style.Style): void;
    _style: ol_style_Style;
    /**
     * Get style associated with the layer
     * @return {ol.style.Style}
     */
    getStyle(): ol.style.Style;
    /** Calculate 3D at potcompose
     * @private
     */
    private onPostcompose_;
    res_: number;
    elapsedRatio_: any;
    animate_: number | boolean;
    matrix_: any;
    center_: number[];
    /** Create a function that return height of a feature
     * @param {function|string|number} h a height function or a popertie name or a fixed value
     * @return {function} function(f) return height of the feature f
     * @private
     */
    private getHfn;
    /** Animate rendering
     * @param {*} options
     *  @param {string|function|number} options.height an attribute name or a function returning height of a feature or a fixed value
     *  @param {number} options.duration the duration of the animatioin ms, default 1000
     *  @param {ol.easing} options.easing an ol easing function
     *	@api
     */
    animate(options: any): void;
    toHeight_: Function;
    animateDuration_: any;
    easing_: any;
    /** Check if animation is on
    *	@return {bool}
    */
    animating(): bool;
    /** Get height for a feature
     * @param {ol.Feature} f
     * @return {number}
     * @private
     */
    private _getFeatureHeight;
    /** Get hvector for a point
     * @private
     */
    private hvector_;
    /** Get a vector 3D for a feature
     * @private
     */
    private getFeature3D_;
    /** Draw 3D feature
     * @private
     */
    private drawFeature3D_;
}
import ol_style_Style from "ol/style/Style";
