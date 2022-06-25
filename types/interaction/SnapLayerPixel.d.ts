export default ol_interaction_SnapLayerPixel;
/** An interaction to snap on pixel on a layer
 * The CenterTouch interaction modifies map browser event coordinate and pixel properties to force pointer on the viewport center to any interaction that them.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {ol.layer.Layer} options.layer layer to snap on
 */
declare class ol_interaction_SnapLayerPixel {
    constructor(options: any);
    _layer: any;
}
