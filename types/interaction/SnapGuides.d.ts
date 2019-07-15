import { Map as _ol_Map_ } from 'ol';
import Collection from 'ol/Collection';
import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import { Style } from 'ol/style';
import { Interaction, Draw, Modify } from 'ol/interaction';
/** Interaction to snap to guidelines
 * @constructor
 * @extends {Interaction}
 * @param {olx.interaction.SnapGuidesOptions}
 *	- pixelTolerance {number | undefined} distance (in px) to snap to a guideline, default 10 px
 *  - enableInitialGuides {bool | undefined} whether to draw initial guidelines based on the maps orientation, default false.
 *	- style {Style | Array<Style> | undefined} Style for the sektch features.
 */
export class SnapGuides extends Interaction {
    constructor(options: {
        pixelTolerance: number;
        enableInitialGuides: boolean;
        style: Style | Style[] | undefined;
    });
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /** Activate or deactivate the interaction.
    * @param {boolean} active
     */
    setActive(active: boolean): void;
    /** Clear previous added guidelines
    * @param {Array<Feature> | undefined} features a list of feature to remove, default remove all feature
     */
    clearGuides(features: Feature[] | undefined): void;
    /** Get guidelines
    * @return {Collection} guidelines features
     */
    getGuides(): Collection<Feature>;
    /** Add a new guide to snap to
    * @param {Array<Coordinate>} v the direction vector
    * @return {Feature} feature guide
     */
    addGuide(v: Coordinate[]): Feature;
    /** Add a new orthogonal guide to snap to
    * @param {Array<Coordinate>} v the direction vector
    * @return {Feature} feature guide
     */
    addOrthoGuide(v: Coordinate[]): Feature;
    /** Listen to draw event to add orthogonal guidelines on the first and last point.
    * @param {_ol_interaction_Draw_} drawi a draw interaction to listen to
    * @api
     */
    setDrawInteraction(drawi: Draw): void;
    /** Listen to modify event to add orthogonal guidelines relative to the currently dragged point
    * @param {_ol_interaction_Modify_} modifyi a modify interaction to listen to
    * @api
     */
    setModifyInteraction(modifyi: Modify): void;
}
