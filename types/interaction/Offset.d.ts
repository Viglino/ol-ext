import { Map as _ol_Map_ } from 'ol';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { Vector } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Pointer } from 'ol/interaction';
/** Offset interaction for offseting feature geometry
 * @constructor
 * @extends {interaction.Pointer}
 * @fires offsetstart
 * @fires offsetting
 * @fires offsetend
 * @param {any} options
 *	@param {layer.Vector | Array<layer.Vector>} options.layers list of feature to transform
 *	@param {Collection.<Feature>} options.features collection of feature to transform
 *	@param {VectorSource | undefined} options.source source to duplicate feature when ctrl key is down
 *	@param {boolean} options.duplicate force feature to duplicate (source must be set)
 */
export class Offset extends Pointer {
    constructor(options: {
        layers: Vector | Vector[];
        features: Collection<Feature>;
        source: VectorSource | undefined;
        duplicate: boolean;
    });
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
}
