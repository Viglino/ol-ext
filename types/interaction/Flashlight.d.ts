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
export class Flashlight extends Pointer {
    constructor(options: {
        color: Color;
        fill: Color;
        radius: number;
    });
    /** Set the map > start postcompose
     */
    setMap(): void;
    /** Set flashlight radius
     *	@param {number} radius
     */
    setRadius(radius: number): void;
    /** Set flashlight color
     *	@param {flashlight.options} flashlight options param
     *		- color {Color} light color, default transparent
     *		- fill {Color} fill color, default rgba(0,0,0,0.8)
     */
    setColor(options: {
        color: Color;
        fill: Color;
    }): void;
    /** Set position of the flashlight
    *	@param {Pixel|MapBrowserEvent}
     */
    setPosition(e: Pixel | MapBrowserEvent): void;
    /** Postcompose function
     */
    postcompose_(): void;
}
