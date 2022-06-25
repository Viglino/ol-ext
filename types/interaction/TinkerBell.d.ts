export default ol_interaction_TinkerBell;
/**
 * @constructor
 * @extends {ol_interaction_Pointer}
 *	@param {ol_interaction_TinkerBell.options}  options flashlight param
*		- color {ol_color} color of the sparkles
*/
declare class ol_interaction_TinkerBell {
    constructor(options: any);
    sparkle: number[];
    sparkles: any[];
    lastSparkle: Date;
    time: Date;
    out_: () => void;
    isout_: boolean;
    /** Set the map > start postcompose
    */
    setMap(map: any): void;
    _listener: any;
    onMove(e: any): void;
    /** Postcompose function
    */
    postcompose_(e: any): void;
}
