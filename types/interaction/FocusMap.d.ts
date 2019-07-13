import { Interaction } from 'ol/interaction';
/** An interaction to focus on the map on click. Usefull when using keyboard event on the map.
 * @constructor
 * @fires focus
 * @extends {Interaction}
 */
export class FocusMap extends Interaction {
    /** Set the map > add the focus button and focus on the map when pointerdown to enable keyboard events.
     */
    setMap(): void;
}
