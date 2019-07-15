import { Map as _ol_Map_ } from 'ol';
import { Interaction } from 'ol/interaction';
/** Undo/redo interaction
 * @constructor
 * @extends {Interaction}
 * @fires undo
 * @fires redo
 * @param {*} options
 */
export class UndoRedo extends Interaction {
    constructor(options: any);
    /** Add a custom undo/redo
     * @param {string} action the action key name
     * @param {function} undoFn function called when undoing
     * @param {function} redoFn function called when redoing
     * @api
     */
    define(action: string, undoFn: (...params: any[]) => any, redoFn: (...params: any[]) => any): void;
    /** Set a custom undo/redo
     * @param {string} action the action key name
     * @param {any} prop an object that will be passed in the undo/redo fucntions of the action
     * @return {boolean} true if the action is defined
     */
    push(action: string, prop: any): boolean;
    /** Activate or deactivate the interaction, ie. records or not events on the map.
     * @param {boolean} active
     * @api stable
     */
    setActive(active: boolean): void;
    /**
     * Remove the interaction from its current map, if any, and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /** A feature is added / removed
     */
    _onAddRemove(): void;
    /** Start an undo block
     * @api
     */
    blockStart(): void;
    /** End an undo block
     * @api
     */
    blockEnd(): void;
    /** Undo last operation
     * @api
     */
    undo(): void;
    /** Redo last operation
     * @api
     */
    redo(): void;
    /** Clear undo stack
     * @api
     */
    clear(): void;
    /** Check if undo is avaliable
     * @return {number} the number of undo
     * @api
     */
    hasUndo(): number;
    /** Check if redo is avaliable
     * @return {number} the number of redo
     * @api
     */
    hasRedo(): number;
}
