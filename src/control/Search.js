/*	Copyright (c) 2017 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol from 'ol'
import ol_control_Control from 'ol/control/control'

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
 *	@param {string} options.className control class name
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {string | undefined} options.inputLabel label for the input, default none
 *	@param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *	@param {integer | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index.
 *	@param {function} options.autocomplete a function that take a search string and callback function to send an array
 */
var ol_control_Search = function(options) {
  var self = this;
	if (!options) options = {};
	if (options.typing == undefined) options.typing = 300;

  // Class name for history
  this._classname = options.className || 'search';

	var element = document.createElement("DIV");
	var classNames = (options.className||"")+ " ol-search";
	if (!options.target) {
    classNames += " ol-unselectable ol-control ol-collapsed";
		this.button = document.createElement("BUTTON");
		this.button.setAttribute("type", "button");
		this.button.setAttribute("title", options.label||"search");
		this.button.addEventListener("click", function() {
      element.classList.toggle("ol-collapsed");
      if (!element.classList.contains("ol-collapsed")) {
        element.querySelector("input.search").focus();
        var listElements = element.querySelectorAll("li");
        for (var i = 0; i < listElements.length; i++) {
          listElements[i].classList.remove("select");
        }
        // Display history
        if (!input.value) {
          self.drawList_();
        }
      }
    });
		element.appendChild(this.button);
	}
	element.setAttribute('class', classNames);

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
      self.drawList_();
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
				tout = setTimeout(function() {
          if (cur.length >= self.get("minLength")) {
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
      var li = element.querySelector("ul.autocomplete li");
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
			setTimeout(function(){ element.classList.add('ol-collapsed') }, 200);
		});
		input.addEventListener('focus', function() {
			element.classList.remove('ol-collapsed');
		});
	}
	element.appendChild(input);
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
	this.set('minLength', options.minLength || 1);
  this.set('maxItems', options.maxItems || 10);
  this.set('maxHistory', options.maxHistory || options.maxItems || 10);
  // History
	this.restoreHistory();
	this.drawList_();
};
ol.inherits(ol_control_Search, ol_control_Control);

/** Returns the text to be displayed in the menu
*	@param {any} f feature to be displayed
*	@return {string} the text to be displayed in the index, default f.name
*	@api
*/
ol_control_Search.prototype.getTitle = function (f) {
  return f.name || "No title";
};

/** Force search to refresh
 */
ol_control_Search.prototype.search = function () {
  var search = this.element.querySelector("input.search");
	this._triggerCustomEvent('search', search);
};

/** Trigger custom event on elemebt
 * @param {*} eventName 
 * @param {*} element 
 * @private
 */
ol_control_Search.prototype._triggerCustomEvent = function (eventName, element) {
  var event;
	if (window.CustomEvent) {
    event = new CustomEvent(eventName);
	} else {
    event = document.createEvent("CustomEvent");
		event.initCustomEvent(eventName, true, true, {});
	}
	element.dispatchEvent(event);
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

/** A ligne has been clicked in the menu > dispatch event
*	@param {any} f the feature, as passed in the autocomplete
*	@api
*/
ol_control_Search.prototype.select = function (f) {
  this.dispatchEvent({ type:"select", search:f });
};

/**
 * Save history and select
 * @param {*} f 
 * @private
 */
ol_control_Search.prototype._handleSelect = function (f) {
	if (!f) return;
  // Save input in history
  var hist = this.get('history');
  // Prevent error on stringify
  try {
    var fstr = JSON.stringify(f);
    for (var i=hist.length-1; i>=0; i--) {
      if (!hist[i] || JSON.stringify(hist[i]) === fstr) {
        hist.splice(i,1);
      }
    }
    hist.unshift(f);
    while (hist.length > (this.get('maxHistory')||10)) {
      hist.pop();
    } 
    this.saveHistory();
  } catch (e) {};
  // Select feature
	this.select(f);
	this.drawList_();
};

/** Save history (in the localstorage)
 */
ol_control_Search.prototype.saveHistory = function () {
  if (this.get('maxHistory')>=0) {
    try {
      localStorage["ol@search-"+this._classname] = JSON.stringify(this.get('history'));
    } catch (e) {};
  } else {
    localStorage.removeItem("ol@search-"+this._classname);
  }
};

/** Restore history (from the localstorage) 
 */
ol_control_Search.prototype.restoreHistory = function () {
  try {
    this.set('history', JSON.parse(localStorage["ol@search-"+this._classname]) );
  } catch(e) {
    this.set('history', []);
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
	var max = Math.min (self.get("maxItems"),auto.length);
	for (var i=0; i<max; i++) {	
		if (auto[i]) {
			if (!i || !self.equalFeatures(auto[i], auto[i-1])) {
				var li = document.createElement("LI");
				li.setAttribute("data-search", i);
				this._list.push(auto[i]);
				li.addEventListener("click", function(e) {
					self._handleSelect(self._list[e.currentTarget.getAttribute("data-search")]);
				});
				li.innerHTML = self.getTitle(auto[i]);
				ul.appendChild(li);
			}
		}
	}
	if (max && this.get("copy")) {
		var li = document.createElement("LI");
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
ol_control_Search.prototype.equalFeatures = function (f1, f2) {
	return false;
};

export default ol_control_Search
