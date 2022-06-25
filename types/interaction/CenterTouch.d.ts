export default ol_interaction_CenterTouch;
/** Handles coordinates on the center of the viewport.
 * It can be used as abstract base class used for creating subclasses.
 * The CenterTouch interaction modifies map browser event coordinate and pixel properties to force pointer on the viewport center to any interaction that them.
 * Only pointermove pointerup are concerned with it.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {ol_style_Style|Array<ol_style_Style>} options.targetStyle a style to draw the target point, default cross style
 *  @param {string} options.composite composite operation for the target : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
declare class ol_interaction_CenterTouch {
    constructor(options: any);
    _listener: {};
    ctouch: ol_interaction_Interaction;
    _target: ol_control_Target;
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
    setActive(b: any): void;
    pos_: any;
    /** Get the position of the target
     * @return {ol.coordinate}
     */
    getPosition(): ol.coordinate;
}
import ol_interaction_Interaction from "ol/interaction/Interaction";
import ol_control_Target from "../control/Target";
