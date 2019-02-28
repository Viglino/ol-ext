import ol_source_Vector from 'ol/source/Vector'

(function () {
  var clear = ol_source_Vector.prototype.clear;

  /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
   */
  ol_source_Vector.prototype.clear = function(opt_fast) {
    this.dispatchEvent({ type: 'clearstart' });
    clear.call(this, opt_fast)
    this.dispatchEvent({ type: 'clearend' });
  };
})();
