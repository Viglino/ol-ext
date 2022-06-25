export default ol_control_Cloud;
/** ol_control_Cloud adds an old map effect on a canvas renderer.
* It colors the map, adds a parchment texture and compass onto the map.
* @constructor
* @param {Object} options
*	@param {_ol_color_} options.hue color to set hue of the map, default #963
*	@param {Number} options.saturation saturation of the hue color, default 0.6
*	@param {Number} options.opacity opacity of the overimpose image, default 0.7
* @todo add effects on pan / zoom change
*/
declare class ol_control_Cloud {
    constructor(options: any);
    cloud: any;
    bird: any;
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {_ol_Map_} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    _listener: any;
    /** Set wind direction / force
    */
    setWind(options: any): void;
    wind: {
        angle: any;
        cos: number;
        sin: number;
        speed: any;
    };
    /**
    *	@private
    */
    private drawCloud_;
    particules: any[];
    width: any;
    height: any;
    birds: any[];
}
