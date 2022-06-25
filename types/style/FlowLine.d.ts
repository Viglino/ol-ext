export default ol_style_FlowLine;
/** Flow line style
 * Draw LineString with a variable color / width
 * NB: the FlowLine style doesn't impress the hit-detection.
 * If you want your lines to be sectionable you have to add your own style to handle this.
 * (with transparent line: stroke color opacity to .1 or zero width)
 * @constructor
 * @extends {ol_style_Style}
 * @param {Object} options
 *  @param {boolean} options.visible draw only the visible part of the line, default true
 *  @param {number|function} options.width Stroke width or a function that gets a feature and the position (beetween [0,1]) and returns current width
 *  @param {number} options.width2 Final stroke width (if width is not a function)
 *  @param {number} options.arrow Arrow at start (-1), at end (1), at both (2), none (0), default geta
 *  @param {ol.colorLike|function} options.color Stroke color or a function that gets a feature and the position (beetween [0,1]) and returns current color
 *  @param {ol.colorLike} options.color2 Final sroke color if color is nor a function
 *  @param {ol.colorLike} options.arrowColor Color of arrows, if not defined used color or color2
 *  @param {string} options.lineCap CanvasRenderingContext2D.lineCap 'butt' | 'round' | 'square', default 'butt'
 *  @param {number|ol.size} options.arrowSize height and width of the arrow, default 16
 *  @param {boolean} [options.noOverlap=false] prevent segments overlaping
 *  @param {number} options.offset0 offset at line start
 *  @param {number} options.offset1 offset at line end
 */
declare class ol_style_FlowLine {
    constructor(options: any);
    _visible: boolean;
    _widthFn: any;
    _colorFn: any;
    _offset: number[];
    _noOverlap: any;
    /** Set the initial width
     * @param {number} width width, default 0
     */
    setWidth(width: number): void;
    _width: number;
    /** Set the final width
     * @param {number} width width, default 0
     */
    setWidth2(width: number): void;
    _width2: number;
    /** Get offset at start or end
     * @param {number} where 0=start, 1=end
     * @return {number} width
     */
    getOffset(where: number): number;
    /** Add an offset at start or end
     * @param {number} width
     * @param {number} where 0=start, 1=end
     */
    setOffset(width: number, where: number): void;
    /** Set the LineCap
     * @param {steing} cap LineCap (round or butt), default butt
     */
    setLineCap(cap: steing): void;
    _lineCap: string;
    /** Get the current width at step
     * @param {ol.feature} feature
     * @param {number} step current drawing step beetween [0,1]
     * @return {number}
     */
    getWidth(feature: ol.feature, step: number): number;
    /** Set the initial color
     * @param {ol.colorLike} color
     */
    setColor(color: ol.colorLike): void;
    _color: number[] | import("ol/color").Color;
    /** Set the final color
     * @param {ol.colorLike} color
     */
    setColor2(color: ol.colorLike): void;
    _color2: import("ol/color").Color;
    /** Set the arrow color
     * @param {ol.colorLike} color
     */
    setArrowColor(color: ol.colorLike): void;
    _acolor: string;
    /** Get the current color at step
     * @param {ol.feature} feature
     * @param {number} step current drawing step beetween [0,1]
     * @return {string}
     */
    getColor(feature: ol.feature, step: number): string;
    /** Get arrow
     */
    getArrow(): number;
    /** Set arrow
     * @param {number} n -1 | 0 | 1 | 2, default: 0
     */
    setArrow(n: number): void;
    _arrow: number;
    /** getArrowSize
     * @return {ol.size}
     */
    getArrowSize(): ol.size;
    /** setArrowSize
     * @param {number|ol.size} size
     */
    setArrowSize(size: number | ol.size): void;
    _arrowSize: any[] | number[];
    /** drawArrow
     * @param {CanvasRenderingContext2D} ctx
     * @param {ol.coordinate} p0
     * @param ol.coordinate} p1
     * @param {number} width
     * @param {number} ratio pixelratio
     * @private
     */
    private drawArrow;
    /** Renderer function
     * @param {Array<ol.coordinate>} geom The pixel coordinates of the geometry in GeoJSON notation
     * @param {ol.render.State} e The olx.render.State of the layer renderer
     */
    _render(geom: Array<ol.coordinate>, e: ol.render.State): void;
    /** Split extremity at
     * @param {ol.geom.LineString} geom
     * @param {number} asize
     * @param {boolean} end start=false or end=true, default false (start)
     */
    _splitAsize(geom: ol.geom.LineString, asize: number, end: boolean): any[];
    /** Split line geometry into equal length geometries
     * @param {Array<ol.coordinate>} geom
     * @param {number} nb number of resulting geometries, default 255
     * @param {number} nim minimum length of the resulting geometries, default 1
     */
    _splitInto(geom: Array<ol.coordinate>, nb: number, min: any): ol.coordinate[][];
}
