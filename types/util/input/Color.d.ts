export default ol_ext_input_Color;
/** Color picker
 * @constructor
 * @extends {ol_ext_input_PopupBase}
 * @fires change:color
 * @fires color
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {ol.colorLike} [options.color] default color
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 *  @param {boolean} [options.hastab=false] use tabs for palette / picker
 *  @param {string} [options.paletteLabel="palette"] label for the palette tab
 *  @param {string} [options.pickerLabel="picker"] label for the picker tab
 *  @param {string} [options.position='popup'] fixed | static | popup | inline (no popup)
 *  @param {boolean} [options.opacity=true] enable opacity
 *  @param {boolean} [options.autoClose=true] close when click on color
 *  @param {boolean} [options.hidden=true] display the input
 */
declare class ol_ext_input_Color {
    constructor(options: any);
    _cursor: {};
    _hsv: {};
    _paletteColor: {};
    _currentColor: number;
    /** Add color to palette
     * @param {ol.colorLike} color
     * @param {string} title
     * @param {boolean} select
     */
    addPaletteColor(color: ol.colorLike, title: string, select: boolean): void;
    /** Show palette or picker tab
     * @param {string} what palette or picker
     */
    showTab(what: string): void;
    /** Show palette or picker tab
     * @returns {string} palette or picker
     */
    getTab(): string;
    /** Select a color in the palette
     * @private
     */
    private _selectPalette;
    /** Set Color
     * @param { Array<number> }
     */
    setColor(color: any): void;
    /** Get current color
     * @param {boolean} [opacity=true]
     * @return {Array<number>}
     */
    getColor(opacity?: boolean): Array<number>;
    /**
     * @private
     */
    private _addCustomColor;
    clearCustomColor(): void;
    /** Convert color to id
     * @param {ol.colorLike} Color
     * @returns {number}
     */
    getColorID(color: any): number;
    /** Convert color to id
     * @param {number} id
     * @returns {Array<number>} Color
     */
    getColorFromID(id: number): Array<number>;
}
declare namespace ol_ext_input_Color {
    const customColorList: any;
}
