export default ol_control_Overview;
/**
 * OpenLayers 3 Layer Overview Control.
 * The overview can rotate with map.
 * Zoom levels are configurable.
 * Click on the overview will center the map.
 * Change width/height of the overview trough css.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *  @param {ol.ProjectionLike} options.projection The projection. Default is EPSG:3857 (Spherical Mercator).
 *  @param {Number} options.minZoom default 0
 *  @param {Number} options.maxZoom default 18
 *  @param {boolean} options.rotation enable rotation, default false
 *  @param {top|bottom-left|right} options.align position
 *  @param {Array<ol.layer>} options.layers list of layers
 *  @param {ol.style.Style | Array.<ol.style.Style> | undefined} options.style style to draw the map extent on the overveiw
 *  @param {bool|elastic} options.panAnimation use animation to center map on click, default true
 */
declare class ol_control_Overview {
    constructor(options: any);
    minZoom: any;
    maxZoom: any;
    rotation: any;
    panel_: any;
    ovmap_: ol_Map;
    oview_: ol_View;
    extentLayer: ol_layer_Vector<ol_source_Vector<import("ol/geom/Geometry").default>>;
    /** Get overview map
    *	@return {ol.Map}
    */
    getOverviewMap(): ol.Map;
    /** Toggle overview map
    */
    toggleMap(): void;
    /** Set overview map position
    *	@param {top|bottom-left|right}
    */
    setPosition(align: any): void;
    /**
     * Set the map instance the control associated with.
     * @param {ol.Map} map The map instance.
     */
    setMap(map: ol.Map): void;
    _listener: {};
    /** Calculate the extent of the map and draw it on the overview
    */
    calcExtent_(extent: any): void;
    /**
    *	@private
    */
    private setView;
}
import ol_Map from "ol/Map";
import ol_View from "ol/View";
import ol_source_Vector from "ol/source/Vector";
import ol_layer_Vector from "ol/layer/Vector";
