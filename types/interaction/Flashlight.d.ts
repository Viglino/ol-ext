export default ol_interaction_Flashlight;
/**
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {ol.flashlight.options} flashlight options param
 *	@param {ol.Color} options.color light color, default transparent
 *  @param {ol.Color} options.fill fill color, default rgba(0,0,0,0.8)
 *  @param {number} options.radius radius of the flash
 */
declare class ol_interaction_Flashlight {
    constructor(options: any);
    pos: boolean;
    radius: any;
    /** Set the map > start postcompose
    */
    setMap(map: any): void;
    _listener: any;
    /** Set flashlight radius
     *	@param {integer} radius
    */
    setRadius(radius: integer): void;
    /** Set flashlight color
     *	@param {ol.flashlight.options} flashlight options param
    *		- color {ol.Color} light color, default transparent
    *		- fill {ol.Color} fill color, default rgba(0,0,0,0.8)
    */
    setColor(options: any): void;
    startColor: string;
    endColor: string;
    midColor: string;
    /** Set position of the flashlight
    *	@param {ol.Pixel|ol.MapBrowserEvent}
    */
    setPosition(e: any): void;
    /** Postcompose function
    */
    postcompose_(e: any): void;
}
