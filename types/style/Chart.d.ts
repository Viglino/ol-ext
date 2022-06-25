export default ol_style_Chart;
/**
 * @requires ol.style.Circle
 * @requires ol.structs.IHasChecksum
 */
/**
 * @classdesc
 * Set chart style for vector features.
 *
 * @constructor
 * @param {} options
 *	@param {String} options.type Chart type: pie,pie3D, donut or bar
 *	@param {number} options.radius Chart radius/size, default 20
 *	@param {number} options.rotation Rotation in radians (positive rotation clockwise). Default is 0.
 *	@param {bool} options.snapToPixel use integral numbers of pixels, default true
 *	@param {_ol_style_Stroke_} options.stroke stroke style
 *	@param {String|Array<ol_color>} options.colors predefined color set "classic","dark","pale","pastel","neon" / array of color string, default classic
 *	@param {Array<number>} options.displacement
 *	@param {number} options.offsetX X offset in px (deprecated, use displacement)
 *	@param {number} options.offsetY Y offset in px (deprecated, use displacement)
 *	@param {number} options.animation step in an animation sequence [0,1]
 *	@param {number} options.max maximum value for bar chart
 * @see [Statistic charts example](../../examples/style/map.style.chart.html)
 * @extends {ol_style_RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
declare class ol_style_Chart implements ol.structs.IHasChecksum {
    constructor(opt_options: any);
    _stroke: any;
    _radius: any;
    _donutratio: any;
    _type: any;
    _offset: any[];
    _animation: {
        animate: boolean;
        step: any;
    };
    _max: any;
    _data: any;
    _colors: any;
    /**
     * Clones the style.
     * @return {ol_style_Chart}
     */
    clone(): ol_style_Chart;
    /** Get data associatied with the chart
    */
    getData(): any;
    /** Set data associatied with the chart
    *	@param {Array<number>}
    */
    setData(data: any): void;
    /** Get symbol radius
    */
    getRadius(): any;
    /** Set symbol radius
    *	@param {number} symbol radius
    *	@param {number} donut ratio
    */
    setRadius(radius: any, ratio: any): void;
    donuratio_: any;
    /** Set animation step
    *	@param {false|number} false to stop animation or the step of the animation [0,1]
    */
    setAnimation(step: any): void;
    /** @private
    */
    private renderChart_;
}
declare namespace ol_style_Chart {
    namespace colors {
        const classic: string[];
        const dark: string[];
        const pale: string[];
        const pastel: string[];
        const neon: string[];
    }
}
