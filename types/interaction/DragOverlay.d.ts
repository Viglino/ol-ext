import { Overlay } from 'ol';
import { Pointer } from 'ol/interaction';
/** Drag an overlay on the map
 * @constructor
 * @extends {interaction.Pointer}
 * @fires dragstart
 * @fires dragging
 * @fires dragend
 * @param {any} options
 *  @param {Overlay|Array<Overlay} options.overlays the overlays to drag
 */
export class DragOverlay extends Pointer {
    constructor(options: any);
    /** Add an overlay to the interacton
     * @param {Overlay} ov
     */
    addOverlay(ov: Overlay): void;
    /** Remove an overlay from the interacton
     * @param {Overlay} ov
     */
    removeOverlay(ov: Overlay): void;
}
