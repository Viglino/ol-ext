//TODO: rewrite WSynchro module and export
/** WSynchro object to synchronize windows
*	- windows: array of windows to synchro (
*	- source: the window source (undefined if first window)
*/
if (!window.WSynchro) {
  var WSynchro = { windows: [] };
  alert ('noSynch')
}
/** Open a new window to synchronize
*	@param {url|undefined} url to open, default current window url
*	@param {specs|undefined|null} specs (as for window.open), undefined to open in a new window, null to open in a new tab, default new window
*/
WSynchro.open = function (href, specs) {
  var w = window.open (href || window.location.href, "_blank", typeof(specs)=="undefined"? "location=1,menubar=1,toolbar=1,scrollbars=1" : specs);
  if (!w.WSynchro) {
    w.WSynchro = { windows: [ window ], source:window };
  } else {
    w.WSynchro.windows = [ window ];
    w.WSynchro.source = window;
  }
  this.windows.push(w);
}
/**	Trigger function 
*	@param {synchronize} 
*	@param {function} synchronize function
*/
WSynchro.on = function (e, syncFn) {
  if (!this.syncFn_) this.syncFn_ = [];
  if (e==='synchronize') this.syncFn_.push(syncFn);
}
/**	Synchronize windows
*	@param {Object|undefined} if undefined stop synchro (when the window is synchronize)
*/
WSynchro.synchronize = function(params) {
  this.synchronize_ (params);
}
/**	Synchronize windows: 
*	@param {Array} array of arguments to use with fn
*	@param {} internal syncrho time to avoid stnchro loops
*	@private
*/
WSynchro.synchronize_ = function(args, sync) {
  var i;
  // Stop condition 
  if (!sync) {
    if (this.synchronizing) sync = this.sync;
    else this.sync = sync = (new Date()).getTime();
    this.synchronizing = false;
  } else {
    // Don't synchronize twice
    if (sync == this.sync) return;
    this.sync = sync;
    this.synchronizing = true;
    try {
      if (WSynchro.syncFn_) {
        args.type = "synchronize";
        for (i=0; i<WSynchro.syncFn_.length; i++) {
          WSynchro.syncFn_[i].apply (null, [args]);
        }
      }
    } catch(e) { /* */ }
  }
  if (args) {
    for (i=0; i<this.windows.length; i++){
      try {
        this.windows[i].WSynchro.synchronize_(args, sync); 
      } catch(e) { /* */ }
    }
  }
}
