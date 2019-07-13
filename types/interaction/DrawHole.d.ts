import { Map as _ol_Map_ } from 'ol';
import Feature from 'ol/Feature';
import { Vector } from 'ol/layer';
import { StyleLike } from 'ol/style/Style';
import { Interaction } from 'ol/interaction';
/** Interaction to draw holes in a polygon.
 * It fires a drawstart, drawend event when drawing the hole
 * and a modifystart, modifyend event before and after inserting the hole in the feature geometry.
 * @constructor
 * @extends {Interaction}
 * @fires drawstart
 * @fires drawend
 * @fires modifystart
 * @fires modifyend
 * @param {olx.interaction.DrawHoleOptions} options extend olx.interaction.DrawOptions
 * 	@param {Array<layer.Vector> | function | undefined} options.layers A list of layers from which polygons should be selected. Alternatively, a filter function can be provided. default: all visible layers
 * 	@param { Style | Array<Style> | StyleFunction | undefined }	Style for the selected features, default: default edit style
 */
export class DrawHole extends Interaction {
    constructor(options: {
        layers: Vector[] | ((...params: any[]) => any) | undefined;
    }, Style: StyleLike);
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /**
     * Activate/deactivate the interaction
     * @param {boolean}
     * @api stable
     */
    setActive(b: boolean): void;
    /**
     * Remove last point of the feature currently being drawn
     * (test if points to remove before).
     */
    removeLastPoint(): void;
    /**
     * Get the current polygon to hole
     * @return {Feature}
     */
    getPolygon(): Feature;
}
