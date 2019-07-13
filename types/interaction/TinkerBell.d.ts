import { Pointer } from 'ol/interaction';
import { Color } from 'ol/color';
/**
 * @constructor
 * @extends {interaction.Pointer}
 *	@param {interaction.TinkerBell.options}  options flashlight param
 *		- color {color} color of the sparkles
 */
export class TinkerBell extends Pointer {
    constructor(options: {
        color: Color;
    });
    /** Set the map > start postcompose
     */
    setMap(): void;
    /** Postcompose function
     */
    postcompose_(): void;
}
