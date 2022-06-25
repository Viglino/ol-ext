export default ol_interaction_UndoRedo;
/** Undo/redo interaction
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires undo
 * @fires redo
 * @fires change:add
 * @fires change:remove
 * @fires change:clear
 * @param {Object} options
 *  @param {number=} options.maxLength max undo stack length (0=Infinity), default Infinity
 *  @param {Array<ol.Layer>} options.layers array of layers to undo/redo
 */
declare class ol_interaction_UndoRedo {
    constructor(options: any);
    _layers: any;
    _undoStack: ol_Collection<any>;
    _redoStack: ol_Collection<any>;
    _undo: any[];
    _redo: any[];
    _block: number;
    _level: number;
    _doShift: boolean;
    _record: boolean;
    _defs: {};
    /** Add a custom undo/redo
     * @param {string} action the action key name
     * @param {function} undoFn function called when undoing
     * @param {function} redoFn function called when redoing
     * @api
     */
    define(action: string, undoFn: Function, redoFn: Function): void;
    /** Get first level undo / redo length
     * @param {string} [type] get redo stack length, default get undo
     * @return {number}
     */
    length(type?: string): number;
    /** Set undo stack max length
     * @param {number} length
     */
    setMaxLength(length: number): void;
    /** Get undo / redo size (includes all block levels)
     * @param {string} [type] get redo stack length, default get undo
     * @return {number}
     */
    size(type?: string): number;
    /** Set undo stack max size
     * @param {number} size
     */
    setMaxSize(size: number): void;
    /** Reduce stack: shift undo to set size
     * @private
     */
    private _reduce;
    /** Get first level undo / redo first level stack
     * @param {string} [type] get redo stack, default get undo
     * @return {Array<*>}
     */
    getStack(type?: string): Array<any>;
    /** Add a new custom undo/redo
     * @param {string} action the action key name
     * @param {any} prop an object that will be passed in the undo/redo functions of the action
     * @param {string} name action name
     * @return {boolean} true if the action is defined
     */
    push(action: string, prop: any, name: string): boolean;
    /** Remove undo action from the beginning of the stack.
     * The action is not returned.
     */
    shift(): void;
    /** Activate or deactivate the interaction, ie. records or not events on the map.
     * @param {boolean} active
     * @api stable
     */
    setActive(active: boolean): void;
    /**
     * Remove the interaction from its current map, if any, and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    _mapListener: any[];
    /** Watch for changes in the map sources
     * @private
     */
    private _watchSources;
    _sourceListener: any[];
    /** Watch for interactions
     * @private
     */
    private _watchInteractions;
    _interactionListener: any[];
    /** A feature is added / removed
     */
    _onAddRemove(e: any): void;
    /** Perform an interaction
     * @private
     */
    private _onInteraction;
    /** Start an undo block
     * @param {string} [name] name f the action
     * @api
     */
    blockStart(name?: string): void;
    /** End an undo block
     * @api
     */
    blockEnd(): void;
    /** handle undo/redo
     * @private
     */
    private _handleDo;
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
    _doClear: boolean;
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
declare namespace ol_interaction_UndoRedo { }
import ol_Collection from "ol/Collection";
