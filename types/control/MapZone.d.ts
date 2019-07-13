import ol_control_Control from 'ol/control/Control';
import { Layer } from 'ol/layer';
import { ProjectionLike } from 'ol/proj';
/** A control to jump from one zone to another.
 *
 * @constructor
 * @fires select
 * @extends {contrControl}
 * @param {Object=} options Control options.
 *	@param {string} options.className class name
 *	@param {layer.Layer} options.layer layer to display in the control
 *	@param {ProjectionLike} options.projection projection of the control, Default is EPSG:3857 (Spherical Mercator).
 *  @param {Array<any>} options.zone an array of zone: { name, Extent (in EPSG:4326) }
 *  @param {bolean} options.centerOnClick center on click when click on zones, default true
 */
export class MapZone extends ol_control_Control {
    constructor(options?: {
        className: string;
        layer: Layer;
        projection: ProjectionLike;
        zone: any[];
        centerOnClick: boolean;
    });
    /** Set the control visibility
    * @param {boolean} b
     */
    setVisible(b: boolean): void;
    /** Pre-defined zones
     */
    static zones: any;
}
