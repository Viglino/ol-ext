export default ol_render3D;
/**
 * @classdesc
 *  3D vector layer rendering
 * @constructor
 * @param {Object} param
 *  @param {ol.layer.Vector} param.layer the layer to display in 3D
 *  @param {ol.style.Style} options.style drawing style
 *  @param {function|boolean} param.active a function that returns a boolean or a boolean ,default true
 *  @param {boolean} param.ghost use ghost style
 *  @param {number} param.maxResolution  max resolution to render 3D
 *  @param {number} param.defaultHeight default height if none is return by a propertie
 *  @param {function|string|Number} param.height a height function (returns height giving a feature) or a popertie name for the height or a fixed value
 */
declare class ol_render3D {
    constructor(options: any);
    height_: Function;
    /**
     * Set style associated with the renderer
     * @param {ol.style.Style} s
     */
    setStyle(s: ol.style.Style): void;
    _style: ol_style_Style;
    /**
     * Get style associated with the renderer
     * @return {ol.style.Style}
     */
    getStyle(): ol.style.Style;
    /** Set active
     * @param {function|boolean} active
     */
    setActive(active: Function | boolean): void;
    _active: Function | (() => boolean);
    /** Get active
     * @return {boolean}
     */
    getActive(): boolean;
    /** Calculate 3D at potcompose
     * @private
     */
    private onPostcompose_;
    res_: number;
    elapsedRatio_: any;
    animate_: number | boolean;
    matrix_: any;
    center_: number[];
    /** Set layer to render 3D
     */
    setLayer(l: any): void;
    layer_: any;
    _listener: any;
    /** Create a function that return height of a feature
     *	@param {function|string|number} h a height function or a popertie name or a fixed value
     *	@return {function} function(f) return height of the feature f
     */
    getHfn(h: Function | string | number): Function;
    /** Animate rendering
     * @param {olx.render3D.animateOptions}
     *  @param {string|function|number} param.height an attribute name or a function returning height of a feature or a fixed value
     *  @param {number} param.duration the duration of the animatioin ms, default 1000
     *  @param {ol.easing} param.easing an ol easing function
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
    /** Get feature height
     * @param {ol.Feature} f
     */
    getFeatureHeight(f: ol.Feature): any;
    /** Get elevation line
     * @private
     */
    private hvector_;
    /** Get drawing
     * @private
     */
    private getFeature3D_;
    /** Draw a feature
     * @param {CanvasRenderingContext2D} ctx
     * @param {ol.Feature} build
     * @private
     */
    private drawFeature3D_;
    /**
     * @private
     */
    private drawGhost3D_;
}
import ol_style_Style from "ol/style/Style";
