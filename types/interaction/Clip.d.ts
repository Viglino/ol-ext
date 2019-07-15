import { Layer } from 'ol/layer';
import { Pointer } from 'ol/interaction';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Pixel } from 'ol/pixel';
/** Clip interaction to clip layers in a circle
 * @constructor
 * @extends {interaction.Pointer}
 * @param {interaction.Clip.options} options flashlight  param
 *  @param {number} options.radius radius of the clip, default 100
 *	@param {layer|Array<layer>} options.layers layers to clip
 */
export class Clip extends Pointer {
    constructor(options: {
        radius: number;
        layers: Layer | Layer[];
    });
    /** Set the map > start postcompose
     */
    setMap(): void;
    /** Set clip radius
     *	@param {number} radius
     */
    setRadius(radius: number): void;
    /** Add a layer to clip
     *	@param {layer|Array<layer>} layer to clip
     */
    addLayer(layer: Layer | Layer[]): void;
    /** Remove a layer to clip
     *	@param {layer|Array<layer>} layer to clip
     */
    removeLayer(layer: Layer | Layer[]): void;
    /** Set position of the clip
    *	@param {Pixel|MapBrowserEvent}
     */
    setPosition(e: Pixel | MapBrowserEvent): void;
    /**
     * Activate or deactivate the interaction.
     * @param {boolean} active Active.
     * @observable
     * @api
     */
    setActive(active: boolean): void;
}
