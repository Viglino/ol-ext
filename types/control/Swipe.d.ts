import { Map as _ol_Map_ } from 'ol';
import ol_control_Control from 'ol/control/Control';
import { Layer } from 'ol/layer';
/**
 * @classdesc Swipe Contr
 *
 * @constructor
 * @extends {contrControl}
 * @param {Object=} Control options.
 *	@param {layer} options.layers layer to swipe
 *	@param {layer} options.rightLayer layer to swipe on right side
 *	@param {string} options.className control class name
 *	@param {number} options.position position propertie of the swipe [0,1], default 0.5
 *	@param {string} options.orientation orientation propertie (vertical|horizontal), default vertical
 */
export class Swipe extends ol_control_Control {
    constructor(Control?: any);
    /**
     * Set the map instance the control associated with.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    /** Add a layer to clip
     *	@param {layer|Array<layer>} layer to clip
    *	@param {bool} add layer in the right part of the map, default left.
     */
    addLayer(layer: Layer | Layer[], add: boolean): void;
    /** Remove a layer to clip
     *	@param {layer|Array<layer>} layer to clip
     */
    removeLayer(layer: Layer | Layer[]): void;
}
