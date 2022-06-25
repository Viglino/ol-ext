export default ol_matrix3D;
declare namespace ol_matrix3D {
    /** Get transform matrix3D of an element
     * @param {Element} ele
     * @return {Array<Array<number>>}
     */
    function getTransform(ele: Element): number[][];
    /** Get transform matrix3D of an element
     * @param {Element} ele
     * @return {Array<number>}
     */
    function getTransformOrigin(ele: Element): number[];
    /** Compute translate matrix
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {Array<Array<number>>}
     */
    function translateMatrix(x: number, y: number, z: number): number[][];
    /** Identity matrix
     * @return {Array<Array<number>>}
     */
    function identity(): number[][];
    /** Round matrix
     * @param {Array<Array<number>>} mx
     * @param {number} round Rounding value, default 1E-10
     */
    function roundTo(mx: number[][], round: number): any[][];
    /** Multiply matrix3D
     * @param {Array<Array<number>>} mx1
     * @param {Array<Array<number>>} mx2
     * @return {Array<Array<number>>}
     */
    function multiply(mx1: number[][], mx2: number[][]): number[][];
    /** Compute the full transform that is applied to the transformed parent: -origin o tx o origin
     * @param {Array<Array<number>>} tx transform matrix
     * @param {Array<Array<number>>} origin transform origin
     * @return {Array<Array<number>>}
     */
    function computeTransformMatrix(tx: number[][], origin: number[][]): number[][];
    /** Apply transform to a coordinate
     * @param {Array<Array<number>>} tx
     * @param {ol.pixel} px
     */
    function transformVertex(tx: number[][], px: ol.pixel): number[];
    /** Perform the homogeneous divide to apply perspective to the points (divide x,y,z by the w component).
     * @param {Array<number>} vert
     * @return {Array<number>}
     */
    function projectVertex(vert: number[]): number[];
    /** Inverse a matrix3D
     * @return {Array<Array<number>>} m matrix to transform
     * @return {Array<Array<number>>}
     */
    function inverse(m: any): number[][];
}
