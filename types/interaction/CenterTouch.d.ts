import { Map as _ol_Map_ } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Style } from 'ol/style';
import { Interaction } from 'ol/interaction';
/** User actions that change the state of the map. Some are similar to controls,
 * but are not associated with a DOM element.
 * @namespace interaction
 * @see {@link https://openlayers.org/en/master/apidoc/module-ol_interaction.html}
 */
/** Handles coordinates on the center of the viewport.
 * It can be used as abstract base class used for creating subclasses.
 * The CenterTouch interaction modifies map browser event coordinate and pixel properties to force pointer on the viewport center to any interaction that them.
 * Only pointermove pointerup are concerned with it.
 * @constructor
 * @extends {Interaction}
 * @param {olx.interaction.InteractionOptions} options Options
 *  - targetStyle {Style|Array<Style>} a style to draw the target point, default cross style
 *  - composite {string} composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
export class CenterTouch extends Interaction {
    constructor(options: {
        targetSTyle: Style | Style[];
        composite: string;
    });
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {_ol_Map_} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /**
     * Activate or deactivate the interaction.
     * @param {boolean} active Active.
     * @observable
     * @api
     */
    setActive(active: boolean): void;
    /** Get the position of the target
     * @return {Coordinate}
     */
    getPosition(): Coordinate;
}
