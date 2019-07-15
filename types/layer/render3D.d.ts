import { Vector } from 'ol/layer';
import { Style } from 'ol/style';
/**
 * @classdesc
 *render3D 3D vector layer rendering
 * @constructor
 * @param {Object} param
 *  @param {layer.Vector} param.layer the layer to display in 3D
 *  @param {Style} options.styler drawing style
 *  @param {number} param.maxResolution  max resolution to render 3D
 *  @param {number} param.defaultHeight default height if none is return by a propertie
 *  @param {function|string|Number} param.height a height function (returns height giving a feature) or a popertie name for the height or a fixed value
 */
export class render3D {
    constructor(param: {
        layer: Vector;
        maxResolution: number;
        defaultHeight: number;
        height: ((...params: any[]) => any) | string | number;
    });
    /**
     * Set style associated with the renderer
     * @param {Style} s
     */
    setStyle(s: Style): void;
    /**
     * Get style associated with the renderer
     * @return {Style}
     */
    getStyle(): Style;
    /** Calculate 3D at potcompose
     */
    onPostcompose_(): void;
    /** Set layer to render 3D
     */
    setLayer(): void;
    /** Create a function that return height of a feature
    *	@param {function|string|number} h a height function or a popertie name or a fixed value
    *	@return {function} function(f) return height of the feature f
     */
    getHfn(h: ((...params: any[]) => any) | string | number): (...params: any[]) => any;
    /** Animate rendering
     * @param {olx.render3D.animateOptions}
     *  @param {string|function|number} param.height an attribute name or a function returning height of a feature or a fixed value
     *  @param {number} param.duration the duration of the animatioin ms, default 1000
     *  @param {easing} param.easing an ol easing function
     *	@api
     */
    animate(options: {
        height: ((...params: any[]) => any) | string | number;
        duration: number;
        easing: ((p0: number) => number);
    }): void;
    /** Check if animation is on
    *	@return {bool}
     */
    animating(): boolean;
    /**
     */
    getFeatureHeight(): void;
    /**
     */
    hvector_(): void;
    /**
     */
    getFeature3D_(): void;
    /**
     */
    drawFeature3D_(): void;
}
