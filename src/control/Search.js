/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'

import ol_ext_element from '../util/element'

/**
 * Search Control.
 * This is the base class for search controls. You can use it for simple custom search or as base to new class.
 * @see ol_control_SearchFeature
 * @see ol_control_SearchPhoton
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @fires change:input
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.title Title to use for the search button tooltip, default "Search"
 *  @param {string | undefined} options.reverseTitle Title to use for the reverse geocoding button tooltip, default "Click on the map..."
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {boolean | undefined} options.reverse enable reverse geocoding, default false
 *  @param {string | undefined} options.inputLabel label for the input, default none
 *  @param {string | undefined} options.collapsed search is collapsed on start, default true
 *  @param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 1
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {integer | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
 *  @param {function} options.getTitle a function that takes a feature and return the name to display in the index.
 *  @param {function} options.autocomplete a function that take a search string and callback function to send an array
 *  @param {function} options.onselect a function called when a search is selected
 *  @param {boolean} options.centerOnSelect center map on search, default false
 *  @param {number|boolean} options.zoomOnSelect center map on search and zoom to value if zoom < value, default false
 */
var ol_control_Search = function(options) {
  var self = this;
  if (!options) options = {};
  if (options.typing == undefined) options.typing = 300;

  // Class name for history
  this._classname = options.className || 'search';

  var classNames = (options.className||'')+ ' ol-search'
    + (options.target ? '' : ' ol-unselectable ol-control');
  var element = ol_ext_element.create('DIV',{
    className: classNames 
  })
  if (options.collapsed!==false) element.classList.add('ol-collapsed');
  if (!options.target) {
    this.button = document.createElement('BUTTON');
    this.button.setAttribute('type', 'button');
    this.button.setAttribute('title', options.title || options.label || 'Search');
    this.button.addEventListener('click', function() {
      element.classList.toggle('ol-collapsed');
      if (!element.classList.contains('ol-collapsed')) {
        element.querySelector('input.search').focus();
        var listElements = element.querySelectorAll('li');
        for (var i = 0; i < listElements.length; i++) {
          listElements[i].classList.remove('select');
        }
        // Display history
        if (!input.value) {
          self.drawList_();
        }
      }
    });
    element.appendChild(this.button);
  }

  // Input label
  if (options.inputLabel) {
    var label = document.createElement("LABEL");
    label.innerText = options.inputLabel;
    element.appendChild(label);
  }
  // Search input
  var tout, cur="";
  var input = this._input = document.createElement("INPUT");
  input.setAttribute("type", "search");
  input.setAttribute("class", "search");
  input.setAttribute("autocomplete", "off");
  input.setAttribute("placeholder", options.placeholder||"Search...");
  input.addEventListener("change", function(e) {
    self.dispatchEvent({ type:"change:input", input:e, value:input.value });
  });
  var doSearch = function(e) {
    // console.log(e.type+" "+e.key)'
    var li  = element.querySelector("ul.autocomplete li.select");
    var	val = input.value;
    // move up/down
    if (e.key=='ArrowDown' || e.key=='ArrowUp' || e.key=='Down' || e.key=='Up') {
      if (li) {
        li.classList.remove("select");
        li = (/Down/.test(e.key)) ? li.nextElementSibling : li.previousElementSibling;
        if (li) li.classList.add("select");
      }
      else element.querySelector("ul.autocomplete li").classList.add("select");
    }
    // Clear input
    else if (e.type=='input' && !val) {
      setTimeout(function(){
        self.drawList_();
      }, 200);
    }
    // Select in the list
    else if (li && (e.type=="search" || e.key =="Enter")) {
      if (element.classList.contains("ol-control")) input.blur();
      li.classList.remove("select");
      cur = val;
      self._handleSelect(self._list[li.getAttribute("data-search")]);
    }
    // Search / autocomplete
    else if ( (e.type=="search" || e.key =='Enter')
      || (cur!=val && options.typing>=0)) {
      // current search
      cur = val;
      if (cur) {
        // prevent searching on each typing
        if (tout) clearTimeout(tout);
        var minLength = self.get("minLength");
        tout = setTimeout(function() {
          if (cur.length >= minLength) {
            var s = self.autocomplete (cur, function(auto) { self.drawList_(auto); });
            if (s) self.drawList_(s);
          }
          else self.drawList_();
        }, options.typing);
      }
      else self.drawList_();
    }
    // Clear list selection
    else {
      li = element.querySelector("ul.autocomplete li");
      if (li) li.classList.remove('select');
    }
  };
  input.addEventListener("keyup", doSearch);
  input.addEventListener("search", doSearch);
  input.addEventListener("cut", doSearch);
  input.addEventListener("paste", doSearch);
  input.addEventListener("input", doSearch);
  if (!options.noCollapse) {
    input.addEventListener('blur', function() {
      setTimeout(function(){ 
        if (input !== document.activeElement) {
          element.classList.add('ol-collapsed');
          this.set('reverse', false);
          element.classList.remove('ol-revers');
        }
      }.bind(this), 200);
    }.bind(this));
    input.addEventListener('focus', function() {
      if (!this.get('reverse')) {
        element.classList.remove('ol-collapsed');
        element.classList.remove('ol-revers');
      }
    }.bind(this));
  }
  element.appendChild(input);
  // Reverse geocode
  if (options.reverse) {
    var reverse = ol_ext_element.create('BUTTON', {
      type: 'button',
      class: 'ol-revers',
      title: options.reverseTitle || 'click on the map',
      click: function() {
        if (!this.get('reverse')) {
          this.set('reverse', !this.get('reverse'));
          input.focus();
          element.classList.add('ol-revers');
        } else {
          this.set('reverse', false);
        }
      }.bind(this)
    });
    element.appendChild(reverse);
  }
  // Autocomplete list
  var ul = document.createElement('UL');
  ul.classList.add('autocomplete');
  element.appendChild(ul);

  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });

  if (typeof (options.getTitle)=='function') this.getTitle = options.getTitle;
  if (typeof (options.autocomplete)=='function') this.autocomplete = options.autocomplete;

  // Options
  this.set('copy', options.copy);
  this.set('minLength', options.minLength || 1);
  this.set('maxItems', options.maxItems || 10);
  this.set('maxHistory', options.maxHistory || options.maxItems || 10);

  // Select
  if (options.onselect) this.on('select', options.onselect);
  // Center on select
  if (options.centerOnSelect) this.on('select', function(e) {
    var map = this.getMap();
    if (map) {
      map.getView().setCenter(e.coordinate);
    }
  }.bind(this));
  // Zoom on select
  if (options.zoomOnSelect) this.on('select', function(e) {
    var map = this.getMap();
    if (map) {
      map.getView().setCenter(e.coordinate);
      if (map.getView().getZoom() < options.zoomOnSelect) map.getView().setZoom(options.zoomOnSelect);
    }
  }.bind(this));

  // History
  this.restoreHistory();
  this.drawList_();
};
ol_ext_inherits(ol_control_Search, ol_control_Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_control_Search.prototype.setMap = function (map) {
  if (this._listener) ol_Observable_unByKey(this._listener);
	this._listener = null;

  ol_control_Control.prototype.setMap.call(this, map);

  if (map) {
		this._listener = map.on('click', this._handleClick.bind(this));
	}
};

/** Collapse the search
 * @param {boolean} [b=true]
 * @api
 */
ol_control_Search.prototype.collapse = function (b) {
  if (b===false) this.element.classList.remove('ol-collapsed')
  else this.element.classList.add('ol-collapsed')
};

/** Get the input field
*	@return {Element} 
*	@api
*/
ol_control_Search.prototype.getInputField = function () {
  return this._input;
};

/** Returns the text to be displayed in the menu
 *	@param {any} f feature to be displayed
 *	@return {string} the text to be displayed in the index, default f.name
 *	@api
 */
ol_control_Search.prototype.getTitle = function (f) {
  return f.name || "No title";
};


/** Returns title as text
 *	@param {any} f feature to be displayed
 *	@return {string} 
 *	@api
 */
ol_control_Search.prototype._getTitleTxt = function (f) {
  return ol_ext_element.create('DIV', {
    html: this.getTitle(f)
  }).innerText;
};

/** Force search to refresh
 */
ol_control_Search.prototype.search = function () {
  var search = this.element.querySelector("input.search");
  this._triggerCustomEvent('search', search);
};

/** Reverse geocode
 * @param {Object} event
 *  @param {ol.coordinate} event.coordinate
 * @private
 */
ol_control_Search.prototype._handleClick = function (e) {
  if (this.get('reverse')) {
    document.activeElement.blur();
    this.reverseGeocode(e.coordinate);
  }
};

/** Reverse geocode
 * @param {ol.coordinate} coord
 * @param {function | undefined} cback a callback function, default trigger a select event
 * @api
 */
ol_control_Search.prototype.reverseGeocode = function (/*coord, cback*/) {
  // this._handleSelect(f);
};

/** Trigger custom event on elemebt
 * @param {*} eventName 
 * @param {*} element 
 * @private
 */
ol_control_Search.prototype._triggerCustomEvent = function (eventName, element) {
  ol_ext_element.dispatchEvent(eventName, element);
};

/** Set the input value in the form (for initialisation purpose)
*	@param {string} value
*	@param {boolean} search to start a search
*	@api
*/
ol_control_Search.prototype.setInput = function (value, search) {
  var input = this.element.querySelector("input.search");
  input.value = value;
  if (search) this._triggerCustomEvent("keyup", input);
};

/** A line has been clicked in the menu > dispatch event
 * @param {any} f the feature, as passed in the autocomplete
 * @param {boolean} reverse true if reverse geocode
 * @param {ol.coordinate} coord
 * @param {*} options options passed to the event
 *	@api
 */
ol_control_Search.prototype.select = function (f, reverse, coord, options) {
  var event = { type:"select", search:f, reverse: !!reverse, coordinate: coord };
  if (options) {
    for (var i in options) {
      event[i] = options[i];
    }
  }
  this.dispatchEvent(event);
};

/**
 * Save history and select
 * @param {*} f 
 * @param {boolean} reverse true if reverse geocode
 * @param {*} options options send in the event 
 * @private
 */
ol_control_Search.prototype._handleSelect = function (f, reverse, options) {
  if (!f) return;
  // Save input in history
  var hist = this.get('history');
  // Prevent error on stringify
  var i;
  try {
    var fstr = JSON.stringify(f);
    for (i=hist.length-1; i>=0; i--) {
      if (!hist[i] || JSON.stringify(hist[i]) === fstr) {
        hist.splice(i,1);
      }
    }
  } catch (e) {
    for (i=hist.length-1; i>=0; i--) {
      if (hist[i] === f) {
        hist.splice(i,1);
      }
    }
  }
  hist.unshift(f);
  var size = Math.max(0, this.get('maxHistory')||10) || 0;
  while (hist.length > size) {
    hist.pop();
  } 
  this.saveHistory();
  // Select feature
  this.select(f, reverse, null, options);
  if (reverse) {
    this.setInput(this._getTitleTxt(f));
    this.drawList_();
    setTimeout(function() { this.collapse(false); }.bind(this), 300);
  }
};

/** Current history */
ol_control_Search.prototype._history = {};

/** Save history (in the localstorage)
 */
ol_control_Search.prototype.saveHistory = function () {
  try {
    if (this.get('maxHistory')>=0) {
      localStorage["ol@search-"+this._classname] = JSON.stringify(this.get('history'));
    } else {
      localStorage.removeItem("ol@search-"+this._classname);
    }
  } catch(e) { console.warn('Failed to access localStorage...'); }
};

/** Restore history (from the localstorage) 
 */
ol_control_Search.prototype.restoreHistory = function () {
  if (this._history[this._classname]) {
    this.set('history', this._history[this._classname]);
  } else {
    try {
      this._history[this._classname] = JSON.parse(localStorage["ol@search-"+this._classname]);
      this.set('history', this._history[this._classname]);
    } catch(e) {
      this.set('history', []);
    }
  }
};

/**
 * Remove previous history
 */
ol_control_Search.prototype.clearHistory = function () {
  this.set('history', []);
  this.saveHistory();
  this.drawList_();
};

/**
 * Get history table
 */
ol_control_Search.prototype.getHistory = function () {
  return this.get('history');
};

/** Autocomplete function
* @param {string} s search string
* @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
* @return {Array|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
* @api
*/
ol_control_Search.prototype.autocomplete = function (s, cback) {
  cback ([]);
  return false;
  // or just return [];
};

/** Draw the list
* @param {Array} auto an array of search result
* @private
*/
ol_control_Search.prototype.drawList_ = function (auto) {
  var self = this;
  var ul = this.element.querySelector("ul.autocomplete");
  ul.innerHTML = '';
  this._list = [];
  if (!auto) {
    var input = this.element.querySelector("input.search");
    var value = input.value;
    if (!value) {
      auto = this.get('history');
    } else {
      return;
    }
    ul.setAttribute('class', 'autocomplete history');
  } else {
    ul.setAttribute('class', 'autocomplete');
  }
  var li, max = Math.min (self.get("maxItems"),auto.length);
  for (var i=0; i<max; i++) {	
    if (auto[i]) {
      if (!i || !self.equalFeatures(auto[i], auto[i-1])) {
        li = document.createElement("LI");
        li.setAttribute("data-search", this._list.length);
        this._list.push(auto[i]);
        li.addEventListener("click", function(e) {
          self._handleSelect(self._list[e.currentTarget.getAttribute("data-search")]);
        });
        var title = self.getTitle(auto[i]);
        if (title instanceof Element) li.appendChild(title);
        else li.innerHTML = title;
        ul.appendChild(li);
      }
    }
  }
  if (max && this.get("copy")) {
    li = document.createElement("LI");
    li.classList.add("copy");
    li.innerHTML = this.get("copy");
    ul.appendChild(li);
  }
};

/** Test if 2 features are equal
 * @param {any} f1
 * @param {any} f2
 * @return {boolean}
 */
ol_control_Search.prototype.equalFeatures = function (/* f1, f2 */) {
  return false;
};

export default ol_control_Search
