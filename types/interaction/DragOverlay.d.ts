export default ol_interaction_DragOverlay;
/** Drag an overlay on the map
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @fires dragstart
 * @fires dragging
 * @fires dragend
 * @param {any} options
 *  @param {ol.Overlay|Array<ol.Overlay>} options.overlays the overlays to drag
 *  @param {ol.Size} options.offset overlay offset, default [0,0]
 */
declare class ol_interaction_DragOverlay {
    constructor(options: any);
    _overlays: any[];
    /** Add an overlay to the interacton
     * @param {ol.Overlay} ov
     */
    addOverlay(ov: ol.Overlay): void;
    /** Remove an overlay from the interacton
     * @param {ol.Overlay} ov
     */
    removeOverlay(ov: ol.Overlay): void;
}
