export default ol_control_Globe;
/**
 * OpenLayers 3 lobe Overview Control.
 * The globe can rotate with map (follow.)
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * 	@param {boolean} follow follow the map when center change, default false
 * 	@param {top|bottom-left|right} align position as top-left, etc.
 * 	@param {Array<ol.layer>} layers list of layers to display on the globe
 * 	@param {ol.style.Style | Array.<ol.style.Style> | undefined} style style to draw the position on the map , default a marker
 */
declare class ol_control_Globe {
    constructor(opt_options: any);
    panel_: any;
    pointer_: HTMLDivElement;
    ovmap_: ol_Map;
    extentLayer: ol_layer_Vector<ol_source_Vector<import("ol/geom/Geometry").default>>;
    /**
     * Set the map instance the control associated with.
     * @param {ol.Map} map The map instance.
     */
    setMap(map: ol.Map): void;
    _listener: any;
    /** Set the globe center with the map center
    */
    setView(): void;
    /** Get globe map
    *	@return {ol_Map}
    */
    getGlobe(): ol_Map;
    /** Show/hide the globe
    */
    show(b: any): void;
    /** Set position on the map
    *	@param {top|bottom-left|right}  align
    */
    setPosition(align: any): void;
    /** Set the globe center
    * @param {_ol_coordinate_} center the point to center to
    * @param {boolean} show show a pointer on the map, defaylt true
    */
    setCenter(center: _ol_coordinate_, show: boolean): void;
}
import ol_Map from "ol/Map";
import ol_source_Vector from "ol/source/Vector";
import ol_layer_Vector from "ol/layer/Vector";
