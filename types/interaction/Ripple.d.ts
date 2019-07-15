import { Pointer } from 'ol/interaction';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Color } from 'ol/color';
import { Pixel } from 'ol/pixel';
/**
     * @constructor
     * @extends {interaction.Pointer}
     *	@param {flashlight.options} flashlight options param
     *		- color {Color} light color, default transparent
     *		- fill {Color} fill color, default rgba(0,0,0,0.8)
     *		- radius {number} radius of the flash
     */
export class Ripple extends Pointer {
    constructor(options: {
        color: Color;
    });
    /** Set the map > start postcompose
     */
    setMap(): void;
    /** Generate random rain drop
    *	@param {number} interval
     */
    rains(interval: number): void;
    /** Disturb water at specified point
    *	@param {Pixel|MapBrowserEvent}
     */
    rainDrop(e: Pixel | MapBrowserEvent): void;
    /** Postcompose function
     */
    postcompose_(): void;
}
