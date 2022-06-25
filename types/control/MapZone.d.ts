export default ol_control_MapZone;
/** A control to jump from one zone to another.
 * @constructor
 * @fires select
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *	@param {string} options.className class name
 *  @param {Array<any>} options.zone an array of zone: { name, extent (in EPSG:4326) }
 *	@param {ol.layer.Layer|function} options.layer layer to display in the control or a function that takes a zone and returns a layer to add to the control
 *	@param {ol.ProjectionLike} options.projection projection of the control, Default is EPSG:3857 (Spherical Mercator).
 *  @param {bolean} options.centerOnClick center on click when a zone is clicked (or listen to 'select' event to do something), default true
 */
declare class ol_control_MapZone {
    constructor(options: any);
    _maps: any[];
    _projection: any;
    _layer: any;
    /** Collapse the control
     * @param {boolean} b
     */
    setCollapsed(b: boolean): void;
    /** Get control collapsed
     * @return {boolean}
     */
    getCollapsed(): boolean;
    /** Get associated maps
     * @return {ol.Map}
     */
    getMaps(): ol.Map;
    /** Get nb zone */
    getLength(): number;
    /** Add a new zone to the control
     * @param {Object} z
     *  @param {string} title
     *  @param {ol.extent} extent if map is not defined
     *  @param {ol.Map} map if map is defined use the map extent
     *  @param {ol.layer.Layer} [layer] layer of the zone, default use default control layer
     */
    addZone(z: any): void;
    /** Remove a zone from the control
     * @param {number} index
     */
    removeZone(index: number): void;
    /** Set the control visibility (collapsed)
     * @param {boolean} b
     * @deprecated use setCollapsed instead
     */
    setVisible: (b: boolean) => void;
}
declare namespace ol_control_MapZone {
    namespace zones {
        const DOM: {
            title: string;
            extent: number[];
        }[];
        const TOM: {
            title: string;
            extent: number[];
        }[];
        const DOMTOM: {
            title: string;
            extent: number[];
        }[];
    }
}
