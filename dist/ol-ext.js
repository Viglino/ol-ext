/**
 * ol-ext - A set of cool extensions for OpenLayers (ol) in node modules structure
 * @description ol3,openlayers,popup,menu,symbol,renderer,filter,canvas,interaction,split,statistic,charts,pie,LayerSwitcher,toolbar,animation
 * @version v3.1.8
 * @author Jean-Marc Viglino
 * @see https://github.com/Viglino/ol-ext#,
 * @license BSD-3-Clause
 */
/** @namespace  ol.ext
 */
/*global ol*/
if (window.ol && !ol.ext) {
  ol.ext = {};
}
/** Inherit the prototype methods from one constructor into another.
 * replace deprecated ol method
 *
 * @param {!Function} childCtor Child constructor.
 * @param {!Function} parentCtor Parent constructor.
 * @function module:ol.inherits
 * @api
 */
ol.ext.inherits = function(child,parent) {
  child.prototype = Object.create(parent.prototype);
  child.prototype.constructor = child;
};
// Compatibilty with ol > 5 to be removed when v6 is out
if (window.ol) {
  if (!ol.inherits) ol.inherits = ol.ext.inherits;
}
/* IE Polyfill */
// NodeList.forEach
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
// Element.remove
if (window.Element && !Element.prototype.remove) {
  Element.prototype.remove = function() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }
}
/* End Polyfill */

/** Ajax request
 * @fires success
 * @fires error
 * @param {*} options
 *  @param {string} options.auth Authorisation as btoa("username:password");
 *  @param {string} options.dataType The type of data that you're expecting back from the server, default JSON
 */
ol.ext.Ajax = function(options) {
  options = options || {};
	ol.Object.call(this);
  this._auth = options.auth;
  this.set('dataType', options.dataType || 'JSON');
};
ol.ext.inherits(ol.ext.Ajax, ol.Object);
/** Helper for get
 * @param {*} options
 *  @param {string} options.url
 *  @param {string} options.auth Authorisation as btoa("username:password");
 *  @param {string} options.dataType The type of data that you're expecting back from the server, default JSON
 *  @param {string} options.success
 *  @param {string} options.error
 *  @param {*} options.options get options
 */
ol.ext.Ajax.get = function(options) {
  var ajax = new ol.ext.Ajax(options);
  if (options.success) ajax.on('success', function(e) { options.success(e.response, e); } );
  if (options.error) ajax.on('error', function(e) { options.error(e); } );
  ajax.send(options.url, options.data, options.options);
};
/** Send an ajax request (GET)
 * @fires success
 * @fires error
 * @param {string} url
 * @param {*} data Data to send to the server as key / value
 * @param {*} options a set of options that are returned in the 
 *  @param {boolean} options.abort false to prevent aborting the current request, default true
 */
ol.ext.Ajax.prototype.send = function (url, data, options){
  options = options || {};
	var self = this;
  // Url
  var encode = (options.encode !== false) 
  if (encode) url = encodeURI(url);
  // Parameters
  var parameters = '';
	for (var index in data) {
		if (data.hasOwnProperty(index) && data[index]!==undefined) {
      parameters += (parameters ? '&' : '?') + index + '=' + (encode ? encodeURIComponent(data[index]) : data[index]);
    }
  }
	// Abort previous request
	if (this._request && options.abort!==false) {
		this._request.abort();
	}
	// New request
	var ajax = this._request = new XMLHttpRequest();
	ajax.open('GET', url + parameters, true);
	if (this._auth) {
		ajax.setRequestHeader("Authorization", "Basic " + this._auth);
	}
  // Load complete
  this.dispatchEvent ({ type: 'loadstart' });
	ajax.onload = function() {
		self._request = null;
    self.dispatchEvent ({ type: 'loadend' });
    if (this.status >= 200 && this.status < 400) {
      var response;
      // Decode response
      try {
        switch (self.get('dataType')) {
          case 'JSON': {
            response = JSON.parse(this.response);
            break;
          }
          default: {
            response = this.response;
          }
        }
      } catch(e) {
        // Error
        self.dispatchEvent ({ 
          type: 'error',
          status: 0,
          statusText: 'parsererror',
          error: e,
          options: options,
          jqXHR: this
        });
        return;
      }
      // Success
      //console.log('response',response)
      self.dispatchEvent ({ 
        type: 'success',
        response: response,
        status: this.status,
        statusText: this.statusText,
        options: options,
        jqXHR: this
      });
    } else {
      self.dispatchEvent ({ 
        type: 'error',
        status: this.status,
        statusText: this.statusText,
        options: options,
        jqXHR: this
      });
    }
	};
	// Oops
	ajax.onerror = function() {
    self._request = null;
    self.dispatchEvent ({ type: 'loadend' });
    self.dispatchEvent ({ 
      type: 'error',
      status: this.status,
      statusText: this.statusText,
      options: options,
      jqXHR: this
    });
  };
	// GO!
	ajax.send();
};

/** Vanilla JS helper to manipulate DOM without jQuery
 * @see https://github.com/nefe/You-Dont-Need-jQuery
 * @see https://plainjs.com/javascript/
 * @see http://youmightnotneedjquery.com/
 */
 ol.ext.element = {};
/**
 * Create an element
 * @param {string} tagName The element tag, use 'TEXT' to create a text node
 * @param {*} options
 *  @param {string} options.className className The element class name 
 *  @param {Element} options.parent Parent to append the element as child
 *  @param {Element|string} options.html Content of the element
 *  @param {string} options.* Any other attribut to add to the element
 */
ol.ext.element.create = function (tagName, options) {
  options = options || {};
  var elt;
  // Create text node
  if (tagName === 'TEXT') {
    elt = document.createTextNode(options.html||'');
    if (options.parent) options.parent.appendChild(elt);
  } else {
    // Other element
    elt = document.createElement(tagName);
    if (/button/i.test(tagName)) elt.setAttribute('type', 'button');
    for (var attr in options) {
      switch (attr) {
        case 'className': {
          if (options.className && options.className.trim) elt.setAttribute('class', options.className.trim());
          break;
        }
        case 'html': {
          if (options.html instanceof Element) elt.appendChild(options.html)
          else if (options.html!==undefined) elt.innerHTML = options.html;
          break;
        }
        case 'parent': {
          options.parent.appendChild(elt);
          break;
        }
        case 'style': {
          this.setStyle(elt, options.style);
          break;
        }
        case 'change':
        case 'click': {
          ol.ext.element.addListener(elt, attr, options[attr]);
          break;
        }
        case 'on': {
          for (var e in options.on) {
            ol.ext.element.addListener(elt, e, options.on[e]);
          }
          break;
        }
        case 'checked': {
          elt.checked = !!options.checked;
          break;
        }
        default: {
          elt.setAttribute(attr, options[attr]);
          break;
        }
      }
    }
  }
  return elt;
};
/** Set inner html or append a child element to an element
 * @param {Element} element
 * @param {Element|string} html Content of the element
 */
ol.ext.element.setHTML = function(element, html) {
  if (html instanceof Element) element.appendChild(html)
  else if (html!==undefined) element.innerHTML = html;
};
/** Append text into an elemnt
 * @param {Element} element
 * @param {string} text text content
 */
ol.ext.element.appendText = function(element, text) {
  element.appendChild(document.createTextNode(text||''));
};
/**
 * Add a set of event listener to an element
 * @param {Element} element
 * @param {string|Array<string>} eventType
 * @param {function} fn
 */
ol.ext.element.addListener = function (element, eventType, fn) {
  if (typeof eventType === 'string') eventType = eventType.split(' ');
  eventType.forEach(function(e) {
    element.addEventListener(e, fn);
  });
};
/**
 * Add a set of event listener to an element
 * @param {Element} element
 * @param {string|Array<string>} eventType
 * @param {function} fn
 */
ol.ext.element.removeListener = function (element, eventType, fn) {
  if (typeof eventType === 'string') eventType = eventType.split(' ');
  eventType.forEach(function(e) {
    element.removeEventListener(e, fn);
  });
};
/**
 * Show an element
 * @param {Element} element
 */
ol.ext.element.show = function (element) {
  element.style.display = '';
};
/**
 * Hide an element
 * @param {Element} element
 */
ol.ext.element.hide = function (element) {
  element.style.display = 'none';
};
/**
 * Test if an element is hihdden
 * @param {Element} element
 * @return {boolean}
 */
ol.ext.element.hidden = function (element) {
  return ol.ext.element.getStyle(element, 'display') === 'none';
};
/**
 * Toggle an element
 * @param {Element} element
 */
ol.ext.element.toggle = function (element) {
  element.style.display = (element.style.display==='none' ? '' : 'none');
};
/** Set style of an element
 * @param {DOMElement} el the element
 * @param {*} st list of style
 */
ol.ext.element.setStyle = function(el, st) {
  for (var s in st) {
    switch (s) {
      case 'top':
      case 'left':
      case 'bottom':
      case 'right':
      case 'minWidth':
      case 'maxWidth':
      case 'width':
      case 'height': {
        if (typeof(st[s]) === 'number') {
          el.style[s] = st[s]+'px';
        } else {
          el.style[s] = st[s];
        }
        break;
      }
      default: {
        el.style[s] = st[s];
      }
    }
  }
};
/**
 * Get style propertie of an element
 * @param {DOMElement} el the element
 * @param {string} styleProp Propertie name
 * @return {*} style value
 */
ol.ext.element.getStyle = function(el, styleProp) {
  var value, defaultView = (el.ownerDocument || document).defaultView;
  // W3C standard way:
  if (defaultView && defaultView.getComputedStyle) {
    // sanitize property name to css notation
    // (hypen separated words eg. font-Size)
    styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
    value = defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  } else if (el.currentStyle) { // IE
    // sanitize property name to camelCase
    styleProp = styleProp.replace(/-(\w)/g, function(str, letter) {
      return letter.toUpperCase();
    });
    value = el.currentStyle[styleProp];
    // convert other units to pixels on IE
    if (/^\d+(em|pt|%|ex)?$/i.test(value)) { 
      return (function(value) {
        var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
        el.runtimeStyle.left = el.currentStyle.left;
        el.style.left = value || 0;
        value = el.style.pixelLeft + "px";
        el.style.left = oldLeft;
        el.runtimeStyle.left = oldRsLeft;
        return value;
      })(value);
    }
  }
  if (/px$/.test(value)) return parseInt(value);
  return value;
};
/** Get outerHeight of an elemen
 * @param {DOMElement} elt
 * @return {number}
 */
ol.ext.element.outerHeight = function(elt) {
  return elt.offsetHeight + ol.ext.element.getStyle(elt, 'marginBottom')
};
/** Get outerWidth of an elemen
 * @param {DOMElement} elt
 * @return {number}
 */
ol.ext.element.outerWidth = function(elt) {
  return elt.offsetWidth + ol.ext.element.getStyle(elt, 'marginLeft')
};
/** Get element offset rect
 * @param {DOMElement} elt
 * @return {*} 
 */
ol.ext.element.offsetRect = function(elt) {
  var rect = elt.getBoundingClientRect();
  return {
    top: rect.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
    left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0),
    height: rect.height || (rect.bottom - rect.top),
    width: rect.widtth || (rect.right - rect.left)
  }
};
/** Make a div scrollable without scrollbar.
 * On touch devices the default behavior is preserved
 * @param {DOMElement} elt
 * @param {function} onmove a function that takes a boolean indicating that the div is scrolling
 */
ol.ext.element.scrollDiv = function(elt, options) {
  var pos = false;
  var speed = 0;
  var d, dt = 0;
  var onmove = (typeof(options.onmove) === 'function' ? options.onmove : function(){});
  var page = options.vertical ? 'pageY' : 'pageX';
  var scroll = options.vertical ? 'scrollTop' : 'scrollLeft';
  var moving = false;
  // Prevent image dragging
  elt.querySelectorAll('img').forEach(function(i) {
    i.ondragstart = function(){ return false; };
  });
  // Start scrolling
  ol.ext.element.addListener(elt, ['mousedown'], function(e) {
    moving = false;
    pos = e[page];
    dt = new Date();
    elt.classList.add('ol-move');
  });
  // Register scroll
  ol.ext.element.addListener(window, ['mousemove'], function(e) {
    moving = true;
    if (pos !== false) {
      var delta = pos - e[page];
      elt[scroll] += delta;
      d = new Date();
      if (d-dt) {
        speed = (speed + delta / (d - dt))/2;
      }
      pos = e[page];
      dt = d;
      // Tell we are moving
      if (delta) onmove(true);
    } else {
      // Not moving yet
      onmove(false);
    }
  });
  // Stop scrolling
  ol.ext.element.addListener(window, ['mouseup'], function(e) {
    if (moving) setTimeout (function() { elt.classList.remove('ol-move'); });
    else elt.classList.remove('ol-move');
    moving = false;
    dt = new Date() - dt;
    if (dt>100) {
      // User stop: no speed
      speed = 0;
    } else if (dt>0) {
      // Calculate new speed
      speed = ((speed||0) + (pos - e[page]) / dt) / 2;
    }
    elt[scroll] += speed*100;
    pos = false;
    speed = 0;
    dt = 0;
  });
  // Handle mousewheel
  if (options.mousewheel && !elt.classList.contains('ol-touch')) {
    ol.ext.element.addListener(elt, 
      ['mousewheel', 'DOMMouseScroll', 'onmousewheel'], 
      function(e) {
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        elt.classList.add('ol-move');
        elt[scroll] -= delta*30;
        elt.classList.remove('ol-move');
        return false;
      }
    );
  }
};
/** Dispatch an event to an Element 
 * @param {string} eventName
 * @param {Element} element
*/
ol.ext.element.dispatchEvent = function (eventName, element) {
  var event;
  try {
    event = new CustomEvent(eventName);
  } catch(e) {
    // Try customevent on IE
    event = document.createEvent("CustomEvent");
    event.initCustomEvent(eventName, true, true, {});
  }
  element.dispatchEvent(event);
};

/** Get a canvas overlay for a map (non rotated, on top of the map)
 * @param {ol.Map} map
 * @return {canvas}
 */
ol.ext.getMapCanvas = function(map) {
  if (!map) return null;
  var canvas = map.getViewport().getElementsByClassName('ol-fixedoverlay')[0];
  if (!canvas) {
    if (map.getViewport().querySelector('.ol-layers')) {
      // Add a fixed canvas layer on top of the map
      canvas = document.createElement('canvas');
      canvas.className = 'ol-fixedoverlay';
      map.getViewport().querySelector('.ol-layers').after(canvas);
      // Clear before new compose
      map.on('precompose', function (e){
        canvas.width = map.getSize()[0] * e.frameState.pixelRatio;
        canvas.height = map.getSize()[1] * e.frameState.pixelRatio;
      });
    } else {
      canvas = map.getViewport().querySelector('canvas');
    }
  }
  return canvas;
};
  
/* global ol */
/* Create ol.sphere for backward compatibility with ol < 5.0
 * To use with Openlayers package
 */
if (window.ol && !ol.sphere) {
  ol.sphere = {};
  ol.sphere.getDistance = function (c1, c2, radius) {
    var sphere = new ol.Sphere(radius || 6371008.8);
    return sphere.haversineDistance(c1, c2);
  }
  ol.sphere.getArea = ol.Sphere.getArea;
  ol.sphere.getLength = ol.Sphere.getLength;
}
/**
 * @classdesc 
 *   Attribution Control integrated in the canvas (for jpeg/png 
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options extend the ol.control options. 
 *  @param {ol.style.Style} options.style style used to draw the title.
 */
ol.control.CanvasBase = function(options) {
  if (!options) options = {};
  // Define a style to draw on the canvas
  this.setStyle(options.style);
  ol.control.Control.call(this, options);
}
ol.ext.inherits(ol.control.CanvasBase, ol.control.Control);
/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {o.Map} map Map.
 * @api stable
 */
ol.control.CanvasBase.prototype.setMap = function (map) {
  this.getCanvas(map);
  var oldmap = this.getMap();
  if (this._listener) {
    ol.Observable.unByKey(this._listener);
    this._listener = null;
  }
  ol.control.Control.prototype.setMap.call(this, map);
  if (oldmap) oldmap.renderSync();
  if (map) {
    this._listener = map.on('postcompose', this._draw.bind(this));
    // Get a canvas layer on top of the map
  }
};
/** Get canvas overlay
 */
ol.control.CanvasBase.prototype.getCanvas = function(map) {
  return ol.ext.getMapCanvas(map);
};
/** Get map Canvas
 * @private
 */
ol.control.CanvasBase.prototype.getContext = function(e) {
  var ctx = e.context;
  if (!ctx && this.getMap()) {
    var c = this.getMap().getViewport().getElementsByClassName('ol-fixedoverlay')[0];
    ctx = c ? c.getContext('2d') : null;
  }
  return ctx;
};
/** Set Style
 * @api
 */
ol.control.CanvasBase.prototype.setStyle = function(style) {
  this._style = style ||  new ol.style.Style ({});
};
/** Get style
 * @api
 */
ol.control.CanvasBase.prototype.getStyle = function() {
  return this._style;
};
/** Get stroke
 * @api
 */
ol.control.CanvasBase.prototype.getStroke = function() {
  var t = this._style.getStroke();
  if (!t) this._style.setStroke(new ol.style.Stroke ({ color:'#000', width:1.25 }));
  return this._style.getStroke();
};
/** Get fill
 * @api
 */
ol.control.CanvasBase.prototype.getFill = function() {
  var t = this._style.getFill();
  if (!t) this._style.setFill(new ol.style.Fill ({ color:'#fff' }));
  return this._style.getFill();
};
/** Get stroke
 * @api
 */
ol.control.CanvasBase.prototype.getTextStroke = function() {
  var t = this._style.getText();
  if (!t) t = new ol.style.Text({});
  if (!t.getStroke()) t.setStroke(new ol.style.Stroke ({ color:'#fff', width:3 }));
  return t.getStroke();
};
/** Get text fill
 * @api
 */
ol.control.CanvasBase.prototype.getTextFill = function() {
  var t = this._style.getText();
  if (!t) t = new ol.style.Text({});
  if (!t.getFill()) t.setFill(new ol.style.Fill ({ color:'#fff', width:3 }));
  return t.getFill();
};
/** Get text font
 * @api
 */
ol.control.CanvasBase.prototype.getTextFont = function() {
  var t = this._style.getText();
  if (!t) t = new ol.style.Text({});
  if (!t.getFont()) t.setFont('12px sans-serif');
  return t.getFont();
};
/** Draw the control on canvas
 * @private
 */
ol.control.CanvasBase.prototype._draw = function(/* e */) {
  console.warn('[CanvasBase] draw function not implemented.');
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * This is the base class for Select controls on attributes values. 
 * Abstract base class; 
 * normally only used for creating subclasses and not instantiated in apps. 
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol.Collection<ol.Feature>} options.features a collection of feature to search in, the collection will be kept in date while selection
 *  @param {ol.source.Vector | Array<ol.source.Vector>} options.source the source to search in if no features set
 */
ol.control.SelectBase = function(options) {
  if (!options) options = {};
  this._features = this.setFeatures(options.features);
  var element;
  if (options.target) {
    element = document.createElement("div");
  } else {
    element = document.createElement("div");
    element.className = 'ol-select ol-unselectable ol-control ol-collapsed';
    ol.ext.element.create('BUTTON', {
      type: 'button',
      on: {
        'click touchstart': function(e) {
          element.classList.toggle('ol-collapsed');
          e.preventDefault();
        }
      },
      parent: element
    });
  }
  if (options.className) element.classList.add(options.className);
  element.appendChild(options.content);
  // OK button
  ol.ext.element.create('BUTTON', {
    html: options.btInfo || 'OK',
    className: 'ol-ok',
    on: { 'click touchstart': this.doSelect.bind(this) },
    parent: options.content
  });
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  this.setSources(options.source);
};
ol.ext.inherits(ol.control.SelectBase, ol.control.Control);
/** Set the current sources
 * @param {ol.source.Vector|Array<ol.source.Vector>|undefined} source
 */
ol.control.SelectBase.prototype.setSources = function (source) {
  if (source) {
    this.set ('source', (source instanceof Array) ? source : [source]);
  } else {
    this.unset('source');
  }  
};
/** Set feature collection to search in
 * @param {ol.Collection<ol.Feature>} features
 */
ol.control.SelectBase.prototype.setFeatures = function (features) {
  if (features instanceof ol.Collection) this._features = features;
  else this._features = null;
};
/** Get feature collection to search in
 * @return {ol.Collection<ol.Feature>}
 */
ol.control.SelectBase.prototype.getFeatures = function () {
  return this._features;
};
/** List of operators / translation
 * @api
 */
ol.control.SelectBase.prototype.operationsList = {
  '=': '=',
  '!=': '≠',
  '<': '<',
  '<=': '≤',
  '>=': '≥',
  '>': '>',
  'contain': '⊂', // ∈
  '!contain': '⊄',	// ∉
  'regexp': '≈'
};
/** Escape string for regexp
 * @param {string} search
 * @return {string}
 */
ol.control.SelectBase.prototype._escape = function (s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};
/**
 * Test if a feature check aconditino
 * @param {ol.Feature} f the feature to check condition
 * @param {Object} condition an object to use for test
 *  @param {string} condition.attr attribute name
 *  @param {string} condition.op operator
 *  @param {any} condition.val value to test
 * @param {boolean} usecase use case or not when testing strings
 * @return {boolean}
 * @private
 */
ol.control.SelectBase.prototype._checkCondition = function (f, condition, usecase) {
  if (!condition.attr) return true;
  var val = f.get(condition.attr);
  var rex;
  switch (condition.op) {
    case '=':
      rex = new RegExp('^'+this._escape(condition.val)+'$', usecase ? '' : 'i');
      return rex.test(val);
    case '!=':
      rex = new RegExp('^'+this._escape(condition.val)+'$', usecase ? '' : 'i');
      return !rex.test(val);
    case '<':
      return val < condition.val;
    case '<=':
      return val <= condition.val;
    case '>':
      return val > condition.val;
      case '>=':
      return val >= condition.val;
    case 'contain':
      rex = new RegExp(this._escape(condition.val), usecase ? '' : 'i');
      return rex.test(val);
    case '!contain':
      rex = new RegExp(this._escape(condition.val), usecase ? '' : 'i');
      return !rex.test(val);
    case 'regexp':
      rex = new RegExp(condition.val, usecase ? '' : 'i');
      return rex.test(val);
    default:
      return false;
  }
};
/** Selection features in a list of features
 * @param {Array<ol.Feature>} result the current list of features
 * @param {Array<ol.Feature>} features to test in
 * @param {Object} condition 
 *  @param {string} condition.attr attribute name
 *  @param {string} condition.op operator
 *  @param {any} condition.val value to test
 * @param {boolean} all all conditions must be valid
 * @param {boolean} usecase use case or not when testing strings
 */
ol.control.SelectBase.prototype._selectFeatures = function (result, features, conditions, all, usecase) {
  conditions = conditions || [];
  var f;
  for (var i=features.length-1; f=features[i]; i--) {
    var isok = all;
    for (var k=0, c; c=conditions[k]; k++) {
      if (c.attr) {
        if (all) {
          isok = isok && this._checkCondition(f,c,usecase);
        }
        else {
          isok = isok || this._checkCondition(f,c,usecase);
        }
      }
    }
    if (isok) {
      result.push(f);
    } else if (this._features) {
      this._features.removeAt(i);
    }
  }
  return result;
};
/** Get vector source
 * @return {Array<ol.source.Vector>}
 */
ol.control.SelectBase.prototype.getSources = function () {
  if (this.get('source')) return this.get('source');
  var sources = [];
  function getSources(layers) {
    layers.forEach(function(l){
      if (l.getLayers) {
        getSources(l.getLayers());
      } else if (l.getSource && l.getSource() instanceof ol.source.Vector) {
        sources.push(l.getSource());
      }
    });
  }
  if (this.getMap()) {
    getSources(this.getMap().getLayers());
  }
  return sources;
};
/** Select features by attributes
 * @param {*} options
 *  @param {Array<ol.source.Vector>|undefined} options.sources source to apply rules, default the select sources
 *  @param {bool} options.useCase case sensitive, default false
 *  @param {bool} options.matchAll match all conditions, default false
 *  @param {Array<conditions>} options.conditions array of conditions
 * @return {Array<ol.Feature>}
 * @fires select
 */
ol.control.SelectBase.prototype.doSelect = function (options) {
  options = options || {};
  var features = [];
  if (options.features) {
    this._selectFeatures(features, options.features, options.conditions, options.matchAll, options.useCase);
  } else if (this._features) {
    this._selectFeatures(features, this._features.getArray(), options.conditions, options.matchAll, options.useCase);
  } else {
    var sources = options.sources || this.getSources();
    sources.forEach(function(s) {
      this._selectFeatures(features, s.getFeatures(), options.conditions, options.matchAll, options.useCase);
    }.bind(this));
  }
  this.dispatchEvent({ type:"select", features: features });
  return features;
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search Control.
 * This is the base class for search controls. You can use it for simple custom search or as base to new class.
 * @see ol.control.SearchFeature
 * @see ol.control.SearchPhoton
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires select
 * @fires change:input
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {boolean | undefined} options.reverse enable reverse geocoding, default false
 *  @param {string | undefined} options.inputLabel label for the input, default none
 *  @param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 1
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {integer | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
 *  @param {function} options.getTitle a function that takes a feature and return the name to display in the index.
 *  @param {function} options.autocomplete a function that take a search string and callback function to send an array
 */
ol.control.Search = function(options) {
  var self = this;
  if (!options) options = {};
  if (options.typing == undefined) options.typing = 300;
  // Class name for history
  this._classname = options.className || 'search';
  var classNames = (options.className||'')+ ' ol-search'
    + (options.target ? '' : ' ol-unselectable ol-control ol-collapsed');
  var element = ol.ext.element.create('DIV',{
    className: classNames + ' ol-collapsed'
  })
  if (!options.target) {
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
    var reverse = ol.ext.element.create('BUTTON', {
      tyoe: 'button',
      class: 'ol-revers',
      title: 'click on the map',
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
  ol.control.Control.call(this, {
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
  // History
  this.restoreHistory();
  this.drawList_();
};
ol.ext.inherits(ol.control.Search, ol.control.Control);
/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.control.Search.prototype.setMap = function (map) {
  if (this._listener) ol.Observable.unByKey(this._listener);
	this._listener = null;
  ol.control.Control.prototype.setMap.call(this, map);
  if (map) {
		this._listener = map.on('click', this._handleClick.bind(this));
	}
};
/** Get the input field
*	@return {Element} 
*	@api
*/
ol.control.Search.prototype.getInputField = function () {
  return this._input;
};
/** Returns the text to be displayed in the menu
*	@param {any} f feature to be displayed
*	@return {string} the text to be displayed in the index, default f.name
*	@api
*/
ol.control.Search.prototype.getTitle = function (f) {
  return f.name || "No title";
};
/** Force search to refresh
 */
ol.control.Search.prototype.search = function () {
  var search = this.element.querySelector("input.search");
  this._triggerCustomEvent('search', search);
};
/** Reverse geocode
 * @param {Object} event
 *  @param {ol.coordinate} event.coordinate
 * @private
 */
ol.control.Search.prototype._handleClick = function (e) {
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
ol.control.Search.prototype.reverseGeocode = function (/*coord, cback*/) {
  // this._handleSelect(f);
};
/** Trigger custom event on elemebt
 * @param {*} eventName 
 * @param {*} element 
 * @private
 */
ol.control.Search.prototype._triggerCustomEvent = function (eventName, element) {
  ol.ext.element.dispatchEvent(eventName, element);
};
/** Set the input value in the form (for initialisation purpose)
*	@param {string} value
*	@param {boolean} search to start a search
*	@api
*/
ol.control.Search.prototype.setInput = function (value, search) {
  var input = this.element.querySelector("input.search");
  input.value = value;
  if (search) this._triggerCustomEvent("keyup", input);
};
/** A ligne has been clicked in the menu > dispatch event
*	@param {any} f the feature, as passed in the autocomplete
*	@api * @param {boolean} reverse true if reverse geocode
*/
ol.control.Search.prototype.select = function (f, reverse) {
  this.dispatchEvent({ type:"select", search:f, reverse: !!reverse });
};
/**
 * Save history and select
 * @param {*} f 
 * @param {boolean} reverse true if reverse geocode
 * @private
 */
ol.control.Search.prototype._handleSelect = function (f, reverse) {
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
  while (hist.length > (this.get('maxHistory')||10)) {
    hist.pop();
  } 
  this.saveHistory();
  // Select feature
  this.select(f, reverse);
  //this.drawList_();
};
/** Current history */
ol.control.Search.prototype._history = {};
/** Save history (in the localstorage)
 */
ol.control.Search.prototype.saveHistory = function () {
  if (this.get('maxHistory')>=0) {
    try {
      localStorage["ol@search-"+this._classname] = JSON.stringify(this.get('history'));
    } catch (e) { /* ok */ }
  } else {
    localStorage.removeItem("ol@search-"+this._classname);
  }
};
/** Restore history (from the localstorage) 
 */
ol.control.Search.prototype.restoreHistory = function () {
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
ol.control.Search.prototype.clearHistory = function () {
  this.set('history', []);
  this.saveHistory();
  this.drawList_();
};
/**
 * Get history table
 */
ol.control.Search.prototype.getHistory = function () {
  return this.get('history');
};
/** Autocomplete function
* @param {string} s search string
* @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
* @return {Array|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
* @api
*/
ol.control.Search.prototype.autocomplete = function (s, cback) {
  cback ([]);
  return false;
  // or just return [];
};
/** Draw the list
* @param {Array} auto an array of search result
* @private
*/
ol.control.Search.prototype.drawList_ = function (auto) {
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
ol.control.Search.prototype.equalFeatures = function (/* f1, f2 */) {
  return false;
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * This is the base class for search controls that use a json service to search features.
 * You can use it for simple custom search or as base to new class.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {any} options extend ol.control.Search options
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
 *
 *  @param {string|undefined} options.url Url of the search api
 *  @param {string | undefined} options.authentication: basic authentication for the search API as btoa("login:pwd")
 */
ol.control.SearchJSON = function(options) {
  options = options || {};
  options.className = options.className || 'JSON';
  delete options.autocomplete;
  options.minLength = options.minLength || 3;
  options.typing = options.typing || 800;
  ol.control.Search.call(this, options);
  // Handle Mix Content Warning
  // If the current connection is an https connection all other connections must be https either
  var url = options.url || "";
  if (window.location.protocol === "https:") {
    var parser = document.createElement('a');
    parser.href = url;
    parser.protocol = window.location.protocol;
    url = parser.href;
  }
  this.set('url', url);
  this._ajax = new ol.ext.Ajax({ dataType:'JSON', auth: options.authentication });
  this._ajax.on('success', function (resp) {
    if (resp.status >= 200 && resp.status < 400) {
      if (typeof(this._callback) === 'function') this._callback(resp.response);
    } else {
      console.log('AJAX ERROR', arguments);
    }
  }.bind(this));
  this._ajax.on('error', function() {
    console.log('AJAX ERROR', arguments);
  }.bind(this));
  // Handle searchin
  this._ajax.on('loadstart', function() {
    this.element.classList.add('searching');
  }.bind(this));
  this._ajax.on('loadend', function() {
    this.element.classList.remove('searching');
  }.bind(this));
  // Overwrite handleResponse
  if (typeof(options.handleResponse)==='function') this.handleResponse = options.handleResponse;
};
ol.ext.inherits(ol.control.SearchJSON, ol.control.Search);
/** Send ajax request
 * @param {string} url
 * @param {*} data
 * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
 */
ol.control.SearchJSON.prototype.ajax = function (url, data, cback, options) {
  options = options || {};
  this._callback = cback;
  this._ajax.set('dataType', options.dataType || 'JSON');
  this._ajax.send(url, data, options);
};
/** Autocomplete function (ajax request to the server)
 * @param {string} s search string
 * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
 */
ol.control.SearchJSON.prototype.autocomplete = function (s, cback) {
  var data = this.requestData(s);
  var url = encodeURI(this.get('url'));
  this.ajax(url, data, function(resp) {
    if (typeof(cback) === 'function') cback(this.handleResponse(resp));
  });
};
/**
 * @param {string} s the search string
 * @return {Object} request data (as key:value)
 * @api
 */
ol.control.SearchJSON.prototype.requestData = function (s){
  return { q: s };
};
/**
 * Handle server response to pass the features array to the display list
 * @param {any} response server response
 * @return {Array<any>} an array of feature
 * @api
 */
ol.control.SearchJSON.prototype.handleResponse = function (response) {
  return response;
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search places using the photon API.
 *
 * @constructor
 * @extends {ol.control.SearchJSON}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
 * 
 *  @param {string|undefined} options.url Url to photon api, default "http://photon.komoot.de/api/"
 *  @param {string|undefined} options.lang Force preferred language, default none
 *  @param {boolean} options.position Search, with priority to geo position, default false
 *  @param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return street + name + contry
 */
ol.control.SearchPhoton = function(options) {
  options = options || {};
  options.className = options.className || 'photon';
  options.url = options.url || 'http://photon.komoot.de/api/';
  options.copy = '<a href="http://www.openstreetmap.org/copyright" target="new">&copy; OpenStreetMap contributors</a>';
  ol.control.SearchJSON.call(this, options);
  this.set('lang', options.lang);
  this.set('position', options.position);
};
ol.ext.inherits(ol.control.SearchPhoton, ol.control.SearchJSON);
/** Returns the text to be displayed in the menu
*	@param {ol.Feature} f the feature
*	@return {string} the text to be displayed in the index
*	@api
*/
ol.control.SearchPhoton.prototype.getTitle = function (f) {
  var p = f.properties;
  return (p.housenumber||"")
    + " "+(p.street || p.name || "")
    + "<i>"
    + " "+(p.postcode||"")
    + " "+(p.city||"")
    + " ("+p.country
    + ")</i>";
};
/** 
 * @param {string} s the search string
 * @return {Object} request data (as key:value)
 * @api
 */
ol.control.SearchPhoton.prototype.requestData = function (s) {
  var data = {
    q: s,
    lang: this.get('lang'),
    limit: this.get('maxItems')
  }
  // Handle position proirity
  if (this.get('position')) {
    var view = this.getMap().getView();
    var pt = new ol.geom.Point(view.getCenter());
    pt = (pt.transform (view.getProjection(), "EPSG:4326")).getCoordinates();
    data.lon = pt[0];
    data.lat = pt[1];
  }
  return data;
};
/**
 * Handle server response to pass the features array to the list
 * @param {any} response server response
 * @return {Array<any>} an array of feature
 */
ol.control.SearchPhoton.prototype.handleResponse = function (response) {
  return response.features;
};
/** Prevent same feature to be drawn twice: test equality
 * @param {} f1 First feature to compare
 * @param {} f2 Second feature to compare
 * @return {boolean}
 * @api
 */
ol.control.SearchPhoton.prototype.equalFeatures = function (f1, f2) {
  return (this.getTitle(f1) === this.getTitle(f2)
    && f1.geometry.coordinates[0] === f2.geometry.coordinates[0]
    && f1.geometry.coordinates[1] === f2.geometry.coordinates[1]);
};
/** A ligne has been clicked in the menu > dispatch event
*	@param {any} f the feature, as passed in the autocomplete
*	@api
*/
ol.control.SearchPhoton.prototype.select = function (f) {
  var c = f.geometry.coordinates;
  // Add coordinate to the event
  try {
    c = ol.proj.transform (f.geometry.coordinates, 'EPSG:4326', this.getMap().getView().getProjection());
  } catch(e) { /* ok */ }
  this.dispatchEvent({ type:"select", search:f, coordinate: c });
};
/** Get data for reverse geocode 
 * @param {ol.coordinate} coord
 */
ol.control.SearchPhoton.prototype.reverseData = function (coord) {
  var lonlat = ol.proj.transform (coord, this.getMap().getView().getProjection(), 'EPSG:4326');
  return { lon: lonlat[0], lat: lonlat[1] };
};
/** Reverse geocode
 * @param {ol.coordinate} coord
 * @api
 */
ol.control.SearchPhoton.prototype.reverseGeocode = function (coord, cback) {
  this.ajax(
    this.get('url').replace('/api/', '/reverse/').replace('/search/', '/reverse/'),
    this.reverseData(coord),
    function(resp) {
      if (resp.features) resp = resp.features;
      if (!(resp instanceof Array)) resp = [resp];
      if (cback) {
        cback.call(this, resp);
      } else {
        this._handleSelect(resp[0], true);
        // this.setInput('', true);
      }
    }.bind(this)
  );
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search places using the French National Base Address (BAN) API.
 *
 * @constructor
 * @extends {ol.control.SearchJSON}
 * @fires select
 * @param {any} options extend ol.control.SearchJSON options
 *	@param {string} options.className control class name
 *	@param {boolean | undefined} options.apiKey the service api key.
 *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {boolean | undefined} options.reverse enable reverse geocoding, default false
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {StreetAddress|PositionOfInterest|CadastralParcel|Commune} options.type type of search. Using Commune will return the INSEE code, default StreetAddress,PositionOfInterest
 * @see {@link https://geoservices.ign.fr/documentation/geoservices/geocodage.html}
 */
ol.control.SearchGeoportail = function(options) {
  options = options || {};
  options.className = options.className || 'IGNF';
  options.typing = options.typing || 500;
  options.url = "https://wxs.ign.fr/"+options.apiKey+"/ols/apis/completion";
  options.copy = '<a href="https://www.geoportail.gouv.fr/" target="new">&copy; IGN-Géoportail</a>';
  ol.control.SearchJSON.call(this, options);
  this.set('type', options.type || 'StreetAddress,PositionOfInterest');
  // Authentication
  // this._auth = options.authentication;
};
ol.ext.inherits(ol.control.SearchGeoportail, ol.control.SearchJSON);
/** Reverse geocode
 * @param {ol.coordinate} coord
 * @api
 */
ol.control.SearchGeoportail.prototype.reverseGeocode = function (coord, cback) {
  // Search type
  var type = this.get('type')==='Commune' ? 'PositionOfInterest' : this.get('type') || 'StreetAddress';
  type = 'StreetAddress';
  var lonlat = ol.proj.transform(coord, this.getMap().getView().getProjection(), 'EPSG:4326');
  // request
  var request = '<?xml version="1.0" encoding="UTF-8"?>'
    +'<XLS xmlns:xls="http://www.opengis.net/xls" xmlns:gml="http://www.opengis.net/gml" xmlns="http://www.opengis.net/xls" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.2" xsi:schemaLocation="http://www.opengis.net/xls http://schemas.opengis.net/ols/1.2/olsAll.xsd">'
    +' <Request requestID="1" version="1.2" methodName="ReverseGeocodeRequest" maximumResponses="1" >'
    +'  <ReverseGeocodeRequest>'
    +'   <ReverseGeocodePreference>'+type+'</ReverseGeocodePreference>'
    +'   <Position>'
    +'    <gml:Point><gml:pos>'+lonlat[1]+' '+lonlat[0]+'</gml:pos></gml:Point>'
    +'   </Position>'
    +'  </ReverseGeocodeRequest>'
    +' </Request>'
    +'</XLS>';
  this.ajax (this.get('url').replace('ols/apis/completion','geoportail/ols'), 
    { xls: request },
    function(xml) {
      if (xml) {
        xml = xml.replace(/\n|\r/g,'');
        var p = (xml.replace(/.*<gml:pos>(.*)<\/gml:pos>.*/, "$1")).split(' ');
        var f = {};
        if (!Number(p[1]) && !Number(p[0])) {
          f = { x: lonlat[0], y: lonlat[1], fulltext: String(lonlat) }
        } else {
          f.x = lonlat[0];
          f.y = lonlat[1];
          f.city = (xml.replace(/.*<Place type="Municipality">([^<]*)<\/Place>.*/, "$1"));
          f.insee = (xml.replace(/.*<Place type="INSEE">([^<]*)<\/Place>.*/, "$1"));
          f.zipcode = (xml.replace(/.*<PostalCode>([^<]*)<\/PostalCode>.*/, "$1"));
          if (/<Street>/.test(xml)) {
            f.kind = '';
            f.country = 'StreetAddress';
            f.street = (xml.replace(/.*<Street>([^<]*)<\/Street>.*/, "$1"));
            var number = (xml.replace(/.*<Building number="([^"]*).*/, "$1"));
            f.fulltext = number+' '+f.street+', '+f.zipcode+' '+f.city;
          } else {
            f.kind = (xml.replace(/.*<Place type="Nature">([^<]*)<\/Place>.*/, "$1"));
            f.country = 'PositionOfInterest';
            f.street = '';
            f.fulltext = f.zipcode+' '+f.city;
          }
        }
        if (cback) {
          cback.call(this, [f]);
        } else {
          this._handleSelect(f, true);
          // this.setInput('', true);
          // this.drawList_();
        }
      }
    }.bind(this),
    { dataType: 'XML' }
  );
};
/** Returns the text to be displayed in the menu
 *	@param {ol.Feature} f the feature
 *	@return {string} the text to be displayed in the index
 *	@api
 */
ol.control.SearchGeoportail.prototype.getTitle = function (f) {
  var title = f.fulltext;
  return (title);
};
/** 
 * @param {string} s the search string
 * @return {Object} request data (as key:value)
 * @api
 */
ol.control.SearchGeoportail.prototype.requestData = function (s) {
	return { 
    text: s, 
    type: this.get('type')==='Commune' ? 'PositionOfInterest' : this.get('type') || 'StreetAddress,PositionOfInterest', 
    maximumResponses: this.get('maxItems')
  };
};
/**
 * Handle server response to pass the features array to the display list
 * @param {any} response server response
 * @return {Array<any>} an array of feature
 * @api
 */
ol.control.SearchGeoportail.prototype.handleResponse = function (response) {
  var features = response.results;
  if (this.get('type') === 'Commune') {
    for (var i=features.length-1; i>=0; i--) {
      if ( features[i].kind 
        && (features[i].classification>5 || features[i].kind=="Département") ) {
          features.splice(i,1);
      }
    }
	}
	return features;
};
/** A ligne has been clicked in the menu > dispatch event
 *	@param {any} f the feature, as passed in the autocomplete
 *	@api
 */
ol.control.SearchGeoportail.prototype.select = function (f){
  if (f.x || f.y) {
    var c = [Number(f.x), Number(f.y)];
    // Add coordinate to the event
    try {
        c = ol.proj.transform (c, 'EPSG:4326', this.getMap().getView().getProjection());
    } catch(e) { /* ok */}
    // Get insee commune ?
    if (this.get('type')==='Commune') {
      this.searchCommune(f, function () {
        this.dispatchEvent({ type:"select", search:f, coordinate: c });
      });
    } else {
      this.dispatchEvent({ type:"select", search:f, coordinate: c });
    }
  } else {
    this.searchCommune(f);
  }
};
/** Search if no position and get the INSEE code
 * @param {string} s le nom de la commune
 */
ol.control.SearchGeoportail.prototype.searchCommune = function (f, cback) {
  var request = '<?xml version="1.0" encoding="UTF-8"?>'
	+'<XLS xmlns:xls="http://www.opengis.net/xls" xmlns:gml="http://www.opengis.net/gml" xmlns="http://www.opengis.net/xls" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.2" xsi:schemaLocation="http://www.opengis.net/xls http://schemas.opengis.net/ols/1.2/olsAll.xsd">'
		+'<RequestHeader/>'
		+'<Request requestID="1" version="1.2" methodName="LocationUtilityService">'
			+'<GeocodeRequest returnFreeForm="false">'
				+'<Address countryCode="PositionOfInterest">'
				+'<freeFormAddress>'+f.fulltext+'+</freeFormAddress>'
				+'</Address>'
			+'</GeocodeRequest>'
		+'</Request>'
	+'</XLS>'
  // Search 
  this.ajax (this.get('url').replace('ols/apis/completion','geoportail/ols'),
    { 'xls': request }, 
    function(xml) {
      if (xml) {
        xml = xml.replace(/\n|\r/g,'');
        var p = (xml.replace(/.*<gml:pos>(.*)<\/gml:pos>.*/, "$1")).split(' ');
        f.x = Number(p[1]);
        f.y = Number(p[0]);
        f.kind = (xml.replace(/.*<Place type="Nature">([^<]*)<\/Place>.*/, "$1"));
        f.insee = (xml.replace(/.*<Place type="INSEE">([^<]*)<\/Place>.*/, "$1"));
        if (f.x || f.y) {
          if (cback) cback.call(this, [f]);
          else this._handleSelect(f);
        }
      }
    }.bind(this),
    { dataType: 'XML' }
  );
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc OpenLayers 3 Layer Switcher Control.
 * @fires drawlist
 * @fires toggle
 * @fires reorder-start
 * @fires reorder-end
 * 
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options
 *  @param {function} options.displayInLayerSwitcher function that takes a layer and return a boolean if the layer is displayed in the switcher, default test the displayInLayerSwitcher layer attribute
 *  @param {boolean} options.show_progress show a progress bar on tile layers, default false
 *  @param {boolean} options.mouseover show the panel on mouseover, default false
 *  @param {boolean} options.reordering allow layer reordering, default true
 *  @param {boolean} options.trash add a trash button to delete the layer, default false
 *  @param {function} options.oninfo callback on click on info button, if none no info button is shown DEPRECATED: use on(info) instead
 *  @param {boolean} options.extent add an extent button to zoom to the extent of the layer
 *  @param {function} options.onextent callback when click on extent, default fits view to extent
 *  @param {number} options.drawDelay delay in ms to redraw the layer (usefull to prevent flickering when manipulating the layers)
 *  @param {boolean} options.collapsed collapse the layerswitcher at beginning, default true
 *
 * Layers attributes that control the switcher
 *	- allwaysOnTop {boolean} true to force layer stay on top of the others while reordering, default false
 *	- displayInLayerSwitcher {boolean} display in switcher, default true
 *	- noSwitcherDelete {boolean} to prevent layer deletion (w. trash option = true), default false
 */
ol.control.LayerSwitcher = function(options) {
  options = options || {};
  var self = this;
  this.dcount = 0;
  this.show_progress = options.show_progress;
  this.oninfo = (typeof (options.oninfo) == "function" ? options.oninfo: null);
  this.onextent = (typeof (options.onextent) == "function" ? options.onextent: null);
  this.hasextent = options.extent || options.onextent;
  this.hastrash = options.trash;
  this.reordering = (options.reordering!==false);
  this._layers = [];
  // displayInLayerSwitcher
  if (typeof(options.displayInLayerSwitcher) === 'function') {
    this.displayInLayerSwitcher = options.displayInLayerSwitcher;
  }
  var element;
  if (options.target) {
    element = ol.ext.element.create('DIV', {
      className: options.switcherClass || "ol-layerswitcher"
    });
  } else {
    element = ol.ext.element.create('DIV', {
      className: (options.switcherClass || "ol-layerswitcher") +' ol-unselectable ol-control'
    });
    if (options.collapsed !== false) element.classList.add('ol-collapsed'); 
    else element.classList.add('ol-forceopen'); 
    this.button = ol.ext.element.create('BUTTON', {
      type: 'button',
      parent: element
    });
    this.button.addEventListener('touchstart', function(e){
      element.classList.toggle('ol-collapsed');
      self.dispatchEvent({ type: 'toggle', collapsed: element.classList.contains('ol-collapsed') });
      e.preventDefault(); 
      self.overflow();
    });
    this.button.addEventListener('click', function(){
      element.classList.toggle('ol-forceopen');
      element.classList.add('ol-collapsed'); 
      self.dispatchEvent({ type: 'toggle', collapsed: !element.classList.contains('ol-forceopen') });
      self.overflow();
    });
    if (options.mouseover) {
      element.addEventListener ('mouseleave', function(){ 
        element.classList.add("ol-collapsed"); 
        self.dispatchEvent({ type: 'toggle', collapsed: true });
      });
      element.addEventListener ('mouseover', function(){ 
        element.classList.remove("ol-collapsed"); 
        self.dispatchEvent({ type: 'toggle', collapsed: false });
      });
    }
    this.topv = ol.ext.element.create('DIV', {
      className: 'ol-switchertopdiv',
      parent: element,
      click: function() {
        self.overflow("+50%");
      }
    });
    this.botv = ol.ext.element.create('DIV', {
      className: 'ol-switcherbottomdiv',
      parent: element,
      click: function() {
        self.overflow("-50%");
      }
    });
  }
  this.panel_ = ol.ext.element.create ('UL', {
    className: 'panel',
    parent: element
  });
  ol.ext.element.addListener (this.panel_, 'mousewheel DOMMouseScroll onmousewheel', function(e) {
    if (self.overflow(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))))) {
      e.stopPropagation();
      e.preventDefault();
    }
  });
  this.header_ = ol.ext.element.create('LI', {
    className: 'ol-header',
    parent: this.panel_
  });
  ol.control.Control.call (this, {
    element: element,
    target: options.target
  });
  this.set('drawDelay',options.drawDelay||0);
};
ol.ext.inherits(ol.control.LayerSwitcher, ol.control.Control);
/** List of tips for internationalization purposes
*/
ol.control.LayerSwitcher.prototype.tip = {
  up: "up/down",
  down: "down",
  info: "informations...",
  extent: "zoom to extent",
  trash: "remove layer",
  plus: "expand/shrink"
};
/** Test if a layer should be displayed in the switcher
 * @param {ol.layer} layer
 * @return {boolean} true if the layer is displayed
 */
ol.control.LayerSwitcher.prototype.displayInLayerSwitcher = function(layer) {
  return (layer.get("displayInLayerSwitcher")!==false);
};
/**
 * Set the map instance the control is associated with.
 * @param {_ol_Map_} map The map instance.
 */
ol.control.LayerSwitcher.prototype.setMap = function(map) {
  ol.control.Control.prototype.setMap.call(this, map);
  this.drawPanel();
  if (this._listener) {
    if (this._listener) ol.Observable.unByKey(this._listener.change);
    if (this._listener) ol.Observable.unByKey(this._listener.moveend);
    if (this._listener) ol.Observable.unByKey(this._listener.size);
  }
  this._listener = null;
  // Get change (new layer added or removed)
  if (map) {
    this._listener = {
      change: map.getLayerGroup().on('change', this.drawPanel.bind(this)),
      moveend: map.on('moveend', this.viewChange.bind(this)),
      size: map.on('change:size', this.overflow.bind(this))
    }
  }
};
/** Show control
 */
ol.control.LayerSwitcher.prototype.show = function() {
  this.element.classList.add("ol-forceopen");
  this.overflow();
};
/** Hide control
 */
ol.control.LayerSwitcher.prototype.hide = function() {
  this.element.classList.remove("ol-forceopen");
  this.overflow();
};
/** Toggle control
 */
ol.control.LayerSwitcher.prototype.toggle = function() {
  this.element.classList.toggle("ol-forceopen");
  this.overflow();
};
/** Is control open
 * @return {boolean}
 */
ol.control.LayerSwitcher.prototype.isOpen = function() {
  return this.element.classList.contains("ol-forceopen");
};
/** Add a custom header
 * @param {Element|string} html content html
 */
ol.control.LayerSwitcher.prototype.setHeader = function(html) {
  ol.ext.element.setHTML(this.header_, html);
};
/** Calculate overflow and add scrolls
 *	@param {Number} dir scroll direction -1|0|1|'+50%'|'-50%'
 */
ol.control.LayerSwitcher.prototype.overflow = function(dir) {	
  if (this.button) {
    // Nothing to show
    if (ol.ext.element.hidden(this.panel_)) {
      ol.ext.element.setStyle(this.element, { height: 'auto' });
      return;
    }
    // Calculate offset
    var h = ol.ext.element.outerHeight(this.element);
    var hp = ol.ext.element.outerHeight(this.panel_);
    var dh = this.button.offsetTop + ol.ext.element.outerHeight(this.button);
    //var dh = this.button.position().top + this.button.outerHeight(true);
    var top = this.panel_.offsetTop - dh;
    if (hp > h-dh) {
      // Bug IE: need to have an height defined
      ol.ext.element.setStyle(this.element, { height: '100%' });
      var lh = 2 * ol.ext.element.getStyle(this.panel_.querySelectorAll('li.visible .li-content')[0], 'height');
      switch (dir) {
        case 1: top += lh; break;
        case -1: top -= lh; break;
        case "+50%": top += Math.round(h/2); break;
        case "-50%": top -= Math.round(h/2); break;
        default: break;
      }
      // Scroll div
      if (top+hp <= h-3*dh/2) {
        top = h-3*dh/2-hp;
        ol.ext.element.hide(this.botv);
      } else {
        ol.ext.element.show(this.botv);
      }
      if (top >= 0) {
        top = 0;
        ol.ext.element.hide(this.topv);
      } else {
        ol.ext.element.show(this.topv);
      }
      // Scroll ?
      ol.ext.element.setStyle(this.panel_, { top: top+"px" });
      return true;
    } else {
      ol.ext.element.setStyle(this.element, { height: "auto" });
      ol.ext.element.setStyle(this.panel_, { top: 0 });
      ol.ext.element.hide(this.botv);
      ol.ext.element.hide(this.topv);
      return false;
    }
  }
  else return false;
};
/** Set the layer associated with a li
 * @param {Element} li
 * @param {ol.layer} layer
 */
ol.control.LayerSwitcher.prototype._setLayerForLI = function(li, layer) {
  this._layers.push({ li:li, layer:layer });
};
/** Get the layer associated with a li
 * @param {Element} li
 * @return {ol.layer}
 */
ol.control.LayerSwitcher.prototype._getLayerForLI = function(li) {
  for (var i=0, l; l=this._layers[i]; i++) {
    if (l.li===li) return l.layer;
  }
  return null;
};
/**
 * On view change hide layer depending on resolution / extent
 * @private
 */
ol.control.LayerSwitcher.prototype.viewChange = function() {
  this.panel_.querySelectorAll('li').forEach( function(li) {
    var l = this._getLayerForLI(li);
    if (l) {
      if (this.testLayerVisibility(l)) li.classList.remove('ol-layer-hidden');
      else li.classList.add('ol-layer-hidden');
    }
  }.bind(this));
};
/**
 *	Draw the panel control (prevent multiple draw due to layers manipulation on the map with a delay function)
*/
ol.control.LayerSwitcher.prototype.drawPanel = function() {
  if (!this.getMap()) return;
  var self = this;
  // Multiple event simultaneously / draw once => put drawing in the event queue
  this.dcount++;
  setTimeout (function(){ self.drawPanel_(); }, this.get('drawDelay') || 0);
};
/** Delayed draw panel control 
 * @private
 */
ol.control.LayerSwitcher.prototype.drawPanel_ = function() {
  if (--this.dcount || this.dragging_) return;
  // Remove existing layers
  this._layers = [];
  this.panel_.querySelectorAll('li').forEach (function(li) {
    if (!li.classList.contains('ol-header')) li.remove();
  }.bind(this));
  // Draw list
  this.drawList (this.panel_, this.getMap().getLayers());
};
/** Change layer visibility according to the baselayer option
 * @param {ol.layer}
 * @param {Array<ol.layer>} related layers
 */
ol.control.LayerSwitcher.prototype.switchLayerVisibility = function(l, layers) {
  if (!l.get('baseLayer')) {
    l.setVisible(!l.getVisible());
  } else {
    if (!l.getVisible()) l.setVisible(true);
    layers.forEach(function(li) {
      if (l!==li && li.get('baseLayer') && li.getVisible()) li.setVisible(false);
    });
  }
};
/** Check if layer is on the map (depending on zoom and extent)
 * @param {ol.layer}
 * @return {boolean}
 */
ol.control.LayerSwitcher.prototype.testLayerVisibility = function(layer) {
  if (!this.getMap()) return true;
  var res = this.getMap().getView().getResolution();
  if (layer.getMaxResolution()<=res || layer.getMinResolution()>=res) {
    return false;
  } else {
    var ex0 = layer.getExtent();
    if (ex0) {
      var ex = this.getMap().getView().calculateExtent(this.getMap().getSize());
      return ol.extent.intersects(ex, ex0);
    }
    return true;
  }
};
/** Start ordering the list
*	@param {event} e drag event
*	@private
*/
ol.control.LayerSwitcher.prototype.dragOrdering_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  // Get params
  var self = this;
  var elt = e.currentTarget.parentNode.parentNode;
  var start = true;
  var panel = this.panel_; 
  var pageY;
  var pageY0 = e.pageY 
    || (e.touches && e.touches.length && e.touches[0].pageY) 
    || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageY);
  var target, dragElt;
  var layer, group;
  elt.parentNode.classList.add('drag');
  // Stop ordering
  function stop() {
    if (target) {
      // Get drag on parent
      var drop = layer;
      if (drop && target) {
        var collection ;
        if (group) collection = group.getLayers();
        else collection = self.getMap().getLayers();
        var layers = collection.getArray();
        // Switch layers
        for (var i=0; i<layers.length; i++) {
          if (layers[i]==drop) {
            collection.removeAt (i);
            break;
          }
        }
        for (var j=0; j<layers.length; j++) {
          if (layers[j]==target) {
            if (i>j) collection.insertAt (j,drop);
            else collection.insertAt (j+1,drop);
            break;
          }
        }
      }
      self.dispatchEvent({ type: "reorder-end", layer: drop, group: group });
    }
    elt.parentNode.querySelectorAll('li').forEach(function(li){
      li.classList.remove('dropover');
      li.classList.remove('dropover-after');
      li.classList.remove('dropover-before');
    });
    elt.classList.remove("drag");
    elt.parentNode.classList.remove("drag");
    self.element.classList.remove('drag');
    if (dragElt) dragElt.remove();
    ol.ext.element.removeListener(document, 'mousemove touchmove', move);
    ol.ext.element.removeListener(document, 'mouseup touchend touchcancel', stop);
  }
  // Ordering
  function move(e) {
    // First drag (more than 2 px) => show drag element (ghost)
    pageY = e.pageY 
        || (e.touches && e.touches.length && e.touches[0].pageY) 
        || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageY);
    if (start && Math.abs(pageY0 - pageY) > 2) {
      start = false;
      elt.classList.add("drag");
      layer = self._getLayerForLI(elt);
      target = false;
      group = self._getLayerForLI(elt.parentNode.parentNode);
      // Ghost div
      dragElt = ol.ext.element.create('LI', { 
        className: 'ol-dragover',
        html: elt.innerHTML,
        style: { 
          position: "absolute", 
          "z-index": 10000, 
          left: elt.offsetLeft, 
          opacity: 0.5,
          width: ol.ext.element.outerWidth(elt),
          height: ol.ext.element.getStyle(elt,'height'),
        },
        parent: panel 
      });
      self.element.classList.add('drag');
      self.dispatchEvent({ type: "reorder-start", layer: layer, group: group });
    }
    // Start a new drag sequence
    if (!start) {
      e.preventDefault();
      e.stopPropagation();
      // Ghost div
      ol.ext.element.setStyle(dragElt, { top: pageY - ol.ext.element.offsetRect(panel).top + panel.scrollTop +5 });
      var li;
      if (!e.touches) {
        li = e.target;
      } else {
        li = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      }
      if (li.classList.contains("ol-switcherbottomdiv")) {
        self.overflow(-1);
      } else if (li.classList.contains("ol-switchertopdiv")) {
        self.overflow(1);
      }
      // Get associated li
      while (li && li.tagName!=='LI') {
        li = li.parentNode;
      }
      if (!li || !li.classList.contains('dropover')) {
        elt.parentNode.querySelectorAll('li').forEach(function(li) {
          li.classList.remove('dropover');
          li.classList.remove('dropover-after');
          li.classList.remove('dropover-before');
        });
      }
      if (li && li.parentNode.classList.contains('drag') && li !== elt) {
        target = self._getLayerForLI(li);
        // Don't mix layer level
        if (target && !target.get('allwaysOnTop') == !layer.get('allwaysOnTop')) {
          li.classList.add("dropover");
          li.classList.add((elt.offsetTop < li.offsetTop) ? 'dropover-after' : 'dropover-before');
        } else {
          target = false;
        }
        ol.ext.element.show(dragElt);
      } else {
        target = false;
        if (li===elt) ol.ext.element.hide(dragElt);
        else ol.ext.element.show(dragElt);
      }
      if (!target) dragElt.classList.add("forbidden");
      else dragElt.classList.remove("forbidden");
    }
  }
  // Start ordering
  ol.ext.element.addListener(document, 'mousemove touchmove', move);
  ol.ext.element.addListener(document, 'mouseup touchend touchcancel', stop);
};
/** Change opacity on drag 
*	@param {event} e drag event
*	@private
*/
ol.control.LayerSwitcher.prototype.dragOpacity_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  var self = this
  // Register start params
  var elt = e.target;
  var layer = this._getLayerForLI(elt.parentNode.parentNode.parentNode);
  if (!layer) return;
  var x = e.pageX 
    || (e.touches && e.touches.length && e.touches[0].pageX) 
    || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageX);
  var start = ol.ext.element.getStyle (elt, 'left') - x;
  self.dragging_ = true;
  // stop dragging
  function stop() {
    ol.ext.element.removeListener(document, "mouseup touchend touchcancel", stop);
    ol.ext.element.removeListener(document, "mousemove touchmove", move);
    self.dragging_ = false;
  }
  // On draggin
  function move(e) {
    var x = e.pageX 
      || (e.touches && e.touches.length && e.touches[0].pageX) 
      || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageX);
    var delta = (start + x) / ol.ext.element.getStyle(elt.parentNode, 'width');
    var opacity = Math.max (0, Math.min(1, delta));
    ol.ext.element.setStyle (elt, { left: (opacity*100) + "%" });
    elt.parentNode.nextElementSibling.innerHTML = Math.round(opacity*100);
    layer.setOpacity(opacity);
  }
  // Register move
  ol.ext.element.addListener(document, "mouseup touchend touchcancel", stop);
  ol.ext.element.addListener(document, "mousemove touchmove", move);
};
/** Render a list of layer
 * @param {Elemen} element to render
 * @layers {Array{ol.layer}} list of layer to show
 * @api stable
 */
ol.control.LayerSwitcher.prototype.drawList = function(ul, collection) {
  var self = this;
  var layers = collection.getArray();
  // Change layer visibility
  var setVisibility = function(e) {
    e.stopPropagation();
    e.preventDefault();
    var l = self._getLayerForLI(this.parentNode.parentNode);
    self.switchLayerVisibility(l, collection);
  };
  // Info button click
  function onInfo(e) {
    e.stopPropagation();
    e.preventDefault(); 
    var l = self._getLayerForLI(this.parentNode.parentNode);
    self.oninfo(l); 
    self.dispatchEvent({ type: "info", layer: l });
  }
  // Zoom to extent button
  function zoomExtent(e) {
    e.stopPropagation();
    e.preventDefault(); 
    var l = self._getLayerForLI(this.parentNode.parentNode);
    if (self.onextent) self.onextent(l); 
    else self.getMap().getView().fit (l.getExtent(), self.getMap().getSize()); 
    self.dispatchEvent({ type: "extent", layer: l });
  }
  // Remove a layer on trash click
  function removeLayer(e) {
    e.stopPropagation();
    e.preventDefault();
    var li = this.parentNode.parentNode.parentNode.parentNode;
    var layer, group = self._getLayerForLI(li);
    // Remove the layer from a group or from a map
    if (group) {
      layer = self._getLayerForLI(this.parentNode.parentNode);
      group.getLayers().remove(layer);
      if (group.getLayers().getLength()==0 && !group.get('noSwitcherDelete')) {
        removeLayer.call(li.querySelectorAll('.layerTrash')[0], e);
      }
    } else {
      li = this.parentNode.parentNode;
      self.getMap().removeLayer(self._getLayerForLI(li));
    }
  }
  // Add the layer list
  for (var i=layers.length-1; i>=0; i--) {
    var layer = layers[i];
    if (!self.displayInLayerSwitcher(layer)) continue;
    var li = ol.ext.element.create('LI', {
      className: (layer.getVisible()?"visible ":" ")+(layer.get('baseLayer')?"baselayer":""),
      parent: ul
    });
    this._setLayerForLI(li, layer);
    var layer_buttons = ol.ext.element.create('DIV', {
      className: 'ol-layerswitcher-buttons',
      parent: li
    });
    // Content div
    var d = ol.ext.element.create('DIV', {
      className: 'li-content',// + (this.testLayerVisibility(layer) ? '' : ' ol-layer-hidden'),
      parent: li
    });
    // Visibility
    ol.ext.element.create('INPUT', {
      type: layer.get('baseLayer') ? 'radio' : 'checkbox',
      checked: layer.getVisible(),
      click: setVisibility,
      parent: d
    });
    // Label
    ol.ext.element.create('LABEL', {
      html: layer.get("title") || layer.get("name"),
      title: layer.get("title") || layer.get("name"),
      click: setVisibility,
      unselectable: 'on',
      style: {
        userSelect: 'none'
      },
      parent: d
    }).addEventListener('selectstart', function(){ return false; });
    //  up/down
    if (this.reordering) {
      if ( (i<layers.length-1 && (layer.get("allwaysOnTop") || !layers[i+1].get("allwaysOnTop")) )
      || (i>0 && (!layer.get("allwaysOnTop") || layers[i-1].get("allwaysOnTop")) ) ) {
        ol.ext.element.create('DIV', {
          className: 'layerup',
          title: this.tip.up,
          on: { 'mousedown touchstart': function(e) { self.dragOrdering_(e) } },
          parent: layer_buttons
        });
      }
    }
    // Show/hide sub layers
    if (layer.getLayers) {
      var nb = 0;
      layer.getLayers().forEach(function(l) {
        if (self.displayInLayerSwitcher(l)) nb++;
      });
      if (nb) {
        ol.ext.element.create('DIV', {
          className: layer.get("openInLayerSwitcher") ? "collapse-layers" : "expend-layers",
          title: this.tip.plus,
          click: function() {
            var l = self._getLayerForLI(this.parentNode.parentNode);
            l.set("openInLayerSwitcher", !l.get("openInLayerSwitcher") )
          },
          parent: layer_buttons
        });
      }
    }
    // Info button
    if (this.oninfo) {
      ol.ext.element.create('DIV', {
        className: 'layerInfo',
        title: this.tip.info,
        click: onInfo,
        parent: layer_buttons
      });
    }
    // Layer remove
    if (this.hastrash && !layer.get("noSwitcherDelete")) {
      ol.ext.element.create('DIV', {
        className: 'layerTrash',
        title: this.tip.trash,
        click: removeLayer,
        parent: layer_buttons
      });
    }
    // Layer extent
    if (this.hasextent && layers[i].getExtent()) {
      var ex = layers[i].getExtent();
      if (ex.length==4 && ex[0]<ex[2] && ex[1]<ex[3]) {
        ol.ext.element.create('DIV', {
          className: 'layerExtent',
          title: this.tip.extent,
          click: zoomExtent,
          parent: layer_buttons  
        });
      }
    }
    // Progress
    if (this.show_progress && layer instanceof ol.layer.Tile) {
      var p = ol.ext.element.create('DIV', {
        className: 'layerswitcher-progress',
        parent: d
      });
      this.setprogress_(layer);
      layer.layerswitcher_progress = ol.ext.element.create('DIV', { parent: p });
    }
    // Opacity
    var opacity = ol.ext.element.create('DIV', {
      className: 'layerswitcher-opacity',
      // Click on the opacity line
      click: function(e){
        if (e.target !== this) return;
        e.stopPropagation();
        e.preventDefault();
        var op = Math.max ( 0, Math.min( 1, e.offsetX / ol.ext.element.getStyle(this, 'width')));
        self._getLayerForLI(this.parentNode.parentNode).setOpacity(op);
      },
      parent: d
    });
    // Start dragging
    ol.ext.element.create('DIV', {
      className: 'layerswitcher-opacity-cursor',
      style: { left: (layer.getOpacity()*100)+"%" },
      on: {
        'mousedown touchstart': function(e) { self.dragOpacity_ (e); }
      },
      parent: opacity
    });
    // Percent
    ol.ext.element.create('DIV', {
      className: 'layerswitcher-opacity-label',
      html: Math.round(layer.getOpacity()*100),
      parent: d
    });
    // Layer group
    if (layer.getLayers) {
      li.classList.add('ol-layer-group');
      if (layer.get("openInLayerSwitcher") === true) {
        var ul2 = ol.ext.element.create('UL', {
          parent: li
        });
        this.drawList (ul2, layer.getLayers());
      }
    }
    else if (layer instanceof ol.layer.Vector) li.classList.add('ol-layer-vector');
    else if (layer instanceof ol.layer.VectorTile) li.classList.add('ol-layer-vector');
    else if (layer instanceof ol.layer.Tile) li.classList.add('ol-layer-tile');
    else if (layer instanceof ol.layer.Image) li.classList.add('ol-layer-image');
    else if (layer instanceof ol.layer.Heatmap) li.classList.add('ol-layer-heatmap');
    // Dispatch a dralist event to allow customisation
    this.dispatchEvent({ type:'drawlist', layer:layer, li:li });
  }
  this.viewChange();
  if (ul === this.panel_) this.overflow();
};
/** Handle progress bar for a layer
*	@private
*/
ol.control.LayerSwitcher.prototype.setprogress_ = function(layer) {
  if (!layer.layerswitcher_progress) {
    var loaded = 0;
    var loading = 0;
    var draw = function() {
      if (loading === loaded) {
        loading = loaded = 0;
        ol.ext.element.setStyle(layer.layerswitcher_progress, { width: 0 });// layer.layerswitcher_progress.width(0);
      } else {
        ol.ext.element.setStyle(layer.layerswitcher_progress, { width: (loaded / loading * 100).toFixed(1) + '%' });// layer.layerswitcher_progress.css('width', (loaded / loading * 100).toFixed(1) + '%');
      }
    }
    layer.getSource().on('tileloadstart', function() {
      loading++;
      draw();
    });
    layer.getSource().on('tileloadend', function() {
      loaded++;
      draw();
    });
    layer.getSource().on('tileloaderror', function() {
      loaded++;
      draw();
    });
  }
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Control bar for OL3
 * The control bar is a container for other controls. It can be used to create toolbars.
 * Control bars can be nested and combined with ol.control.Toggle to handle activate/deactivate.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *  @param {String} options.className class of the control
 *  @param {bool} options.group is a group, default false
 *  @param {bool} options.toggleOne only one toggle control is active at a time, default false
 *  @param {bool} options.autoDeactivate used with subbar to deactivate all control when top level control deactivate, default false
 *  @param {Array<_ol_control_>} options.controls a list of control to add to the bar
 */
ol.control.Bar = function(options) {
  if (!options) options={};
  var element = document.createElement("div");
      element.classList.add('ol-unselectable', 'ol-control', 'ol-bar');
  if (options.className) {
    var classes = options.className.split(' ').filter(function(className) {
      return className.length > 0;
    });
    element.classList.add.apply(element.classList, classes)
  }
  if (options.group) element.classList.add('ol-group');
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  this.set('toggleOne', options.toggleOne);
  this.set('autoDeactivate', options.autoDeactivate);
  this.controls_ = [];
  if (options.controls instanceof Array) {
    for (var i=0; i<options.controls.length; i++) {
      this.addControl(options.controls[i]);
    }
  }
};
ol.ext.inherits(ol.control.Bar, ol.control.Control);
/** Set the control visibility
 * @param {boolean} b
 */
ol.control.Bar.prototype.setVisible = function (val) {
  if (val) this.element.style.display = '';
  else this.element.style.display = 'none';
}
/** Get the control visibility
 * @return {boolean} b
 */
ol.control.Bar.prototype.getVisible = function () {
  return this.element.style.display != 'none';
}
/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol.control.Bar.prototype.setMap = function (map) {
  ol.control.Control.prototype.setMap.call(this, map);
  for (var i=0; i<this.controls_.length; i++) {
    var c = this.controls_[i];
    // map.addControl(c);
    c.setMap(map);
  }
};
/** Get controls in the panel
 *	@param {Array<_ol_control_>}
 */
ol.control.Bar.prototype.getControls = function () {
  return this.controls_;
};
/** Set tool bar position
 *	@param {top|left|bottom|right} pos
 */
ol.control.Bar.prototype.setPosition = function (pos) {
  this.element.classList.remove('ol-left', 'ol-top', 'ol-bottom', 'ol-right');
  pos=pos.split ('-');
  for (var i=0; i<pos.length; i++) {
    switch (pos[i]) {
      case 'top':
      case 'left':
      case 'bottom':
      case 'right':
        this.element.classList.add("ol-"+pos[i]);
        break;
      default: break;
    }
  }
};
/** Add a control to the bar
 *	@param {_ol_control_} c control to add
 */
ol.control.Bar.prototype.addControl = function (c) {
  this.controls_.push(c);
  c.setTarget(this.element);
  if (this.getMap()) {
    this.getMap().addControl(c);
  }
  // Activate and toogleOne
  c.on ('change:active', function(e) { this.onActivateControl_(e, c); }.bind(this));
  if (c.getActive) {
    // c.dispatchEvent({ type:'change:active', key:'active', oldValue:false, active:true });
    this.onActivateControl_({ target: c, active: c.getActive() }, c);
  }
};
/** Deativate all controls in a bar
 * @param {_ol_control_} except a control
 */
ol.control.Bar.prototype.deactivateControls = function (except) {
  for (var i=0; i<this.controls_.length; i++) {
  if (this.controls_[i] !== except && this.controls_[i].setActive) {
    this.controls_[i].setActive(false);
    }
  }
};
ol.control.Bar.prototype.getActiveControls = function () {
  var active = [];
  for (var i=0, c; c=this.controls_[i]; i++) {
    if (c.getActive && c.getActive()) active.push(c);
  }
  return active;
}
/** Auto activate/deactivate controls in the bar
 * @param {boolean} b activate/deactivate
 */
ol.control.Bar.prototype.setActive = function (b) {
  if (!b && this.get("autoDeactivate")) {
    this.deactivateControls();
  }
  if (b) {
    var ctrls = this.getControls();
    for (var i=0, sb; (sb = ctrls[i]); i++) {
      if (sb.get("autoActivate")) sb.setActive(true);
    }
  }
}
/** Post-process an activated/deactivated control
 *	@param {ol.event} e :an object with a target {_ol_control_} and active flag {bool}
 */
ol.control.Bar.prototype.onActivateControl_ = function (e, ctrl) {
  if (this.get('toggleOne')) {
    if (e.active) {
      var n;
      //var ctrl = e.target;
      for (n=0; n<this.controls_.length; n++) {
        if (this.controls_[n]===ctrl) break;
      }
      // Not here!
      if (n==this.controls_.length) return;
      this.deactivateControls (this.controls_[n]);
    } else {
      // No one active > test auto activate
      if (!this.getActiveControls().length) {
        for (var i=0, c; c=this.controls_[i]; i++) {
          if (c.get("autoActivate")) {
            c.setActive(true);
            break;
          }
        }
      }
    }
  }
};
/**
 * @param {string} name of the control to search
 * @return {ol.control.Control}
 */
ol.control.Bar.prototype.getControlsByName = function(name) {
  var controls = this.getControls();
  return controls.filter(
    function(control) {
      return (control.get('name') === name);
    }
  );
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A simple push button control
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *  @param {String} options.className class of the control
 *  @param {String} options.title title of the control
 *  @param {String} options.name an optional name, default none
 *  @param {String} options.html html to insert in the control
 *  @param {function} options.handleClick callback when control is clicked (or use change:active event)
 */
ol.control.Button = function(options){
  options = options || {};
  var element = document.createElement("div");
  element.className = (options.className || '') + " ol-button ol-unselectable ol-control";
  var self = this;
  var bt = this.button_ = document.createElement(/ol-text-button/.test(options.className) ? "div": "button");
  bt.type = "button";
  if (options.title) bt.title = options.title;
  if (options.html instanceof Element) bt.appendChild(options.html)
  else bt.innerHTML = options.html || "";
  var evtFunction = function(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (options.handleClick) {
      options.handleClick.call(self, e);
    }
  };
  bt.addEventListener("click", evtFunction);
  bt.addEventListener("touchstart", evtFunction);
  element.appendChild(bt);
  // Try to get a title in the button content
  if (!options.title && bt.firstElementChild) {
    bt.title = bt.firstElementChild.title;
  }
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  if (options.title) {
    this.set("title", options.title);
  }
  if (options.title) this.set("title", options.title);
  if (options.name) this.set("name", options.name);
};
ol.ext.inherits(ol.control.Button, ol.control.Control);
/** Set the control visibility
* @param {boolean} b 
*/
ol.control.Button.prototype.setVisible = function (val) {
  if (val) ol.ext.element.show(this.element);
  else ol.ext.element.hide(this.element);
};
/**
 * Set the button title
 * @param {string} title
 * @returns {undefined}
 */
ol.control.Button.prototype.setTitle = function(title) {
  this.button_.setAttribute('title', title);
};
/**
 * Set the button html
 * @param {string} html
 * @returns {undefined}
 */
ol.control.Button.prototype.setHtml = function(html) {
  ol.ext.element.setHTML (this.button_, html);
};
/**
 * Get the button element
 * @returns {undefined}
 */
ol.control.Button.prototype.getButtonElement = function() {
  return this.button_;
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc 
 *   OpenLayers 3 Attribution Control integrated in the canvas (for jpeg/png 
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol.control.Attribution}
 * @param {Object=} options extend the ol.control.Attribution options.
 * 	@param {ol.style.Style} options.style  option is usesd to draw the text.
 */
ol.control.CanvasAttribution = function(options) {
  if (!options) options = {};
  ol.control.Attribution.call(this, options);
  // Draw in canvas
  this.setCanvas(!!options.canvas);
  // Get style options
  if (!options) options={};
  if (!options.style) options.style = new ol.style.Style();
  this.setStyle (options.style);
}
ol.ext.inherits(ol.control.CanvasAttribution, ol.control.Attribution);
/**
 * Draw attribution on canvas
 * @param {boolean} b draw the attribution on canvas.
 */
ol.control.CanvasAttribution.prototype.setCanvas = function (b) {
  this.isCanvas_ = b;
  if (b) this.setCollapsed(false);
  this.element.style.visibility = b ? "hidden":"visible";
  if (this.map_) this.map_.renderSync();
};
/** Get map Canvas
 * @private
 */
ol.control.CanvasAttribution.prototype.getContext = ol.control.CanvasBase.prototype.getContext;
/**
 * Change the control style
 * @param {ol.style.Style} style
 */
ol.control.CanvasAttribution.prototype.setStyle = function (style) {
  var text = style.getText();
  this.font_ = text ? text.getFont() : "10px sans-serif";
  var stroke = text ? text.getStroke() : null;
  var fill = text ? text.getFill() : null;
  this.fontStrokeStyle_ = stroke ? ol.color.asString(stroke.getColor()) : "#fff";
  this.fontFillStyle_ = fill ? ol.color.asString(fill.getColor()) : "#000";
  this.fontStrokeWidth_ = stroke ? stroke.getWidth() : 3;
  if (this.getMap()) this.getMap().render();
};
/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.control.CanvasAttribution.prototype.setMap = function (map) {
  ol.control.CanvasBase.prototype.getCanvas.call(this, map);
  var oldmap = this.getMap();
  if (this._listener) ol.Observable.unByKey(this._listener);
  this._listener = null;
  ol.control.ScaleLine.prototype.setMap.call(this, map);
  if (oldmap) oldmap.renderSync();
  // Get change (new layer added or removed)
  if (map) {
    this._listener = map.on('postcompose', this.drawAttribution_.bind(this));
  }
  this.map_ = map;
  this.setCanvas (this.isCanvas_);
};
/** 
 * Draw attribution in the final canvas
 * @private
 */
ol.control.CanvasAttribution.prototype.drawAttribution_ = function(e) {
  if (!this.isCanvas_) return;
  var ctx = this.getContext(e);
  if (!ctx) return;
  var text = "";
  Array.prototype.slice.call(this.element.querySelectorAll('li'))
    .filter(function(el) {
      return el.style.display !== "none";
    })
    .map(function(el) {
      text += (text ? " - ":"") + el.textContent;
    });
  // Retina device
  var ratio = e.frameState.pixelRatio;
  ctx.save();
  ctx.scale(ratio,ratio);
  // Position
  var eltRect = this.element.getBoundingClientRect();
  var mapRect = this.getMap().getViewport().getBoundingClientRect();
  var sc = this.getMap().getSize()[0] / mapRect.width;
  ctx.translate((eltRect.left-mapRect.left)*sc, (eltRect.top-mapRect.top)*sc);
  var h = this.element.clientHeight;
  var w = this.element.clientWidth;
  var left = w/2 + this.element.querySelectorAll('button')[0].clientWidth;
  // Draw scale text
  ctx.beginPath();
    ctx.strokeStyle = this.fontStrokeStyle_;
    ctx.fillStyle = this.fontFillStyle_;
    ctx.lineWidth = this.fontStrokeWidth_;
    ctx.textAlign = "center";
    ctx.textBaseline ="middle";
    ctx.font = this.font_;
    ctx.strokeText(text, left, h/2);
    ctx.fillText(text, left, h/2);
  ctx.closePath();
  ctx.restore();
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc 
 *    OpenLayers 3 Scale Line Control integrated in the canvas (for jpeg/png 
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol.control.ScaleLine}
 * @param {Object=} options extend the ol.control.ScaleLine options.
 * 	@param {ol.style.Style} options.style used to draw the scale line (default is black/white, 10px Arial).
 */
ol.control.CanvasScaleLine = function(options)
{	ol.control.ScaleLine.call(this, options);
	this.scaleHeight_ = 6;
	// Get style options
	if (!options) options={};
	if (!options.style) options.style = new ol.style.Style();
	this.setStyle(options.style);
}
ol.ext.inherits(ol.control.CanvasScaleLine, ol.control.ScaleLine);
/** Get map Canvas
 * @private
 */
ol.control.CanvasScaleLine.prototype.getContext = ol.control.CanvasBase.prototype.getContext;
/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol.control.CanvasScaleLine.prototype.setMap = function (map)
{	
	ol.control.CanvasBase.prototype.getCanvas.call(this, map);
	var oldmap = this.getMap();
	if (this._listener) ol.Observable.unByKey(this._listener);
	this._listener = null;
	ol.control.ScaleLine.prototype.setMap.call(this, map);
	if (oldmap) oldmap.renderSync();
	// Add postcompose on the map
	if (map) {
		this._listener = map.on('postcompose', this.drawScale_.bind(this));
	} 
	// Hide the default DOM element
	this.element.style.visibility = 'hidden';
	this.olscale = this.element.querySelector(".ol-scale-line-inner");
}
/**
 * Change the control style
 * @param {_ol_style_Style_} style
 */
ol.control.CanvasScaleLine.prototype.setStyle = function (style)
{	var stroke = style.getStroke();
	this.strokeStyle_ = stroke ? ol.color.asString(stroke.getColor()) : "#000";
	this.strokeWidth_ = stroke ? stroke.getWidth() : 2;
	var fill = style.getFill();
	this.fillStyle_ = fill ? ol.color.asString(fill.getColor()) : "#fff";
	var text = style.getText();
	this.font_ = text ? text.getFont() : "10px Arial";
	stroke = text ? text.getStroke() : null;
	fill = text ? text.getFill() : null;
	this.fontStrokeStyle_ = stroke ? ol.color.asString(stroke.getColor()) : this.fillStyle_;
	this.fontStrokeWidth_ = stroke ? stroke.getWidth() : 3;
	this.fontFillStyle_ = fill ? ol.color.asString(fill.getColor()) : this.strokeStyle_;
	// refresh
	if (this.getMap()) this.getMap().render();
}
/** 
 * Draw attribution in the final canvas
 * @private
 */
ol.control.CanvasScaleLine.prototype.drawScale_ = function(e)
{	if ( this.element.style.visibility!=="hidden" ) return;
	var ctx = this.getContext(e);
	if (!ctx) return;
	// Get size of the scale div
	var scalewidth = parseInt(this.olscale.style.width);
	if (!scalewidth) return;
	var text = this.olscale.textContent;
	var position = {left: this.element.offsetLeft, top: this.element.offsetTop};
	// Retina device
	var ratio = e.frameState.pixelRatio;
	ctx.save();
	ctx.scale(ratio,ratio);
	// On top
	position.top += this.element.clientHeight - this.scaleHeight_;
	// Draw scale text
	ctx.beginPath();
    ctx.strokeStyle = this.fontStrokeStyle_;
    ctx.fillStyle = this.fontFillStyle_;
    ctx.lineWidth = this.fontStrokeWidth_;
    ctx.textAlign = "center";
	ctx.textBaseline ="bottom";
    ctx.font = this.font_;
	ctx.strokeText(text, position.left+scalewidth/2, position.top);
    ctx.fillText(text, position.left+scalewidth/2, position.top);
	ctx.closePath();
	// Draw scale bar
	position.top += 2;
	ctx.lineWidth = this.strokeWidth_;
	ctx.strokeStyle = this.strokeStyle_;
	var max = 4;
	var n = parseInt(text);
	while (n%10 === 0) n/=10;
	if (n%5 === 0) max = 5;
	for (var i=0; i<max; i++)
	{	ctx.beginPath();
		ctx.fillStyle = i%2 ? this.fillStyle_ : this.strokeStyle_;
		ctx.rect(position.left+i*scalewidth/max, position.top, scalewidth/max, this.scaleHeight_);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	}
	ctx.restore();
}

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * A title Control integrated in the canvas (for jpeg/png 
 *
 * @constructor
 * @extends {ol.control.CanvasBase}
 * @param {Object=} options extend the ol.control options. 
 *  @param {string} options.title the title, default 'Title'
 *  @param {ol.style.Style} options.style style used to draw the title.
 */
ol.control.CanvasTitle = function(options) {
  if (!options) options = {};
  var elt = ol.ext.element.create('DIV', {
    className: (options.className || '') + ' ol-control-title ol-unselectable',
    style: {
      display: 'block',
      visibility: 'hidden'
    }
  });
  ol.control.CanvasBase.call(this, {
    element: elt,
    style: options.style
  });
  this.setTitle(options.title || 'Title');
  this.element.style.font = this.getTextFont();
};
ol.ext.inherits(ol.control.CanvasTitle, ol.control.CanvasBase);
/**
 * Change the control style
 * @param {ol.style.Style} style
 */
ol.control.CanvasTitle.prototype.setStyle = function (style) {
  ol.control.CanvasBase.prototype.setStyle.call(this, style);
  // Element style
  if (this.element) {
    this.element.style.font = this.getTextFont();
  }
  // refresh
  if (this.getMap()) this.getMap().render();
};
/**
 * Set the map title 
 * @param {string} map title.
 * @api stable
 */
ol.control.CanvasTitle.prototype.setTitle = function (title) {
  this.element.textContent = title;
  this.set('title', title);
  if (this.getMap()) this.getMap().renderSync();
};
/**
 * Get the map title 
 * @param {string} map title.
 * @api stable
 */
ol.control.CanvasTitle.prototype.getTitle = function () {
  return this.get('title');
};
/**
 * Set control visibility
 * @param {bool} b
 * @api stable
 */
ol.control.CanvasTitle.prototype.setVisible = function (b) {
  this.element.style.display = (b ? 'block' : 'none');
  if (this.getMap()) this.getMap().renderSync();
};
/**
 * Get control visibility
 * @return {bool} 
 * @api stable
 */
ol.control.CanvasTitle.prototype.getVisible = function () {
  return this.element.style.display !== 'none';
};
/** Draw title in the final canvas
 * @private
*/
ol.control.CanvasTitle.prototype._draw = function(e) {
  if (!this.getVisible()) return;
  var ctx = this.getContext(e);
	if (!ctx) return;
  // Retina device
  var ratio = e.frameState.pixelRatio;
  ctx.save();
  ctx.scale(ratio,ratio);
  // Position
  var eltRect = this.element.getBoundingClientRect();
  var mapRect = this.getMap().getViewport().getBoundingClientRect();
  var sc = this.getMap().getSize()[0] / mapRect.width;
  ctx.translate((eltRect.left-mapRect.left)*sc, (eltRect.top-mapRect.top)*sc);
  var h = this.element.clientHeight;
  var w = this.element.clientWidth;
  var left = w/2;
  ctx.beginPath();
  ctx.fillStyle = ol.color.asString(this.getFill().getColor());
  ctx.rect(0,0, w, h);
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.fillStyle = ol.color.asString(this.getTextFill().getColor());
  ctx.strokeStyle = ol.color.asString(this.getTextStroke().getColor());
  ctx.lineWidth = this.getTextStroke().getWidth();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = this.getTextFont();
  if (ctx.lineWidth) ctx.strokeText(this.getTitle(), left, h/2);
  ctx.fillText(this.getTitle(), left, h/2);
  ctx.closePath();
  ctx.restore();
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * A Control to display map center coordinates on the canvas.
 *
 * @constructor
 * @extends {ol.control.CanvasBase}
 * @param {Object=} options extend the ol.control options. 
 *  @param {string} options.className CSS class name
 *  @param {ol.style.Style} options.style style used to draw in the canvas
 *  @param {ol.proj.ProjectionLike} options.projection	Projection. Default is the view projection.
 *  @param {ol.coordinate.CoordinateFormat} options.coordinateFormat A function that takes a ol.Coordinate and transforms it into a string.
 *  @param {boolean} options.canvas true to draw in the canvas
 */
ol.control.CenterPosition = function(options) {
  if (!options) options = {};
  var elt = ol.ext.element.create('DIV', {
    className: (options.className || '') + ' ol-center-position ol-unselectable',
    style: {
      display: 'block',
      visibility: 'hidden'
    }
  });
  ol.control.CanvasBase.call(this, {
    element: elt,
    style: options.style
  });
  this.element.style.font = this.getTextFont();
  this.set('projection', options.projection);
  this.setCanvas(options.canvas);
  this._format = (typeof options.coordinateFormat === 'function') ? options.coordinateFormat : ol.coordinate.toStringXY; 
};
ol.ext.inherits(ol.control.CenterPosition, ol.control.CanvasBase);
/**
 * Change the control style
 * @param {ol.style.Style} style
 */
ol.control.CenterPosition.prototype.setStyle = function (style) {
  ol.control.CanvasBase.prototype.setStyle.call(this, style);
  // Element style
  if (this.element) {
    this.element.style.font = this.getTextFont();
  }
  // refresh
  if (this.getMap()) this.getMap().render();
};
/**
 * Draw on canvas
 * @param {boolean} b draw the attribution on canvas.
 */
ol.control.CenterPosition.prototype.setCanvas = function (b) {
  this.set('canvas', b);
	this.element.style.visibility = b ? "hidden":"visible";
	if (this.getMap()) this.getMap().renderSync();
};
/**
 * Set control visibility
 * @param {bool} b
 * @api stable
 */
ol.control.CenterPosition.prototype.setVisible = function (b) {
  this.element.style.display = (b ? '' : 'none');
  if (this.getMap()) this.getMap().renderSync();
};
/**
 * Get control visibility
 * @return {bool} 
 * @api stable
 */
ol.control.CenterPosition.prototype.getVisible = function () {
  return this.element.style.display !== 'none';
};
/** Draw position in the final canvas
 * @private
*/
ol.control.CenterPosition.prototype._draw = function(e) {
  if (!this.getVisible() || !this.getMap()) return;
  // Coordinate
  var coord = this.getMap().getView().getCenter();
  if (this.get('projection')) coord = ol.proj.transform (coord, this.getMap().getView().getProjection(), this.get('projection'));
  coord  = this._format(coord);
  this.element.textContent = coord;
  if (!this.get('canvas')) return;
  var ctx = this.getContext(e);
	if (!ctx) return;
  // Retina device
  var ratio = e.frameState.pixelRatio;
  ctx.save();
  ctx.scale(ratio,ratio);
  // Position
  var eltRect = this.element.getBoundingClientRect();
  var mapRect = this.getMap().getViewport().getBoundingClientRect();
  var sc = this.getMap().getSize()[0] / mapRect.width;
  ctx.translate((eltRect.left-mapRect.left)*sc, (eltRect.top-mapRect.top)*sc);
  var h = this.element.clientHeight;
  var w = this.element.clientWidth;
  ctx.beginPath();
  ctx.fillStyle = ol.color.asString(this.getTextFill().getColor());
  ctx.strokeStyle = ol.color.asString(this.getTextStroke().getColor());
  ctx.lineWidth = this.getTextStroke().getWidth();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = this.getTextFont();
  if (ctx.lineWidth) ctx.strokeText(coord, w/2, h/2);
  ctx.fillText(coord, w/2, h/2);
  ctx.closePath();
  ctx.restore();
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Draw a compass on the map. The position/size of the control is defined in the css.
 *
 * @constructor
 * @extends {ol.control.CanvasBase}
 * @param {Object=} options Control options. The style {_ol_style_Stroke_} option is usesd to draw the text.
 *  @param {string} options.className class name for the control
 *  @param {Image} options.image an image, default use the src option or a default image
 *  @param {string} options.src image src, default use the image option or a default image
 *  @param {boolean} options.rotateVithView rotate vith view (false to show watermark), default true
 *  @param {ol.style.Stroke} options.style style to draw the lines, default draw no lines
 */
ol.control.Compass = function(options) {
  var self = this;
  if (!options) options = {};
  // Initialize parent
  var elt = document.createElement("div");
  elt.className = "ol-compassctrl ol-unselectable ol-hidden" + (options.className ? " "+options.className : "");
  elt.style.position = "absolute";
  elt.style.visibility = "hidden";
  var style = (options.style instanceof ol.style.Stroke) ? new ol.style.Style({stroke: options.style}) : options.style;
  if (!options.style) {
    style = new ol.style.Style({stroke: new ol.style.Stroke({width:0}) });
  }
  ol.control.CanvasBase.call(this, { 
    element: elt,
    style: style
  });
  this.set('rotateVithView', options.rotateWithView!==false);
  // The image
  if (options.image) {
    this.img_ = options.image;
  }
  else if (options.src) {
    this.img_ = new Image();
    this.img_.onload = function(){ if (self.getMap()) self.getMap().renderSync(); }
    this.img_.src = options.src;
  } else {
    this.img_ = this.defaultCompass_(this.element.clientWidth, this.getStroke().getColor());
  }
  // 8 angles
  this.da_ = [];
  for (var i=0; i<8; i++) this.da_[i] = [ Math.cos(Math.PI*i/8), Math.sin(Math.PI*i/8) ];
};
ol.ext.inherits(ol.control.Compass, ol.control.CanvasBase);
/**
 * Create a default image.
 * @param {number} s the size of the compass
 * @private
 */
ol.control.Compass.prototype.defaultCompass_ = function (s, color) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext("2d");
  s = canvas.width = canvas.height = s || 150;
  var r = s/2;
  var r2 = 0.22*r;
  function draw (r, r2) {
    ctx.fillStyle = color ||"#963";
    ctx.beginPath();
    ctx.moveTo (0,0); 
    ctx.lineTo (r,0); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (-r,0); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
    ctx.lineTo (0,r); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (0,-r); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
    ctx.fill();
    ctx.stroke();
  }
  function draw2 (r, r2) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo (0,0); 
    ctx.lineTo (r,0); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
    ctx.lineTo (-r,0); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (0,r); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (0,-r); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
    ctx.fill();
    ctx.globalCompositeOperation="source-over";
    ctx.beginPath();
    ctx.moveTo (0,0); 
    ctx.lineTo (r,0); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
    ctx.lineTo (-r,0); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (0,r); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
    ctx.lineTo (0,-r); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
    ctx.stroke();
  }
  ctx.translate(r,r);
  ctx.strokeStyle = color || "#963";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc (0,0, s*0.41, 0, 2*Math.PI);
  ctx.arc (0,0, s*0.44, 0, 2*Math.PI);
  ctx.stroke();
  ctx.rotate(Math.PI/4)
  draw (r*0.9, r2*0.8);
  draw2 (r*0.9, r2*0.8);
  ctx.rotate(-Math.PI/4)
  draw (r, r2);
  draw2 (r, r2);
  return canvas;
};
/** Draw compass
* @param {ol.event} e postcompose event
* @private
*/
ol.control.Compass.prototype._draw = function(e) {
  var ctx = this.getContext(e);
  if (!ctx) return;
  var canvas = ctx.canvas;
  // Retina device
  var ratio = e.frameState.pixelRatio;
  ctx.save();
  ctx.scale(ratio,ratio);
  var w = this.element.clientWidth;
  var h = this.element.clientHeight;
  var pos = {left: this.element.offsetLeft, top: this.element.offsetTop};
  var compass = this.img_;
  var rot = e.frameState.viewState.rotation;
  ctx.beginPath();
    ctx.translate(pos.left+w/2, pos.top+h/2);
    if (this.get('rotateVithView')) ctx.rotate(rot);
    /*
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = this.opacity || 1;
    */
    if (this.getStroke().getWidth()) {
      ctx.beginPath();
        ctx.strokeStyle = this.getStroke().getColor();
        ctx.lineWidth = this.getStroke().getWidth();
        var m = Math.max(canvas.width, canvas.height);
        for (var i=0; i<8; i++) {
          ctx.moveTo (-this.da_[i][0]*m, -this.da_[i][1]*m);
          ctx.lineTo (this.da_[i][0]*m, this.da_[i][1]*m);
        }
      ctx.stroke();
    }
    if (compass.width) {
      ctx.drawImage (compass, -w/2, -h/2, w, h);
    }
  ctx.closePath();
  ctx.restore();
};

/** 
 * @classdesc
 * Application dialog
 * @extends {ol.control.Control}
 * @constructor
 * @param {*} options
 *  @param {string} options.className
 *  @param {ol.Map} options.map the map to place the dialog inside
 *  @param {Element} options.target target to place the dialog
 *  @param {boolean} options.zoom add a zoom effect
 *  @param {boolean} options.closeBox add a close button
 *  @param {boolean} options.hideOnClick close dialog when click the background
 */
ol.control.Dialog = function(options) {
  options = options || {};
  // Constructor
  var element = ol.ext.element.create('DIV', {
    className: ((options.className || '') + (options.zoom ? ' ol-zoom':'') + ' ol-ext-dialog').trim(),
    click: function() {
      if (this.get('hideOnClick')) this.close();
    }.bind(this)
  });
  // form
  var form = ol.ext.element.create('FORM', {
    on: {
      submit: this._onButton('submit')
    },
    parent: element
  });
  // Title
  ol.ext.element.create('H2', {
    parent: form
  });
  // Close box
  ol.ext.element.create('DIV', {
    className: 'ol-closebox',
    click: this._onButton('cancel'),
    parent: form
  });
  // Content
  ol.ext.element.create('DIV', {
    className: 'ol-content',
    parent: form
  });
  // Buttons
  ol.ext.element.create('DIV', {
    className: 'ol-buttons',
    parent: form
  });
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  this.set('closeBox', options.closeBox);
  this.set('zoom', options.zoom);
  this.set('hideOnClick', options.hideOnClick);
  this.set('className', options.className);
};
ol.ext.inherits(ol.control.Dialog, ol.control.Control);
/** Show a new dialog 
 * @param { * | Element | string } options options or a content to show
 *  @param {Element | string} options.content dialog content
 *  @param {string} options.title title of the dialog
 *  @param {Object} options.buttons a key/value list of button to show 
 */
ol.control.Dialog.prototype.show = function(options) {
  if (options instanceof Element || typeof(options) === 'string') {
    options = { content: options };
  }
  this.setContent(options);
  this.element.classList.add('ol-visible');
  this.dispatchEvent ({ type: 'show' });
};
/** Open the dialog
 */
ol.control.Dialog.prototype.open = function() {
  this.show();
};
/** Set the dialog content
 * @param {*} options
 *  @param {Element | String} options.content dialog content
 *  @param {string} options.title title of the dialog
 *  @param {string} options.className dialog class name
 *  @param {Object} options.buttons a key/value list of button to show 
 */
ol.control.Dialog.prototype.setContent = function(options) {
  if (!options) return;
  this.element.className = 'ol-ext-dialog' + (this.get('zoom') ? ' ol-zoom' : '');
  if (options.className) {
    this.element.classList.add(options.className);
  } else if (this.get('className')) {
    this.element.classList.add(this.get('className'));
  }
  var form = this.element.querySelector('form');
  ol.ext.element.setHTML(form.querySelector('.ol-content'), options.content || '');
  // Title
  form.querySelector('h2').innerText = options.title || '';
  if (options.title) {
    form.classList.add('ol-title');
  } else {
    form.classList.remove('ol-title');
  }
  // Closebox
  if (options.closeBox || (this.get('closeBox') && options.closeBox !== false)) {
    form.classList.add('ol-closebox');
  } else {
    form.classList.remove('ol-closebox');
  }
  // Buttons
  var buttons = this.element.querySelector('.ol-buttons');
  buttons.innerHTML = '';
  if (options.buttons) {
    form.classList.add('ol-button');
    for (var i in options.buttons) {
      ol.ext.element.create ('INPUT', {
        type: (i==='submit' ? 'submit':'button'),
        value: options.buttons[i],
        click: this._onButton(i),
        parent: buttons
      });
    }
  } else {
    form.classList.remove('ol-button');
  }
};
/** Do something on button click
 * @private
 */
ol.control.Dialog.prototype._onButton = function(button) {
  var fn = function(e) {
    e.preventDefault();
    this.hide();
    var inputs = {};
    this.element.querySelectorAll('form input').forEach (function(input) {
      if (input.className) inputs[input.className] = input;
    });
    this.dispatchEvent ({ type: 'button', button: button, inputs: inputs });
  }.bind(this);
  return fn;
};
/** Close the dialog 
 */
ol.control.Dialog.prototype.hide = function() {
  this.element.classList.remove('ol-visible');
  this.dispatchEvent ({ type: 'hide' });
};
/** Close the dialog 
 * @method Dialog.close
 * @return {bool} true if a dialog is closed
 */
ol.control.Dialog.prototype.close = ol.control.Dialog.prototype.hide;
/** The dialog is shown
 * @return {bool} true if a dialog is open
 */
ol.control.Dialog.prototype.isOpen = function() {
  return (this.element.classList.contains('ol-visible'));
};

/** A simple control to disable all actions on the map.
 * The control will create an invisible div over the map.
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *		@param {String} options.class class of the control
 *		@param {String} options.html html code to insert in the control
 *		@param {bool} options.on the control is on
 *		@param {function} options.toggleFn callback when control is clicked 
 */
ol.control.Disable = function(options)
{	options = options||{};
	var element = document.createElement("div");
			element.className = (options.className||""+' ol-disable ol-unselectable ol-control').trim();
	var stylesOptions = { top:"0px", left:"0px", right:"0px", bottom:"0px", "zIndex":10000, background:"none", display:"none" };
	Object.keys(stylesOptions).forEach(function(styleKey) {
		element.style[styleKey] = stylesOptions[styleKey];
	});
	ol.control.Control.call(this,
	{	element: element
	});
}
ol.ext.inherits(ol.control.Disable, ol.control.Control);
/** Test if the control is on
 * @return {bool}
 * @api stable
 */
ol.control.Disable.prototype.isOn = function()
{	return this.element.classList.contains("ol-disable");
}
/** Disable all action on the map
 * @param {bool} b, default false
 * @api stable
 */
ol.control.Disable.prototype.disableMap = function(b)
{	if (b) 
	{	this.element.classList.add("ol-enable").show();
	}
	else 
	{	this.element.classList.remove("ol-enable").hide();
	}
}

/** Control bar for editing in a layer
 * @constructor
 * @extends {ol.control.Bar}
 * @fires info
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {String} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {boolean} options.edition false to remove the edition tools, default true
 *	@param {Object} options.interactions List of interactions to add to the bar 
 *    ie. Select, Delete, Info, DrawPoint, DrawLine, DrawPolygon
 *    Each interaction can be an interaction or true (to get the default one) or false to remove it from bar
 *	@param {ol.source.Vector} options.source Source for the drawn features. 
 */
ol.control.EditBar = function(options) {
  options = options || {};
  options.interactions = options.interactions || {};
  // New bar
	ol.control.Bar.call(this, {
    className: (options.className ? options.className+' ': '') + 'ol-editbar',
    toggleOne: true,
		target: options.target
  });
  this._source = options.source;
  // Add buttons / interaction
  this._interactions = {};
  this._setSelectInteraction(options);
  if (options.edition!==false) this._setEditInteraction(options);
  this._setModifyInteraction(options);
};
ol.ext.inherits(ol.control.EditBar, ol.control.Bar);
/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol.control.EditBar.prototype.setMap = function (map) {
  if (this.getMap()) {
    if (this._interactions.Delete) this.getMap().removeInteraction(this._interactions.Delete);
    if (this._interactions.ModifySelect) this.getMap().removeInteraction(this._interactions.ModifySelect);
  }
  ol.control.Bar.prototype.setMap.call(this, map);
  if (this.getMap()) {
    if (this._interactions.Delete) this.getMap().addInteraction(this._interactions.Delete);
    if (this._interactions.ModifySelect) this.getMap().addInteraction(this._interactions.ModifySelect);
  }
};
/** Get an interaction associated with the bar
 * @param {string} name 
 */
ol.control.EditBar.prototype.getInteraction = function (name) {
  return this._interactions[name];
};
/** Get the option title */
ol.control.EditBar.prototype._getTitle = function (option) {
  return (option && option.title) ? option.title : option;
};
/** Add selection tool:
 * 1. a toggle control with a select interaction
 * 2. an option bar to delete / get information on the selected feature
 * @private
 */
ol.control.EditBar.prototype._setSelectInteraction = function (options) {
  var self = this;
  // Sub bar
  var sbar = new ol.control.Bar();
  var selectCtrl;
  // Delete button
  if (options.interactions.Delete !== false) {
    if (options.interactions.Delete instanceof ol.interaction.Delete) {
      this._interactions.Delete = options.interactions.Delete; 
    } else {
      this._interactions.Delete = new ol.interaction.Delete();
    }
    var del = this._interactions.Delete;
    del.setActive(false);
    if (this.getMap()) this.getMap().addInteraction(del);
    sbar.addControl (new ol.control.Button({
      className: 'ol-delete',
      title: this._getTitle(options.interactions.Delete) || "Delete",
      handleClick: function(e) {
        // Delete selection
        del.delete(selectCtrl.getInteraction().getFeatures());
        console.log('del')
        var evt = {
          type: 'select',
          selected: [],
          deselected: selectCtrl.getInteraction().getFeatures().getArray().slice(),
          mapBrowserEvent: e.mapBrowserEvent
        };
        selectCtrl.getInteraction().getFeatures().clear();
        selectCtrl.getInteraction().dispatchEvent(evt);
      }
    }));
  }
  // Info button
  if (options.interactions.Info !== false) {
    sbar.addControl (new ol.control.Button({
      className: 'ol-info',
      title: this._getTitle(options.interactions.Info) || "Show informations",
      handleClick: function() {
        self.dispatchEvent({ 
          type: 'info', 
          features: selectCtrl.getInteraction().getFeatures() 
        });
      }
    }));
  }
  // Select button
  if (options.interactions.Select !== false) {
    if (options.interactions.Select instanceof ol.interaction.Select) {
      this._interactions.Select = options.interactions.Select
    } else {
      this._interactions.Select = new ol.interaction.Select({
        condition: ol.events.condition.click
      });
    }
    var sel = this._interactions.Select;
    selectCtrl = new ol.control.Toggle({
      className: 'ol-selection',
      title: this._getTitle(options.interactions.Select) || "Select",
      interaction: sel,
      bar: sbar.getControls().length ? sbar : undefined,
      autoActivate:true,
      active:true
    });
    this.addControl(selectCtrl);
    sel.on('change:active', function() {
      sel.getFeatures().clear();
    });
  }
};
/** Add editing tools
 * @private
 */ 
ol.control.EditBar.prototype._setEditInteraction = function (options) {
  if (options.interactions.DrawPoint !== false) {
    if (options.interactions.DrawPoint instanceof ol.interaction.Draw) {
      this._interactions.DrawPoint = options.interactions.DrawPoint;
    } else {
      this._interactions.DrawPoint = new ol.interaction.Draw({
        type: 'Point',
        source: this._source
      });
    }
    var pedit = new ol.control.Toggle({
      className: 'ol-drawpoint',
      title: this._getTitle(options.interactions.DrawPoint) || 'Point',
      interaction: this._interactions.DrawPoint
    });
    this.addControl ( pedit );
  }
  if (options.interactions.DrawLine !== false) {
    if (options.interactions.DrawLine instanceof ol.interaction.Draw) {
      this._interactions.DrawLine = options.interactions.DrawLine
    } else {
      this._interactions.DrawLine = new ol.interaction.Draw ({
        type: 'LineString',
        source: this._source,
        // Count inserted points
        geometryFunction: function(coordinates, geometry) {
          if (geometry) geometry.setCoordinates(coordinates);
          else geometry = new ol.geom.LineString(coordinates);
          this.nbpts = geometry.getCoordinates().length;
          return geometry;
        }
      });
    }
    var ledit = new ol.control.Toggle({
      className: 'ol-drawline',
      title: this._getTitle(options.interactions.DrawLine) || 'LineString',
      interaction: this._interactions.DrawLine,
      // Options bar associated with the control
      bar: new ol.control.Bar ({
        controls:[ 
          new ol.control.TextButton({
            html: this._getTitle(options.interactions.UndoDraw) || 'undo',
            title: this._getTitle(options.interactions.UndoDraw) || "delete last point",
            handleClick: function() {
              if (ledit.getInteraction().nbpts>1) ledit.getInteraction().removeLastPoint();
            }
          }),
          new ol.control.TextButton ({
            html: this._getTitle(options.interactions.FinishDraw) || 'finish',
            title: this._getTitle(options.interactions.FinishDraw) || "finish",
            handleClick: function() {
              // Prevent null objects on finishDrawing
              if (ledit.getInteraction().nbpts>2) ledit.getInteraction().finishDrawing();
            }
          })
        ]
      }) 
    });
    this.addControl ( ledit );
  }
  if (options.interactions.DrawPolygon !== false) {
    if (options.interactions.DrawPolygon instanceof ol.interaction.Draw){
      this._interactions.DrawPolygon = options.interactions.DrawPolygon
    } else {
      this._interactions.DrawPolygon = new ol.interaction.Draw ({
        type: 'Polygon',
        source: this._source,
        // Count inserted points
        geometryFunction: function(coordinates, geometry) {
          this.nbpts = coordinates[0].length;
          if (geometry) geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
          else geometry = new ol.geom.Polygon(coordinates);
          return geometry;
        }
      });
    }
    this._setDrawPolygon(
      'ol-drawpolygon', 
      this._interactions.DrawPolygon, 
      this._getTitle(options.interactions.DrawPolygon) || 'Polygon', 
      options
    );
  }
  // Draw hole
  if (options.interactions.DrawHole !== false) {
    if (options.interactions.DrawHole instanceof ol.interaction.DrawHole){
      this._interactions.DrawHole = options.interactions.DrawHole;
    } else {
      this._interactions.DrawHole = new ol.interaction.DrawHole ();
    }
    this._setDrawPolygon(
      'ol-drawhole', 
      this._interactions.DrawHole, 
      this._getTitle(options.interactions.DrawHole) || 'Hole', 
      options
    );
  }
  // Draw regular
  if (options.interactions.DrawRegular !== false) {
    if (options.interactions.DrawRegular instanceof ol.interaction.DrawRegular) {
      this._interactions.DrawRegular = options.interactions.DrawRegular
    } else {
      this._interactions.DrawRegular = new ol.interaction.DrawRegular ({
        source: this._source,
        sides: 4
      });
    }
    var regular = this._interactions.DrawRegular;
    var div = document.createElement('DIV');
    var down = ol.ext.element.create('DIV', { parent: div });
    ol.ext.element.addListener(down, ['click', 'touchstart'], function() {
      var sides = regular.getSides() -1;
      if (sides < 2) sides = 2;
      regular.setSides (sides);
      text.textContent = sides>2 ? sides+' pts' : 'circle';
    }.bind(this));
    var text = ol.ext.element.create('TEXT', { html:'4 pts', parent: div });
    var up = ol.ext.element.create('DIV', { parent: div });
    ol.ext.element.addListener(up, ['click', 'touchstart'], function() {
      var sides = regular.getSides() +1;
      if (sides<3) sides=3;
      regular.setSides(sides);
      text.textContent = sides+' pts';
    }.bind(this));
    var ctrl = new ol.control.Toggle({
      className: 'ol-drawregular',
      title: this._getTitle(options.interactions.DrawRegular) || 'Regular',
      interaction: this._interactions.DrawRegular,
      // Options bar associated with the control
      bar: new ol.control.Bar ({
        controls:[ 
          new ol.control.TextButton({
            html: div
          })
        ]
      }) 
    });
    this.addControl (ctrl);
  }
};
/**
 * @private
 */
ol.control.EditBar.prototype._setDrawPolygon = function (className, interaction, title, options) {
  var fedit = new ol.control.Toggle ({
    className: className,
    title: title,
    interaction: interaction,
    // Options bar associated with the control
    bar: new ol.control.Bar({
      controls:[ 
        new ol.control.TextButton ({
          html: this._getTitle(options.interactions.UndoDraw) || 'undo',
          title: this._getTitle(options.interactions.UndoDraw) || 'undo last point',
          handleClick: function(){
            if (fedit.getInteraction().nbpts>1) fedit.getInteraction().removeLastPoint();
          }
        }),
        new ol.control.TextButton({
          html: this._getTitle(options.interactions.FinishDraw) || 'finish',
          title: this._getTitle(options.interactions.FinishDraw) || 'finish',
          handleClick: function() {
            // Prevent null objects on finishDrawing
            if (fedit.getInteraction().nbpts>3) fedit.getInteraction().finishDrawing();
          }
        })
      ]
    }) 
  });
  this.addControl (fedit);
};
/** Add modify tools
 * @private
 */ 
ol.control.EditBar.prototype._setModifyInteraction = function (options) {
  // Modify on selected features
  if (options.interactions.ModifySelect !== false && options.interactions.Select !== false) {
    if (options.interactions.ModifySelect instanceof ol.interaction.ModifyFeature) {
      this._interactions.ModifySelect = options.interactions.ModifySelect;
    } else {
      this._interactions.ModifySelect = new ol.interaction.ModifyFeature({
        features: this.getInteraction('Select').getFeatures()
      });
    }
    if (this.getMap()) this.getMap().addInteraction(this._interactions.ModifySelect);
    // Activate with select
    this._interactions.ModifySelect.setActive(this._interactions.Select.getActive());
    this._interactions.Select.on('change:active', function() {
      this._interactions.ModifySelect.setActive(this._interactions.Select.getActive());
    }.bind(this));
  }
  if (options.interactions.Transform !== false) {
    if (options.interactions.Transform instanceof ol.interaction.Transform) {
      this._interactions.Transform = options.interactions.Transform;
    } else {
      this._interactions.Transform = new ol.interaction.Transform ({
        addCondition: ol.events.condition.shiftKeyOnly
      });
    }
    var transform = new ol.control.Toggle ({
      html: '<i></i>',
      className: 'ol-transform',
      title: this._getTitle(options.interactions.Transform) || 'Transform',
      interaction: this._interactions.Transform
    });
    this.addControl (transform);
  }
  if (options.interactions.Split !== false) {
    if (options.interactions.Split instanceof ol.interaction.Split) {
      this._interactions.Split = options.interactions.Split;
    } else {
      this._interactions.Split = new ol.interaction.Split ({
          sources: this._source
      });
    }
    var split = new ol.control.Toggle ({
      className: 'ol-split',
      title: this._getTitle(options.interactions.Split) || 'Split',
      interaction: this._interactions.Split
    });
    this.addControl (split);
  }
  if (options.interactions.Offset !== false) {
    if (options.interactions.Offset instanceof ol.interaction.Offset) {
      this._interactions.Offset = options.interactions.Offset;
    } else {
      this._interactions.Offset = new ol.interaction.Offset ({
          source: this._source
      });
    }
    var offset = new ol.control.Toggle ({
      html: '<i></i>',
      className: 'ol-offset',
      title: this._getTitle(options.interactions.Offset) || 'Offset',
      interaction: this._interactions.Offset
    });
    this.addControl (offset);
  }
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A simple gauge control to display level information on the map.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *		@param {String} options.className class of the control
 *		@param {String} options.title title of the control
 *		@param {number} options.max maximum value, default 100;
 *		@param {number} options.val the value, default 0
 */
ol.control.Gauge = function(options)
{	options = options || {};
	var element = document.createElement("div");
			element.className = ((options.className||"") + ' ol-gauge ol-unselectable ol-control').trim();
	this.title_ = document.createElement("span");
	element.appendChild(this.title_);
	this.gauge_ = document.createElement("button");
	this.gauge_.setAttribute('type','button');
	element.appendChild(document.createElement("div").appendChild(this.gauge_))
	this.gauge_.style.width = '0px';
	ol.control.Control.call(this,
	{	element: element,
		target: options.target
	});
	this.setTitle(options.title);
	this.val(options.val);
	this.set("max", options.max||100);
};
ol.ext.inherits(ol.control.Gauge, ol.control.Control);
/** Set the control title
* @param {string} title
*/
ol.control.Gauge.prototype.setTitle = function(title)
{	this.title_.innerHTML = title||"";
	if (!title) this.title_.display = 'none';
	else this.title_.display = '';
};
/** Set/get the gauge value
* @param {number|undefined} v the value or undefined to get it
* @return {number} the value
*/
ol.control.Gauge.prototype.val = function(v)
{	if (v!==undefined)
	{	this.val_ = v;
		this.gauge_.style.width = (v/this.get('max')*100)+"%";
	}
	return this.val_;
};

/** Bookmark positions on ol maps.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires add
 * @fires remove
 * @param {} options Geobookmark's options
 *  @param {string} options.className default ol-bookmark
 *  @param {string} options.placeholder input placeholder, default Add a new geomark...
 *  @param {bool} options.editable enable modification, default true
 *  @param {string} options.namespace a namespace to save the boolmark (if more than one on a page), default ol
 *  @param {Array<any>} options.marks a list of default bookmarks: 
 * @see [Geobookmark example](../../examples/map.control.geobookmark.html)
 * @example 
var bm = new GeoBookmark ({ 
  marks: {
    "Paris": {pos:_ol_proj_.transform([2.351828, 48.856578], 'EPSG:4326', 'EPSG:3857'), zoom:11, permanent: true },
    "London": {pos:_ol_proj_.transform([-0.1275,51.507222], 'EPSG:4326', 'EPSG:3857'), zoom:12}
  }
});
 */
ol.control.GeoBookmark = function(options) {
  options = options || {};
  var self = this;
  var element = document.createElement('div');
  if (options.target) {
    element.className = options.className || "ol-bookmark";
  } else {
    element.className = (options.className || "ol-bookmark") +
          " ol-unselectable ol-control ol-collapsed";
    element.addEventListener("mouseleave", function() {
      if (input !== document.activeElement) {
        menu.style.display = 'none';
      }
    });
    // Show bookmarks on click
    this.button = document.createElement('button');
    this.button.setAttribute('type', 'button');
    this.button.addEventListener('click', function() {
      menu.style.display = (menu.style.display === '' || menu.style.display === 'none' ? 'block': 'none');
    });
    element.appendChild(this.button);
  }
  // The menu
  var menu = document.createElement('div');
  element.appendChild(menu);
  var ul = document.createElement('ul');
  menu.appendChild(ul);
  var input = document.createElement('input');
  input.setAttribute("placeholder", options.placeholder || "Add a new geomark...")
  input.addEventListener("change", function() {
    var title = this.value;
    if (title) {
      self.addBookmark(title);
      this.value = '';
      self.dispatchEvent({
        type: "add",
        name: title
      });
    }
    menu.style.display = 'none';
  });
  input.addEventListener("blur", function() {
    menu.style.display = 'none';
  });
  menu.appendChild(input);
  // Init
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  this.on("propertychange", function(e) {
    if (e.key==='editable') {
      element.className = element.className.replace(" ol-editable","");
      if (this.get('editable')) {
        element.className += " ol-editable";
      }
    }
    // console.log(e);
  }.bind(this));
  this.set("namespace", options.namespace || 'ol');
  this.set("editable", options.editable !== false);
  // Set default bmark
  this.setBookmarks(localStorage[this.get('namespace')+"@bookmark"] ? null:options.marks);
};
ol.ext.inherits(ol.control.GeoBookmark, ol.control.Control);
/** Set bookmarks
* @param {} bmark a list of bookmarks, default retreave in the localstorage
* @example 
bm.setBookmarks({ 
  "Paris": {pos:_ol_proj_.transform([2.351828, 48.856578], 'EPSG:4326', 'EPSG:3857'), zoom:11, permanent: true },
  "London": {pos:_ol_proj_.transform([-0.1275,51.507222], 'EPSG:4326', 'EPSG:3857'), zoom:12}
});
*/
ol.control.GeoBookmark.prototype.setBookmarks = function(bmark) {
  if (!bmark) bmark = JSON.parse(localStorage[this.get('namespace')+"@bookmark"] || "{}");
  var modify = this.get("editable");
  var ul = this.element.querySelector("ul");
  var menu = this.element.querySelector("div");
  var self = this;
  ul.innerHTML = '';
  for (var b in bmark) {
    var li = document.createElement('li');
    li.textContent = b;
    li.setAttribute('data-bookmark', JSON.stringify(bmark[b]));
    li.addEventListener('click', function() {
      var bm = JSON.parse(this.getAttribute("data-bookmark"));
      self.getMap().getView().setCenter(bm.pos);
      self.getMap().getView().setZoom(bm.zoom);
      menu.style.display = 'none';
    });
    ul.appendChild(li);
    if (modify && !bmark[b].permanent) {
      var button = document.createElement('button');
      button.setAttribute('data-name', b);
      button.setAttribute("title", "Suppr.");
      button.addEventListener('click', function(e) {
        self.removeBookmark(this.getAttribute("data-name"));
        self.dispatchEvent({ type: "remove", name: this.getAttribute("data-name") });
        e.stopPropagation();
      });
      li.appendChild(button);
    }
  }
  localStorage[this.get('namespace')+"@bookmark"] = JSON.stringify(bmark);
};
/** Get Geo bookmarks
* @return {any} a list of bookmarks : { BM1:{pos:ol.coordinates, zoom: integer}, BM2:{pos:ol.coordinates, zoom: integer} }
*/
ol.control.GeoBookmark.prototype.getBookmarks = function() {
  return JSON.parse(localStorage[this.get('namespace')+"@bookmark"] || "{}");
};
/** Remove a Geo bookmark
* @param {string} name
*/
ol.control.GeoBookmark.prototype.removeBookmark = function(name) {
  if (!name) {
    return;
  }
  var bmark = this.getBookmarks();
  delete bmark[name];
  this.setBookmarks(bmark);
};
/** Add a new Geo bookmark (replace existing one if any)
* @param {string} name name of the bookmark (display in the menu)
* @param {_ol_coordinate_} position default current position
* @param {number} zoom default current map zoom
* @param {bool} permanent prevent from deletion, default false
*/
ol.control.GeoBookmark.prototype.addBookmark = function(name, position, zoom, permanent)
{
  if (!name) return;
  var bmark = this.getBookmarks();
  // Don't override permanent bookmark
  if (bmark[name] && bmark[name].permanent) return;
  // Create or override
  bmark[name] = {
    pos: position || this.getMap().getView().getCenter(),
    zoom: zoom || this.getMap().getView().getZoom(),
	permanent: !!permanent
  };
  this.setBookmarks(bmark);
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Control bar for OL3
 * The control bar is a container for other controls. It can be used to create toolbars.
 * Control bars can be nested and combined with ol.control.Toggle to handle activate/deactivate.
 *
 * @constructor
 * @extends {ol.control.Bar}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {String} options.centerLabel label for center button, default center
 */
ol.control.GeolocationBar = function(options) {
  if (!options) options = {};
  options.className = options.className || 'ol-geobar';
  ol.control.Bar.call(this, options);
  this.setPosition(options.position || 'bottom-right');
  var element = this.element;
  // Geolocation draw interaction
  var interaction = new ol.interaction.GeolocationDraw({
    source: options.source,
    zoom: options.zoom,
    followTrack: options.followTrack,
    minAccuracy: options.minAccuracy || 10000
  });
  this._geolocBt = new ol.control.Toggle ({
    className: 'geolocBt',
    interaction: interaction,
    onToggle: function() {
      interaction.pause(true);
      interaction.setFollowTrack(options.followTrack);
      element.classList.remove('pauseTrack');
    }
  });
  this.addControl(this._geolocBt);
  this._geolocBt.setActive(false);
  // Buttons
  var bar = new ol.control.Bar();
  this.addControl(bar);
  var centerBt = new ol.control.TextButton ({
    className: 'centerBt',
    html: options.centerLabel ||'center',
    handleClick: function() {
      interaction.setFollowTrack('auto');
    }
  });
  bar.addControl(centerBt);
  var startBt = new ol.control.Button ({
    className: 'startBt',
    handleClick: function(){
      interaction.pause(false);
      interaction.setFollowTrack('auto');
      element.classList.add('pauseTrack');
    }
  });
  bar.addControl(startBt);
  var pauseBt = new ol.control.Button ({
    className: 'pauseBt',
    handleClick: function(){
      interaction.pause(true);
      interaction.setFollowTrack('auto');
      element.classList.remove('pauseTrack');
    }
  });
  bar.addControl(pauseBt);
  interaction.on('follow', function(e) {
    if (e.following) {
      element.classList.remove('centerTrack');
    } else {
      element.classList.add('centerTrack');
    }
  });
  // Activate
  this._geolocBt.on('change:active', function(e) {
    if (e.active) {
      element.classList.add('ol-active');
    } else {
      element.classList.remove('ol-active');
    }
  });
};
ol.ext.inherits(ol.control.GeolocationBar, ol.control.Bar);
/** Get the ol.interaction.GeolocationDraw associatedwith the bar
 * 
 */
ol.control.GeolocationBar.prototype.getInteraction = function () {
  return this._geolocBt.getInteraction();
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * OpenLayers 3 lobe Overview Control.
 * The globe can rotate with map (follow.) 
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 * 	@param {boolean} follow follow the map when center change, default false
 * 	@param {top|bottom-left|right} align position as top-left, etc.
 * 	@param {Array<ol.layer>} layers list of layers to display on the globe
 * 	@param {ol.style.Style | Array.<ol.style.Style> | undefined} style style to draw the position on the map , default a marker
 */
ol.control.Globe = function(opt_options)
{	var options = opt_options || {};
	var self = this;
	// API
	var element;
	if (options.target)
	{	element = document.createElement("div");
		this.panel_ = options.target;
	}
	else
	{	element = document.createElement("div");
		element.classList.add('ol-globe', 'ol-unselectable', 'ol-control');
		if (/top/.test(options.align)) element.classList.add('ol-control-top');
		if (/right/.test(options.align)) element.classList.add('ol-control-right');
		this.panel_ = document.createElement("div");
		this.panel_.classList.add("panel")
		element.appendChild(this.panel_);
		this.pointer_ = document.createElement("div");
		this.pointer_.classList.add("ol-pointer");
		element.appendChild(this.pointer_);
	}
	ol.control.Control.call(this,
	{	element: element,
		target: options.target
	});
// http://openlayers.org/en/latest/examples/sphere-mollweide.html ???
	// Create a globe map
	this.ovmap_ = new ol.Map(
	{	controls: new ol.Collection(),
		interactions: new ol.Collection(),
		target: this.panel_,
		view: new ol.View
			({	zoom: 0,
				center: [0,0]
			}),
		layers: options.layers
	});
	setTimeout (function()
	{	self.ovmap_.updateSize(); 
	}, 0);
	this.set('follow', options.follow || false);
	// Cache extent
	this.extentLayer = new ol.layer.Vector(
	{	name: 'Cache extent',
		source: new ol.source.Vector(),
		style: options.style || [new ol.style.Style(
					{	image: new ol.style.Circle(
						{	fill: new ol.style.Fill({
								color: 'rgba(255,0,0, 1)'
							}),
							stroke: new ol.style.Stroke(
							{	width: 7,
								color: 'rgba(255,0,0, 0.8)'
							}),
							radius: 5
						})
					}
				)]
	})
	this.ovmap_.addLayer(this.extentLayer);
};
ol.ext.inherits(ol.control.Globe, ol.control.Control);
/**
 * Set the map instance the control associated with.
 * @param {ol.Map} map The map instance.
 */
ol.control.Globe.prototype.setMap = function(map) {
	if (this._listener) ol.Observable.unByKey(this._listener);
	this._listener = null;
	ol.control.Control.prototype.setMap.call(this, map);
	// Get change (new layer added or removed)
	if (map) 
	{	this._listener = map.getView().on('propertychange', this.setView.bind(this));
		this.setView();
	}
};
/** Set the globe center with the map center
*/
ol.control.Globe.prototype.setView = function()
{	if (this.getMap() && this.get('follow'))
	{	this.setCenter(this.getMap().getView().getCenter());
	}
}
/** Get globe map
*	@return {ol.Map}
*/
ol.control.Globe.prototype.getGlobe = function()
{	return this.ovmap_;
}
/** Show/hide the globe
*/
ol.control.Globe.prototype.show = function(b)
{	if (b!==false) this.element.classList.remove("ol-collapsed");
	else this.element.classList.add("ol-collapsed");
	this.ovmap_.updateSize();
}
/** Set position on the map
*	@param {top|bottom-left|right}  align
*/
ol.control.Globe.prototype.setPosition = function(align)
{	if (/top/.test(align)) this.element.classList.add("ol-control-top");
	else this.element.classList.remove("ol-control-top");
	if (/right/.test(align)) this.element.classList.add("ol-control-right");
	else this.element.classList.remove("ol-control-right");
}
/** Set the globe center
* @param {_ol_coordinate_} center the point to center to
* @param {boolean} show show a pointer on the map, defaylt true
*/
ol.control.Globe.prototype.setCenter = function (center, show)
{	var self = this;
	this.pointer_.classList.add("hidden");
	if (center)
	{	var map = this.ovmap_;
		var p = map.getPixelFromCoordinate(center);
		if (p) {
			if (show!==false) {
				var h = this.element.clientHeight;
				setTimeout(function() {
					self.pointer_.style.top = String(Math.min(Math.max(p[1],0),h)) + 'px';
					self.pointer_.style.left = "50%";
					self.pointer_.classList.remove("hidden");
				}, 800);
			}
			map.getView().animate({ center: [center[0],0] });
		}
	}
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Draw a graticule on the map.
 *
 * @constructor
 * @extends {ol.control.CanvasBase}
 * @param {Object=} _ol_control_ options.
 *  @param {ol.projectionLike} options.projection projection to use for the graticule, default EPSG:4326 
 *  @param {number} options.maxResolution max resolution to display the graticule
 *  @param {ol.style.Style} options.style Style to use for drawing the graticule, default black.
 *  @param {number} options.step step beetween lines (in proj units), default 1
 *  @param {number} options.stepCoord show a coord every stepCoord, default 1
 *  @param {number} options.spacing spacing beetween lines (in px), default 40px 
 *  @param {number} options.borderWidthwidth of the border (in px), default 5px 
 *  @param {number} options.marginmargin of the border (in px), default 0px 
 */
ol.control.Graticule = function(options) {
  if (!options) options = {};
  // Initialize parent
  var elt = document.createElement("div");
  elt.className = "ol-graticule ol-unselectable ol-hidden";
  ol.control.CanvasBase.call(this, { element: elt });
  this.set('projection', options.projection || 'EPSG:4326');
  // Use to limit calculation 
  var p = new ol.proj.Projection({code:this.get('projection')});
  var m = p.getMetersPerUnit();
  this.fac = 1;
  while (m/this.fac>10) {
    this.fac *= 10;
  }
  this.fac = 10000/this.fac;
  this.set('maxResolution', options.maxResolution || Infinity);
  this.set('step', options.step || 0.1);
  this.set('stepCoord', options.stepCoord || 1);
  this.set('spacing', options.spacing || 40);
  this.set('margin', options.margin || 0);
  this.set('borderWidth', options.borderWidth || 5);
  this.set('stroke', options.stroke!==false);
  this.formatCoord = options.formatCoord || function(c){return c;};
  if (options.style instanceof ol.style.Style) {
    this.setStyle(options.style);
  }
  else {
    this.setStyle(new ol.style.Style({
      stroke: new ol.style.Stroke({ color:"#000", width:1 }),
      fill: new ol.style.Fill({ color: "#fff" }),
      text: new ol.style.Text({
        stroke: new ol.style.Stroke({ color:"#fff", width:2 }),
        fill: new ol.style.Fill({ color:"#000" }),
      }) 
    }));
  }
};
ol.ext.inherits(ol.control.Graticule, ol.control.CanvasBase);
ol.control.Graticule.prototype.setStyle = function (style) {
  this._style = style;
};
ol.control.Graticule.prototype._draw = function (e) {
  if (this.get('maxResolution')<e.frameState.viewState.resolution) return;
  var ctx = this.getContext(e);
  var canvas = ctx.canvas;
  var ratio = e.frameState.pixelRatio;
  var w = canvas.width/ratio;
  var h = canvas.height/ratio;
  var proj = this.get('projection');
  var map = this.getMap();
  var bbox = 
  [	map.getCoordinateFromPixel([0,0]),
    map.getCoordinateFromPixel([w,0]),
    map.getCoordinateFromPixel([w,h]),
    map.getCoordinateFromPixel([0,h])
  ];
  var xmax = -Infinity;
  var xmin = Infinity;
  var ymax = -Infinity;
  var ymin = Infinity;
  for (var i=0, c; c=bbox[i]; i++)
  {	bbox[i] = ol.proj.transform (c, map.getView().getProjection(), proj);
    xmax = Math.max (xmax, bbox[i][0]);
    xmin = Math.min (xmin, bbox[i][0]);
    ymax = Math.max (ymax, bbox[i][1]);
    ymin = Math.min (ymin, bbox[i][1]);
  }
  var spacing = this.get('spacing');
  var step = this.get('step');
  var step2 = this.get('stepCoord');
  var borderWidth = this.get('borderWidth');
  var margin = this.get('margin');
  // Limit max line draw
  var ds = (xmax-xmin)/step*spacing;
  if (ds>w) 
  {	var dt = Math.round((xmax-xmin)/w*spacing /step);
    step *= dt;
    if (step>this.fac) step = Math.round(step/this.fac)*this.fac;
  }
  xmin = (Math.floor(xmin/step))*step -step;
  ymin = (Math.floor(ymin/step))*step -step;
  xmax = (Math.floor(xmax/step))*step +2*step;
  ymax = (Math.floor(ymax/step))*step +2*step;
  var extent = ol.proj.get(proj).getExtent();
  if (extent)
  {	if (xmin < extent[0]) xmin = extent[0];
    if (ymin < extent[1]) ymin = extent[1];
    if (xmax > extent[2]) xmax = extent[2]+step;
    if (ymax > extent[3]) ymax = extent[3]+step;
  }
  var hasLines = this.getStyle().getStroke() && this.get("stroke");
  var hasText = this.getStyle().getText();
  var hasBorder = this.getStyle().getFill();
  ctx.save();
    ctx.scale(ratio,ratio);
    ctx.beginPath();
    ctx.rect(margin, margin, w-2*margin, h-2*margin);
    ctx.clip();
    ctx.beginPath();
    var txt = {top:[],left:[],bottom:[], right:[]};
    var x, y, p, p0, p1;
    for (x=xmin; x<xmax; x += step)
    {	p0 = ol.proj.transform ([x, ymin], proj, map.getView().getProjection());
      p0 = map.getPixelFromCoordinate(p0);
      if (hasLines) ctx.moveTo(p0[0], p0[1]);
      p = p0;
      for (y=ymin+step; y<=ymax; y+=step)
      {	p1 = ol.proj.transform ([x, y], proj, map.getView().getProjection());
        p1 = map.getPixelFromCoordinate(p1);
        if (hasLines) ctx.lineTo(p1[0], p1[1]);
        if (p[1]>0 && p1[1]<0) txt.top.push([x, p]);
        if (p[1]>h && p1[1]<h) txt.bottom.push([x,p]);
        p = p1;
      }
    }
    for (y=ymin; y<ymax; y += step)
    {	p0 = ol.proj.transform ([xmin, y], proj, map.getView().getProjection());
      p0 = map.getPixelFromCoordinate(p0);
      if (hasLines) ctx.moveTo(p0[0], p0[1]);
      p = p0;
      for (x=xmin+step; x<=xmax; x+=step)
      {	p1 = ol.proj.transform ([x, y], proj, map.getView().getProjection());
        p1 = map.getPixelFromCoordinate(p1);
        if (hasLines) ctx.lineTo(p1[0], p1[1]);
        if (p[0]<0 && p1[0]>0) txt.left.push([y,p]);
        if (p[0]<w && p1[0]>w) txt.right.push([y,p]);
        p = p1;
      }
    }
    if (hasLines)
    {	ctx.strokeStyle = this.getStyle().getStroke().getColor();
      ctx.lineWidth = this.getStyle().getStroke().getWidth();
      ctx.stroke();
    }
    // Draw text
    if (hasText)
    {
      ctx.fillStyle = this.getStyle().getText().getFill().getColor();
      ctx.strokeStyle = this.getStyle().getText().getStroke().getColor();
      ctx.lineWidth = this.getStyle().getText().getStroke().getWidth();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'hanging';
      var t, tf;
      var offset = (hasBorder ? borderWidth : 0) + margin + 2;
      for (i=0; t = txt.top[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
      {	tf = this.formatCoord(t[0]);
        ctx.strokeText(tf, t[1][0], offset);
        ctx.fillText(tf, t[1][0], offset);
      }
      ctx.textBaseline = 'alphabetic';
      for (i=0; t = txt.bottom[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
      {	tf = this.formatCoord(t[0]);
        ctx.strokeText(tf, t[1][0], h-offset);
        ctx.fillText(tf, t[1][0], h-offset);
      }
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      for (i=0; t = txt.left[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
      {	tf = this.formatCoord(t[0]);
        ctx.strokeText(tf, offset, t[1][1]);
        ctx.fillText(tf, offset, t[1][1]);
      }
      ctx.textAlign = 'right';
      for (i=0; t = txt.right[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
      {	tf = this.formatCoord(t[0]);
        ctx.strokeText(tf, w-offset, t[1][1]);
        ctx.fillText(tf, w-offset, t[1][1]);
      }
    }
    // Draw border
    if (hasBorder)
    {	var fillColor = this.getStyle().getFill().getColor();
      var color, stroke;
      if (stroke = this.getStyle().getStroke())
      {	color = this.getStyle().getStroke().getColor();
      }
      else
      {	color = fillColor;
        fillColor = "#fff";
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = stroke ? stroke.getWidth() : 1;
      // 
      for (i=1; i<txt.top.length; i++)
      {	ctx.beginPath();
        ctx.rect(txt.top[i-1][1][0], margin, txt.top[i][1][0]-txt.top[i-1][1][0], borderWidth);
        ctx.fillStyle = Math.round(txt.top[i][0]/step)%2 ? color: fillColor;
        ctx.fill(); 
        ctx.stroke(); 
      }
      for (i=1; i<txt.bottom.length; i++)
      {	ctx.beginPath();
        ctx.rect(txt.bottom[i-1][1][0], h-borderWidth-margin, txt.bottom[i][1][0]-txt.bottom[i-1][1][0], borderWidth);
        ctx.fillStyle = Math.round(txt.bottom[i][0]/step)%2 ? color: fillColor;
        ctx.fill(); 
        ctx.stroke(); 
      }
      for (i=1; i<txt.left.length; i++)
      {	ctx.beginPath();
        ctx.rect(margin, txt.left[i-1][1][1], borderWidth, txt.left[i][1][1]-txt.left[i-1][1][1]);
        ctx.fillStyle = Math.round(txt.left[i][0]/step)%2 ? color: fillColor;
        ctx.fill(); 
        ctx.stroke(); 
      }
      for (i=1; i<txt.right.length; i++)
      {	ctx.beginPath();
        ctx.rect(w-borderWidth-margin, txt.right[i-1][1][1], borderWidth, txt.right[i][1][1]-txt.right[i-1][1][1]);
        ctx.fillStyle = Math.round(txt.right[i][0]/step)%2 ? color: fillColor;
        ctx.fill(); 
        ctx.stroke(); 
      }
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.rect(margin,margin, borderWidth, borderWidth);
      ctx.rect(margin,h-borderWidth-margin, borderWidth,borderWidth);
      ctx.rect(w-borderWidth-margin,margin, borderWidth, borderWidth);
      ctx.rect(w-borderWidth-margin,h-borderWidth-margin, borderWidth,borderWidth);
      ctx.fill(); 
    }
  ctx.restore();
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Draw a grid reference on the map and add an index.
 *
 * @constructor
 * @extends {ol.control.CanvasBase}
 * @fires select
 * @param {Object=} Control options.
 *  @param {ol.style.Style} options.style Style to use for drawing the grid (stroke and text), default black.
 *  @param {number} options.maxResolution max resolution to display the graticule
 *  @param {ol.extent} options.extent extent of the grid, required
 *  @param {ol.size} options.size number of lines and cols, required
 *  @param {number} options.margin margin to display text (in px), default 0px
 *  @param {ol.source.Vector} options.source source to use for the index, default none (use setIndex to reset the index)
 *  @param {string | function} options.property a property to display in the index or a function that takes a feature and return the name to display in the index, default 'name'.
 *  @param {function|undefined} options.sortFeatures sort function to sort 2 features in the index, default sort on property option
 *  @param {function|undefined} options.indexTitle a function that takes a feature and return the title to display in the index, default the first letter of property option
 *  @param {string} options.filterLabel label to display in the search bar, default 'filter'
 */
ol.control.GridReference = function(options) {
  if (!options) options = {};
  // Initialize parent
  var elt = document.createElement("div");
  elt.className = (!options.target ? "ol-control ":"") +"ol-gridreference ol-unselectable "+(options.className||"");
  options.style = options.style || new ol.style.Style({
    stroke: new ol.style.Stroke({ color:"#000", width:1 }),
    text: new ol.style.Text({
      font: "bold 14px Arial",
      stroke: new ol.style.Stroke({ color:"#fff", width:2 }),
      fill: new ol.style.Fill({ color:"#000" }),
    })
  });
  ol.control.CanvasBase.call(this, {
    element: elt,
    target: options.target,
    style: options.style
  });
  if (typeof (options.property)=='function') this.getFeatureName = options.property;
  if (typeof (options.sortFeatures)=='function') this.sortFeatures = options.sortFeatures;
  if (typeof (options.indexTitle)=='function') this.indexTitle = options.indexTitle;
  // Set index using the source
  this.source_ = options.source;
  if (options.source) {
    this.setIndex(options.source.getFeatures(), options);
    // reload on ready
    options.source.once('change',function() {
      if (options.source.getState() === 'ready'){
        this.setIndex(options.source.getFeatures(), options);
      }
    }.bind(this));
  }
  // Options
  this.set('maxResolution', options.maxResolution || Infinity);
  this.set('extent', options.extent);
  this.set('size', options.size);
  this.set('margin', options.margin || 0);
  this.set('property', options.property || 'name');
  this.set('filterLabel', options.filterLabel || 'filter');
};
ol.ext.inherits(ol.control.GridReference, ol.control.CanvasBase);
/** Returns the text to be displayed in the index
 * @param {ol.Feature} f the feature
 * @return {string} the text to be displayed in the index
 * @api
 */
ol.control.GridReference.prototype.getFeatureName = function (f) {
  return f.get(this.get('property')||'name');
};
/** Sort function
 * @param {ol.Feature} a first feature
 * @param {ol.Feature} b second feature
 * @return {Number} 0 if a==b, -1 if a<b, 1 if a>b
 * @api
 */
ol.control.GridReference.prototype.sortFeatures = function (a,b) {
  return (this.getFeatureName(a) == this.getFeatureName(b)) ? 0 : (this.getFeatureName(a) < this.getFeatureName(b)) ? -1 : 1; 
};
/** Get the feature title
 * @param {ol.Feature} f
 * @return the first letter of the eature name (getFeatureName)
 * @api
 */
ol.control.GridReference.prototype.indexTitle = function (f) {
  return this.getFeatureName(f).charAt(0);
};
/** Display features in the index
 * @param { Array<ol.Feature> | ol.Collection<ol.Feature> } features
 */
ol.control.GridReference.prototype.setIndex = function (features) {
  if (!this.getMap()) return;
  var self = this;
  if (features.getArray) features = features.getArray();
  features.sort ( function(a,b) { return self.sortFeatures(a,b); } );
  this.element.innerHTML = "";
  var elt = this.element;
  var search = document.createElement("input");
  search.setAttribute('type', 'search');
  search.setAttribute('placeholder', this.get('filterLabel') || 'filter');
  var searchKeyupFunction = function() {
    var v = this.value.replace(/^\*/,'');
    // console.log(v)
    var r = new RegExp (v, 'i');
    ul.querySelectorAll('li').forEach(function(li) {
      if (li.classList.contains('ol-title')) {
        li.style.display = '';
      } else {
        if (r.test(li.querySelector('.ol-name').textContent)) li.style.display = '';
        else li.style.display = 'none';
      }
    });
    ul.querySelectorAll("li.ol-title").forEach(function(li) {
      var nextAll = false;
      nextAll = [].filter.call(li.parentNode.children, function (htmlElement) {
        return (htmlElement.previousElementSibling === li) ? nextAll = true : nextAll;
      });
      console.log(nextAll);
      var nextVisible = nextAll[0];
      if (nextVisible.length && !nextVisible.classList.contains('ol-title')) li.style.display = '';
      else li.style.display = 'none';
    });
  };
  search.addEventListener('search', searchKeyupFunction);
  search.addEventListener('keyup', searchKeyupFunction);
  elt.appendChild(search);
  var ul = document.createElement("ul");
  elt.appendChild(ul);
  var r, title;
  for (var i=0, f; f=features[i]; i++) {
    (function(feat) {
      r = self.getReference(feat.getGeometry().getFirstCoordinate());
      if (r) {
        var name = self.getFeatureName(feat);
        var c = self.indexTitle(feat);
        if (c != title) {
          var li_title = document.createElement("li");
          li_title.classList.add('ol-title');
          li_title.textContent = c;
          ul.appendChild(li_title);
        }
        title = c;
        var li_ref_name = document.createElement("li");
        var span_name = document.createElement("span");
            span_name.classList.add("ol-name");
            span_name.textContent = name;
        li_ref_name.appendChild(span_name);
        var span_ref = document.createElement("span");
            span_ref.classList.add("ol-ref");
            span_ref.textContent = r;
        li_ref_name.appendChild(span_ref);
        var feature = feat;
        li_ref_name.addEventListener("click", function() {
          self.dispatchEvent({ type:"select", feature: feature });
        });
        ul.appendChild(li_ref_name);
      }
    })(f);
  }
};
/** Get reference for a coord
*	@param {ol.coordinate} coords
*	@return {string} the reference
*/
ol.control.GridReference.prototype.getReference = function (coords) {
  if (!this.getMap()) return;
  var extent = this.get('extent');
  var size = this.get('size');
  var dx = Math.floor ( (coords[0] - extent[0]) / (extent[2]- extent[0]) * size[0] );
  if (dx<0 || dx>=size[0]) return "";
  var dy = Math.floor ( (extent[3] - coords[1]) / (extent[3]- extent[1]) * size[1] );
  if (dy<0 || dy>=size[1]) return "";
  return String.fromCharCode(65+dx)+dy;
};
/** Draw the grid
* @param {ol.event} e postcompose event
* @private
*/
ol.control.GridReference.prototype._draw = function (e) {
  if (this.get('maxResolution')<e.frameState.viewState.resolution) return;
  var ctx = this.getContext(e);
  var canvas = ctx.canvas;
  var ratio = e.frameState.pixelRatio;
  var w = canvas.width/ratio;
  var h = canvas.height/ratio;
  var extent = this.get('extent');
  var size = this.get('size');
  var map = this.getMap();
  var ex = ol.extent.boundingExtent([map.getPixelFromCoordinate([extent[0],extent[1]]), map.getPixelFromCoordinate([extent[2],extent[3]])]);
  var p0 = [ex[0],ex[1]];
  var p1 = [ex[2],ex[3]];
  var dx = (p1[0]-p0[0])/size[0];
  var dy = (p1[1]-p0[1])/size[1];
  ctx.save();
    var margin = this.get('margin');
    ctx.scale(ratio,ratio);
    ctx.strokeStyle = this.getStroke().getColor();
    ctx.lineWidth = this.getStroke().getWidth();
    // Draw grid
    ctx.beginPath();
    var i;
    for (i=0; i<=size[0]; i++) {
      ctx.moveTo(p0[0]+i*dx, p0[1]);
      ctx.lineTo(p0[0]+i*dx, p1[1]);
    }
    for (i=0; i<=size[1]; i++) {
      ctx.moveTo(p0[0], p0[1]+i*dy);
      ctx.lineTo(p1[0], p0[1]+i*dy);
    }
    ctx.stroke();
    // Draw text
    ctx.font = this.getTextFont();
    ctx.fillStyle = this.getTextFill().getColor();
    ctx.strokeStyle = this.getTextStroke().getColor();
    var lw = ctx.lineWidth = this.getTextStroke().getWidth();
    var spacing = margin +lw;
    ctx.textAlign = 'center';
    var letter, x, y;
    for (i=0; i<size[0]; i++) {
      letter = String.fromCharCode(65+i);
      x = p0[0]+i*dx+dx/2;
      y = p0[1]-spacing;
      if (y<0) {
        y = spacing;
        ctx.textBaseline = 'hanging';
      }
      else ctx.textBaseline = 'alphabetic';
      ctx.strokeText(letter, x, y);
      ctx.fillText(letter, x, y);
      y = p1[1]+spacing;
      if (y>h) {
        y = h-spacing;
        ctx.textBaseline = 'alphabetic';
      }
      else ctx.textBaseline = 'hanging';
      ctx.strokeText(letter, x, y);
      ctx.fillText(letter, x, y);
    }
    ctx.textBaseline = 'middle';
    for (i=0; i<size[1]; i++) {
      y = p0[1]+i*dy+dy/2;
      ctx.textAlign = 'right';
      x = p0[0] - spacing;
      if (x<0) {
        x = spacing;
        ctx.textAlign = 'left';
      }
      else ctx.textAlign = 'right';
      ctx.strokeText(i, x, y);
      ctx.fillText(i, x, y);
      x = p1[0] + spacing;
      if (x>w) {
        x = w-spacing;
        ctx.textAlign = 'right';
      }
      else ctx.textAlign = 'left';
      ctx.strokeText(i, x, y);
      ctx.fillText(i, x, y);
    }
  ctx.restore();
};

/** Image line control
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires select
 * @fires collapse
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {ol.source.Vector} options.source a vector source that contains the images
 *	@param {function} options.getImage a function that gets a feature and return the image url, default return the img propertie
 *	@param {function} options.getTitle a function that gets a feature and return the title, default return an empty string
 *	@param {boolean} options.collapsed the line is collapse, default false
 *	@param {boolean} options.collapsible the line is collapsible, default false
 *	@param {number} options.maxFeatures the maximum image element in the line, default 100
 *	@param {boolean} options.hover select image on hover, default false
 *	@param {string|boolean} options.linkColor link color or false if no link, default false
 */
ol.control.Imageline = function(options) {
  var element = ol.ext.element.create('DIV', {
    className: (options.className || '') + ' ol-imageline'
      + (options.target ? '': ' ol-unselectable ol-control')
      + (options.collapsed && options.collapsible ? 'ol-collapsed' : '')
      + ('ontouchstart' in window ? ' ol-touch' : '')
  });
  if (!options.target && options.collapsible) {
    ol.ext.element.create('BUTTON', {
      type: 'button',
      click: function() {
        this.toggle();
      }.bind(this),
      parent: element
    });
  }
  // Source 
  this._source = options.source;
  // Initialize
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  // Scroll imageline
  this._setScrolling();
  this._scrolldiv.addEventListener("scroll", function() {
    if (this.getMap()) this.getMap().render();
  }.bind(this));
  // Parameters
  if (typeof(options.getImage)==='function') this._getImage =  options.getImage;
  if (typeof(options.getTitle)==='function') this._getTitle =  options.getTitle;
  this.set('maxFeatures', options.maxFeatures || 100);
  this.set('linkColor', options.linkColor || false);
  this.set('hover', options.hover || false);
  this.set('useExtent', options.useExtent || false);
  this.refresh();
};
ol.ext.inherits(ol.control.Imageline, ol.control.Control);
/**
 * Remove the control from its current map and attach it to the new map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.control.Imageline.prototype.setMap = function (map) {
	if (this._listener) {
    this._listener.forEach(function(l) {
      ol.Observable.unByKey(l);
    }.bind(this));
  }
	this._listener = null;
	ol.control.Control.prototype.setMap.call(this, map);
	if (map) {	
    this._listener = [
      map.on('postcompose', this._drawLink.bind(this)),
      map.on('moveend', function() { 
        if (this.get('useExtent')) this.refresh();
      }.bind(this))
    ]
	}
};
/** Set useExtent param and refresh the line
 * @param {boolean} b
 */
ol.control.Imageline.prototype.useExtent = function(b) {
  this.set('useExtent', b);
  this.refresh();
};
/** Is the line collapsed
 * @return {boolean}
 */
ol.control.Imageline.prototype.isCollapsed = function() {
  return this.element.classList.contains('ol-collapsed');
};
/** Collapse the line
 * @param {boolean} b
 */
ol.control.Imageline.prototype.collapse = function(b) {
  if (b) this.element.classList.add('ol-collapsed');
  else this.element.classList.remove('ol-collapsed');
  if (this.getMap()) {
    setTimeout ( function() {
      this.getMap().render();
    }.bind(this), this.isCollapsed() ? 0 : 250);
  }
  this.dispatchEvent({ type: 'collapse', collapsed: this.isCollapsed() });
};
/** Collapse the line
 */
ol.control.Imageline.prototype.toggle = function() {
  this.element.classList.toggle('ol-collapsed');
  if (this.getMap()) {
    setTimeout ( function() {
      this.getMap().render();
    }.bind(this), this.isCollapsed() ? 0 : 250);
  }
  this.dispatchEvent({ type: 'collapse', collapsed: this.isCollapsed() });
};
/** Default function to get an image of a feature
 * @param {ol.Feature} f
 * @private
 */
ol.control.Imageline.prototype._getImage = function(f) {
  return f.get('img');
};
/** Default function to get an image title
 * @param {ol.Feature} f
 * @private
 */
ol.control.Imageline.prototype._getTitle = function(/* f */) {
  return '';
};
/**
 * Get features
 * @return {Array<ol.Feature>}
 */
ol.control.Imageline.prototype.getFeatures = function() {
  var map = this.getMap();
  if (!this.get('useExtent') || !map) {
    return this._source.getFeatures();
  } else {
    var extent = map.getView().calculateExtent(map.getSize());
    return this._source.getFeaturesInExtent(extent);
  }
};
/** Set element scrolling with a acceleration effect on desktop
 * (on mobile it uses the scroll of the browser)
 * @private
 */
ol.control.Imageline.prototype._setScrolling = function() {
  var elt = this._scrolldiv = ol.ext.element.create('DIV', {
    parent: this.element
  });
  ol.ext.element.scrollDiv(elt, {
    // Prevent selection when moving
    onmove: function(b) {
      this._moving=b; 
    }.bind(this)
  });
};
/**
 * Refresh the imageline with new data
 */
ol.control.Imageline.prototype.refresh = function() {
  this._scrolldiv.innerHTML = '';
  var features = this.getFeatures();
  var current = this._select ? this._select.feature : null;
  if (this._select) this._select.elt = null;
  this._iline = [];
  if (this.getMap()) this.getMap().render();
  // Add a new image
  var addImage = function(f) {
    if (this._getImage(f)) {
      var img = ol.ext.element.create('DIV', {
        className: 'ol-image',
        parent: this._scrolldiv
      });
      ol.ext.element.create('IMG', {
        src: this._getImage(f),
        parent: img
      }).addEventListener('load', function(){
        this.classList.add('ol-loaded');
      });
      ol.ext.element.create('SPAN', {
        html: this._getTitle(f),
        parent: img
      });
      // Current image
      var sel = { elt: img, feature: f };
      // On click > dispatch event
      img.addEventListener('click', function(){
        if (!this._moving) {
          this.dispatchEvent({type: 'select', feature: f });
          this._scrolldiv.scrollLeft = img.offsetLeft 
            + ol.ext.element.getStyle(img, 'width')/2
            - ol.ext.element.getStyle(this.element, 'width')/2;
            if (this._select) this._select.elt.classList.remove('select');
            this._select = sel;
            this._select.elt.classList.add('select');
          }
      }.bind(this));
      // Show link
      img.addEventListener('mouseover', function(e) {
        if (this.get('hover')) {
          if (this._select) this._select.elt.classList.remove('select');
          this._select = sel;
          this._select.elt.classList.add('select');
          this.getMap().render();
          e.stopPropagation();
        }
      }.bind(this));
      // Remove link
      img.addEventListener('mouseout', function(e) {
        if (this.get('hover')) {
          if (this._select) this._select.elt.classList.remove('select');
          this._select = false;
          this.getMap().render();
          e.stopPropagation();
        }
      }.bind(this));
      // Prevent image dragging
      img.ondragstart = function(){ return false; };
      // Add image
      this._iline.push(sel);
      if (current===f) {
        this._select = sel;
        sel.elt.classList.add('select');
      }
    }
  }.bind(this);
  // Add images 
  var nb = this.get('maxFeatures');
  for (var i=0, f; f=features[i]; i++) {
    if (nb--<0) break;
    addImage(f);
  }
  // Add the selected one
  if (this._select && this._select.feature && !this._select.elt) {
    addImage(this._select.feature);
  }
};
/** Center image line on a feature
 * @param {ol.feature} feature
 * @param {boolean} scroll scroll the line to center on the image, default true
 * @api
 */
ol.control.Imageline.prototype.select = function(feature, scroll) {
  this._select = false;
  // Find the image
  this._iline.forEach(function (f) {
    if (f.feature === feature) {
      f.elt.classList.add('select');
      this._select = f;
      if (scroll!==false) {
        this._scrolldiv.scrollLeft = f.elt.offsetLeft 
          + ol.ext.element.getStyle(f.elt, 'width')/2
          - ol.ext.element.getStyle(this.element, 'width')/2;
      }
    } else {
      f.elt.classList.remove('select');
    }
  }.bind(this));
};
/** Draw link on the map
 * @private
 */
ol.control.Imageline.prototype._drawLink = function(e) {
  if (!this.get('linkColor') | this.isCollapsed()) return;
  var map = this.getMap();
  if (map && this._select && this._select.elt) {
    var ctx = e.context || ol.ext.getMapCanvas(this.getMap()).getContext('2d');
    var ratio = e.frameState.pixelRatio;
    var pt = [ 
      this._select.elt.offsetLeft 
      - this._scrolldiv.scrollLeft
      + ol.ext.element.getStyle(this._select.elt, 'width')/2, 
      parseFloat(ol.ext.element.getStyle(this.element, 'top')) || this.getMap().getSize()[1]
    ];
    var geom = this._select.feature.getGeometry().getFirstCoordinate();
    geom = this.getMap().getPixelFromCoordinate(geom);
    ctx.save();
    ctx.fillStyle = this.get('linkColor');
    ctx.beginPath();
      if (geom[0]>pt[0]) {
        ctx.moveTo((pt[0]-5)*ratio, pt[1]*ratio);
        ctx.lineTo((pt[0]+5)*ratio, (pt[1]+5)*ratio);
      } else {
        ctx.moveTo((pt[0]-5)*ratio, (pt[1]+5)*ratio);
        ctx.lineTo((pt[0]+5)*ratio, pt[1]*ratio);
      }
      ctx.lineTo(geom[0]*ratio, geom[1]*ratio);
    ctx.fill();
    ctx.restore();
  }
};

/*	Copyright (c) 2018 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Geoportail isochrone Control.
 * @see https://geoservices.ign.fr/documentation/geoservices/isochrones.html
 * @constructor
 * @extends {ol.control.Control}
 * @fires isochrone
 * @fires error
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
 *
 *  @param {string} options.exclusions Exclusion list separate with a comma 'Toll,Tunnel,Bridge'
 */
ol.control.IsochroneGeoportail = function(options) {
  var self = this;
	if (!options) options = {};
	if (options.typing == undefined) options.typing = 300;
	var classNames = (options.className ? options.className : '')+ ' ol-isochrone ol-routing';
	if (!options.target) classNames += ' ol-unselectable ol-control';
	var element = ol.ext.element.create('DIV', { className: classNames })
	if (!options.target) {
    var bt = ol.ext.element.create('BUTTON', { parent: element })
    bt.addEventListener('click', function(){
      element.classList.toggle('ol-collapsed');
    });
  }
  // Inherits
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  this.set('iter', 1);
  var content = ol.ext.element.create('DIV', { className: 'content', parent: element } )
  // Search control
  this._addSearchCtrl(content, options);
  // Method buttons
  ol.ext.element.create('BUTTON', { className: 'ol-button ol-method-time selected', title:'isochrone', parent: content })
    .addEventListener('click', function(){
      this.setMethod('time');
    }.bind(this));
  ol.ext.element.create('I', { className: 'ol-button ol-method-distance', title:'isodistance', parent: content })
    .addEventListener('click', function(){
      this.setMethod('distance');
    }.bind(this));
  // Mode buttons
  ol.ext.element.create('I', { className: 'ol-button ol-car selected', title:'by car', parent: content })
    .addEventListener('click', function(){
      this.setMode('car');
    }.bind(this));
  ol.ext.element.create('I', { className: 'ol-button ol-pedestrian', title:'by foot', parent: content })
    .addEventListener('click', function(){
      this.setMode('pedestrian');
    }.bind(this));
  // Direction buttons
  ol.ext.element.create('I', { className: 'ol-button ol-direction-direct selected', title:'direct', parent: content })
    .addEventListener('click', function(){
      this.setDirection('direct');
    }.bind(this));
  ol.ext.element.create('I', { className: 'ol-button ol-direction-reverse', title:'reverse', parent: content })
    .addEventListener('click', function(){
      this.setDirection('reverse');
    }.bind(this));
  // Input 
  var div = ol.ext.element.create('DIV', { className: 'ol-time', parent: content })
  ol.ext.element.create('DIV', { html:'isochrone:', parent: div });
  ol.ext.element.create('INPUT', { type: 'number', parent: div, min: 0 })
    .addEventListener('change', function(){
      self.set('hour', Number(this.value));
    });
  ol.ext.element.create('TEXT', { parent: div, html: 'h' });
  ol.ext.element.create('INPUT', { type: 'number', parent: div, min: 0 })
    .addEventListener('change', function(){
      self.set('minute', Number(this.value));
    });
  ol.ext.element.create('TEXT', { parent: div, html: 'mn' });
  div = ol.ext.element.create('DIV', { className: 'ol-distance', parent: content });
  ol.ext.element.create('DIV', { html:'isodistance:', parent: div });
  ol.ext.element.create('INPUT', { type: 'number', step: 'any', parent: div, min: 0 })
    .addEventListener('change', function(){
      self.set('distance', Number(this.value));
    });
  ol.ext.element.create('TEXT', { parent: div, html: 'km' });
  div = ol.ext.element.create('DIV', { className: 'ol-iter', parent: content })
  ol.ext.element.create('DIV', { html:'Iteration:', parent: div });
  ol.ext.element.create('INPUT', { type: 'number', parent: div, value: 1, min: 1 })
    .addEventListener('change', function(){
      self.set('iter', Number(this.value));
    });
  // OK button
  ol.ext.element.create('I', { className:'ol-ok', html:'ok', parent: content })
    .addEventListener('click', function() {
      var val = 0;
      switch (this.get('method')) {
        case 'distance':  {
          val = this.get('distance')*1000;
          break;
        }
        default: {
          val = (this.get('hour')||0)*3600 + (this.get('minute')||0)*60;
          break;
        }
      }
      if (val && this.get('coordinate')) {
        this.search(this.get('coordinate'), val);
      }
    }.bind(this));
  this.set('url', 'https://wxs.ign.fr/'+options.apiKey+'/isochrone/isochrone.json');
  this._ajax = new ol.ext.Ajax({ 
    dataType: 'JSON',
    auth: options.auth
  });
  this._ajax.on('success', this._success.bind(this));
  this._ajax.on('error', this._error.bind(this));
  // searching
  this._ajax.on('loadstart', function() {
    this.element.classList.add('ol-searching');
  }.bind(this));
  this._ajax.on('loadend', function() {
    this.element.classList.remove('ol-searching');
  }.bind(this));
  this.setMethod(options.method);
};
ol.ext.inherits(ol.control.IsochroneGeoportail, ol.control.Control);
/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol.control.IsochroneGeoportail.prototype.setMap = function (map) {
	ol.control.Control.prototype.setMap.call(this, map);
	this._search.setMap(map);
};
/** Add a new search input
 * @private
 */
ol.control.IsochroneGeoportail.prototype._addSearchCtrl = function (element, options) {
	var div = ol.ext.element.create("DIV", { parent: element });
  var search = this._search = new ol.control.SearchGeoportail({
    className: 'IGNF ol-collapsed',
		apiKey: options.apiKey,
		target: div
	});
	search.on('select', function(e){
    search.setInput(e.search.fulltext);
    this.set('coordinate', e.coordinate);
  }.bind(this));
  search.on('change:input', function(){
    this.set('coordinate', false);
  }.bind(this));
};
/** Set the travel method
 * @param [string] method The method (time or distance)
 */
ol.control.IsochroneGeoportail.prototype.setMethod = function(method) {7
  method = (/distance/.test(method) ? 'distance' : 'time');
  this.element.querySelector(".ol-method-time").classList.remove("selected");
  this.element.querySelector(".ol-method-distance").classList.remove("selected");
  this.element.querySelector(".ol-method-"+method).classList.add("selected");
  this.element.querySelector("div.ol-time").classList.remove("selected");
  this.element.querySelector("div.ol-distance").classList.remove("selected");
  this.element.querySelector("div.ol-"+method).classList.add("selected");
  this.set('method', method);
};
/** Set mode
 * @param {string} mode The mode: 'car' or 'pedestrian', default 'car'
 */
ol.control.IsochroneGeoportail.prototype.setMode = function (mode) {
  this.set('mode', mode);
  this.element.querySelector(".ol-car").classList.remove("selected");
  this.element.querySelector(".ol-pedestrian").classList.remove("selected");
  this.element.querySelector(".ol-"+mode).classList.add("selected");
};
/** Set direction
 * @param {string} direction The direction: 'direct' or 'reverse', default direct
 */
ol.control.IsochroneGeoportail.prototype.setDirection = function (direction) {
  this.set('direction', direction);
  this.element.querySelector(".ol-direction-direct").classList.remove("selected");
  this.element.querySelector(".ol-direction-reverse").classList.remove("selected");
  this.element.querySelector(".ol-direction-"+direction).classList.add("selected");
};
/** Calculate an isochrone
 * @param {ol.coordinate} coord
 * @param {number|string} option A number as time (in second) or distance (in meter), depend on method propertie
 * or a string with a unit (s, mn, h for time or km, m)
 */
ol.control.IsochroneGeoportail.prototype.search = function(coord, option, iter) {
  var proj = this.getMap() ? this.getMap().getView().getProjection() : 'EPSG:3857';
  var method = /distance/.test(this.get('method')) ? 'distance' : 'time';
  if (typeof(option)==='string') {
    var unit = option.replace(/([0-9|.]*)([a-z]*)$/,'$2');
    method = 'time';
    option = parseFloat(option);
    // convert unit
    switch (unit) {
      case 'mn': {
        option = option*60;
        break;
      }
      case 'h': {
        option = option*3600;
        break;
      }
      case 'm': {
        method = 'distance';
        break;
      }
      case 'km': {
        method = 'distance';
        option = option*1000;
        break;
      }
    }
  }
  var dt = Math.round(option * (this.get('iter')-(iter||0)) / this.get('iter'));
  if (typeof option === 'number') {
    // Send data
    var data = {
      'gp-access-lib': '2.1.0',
      location: ol.proj.toLonLat(coord, proj),
      graphName: (this.get('mode')==='pedestrian' ?  'Pieton' : 'Voiture'),
      exclusions: this.get('exclusions') || undefined,
      method: method,
      time: method==='time' ? dt : undefined,
      distance: method==='distance' ? dt : undefined,
      reverse: (this.get('direction') === 'reverse'),
      smoothing: this.get('smoothing') || true,
      holes: this.get('holes') || false
    };
    this._ajax.send(this.get('url'), data, { 
      coord: coord, 
      option: option,
      iteration: (iter||0)+1 
    });
  }
};
/** Trigger result
 * @private
 */
ol.control.IsochroneGeoportail.prototype._success = function(e) {
  var proj = this.getMap() ? this.getMap().getView().getProjection() : 'EPSG:3857';
  // Convert to features
  var format = new ol.format.WKT();
  var evt = e.response;
	evt.feature = format.readFeature(evt.wktGeometry, {
    dataProjection: 'EPSG:4326',
    featureProjection: proj
  });
  delete evt.wktGeometry;
  evt.type = 'isochrone';
  evt.iteration = e.options.iteration-1;
  this.dispatchEvent (evt);
  if (e.options.iteration < this.get('iter')) {
    this.search(e.options.coord, e.options.option, e.options.iteration);
  }
};
/** Trigger error
 * @private
 */
ol.control.IsochroneGeoportail.prototype._error = function() {
  this.dispatchEvent ({ type:'error' });
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * OpenLayers Layer Switcher Control.
 *
 * @constructor
 * @extends {ol.control.LayerSwitcher}
 * @param {Object=} options Control options.
 */
ol.control.LayerPopup = function(options) {
  options = options || {};
	options.switcherClass="ol-layerswitcher-popup";
	if (options.mouseover!==false) options.mouseover=true;
	ol.control.LayerSwitcher.call(this, options);
};
ol.ext.inherits(ol.control.LayerPopup, ol.control.LayerSwitcher);
/** Disable overflow
*/
ol.control.LayerPopup.prototype.overflow = function(){};
/** Render a list of layer
 * @param {elt} element to render
 * @layers {Array{ol.layer}} list of layer to show
 * @api stable
 */
ol.control.LayerPopup.prototype.drawList = function(ul, layers) {	
  var self=this;
	var setVisibility = function(e) {
    e.preventDefault(); 
		var l = self._getLayerForLI(this);
		self.switchLayerVisibility(l,layers);
		if (e.type=="touchstart") self.element.classList.add("ol-collapsed");
	};
	layers.forEach(function(layer) {
    if (self.displayInLayerSwitcher(layer)) {
      var d = ol.ext.element.create('LI', {
        html: layer.get("title") || layer.get("name"),
        on: { 'click touchstart': setVisibility },
        parent: ul
      });
      self._setLayerForLI(d, layer);
			if (self.testLayerVisibility(layer)) d.classList.add("ol-layer-hidden");
			if (layer.getVisible()) d.classList.add("select");
		}
	});
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc OpenLayers Layer Switcher Control.
 * @require layer.getPreview
 *
 * @constructor
 * @extends {ol.control.LayerSwitcher}
 * @param {Object=} options Control options.
 */
ol.control.LayerSwitcherImage = function(options) {
  options = options || {};
	options.switcherClass = "ol-layerswitcher-image";
	if (options.mouseover!==false) options.mouseover=true;
	ol.control.LayerSwitcher.call(this, options);
};
ol.ext.inherits(ol.control.LayerSwitcherImage, ol.control.LayerSwitcher);
/** Render a list of layer
 * @param {elt} element to render
 * @layers {Array{ol.layer}} list of layer to show
 * @api stable
 */
ol.control.LayerSwitcherImage.prototype.drawList = function(ul, layers) {
  var self = this;
	var setVisibility = function(e) {
    e.preventDefault(); 
		var l = self._getLayerForLI(this);
		self.switchLayerVisibility(l,layers);
		if (e.type=="touchstart") self.element.classList.add("ol-collapsed");
	};
	ol.ext.element.setStyle(ul, { height: 'auto' });
	layers.forEach(function(layer) {
    if (self.displayInLayerSwitcher(layer)) {
      var preview = layer.getPreview ? layer.getPreview() : ["none"];
      var d = ol.ext.element.create('LI', {
        className: 'ol-imgcontainer' + (layer.getVisible() ? ' select':''),
        on: { 'touchstart click': setVisibility },
        parent: ul
      });
      self._setLayerForLI(d, layer);
      preview.forEach(function(img){
        ol.ext.element.create('IMG', {
          src: img,
          parent: d
        })
      });
			ol.ext.element.create('p', {
        html: layer.get("title") || layer.get("name"),
        parent: d
      });
			if (self.testLayerVisibility(layer)) d.classList.add('ol-layer-hidden');
		}
	});
};
/** Disable overflow
*/
ol.control.LayerSwitcherImage.prototype.overflow = function(){};

/** Create a legend for styles
 * @constructor
 * @fires select
 * @param {*} options
 *  @param {String} options.className class of the control
 *  @param {String} options.title Legend title
 *  @param {ol.size | undefined} options.size Size of the symboles in the legend, default [40, 25]
 *  @param {int | undefined} options.margin Size of the symbole's margin, default 10
 *  @param {boolean | undefined} options.collapsed Specify if attributions should be collapsed at startup. Default is true.
 *  @param {boolean | undefined} options.collapsible Specify if attributions can be collapsed, default true.
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} options.style a style or a style function to use with features
 * @extends {ol.control.Control}
 */
ol.control.Legend = function(options) {
  options = options || {};
  var element = document.createElement('div');
  if (options.target) {
    element.className = options.className || "ol-legend";
  } else {
    element.className = (options.className || "ol-legend")
      +" ol-unselectable ol-control ol-collapsed"
      +(options.collapsible===false ? ' ol-uncollapsible': '');
    // Show on click
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.addEventListener('click', function() {
      element.classList.toggle('ol-collapsed');
    });
    element.appendChild(button);
    // Hide on click
    button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.className = 'ol-closebox';
    button.addEventListener('click', function() {
      element.classList.toggle('ol-collapsed');
    });
    element.appendChild(button);
  }
  // The legend
  this._imgElement = document.createElement('div');
  this._imgElement.className = 'ol-legendImg';
  element.appendChild(this._imgElement);
  this._tableElement = document.createElement('ul');
  element.appendChild(this._tableElement);
	ol.control.Control.call(this, {
    element: element,
		target: options.target
	});
  this._rows = [];
  this.set('size', options.size || [40, 25]);
  this.set('margin', options.margin===0 ? 0 : options.margin || 10);
  this.set('title', options.title || '');
  // Set the style
  this._style = options.style;
  if (options.collapsed===false) this.show();
  this.refresh();
};
ol.ext.inherits(ol.control.Legend, ol.control.Control);
/** Set the style
 * @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} style a style or a style function to use with features
 */
ol.control.Legend.prototype.setStyle = function(style) {
  this._style = style;
  this.refresh();
};
/** Add a new row to the legend
 *  * You can provide in options:
 * - a feature width a style 
 * - or a feature that will use the legend style function
 * - or properties ans a geometry type that will use the legend style function
 * - or a style and a geometry type
 * @param {*} options a list of parameters 
 *  @param {ol.Feature} options.feature a feature to draw
 *  @param {ol.style.Style} options.style the style to use if no feature is provided
 *  @param {*} options.properties properties to use with a style function
 *  @param {string} options.typeGeom type geom to draw with the style or the properties
 */
ol.control.Legend.prototype.addRow = function(row) {
  this._rows.push(row||{});
  this.refresh();
};
/** Remove a row from the legend
 *  @param {int} index
 */
ol.control.Legend.prototype.removeRow = function(index) {
  this._rows.splice(index,1);
  this.refresh();
};
/** Get a legend row
 * @param {int} index
 * @return {*}
 */
ol.control.Legend.prototype.getRow = function(index) {
  return this._rows[index];
};
/** Get a legend row
 * @return {int}
 */
ol.control.Legend.prototype.getLength = function() {
  return this._rows.length;
};
/** Refresh the legend
 */
ol.control.Legend.prototype.refresh = function() {
  var self = this;
  var table = this._tableElement
  table.innerHTML = '';
  var width = this.get('size')[0] + 2*this.get('margin');
  var height = this.get('size')[1] + 2*this.get('margin');
  // Add a new row
  function addRow(str, title, r, i){
    var row = document.createElement('li');
    row.style.height = height + 'px';
    row.addEventListener('click', function() {
      self.dispatchEvent({ type:'select', title: str, row: r, index: i });
    });
    var col = document.createElement('div');
    row.appendChild(col);
    col.style.height = height + 'px';
    col = document.createElement('div');
    if (title) {
      row.className = 'ol-title';
    } else {
      col.style.paddingLeft = width + 'px';
    }
    col.innerHTML = str || '';
    row.appendChild(col);
    table.appendChild(row);
  }
  if (this.get('title')) {
    addRow(this.get('title'), true, {}, -1);
  }
  var canvas = document.createElement('canvas');
  canvas.width = 5*width;
  canvas.height = (this._rows.length+1) * height * ol.has.DEVICE_PIXEL_RATIO;
  this._imgElement.innerHTML = '';
  this._imgElement.append(canvas);
  this._imgElement.style.height = (this._rows.length+1)*height + 'px';
  for (var i=0, r; r = this._rows[i]; i++) {
    addRow(r.title, false, r, i);
    canvas = this.getStyleImage(r, canvas, i+(this.get('title')?1:0));
  }
};
/** Show control
 */
ol.control.Legend.prototype.show = function() {
  this.element.classList.remove('ol-collapsed');
};
/** Hide control
 */
ol.control.Legend.prototype.hide = function() {
  this.element.classList.add('ol-collapsed');
};
/** Toggle control
 */
ol.control.Legend.prototype.toggle = function() {
  this.element.classList.toggle('ol-collapsed');
};
/** Get the image for a style 
 * You can provide in options:
 * - a feature width a style 
 * - or a feature that will use the legend style function
 * - or properties and a geometry type that will use the legend style function
 * - or a style and a geometry type
 * @param {*} options
 *  @param {ol.Feature} options.feature a feature to draw
 *  @param {ol.style.Style} options.style the style to use if no feature is provided
 *  @param {*} options.properties properties to use with a style function
 *  @param {string} options.typeGeom type geom to draw with the style or the properties
 * @param {Canvas|undefined} canvas a canvas to draw in
 * @param {int|undefined} row row number to draw in canvas
 * @return {CanvasElement}
 */
ol.control.Legend.prototype.getStyleImage = function(options, theCanvas, row) {
  options = options || {};
  var size = this.get('size');
  var width = size[0] + 2*this.get('margin');
  var height = size[1] + 2*this.get('margin');
  var canvas = theCanvas;
  var ratio = ol.has.DEVICE_PIXEL_RATIO;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = width * ratio;
    canvas.height = height * ratio;
  }
  var ctx = canvas.getContext('2d');
  ctx.save();
  var vectorContext = ol.render.toContext(ctx);
  var typeGeom = options.typeGeom;
  var style;
  var feature = options.feature;
  if (!feature && options.properties && typeGeom) {
    if (/Point/.test(typeGeom)) feature = new ol.Feature(new ol.geom.Point([0,0]));
    else if (/LineString/.test(typeGeom)) feature = new ol.Feature(new ol.geom.LineString([0,0]));
    else feature = new ol.Feature(new ol.geom.Polygon([[0,0]]));
    feature.setProperties(options.properties);
  }
  if (feature) {
    style = feature.getStyle();
    if (typeof(style)==='function') style = style(feature);
    if (!style) {
      style = typeof(this._style) === 'function' ? this._style(feature) : this._style || [];
    }
    typeGeom = feature.getGeometry().getType();
  } else {
    style = options.style;
  }
  if (!(style instanceof Array)) style = [style];
  var cx = width/2;
  var cy = height/2;
  var sx = size[0]/2;
  var sy = size[1]/2;
  var i, s;
  // Get point offset
  if (typeGeom === 'Point') {
    var extent = null;
    for (i=0; s= style[i]; i++) {
      var img = s.getImage();
      if (img && img.getAnchor) {
        var anchor = img.getAnchor();
        var si = img.getSize();
        var dx = anchor[0] - si[0];
        var dy = anchor[1] - si[1];
        if (!extent) {
          extent = [dx, dy, dx+si[0], dy+si[1]];
        } else {
          ol.extent.extend(extent, [dx, dy, dx+si[0], dy+si[1]]);
        }
      }
    }
    if (extent) {
      cx = cx + (extent[2] + extent[0])/2;
      cy = cy + (extent[3] + extent[1])/2;
    }
  }
  // Draw image
  cy += (theCanvas ? row*height : 0);
  for (i=0; s= style[i]; i++) {
    vectorContext.setStyle(s);
    switch (typeGeom) {
      case ol.geom.Point:
      case 'Point':
        vectorContext.drawGeometry(new ol.geom.Point([cx, cy]));
        break;
      case ol.geom.LineString:
      case 'LineString':
        ctx.save();
          ctx.rect(this.get('margin') * ratio, 0, size[0] *  ratio, canvas.height);
          ctx.clip();
          vectorContext.drawGeometry(new ol.geom.LineString([[cx-sx, cy], [cx+sx, cy]]));
        ctx.restore();
        break;
      case ol.geom.Polygon:
      case 'Polygon':
        vectorContext.drawGeometry(new ol.geom.Polygon([[[cx-sx, cy-sy], [cx+sx, cy-sy], [cx+sx, cy+sy], [cx-sx, cy+sy], [cx-sx, cy-sy]]]));
        break;
    }
  }
  ctx.restore();
  return canvas;
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
//
/** A control to jump from one zone to another.
 *
 * @constructor
 * @fires select
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {string} options.className class name
 *	@param {ol.layer.Layer} options.layer layer to display in the control
 *	@param {ol.ProjectionLike} options.projection projection of the control, Default is EPSG:3857 (Spherical Mercator).
 *  @param {Array<any>} options.zone an array of zone: { name, extent (in EPSG:4326) }
 *  @param {bolean} options.centerOnClick center on click when click on zones, default true
 */
ol.control.MapZone = function(options) {
  if (!options) options={};
  var element = document.createElement("div");
  if (options.target) {
    element = ol.ext.element.create('DIV', {
      className: options.className || "ol-mapzone"
    });
  } else {
    element = ol.ext.element.create('DIV', {
      className: (options.className || "ol-mapzone") +' ol-unselectable ol-control ol-collapsed'
    });
    var bt = ol.ext.element.create('BUTTON', {
      type: 'button',
      on: {
        'click': function() {
          element.classList.toggle("ol-collapsed");
          maps.forEach(function (m) {
            m.updateSize();
          });
        }.bind(this)
      },
      parent: element
    });
    ol.ext.element.create('I', {
      parent: bt
    });
  }
  // Parent control
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  // Create maps
  var maps = [];
  options.zones.forEach(function(z) {
    var view = new ol.View({ zoom: 6, center: [0,0], projection: options.projection });
    var extent = ol.proj.transformExtent(z.extent, 'EPSG:4326', view.getProjection());
    console.log(extent, z.extent)
    var div = ol.ext.element.create('DIV', {
      className: 'ol-mapzonezone',
      parent: element,
      click : function() {
        this.dispatchEvent({
          type: 'select',
          coordinate: ol.extent.getCenter(extent),
          extent: extent
        });
        if (options.centerOnClick !== false) {
          this.getMap().getView().fit(extent);
        }
        this.setVisible(false);
      }.bind(this)
    });
    var layer = new options.layer.constructor({
      source: options.layer.getSource()
    });
    var map = new ol.Map({
      target: div,
      view: view,
      controls: [],
      interactions:[],
      layers: [layer]
    });
    maps.push(map);
    view.fit(extent);
    // Nmae
    ol.ext.element.create('P', {
      html: z.title,
      parent: div
    });
  }.bind(this));
  // Refresh the maps
  setTimeout(function() {
    maps.forEach(function (m) {
      m.updateSize();
    });
  });
};
ol.ext.inherits(ol.control.MapZone, ol.control.Control);
/** Set the control visibility
* @param {boolean} b
*/
ol.control.MapZone.prototype.setVisible = function (b) {
  if (b) this.element.classList.remove('ol-collapsed');
  else this.element.classList.add('ol-collapsed');
};
/** Pre-defined zones */
ol.control.MapZone.zones = {};
/** French overseas departments  */
ol.control.MapZone.zones.DOM = [{
  "title": "Guadeloupe",
  "extent": [ -61.898594315312444, 15.75623038647845, -60.957887532935324, 16.575317670979473 ]
},{
  "title": "Guyane",
  "extent": [ -54.72525931072715, 2.1603763430019, -51.528236062921344, 5.7984307809552575 ]
},{
  "title": "Martinique",
  "extent": [ -61.257556528564756, 14.387506317407514, -60.76934912110432, 14.895067461729951 ]
},{
  "title": "Mayotte",
  "extent": [ 44.959844536967815, -13.01674138212816, 45.35328866510648, -12.65521942207829 ]
},{
  "title": "La réunion",
  "extent": [ 55.17059012967656, -21.407680069231688, 55.88195702001797, -20.85560221637526 ]
}];
/** French overseas territories */
ol.control.MapZone.zones.TOM = [{
  "title": "Polynésie Française",
  "extent": [ 206.23664226630862, -22.189040615809787, 221.85920743981987, -10.835039595040698 ]
},{
  "title": "Nouvelle Calédonie",
  "extent": [ 163.76420580160925, -22.581641092751838, 167.66984709498706, -19.816411635668445 ]
},{
  "title": "St-Pierre et Miquelon",
  "extent": [ -56.453698765748676, 46.74449858188555, -56.0980198121544, 47.14669874229787 ]
},{
  "title": "Wallis et Futuna",
  "extent": [ 181.7588623143665, -14.7341169873267, 183.95612353301715, -13.134720799175085 ]
},{
  "title": "St-Martin St-Barthélemy",
  "extent": [ -63.1726389501678, 17.806097291313506, -62.7606535945649, 18.13267688837938 ]
}];
/** French overseas departments and territories */
ol.control.MapZone.zones.DOMTOM = [{
  title: 'Métropole',
  extent: [ -5.318421740712579, 41.16082274292913, 9.73284186155716, 51.21957336557702 ]
}].concat(ol.control.MapZone.zones.DOM,ol.control.MapZone.zones.TOM);

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Control overlay for OL3
 * The overlay control is a control that display an overlay over the map
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fire change:visible
 * @param {Object=} options Control options.
 *  @param {string} className class of the control
 *  @param {boolean} hideOnClick hide the control on click, default false
 *  @param {boolean} closeBox add a closeBox to the control, default false
 */
ol.control.Notification = function(options) {
  options = options || {};
	var element = document.createElement("DIV");
  this.contentElement = document.createElement("DIV");
  element.appendChild(this.contentElement);
  var classNames = (options.className||"")+ " ol-notification";
	if (!options.target) {
    classNames += " ol-unselectable ol-control ol-collapsed";
  }
	element.setAttribute('class', classNames);
	ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
};
ol.ext.inherits(ol.control.Notification, ol.control.Control);
/**
 * Display a notification on the map
 * @param {string|node|undefined} what the notification to show, default get the last one
 * @param {number} [duration=3000] duration in ms, if -1 never hide
 */
ol.control.Notification.prototype.show = function(what, duration) {
  var self = this;
  var elt = this.element;
  if (what) {
    if (what instanceof Node) {
      this.contentElement.innerHTML = '';
      this.contentElement.appendChild(what);
    } else {
      this.contentElement.innerHTML = what;
    }
  }
  if (this._listener) {
    clearTimeout(this._listener);
    this._listener = null;
  }
  elt.classList.add('ol-collapsed');
  this._listener = setTimeout(function() {
    elt.classList.remove('ol-collapsed');
    if (!duration || duration >= 0) {
      self._listener = setTimeout(function() {
        elt.classList.add('ol-collapsed');
        self._listener = null;
      }, duration || 3000);
    } else {
      self._listener = null;
    }
  }, 100);
};
/**
 * Remove a notification on the map
 */
ol.control.Notification.prototype.hide = function() {
  if (this._listener) {
    clearTimeout(this._listener);
    this._listener = null;
  }
  this.element.classList.add('ol-collapsed');
};
/**
 * Toggle a notification on the map
 * @param {number} [duration=3000] duration in ms
 */
ol.control.Notification.prototype.toggle = function(duration) {
  if (this.element.classList.contains('ol-collapsed')) {
    this.show(null, duration);
  } else {
    this.hide();
  }
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Control overlay for OL3
 * The overlay control is a control that display an overlay over the map
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fire change:visible
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
*	@param {String|Element} options.content
*	@param {bool} options.hideOnClick hide the control on click, default false
*	@param {bool} options.closeBox add a closeBox to the control, default false
*/
ol.control.Overlay = function(options) {
  if (!options) options={};
/*
  var element = document.createElement("div");
  element.classList.add('ol-unselectable', 'ol-overlay');
  //if (options.className) element.classList.add(options.className);
*/
  var element = ol.ext.element.create('DIV', {
    className: 'ol-unselectable ol-overlay '+(options.className||''),
    html: options.content
  });
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  var self = this;
  if (options.hideOnClick) element.addEventListener("click", function(){self.hide();});
  this.set("closeBox", options.closeBox);
  this._timeout = false;
  this.setContent (options.content);
};
ol.ext.inherits(ol.control.Overlay, ol.control.Control);
/** Set the content of the overlay
* @param {string|Element} html the html to display in the control
*/
ol.control.Overlay.prototype.setContent = function (html) {
  var self = this;
  if (html) {
    var elt = this.element;
    if (html instanceof Element) {
      elt.innerHTML='';
      elt.appendChild(html)
    }
    else if (html!==undefined) elt.innerHTML = html;
    if (this.get("closeBox")) {
      var cb = document.createElement("div");
      cb.classList.add("ol-closebox");
      cb.addEventListener("click", function(){self.hide();});
      elt.insertBefore(cb, elt.firstChild);
    }
  }
};
/** Set the control visibility
* @param {string|Element} html the html to display in the control
* @param {ol.coordinate} coord coordinate of the top left corner of the control to start from
*/
ol.control.Overlay.prototype.show = function (html, coord) {
  var self = this;
  var elt = this.element;
  elt.style.display = 'block';
  if (coord) {
    this.center_ = this.getMap().getPixelFromCoordinate(coord);
    elt.style.top = this.center_[1]+'px';
    elt.style.left = this.center_[0]+'px';
  } else {
    //TODO: Do fix from  hkollmann pull request
    this.center_ = false;
    elt.style.top = "";
    elt.style.left = "";
  }
  if (html) this.setContent(html);
  if (this._timeout) clearTimeout(this._timeout);
  this._timeout = setTimeout(function() {
    elt.classList.add("ol-visible")
    elt.style.top = "";
    elt.style.left = "";
    self.dispatchEvent({ type:'change:visible', visible:true, element: self.element });
  }, 10);
};
/** Show an image
 * @param {string} src image url
 * @param {*} options
 *  @param {string} options.title
 *  @param {ol.coordinate} coordinate
 */
ol.control.Overlay.prototype.showImage = function (src, options) {
  options = options || {};
  var content = ol.ext.element.create('DIV', {
    className: 'ol-fullscreen-image'
  });
  ol.ext.element.create('IMG', {
    src: src,
    parent: content
  });
  if (options.title) {
    content.classList.add('ol-has-title');
    ol.ext.element.create('P', { 
      html: options.title,
      parent: content
    });
  }
  this.show(content, options.coordinate);
};
/** Set the control visibility hidden
*/
ol.control.Overlay.prototype.hide = function () {
  var elt = this.element;
  this.element.classList.remove("ol-visible");
  if (this.center_) {
    elt.style.top = this.center_[1]+'px';
    elt.style.left = this.center_[0]+'px';
    this.center_ = false;
  }
  if (this._timeout) clearTimeout(this._timeout);
  this._timeout = setTimeout(function(){ elt.style.display = 'none'; }, 500);
  this.dispatchEvent({ type:'change:visible', visible:false, element: this.element });
};
/** Toggle control visibility
*/
ol.control.Overlay.prototype.toggle = function () {	
  if (this.getVisible()) this.hide();
  else this.show();
}
/** Get the control visibility
* @return {boolean} b
*/
ol.control.Overlay.prototype.getVisible = function () {
  return ol.ext.element.getStyle(this.element, 'display') !== 'none';
};
/** Change class name
* @param {String} className a class name or a list of class names separated by a space
*/
ol.control.Overlay.prototype.setClass = function (className) {
  var vis = this.element.classList.contains('ol-visible');
  this.element.className = ('ol-unselectable ol-overlay '+(vis ? 'ol-visible ' : '')+className).trim();
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * OpenLayers 3 Layer Overview Control.
 * The overview can rotate with map. 
 * Zoom levels are configurable.
 * Click on the overview will center the map.
 * Change width/height of the overview trough css.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *  @param {ol.ProjectionLike} options.projection The projection. Default is EPSG:3857 (Spherical Mercator).
 *  @param {Number} options.minZoom default 0
 *  @param {Number} options.maxZoom default 18
 *  @param {boolean} options.rotation enable rotation, default false
 *  @param {top|bottom-left|right} options.align position
 *  @param {Array<ol.layer>} options.layers list of layers
 *  @param {ol.style.Style | Array.<ol.style.Style> | undefined} options.style style to draw the map extent on the overveiw
 *  @param {bool|elastic} options.panAnimation use animation to center map on click, default true
 */
ol.control.Overview = function(options)
{	options = options || {};
  var self = this;
  // API
  this.minZoom = options.minZoom || 0;
  this.maxZoom = options.maxZoom || 18;
  this.rotation = options.rotation;
  var element;
  if (options.target) {
    element = document.createElement("div");
    this.panel_ = options.target;
  } else {
    element = document.createElement("div");
    element.classList.add('ol-overview', 'ol-unselectable', 'ol-control', 'ol-collapsed');
    if (/top/.test(options.align)) element.classList.add('ol-control-top');
    if (/right/.test(options.align)) element.classList.add('ol-control-right');
    var button = document.createElement("button");
        button.setAttribute('type','button');
        button.addEventListener("touchstart", function(e){ self.toggleMap(); e.preventDefault(); });
        button.addEventListener("click", function(){self.toggleMap()});
        element.appendChild(button);
    this.panel_ = document.createElement("div");
    this.panel_.classList.add("panel");
    element.appendChild(this.panel_);
  }
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  // Create a overview map
  this.ovmap_ = new ol.Map({
    controls: new ol.Collection(),
    interactions: new ol.Collection(),
    target: this.panel_,
    view: new ol.View ({
      zoom: 2,
      center: [0,0],
      projection: options.projection
    }),
    layers: options.layers
  });
  this.oview_ = this.ovmap_.getView();
  // Cache extent
  this.extentLayer = new ol.layer.Vector({
    name: 'Cache extent',
    source: new ol.source.Vector(),
    style: options.style || [new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
          color: 'rgba(255,0,0, 1)'
        }),
        stroke: new ol.style.Stroke({
          width: 7,
            color: 'rgba(255,0,0, 0.8)'
          }),
          radius: 5
        }),
        stroke: new ol.style.Stroke({
          width: 5,
          color: "rgba(255,0,0,0.8)"
        })
      }
    )]
  })
  this.ovmap_.addLayer(this.extentLayer);
  /** Elastic bounce
  *	@param {Int} bounce number of bounce
  *	@param {Number} amplitude amplitude of the bounce [0,1] 
  *	@return {Number}
  * /
  var bounceFn = function (bounce, amplitude){
    var a = (2*bounce+1) * Math.PI/2;
    var b = amplitude>0 ? -1/amplitude : -100;
    var c = - Math.cos(a) * Math.pow(2, b);
    return function(t) {
      t = 1-Math.cos(t*Math.PI/2);
      return 1 + Math.abs( Math.cos(a*t) ) * Math.pow(2, b*t) + c*t;
    }
  }
  /** Elastic bounce
  *	@param {Int} bounce number of bounce
  *	@param {Number} amplitude amplitude of the bounce [0,1] 
  *	@return {Number}
  */
  var elasticFn = function (bounce, amplitude) {
    var a = 3*bounce * Math.PI/2;
    var b = amplitude>0 ? -1/amplitude : -100;
    var c = Math.cos(a) * Math.pow(2, b);
    return function(t){
      t = 1-Math.cos(t*Math.PI/2);
      return 1 - Math.cos(a*t) * Math.pow(2, b*t) + c*t;
    }
  }
  // Click on the preview center the map
  this.ovmap_.addInteraction (new ol.interaction.Pointer({
    handleDownEvent: function(evt) {
      if (options.panAnimation !==false) {
        if (options.panAnimation=="elastic" || options.elasticPan) {
          self.getMap().getView().animate({
            center: evt.coordinate,
            easing: elasticFn(2,0.3),
            duration: 1000
          });
        } else {
          self.getMap().getView().animate({
            center: evt.coordinate,
            duration: 300
          });
        }
      }
      else self.getMap().getView().setCenter(evt.coordinate);
      return false;
    }
  }));
};
ol.ext.inherits(ol.control.Overview, ol.control.Control);
/** Get overview map
*	@return {ol.Map}
*/
ol.control.Overview.prototype.getOverviewMap = function(){
  return this.ovmap_;
};
/** Toggle overview map
*/
ol.control.Overview.prototype.toggleMap = function(){
  this.element.classList.toggle("ol-collapsed");
  this.ovmap_.updateSize();
  this.setView();
};
/** Set overview map position
*	@param {top|bottom-left|right}
*/
ol.control.Overview.prototype.setPosition = function(align){
  if (/top/.test(align)) this.element.classList.add("ol-control-top");
  else this.element.classList.remove("ol-control-top");
  if (/right/.test(align)) this.element.classList.add("ol-control-right");
  else this.element.classList.remove("ol-control-right");
};
/**
 * Set the map instance the control associated with.
 * @param {ol.Map} map The map instance.
 */
ol.control.Overview.prototype.setMap = function(map) {
  if (this._listener) ol.Observable.unByKey(this._listener);
  this._listener = null;
  ol.control.Control.prototype.setMap.call(this, map);
  if (map) {
    this._listener = map.getView().on('propertychange', this.setView.bind(this));
    this.setView();
  }
};
/** Calculate the extent of the map and draw it on the overview
*/
ol.control.Overview.prototype.calcExtent_ = function(extent){
  var map = this.getMap();
  if (!map) return;
  var source = this.extentLayer.getSource();
  source.clear();
  var f = new ol.Feature();
  var size = map.getSize();
  var resolution = map.getView().getResolution();
  var rotation = map.getView().getRotation();
  var center = map.getView().getCenter();
  if (!resolution) return;
  var dx = resolution * size[0] / 2;
  var dy = resolution * size[1] / 2;
  var res2 = this.oview_.getResolution();
  if (dx/res2>5 || dy/res2>5) {
    var cos = Math.cos(rotation);
    var sin = Math.sin(rotation);
    var i, x, y;
    extent=[[-dx,-dy],[-dx,dy],[dx,dy],[dx,-dy]];
    for (i = 0; i < 4; ++i) {
      x = extent[i][0];
      y = extent[i][1];
      extent[i][0] = center[0] + x * cos - y * sin;
      extent[i][1] = center[1] + x * sin + y * cos;
    }
    f.setGeometry (new ol.geom.Polygon( [ extent ]));
  } else {
    f.setGeometry (new ol.geom.Point( center ));
  }
  source.addFeature(f);
};
/**
*	@private
*/
ol.control.Overview.prototype.setView = function(e){
  if (!e) {
    // refresh all
    this.setView({key:'rotation'});
    this.setView({key:'resolution'});
    this.setView({key:'center'});
    return;
  }
  // Set the view params
  switch (e.key){
    case 'rotation': {
      if (this.rotation) this.oview_.setRotation(this.getMap().getView().getRotation());
      else if (this.oview_.getRotation()) this.oview_.setRotation(0);
      break;
    }
    case 'center': {
      var mapExtent = this.getMap().getView().calculateExtent(this.getMap().getSize());
      var extent = this.oview_.calculateExtent(this.ovmap_.getSize());
      if (mapExtent[0]<extent[0] || mapExtent[1]<extent[1] 
      || mapExtent[2]>extent[2] || mapExtent[3]>extent[3]){
        this.oview_.setCenter(this.getMap().getView().getCenter()); 
      }
      break;
    }	
    case 'resolution': {
      //var z = Math.round(this.getMap().getView().getZoom()/2)*2-4;
      var z = Math.round(this.oview_.getZoomForResolution(this.getMap().getView().getResolution())/2)*2-4;
      z = Math.min ( this.maxZoom, Math.max(this.minZoom, z) );
      this.oview_.setZoom(z);
      break;
    }
    default: break;
  }
  this.calcExtent_();
};

/*	Copyright (c) 2015-2018 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Set an hyperlink that will return the user to the current map view.
 * Just add a `permalink`property to layers to be handled by the control (and added in the url). 
 * The layer's permalink property is used to name the layer in the url.
 * The control must be added after all layer are inserted in the map to take them into acount.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options
 *  @param {bool} options.urlReplace replace url or not, default true
 *  @param {bool} options.localStorage save current map view in localStorage, default false
 *  @param {integer} options.fixed number of digit in coords, default 6
 *  @param {bool} options.anchor use "#" instead of "?" in href
 *  @param {bool} options.hidden hide the button on the map, default false
 *  @param {function} options.onclick a function called when control is clicked
*/
ol.control.Permalink = function(opt_options) {
  var options = opt_options || {};
  var self = this;
  var button = document.createElement('button');
  this.replaceState_ = (options.urlReplace!==false);
  this.fixed_ = options.fixed || 6;
  this.hash_ = options.anchor ? "#" : "?";
  this._localStorage = options.localStorage;
  if (!this._localStorage) localStorage.removeItem('ol@parmalink');
  function linkto() {
    if (typeof(options.onclick) == 'function') options.onclick(self.getLink());
    else self.setUrlReplace(!self.replaceState_);
  }
  button.addEventListener('click', linkto, false);
  button.addEventListener('touchstart', linkto, false);
  var element = document.createElement('div');
  element.className = (options.className || "ol-permalink") + " ol-unselectable ol-control";
  element.appendChild(button);
  if (options.hidden) ol.ext.element.hide(element);
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  this.on ('change', this.viewChange_.bind(this));
  // Save search params
  this.search_ = {};
  var hash = this.replaceState_ ? document.location.hash || document.location.search : '';
  console.log('hash', hash)
  if (!hash && this._localStorage) {
    hash = localStorage['ol@parmalink'];
  }
  if (hash) {
    hash = hash.replace(/(^#|^\?)/,"").split("&");
    for (var i=0; i<hash.length;  i++) {
      var t = hash[i].split("=");
      switch(t[0]) {
        case 'lon':
        case 'lat':
        case 'z':
        case 'r':
        case 'l': break;
        default: this.search_[t[0]] = t[1];
      }
    }
  }
  // Decode permalink
  this.setPosition();
};
ol.ext.inherits(ol.control.Permalink, ol.control.Control);
/**
 * Set the map instance the control associated with.
 * @param {ol.Map} map The map instance.
 */
ol.control.Permalink.prototype.setMap = function(map) {
  if (this._listener) {
    ol.Observable.unByKey(this._listener.change);
    ol.Observable.unByKey(this._listener.moveend);
  }
  this._listener = null;
  ol.control.Control.prototype.setMap.call(this, map);
  // Get change 
  if (map) {
    this._listener = {
      change: map.getLayerGroup().on('change', this.layerChange_.bind(this)),
      moveend: map.on('moveend', this.viewChange_.bind(this))
    };
    this.setPosition();
  }
};
/** Get layer given a permalink name (permalink propertie in the layer)
*	@param {string} the permalink to search for
*	@param {Array<ol.layer>|undefined} an array of layer to search in
*	@return {ol.layer|false}
*/
ol.control.Permalink.prototype.getLayerByLink =  function (id, layers) {
  if (!layers && this.getMap()) layers = this.getMap().getLayers().getArray();
  for (var i=0; i<layers.length; i++) {
    if (layers[i].get('permalink') == id) return layers[i];
    // Layer Group
    if (layers[i].getLayers) {
      var li = this.getLayerByLink ( id, layers[i].getLayers().getArray() );
      if (li) return li;
    }
  }
  return false;
};
/** Set map position according to the current link 
*/
ol.control.Permalink.prototype.setPosition = function() {
  var map = this.getMap();
  if (!map) return;
  var hash = this.replaceState_ ? document.location.hash || document.location.search : '';
  if (!hash && this._localStorage) {
    hash = localStorage['ol@parmalink'];
  }
  if (!hash) return;
  var i, t, param = {};
  hash = hash.replace(/(^#|^\?)/,"").split("&");
  for (i=0; i<hash.length;  i++) {
    t = hash[i].split("=");
    param[t[0]] = t[1];
  }
  var c = ol.proj.transform([Number(param.lon),Number(param.lat)], 'EPSG:4326', map.getView().getProjection());
  if (c[0] && c[1]) map.getView().setCenter(c);
  if (param.z) map.getView().setZoom(Number(param.z));
  if (param.r) map.getView().setRotation(Number(param.r));
  // Reset layers visibility
  function resetLayers(layers) {
    if (!layers) layers = map.getLayers().getArray();
    for (var i=0; i<layers.length; i++){
      if (layers[i].get('permalink')) {
        layers[i].setVisible(false);
        // console.log("hide "+layers[i].get('permalink'));
      }
      if (layers[i].getLayers) {
        resetLayers (layers[i].getLayers().getArray());
      }
    }
  }
  if (param.l) {
    resetLayers();
    var l = param.l.split("|");
    for (i=0; i<l.length; i++) {
      t = l[i].split(":");
      var li = this.getLayerByLink(t[0]);
      var op = Number(t[1]);
      if (li) {
        li.setOpacity(op);
        li.setVisible(true);
      }
    }
  }
};
/**
 * Get the parameters added to the url. The object can be changed to add new values.
 * @return {Object} a key value object added to the url as &key=value
 * @api stable
 */
ol.control.Permalink.prototype.getUrlParams = function() {
  return this.search_;
};
/**
 * Set a parameter to the url.
 * @param {string} key the key parameter
 * @param {string|undefined} value the parameter's value, if undefined or empty string remove the parameter
 * @api stable
 */
ol.control.Permalink.prototype.setUrlParam = function(key, value) {
  if (key) {
    if (value===undefined || value==='') delete (this.search_[encodeURIComponent(key)])
    else this.search_[encodeURIComponent(key)] = encodeURIComponent(value);
  }
  this.viewChange_();
};
/**
 * Get a parameter url.
 * @param {string} key the key parameter
 * @return {string} the parameter's value or empty string if not set
 * @api stable
 */
ol.control.Permalink.prototype.getUrlParam = function(key) {
  return decodeURIComponent (this.search_[encodeURIComponent(key)] || '');
};
/**
 * Has a parameter url.
 * @param {string} key the key parameter
 * @return {boolean} 
 * @api stable
 */
ol.control.Permalink.prototype.hasUrlParam = function(key) {
  return this.search_.hasOwnProperty(encodeURIComponent(key));
};
/**
 * Get the permalink
 * @return {permalink}
 */
ol.control.Permalink.prototype.getLink = function(param) {
  var map = this.getMap();
  var c = ol.proj.transform(map.getView().getCenter(), map.getView().getProjection(), 'EPSG:4326');
  var z = map.getView().getZoom();
  var r = map.getView().getRotation();
  var l = this.layerStr_;
  // Change anchor
  var anchor = "lon="+c[0].toFixed(this.fixed_)+"&lat="+c[1].toFixed(this.fixed_)+"&z="+z+(r?"&r="+(Math.round(r*10000)/10000):"")+(l?"&l="+l:"");
  for (var i in this.search_) anchor += "&"+i+"="+this.search_[i];
  if (param) return anchor;
  //return document.location.origin+document.location.pathname+this.hash_+anchor;
  return document.location.protocol+"//"+document.location.host+document.location.pathname+this.hash_+anchor;
};
/**
 * Enable / disable url replacement (replaceSate)
 *	@param {bool}
*/
ol.control.Permalink.prototype.setUrlReplace = function(replace) {
  try {
    this.replaceState_ = replace;
    if (!replace) {
      var s = "";
      for (var i in this.search_) {
        s += (s==""?"?":"&") + i+"="+this.search_[i];
      }
      window.history.replaceState (null,null, document.location.origin+document.location.pathname+s);
    }
    else window.history.replaceState (null,null, this.getLink());
  } catch(e) {/* ok */}
  /*
  if (this._localStorage) {
    localStorage['ol@parmalink'] = this.getLink(true);
  }
  */
};
/**
 * On view change refresh link
 * @param {ol.event} The map instance.
 * @private
 */
ol.control.Permalink.prototype.viewChange_ = function() {
  try {
    if (this.replaceState_) window.history.replaceState (null,null, this.getLink());
  } catch(e) {/* ok */}
  if (this._localStorage) {
    localStorage['ol@parmalink'] = this.getLink(true);
  }
};
/**
 * Layer change refresh link
 * @private
 */
ol.control.Permalink.prototype.layerChange_ = function() {
  // Get layers
  var l = "";
  function getLayers(layers) {
    for (var i=0; i<layers.length; i++) {
      if (layers[i].getVisible() && layers[i].get("permalink")) {
        if (l) l += "|";
        l += layers[i].get("permalink")+":"+layers[i].get("opacity");
      }
      // Layer Group
      if (layers[i].getLayers) getLayers(layers[i].getLayers().getArray());
    }
  }
  getLayers(this.getMap().getLayers().getArray());
  this.layerStr_ = l;
  this.viewChange_();
};

/*
  Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Print control to get an image of the map
 *
 * @constructor
 * @fire print
 * @fire error
 * @fire printing
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {string} options.imageType A string indicating the image format, default image/jpeg
 *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
 *	@param {string} options.orientation Page orientation (landscape/portrait), default guest the best one
 */
ol.control.Print = function(options) {
  if (!options) options = {};
  var element = ol.ext.element.create('DIV', {
    className: (options.className || 'ol-print')
  });
  if (!options.target) {
    element.classList.add('ol-unselectable', 'ol-control');
    ol.ext.element.create('BUTTON', {
      type: 'button',
      click: function() { this.print(); }.bind(this),
      parent: element
    });
  }
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  this.set('imageType', options.imageType || 'image/jpeg');
  this.set('quality', options.quality || .8);
  this.set('orientation', options.orientation);
};
ol.ext.inherits(ol.control.Print, ol.control.Control);
/** Print the map
 * @param {function} cback a callback function that take a string containing the requested data URI.
 * @param {Object} options
 *	@param {string} options.imageType A string indicating the image format, default the control one
 *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
 *  @param {boolean} options.immediate true to prevent delay for printing
 *  @param {*} options.any any options passed to the print event when fired
 * @api
 */
ol.control.Print.prototype.print = function(options) {
  options = options || {};
  var imageType = options.imageType || this.get('imageType');
  var quality = options.quality || this.get('quality');
  if (this.getMap()) {
    if (options.immediate !== 'silent') {
      this.dispatchEvent(Object.assign({ 
        type: 'printing',
      }, options));
    }
    // Start printing after delay to var user show info in the DOM
    if (!options.immediate) {
      setTimeout (function () {
        options = Object.assign({}, options);
        options.immediate = 'silent';
        this.print(options);
      }.bind(this), 200);
      return;
    }
    // Run printing
    this.getMap().once('rendercomplete', function(event) {
      var canvas, ctx;
      // ol <= 5 : get the canvas
      if (event.context) {
        canvas = event.context.canvas;
      } else {
        // ol6+ : create canvas using layer canvas
        this.getMap().getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-fixedoverlay').forEach(function(c) {
          if (c.width) {
            // Create a canvas if none
            if (!canvas) {
              canvas = document.createElement('canvas');
              var size = this.getMap().getSize();
              canvas.width = size[0];
              canvas.height = size[1];
              ctx = canvas.getContext('2d');
              if (/jp.*g$/.test(imageType)) {
                ctx.fillStyle = this.get('bgColor') || 'white';
                ctx.fillRect(0,0,canvas.width,canvas.height);		
              }
            }
            ctx.save();
            // opacity
            if (c.parentNode.style.opacity==='0') return;
            ctx.globalAlpha = parseFloat(c.parentNode.style.opacity) || 1;
            // transform
            var tr = ol.ext.element.getStyle(c,'transform') || ol.ext.element.getStyle(c,'-webkit-transform');
            if (/^matrix/.test(tr)) {
              tr = tr.replace(/^matrix\(|\)$/g,'').split(',');
              tr.forEach(function(t,i) { tr[i] = parseFloat(t); });
              ctx.transform(tr[0],tr[1],tr[2],tr[3],tr[4],tr[5]);
              ctx.drawImage(c, 0, 0);
            } else {
              ctx.drawImage(c, 0, 0, ol.ext.element.getStyle(c,'width'), ol.ext.element.getStyle(c,'height'));
            }
            ctx.restore();
          }
        }.bind(this));
      }
      // Calculate print format
      var size = [210,297], format = 'a4';
      var w, h, position;
      var orient = options.orient || this.get('orientation');
      var margin = options.margin || 10;
      if (canvas) {
        // Calculate size
        if (orient!=='landscape' && orient!=='portrait') {
          orient = (canvas.width > canvas.height) ? 'landscape' : 'portrait';
        }
        if (orient === 'landscape') size = [size[1],size[0]];
        var sc = Math.min ((size[0]-2*margin)/canvas.width,(size[1]-2*margin)/canvas.height);
        w = sc * canvas.width;
        h = sc * canvas.height;
        // Image position
        position = [(size[0] - w)/2, (size[1] - h)/2];
      }
      // get the canvas image
      var image;
      try { 
        image = canvas ? canvas.toDataURL(imageType, quality) : null;
      } catch(e) {
        // Fire error event
        this.dispatchEvent({
          type: 'error',
          canvas: canvas
        });
        return;
      }
      // Fire print event
      var e = Object.assign({ 
        type: 'print',
        print: {
          format: format,
          orientation: orient,
          unit: 'mm',
          size: size,
          position: position,
          imageWidth: w,
          imageHeight: h
        },
        image: image,
        imageType: imageType,
        canvas: canvas
      }, options);
      this.dispatchEvent(e);
    }.bind(this));
    this.getMap().render();
  }
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
/**
 * @classdesc OpenLayers 3 Profil Control.
 *	Draw a profil of a feature (with a 3D geometry)
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires  over, out, show
 * @param {Object=} _ol_control_ opt_options.
 *
 */
ol.control.Profil = function(opt_options)
{	var options = opt_options || {};
	this.info = options.info || ol.control.Profil.prototype.info;
	var self = this;
	var element;
	if (options.target)
	{	element = document.createElement("div");
		element.classList.add(options.className || "ol-profil");
	}
	else
	{	element = document.createElement("div");
		element.className = ((options.className || 'ol-profil') +' ol-unselectable ol-control ol-collapsed').trim();
		this.button = document.createElement("button");
		this.button.setAttribute('type','button');
		var click_touchstart_function = function(e)
		{	self.toggle();
			e.preventDefault();
		};
		this.button.addEventListener("click", click_touchstart_function);
		this.button.addEventListener("touchstart", click_touchstart_function);
		element.appendChild(this.button);
	}
	var div_inner = document.createElement("div");
			div_inner.classList.add("ol-inner");
			element.appendChild(div_inner);
	var div = document.createElement("div");
			div.style.position = "relative";
			div_inner.appendChild(div);
	var ratio = this.ratio = 2;
	this.canvas_ = document.createElement('canvas');
	this.canvas_.width = (options.width || 300)*ratio;
	this.canvas_.height = (options.height || 150)*ratio;
	var styles = {
		"msTransform":"scale(0.5,0.5)", "msTransformOrigin":"0 0",
		"webkitTransform":"scale(0.5,0.5)", "webkitTransformOrigin":"0 0",
		"mozTransform":"scale(0.5,0.5)", "mozTransformOrigin":"0 0",
		"transform":"scale(0.5,0.5)", "transformOrigin":"0 0"
	};
	Object.keys(styles).forEach(function(style) {
		if (style in self.canvas_.style) {
			self.canvas_.style[style] = styles[style];
		}
	});
	var div_to_canvas = document.createElement("div");
	div.appendChild(div_to_canvas);
	div_to_canvas.style.width = this.canvas_.width/ratio + "px";
	div_to_canvas.style.height = this.canvas_.height/ratio + "px";
	div_to_canvas.appendChild(this.canvas_);
	div_to_canvas.addEventListener("click", function(e){ self.onMove(e); });
	div_to_canvas.addEventListener("mousemove", function(e){ self.onMove(e); });
	ol.control.Control.call(this,
	{	element: element,
		target: options.target
	});
	// Offset in px
	this.margin_ = { top:10*ratio, left:40*ratio, bottom:30*ratio, right:10*ratio };
	if (!this.info.ytitle) this.margin_.left -= 20*ratio;
	if (!this.info.xtitle) this.margin_.bottom -= 20*ratio;
	// Cursor
	this.bar_ = document.createElement("div");
	this.bar_.classList.add("ol-profilbar");
	this.bar_.style.top = (this.margin_.top/ratio)+"px";
	this.bar_.style.height = (this.canvas_.height-this.margin_.top-this.margin_.bottom)/ratio+"px";
	div.appendChild(this.bar_);
	this.cursor_ = document.createElement("div");
	this.cursor_.classList.add("ol-profilcursor");
	div.appendChild(this.cursor_);
	this.popup_ = document.createElement("div");
	this.popup_.classList.add("ol-profilpopup");
	this.cursor_.appendChild(this.popup_);
	// Track information
	var t = document.createElement("table");
			t.cellPadding = '0';
			t.cellSpacing = '0';
			t.style.clientWidth = this.canvas_.width/ratio + "px";
		div.appendChild(t);
	var firstTr = document.createElement("tr");
			firstTr.classList.add("track-info");
			t.appendChild(firstTr);
	var div_zmin = document.createElement("td");
	div_zmin.innerHTML = (this.info.zmin||"Zmin")+': <span class="zmin">';
	firstTr.appendChild(div_zmin);
	var div_zmax = document.createElement("td");
	div_zmax.innerHTML = (this.info.zmax||"Zmax")+': <span class="zmax">';
	firstTr.appendChild(div_zmax);
	var div_distance = document.createElement("td");
	div_distance.innerHTML = (this.info.distance||"Distance")+': <span class="dist">';
	firstTr.appendChild(div_distance);
	var div_time = document.createElement("td");
	div_time.innerHTML = (this.info.time||"Time")+': <span class="time">';
	firstTr.appendChild(div_time);
	var secondTr = document.createElement("tr");
			secondTr.classList.add("point-info")
			t.appendChild(secondTr);
	var div_altitude = document.createElement("td");
	div_altitude.innerHTML = (this.info.altitude||"Altitude")+': <span class="z">';
	secondTr.appendChild(div_altitude);
	var div_distance2 = document.createElement("td");
	div_distance2.innerHTML = (this.info.distance||"Distance")+': <span class="dist">';
	secondTr.appendChild(div_distance2);
	var div_time2 = document.createElement("td");
	div_time2.innerHTML = (this.info.time||"Time")+': <span class="time">';
	secondTr.appendChild(div_time2);
	// Array of data
	this.tab_ = [];
	// Show feature
	if (options.feature)
	{	this.setGeometry (options.feature);
	}
};
ol.ext.inherits(ol.control.Profil, ol.control.Control);
/** Custom infos list
* @api stable
*/
ol.control.Profil.prototype.info =
{	"zmin": "Zmin",
	"zmax": "Zmax",
	"ytitle": "Altitude (m)",
	"xtitle": "Distance (km)",
	"time": "Time",
	"altitude": "Altitude",
	"distance": "Distance",
	"altitudeUnits": "m",
	"distanceUnitsM": "m",
	"distanceUnitsKM": "km",
};
/** Show popup info
* @param {string} info to display as a popup
* @api stable
*/
ol.control.Profil.prototype.popup = function(info)
{	this.popup_.innerHTML = info;
}
/** Mouse move over canvas
*/
ol.control.Profil.prototype.onMove = function(e)
{	if (!this.tab_.length) return;
	var box_canvas = this.canvas_.getBoundingClientRect();
	var pos = {
    top: box_canvas.top + window.pageYOffset - document.documentElement.clientTop,
    left: box_canvas.left + window.pageXOffset - document.documentElement.clientLeft
  };
	var dx = e.pageX -pos.left;
	var dy = e.pageY -pos.top;
	var ratio = this.ratio;
	if (dx>this.margin_.left/ratio && dx<(this.canvas_.width-this.margin_.right)/ratio
		&& dy>this.margin_.top/ratio && dy<(this.canvas_.height-this.margin_.bottom)/ratio)
	{	this.bar_.style.left = dx+"px";
		this.bar_.style.display = "block";
		var d = (dx*ratio-this.margin_.left)/this.scale_[0];
		var p0 = this.tab_[0];
		for (var i=1, p; p=this.tab_[i]; i++)
		{	if (p[0]>=d)
			{	if (d < (p[0]+p0[0])/2) p = p0;
				break;
			}
		}
		if (p) {
			this.cursor_.style.left = dx+"px";
			this.cursor_.style.top = (this.canvas_.height-this.margin_.bottom+p[1]*this.scale_[1]+this.dy_)/ratio+"px";
			this.cursor_.style.display = "block";
		}
		else {
			this.cursor_.style.display = "none";
		}
		this.bar_.parentElement.classList.add("over");
		this.element.querySelector(".point-info .z").textContent = p[1]+this.info.altitudeUnits;
		this.element.querySelector(".point-info .dist").textContent = (p[0]/1000).toFixed(1)+this.info.distanceUnitsKM;
		this.element.querySelector(".point-info .time").textContent = p[2];
		if (dx>this.canvas_.width/ratio/2) this.popup_.classList.add('ol-left');
		else this.popup_.classList.remove('ol-left');
		this.dispatchEvent({ type:'over', click:e.type=="click", coord: p[3], time: p[2], distance: p[0] });
	}
	else
	{	if (this.bar_.parentElement.classList.contains("over"))
		{	this.bar_.style.display = 'none';
			this.cursor_.style.display = 'none';
			this.bar_.parentElement.classList.remove("over");
			this.dispatchEvent({ type:'out' });
		}
	}
}
/** Show panel
* @api stable
*/
ol.control.Profil.prototype.show = function()
{	this.element.classList.remove("ol-collapsed");
	this.dispatchEvent({ type:'show', show: true });
}
/** Hide panel
* @api stable
*/
ol.control.Profil.prototype.hide = function()
{	this.element.classList.add("ol-collapsed");
	this.dispatchEvent({ type:'show', show: false });
}
/** Toggle panel
* @api stable
*/
ol.control.Profil.prototype.toggle = function()
{	this.element.classList.toggle("ol-collapsed");
	var b = this.element.classList.contains("ol-collapsed");
	this.dispatchEvent({ type:'show', show: !b });
}
/** Is panel visible
*/
ol.control.Profil.prototype.isShown = function()
{	return (!this.element.classList.contains("ol-collapsed"));
}
/**
 * Set the geometry to draw the profil.
 * @param {ol.Feature|ol.geom} f the feature.
 * @param {Object=} options
 *		- projection {ol.ProjectionLike} feature projection, default projection of the map
 *		- zunit {m|km} default m
 *		- unit {m|km} default km
 *		- zmin {Number|undefined} default 0
 *		- zmax {Number|undefined} default max Z of the feature
 *		- graduation {Number|undefined} z graduation default 100
 *		- amplitude {integer|undefined} amplitude of the altitude, default zmax-zmin
 * @api stable
 */
ol.control.Profil.prototype.setGeometry = function(g, options)
{	if (!options) options = {};
	if (g instanceof ol.Feature) g = g.getGeometry();
	var canvas = this.canvas_;
	var ctx = canvas.getContext('2d');
	var w = canvas.width;
	var h = canvas.height;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0,0, w, h);
	// No Z
	if (!/Z/.test(g.getLayout())) return;
	// No time
	if(/M/.test(g.getLayout())) this.element.querySelector(".time").parentElement.style.display = 'block';
	else this.element.querySelector(".time").parentElement.style.display = 'none';
	// Coords
	var c = g.getCoordinates();
	switch (g.getType())
	{	case "LineString": break;
		case "MultiLineString": c = c[0]; break;
		default: return;
	}
	// Distance beetween 2 coords
	var proj = options.projection || this.getMap().getView().getProjection();
	function dist2d(p1,p2)
	{	return ol.sphere.getDistance(
			ol.proj.transform(p1, proj, 'EPSG:4326'),
			ol.proj.transform(p2, proj, 'EPSG:4326'));
	}
	function getTime(t0, t1)
	{	if (!t0 || !t1) return "-"
		var dt = (t1-t0) / 60; // mn
		var ti = Math.trunc(dt/60);
		var mn = Math.trunc(dt-ti*60);
		return ti+"h"+(mn<10?"0":"")+mn+"mn";
	}
	// Margin
	ctx.setTransform(1, 0, 0, 1, this.margin_.left, h-this.margin_.bottom);
	var ratio = this.ratio;
	w -= this.margin_.right + this.margin_.left;
	h -= this.margin_.top + this.margin_.bottom;
	// Draw axes
	ctx.strokeStyle = "#000";
	ctx.lineWidth = 0.5*ratio;
	ctx.beginPath();
	ctx.moveTo(0,0); ctx.lineTo(0,-h);
	ctx.moveTo(0,0); ctx.lineTo(w, 0);
	ctx.stroke();
	//
	var zmin=Infinity, zmax=-Infinity;
	var i, p, d, z, ti, t = this.tab_ = [];
	for (i=0, p; p=c[i]; i++)
	{	z = p[2];
		if (z<zmin) zmin=z;
		if (z>zmax) zmax=z;
		if (i==0) d = 0;
		else d += dist2d(c[i-1], p);
		ti = getTime(c[0][3],p[3]);
		t.push ([d, z, ti, p]);
	}
	// Info
	this.element.querySelector(".track-info .zmin").textContent = zmin.toFixed(2)+this.info.altitudeUnits;
	this.element.querySelector(".track-info .zmax").textContent = zmax.toFixed(2)+this.info.altitudeUnits;
	if (d>1000)
	{	this.element.querySelector(".track-info .dist").textContent = (d/1000).toFixed(1)+this.info.distanceUnitsKM;
	}
	else
	{	this.element.querySelector(".track-info .dist").textContent= (d).toFixed(1)+this.info.distanceUnitsM;
	}
	this.element.querySelector(".track-info .time").textContent = ti;
	// Set graduation
	var grad = options.graduation || 100;
	while (true)
	{	zmax = Math.ceil(zmax/grad)*grad;
		zmin = Math.floor(zmin/grad)*grad;
		var nbgrad = (zmax-zmin)/grad;
		if (h/nbgrad < 15*ratio)
		{	grad *= 2;
		}
		else break;
	}
	// Set amplitude
	if (typeof(options.zmin)=='number' && zmin > options.zmin) zmin = options.zmin;
	if (typeof(options.zmax)=='number' && zmax < options.zmax) zmax = options.zmax;
	var amplitude = options.amplitude;
	if (amplitude)
	{	zmax = Math.max (zmin + amplitude, zmax);
	}
	// Scales lines
	var scx = w/d;
	var scy = -h/(zmax-zmin);
	var dy = this.dy_ = -zmin*scy;
	this.scale_ = [scx,scy];
	// Draw
	ctx.font = (10*ratio)+"px arial";
	ctx.textAlign = "right";
	ctx.textBaseline = "middle";
	ctx.fillStyle="#000";
	// Scale Z
	ctx.beginPath();
	for (i=zmin; i<=zmax; i+=grad)
	{	if (options.zunit!="km") ctx.fillText(i, -4*ratio, i*scy+dy);
		else ctx.fillText((i/1000).toFixed(1), -4*ratio, i*scy+dy);
		ctx.moveTo (-2*ratio, i*scy+dy);
		if (i!=0) ctx.lineTo (d*scx, i*scy+dy);
		else ctx.lineTo (0, i*scy+dy);
	}
	// Scale X
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	ctx.setLineDash([ratio,3*ratio]);
	var unit = options.unit ||"km";
	var step;
	if (d>1000)
	{	step = Math.round(d/1000)*100;
		if (step > 1000) step = Math.ceil(step/1000)*1000;
	}
	else
	{	unit = "m";
		if (d>100) step = Math.round(d/100)*10;
		else if (d>10) step = Math.round(d/10);
		else if (d>1) step = Math.round(d)/10;
		else step = d;
	}
	for (i=0; i<=d; i+=step)
	{	var txt = (unit=="m") ? i : (i/1000);
		//if (i+step>d) txt += " "+ (options.zunits || "km");
		ctx.fillText(Math.round(txt*10)/10, i*scx, 4*ratio);
		ctx.moveTo (i*scx, 2*ratio); ctx.lineTo (i*scx, 0);
	}
	ctx.font = (12*ratio)+"px arial";
	ctx.fillText(this.info.xtitle.replace("(km)","("+unit+")"), w/2, 18*ratio);
	ctx.save();
	ctx.rotate(-Math.PI/2);
	ctx.fillText(this.info.ytitle, h/2, -this.margin_.left);
	ctx.restore();
	ctx.stroke();
	// 
	ctx.strokeStyle = "#369";
	ctx.lineWidth = 1;
	ctx.setLineDash([]);
	ctx.beginPath();
	for (i=0; p=t[i]; i++)
	{	if (i==0) ctx.moveTo(p[0]*scx,p[1]*scy+dy);
		else ctx.lineTo(p[0]*scx,p[1]*scy+dy);
	}
	ctx.stroke();
};
/** Get profil image
* @param {string|undefined} type image format or 'canvas' to get the canvas image, default image/png.
* @param {Number|undefined} encoderOptions between 0 and 1 indicating image quality image/jpeg or image/webp, default 0.92.
* @return {string} requested data uri
* @api stable
*/
ol.control.Profil.prototype.getImage = function(type, encoderOptions)
{	if (type==="canvas") return this.canvas_;
	return this.canvas_.toDataURL(type, encoderOptions);
}

/*	Copyright (c) 2018 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Geoportail routing Control.
 * @constructor
 * @extends {ol.control.Control}
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
ol.control.RoutingGeoportail = function(options) {
  var self = this;
  if (!options) options = {};
  if (options.typing == undefined) options.typing = 300;
  // Class name for history
  this._classname = options.className || 'search';
  var element = document.createElement("DIV");
  var classNames = (options.className||"")+ " ol-routing";
  if (!options.target) {
    classNames += " ol-unselectable ol-control";
  }
  element.setAttribute('class', classNames);
	if (!options.target) {
    var bt = ol.ext.element.create('BUTTON', { parent: element })
    bt.addEventListener('click', function(){
      element.classList.toggle('ol-collapsed');
    });
  }
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  this.set('url', 'https://wxs.ign.fr/'+options.apiKey+'/itineraire/rest/route.json');
  this._search = [];
  var content = ol.ext.element.create('DIV', { className: 'content', parent: element } )
  var listElt = ol.ext.element.create('DIV', { className: 'search-input', parent: content });
  this._search = [];
  this.addSearch(listElt, options);
  this.addSearch(listElt, options);
  ol.ext.element.create('I', { className: 'ol-car', title: options.carlabel||'by car', parent: content })
    .addEventListener("click", function() {
      self.setMode('car');
    });
  ol.ext.element.create('I', { className: 'ol-pedestrian', title: options.pedlabel||'pedestrian', parent: content })
    .addEventListener("click", function() {
      self.setMode('pedestrian');
    });
  ol.ext.element.create('I', { className: 'ol-ok', title: options.runlabel||'search', html:'OK', parent: content })
    .addEventListener("click", function() {
      self.calculate();
    });
  ol.ext.element.create('I', { className: 'ol-cancel', html:'cancel', parent: content })
    .addEventListener("click", function() {
      this.resultElement.innerHTML = '';
    }.bind(this));
  this.resultElement = document.createElement("DIV");
  this.resultElement.setAttribute('class', 'ol-result');
  element.appendChild(this.resultElement);
  this.setMode(options.mode || 'car');
};
ol.ext.inherits(ol.control.RoutingGeoportail, ol.control.Control);
ol.control.RoutingGeoportail.prototype.setMode = function (mode) {
  this.set('mode', mode);
  this.element.querySelector(".ol-car").classList.remove("selected");
  this.element.querySelector(".ol-pedestrian").classList.remove("selected");
  this.element.querySelector(".ol-"+mode).classList.add("selected");
  this.calculate();
};
ol.control.RoutingGeoportail.prototype.addButton = function (className, title, info) {
  var bt = document.createElement("I");
  bt.setAttribute("class", className);
  bt.setAttribute("type", "button");
  bt.setAttribute("title", title);
  bt.innerHTML = info||'';
  this.element.appendChild(bt);
  return bt;
};
/** Remove a new search input
 * @private
 */
ol.control.RoutingGeoportail.prototype.removeSearch = function (element, options, after) {
  element.removeChild(after);
  if (this.getMap()) this.getMap().removeControl(after.olsearch);
  this._search = [];
  element.querySelectorAll('div').forEach(function(d) {
    if (d.olsearch) this._search.push(d.olsearch);
  }.bind(this));
};
/** Add a new search input
 * @private
 */
ol.control.RoutingGeoportail.prototype.addSearch = function (element, options, after) {
  var self = this;
  var div = ol.ext.element.create('DIV');
  if (after) element.insertBefore(div, after.nextSibling);
  else element.appendChild(div);
  ol.ext.element.create ('BUTTON', { title: options.startlabel||"add/remove", parent: div})
    .addEventListener('click', function(e) {
      if (e.ctrlKey) {
        if (this._search.length>2) this.removeSearch(element, options, div);
      } else if (e.shiftKey) {
        this.addSearch(element, options, div);
      }
    }.bind(this));
  var search = div.olsearch = new ol.control.SearchGeoportail({
    className: 'IGNF ol-collapsed',
    apiKey: options.apiKey,
    target: div,
    reverse: true
  });
  this._search = [];
  element.querySelectorAll('div').forEach(function(d) {
    if (d.olsearch) this._search.push(d.olsearch);
  }.bind(this));
  search.on('select', function(e){
    search.setInput(e.search.fulltext);
    search.set('selection', e.search);
  });
  search.element.querySelector('input').addEventListener('change', function(){
    search.set('selection', null);
    self.resultElement.innerHTML = '';
  });
  if (this.getMap()) this.getMap().addControl(search);
};
/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol.control.RoutingGeoportail.prototype.setMap = function (map) {
  ol.control.Control.prototype.setMap.call(this, map);
  for (var i=0; i<this._search.length; i++) {
    var c = this._search[i];
    c.setMap(map);
  }
};
/** Get request data
 * @private
 */
ol.control.RoutingGeoportail.prototype.requestData = function (steps) {
  var start = steps[0];
  var end = steps[steps.length-1];
  var waypoints = '';
  for (var i=1; i<steps.length-1; i++) {
    waypoints += (waypoints ? ';':'') + steps[i].x+','+steps[i].y;
  }
  return {
    'gp-access-lib': '1.1.0',
    origin: start.x+','+start.y,
    destination: end.x+','+end.y,
    method: 'time', // 'distance'
    graphName: this.get('mode')==='pedestrian' ? 'Pieton' : 'Voiture',
    waypoints: waypoints,
    format: 'STANDARDEXT'
  };
};
/** Show routing as a list
 * @private
 */
ol.control.RoutingGeoportail.prototype.listRouting = function (routing) {
  var time = routing.duration/60;
  this.resultElement.innerHTML = '';
  var t = '';
  if (time<60) {
    t += time.toFixed(0)+' min';
  } else {
    t+= (time/60).toFixed(0)+' h '+(time%60).toFixed(0)+' min';
  }
  var dist = routing.distance;
  if (dist<1000) {
    t += ' ('+dist.toFixed(0)+' m)';
  } else {
    t += ' ('+(dist/1000).toFixed(2)+' km)';
  }
  var iElement = document.createElement('i');
  iElement.textContent = t;
  this.resultElement.appendChild(iElement)
  var ul = document.createElement('ul');
  this.resultElement.appendChild(ul);
  var info = {
    'none': 'Prendre sur ',
    'R': 'Tourner à droite sur ',
    'FR': 'Tourner légèrement à droite sur ',
    'L': 'Tourner à gauche sur ',
    'FL': 'Tourner légèrement à gauche sur ',
    'F': 'Continuer tout droit sur ',
  }
  for (var i=0, f; f=routing.features[i]; i++) {
    var d = f.get('distance');
    d = (d<1000) ? d.toFixed(0)+' m' : (d/1000).toFixed(2)+' km';
    t = f.get('durationT')/60;
    console.log(f.get('duration'),t)
    t = (f.get('duration')<40) ? '' : (t<60) ? t.toFixed(0)+' min' : (t/60).toFixed(0)+' h '+(t%60).toFixed(0)+' min';
    var li = document.createElement('li');
        li.classList.add(f.get('instruction'));
        li.innerHTML = (info[f.get('instruction')||'none']||'#')
      + ' ' + f.get('name')
      + '<i>' + d + (t ? ' - ' + t : '') +'</i>'
    ul.appendChild(li);
  }
};
/** Handle routing response
 * @private
 */
ol.control.RoutingGeoportail.prototype.handleResponse = function (data, start, end) {
  var routing = { type:'routing' };
/*
  var format = new ol.format.WKT();
  routing.features = [ format.readFeature(data.geometryWkt, {
    dataProjection: 'EPSG:4326',
    featureProjection: this.getMap().getView().getProjection()
  }) ];
*/
  routing.features = [];
  var distance = 0;
  var duration = 0;
  var f, route = [];
  for (var i=0, l; l=data.legs[i]; i++) {
    for (var j=0, s; s=l.steps[j]; j++) {
      var geom = [];
      for (var k=0, p; p=s.points[k]; k++){
        p = p.split(',');
        geom.push([parseFloat(p[0]),parseFloat(p[1])]);
        if (i===0 || k!==0) route.push(geom[k]);
      }
      geom = new ol.geom.LineString(geom);
      var options = {
        geometry: geom.transform('EPSG:4326',this.getMap().getView().getProjection()),
        name: s.name,
        instruction: s.navInstruction,
        distance: parseFloat(s.distanceMeters),
        duration: parseFloat(s.durationSeconds)
      }
      //console.log(duration, options.duration, s)
      distance += options.distance;
      duration += options.duration;
      options.distanceT = distance;
      options.durationT = duration;
      f = new ol.Feature(options);
      routing.features.push(f);
    }
  }
  routing.distance = parseFloat(data.distanceMeters);
  routing.duration = parseFloat(data.durationSeconds);
  // Full route
  route = new ol.geom.LineString(route);
  routing.feature = new ol.Feature ({
    geometry: route.transform('EPSG:4326',this.getMap().getView().getProjection()),
    start: this._search[0].getTitle(start),
    end: this._search[0].getTitle(end), 
    distance: routing.distance,
    duration: routing.duration
  });
  // console.log(data, routing);
  this.dispatchEvent(routing);
  this.path = routing;
  return routing;
};
/** Calculate route
 * 
 */
ol.control.RoutingGeoportail.prototype.calculate = function () {
  console.log('calculate')
  this.resultElement.innerHTML = '';
  var steps = []
  for (var i=0; i<this._search.length; i++) {
    if (this._search[i].get('selection')) steps.push(this._search[i].get('selection'));
  }
  if (steps.length<2) return;
  var start = steps[0];
  var end = steps[steps.length-1];
  var data = this.requestData(steps);
  var url = encodeURI(this.get('url'));
  var parameters = '';
  for (var index in data) {
    parameters += (parameters) ? '&' : '?';
    if (data.hasOwnProperty(index)) parameters += index + '=' + data[index];
  }
  var self = this;
  this.ajax(url + parameters, 
    function (resp) {
      if (resp.status >= 200 && resp.status < 400) {
        self.listRouting(self.handleResponse (JSON.parse(resp.response), start, end));
      } else {
        console.log(url + parameters, arguments);
      }
    }, function(){
      console.log(url + parameters, arguments);
    });
};	
/** Send an ajax request (GET)
 * @param {string} url
 * @param {function} onsuccess callback
 * @param {function} onerror callback
 */
ol.control.RoutingGeoportail.prototype.ajax = function (url, onsuccess, onerror){
  var self = this;
  // Abort previous request
  if (this._request) {
    this._request.abort();
  }
  // New request
  var ajax = this._request = new XMLHttpRequest();
  ajax.open('GET', url, true);
  if (this._auth) {
    ajax.setRequestHeader("Authorization", "Basic " + this._auth);
  }
  this.element.classList.add('ol-searching');
  // Load complete
  ajax.onload = function() {
    self._request = null;
    self.element.classList.remove('ol-searching');
    onsuccess.call(self, this);
  };
  // Oops, TODO do something ?
  ajax.onerror = function() {
    self._request = null;
    self.element.classList.remove('ol-searching');
    if (onerror) onerror.call(self);
  };
  // GO!
  ajax.send();
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Scale Control.
 * A control to display the scale of the center on the map
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires select
 * @fires change:input
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {string} options.ppi screen ppi, default 96
 * 	@param {string} options.editable make the control editable, default true
 */
ol.control.Scale = function(options) {
  if (!options) options = {};
  if (options.typing == undefined) options.typing = 300;
  var element = document.createElement("DIV");
  var classNames = (options.className||"")+ " ol-scale";
  if (!options.target) {
  classNames += " ol-unselectable ol-control";
  }
  this._input = document.createElement("INPUT");
  this._input.value = '-';
  element.setAttribute('class', classNames);
  if (options.editable===false) this._input.readOnly = true;
  element.appendChild(this._input);
  ol.control.Control.call(this, {
  element: element,
  target: options.target
  });
  this._input.addEventListener("change", this.setScale.bind(this));
  this.set('ppi', options.ppi || 96)
};
ol.ext.inherits(ol.control.Scale, ol.control.Control);
/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.control.Scale.prototype.setMap = function (map) {
  if (this._listener) ol.Observable.unByKey(this._listener);
  this._listener = null;
  ol.control.Control.prototype.setMap.call(this, map);
  // Get change (new layer added or removed)
  if (map) {
    this._listener = map.on('moveend', this._showScale.bind(this));
  }
};
/** Display the scale
 */
ol.control.Scale.prototype._showScale = function () {
  var map = this.getMap();
  if (map) {
    var view = map.getView();
    var proj = view.getProjection();
    var center = view.getCenter();
    var px = map.getPixelFromCoordinate(center);
    px[1] += 1;
    var coord = map.getCoordinateFromPixel(px);
    var d = ol.sphere.getDistance(
      ol.proj.transform(center, proj, 'EPSG:4326'),
      ol.proj.transform(coord, proj, 'EPSG:4326'));
    d *= this.get('ppi')/.0254
    this._input.value = this.formatScale(d);
  }
};
/** Format the scale 1/d
 * @param {Number} d
 * @return {string} formated string
 */
ol.control.Scale.prototype.formatScale = function (d) {
  if (d>100) d = Math.round(d/100) * 100;
  else d = Math.round(d);
  return '1 / '+ d.toLocaleString();
};
/** Set the current scale (will change the scale of the map)
 * @param {Number} value the scale factor
 */
ol.control.Scale.prototype.setScale = function (value) {
  var map = this.getMap();
  if (map && value) {
    if (value.target) value = value.target.value;
    var fac = value;
    if (typeof(value)==='string') {
      fac = value.split('/')[1];
      if (!fac) fac = value;
      fac = fac.replace(/[^\d]/g,'');
      fac = parseInt(fac);
    }
    // Calculate new resolution
    var view = map.getView();
    var proj = view.getProjection();
    var center = view.getCenter();
    var px = map.getPixelFromCoordinate(center);
    px[1] += 1;
    var coord = map.getCoordinateFromPixel(px);
    var d = ol.sphere.getDistance(
      ol.proj.transform(center, proj, 'EPSG:4326'),
      ol.proj.transform(coord, proj, 'EPSG:4326'));
    d *= this.get('ppi')/.0254
    view.setResolution(view.getResolution()*fac/d);
  }
  this._showScale();
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search places using the French National Base Address (BAN) API.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *  @param {string|undefined} options.url Url to BAN api, default "https://api-adresse.data.gouv.fr/search/"
 *  @param {boolean} options.position Search, with priority to geo position, default false
 *  @param {function} options.getTitle a function that takes a feature and return the text to display in the menu, default return label attribute
 * @see {@link https://adresse.data.gouv.fr/api/}
 */
ol.control.SearchBAN = function(options) {
  options = options || {};
  options.typing = options.typing || 500;
  options.url = options.url || 'https://api-adresse.data.gouv.fr/search/';
  options.className = options.className || 'BAN';
  options.copy = '<a href="https://adresse.data.gouv.fr/" target="new">&copy; BAN-data.gouv.fr</a>';
  ol.control.SearchPhoton.call(this, options);
};
ol.ext.inherits(ol.control.SearchBAN, ol.control.SearchPhoton);
/** Returns the text to be displayed in the menu
 * @param {ol.Feature} f the feature
 * @return {string} the text to be displayed in the index
 * @api
 */
ol.control.SearchBAN.prototype.getTitle = function (f) {
  var p = f.properties;
  return (p.label);
};
/** A ligne has been clicked in the menu > dispatch event
 * @param {any} f the feature, as passed in the autocomplete
 * @api
 */
ol.control.SearchBAN.prototype.select = function (f){
  var c = f.geometry.coordinates;
  // Add coordinate to the event
  try {
    c = ol.proj.transform (f.geometry.coordinates, 'EPSG:4326', this.getMap().getView().getProjection());
  } catch(e) { /* ok */ }
  this.dispatchEvent({ type:"select", search:f, coordinate: c });
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search on DFCI grid.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {Object=} Control options. 
 *	@param {string} options.className control class name
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {string | undefined} options.property a property to display in the index, default 'name'.
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return the property 
 *	@param {function | undefined} options.getSearchString a function that take a feature and return a text to be used as search string, default geTitle() is used as search string
 */
ol.control.SearchDFCI = function(options) {
  if (!options) options = {};
  options.className = options.className || 'dfci';
  options.placeholder = options.placeholder || 'Code DFCI';
  ol.control.Search.call(this, options);
};
ol.ext.inherits(ol.control.SearchDFCI, ol.control.Search);
/** Autocomplete function
* @param {string} s search string
* @return {Array<any>|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
* @api
*/
ol.control.SearchDFCI.prototype.autocomplete = function (s) {
  s = s.toUpperCase();
  s = s.replace(/[^0-9,^A-H,^K-N]/g,'');
  if (s.length<2) {
    this.setInput(s);
    return [];
  }
  var i;
  var proj = this.getMap().getView().getProjection();
  var result = [];
  var c = ol.coordinate.fromDFCI(s, proj);
  var level = Math.floor(s.length/2)-1;
  var dfci = ol.coordinate.toDFCI(c, level, proj);
  dfci = dfci.replace(/[^0-9,^A-H,^K-N]/g,'');
  // Valid DFCI ?
  if (!/NaN/.test(dfci) && dfci) {
    console.log('ok', dfci)
    this.setInput(dfci + s.substring(dfci.length, s.length));
    result.push({ coordinate: ol.coordinate.fromDFCI(dfci, proj), name: dfci });
    if (s.length===5) {
      c = ol.coordinate.fromDFCI(s+0, proj);
      dfci = (ol.coordinate.toDFCI(c, level+1, proj)).substring(0,5);
      for (i=0; i<10; i++) {
        result.push({ coordinate: ol.coordinate.fromDFCI(dfci+i, proj), name: dfci+i });
      }
    }
    if (level === 2) {
      for (i=0; i<6; i++) {
        result.push({ coordinate: ol.coordinate.fromDFCI(dfci+'.'+i, proj), name: dfci+'.'+i });
      }
    }
  }
  return result;
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search features.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {Object=} Control options. 
 *	@param {string} options.className control class name
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {string | undefined} options.property a property to display in the index, default 'name'.
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return the property 
 *	@param {function | undefined} options.getSearchString a function that take a feature and return a text to be used as search string, default geTitle() is used as search string
 */
ol.control.SearchFeature = function(options) {
  if (!options) options = {};
  options.className = options.className || 'feature';
  ol.control.Search.call(this, options);
  if (typeof(options.getSearchString)=="function") this.getSearchString = options.getSearchString;
  this.set('property', options.property || 'name');
  this.source_ = options.source;
};
ol.ext.inherits(ol.control.SearchFeature, ol.control.Search);
/** No history avaliable on features
 */
ol.control.SearchFeature.prototype.restoreHistory = function () {
  this.set('history', []);
};
/** No history avaliable on features
 */
ol.control.SearchFeature.prototype.saveHistory = function () {
  localStorage.removeItem("ol@search-"+this._classname);
}
/** Returns the text to be displayed in the menu
*	@param {ol.Feature} f the feature
*	@return {string} the text to be displayed in the index
*	@api
*/
ol.control.SearchFeature.prototype.getTitle = function (f) {
  return f.get(this.get('property')||'name');
};
/** Return the string to search in
*	@param {ol.Feature} f the feature
*	@return {string} the text to be used as search string
*	@api
*/
ol.control.SearchFeature.prototype.getSearchString = function (f) {
  return this.getTitle(f);
};
/** Get the source
*	@return {ol.source.Vector}
*	@api
*/
ol.control.SearchFeature.prototype.getSource = function () {
  return this.source_;
}
/** Get the source
*	@param {ol.source.Vector} source
*	@api
*/
ol.control.SearchFeature.prototype.setSource = function (source) {
  this.source_ =  source;
};
/** Autocomplete function
* @param {string} s search string
* @param {int} max max 
* @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
* @return {Array<any>|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
* @api
*/
ol.control.SearchFeature.prototype.autocomplete = function (s) {
  var result = [];
  if (this.source_) {
    // regexp
    s = s.replace(/^\*/,'');
    var rex = new RegExp(s, 'i');
    // The source
    var features = this.source_.getFeatures();
    var max = this.get('maxItems')
    for (var i=0, f; f=features[i]; i++) {
      var att = this.getSearchString(f);
      if (att !== undefined && rex.test(att)) {
        result.push(f);
        if ((--max)<=0) break;
      }
    }
  }
  return result;
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search on GPS coordinate.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {Object=} Control options. 
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 1
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 */
ol.control.SearchGPS = function(options) {
  if (!options) options = {};
  options.className = (options.className || '') + ' ol-searchgps';
  options.placeholder = options.placeholder || 'lon,lat';
  ol.control.Search.call(this, options);
  // Geolocation
  this.geolocation = new ol.Geolocation({
    projection: "EPSG:4326",
    trackingOptions: {
      maximumAge: 10000,
      enableHighAccuracy: true,
      timeout: 600000
    }
  });
  ol.ext.element.create ('BUTTON', {
    className: 'ol-geoloc',
    title: 'Locate with GPS',
    parent: this.element,
    click: function(){
      this.geolocation.setTracking(true);
    }.bind(this)
  })
  // DMS switcher
  var dms = ol.ext.element.create('LABEL', {
    className: 'ol-switch',
    parent: this.element
  });
  ol.ext.element.create('TEXT', {
    html: 'decimal',
    parent: dms
  });
  ol.ext.element.create('INPUT', {
    type: 'checkbox',
    parent: dms,
    on: {
      'change': function(e) {
        if (e.target.checked) this.element.classList.add('ol-dms');
        else this.element.classList.remove('ol-dms');
      }.bind(this)
    }
  });
  ol.ext.element.create ('SPAN', {
    parent: dms
  });
  ol.ext.element.create('TEXT', {
    html: 'DMS',
    parent: dms
  });
  this._createForm();
  // Move list to the end
  var ul = this.element.querySelector("ul.autocomplete");
  this.element.appendChild(ul);
};
ol.ext.inherits(ol.control.SearchGPS, ol.control.Search);
/** Create input form
 * @private
 */
ol.control.SearchGPS.prototype._createForm = function () {
  // Value has change
  var onchange = function(e) {
    if (e.target.classList.contains('ol-dms')) {
      lon.value = (lond.value<0 ? -1:1) * Number(lond.value) + Number(lonm.value)/60 + Number(lons.value)/3600;
      lon.value = (lond.value<0 ? -1:1) * Math.round(lon.value*10000000)/10000000;
      lat.value = (latd.value<0 ? -1:1) * Number(latd.value) + Number(latm.value)/60 + Number(lats.value)/3600;
      lat.value = (latd.value<0 ? -1:1) * Math.round(lat.value*10000000)/10000000;
    }
    if (lon.value||lat.value) {
      this._input.value = lon.value+','+lat.value;
    } else {
      this._input.value = '';
    }
    if (!e.target.classList.contains('ol-dms')) {
      var s = ol.coordinate.toStringHDMS([Number(lon.value), Number(lat.value)]);
      var c = s.replace(/(N|S|E|W)/g,'').split('″');
      c[1] = c[1].trim().split(' ');
      lond.value = (/W/.test(s) ? -1 : 1) * parseInt(c[1][0]);
      lonm.value = parseInt(c[1][1]);
      lons.value = parseInt(c[1][2]);
      c[0] = c[0].trim().split(' ');
      latd.value = (/W/.test(s) ? -1 : 1) * parseInt(c[0][0]);
      latm.value = parseInt(c[0][1]);
      lats.value = parseInt(c[0][2]);
    }
    this.search();
  }.bind(this);
  function createInput(className, unit) {
    var input = ol.ext.element.create('INPUT', {
      className: className,
      type:'number',
      step:'any',
      lang: 'en',
      parent: div,
      on: {
        'change keyup': onchange
      }
    });
    if (unit) {
      ol.ext.element.create('SPAN', {
        className: 'ol-dms',
        html: unit,
        parent: div,
      });
    }
    return input;
  }
  // Longitude
  var div = ol.ext.element.create('DIV', {
    className: 'ol-longitude',
    parent: this.element
  });
  ol.ext.element.create('LABEL', {
    html: 'Longitude',
    parent: div
  });
  var lon = createInput('ol-decimal');
  var lond = createInput('ol-dms','°');
  var lonm = createInput('ol-dms','\'');
  var lons = createInput('ol-dms','"');
  // Latitude
  div = ol.ext.element.create('DIV', {
    className: 'ol-latitude',
    parent: this.element
  })
  ol.ext.element.create('LABEL', {
    html: 'Latitude',
    parent: div
  });
  var lat = createInput('ol-decimal');
  var latd = createInput('ol-dms','°');
  var latm = createInput('ol-dms','\'');
  var lats = createInput('ol-dms','"');
  // Focus
  this.button.addEventListener("click", function() {
    lon.focus();
  });
  // Change value on click
  this.on('select', function(e){
    lon.value = e.search.gps[0];
    lat.value = e.search.gps[1];
  }.bind(this));
  // Change value on geolocation
  this.geolocation.on('change', function(){
    this.geolocation.setTracking(false);
    var coord = this.geolocation.getPosition();
    lon.value = coord[0];
    lat.value = coord[1];
    this._triggerCustomEvent('keyup', lon);
  }.bind(this));
};
/** Autocomplete function
* @param {string} s search string
* @return {Array<any>|false} an array of search solutions
* @api
*/
ol.control.SearchGPS.prototype.autocomplete = function (s) {
  var result = [];
  var c = s.split(',');
  c[0] = Number(c[0]);
  c[1] = Number(c[1]);
  // Name
  s = ol.coordinate.toStringHDMS(c)
  if (s) s= s.replace(/(°|′|″) /g,'$1');
  // 
  var coord = ol.proj.transform ([c[0], c[1]], 'EPSG:4326', this.getMap().getView().getProjection());
  result.push({ gps: c, coordinate: coord, name: s });
  return result;
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search places using the French National Base Address (BAN) API.
 *
 * @constructor
 * @extends {ol.control.SearchJSON}
 * @fires select
 * @param {any} options extend ol.control.SearchJSON options
 *	@param {string} options.className control class name
 *	@param {boolean | undefined} options.apiKey the service api key.
 *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {Number} options.pageSize item per page for parcelle list paging, use -1 for no paging, default 5
 * @see {@link https://geoservices.ign.fr/documentation/geoservices/geocodage.html}
 */
ol.control.SearchGeoportailParcelle = function(options) {
  var self = this;
  options.type = "Commune";
  options.className = (options.className ? options.className:"")+" IGNF-parcelle ol-collapsed-list ol-collapsed-num";
  options.inputLabel = "Commune";
  options.noCollapse = true;
  options.placeholder = options.placeholder || "Choisissez une commune...";
  ol.control.SearchGeoportail.call(this, options);
  this.set('copy', null);
  var element = this.element;
  // Add parcel form
  var div = document.createElement("DIV");
  element.appendChild(div);
  var label = document.createElement("LABEL");
  label.innerText = 'Préfixe'
  div.appendChild(label);
  label = document.createElement("LABEL");
  label.innerText = 'Section'
  div.appendChild(label);
  label = document.createElement("LABEL");
  label.innerText = 'Numéro'
  div.appendChild(label);
  div.appendChild(document.createElement("BR"));
  // Input
  this._inputParcelle = {
    prefix: document.createElement("INPUT"),
    section: document.createElement("INPUT"),
    numero: document.createElement("INPUT")
  };
  this._inputParcelle.prefix.setAttribute('maxlength',3);
  this._inputParcelle.section.setAttribute('maxlength',2);
  this._inputParcelle.numero.setAttribute('maxlength',4);
  // Delay search
  var tout;
  var doSearch = function() {
    if (tout) clearTimeout(tout);
    tout = setTimeout(function() {
        self.autocompleteParcelle();
    }, options.typing || 0);
  }
  // Add inputs
  for (var i in this._inputParcelle) {
    div.appendChild(this._inputParcelle[i]);
    this._inputParcelle[i].addEventListener("keyup", doSearch);
    this._inputParcelle[i].addEventListener('blur', function() {
      tout = setTimeout(function(){ element.classList.add('ol-collapsed-num'); }, 200);
    });
    this._inputParcelle[i].addEventListener('focus', function() {
      clearTimeout(tout);
      element.classList.remove('ol-collapsed-num');
    });
  }
  this.activateParcelle(false);
  // Autocomplete list
  var auto = document.createElement('DIV');
  auto.className = 'autocomplete-parcelle';
  element.appendChild(auto);
  var ul = document.createElement('UL');
  ul.classList.add('autocomplete-parcelle');
  auto.appendChild(ul);
  ul = document.createElement('UL');
  ul.classList.add('autocomplete-page');
  auto.appendChild(ul);
  // Show/hide list on fcus/blur	
  this._input.addEventListener('blur', function() {
    setTimeout(function(){ element.classList.add('ol-collapsed-list') }, 200);
  });
  this._input.addEventListener('focus', function() {
    element.classList.remove('ol-collapsed-list');
    self._listParcelle([]);
    if (self._commune) {
      self._commune = null;
      self._input.value = '';
      self.drawList_();
    }
    self.activateParcelle(false);
  });
  this.on('select', this.selectCommune.bind(this));
  this.set('pageSize', options.pageSize || 5);
};
ol.ext.inherits(ol.control.SearchGeoportailParcelle, ol.control.SearchGeoportail);
/** Select a commune => start searching parcelle  
 * @param {any} e 
 * @private
 */
ol.control.SearchGeoportailParcelle.prototype.selectCommune = function(e) {
  this._commune = e.search.insee;
  this._input.value = e.search.insee + ' - ' + e.search.fulltext;
  this.activateParcelle(true);
  this._inputParcelle.numero.focus();
  this.autocompleteParcelle();
};
/** Set the input parcelle
 * @param {*} p parcel
 * 	@param {string} p.Commune
 * 	@param {string} p.CommuneAbsorbee
 * 	@param {string} p.Section
 * 	@param {string} p.Numero
 * @param {boolean} search start a search
 */
ol.control.SearchGeoportailParcelle.prototype.setParcelle = function(p, search) {
  this._inputParcelle.prefix.value = (p.Commune||'') + (p.CommuneAbsorbee||'');
  this._inputParcelle.section.value = p.Section||'';
  this._inputParcelle.numero.value = p.Numero||'';
  if (search) this._triggerCustomEvent("keyup", this._inputParcelle.prefix);
};
/** Activate parcelle inputs
 * @param {bolean} b
 */
ol.control.SearchGeoportailParcelle.prototype.activateParcelle = function(b) {
  for (var i in this._inputParcelle) {
    this._inputParcelle[i].readOnly = !b;
  }
  if (b) {
    this._inputParcelle.section.parentElement.classList.add('ol-active');
  } else {
    this._inputParcelle.section.parentElement.classList.remove('ol-active');		
  }
};
/** Send search request for the parcelle  
 * @private
 */
ol.control.SearchGeoportailParcelle.prototype.autocompleteParcelle = function() {
  // Add 0 to fit the format
  function complete (s, n, c) {
    if (!s) return s;
    c = c || "0";
    while (s.length < n) s = c+s;
    return s.replace(/\*/g,'_');
  }
  // The selected commune
  var commune = this._commune;
  var prefix = complete (this._inputParcelle.prefix.value, 3);
  if (prefix === '000') {
    prefix = '___';
  }
  // Get parcelle number
  var section = complete (this._inputParcelle.section.value, 2);
  var numero = complete (this._inputParcelle.numero.value, 4, "0");
  var search = commune + (prefix||'___') + (section||"__") + (numero ?  numero : section ? "____":"0001");
  this.searchParcelle(search, 
    function(jsonResp) {
      this._listParcelle(jsonResp);
    }.bind(this),
    function() {
      console.log('oops')
    })
};
/** Send search request for a parcelle number
 * @param {string} search search parcelle number
 * @param {function} success callback function called on success
 * @param {function} error callback function called on error
 */
ol.control.SearchGeoportailParcelle.prototype.searchParcelle = function(search, success /*, error */) {
  // Request
  var request = '<?xml version="1.0" encoding="UTF-8"?>'
  +'<XLS xmlns:xls="http://www.opengis.net/xls" xmlns:gml="http://www.opengis.net/gml" xmlns="http://www.opengis.net/xls" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.2" xsi:schemaLocation="http://www.opengis.net/xls http://schemas.opengis.net/ols/1.2/olsAll.xsd">'
    +'<RequestHeader/>'
    +'<Request requestID="1" version="1.2" methodName="LocationUtilityService">'
      +'<GeocodeRequest returnFreeForm="false">'
        +'<Address countryCode="CadastralParcel">'
        +'<freeFormAddress>'+search+'+</freeFormAddress>'
        +'</Address>'
      +'</GeocodeRequest>'
    +'</Request>'
  +'</XLS>'
  // Geocode
  this.ajax(
    this.get('url').replace('ols/apis/completion','geoportail/ols'), 
    { xls: request },
    function(xml) {
      // XML to JSON
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(xml,"text/xml");
      var parcelles = xmlDoc.getElementsByTagName('GeocodedAddress');
      var jsonResp = []
      for (var i=0, parc; parc= parcelles[i]; i++) {
        var node = parc.getElementsByTagName('gml:pos')[0] || parc.getElementsByTagName('pos')[0];
        var p = node.childNodes[0].nodeValue.split(' ');
        var att = parc.getElementsByTagName('Place');
        var json = { 
          lon: Number(p[1]), 
          lat: Number(p[0])
        };
        for (var k=0, a; a=att[k]; k++) {
          json[a.attributes.type.value] = a.childNodes[0].nodeValue;
        }
        jsonResp.push(json);
      }
      success(jsonResp);
    }, 
    { dataType: 'XML' }
  );
};
/**
 * Draw the autocomplete list
 * @param {*} resp 
 * @private
 */
ol.control.SearchGeoportailParcelle.prototype._listParcelle = function(resp) {
  var self = this;
  var ul = this.element.querySelector("ul.autocomplete-parcelle");
  ul.innerHTML='';
  var page = this.element.querySelector("ul.autocomplete-page");
  page.innerHTML='';
  this._listParc = [];
  // Show page i
  function showPage(i) {
    var l = ul.children;
    var visible = "ol-list-"+i;
    var k;
    for (k=0; k<l.length; k++) {
      l[k].style.display = (l[k].className===visible) ? '' : 'none';
    }
    l = page.children;
    for (k=0; k<l.length; k++) {
      l[k].className = (l[k].innerText==i) ? 'selected' : '';
    }
    page.style.display = l.length>1 ? '' : 'none';
  }
  // Sort table
  resp.sort(function(a,b) {
    var na = a.INSEE+a.CommuneAbsorbee+a.Section+a.Numero;
    var nb = b.INSEE+b.CommuneAbsorbee+b.Section+b.Numero;
    return na===nb ? 0 : na<nb ? -1 : 1;
  });
  // Show list
  var n = this.get('pageSize');
  for (var i=0, r; r = resp[i]; i++) {
    var li = document.createElement("LI");
    li.setAttribute("data-search", i);
    if (n>0) li.classList.add("ol-list-"+Math.floor(i/n));
    this._listParc.push(r);
    li.addEventListener("click", function(e) {
      self._handleParcelle(self._listParc[e.currentTarget.getAttribute("data-search")]);
    });
    li.innerHTML = r.INSEE+r.CommuneAbsorbee+r.Section+r.Numero;
    ul.appendChild(li);
    //
    if (n>0 && !(i%n)) {
      li = document.createElement("LI");
      li.innerText = Math.floor(i/n);
      li.addEventListener("click", function(e) {
        showPage(e.currentTarget.innerText);
      });
      page.appendChild(li);
    }
  }
  if (n>0) showPage(0);
};
/**
 * Handle parcelle section
 * @param {*} parc 
 * @private
 */
ol.control.SearchGeoportailParcelle.prototype._handleParcelle = function(parc) {
  this.dispatchEvent({ 
    type:"parcelle", 
    search: parc, 
    coordinate: ol.proj.fromLonLat([parc.lon, parc.lat], this.getMap().getView().getProjection())
  });
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search places using the Nominatim geocoder from the OpenStreetmap project.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {boolean | undefined} options.polygon To get output geometry of results (in geojson format), default false.
 *  @param {Array<Number> | undefined} options.viewbox The preferred area to find search results. Any two corner points of the box are accepted in any order as long as they span a real box, default none.
 *  @param {boolean | undefined} options.bounded Restrict the results to only items contained with the bounding box. Restricting the results to the bounding box also enables searching by amenity only. default false
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *  @param {string|undefined} options.url URL to Nominatim API, default "https://nominatim.openstreetmap.org/search"
 * @see {@link https://wiki.openstreetmap.org/wiki/Nominatim}
 */
ol.control.SearchNominatim = function(options) {
  options = options || {};
  options.className = options.className || 'nominatim';
  options.typing = options.typing || 500;
  options.url = options.url || 'https://nominatim.openstreetmap.org/search';
  options.copy = '<a href="http://www.openstreetmap.org/copyright" target="new">&copy; OpenStreetMap contributors</a>';
  ol.control.SearchJSON.call(this, options);
  this.set('polygon', options.polygon);
  this.set('viewbox', options.viewbox);
  this.set('bounded', options.bounded);
};
ol.ext.inherits(ol.control.SearchNominatim, ol.control.SearchJSON);
/** Returns the text to be displayed in the menu
 *	@param {ol.Feature} f the feature
*	@return {string} the text to be displayed in the index
*	@api
*/
ol.control.SearchNominatim.prototype.getTitle = function (f) {
  var info = [];
  if (f.class) info.push(f.class);
  if (f.type) info.push(f.type);
  var title = f.display_name+(info.length ? "<i>"+info.join(' - ')+"</i>" : '');
  if (f.icon) title = "<img src='"+f.icon+"' />" + title;
  return (title);
};
/** 
 * @param {string} s the search string
 * @return {Object} request data (as key:value)
 * @api
 */
ol.control.SearchNominatim.prototype.requestData = function (s) {
  var data = { 
    format: "json", 
    addressdetails: 1, 
    q: s, 
    polygon_geojson: this.get('polygon') ? 1:0,
    bounded: this.get('bounded') ? 1:0,
    limit: this.get('maxItems')
  };
  if (this.get('viewbox')) data.viewbox = this.get('viewbox');
  return data;
};
/** A ligne has been clicked in the menu > dispatch event
 *	@param {any} f the feature, as passed in the autocomplete
*	@api
*/
ol.control.SearchNominatim.prototype.select = function (f){
  var c = [Number(f.lon), Number(f.lat)];
  // Add coordinate to the event
  try {
    c = ol.proj.transform (c, 'EPSG:4326', this.getMap().getView().getProjection());
  } catch(e) { /* ok */}
  this.dispatchEvent({ type:"select", search:f, coordinate: c });
};
/** Reverse geocode
 * @param {ol.coordinate} coord
 * @api
 */
ol.control.SearchNominatim.prototype.reverseGeocode = function (coord, cback) {
  var lonlat = ol.proj.transform (coord, this.getMap().getView().getProjection(), 'EPSG:4326');
  this.ajax(
    this.get('url').replace('search', 'reverse'),
    { lon: lonlat[0], lat: lonlat[1], format: 'json' },
    function(resp) {
      if (cback) {
        cback.call(this, [resp]);
      } else {
        this._handleSelect(resp, true);
        //this.setInput('', true);
      }
    }.bind(this)
  );
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search places using the MediaWiki API.
 * @see https://www.mediawiki.org/wiki/API:Main_page
 *
 * @constructor
 * @extends {ol.control.SearchJSON}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
 * 
 *  @param {string|undefined} options.lang API language, default none
 */
ol.control.SearchWikipedia = function(options){
  options = options || {};
  options.lang = options.lang||'en';
  options.className = options.className || 'ol-search-wikipedia';
  options.url = 'https://'+options.lang+'.wikipedia.org/w/api.php';
  options.placeholder = options.placeholder || 'search string, File:filename';
  options.copy = '<a href="https://'+options.lang+'.wikipedia.org/" target="new">Wikipedia&reg; - CC-By-SA</a>';
  ol.control.SearchJSON.call(this, options);
  this.set('lang', options.lang);
};
ol.ext.inherits(ol.control.SearchWikipedia, ol.control.SearchJSON);
/** Returns the text to be displayed in the menu
*	@param {ol.Feature} f the feature
*	@return {string} the text to be displayed in the index
*	@api
*/
ol.control.SearchWikipedia.prototype.getTitle = function (f){
  return ol.ext.element.create('DIV', {
    html: f.title,
    title: f.desc
  });
  //return f.desc;
};
/** Set the current language
 * @param {string} lang the current language as ISO string (en, fr, de, es, it, ja, ...)
 */
ol.control.SearchWikipedia.prototype.setLang = function (lang){
  this.set('lang', lang)
  this.set('url', 'https://'+lang+'.wikipedia.org/w/api.php');
};
/** 
 * @param {string} s the search string
 * @return {Object} request data (as key:value)
 * @api
 */
ol.control.SearchWikipedia.prototype.requestData = function (s) {
  var data = {
    action: 'opensearch',
    search: s,
    lang: this.get('lang'),
    format: 'json',
    origin: '*',
    limit: this.get('maxItems')
  }
  return data;
};
/**
 * Handle server response to pass the features array to the list
 * @param {any} response server response
 * @return {Array<any>} an array of feature
 */
ol.control.SearchWikipedia.prototype.handleResponse = function (response) {
  var features = [];
  for (var i=0; i<response[1].length; i++) {
    features.push({
      title: response[1][i],
      desc: response[2][i],
      uri: response[3][i]
    })
  }
  return features;
};
/** A ligne has been clicked in the menu query for more info and disatch event
*	@param {any} f the feature, as passed in the autocomplete
*	@api
*/
ol.control.SearchWikipedia.prototype.select = function (f){
  var title = decodeURIComponent(f.uri.split('/').pop()).replace(/'/,'%27');
  // Search for coords
  ol.ext.Ajax.get({
    url: f.uri.split('wiki/')[0]+'w/api.php',
    data: {
      action: 'query',
      prop: 'pageimages|coordinates|extracts',
      exintro: 1,
      explaintext: 1,
      piprop: 'original',
      origin: '*',
      format: 'json',
      redirects: 1,
      titles: title
    },
    options: {
      encode: false
    },
    success: function (e) {
      var page = e.query.pages[Object.keys(e.query.pages).pop()];
      console.log(page);
      var feature = {
        title: f.title,
        desc: page.extract || f.desc,
        url: f.uri,
        img: page.original ? page.original.source : undefined,
        pageid: page.pageid
      }
      var c;
      if (page.coordinates) {
        feature.lon = page.coordinates[0].lon;
        feature.lat = page.coordinates[0].lat;
        c = [feature.lon, feature.lat];
        c = ol.proj.transform (c, 'EPSG:4326', this.getMap().getView().getProjection());
      }
      this.dispatchEvent({ type:"select", search:feature, coordinate: c });
    }.bind(this)
  })
};
/** */

/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Select Control.
 * A control to select features by attributes
 *
 * @constructor
 * @extends {ol.control.SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol.source.Vector | Array<ol.source.Vector>} options.source the source to search in
 *  @param {string} [options.selectLabel=select] select button label
 *  @param {string} [options.addLabel=add] add button label
 *  @param {string} [options.caseLabel=case sensitive] case checkbox label
 *  @param {string} [options.allLabel=match all] match all checkbox label
 *  @param {string} [options.attrPlaceHolder=attribute]
 *  @param {string} [options.valuePlaceHolder=value]
 */
ol.control.Select = function(options) {
  var self = this;
  if (!options) options = {};
  // Container
  var div = options.content = document.createElement("div");
  // Autocompletion list
  this._ul = ol.ext.element.create('UL', {
    parent: div
  });
  // All conditions
  this._all = ol.ext.element.create('INPUT', {
    type: 'checkbox',
    checked: true
  });
  var label_match_all = ol.ext.element.create('LABEL',{
    html: this._all,
    parent: div
  });
  ol.ext.element.appendText(label_match_all, options.allLabel || 'match all');
  // Use case
  this._useCase = ol.ext.element.create('INPUT', {
    type: 'checkbox'
  });
  var label_case_sensitive = ol.ext.element.create('LABEL',{
    html: this._useCase,
    parent: div
  });
  ol.ext.element.appendText(label_case_sensitive, options.caseLabel || 'case sensitive');
  ol.control.SelectBase.call(this, options);
  // Add button
  ol.ext.element.create('BUTTON', {
    className: 'ol-append',
    html: options.addLabel	|| 'add rule',
    click: function(){
      self.addCondition();
    },
    parent: div
  });
  this._conditions = [];
  this.set('attrPlaceHolder', options.attrPlaceHolder || 'attribute');
  this.set('valuePlaceHolder', options.valuePlaceHolder || 'value');
  this.addCondition();
};
ol.ext.inherits(ol.control.Select, ol.control.SelectBase);
/** Add a new condition
 * @param {*} options
 * 	@param {string} options.attr attribute name
 * 	@param {string} options.op	operator
 * 	@param {string} options.val attribute value
 */
ol.control.Select.prototype.addCondition = function (options) {
  options = options || {};
  this._conditions.push({
    attr: options.attr || '',
    op: options.op || '=',
    val: options.val || ''
  });
  this._drawlist();
};
/** Get the condition list
 */
ol.control.Select.prototype.getConditions = function () {
  return {
    usecase: this._useCase.checked,
    all: this._all.checked,
    conditions: this._conditions
  }
};
/** Set the condition list
 */
ol.control.Select.prototype.setConditions = function (cond) {
  this._useCase.checked = cond.usecase;
  this._all.checked = cond.all;
  this._conditions = cond.conditions;
  this._drawlist();
};
/** Get the conditions as string
 */
ol.control.Select.prototype.getConditionsString = function (cond) {
  var st = '';
  for (var i=0,c; c=cond.conditions[i]; i++) {
    if (c.attr) {
      st += (st ? (cond.all ? ' AND ' : ' OR ') : '')
        + c.attr
        + this.operationsList[c.op]
        + c.val;
    }
  }
  return st
};
/** Draw the liste
 * @private
 */
ol.control.Select.prototype._drawlist = function () {
  this._ul.innerHTML = '';
  for (var i=0; i < this._conditions.length; i++) {
    this._ul.appendChild(this._getLiCondition(i));
  }
};
/** Get a line
 * @return {*}
 * @private
 */
ol.control.Select.prototype._autocomplete = function (val, ul) {
  ul.classList.remove('ol-hidden');
  ul.innerHTML = '';
  var attributes = {};
  var sources = this.get('source');
  for (var i=0, s; s=sources[i]; i++) {
    var features = s.getFeatures();
    for (var j=0, f; f=features[j]; j++) {
      Object.assign(attributes, f.getProperties());
      if (j>100) break;
    }
  }
  var rex = new RegExp(val, 'i');
  for (var a in attributes) {
    if (a==='geometry') continue;
    if (rex.test(a)) {
      var li = document.createElement('li');
    li.textContent = a;
    li.addEventListener("click", function() {
          ul.previousElementSibling.value = this.textContent;
      var event = document.createEvent('HTMLEvents');
      event.initEvent('change', true, false);
      ul.previousElementSibling.dispatchEvent(event);
          ul.classList.add('ol-hidden');
        });
        ul.appendChild(li);
    }
  }
};
/** Get a line
 * @return {*}
 * @private
 */
ol.control.Select.prototype._getLiCondition = function (i) {
  var self = this;
  var li = document.createElement('li');
  // Attribut
  var autocomplete = document.createElement('div');
      autocomplete.classList.add('ol-autocomplete');
      autocomplete.addEventListener("mouseleave", function() {
        this.querySelector('ul'). classList.add('ol-hidden');
      });
      li.appendChild(autocomplete);
  var input_attr = document.createElement('input');
      input_attr.classList.add('ol-attr');
      input_attr.setAttribute('type', 'text');
      input_attr.setAttribute('placeholder', this.get('attrPlaceHolder'));
      input_attr.addEventListener('keyup', function () {
        self._autocomplete( this.value, this.nextElementSibling );
      })
      input_attr.addEventListener('click', function(){
        self._autocomplete( this.value, this.nextElementSibling );
        this.nextElementSibling.classList.remove('ol-hidden')
      })
      input_attr.addEventListener('change', function() {
        self._conditions[i].attr = this.value;
      })
      input_attr.value = self._conditions[i].attr;
      autocomplete.appendChild(input_attr);
  // Autocomplete list
  var ul_autocomplete = document.createElement('ul');
      ul_autocomplete.classList.add('ol-hidden')
      autocomplete.appendChild(ul_autocomplete);
  // Operation
  var select = document.createElement('select');
  li.appendChild(select);
  for (var k in this.operationsList) {
    var option = document.createElement('option');
        option.value = k;
        option.textContent = this.operationsList[k];
        select.appendChild(option);
  }
  select.value = self._conditions[i].op;
  select.addEventListener('change', function() {
    self._conditions[i].op = this.value;
  });
  // Value
  var input_value = document.createElement('input');
  input_value.setAttribute('type', 'text');
      input_value.setAttribute('placeholder', this.get('valuePlaceHolder'));
    input_value.addEventListener('change', function() {
      self._conditions[i].val = this.value;
    })
    input_value.value = self._conditions[i].val;
    li.appendChild(input_value);
  if (this._conditions.length > 1) {
    var div_delete = document.createElement('div');
    div_delete.classList.add('ol-delete');
      div_delete.addEventListener("click", function(){ self.removeCondition(i); })
      li.appendChild(div_delete);
  }
  //
  return li;
};
/** Remove the ith condition
 * @param {int} i condition index
 */
ol.control.Select.prototype.removeCondition = function (i) {
  this._conditions.splice(i,1);
  this._drawlist();
};
/** Select features by attributes
 * @param {*} options
 *  @param {Array<ol.source.Vector>|undefined} options.sources source to apply rules, default the select sources
 *  @param {bool} options.useCase case sensitive, default checkbox state
 *  @param {bool} options.matchAll match all conditions, , default checkbox state
 *  @param {Array<conditions>} options.conditions array of conditions
 * @fires select
 */
ol.control.Select.prototype.doSelect = function (options) {
  options = options || {};
  options.useCase = options.useCase || this._useCase.checked;
  options.matchAll = options.matchAll || this._all.checked;
  options.conditions = options.conditions || this._conditions
  return ol.control.SelectBase.prototype.doSelect.call(this, options);
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Select features by property using a popup 
 *
 * @constructor
 * @extends {ol.control.SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {string} options.property property to select on
 *  @param {string} options.label control label
 *  @param {number} options.max max feature to test to get the values, default 10000
 *  @param {number} options.selectAll select all features if no option selected
 *  @param {string} options.type check type: checkbox or radio, default checkbox
 *  @param {number} options.defaultLabel label for the default radio button
 *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
 */
ol.control.SelectCheck = function(options) {
  if (!options) options = {};
  // Container
  var div = options.content = ol.ext.element.create('DIV');
  if (options.label) {
    ol.ext.element.create('LABEL', {
      html: options.label,
      parent: div
    });
  }
  // Input div
  this._input = ol.ext.element.create('DIV', {
    parent: div
  });
  options.className = options.className || 'ol-select-check';
  ol.control.SelectBase.call(this, options);
  this.set('property', options.property || 'name');
  this.set('max', options.max || 10000);
  this.set('defaultLabel', options.defaultLabel);
  this.set('type', options.type);
  this._selectAll = options.selectAll;
  this._onchoice = options.onchoice;
  // Set select options
  this.setValues();
};
ol.ext.inherits(ol.control.SelectCheck, ol.control.SelectBase);
/**
* Set the map instance the control associated with.
* @param {o.Map} map The map instance.
*/
ol.control.SelectCheck.prototype.setMap = function(map) {
  ol.control.SelectBase.prototype.setMap.call(this, map);
  this.setValues();
};
/** Select features by attributes
 */
ol.control.SelectCheck.prototype.doSelect = function(options) {
  options = options || {};
  var conditions = [];
  this._checks.forEach(function(c) {
    if (c.checked) {
      if (c.value) {
        conditions.push({
          attr: this.get('property'),
          op: '=',
          val: c.value
        });
      }
    }
  }.bind(this));
  if (!conditions.length) {
    return ol.control.SelectBase.prototype.doSelect.call(this, { 
      features: options.features, 
      matchAll: this._selectAll 
    });
  } else {
    return ol.control.SelectBase.prototype.doSelect.call(this, {
      features: options.features, 
      conditions: conditions
    })
  }
};
/** Set the popup values
 * @param {Object} options
 *  @param {Object} options.values a key/value list with key = property value, value = title shown in the popup, default search values in the sources
 *  @param {boolean} options.sort sort values
 */
ol.control.SelectCheck.prototype.setValues = function(options) {
  options = options || {};
  console.log(options)
  var values, vals;
  if (options.values) {
    if (options.values instanceof Array) {
      vals = {};
      options.values.forEach(function(v) { vals[v] = v; });
    } else {
      vals = options.values;
    }
  } else {
    vals = {};
    var prop = this.get('property');
    this.getSources().forEach(function(s){
      var features = s.getFeatures();
      var max = Math.min(features.length, this.get('max'))
      for (var i=0; i<max; i++) {
        var p = features[i].get(prop);
        if (p) vals[p] = p;
      }
    }.bind(this));
  }
  if (!Object.keys(vals).length) return;
  if (options.sort) {
    values = {};
    Object.keys(vals).sort().forEach(function(key) {
      values[key] = vals[key];
    });
  } else {
    values = vals;
  }
  ol.ext.element.setHTML(this._input, '');
  this._checks = [];
  var id = 'radio_'+(new Date().getTime());
  var addCheck = function(val, info) {
    var label = ol.ext.element.create('LABEL', {
      className: (this.get('type')==='radio' ? 'ol-radio' : 'ol-checkbox'),
      parent: this._input
    });
    this._checks.push( ol.ext.element.create('INPUT', {
      name: id,
      type: (this.get('type')==='radio' ? 'radio' : 'checkbox'),
      value: val,
      change: function () { 
        if (this._onchoice) this._onchoice()
        else this.doSelect();
      }.bind(this),
      parent: label
    }));
    ol.ext.element.create('DIV', {
      html: info,
      parent: label
    });
  }.bind(this);
  if (this.get('defaultLabel') && this.get('type')==='radio') addCheck('', this.get('defaultLabel'));
  for (var k in values) addCheck(k, values[k]);
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Select features by property using a condition 
 *
 * @constructor
 * @extends {ol.control.SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {string} options.label control label, default 'condition'
 *  @param {number} options.selectAll select all features if no option selected
 *  @param {condition|Array<condition>} options.condition conditions 
 *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
 */
ol.control.SelectCondition = function(options) {
  if (!options) options = {};
  // Container
  var div = options.content = ol.ext.element.create('DIV');
  var label = ol.ext.element.create('LABEL', {
    parent: div
  });
  this._check = ol.ext.element.create('INPUT', {
    type: 'checkbox',
    change: function () { 
      if (this._onchoice) this._onchoice()
      else this.doSelect();
    }.bind(this),
    parent: label
  });
  ol.ext.element.create('DIV', {
    html: options.label || 'condition',
    parent: label
  });
  // Input div
  this._input = ol.ext.element.create('DIV', {
    parent: div
  });
  options.className = options.className || 'ol-select-condition';
  ol.control.SelectBase.call(this, options);
  this.setCondition(options.condition);
  this._selectAll = options.selectAll;
  this._onchoice = options.onchoice;
};
ol.ext.inherits(ol.control.SelectCondition, ol.control.SelectBase);
/** Set condition to select on
 * @param {condition | Array<condition>} condition
 *  @param {string} attr property to select on
 *  @param {string} op operator (=, !=, <; <=, >, >=, contain, !contain, regecp)
 *  @param {*} val value to select on
 */
ol.control.SelectCondition.prototype.setCondition = function(condition) {
  if (!condition) this._conditions = [];
  else this._conditions = (condition instanceof Array ?  condition : [condition]);
};
/** Add a condition to select on
 * @param {condition} condition
 *  @param {string} attr property to select on
 *  @param {string} op operator (=, !=, <; <=, >, >=, contain, !contain, regecp)
 *  @param {*} val value to select on
 */
ol.control.SelectCondition.prototype.addCondition = function(condition) {
  this._conditions.push(condition);
};
/** Select features by condition
 */
ol.control.SelectCondition.prototype.doSelect = function(options) {
  options = options || {};
  var conditions = this._conditions;
  if (!this._check.checked) {
    return ol.control.SelectBase.prototype.doSelect.call(this, { features: options.features, matchAll: this._selectAll });
  } else {
    return ol.control.SelectBase.prototype.doSelect.call(this, {
      features: options.features,
      conditions: conditions
    })
  }
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Select features by property using a simple text input
 *
 * @constructor
 * @extends {ol.control.SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {string} options.property property to select on
 *  @param {function|undefined} options.onchoice function triggered the text change, default nothing
 */
ol.control.SelectFulltext = function(options) {
  if (!options) options = {};
  // Container
  var div = options.content =ol.ext.element.create('DIV');
  if (options.label) {
    ol.ext.element.create('LABEL', {
      html: options.label,
      parent: div
    });
  }
  this._input = ol.ext.element.create('INPUT', {
    placeHolder: options.placeHolder || 'search...',
    change: function() {
      if (this._onchoice) this._onchoice();
    }.bind(this),
    parent: div
  });
  ol.control.SelectBase.call(this, options);
  this._onchoice = options.onchoice;
  this.set('property', options.property || 'name');
};
ol.ext.inherits(ol.control.SelectFulltext, ol.control.SelectBase);
/** Select features by condition
 */
ol.control.SelectFulltext.prototype.doSelect= function(options) {
  options = options || {};
  return ol.control.SelectBase.prototype.doSelect.call(this, {
    features: options.features,
    useCase: false,
    conditions: [{
      attr: this.get('property'),
      op: 'contain',
      val: this._input.value
    }]
  });
}

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * A multiselect control. 
 * A container that manage other control Select 
 *
 * @constructor
 * @extends {ol.control.SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {Array<ol.control.SelectBase>} options.controls an array of controls
 */
ol.control.SelectMulti = function(options) {
  if (!options) options = {};
  // Container
  options.content = ol.ext.element.create('DIV');
  this._container = ol.ext.element.create('UL', {
    parent: options.content
  });
  options.className = options.className || 'ol-select-multi';
  ol.control.SelectBase.call(this, options);
  this._controls = [];
  options.controls.forEach(this.addControl.bind(this));
};
ol.ext.inherits(ol.control.SelectMulti, ol.control.SelectBase);
/**
* Set the map instance the control associated with.
* @param {o.Map} map The map instance.
*/
ol.control.SelectMulti.prototype.setMap = function(map) {
  if (this.getMap()) {
    this._controls.forEach(function(c) {
      this.getMap().remveControl(c);
    }.bind(this));
  }
  ol.control.SelectBase.prototype.setMap.call(this, map);
  if (this.getMap()) {
    this._controls.forEach(function(c) {
      this.getMap().addControl(c);
    }.bind(this));
  }
};
/** Add a new control
 * @param {ol.control.SelectBase} c
 */
ol.control.SelectMulti.prototype.addControl = function(c) {
  if (c instanceof ol.control.SelectBase) {
    this._controls.push(c);
    c.setTarget(ol.ext.element.create('LI', {
      parent: this._container
    }));
    c._selectAll = true;
    c._onchoice = this.doSelect.bind(this);
    if (this.getMap()) {
      this.getMap().addControl(c);
    }
  }
};
/** Get select controls
 * @return {Aray<ol.control.SelectBase>}
 */
ol.control.SelectMulti.prototype.getControls = function() {
  return this._controls;
};
/** Select features by condition
 */
ol.control.SelectMulti.prototype.doSelect = function() {
  var features = [];
  this.getSources().forEach(function(s) {
    features = features.concat(s.getFeatures());
  });
  this._controls.forEach(function(c) {
    features = c.doSelect({ features: features });
  });
  this.dispatchEvent({ type:"select", features: features });
  return features;
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Select features by property using a popup 
 *
 * @constructor
 * @extends {ol.control.SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {string} options.property property to select on
 *  @param {number} options.max max feature to test to get the values, default 10000
 *  @param {number} options.selectAll select all features if no option selected
 *  @param {string} options.defaultLabel label for the default selection
 *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
 */
ol.control.SelectPopup = function(options) {
  if (!options) options = {};
  // Container
  var div = options.content = ol.ext.element.create('DIV');
  if (options.label) {
    ol.ext.element.create('LABEL', {
      html: options.label,
      parent: div
    });
  }
  this._input = ol.ext.element.create('SELECT', {
    on: { change: function () { 
      if (this._onchoice) this._onchoice();
      else this.doSelect();
    }.bind(this) },
    parent: div
  });
  options.className = options.className || 'ol-select-popup';
  ol.control.SelectBase.call(this, options);
  this.set('property', options.property || 'name');
  this.set('max', options.max || 10000);
  this.set('defaultLabel', options.defaultLabel);
  this._selectAll = options.selectAll;
  this._onchoice = options.onchoice;
  // Set select options
  this.setValues();
};
ol.ext.inherits(ol.control.SelectPopup, ol.control.SelectBase);
/**
* Set the map instance the control associated with.
* @param {o.Map} map The map instance.
*/
ol.control.SelectPopup.prototype.setMap = function(map) {
  ol.control.SelectBase.prototype.setMap.call(this, map);
  this.setValues();
};
/** Select features by attributes
 */
ol.control.SelectPopup.prototype.doSelect = function(options) {
  options = options || {};
  if (!this._input.value) {
    return ol.control.SelectBase.prototype.doSelect.call(this, { features: options.features, matchAll: this._selectAll });
  } else {
    return ol.control.SelectBase.prototype.doSelect.call(this, {
      features: options.features, 
      conditions: [{
        attr: this.get('property'),
        op: '=',
        val: this._input.value
      }]
    })
  }
};
/** Set the popup values
 * @param {Object} values a key/value list with key = property value, value = title shown in the popup, default search values in the sources
 */
ol.control.SelectPopup.prototype.setValues = function(options) {
  options = options || {};
  var values, vals;
  if (options.values) {
    if (options.values instanceof Array) {
      vals = {};
      options.values.forEach(function(v) { vals[v] = v; });
    } else {
      vals = options.values;
    }
  } else {
    vals = {};
    var prop = this.get('property');
    this.getSources().forEach(function(s){
      var features = s.getFeatures();
      var max = Math.min(features.length, this.get('max'))
      for (var i=0; i<max; i++) {
        var p = features[i].get(prop);
        if (p) vals[p] = p;
      }
    }.bind(this));
  }
  if (options.sort) {
    values = {};
    Object.keys(vals).sort().forEach(function(key) {
      values[key] = vals[key];
    });
  } else {
    values = vals;
  }
  ol.ext.element.setHTML(this._input, '');
  ol.ext.element.create('OPTION', {
    className: 'ol-default',
    html: this.get('defaultLabel') || '',
    value: '',
    parent: this._input
  });
  for (var k in values) {
    ol.ext.element.create('OPTION', {
      html: values[k],
      value: k,
      parent: this._input
    });
  }
};

/** A control with scroll-driven navigation to create narrative maps
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *  @param {string} options.status status, default none
 *  @param {string} options.position position of the status 'top', 'left', 'bottom' or 'right', default top
 */
ol.control.Status = function(options) {
  options = options || {};
  // New element
  var element = ol.ext.element.create('DIV', {
    className: (options.className || '') + ' ol-status'
      + (options.target ? '': ' ol-unselectable ol-control')
  });
  // Initialize
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  if (options.position) this.setPosition(options.position);
  this.status(options.status || '');
};
ol.ext.inherits(ol.control.Status, ol.control.Control);
/** Show status on the map
 * @param {string|Element} html status text or DOM element
 */
ol.control.Status.prototype.status = function(html) {
  var s = html || '';
  if (s) {
    ol.ext.element.show(this.element);
    if (typeof(s)==='object' && !(s instanceof String)) {
      s = '';
      for (var i in html) {
        s += '<label>'+i+':</label> '+html[i]+'<br/>';
      }
    }
    ol.ext.element.setHTML(this.element, s);
  } else {
    ol.ext.element.hide(this.element);
  }
};
/** Set status position
 * @param {string} position position of the status 'top', 'left', 'bottom' or 'right', default top
 */
ol.control.Status.prototype.setPosition = function(position) {
  this.element.classList.remove('ol-left');
  this.element.classList.remove('ol-right');
  this.element.classList.remove('ol-bottom');
  this.element.classList.remove('ol-center');
  if (/^left$|^right$|^bottom$|^center$/.test(position)) {
    this.element.classList.add('ol-'+position);
  }
};
/** Show the status
 * @param {boolean} show show or hide the control, default true
 */
ol.control.Status.prototype.show = function(show) {
  if (show===false) ol.ext.element.hide(this.element);
  else ol.ext.element.show(this.element);
};
/** Hide the status
 */
ol.control.Status.prototype.hide = function() {
  ol.ext.element.hide(this.element);
};
/** Toggle the status
 */
ol.control.Status.prototype.toggle = function() {
  ol.ext.element.toggle(this.element);
};
/** Is status visible
 */
ol.control.Status.prototype.isShown = function() {
  return this.element.style.display==='none';
};

/** A control with scroll-driven navigation to create narrative maps
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires scrollto
 * @fires clickimage
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {Element | string | undefined} options.html The storymap content
 *	@param {Element | string | undefined} options.target The target element to place the story. If no html is provided the content of the target will be used.
 */
ol.control.Storymap = function(options) {
  // Remove or get target content 
  if (options.target) {
    if (!options.html) {
      options.html = options.target.innerHTML;
    } else if (options.html instanceof Element) {
      options.html = options.html.innerHTML;
    }
    options.target.innerHTML = '';
  }
  // New element
  var element = ol.ext.element.create('DIV', {
    className: (options.className || '') + ' ol-storymap'
      + (options.target ? '': ' ol-unselectable ol-control')
      + ('ontouchstart' in window ? ' ol-touch' : ''),
    html: options.html
  });
  element.querySelectorAll('.chapter').forEach(function(c) {
    c.addEventListener('click', function(e) {
      // Not moving
      if (!this.element.classList.contains('ol-move')) {
        if (!c.classList.contains('ol-select')) {
          this.element.scrollTop = c.offsetTop - 30;
          e.preventDefault();
        } else {
          if (e.target.tagName==='IMG' && e.target.dataset.title) {
            this.dispatchEvent({ 
              coordinate: this.getMap() ? this.getMap().getCoordinateFromPixel([e.layerX,e.layerY]) : null,
              type: 'clickimage', 
              img: e.target, 
              title: e.target.dataset.title, 
              element: c, 
              name: c.getAttribute('name'),
              originalEvent: e
            });
          }
        }
      }
    }.bind(this));
  }.bind(this));
  // Initialize
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  // Make a scroll div
  ol.ext.element.scrollDiv (this.element, {
    vertical: true,
    mousewheel: true
  });
  // Scroll to the next chapter
  var sc = this.element.querySelectorAll('.ol-scroll-next');
  sc.forEach(function(s) {
    s.addEventListener('click', function(e) { 
      if (s.parentElement.classList.contains('ol-select')) {
        var chapter = this.element.querySelectorAll('.chapter');
        var scrollto = s.offsetTop;
        for (var i=0, c; c=chapter[i]; i++) {
          if (c.offsetTop > scrollto) {
            scrollto = c.offsetTop;
            break;
          }
        }
        this.element.scrollTop = scrollto - 30;
        e.stopPropagation();
        e.preventDefault();
      }
    }.bind(this));
  }.bind(this));
  // Scroll top 
  sc = this.element.querySelectorAll('.ol-scroll-top');
  sc.forEach(function(i) {
    i.addEventListener('click', function(e){ 
      this.element.scrollTop = 0;
      e.stopPropagation();
      e.preventDefault();
    }.bind(this));
  }.bind(this));
  var getEvent = function(currentDiv) {
    var lonlat = [ parseFloat(currentDiv.getAttribute('data-lon')),
      parseFloat(currentDiv.getAttribute('data-lat'))];
    var coord = ol.proj.fromLonLat(lonlat, this.getMap().getView().getProjection());
    var zoom = parseFloat(currentDiv.getAttribute('data-zoom'));
    return { 
      type: 'scrollto', 
      element: currentDiv, 
      name: currentDiv.getAttribute('name'),
      coordinate: coord,
      lon: lonlat,
      zoom: zoom
    };
  }.bind(this);
  // Handle scrolling
  var currentDiv = this.element.querySelectorAll('.chapter')[0];
  setTimeout (function (){
    currentDiv.classList.add('ol-select');
    this.dispatchEvent(getEvent(currentDiv));
  }.bind(this));
  // Trigger change event on scroll
  this.element.addEventListener('scroll', function() {
    var current, chapter = this.element.querySelectorAll('.chapter');
    var height = ol.ext.element.getStyle(this.element, 'height');
    if (!this.element.scrollTop) {
      current = chapter[0];
    } else {
      for (var i=0, s; s=chapter[i]; i++) {
        var p = s.offsetTop - this.element.scrollTop;
        if (p > height/3) break;
        current = s;
      }
    }
    if (current && current!==currentDiv) {
      if (currentDiv) currentDiv.classList.remove('ol-select');
      currentDiv = current;
      currentDiv.classList.add('ol-select');
      var e = getEvent(currentDiv);
      var view = this.getMap().getView();
      view.cancelAnimations();
      switch (currentDiv.getAttribute('data-animation')) {
        case 'flyto': {
          // Fly to destination
          var duration = 2000;
          view.animate ({
            center: e.coordinate,
            duration: duration
          });
          view.animate ({
            zoom: Math.min(view.getZoom(), e.zoom)-1,
            duration: duration/2
          },{
            zoom: e.zoom,
            duration: duration/2
          });
          break;
        }
        default: break;
      }
      this.dispatchEvent(e);
    }
  }.bind(this));
};
ol.ext.inherits(ol.control.Storymap, ol.control.Control);
/** Scroll to a chapter
 * @param {string} name Name of the chapter to scroll to
 */
ol.control.Storymap.prototype.setChapter = function (name) {
  var chapter = this.element.querySelectorAll('.chapter');
  for (var i=0, s; s=chapter[i]; i++) {
    if (s.getAttribute('name')===name) {
      this.element.scrollTop = s.offsetTop - 30;
    }
  }
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc Swipe Control.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} Control options.
 *	@param {ol.layer} options.layers layer to swipe
 *	@param {ol.layer} options.rightLayer layer to swipe on right side
 *	@param {string} options.className control class name
 *	@param {number} options.position position propertie of the swipe [0,1], default 0.5
 *	@param {string} options.orientation orientation propertie (vertical|horizontal), default vertical
 */
ol.control.Swipe = function(options) {
	options = options || {};
	var button = document.createElement('button');
	var element = document.createElement('div');
  element.className = (options.className || "ol-swipe") + " ol-unselectable ol-control";
  element.appendChild(button);
	element.addEventListener("mousedown", this.move.bind(this));
	element.addEventListener("touchstart", this.move.bind(this));
	ol.control.Control.call(this, {
    element: element
	});
	// An array of listener on layer postcompose
	this.precomposeRight_ = this.precomposeRight.bind(this);
	this.precomposeLeft_ = this.precomposeLeft.bind(this);
	this.postcompose_ = this.postcompose.bind(this);
	this.layers = [];
	if (options.layers) this.addLayer(options.layers, false);
	if (options.rightLayers) this.addLayer(options.rightLayers, true);
	this.on('propertychange', function() {
    if (this.getMap()) this.getMap().renderSync();
		if (this.get('orientation') === "horizontal") {
      this.element.style.top = this.get('position')*100+"%";
			this.element.style.left = "";
		} else {
      if (this.get('orientation') !== "vertical") this.set('orientation', "vertical");
			this.element.style.left = this.get('position')*100+"%";
			this.element.style.top = "";
		}
		this.element.classList.remove("horizontal", "vertical");
		this.element.classList.add(this.get('orientation'));
	}.bind(this));
	this.set('position', options.position || 0.5);
	this.set('orientation', options.orientation || 'vertical');
};
ol.ext.inherits(ol.control.Swipe, ol.control.Control);
/**
 * Set the map instance the control associated with.
 * @param {_ol_Map_} map The map instance.
 */
ol.control.Swipe.prototype.setMap = function(map) {
	var i;
	var l;
	if (this.getMap()) {
		for (i=0; i<this.layers.length; i++) {
			l = this.layers[i];
			if (l.right) l.layer.un(['precompose','prerender'], this.precomposeRight_);
			else l.layer.un(['precompose','prerender'], this.precomposeLeft_);
			l.layer.un(['postcompose','postrender'], this.postcompose_);
		}
		this.getMap().renderSync();
	}
	ol.control.Control.prototype.setMap.call(this, map);
	if (map) {
    this._listener = [];
		for (i=0; i<this.layers.length; i++) {
      l = this.layers[i];
			if (l.right) l.layer.on(['precompose','prerender'], this.precomposeRight_);
			else l.layer.on(['precompose','prerender'], this.precomposeLeft_);
			l.layer.on(['postcompose','postrender'], this.postcompose_);
		}
		map.renderSync();
	}
};
/** @private
*/
ol.control.Swipe.prototype.isLayer_ = function(layer){
  for (var k=0; k<this.layers.length; k++) {
    if (this.layers[k].layer === layer) return k;
	}
	return -1;
};
/** Add a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
*	@param {bool} add layer in the right part of the map, default left.
*/
ol.control.Swipe.prototype.addLayer = function(layers, right) {
  if (!(layers instanceof Array)) layers = [layers];
	for (var i=0; i<layers.length; i++) {
		var l = layers[i];
		if (this.isLayer_(l) < 0) {
      this.layers.push({ layer:l, right:right });
			if (this.getMap()) {
        if (right) l.on(['precompose','prerender'], this.precomposeRight_);
				else l.on(['precompose','prerender'], this.precomposeLeft_);
				l.on(['postcompose','postrender'], this.postcompose_);
				this.getMap().renderSync();
			}
		}
	}
};
/** Remove a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
 */
ol.control.Swipe.prototype.removeLayer = function(layers) {
  if (!(layers instanceof Array)) layers = [layers];
	for (var i=0; i<layers.length; i++) {
    var k = this.isLayer_(layers[i]);
		if (k >=0 && this.getMap()) {
      if (this.layers[k].right) layers[i].un(['precompose','prerender'], this.precomposeRight_);
			else layers[i].un(['precompose','prerender'], this.precomposeLeft_);
			layers[i].un(['postcompose','postrender'], this.postcompose_);
			this.layers.splice(k,1);
			this.getMap().renderSync();
		}
	}
};
/** @private
*/
ol.control.Swipe.prototype.move = function(e) {
	var self = this;
	var l;
	switch (e.type) {
    case 'touchcancel':
		case 'touchend':
		case 'mouseup': {
      self.isMoving = false;
			["mouseup", "mousemove", "touchend", "touchcancel", "touchmove"]
				.forEach(function(eventName) {
					document.removeEventListener(eventName, self.move);
				});
			break;
		}
		case 'mousedown':
		case 'touchstart': {
			self.isMoving = true;
			["mouseup", "mousemove", "touchend", "touchcancel", "touchmove"]
				.forEach(function(eventName) {
					document.addEventListener(eventName, self.move.bind(self));
				});
		}
		// fallthrough
		case 'mousemove':
		case 'touchmove': {
      if (self.isMoving) {
        if (self.get('orientation') === "vertical") {
          var pageX = e.pageX
						|| (e.touches && e.touches.length && e.touches[0].pageX)
						|| (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageX);
          if (!pageX) break;
          pageX -= self.getMap().getTargetElement().getBoundingClientRect().left +
            window.pageXOffset - document.documentElement.clientLeft;
					l = self.getMap().getSize()[0];
					l = Math.min(Math.max(0, 1-(l-pageX)/l), 1);
					self.set('position', l);
				} else {
          var pageY = e.pageY
						|| (e.touches && e.touches.length && e.touches[0].pageY)
						|| (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageY);
					if (!pageY) break;
					pageY -= self.getMap().getTargetElement().getBoundingClientRect().top +
						window.pageYOffset - document.documentElement.clientTop;
					l = self.getMap().getSize()[1];
					l = Math.min(Math.max(0, 1-(l-pageY)/l), 1);
					self.set('position', l);
				}
			}
			break;
		}
		default: break;
	}
};
/** @private
*/
ol.control.Swipe.prototype.precomposeLeft = function(e) {
  var ctx = e.context;
	var canvas = ctx.canvas;
	ctx.save();
	ctx.beginPath();
	if (this.get('orientation') === "vertical") ctx.rect (0,0, canvas.width*this.get('position'), canvas.height);
	else ctx.rect (0,0, canvas.width, canvas.height*this.get('position'));
	ctx.clip();
};
/** @private
*/
ol.control.Swipe.prototype.precomposeRight = function(e) {
  var ctx = e.context;
	var canvas = ctx.canvas;
	ctx.save();
	ctx.beginPath();
	if (this.get('orientation') === "vertical") ctx.rect (canvas.width*this.get('position'), 0, canvas.width, canvas.height);
	else ctx.rect (0,canvas.height*this.get('position'), canvas.width, canvas.height);
	ctx.clip();
};
/** @private
*/
ol.control.Swipe.prototype.postcompose = function(e) {
  e.context.restore();
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** ol.control.Target draw a target at the center of the map.
 * @constructor
 * @extends {ol.control.CanvasBase}
 * @param {Object} options
 *  @param {ol.style.Style|Array<ol.style.Style>} options.style
 *  @param {string} options.composite composite operation = difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
ol.control.Target = function(options) {
  options = options || {};
	this.style = options.style || [
    new ol.style.Style({ image: new ol.style.RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol.style.Stroke({ color: "#fff", width:3 }) }) }),
    new ol.style.Style({ image: new ol.style.RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol.style.Stroke({ color: "#000", width:1 }) }) })
  ];
	if (!(this.style instanceof Array)) this.style = [this.style];
	this.composite = options.composite || '';
	var div = document.createElement('div');
	div.className = "ol-target ol-unselectable ol-control";
	ol.control.CanvasBase.call(this, {
    element: div,
		target: options.target
	});
	this.setVisible(options.visible!==false);
};
ol.ext.inherits(ol.control.Target, ol.control.CanvasBase);
/** Set the control visibility
 * @paraam {boolean} b 
 */
ol.control.Target.prototype.setVisible = function (b) {
  this.set("visible",b);
	if (this.getMap()) this.getMap().renderSync();
};
/** Get the control visibility
 * @return {boolean} b 
 */
ol.control.Target.prototype.getVisible = function () {
  return this.get("visible");
};
/** Draw the target
 * @private
 */
ol.control.Target.prototype._draw = function (e) {
  var ctx = this.getContext(e);
  if (!ctx || !this.getMap() || !this.getVisible()) return;
	var ratio = e.frameState.pixelRatio;
	ctx.save();
		ctx.scale(ratio,ratio);
		var cx = ctx.canvas.width/(2*ratio);
		var cy = ctx.canvas.height/(2*ratio);
		var geom = new ol.geom.Point (this.getMap().getCoordinateFromPixel([cx,cy]));
		if (this.composite) ctx.globalCompositeOperation = this.composite;
    for (var i=0; i<this.style.length; i++) {
      var style = this.style[i];
      if (style instanceof ol.style.Style) {
        var vectorContext = e.vectorContext;
        if (!vectorContext) {
          var event = {
            inversePixelTransform: [ratio,0,0,ratio,0,0],
            context: ctx,
            frameState: {
              pixelRatio: ratio,
              extent: e.frameState.extent,
              coordinateToPixelTransform: e.frameState.coordinateToPixelTransform,
              viewState: e.frameState.viewState
            }
          }
          vectorContext = ol.render.getVectorContext(event);
        } 
        vectorContext.setStyle(style);
        vectorContext.drawGeometry(geom);
      }
    }
	ctx.restore();
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A simple push button control drawn as text
 * @constructor
 * @extends {ol.control.Button}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {String} options.title title of the control
 *	@param {String} options.html html to insert in the control
 *	@param {function} options.handleClick callback when control is clicked (or use change:active event)
 */
ol.control.TextButton = function(options)
{	options = options || {};
    options.className = (options.className||"") + " ol-text-button";
    ol.control.Button.call(this, options);
};
ol.ext.inherits(ol.control.TextButton, ol.control.Button);

/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
/** Timeline control
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires select
 * @fires scroll
 * @fires collapse
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {Array<ol.Feature>} options.features Features to show in the timeline
 *	@param {ol.SourceImageOptions.vector} options.source class of the control
 *	@param {Number} options.interval time interval length in ms or a text with a format d, h, mn, s (31 days = '31d'), default none
 *	@param {String} options.maxWidth width of the time line in px, default 2000px
 *	@param {String} options.minDate minimum date 
 *	@param {String} options.maxDate maximum date 
 *	@param {Number} options.minZoom Minimum zoom for the line, default .2
 *	@param {Number} options.maxZoom Maximum zoom for the line, default 4
 *	@param {boolean} options.zoomButton Are zoom buttons avaliable, default false
 *	@param {function} options.getHTML a function that takes a feature and returns the html to display
 *	@param {function} options.getFeatureDate a function that takes a feature and returns its date, default the date propertie
 *	@param {function} options.endFeatureDate a function that takes a feature and returns its end date, default no end date
 *	@param {String} options.graduation day|month to show month or day graduation, default show only years
 *	@param {String} options.scrollTimeout Time in milliseconds to get a scroll event, default 15ms
 */
ol.control.Timeline = function(options) {
  var element = ol.ext.element.create('DIV', {
    className: (options.className || '') + ' ol-timeline'
      + (options.target ? '': ' ol-unselectable ol-control')
      + (options.zoomButton ? ' ol-hasbutton':'')
      + ('ontouchstart' in window ? ' ol-touch' : '')
  });
  // Initialize
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
  // Scroll div
  this._scrollDiv = ol.ext.element.create('DIV', {
    className: 'ol-scroll',
    parent: this.element
  });
  // Add a button bar
  this._buttons = ol.ext.element.create('DIV', {
    className: 'ol-buttons',
    parent: this.element
  });
  // Zoom buttons
  if (options.zoomButton) {
    // Zoom in
    this.addButton({
      className: 'ol-zoom-in',
      handleClick: function(){
        var zoom = this.get('zoom');
        if (zoom>=1) {
          zoom++;
        } else {
          zoom = Math.min(1, zoom + 0.1);
        }
        zoom = Math.round(zoom*100)/100;
        this.refresh(zoom);
      }.bind(this)
    });
    // Zoom out
    this.addButton({
      className: 'ol-zoom-out',
      handleClick: function(){
        var zoom = this.get('zoom');
        if (zoom>1) {
          zoom--;
        } else {
          zoom -= 0.1;
        }
        zoom = Math.round(zoom*100)/100;
        this.refresh(zoom);
      }.bind(this)
    });
  }
  // Draw center date
  this._intervalDiv = ol.ext.element.create('DIV', {
    className: 'ol-center-date',
    parent: this.element
  });
  // Remove selection
  this.element.addEventListener('mouseover', function(){
    if (this._select) this._select.elt.classList.remove('ol-select');
  }.bind(this));
  // Trigger scroll event
  var scrollListener = null;
  this._scrollDiv.addEventListener('scroll', function() {
    if (scrollListener) {
      clearTimeout(scrollListener);
      scrollListener = null;
    }
    scrollListener = setTimeout(function() {
      this.dispatchEvent({ 
        type: 'scroll', 
        date: this.getDate(), 
        dateStart: this.getDate('start'), 
        dateEnd: this.getDate('end')
      });
    }.bind(this), options.scrollTimeout || 15);
  }.bind(this));
  // Magic to give "live" scroll events on touch devices
  this._scrollDiv.addEventListener('gesturechange', function() {});
  // Scroll timeline
  ol.ext.element.scrollDiv(this._scrollDiv, {
    onmove: function(b) {
      // Prevent selection on moving
      this._moving = b; 
    }.bind(this)
  });
  this._tline = [];
  // Parameters
  this.set('maxWidth', options.maxWidth || 2000);
  this.set('minDate', options.minDate || Infinity);
  this.set('maxDate', options.maxDate || -Infinity);
  this.set('graduation', options.graduation);
  this.set('minZoom', options.minZoom || .2);
  this.set('maxZoom', options.maxZoom || 4);
  this.setInterval(options.interval);
  if (options.getHTML) this._getHTML =  options.getHTML;
  if (options.getFeatureDate) this._getFeatureDate =  options.getFeatureDate;
  if (options.endFeatureDate) this._endFeatureDate =  options.endFeatureDate;
  // Feature source 
  this.setFeatures(options.features || options.source, options.zoom);
};
ol.ext.inherits(ol.control.Timeline, ol.control.Control);
/**
 * Set the map instance the control is associated with
 * and add interaction attached to it to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol.control.Timeline.prototype.setMap = function(map) {
  ol.control.Control.prototype.setMap.call(this, map);
  this.refresh(this.get('zoom')||1, true);
};
/** Add a button on the timeline
 * @param {*} button
 *  @param {string} button.className
 *  @param {title} button.className
 *  @param {Element|string} button.html Content of the element
 *  @param {function} button.click a function called when the button is clicked
 */
ol.control.Timeline.prototype.addButton = function(button) {
  this.element.classList.add('ol-hasbutton');
  ol.ext.element.create('BUTTON', {
    className: button.className || undefined,
    title: button.title,
    html : button.html,
    click: button.handleClick,
    parent: this._buttons
  })
};
/** Set an interval
 * @param {number|string} length the interval length in ms or a farmatted text ie. end with y, 1d, h, mn, s (31 days = '31d'), default none
 */
ol.control.Timeline.prototype.setInterval = function(length) {
  if (typeof(length)==='string') {
    if (/s$/.test(length)) {
      length = parseFloat(length) * 1000;
    } else if (/mn$/.test(length)) {
      length = parseFloat(length) * 1000 * 60;
    } else if (/h$/.test(length)) {
      length = parseFloat(length) * 1000 * 3600;
    } else if (/d$/.test(length)) {
      length = parseFloat(length) * 1000 * 3600 * 24;
    } else if (/y$/.test(length)) {
      length = parseFloat(length) * 1000 * 3600 * 24 * 365;
    } else {
      length = 0;
    }
  }
  this.set('interval', length || 0);
  if (length) this.element.classList.add('ol-interval');
  else this.element.classList.remove('ol-interval');
  this.refresh(this.get('zoom'));
}
/** Default html to show in the line
 * @param {ol.Feature} feature
 * @return {DOMElement|string}
 * @private
 */
ol.control.Timeline.prototype._getHTML = function(feature) {
  return feature.get('name') || '';
};
/** Default function to get the date of a feature, returns the date attribute
 * @param {ol.Feature} feature
 * @return {Data|string}
 * @private
 */
ol.control.Timeline.prototype._getFeatureDate = function(feature) {
  return (feature && feature.get) ? feature.get('date') : null;
};
/** Default function to get the end date of a feature, return undefined
 * @param {ol.Feature} feature
 * @return {Data|string}
 * @private
 */
ol.control.Timeline.prototype._endFeatureDate = function(/* feature */) {
  return undefined;
};
/** Is the line collapsed
 * @return {boolean}
 */
ol.control.Timeline.prototype.isCollapsed = function() {
  return this.element.classList.contains('ol-collapsed');
};
/** Collapse the line
 * @param {boolean} b
 */
ol.control.Timeline.prototype.collapse = function(b) {
  if (b) this.element.classList.add('ol-collapsed');
  else this.element.classList.remove('ol-collapsed');
  this.dispatchEvent({ type: 'collapse', collapsed: this.isCollapsed() });
};
/** Collapse the line
 */
ol.control.Timeline.prototype.toggle = function() {
  this.element.classList.toggle('ol-collapsed');
  this.dispatchEvent({ type: 'collapse', collapsed: this.isCollapsed() });
};
/** Set the features to display in the timeline
 * @param {Array<ol.Features>|ol.source.Vector} features An array of features or a vector source
 * @param {number} zoom zoom to draw the line default 1
 */
ol.control.Timeline.prototype.setFeatures = function(features, zoom) {
  this._features = this._source = null;
  if (features instanceof ol.source.Vector) this._source = features;
  else if (features instanceof Array) this._features = features;
  else this._features = [];
  this.refresh(zoom);
};
/**
 * Get features
 * @return {Array<ol.Feature>}
 */
ol.control.Timeline.prototype.getFeatures = function() {
  return this._features || this._source.getFeatures();
}
/**
 * Refresh the timeline with new data
 * @param {Number} zoom Zoom factor from 0.25 to 10, default 1
 */
ol.control.Timeline.prototype.refresh = function(zoom, first) {
  if (!this.getMap()) return;
  if (!zoom) zoom = this.get('zoom');
  zoom = Math.min(this.get('maxZoom'), Math.max(this.get('minZoom'), zoom || 1));
  this.set('zoom', zoom);
  this._scrollDiv.innerHTML = '';
  var features = this.getFeatures();
  var d, d2;
  // Get features sorted by date
  var tline = this._tline = [];
  features.forEach(function(f) {
    if (d = this._getFeatureDate(f)) {
      if (!(d instanceof Date)) {
        d = new Date(d)
      }
      if (this._endFeatureDate) {
        d2 = this._endFeatureDate(f);
        if (!(d2 instanceof Date)) {
          d2 = new Date(d2)
        }
      }
      if (!isNaN(d)) {
        tline.push({
          date: d,
          end: isNaN(d2) ? null : d2,
          feature: f
        });
      }
    }
  }.bind(this));
  tline.sort(function(a,b) { 
    return (a.date < b.date ? -1 : (a.date===b.date ? 0: 1))
  });
  // Draw
  var div = ol.ext.element.create('DIV', {
    parent: this._scrollDiv
  });
  // Calculate width
  var min = this._minDate = Math.min(this.get('minDate'), tline.length ? tline[0].date : Infinity);
  var max = this._maxDate = Math.max(this.get('maxDate'), tline.length ? tline[tline.length-1].date : -Infinity);
  if (!isFinite(min)) this._minDate = min = new Date();
  if (!isFinite(max)) this._maxDate = max = new Date();
  var delta = (max-min);
  var maxWidth = this.get('maxWidth');
  var scale = this._scale = (delta > maxWidth ? maxWidth/delta : 1) * zoom;
  // Leave 10px on right
  min = this._minDate = this._minDate - 10/scale;
  delta = (max-min) * scale;
  ol.ext.element.setStyle(div, {
    width: delta,
    maxWidth: 'unset'
  });
  // Draw time's bar
  this._drawTime(div, min, max, scale);
  // Set interval
  if (this.get('interval')) {
    ol.ext.element.setStyle (this._intervalDiv, { width: this.get('interval') * scale });
  } else {
    ol.ext.element.setStyle (this._intervalDiv, { width: '' });
  }
  // Draw features
  var line = [];
  var lineHeight = ol.ext.element.getStyle(this._scrollDiv, 'lineHeight');
  // Wrapper
  var fdiv = ol.ext.element.create('DIV', {
      className: 'ol-features',
      parent: div
  });
  // Add features on the line
  tline.forEach(function(f) {
    var d = f.date;
    var t = f.elt = ol.ext.element.create('DIV', {
      className: 'ol-feature',
      style: {
        left: Math.round((d-min)*scale),
      },
      html: this._getHTML(f.feature),
      parent: fdiv
    });
    // Prevent image dragging
    var img = t.querySelectorAll('img');
    for (var i=0; i<img.length; i++) {
      img[i].ondragstart = function(){ return false; };
    }
    // Calculate image width
    if (f.end) {
      ol.ext.element.setStyle(t, { 
        minWidth: (f.end-d) * scale, 
        width: (f.end-d) * scale, 
        maxWidth: 'unset'
      });
    }
    var left = ol.ext.element.getStyle(t, 'left');
    // Select on click
    t.addEventListener('click', function(){
      if (!this._moving) {
        this.dispatchEvent({type: 'select', feature: f.feature });
      }
    }.bind(this));
    // Find first free Y position
    var pos, l;
    for (pos=0; l=line[pos]; pos++) {
      if (left > l) {
        break;
      }
    }
    line[pos] = left + ol.ext.element.getStyle(t, 'width');
    ol.ext.element.setStyle(t, { top: pos*lineHeight });
  }.bind(this));
  this._nbline = line.length;
  if (first) this.setDate(this._minDate, { anim: false, position: 'start' });
  // Dispatch scroll event
  this.dispatchEvent({ 
    type: 'scroll', 
    date: this.getDate(), 
    dateStart: this.getDate('start'), 
    dateEnd: this.getDate('end')
  });
};
/**
 * Draw dates on line
 * @private
 */
ol.control.Timeline.prototype._drawTime = function(div, min, max, scale) {
  // Times div
  var tdiv = ol.ext.element.create('DIV', {
    className: 'ol-times',
    parent: div
  });
  var d, dt, month, dmonth;
  var dx = ol.ext.element.getStyle(tdiv, 'left');
  var heigth = ol.ext.element.getStyle(tdiv, 'height');
  // Year
  var year = (new Date(this._minDate)).getFullYear();
  dt = ((new Date(0)).setFullYear(String(year)) - new Date(0).setFullYear(String(year-1))) * scale;
  var dyear = Math.round(2*heigth/dt)+1;
  while(true) {
    d = new Date(0).setFullYear(year);
    if (d > this._maxDate) break;
    ol.ext.element.create('DIV', {
      className: 'ol-time ol-year',
      style: {
        left: Math.round((d-this._minDate)*scale) - dx
      },
      html: year,
      parent: tdiv
    });
    year += dyear;
  }
  // Month
  if (/day|month/.test(this.get('graduation'))) {
    dt = ((new Date(0)).setFullYear(String(year)) - new Date(0).setFullYear(String(year-1))) * scale;
    dmonth = Math.max(1, Math.round(12 / Math.round(dt/heigth/2)));
    if (dmonth < 12) {
      year = (new Date(this._minDate)).getFullYear();
      month = dmonth+1;
      while(true) {
        d = new Date('0/01/01');
        d.setFullYear(year);
        d.setMonth(month-1);
        if (d > this._maxDate) break;
        ol.ext.element.create('DIV', {
          className: 'ol-time ol-month',
          style: {
            left: Math.round((d-this._minDate)*scale) - dx
          },
          html: d.toLocaleDateString(undefined, { month: 'short'}),
          parent: tdiv
        });
        month += dmonth;
        if (month > 12) {
          year++;
          month = dmonth+1;
        }
      }
    }
  }
  // Day
  if (this.get('graduation')==='day') {
    dt = (new Date('2000/02/01') - new Date('2000/01/01')) * scale;
    var dday = Math.max(1, Math.round(31 / Math.round(dt/heigth/2)));
    if (dday < 31) {
      year = (new Date(this._minDate)).getFullYear();
      month = 0;
      var day = dday;
      while(true) {
        d = new Date(0);
        d.setFullYear(year);
        d.setMonth(month);
        d.setDate(day);
        if (isNaN(d)) {
          month++;
          if (month>12) {
            month = 1;
            year++;
          }
          day = dday;
        } else {
          if (d > this._maxDate) break;
          ol.ext.element.create('DIV', {
            className: 'ol-time ol-day',
            style: {
              left: Math.round((d-this._minDate)*scale) - dx
            },
            html: day,
            parent: tdiv
          });
          year = d.getFullYear();
          month = d.getMonth();
          day = d.getDate() + dday;
          if (day+dday/2>31) {
            month++;
            day = dday;
          }
        }
      }
    }
  }
};
/** Center timeline on a date
 * @param {Date|String|ol.feature} feature a date or a feature with a date
 * @param {Object} options
 *  @param {boolean} options.anim animate scroll
 *  @param {string} options.position start, end or middle, default middle
 */
ol.control.Timeline.prototype.setDate = function(feature, options) {
  var date;
  options = options || {};
  // It's a date
  if (feature instanceof Date) {
    date = feature;
  } else {
    // Get date from Feature
    if (this.getFeatures().indexOf(feature) >= 0) {
      date = this._getFeatureDate(feature);
    }
    if (date && !(date instanceof Date)) {
      date = new Date(date);
    }
    if (!date || isNaN(date)) {
      date = new Date(String(feature));
    }
  }
  if (!isNaN(date)) {
    if (options.anim === false) this._scrollDiv.classList.add('ol-move');
    var scrollLeft = (date-this._minDate)*this._scale;
    if (options.position==='start') {
      scrollLeft += ol.ext.element.outerWidth(this._scrollDiv)/2 - ol.ext.element.getStyle(this._scrollDiv, 'marginLeft')/2;
    } else if (options.position==='end') {
      scrollLeft -= ol.ext.element.outerWidth(this._scrollDiv)/2 - ol.ext.element.getStyle(this._scrollDiv, 'marginLeft')/2;
    }
    this._scrollDiv.scrollLeft = scrollLeft;
    if (options.anim === false) this._scrollDiv.classList.remove('ol-move');
    if (feature) {
      for (var i=0, f; f = this._tline[i]; i++) {
        if (f.feature === feature) {
          f.elt.classList.add('ol-select');
          this._select = f;
        } else {
          f.elt.classList.remove('ol-select');
        }
      }
    }
  }
};
/** Get the date of the center
 * @param {string} position start, end or middle, default middle
 * @return {Date}
 */
ol.control.Timeline.prototype.getDate = function(position) {
  var pos;
  switch (position) {
    case 'start': {
      if (this.get('interval')) {
        pos = - ol.ext.element.getStyle(this._intervalDiv, 'width')/2 + ol.ext.element.getStyle(this._scrollDiv, 'marginLeft')/2;
      } else {
        pos = - ol.ext.element.outerWidth(this._scrollDiv)/2 + ol.ext.element.getStyle(this._scrollDiv, 'marginLeft')/2;
      }
      break;
    }
    case 'end': {
      if (this.get('interval')) {
        pos = ol.ext.element.getStyle(this._intervalDiv, 'width')/2 - ol.ext.element.getStyle(this._scrollDiv, 'marginLeft')/2;
      } else {
        pos = ol.ext.element.outerWidth(this._scrollDiv)/2 - ol.ext.element.getStyle(this._scrollDiv, 'marginLeft')/2;
      }
      break;
    }
    default: {
      pos = 0;
      break;
    }
  }
  var d = (this._scrollDiv.scrollLeft + pos)/this._scale + this._minDate;
  return new Date(d);
};
/** Get the start date of the control
 * @return {Date}
 */
ol.control.Timeline.prototype.getStartDate = function() {
  return new Date(this.get('minDate'));
}
/** Get the end date of the control
 * @return {Date}
 */
ol.control.Timeline.prototype.getEndDate = function() {
  return new Date(this.get('maxDate'));
}

/*	Copyright (c) 2016 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A simple toggle control
 * The control can be created with an interaction to control its activation.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires change:active, change:disable
 * @param {Object=} options Control options.
 *  @param {String} options.className class of the control
 *  @param {String} options.title title of the control
 *  @param {String} options.html html to insert in the control
 *  @param {ol.interaction} options.interaction interaction associated with the control
 *  @param {bool} options.active the control is created active, default false
 *  @param {bool} options.disable the control is created disabled, default false
 *  @param {ol.control.Bar} options.bar a subbar associated with the control (drawn when active if control is nested in a ol.control.Bar)
 *  @param {bool} options.autoActive the control will activate when shown in an ol.control.Bar, default false
 *  @param {function} options.onToggle callback when control is clicked (or use change:active event)
 */
ol.control.Toggle = function(options) {
  options = options || {};
  var self = this;
  this.interaction_ = options.interaction;
  if (this.interaction_) {
    this.interaction_.setActive(options.active);
    this.interaction_.on("change:active", function() {
      self.setActive(self.interaction_.getActive());
    });
  }
  if (options.toggleFn) options.onToggle = options.toggleFn; // compat old version
  options.handleClick = function() {
    self.toggle();
    if (options.onToggle) options.onToggle.call(self, self.getActive());
  };
  options.className = (options.className||"") + " ol-toggle";
  ol.control.Button.call(this, options);
  this.set("title", options.title);
  this.set ("autoActivate", options.autoActivate);
  if (options.bar) {
    this.subbar_ = options.bar;
    this.subbar_.setTarget(this.element);
    this.subbar_.element.classList.add("ol-option-bar");
  }
  this.setActive (options.active);
  this.setDisable (options.disable);
};
ol.ext.inherits(ol.control.Toggle, ol.control.Button);
/**
 * Set the map instance the control is associated with
 * and add interaction attached to it to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol.control.Toggle.prototype.setMap = function(map) {
  if (!map && this.getMap()) {
    if (this.interaction_) {
      this.getMap().removeInteraction (this.interaction_);
    }
    if (this.subbar_) this.getMap().removeControl (this.subbar_);
  }
  ol.control.Control.prototype.setMap.call(this, map);
  if (map) {
    if (this.interaction_) map.addInteraction (this.interaction_);
    if (this.subbar_) map.addControl (this.subbar_);
  }
};
/** Get the subbar associated with a control
 * @return {ol.control.Bar}
 */
ol.control.Toggle.prototype.getSubBar = function () {
  return this.subbar_;
};
/**
 * Test if the control is disabled.
 * @return {bool}.
 * @api stable
 */
ol.control.Toggle.prototype.getDisable = function() {
  var button = this.element.querySelector("button");
  return button && button.disabled;
};
/** Disable the control. If disable, the control will be deactivated too.
* @param {bool} b disable (or enable) the control, default false (enable)
*/
ol.control.Toggle.prototype.setDisable = function(b) {
  if (this.getDisable()==b) return;
  this.element.querySelector("button").disabled = b;
  if (b && this.getActive()) this.setActive(false);
  this.dispatchEvent({ type:'change:disable', key:'disable', oldValue:!b, disable:b });
};
/**
 * Test if the control is active.
 * @return {bool}.
 * @api stable
 */
ol.control.Toggle.prototype.getActive = function() {
  return this.element.classList.contains("ol-active");
};
/** Toggle control state active/deactive
 */
ol.control.Toggle.prototype.toggle = function() {
  if (this.getActive()) this.setActive(false);
  else this.setActive(true);
};
/** Change control state
 * @param {bool} b activate or deactivate the control, default false
 */
ol.control.Toggle.prototype.setActive = function(b) {	
  if (this.interaction_) this.interaction_.setActive (b);
  if (this.subbar_) this.subbar_.setActive(b);
  if (this.getActive()===b) return;
  if (b) this.element.classList.add("ol-active");
  else this.element.classList.remove("ol-active");
  this.dispatchEvent({ type:'change:active', key:'active', oldValue:!b, active:b });
};
/** Set the control interaction
* @param {_ol_interaction_} i interaction to associate with the control
*/
ol.control.Toggle.prototype.setInteraction = function(i) {
  this.interaction_ = i;
};
/** Get the control interaction
* @return {_ol_interaction_} interaction associated with the control
*/
ol.control.Toggle.prototype.getInteraction = function() {
  return this.interaction_;
};

/*
  Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL license (http://www.cecill.info/).
*/
/** Feature animation base class
 * Use the {@link _ol_Map_#animateFeature} or {@link _ol_layer_Vector_#animateFeature} to animate a feature
 * on postcompose in a map or a layer
* @constructor
* @fires animationstart|animationend
* @param {ol.featureAnimationOptions} options
*	@param {Number} options.duration duration of the animation in ms, default 1000
*	@param {bool} options.revers revers the animation direction
*	@param {Number} options.repeat number of time to repeat the animation, default 0
*	@param {oo.style.Style} options.hiddenStyle a style to display the feature when playing the animation
*	  to be used to make the feature selectable when playing animation 
*	  (@see {@link ../examples/map.featureanimation.select.html}), default the feature 
*	  will be hidden when playing (and niot selectable)
*	@param {ol.easing.Function} options.fade an easing function used to fade in the feature, default none
*	@param {ol.easing.Function} options.easing an easing function for the animation, default ol.easing.linear
*/
ol.featureAnimation = function(options) {
  options = options || {};
  this.duration_ = typeof (options.duration)=='number' ? (options.duration>=0 ? options.duration : 0) : 1000;
  this.fade_ = typeof(options.fade) == 'function' ? options.fade : null;
  this.repeat_ = Number(options.repeat);
  var easing = typeof(options.easing) =='function' ? options.easing : ol.easing.linear;
  if (options.revers) this.easing_ = function(t) { return (1 - easing(t)); };
  else this.easing_ = easing;
  this.hiddenStyle = options.hiddenStyle;
  ol.Object.call(this);
};
ol.ext.inherits(ol.featureAnimation, ol.Object);
/** Draw a geometry 
* @param {olx.animateFeatureEvent} e
* @param {ol.geom} geom geometry for shadow
* @param {ol.geom} shadow geometry for shadow (ie. style with zIndex = -1)
* @private
*/
ol.featureAnimation.prototype.drawGeom_ = function (e, geom, shadow) {
  if (this.fade_) {
    e.context.globalAlpha = this.fade_(1-e.elapsed);
  }
  var style = e.style;
  for (var i=0; i<style.length; i++) {
    // Prevent crach if the style is not ready (image not loaded)
    try {
      var vectorContext = e.vectorContext || ol.render.getVectorContext(e);
      vectorContext.setStyle(style[i]);
      if (style[i].getZIndex()<0) vectorContext.drawGeometry(shadow||geom);
      else vectorContext.drawGeometry(geom);
    } catch(e) { /* ok */ }
  }
};
/** Function to perform manipulations onpostcompose. 
 * This function is called with an ol.featureAnimationEvent argument.
 * The function will be overridden by the child implementation.    
 * Return true to keep this function for the next frame, false to remove it.
 * @param {ol.featureAnimationEvent} e
 * @return {bool} true to continue animation.
 * @api 
 */
ol.featureAnimation.prototype.animate = function (/* e */) {
  return false;
};
/** An animation controler object an object to control animation with start, stop and isPlaying function.    
 * To be used with {@link olx.Map#animateFeature} or {@link ol.layer.Vector#animateFeature}
 * @typedef {Object} ol.animationControler
 * @property {function} start - start animation.
 * @property {function} stop - stop animation option arguments can be passed in animationend event.
 * @property {function} isPlaying - return true if animation is playing.
 */
/** Animate feature on a map
 * @function 
 * @fires animationstart, animationend
 * @param {ol.Feature} feature Feature to animate
 * @param {ol.featureAnimation|Array<ol.featureAnimation>} fanim the animation to play
 * @return {olx.animationControler} an object to control animation with start, stop and isPlaying function
 */
ol.Map.prototype.animateFeature = function(feature, fanim) {
  // Animate on last visible layer
  function animLayer(layers) {
    for (var l, i=layers.length-1; l=layers[i]; i--) {
      if (l.getVisible()) {
        if (l.getLayers) {
          if (animLayer(l.getLayers().getArray())) return true;
        } else {
          l.animateFeature(feature, fanim);
          return true;
        }
      }
    }
    return false;
  }
  animLayer(this.getLayers().getArray());
};
/** Animate feature on a vector layer 
 * @fires animationstart, animationend
 * @param {ol.Feature} feature Feature to animate
 * @param {ol.featureAnimation|Array<ol.featureAnimation>} fanim the animation to play
 * @param {boolean} useFilter use the filters of the layer
 * @return {olx.animationControler} an object to control animation with start, stop and isPlaying function
 */
ol.layer.Base.prototype.animateFeature = function(feature, fanim, useFilter) {
  var self = this;
  var listenerKey;
  // Save style
  var style = feature.getStyle();
  var flashStyle = style || (this.getStyleFunction ? this.getStyleFunction()(feature) : null);
  if (!flashStyle) flashStyle=[];
  if (!(flashStyle instanceof Array)) flashStyle = [flashStyle];
  // Structure pass for animating
  var event = {
    // Frame context
    vectorContext: null,
    frameState: null,
    start: 0,
    time: 0,
    elapsed: 0,
    extent: false,
    // Feature information
    feature: feature,
    geom: feature.getGeometry(),
    typeGeom: feature.getGeometry().getType(),
    bbox: feature.getGeometry().getExtent(),
    coord: ol.extent.getCenter(feature.getGeometry().getExtent()),
    style: flashStyle
  };
  if (!(fanim instanceof Array)) fanim = [fanim];
  // Remove null animations
  for (var i=fanim.length-1; i>=0; i--) {
    if (fanim[i].duration_===0) fanim.splice(i,1);
  }
  var nb=0, step = 0;
  // Filter availiable on the layer
  var filters = (useFilter && this.getFilters) ? this.getFilters() : [];
  function animate(e) {
    event.type = e.type;
    try {
      event.vectorContext = e.vectorContext || ol.render.getVectorContext(e);
    } catch(e) { /* nothing todo */ }
    event.frameState = e.frameState;
    if (!event.extent) {
      event.extent = e.frameState.extent;
      event.start = e.frameState.time;
      event.context = e.context;
    }
    event.time = e.frameState.time - event.start;
    event.elapsed = event.time / fanim[step].duration_;
    if (event.elapsed > 1) event.elapsed = 1;
    // Filter
    e.context.save();
    filters.forEach(function(f) {
      if (f.get('active')) f.precompose(e);
    });
    if (this.getOpacity) {
      e.context.globalAlpha = this.getOpacity();
    }
    // Stop animation?
    if (!fanim[step].animate(event)) {
      nb++;
      // Repeat animation
      if (nb < fanim[step].repeat_) {
        event.extent = false;
      } else if (step < fanim.length-1) {
        // newt step
        fanim[step].dispatchEvent({ type:'animationend', feature: feature });
        step++;
        nb=0;
        event.extent = false;
      } else {
        // the end
        stop();
      }
    }
    filters.forEach(function(f) {
      if (f.get('active')) f.postcompose(e);
    });
    e.context.restore();
    // tell OL3 to continue postcompose animation
    e.frameState.animate = true;
  }
  // Stop animation
  function stop(options) {
    ol.Observable.unByKey(listenerKey);
    listenerKey = null;
    feature.setStyle(style);
    // Send event
    var event = { type:'animationend', feature: feature };
    if (options) {
      for (var i in options) if (options.hasOwnProperty(i)) {
        event[i] = options[i]; 
      }
    }
    fanim[step].dispatchEvent(event);
    self.dispatchEvent(event);
  }
  // Launch animation
  function start(options) {
    if (fanim.length && !listenerKey) {
      listenerKey = self.on(['postcompose','postrender'], animate.bind(self));
      // map or layer?
      if (self.renderSync) self.renderSync();
      else self.changed();
      // Hide feature while animating
      feature.setStyle(fanim[step].hiddenStyle || new ol.style.Style({ image: new ol.style.Circle({}) }));
      // Send event
      var event = { type:'animationstart', feature: feature };
      if (options) {
        for (var i in options) if (options.hasOwnProperty(i)) {
          event[i] = options[i]; 
        }
      }
      fanim[step].dispatchEvent(event);
      self.dispatchEvent(event);
    }
  }
  start();
  // Return animation controler
  return {
    start: start,
    stop: stop,
    isPlaying: function() { return (!!listenerKey); }
  };
};

/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
*/
/** Bounce animation: 
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationBounceOptions} options
 *	@param {Integer} options.bounce number of bounce, default 3
 *	@param {Integer} options.amplitude bounce amplitude,default 40
 *	@param {ol.easing} options.easing easing used for decaying amplitude, use function(){return 0} for no decay, default ol.easing.linear
 *	@param {Integer} options.duration duration in ms, default 1000
 */
ol.featureAnimation.Bounce = function(options)
{	options = options || {};
	ol.featureAnimation.call(this, options);
	this.amplitude_ = options.amplitude || 40;
	this.bounce_ = -Math.PI*(options.bounce || 3);
}
ol.ext.inherits(ol.featureAnimation.Bounce, ol.featureAnimation);
/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Bounce.prototype.animate = function (e)
{	// Animate
	var flashGeom = e.geom.clone();
	/*
	var t = this.easing_(e.elapsed)
	t = Math.abs(Math.sin(this.bounce_*t)) * this.amplitude_ * (1-t) * e.frameState.viewState.resolution;
	*/
	var t = Math.abs(Math.sin(this.bounce_*e.elapsed)) * this.amplitude_ * (1-this.easing_(e.elapsed)) * e.frameState.viewState.resolution;
	flashGeom.translate(0, t);
	this.drawGeom_(e, flashGeom, e.geom);
	return (e.time <= this.duration_);
}

/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
*/
/** Drop animation: drop a feature on the map
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationDropOptions} options
 *  @param {Number} options.speed speed of the feature if 0 the duration parameter will be used instead, default 0
 *  @param {Number} options.side top or bottom, default top
 */
ol.featureAnimation.Drop = function(options)
{	options = options || {};
	this.speed_ = options.speed || 0;
	ol.featureAnimation.call(this, options);
	this.side_ = options.side || 'top';
}
ol.ext.inherits(ol.featureAnimation.Drop, ol.featureAnimation);
/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Drop.prototype.animate = function (e)
{	// First time > calculate duration / speed
	if (!e.time) 
	{	var angle = e.frameState.viewState.rotation;
		var s = e.frameState.size[1] * e.frameState.viewState.resolution;
		if (this.side_!='top') s *= -1;
		this.dx = -Math.sin(angle)*s;
		this.dy = Math.cos(angle)*s;
		if (this.speed_) 
		{	this.duration_ = s/this.speed_/e.frameState.viewState.resolution;
		}
	}
	// Animate
	var flashGeom = e.geom.clone();
	flashGeom.translate(
		this.dx*(1-this.easing_(e.elapsed)),  
		this.dy*(1-this.easing_(e.elapsed))
	);
	this.drawGeom_(e, flashGeom, e.geom);
	return (e.time <= this.duration_);
}

/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
*/
/** Fade animation: feature fade in
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationOptions} options
 */
ol.featureAnimation.Fade = function(options)
{	options = options || {};
	this.speed_ = options.speed || 0;
	ol.featureAnimation.call(this, options);
}
ol.ext.inherits(ol.featureAnimation.Fade, ol.featureAnimation);
/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Fade.prototype.animate = function (e)
{	e.context.globalAlpha = this.easing_(e.elapsed);
	this.drawGeom_(e, e.geom);
	return (e.time <= this.duration_);
}

/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
*/
/** Do nothing for a given duration
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationShowOptions} options
 * 
 */
ol.featureAnimation.None = function(options)
{	ol.featureAnimation.call(this, options);
};
ol.ext.inherits(ol.featureAnimation.None, ol.featureAnimation);
/** Animate: do nothing during the laps time
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.None.prototype.animate = function (e)
{	
	return (e.time <= this.duration_);
};

/*
  Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL license (http://www.cecill.info/).
*/
/** Do nothing 
 * @constructor
 * @extends {ol.featureAnimation}
 */
ol.featureAnimation.Null = function() {
  ol.featureAnimation.call(this, { duration:0 });
};
ol.ext.inherits(ol.featureAnimation.Null, ol.featureAnimation);

/*
	Copyright (c) 2016-2018 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
*/
/** Path animation: feature follow a path
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationPathOptions} options extend ol.featureAnimation options
 *  @param {Number} options.speed speed of the feature, if 0 the duration parameter will be used instead, default 0
 *  @param {Number|boolean} options.rotate rotate the symbol when following the path, true or the initial rotation, default false
 *  @param {ol.geom.LineString|ol.Feature} options.path the path to follow
 */
ol.featureAnimation.Path = function(options)
{	options = options || {};
	ol.featureAnimation.call(this, options);
	this.speed_ = options.speed || 0;
	this.path_ = options.path;
	switch (options.rotate) {
		case true: 
		case 0:
			this.rotate_ = 0;
			break;
		default:
			this.rotate_ = options.rotate || false;
			break;
	}
	if (this.path_ && this.path_.getGeometry) this.path_ = this.path_.getGeometry();
	if (this.path_ && this.path_.getLineString) this.path_ = this.path_.getLineString();
	if (this.path_.getLength)
	{	this.dist_ = this.path_.getLength()
		if (this.path_ && this.path_.getCoordinates) this.path_ = this.path_.getCoordinates();
	}
	else this.dist_ = 0;
	if (this.speed_>0) this.duration_ = this.dist_/this.speed_;
}
ol.ext.inherits(ol.featureAnimation.Path, ol.featureAnimation);
/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Path.prototype.animate = function (e)
{	// First time 
	if (!e.time) 
	{	if (!this.dist_) return false;
	}
	var dmax = this.dist_*this.easing_(e.elapsed);
	var p0, p, s, dx,dy, dl, d = 0;
	p = this.path_[0];
	// Linear interpol
	for (var i = 1; i<this.path_.length; i++)
	{	p0 = p;
		p = this.path_[i];
		dx = p[0]-p0[0];
		dy = p[1]-p0[1];
		dl = Math.sqrt(dx*dx+dy*dy);
		if (dl && d+dl>=dmax) 
		{	s = (dmax-d)/dl;
			p = [ p0[0] + (p[0]-p0[0])*s, p0[1] + (p[1]-p0[1])*s];
			break;
		}
		d += dl;
	}
	// Rotate symbols
	if (this.rotate_!==false) {
		var angle = this.rotate_ - Math.atan2(p0[1] - p[1], p0[0] - p[0]);
		for (var k=0; s=e.style[k]; k++) {
			if (s.getImage()) {
				s.getImage().setRotation(angle)
			}
		}
	}
	e.geom.setCoordinates(p);
	// Animate
	this.drawGeom_(e, e.geom);
	return (e.time <= this.duration_);
}

/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
*/
/** Shakee animation: 
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationShakeOptions} options
 *	@param {Integer} options.bounce number o bounds, default 6
 *	@param {Integer} options.amplitude amplitude of the animation, default 40
 *	@param {bool} options.horizontal shake horizontally default false (vertical)
 */
ol.featureAnimation.Shake = function(options)
{	options = options || {};
	ol.featureAnimation.call(this, options);
//	this.easing_ = options.easing_ || function(t){return (0.5+t)*t -0.5*t ;};
	this.amplitude_ = options.amplitude || 40;
	this.bounce_ = -Math.PI*(options.bounce || 6);
	this.horizontal_ = options.horizontal;
}
ol.ext.inherits(ol.featureAnimation.Shake, ol.featureAnimation);
/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Shake.prototype.animate = function (e)
{	// Animate
	var flashGeom = e.geom.clone();
	var shadow = e.geom.clone();
	var t = this.easing_(e.elapsed)
	t = Math.sin(this.bounce_*t) * this.amplitude_ * (1-t) * e.frameState.viewState.resolution;
	if (this.horizontal_) 
	{	flashGeom.translate(t, 0);
		shadow.translate(t, 0);
	}
	else flashGeom.translate(0, t);
	this.drawGeom_(e, flashGeom, shadow);
	return (e.time <= this.duration_);
}

/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
*/
/** Show an object for a given duration
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationOptions} options
 */
ol.featureAnimation.Show = function(options)
{	ol.featureAnimation.call(this, options);
}
ol.ext.inherits(ol.featureAnimation.Show, ol.featureAnimation);
/** Animate: just show the object during the laps time
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Show.prototype.animate = function (e)
{	
	this.drawGeom_(e, e.geom);
	return (e.time <= this.duration_);
}

/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
*/
/** Slice animation: feature enter from left
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationSlideOptions} options
 *  @param {Number} options.speed speed of the animation, if 0 the duration parameter will be used instead, default 0
 */
ol.featureAnimation.Slide = function(options)
{	options = options || {};
	this.speed_ = options.speed || 0;
	ol.featureAnimation.call(this, options);
	this.side_ = options.side || 'left';
}
ol.ext.inherits(ol.featureAnimation.Slide, ol.featureAnimation);
/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Slide.prototype.animate = function (e)
{	// First time > calculate duration / speed
	if (!e.time) 
	{	if (this.side_=='left') this.dx = (e.extent[0]-e.bbox[2])
		else this.dx = (e.extent[2]-e.bbox[0])
		if (this.speed_) this.duration_ = Math.abs(this.dx)/this.speed_/e.frameState.viewState.resolution;
	}
	// Animate
	var flashGeom = e.geom.clone();
	flashGeom.translate(this.dx*(1-this.easing_(e.elapsed)), 0);
	this.drawGeom_(e, flashGeom);
	return (e.time <= this.duration_);
}

/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
*/
/** Teleport a feature at a given place
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationOptions} options
 */
ol.featureAnimation.Teleport = function(options)
{	ol.featureAnimation.call(this, options);
}
ol.ext.inherits(ol.featureAnimation.Teleport, ol.featureAnimation);
/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Teleport.prototype.animate = function (e)
{	var sc = this.easing_(e.elapsed);
	if (sc)
	{	e.context.save()
			var ratio = e.frameState.pixelRatio;
			e.context.globalAlpha = sc;
			e.context.scale(sc,1/sc);
			var m = e.frameState.coordinateToPixelTransform;
			var dx = (1/sc-1) * ratio * (m[0]*e.coord[0] + m[1]*e.coord[1] +m[4]);
			var dy = (sc-1) * ratio * (m[2]*e.coord[0] + m[3]*e.coord[1] +m[5]);
			e.context.translate(dx,dy);
			this.drawGeom_(e, e.geom);
		e.context.restore()
	}
	return (e.time <= this.duration_);
}

/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
*/
/** Slice animation: feature enter from left
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationThrowOptions} options
 *  @param {left|right} options.side side of the animation, default left
 */
ol.featureAnimation.Throw = function(options)
{	options = options || {};
	ol.featureAnimation.call(this, options);
	this.speed_ = options.speed || 0;
	this.side_ = options.side || 'left';
}
ol.ext.inherits(ol.featureAnimation.Throw, ol.featureAnimation);
/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Throw.prototype.animate = function (e)
{	// First time > calculate duration / speed
	if (!e.time && this.speed_) 
	{	var dx, dy;
		if (this.side_=='left')
		{	dx = this.dx = e.extent[0]-e.bbox[2];
			dy = this.dy = e.extent[3]-e.bbox[1];
		}
		else
		{	dx = this.dx = e.extent[2]-e.bbox[0];
			dy = this.dy = e.extent[3]-e.bbox[1];
		}
		this.duration_ = Math.sqrt(dx*dx+dy*dy)/this.speed_/e.frameState.viewState.resolution;
	}
	// Animate
	var flashGeom = e.geom.clone();
	var shadow = e.geom.clone();
	flashGeom.translate(this.dx*(1-this.easing_(e.elapsed)), 
		this.dy*Math.cos(Math.PI/2*this.easing_(e.elapsed)));
	shadow.translate(this.dx*(1-this.easing_(e.elapsed)), 0);
	this.drawGeom_(e, flashGeom, shadow);
	return (e.time <= this.duration_);
}

/*
  Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL license (http://www.cecill.info/).
*/
/** Zoom animation: feature zoom in (for points)
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationZoomOptions} options
 *  @param {bool} options.zoomOut to zoom out
 */
ol.featureAnimation.Zoom = function(options){
  options = options || {};
  ol.featureAnimation.call(this, options);
  this.set('zoomout', options.zoomOut);
}
ol.ext.inherits(ol.featureAnimation.Zoom, ol.featureAnimation);
/** Zoom animation: feature zoom out (for points)
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationZoomOptions} options
 */
ol.featureAnimation.ZoomOut = function(options) {
  options = options || {};
  options.zoomOut = true;
  ol.featureAnimation.Zoom.call(this, options);
}
ol.ext.inherits(ol.featureAnimation.ZoomOut, ol.featureAnimation.Zoom);
/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Zoom.prototype.animate = function (e) {
  var fac = this.easing_(e.elapsed);
  if (fac) {
    if (this.get('zoomout')) fac  = 1/fac;
    var style = e.style;
    var i, imgs, sc=[]
    for (i=0; i<style.length; i++) {
      imgs = style[i].getImage();
      if (imgs) {
        sc[i] = imgs.getScale();
        // ol >= v6
        if (e.type==='postrender') imgs.setScale(sc[i]*fac/e.frameState.pixelRatio);
        else imgs.setScale(sc[i]*fac);
      }
    }
    this.drawGeom_(e, e.geom);
    for (i=0; i<style.length; i++) {
      imgs = style[i].getImage();
      if (imgs) imgs.setScale(sc[i]);
    }
  }
/*
  var sc = this.easing_(e.elapsed);
  if (sc)
  {	e.context.save()
    console.log(e)
      var ratio = e.frameState.pixelRatio;
      var m = e.frameState.coordinateToPixelTransform;
      var dx = (1/(sc)-1)* ratio * (m[0]*e.coord[0] + m[1]*e.coord[1] +m[4]);
      var dy = (1/(sc)-1)*ratio * (m[2]*e.coord[0] + m[3]*e.coord[1] +m[5]);
      e.context.scale(sc,sc);
      e.context.translate(dx,dy);
      this.drawGeom_(e, e.geom);
    e.context.restore()
  }
*/
  return (e.time <= this.duration_);
}

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/* Namespace */
ol.filter = {};
/**
 * @classdesc 
 * Abstract base class; normally only used for creating subclasses and not instantiated in apps.    
 * Used to create filters    
 * Use {@link _ol_Map_#addFilter}, {@link _ol_Map_#removeFilter} or {@link _ol_Map_#getFilters} to handle filters on a map.
 * Use {@link ol.layer.Base#addFilter}, {@link ol.layer.Base#removeFilter} or {@link ol.layer.Base#getFilters}
 * to handle filters on layers.
 *
 * @constructor
 * @extends {ol.Object}
 * @param {Object} options Extend {@link _ol_control_Control_} options.
 *  @param {boolean} [options.active]
 */
ol.filter.Base = function(options) {
  ol.Object.call(this);
  // Array of postcompose listener
  this._listener = [];
  if (options && options.active===false) this.set('active', false);
  else this.set('active', true);
};
ol.ext.inherits(ol.filter.Base, ol.Object);
/** Activate / deactivate filter
*	@param {boolean} b
*/
ol.filter.Base.prototype.setActive = function (b) {
  this.set('active', b===true);
};
/** Get filter active
*	@return {boolean}
*/
ol.filter.Base.prototype.getActive = function () {
  return this.get('active');
};
(function(){
/** Internal function
* @this {ol.filter} this the filter
* @private
*/
function precompose_(e) {
  if (this.get('active') && e.context) this.precompose(e);
}
/** Internal function
* @this {ol.filter} this the filter
* @private
*/
function postcompose_(e) {
  if (this.get('active') && e.context) this.postcompose(e);
}
/** Force filter redraw / Internal function
* @this {ol.Map|ol.layer.Layer} this: the map or layer the filter is added to
* @private
*/
function filterRedraw_() {
  if (this.renderSync) this.renderSync();
  else this.changed(); 
}
/** Add a filter to an ol object
* @this {ol.Map|ol.layer.Layer} this: the map or layer the filter is added to
* @private
*/
function addFilter_(filter) {
  if (!this.filters_) this.filters_ = [];
  this.filters_.push(filter);
  if (filter.precompose) filter._listener.push ( { listener: this.on(['precompose','prerender'], precompose_.bind(filter)), target: this });
  if (filter.postcompose) filter._listener.push ( { listener: this.on(['postcompose','postrender'], postcompose_.bind(filter)), target: this });
  filter._listener.push ( { listener: filter.on('propertychange', filterRedraw_.bind(this)), target: this });
  filterRedraw_.call (this);
}
/** Remove a filter to an ol object
* @this {ol.Map|ol.layer.Layer} this: the map or layer the filter is added to
* @private
*/
function removeFilter_(filter) {
  var i
  if (!this.filters_) this.filters_ = [];
  for (i=this.filters_.length-1; i>=0; i--) {
    if (this.filters_[i]===filter) this.filters_.splice(i,1);
  }
  for (i=filter._listener.length-1; i>=0; i--) {
    // Remove listener on this object
    if (filter._listener[i].target === this) {
      ol.Observable.unByKey(filter._listener[i].listener);
      filter._listener.splice(i,1);
    }
  }
  filterRedraw_.call (this);
}
/** Add a filter to an ol.Map
*	@param {ol.filter}
*/
ol.Map.prototype.addFilter = function (filter) {
  console.warn('[OL-EXT] addFilter deprecated on map.')
  addFilter_.call (this, filter);
};
/** Remove a filter to an ol.Map
*	@param {ol.filter}
*/
ol.Map.prototype.removeFilter = function (filter) {
  removeFilter_.call (this, filter);
};
/** Get filters associated with an ol.Map
*	@return {Array<ol.filter>}
*/
ol.Map.prototype.getFilters = function () {
  return this.filters_ || [];
};
/** Add a filter to an ol.Layer
*	@param {ol.filter}
*/
ol.layer.Base.prototype.addFilter = function (filter) {
  addFilter_.call (this, filter);
};
/** Remove a filter to an ol.Layer
*	@param {ol.filter}
*/
ol.layer.Base.prototype.removeFilter = function (filter) {
  removeFilter_.call (this, filter);
};
/** Get filters associated with an ol.Map
*	@return {Array<ol.filter>}
*/
ol.layer.Base.prototype.getFilters = function () {
  return this.filters_ || [];
};
})();

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Mask drawing using an ol.Feature
 * @constructor
 * @requires ol.filter
 * @extends {ol.filter.Base}
 * @param {Object} [options]
 *  @param {ol.Feature} [options.feature] feature to mask with
 *  @param {ol.style.Fill} [options.fill] style to fill with
 *  @param {boolean} [options.inner] mask inner, default false
 */
ol.filter.Mask = function(options) {
  options = options || {};
  ol.filter.Base.call(this, options);
  if (options.feature) {
    switch (options.feature.getGeometry().getType()) {
      case 'Polygon':
      case 'MultiPolygon':
        this.feature_ = options.feature;
        break;
      default: break;
    }
  }
  this.set('inner', options.inner);
  this.fillColor_ = options.fill ? ol.color.asString(options.fill.getColor()) || "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.2)";
}
ol.ext.inherits(ol.filter.Mask, ol.filter.Base);
/** Draw the feature into canvas */
ol.filter.Mask.prototype.drawFeaturePath_ = function(e, out) {
  var ctx = e.context;
  var canvas = ctx.canvas;
  var ratio = e.frameState.pixelRatio;
  console.log(ratio)
  // ol v6
  if (/render$/.test(e.type)) ratio = 1;
  // Transform
  var m = e.frameState.coordinateToPixelTransform;
  var tr = function(pt) {
    return [
      (pt[0]*m[0]+pt[1]*m[1]+m[4])*ratio,
      (pt[0]*m[2]+pt[1]*m[3]+m[5])*ratio
    ];
  }
  // Old ol version
  if (!m) {
    m = e.frameState.coordinateToPixelMatrix;
    tr = function(pt) {
      return [
        (pt[0]*m[0]+pt[1]*m[1]+m[12])*ratio,
        (pt[0]*m[4]+pt[1]*m[5]+m[13])*ratio
      ];
    }
  }
  // Geometry
  var ll = this.feature_.getGeometry().getCoordinates();
  if (this.feature_.getGeometry().getType()=="Polygon") ll = [ll];
  ctx.beginPath();
    if (out) {
      ctx.moveTo (0,0);
      ctx.lineTo (canvas.width, 0);
      ctx.lineTo (canvas.width, canvas.height);
      ctx.lineTo (0, canvas.height);
      ctx.lineTo (0, 0);
    }
    for (var l=0; l<ll.length; l++) {
      var c = ll[l];
      for (var i=0; i<c.length; i++) {
        var pt = tr(c[i][0]);
        ctx.moveTo (pt[0], pt[1]);
        for (var j=1; j<c[i].length; j++) {
          pt = tr(c[i][j]);
          ctx.lineTo (pt[0], pt[1]);
        }
      }
    }
}
ol.filter.Mask.prototype.postcompose = function(e) {
  if (!this.feature_) return;
  var ctx = e.context;
  ctx.save();
    this.drawFeaturePath_(e, !this.get("inner"));
    ctx.fillStyle = this.fillColor_;
    ctx.fill("evenodd");
  ctx.restore();
}

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Clip layer or map
*  @constructor
* @requires ol.filter
* @extends {ol.filter.Base}
* @param {Object} [options]
*  @param {Array<ol.Coordinate>} [options.coords]
*  @param {ol.Extent} [options.extent]
*  @param {string} [options.units] coords units percent (%) or pixel (px)
*  @param {boolean} [options.keepAspectRatio] keep aspect ratio
*  @param {string} [options.color] backgroundcolor
*/
ol.filter.Clip = function(options)
{	options = options || {};
	ol.filter.Base.call(this, options);
	this.set("coords", options.coords);
	this.set("units", options.units);
	this.set("keepAspectRatio", options.keepAspectRatio);
	this.set("extent", options.extent || [0,0,1,1]);
	this.set("color", options.color);
	if (!options.extent && options.units!="%" && options.coords)
	{	var xmin = Infinity;
		var ymin = Infinity;
		var xmax = -Infinity;
		var ymax = -Infinity;
		for (var i=0, p; p=options.coords[i]; i++)
		{	if (xmin > p[0]) xmin = p[0];
			if (xmax < p[0]) xmax = p[0];
			if (ymin > p[1]) ymin = p[1];
			if (ymax < p[1]) ymax = p[1];
		}
		options.extent = [xmin,ymin,xmax,ymax];
	}
}
ol.ext.inherits(ol.filter.Clip, ol.filter.Base);
ol.filter.Clip.prototype.clipPath_ = function(e)
{	var ctx = e.context;
	var canvas = ctx.canvas;
	var coords = this.get("coords");
	if (!coords) return;
	var ex = this.get('extent');
	var scx = 1, scy = 1;
	if (this.get("units")=="%") 
	{	scx = canvas.width/(ex[2]-ex[0]);
		scy = canvas.height/(ex[3]-ex[1]);
	}
	if (this.get("keepAspectRatio")) 
	{	scx = scy = Math.min (scx, scy);
	}
	var pos = this.get('position');
	var dx=0, dy=0;
	if (/left/.test(pos)) 
	{	dx = -ex[0]*scx;
	}
	else if (/center/.test(pos)) 
	{	dx = canvas.width/2 - (ex[2]-ex[0])*scx/2;
	}
	else if (/right/.test(pos)) 
	{	dx = canvas.width - (ex[2]-ex[0])*scx;
	}
	var fx = function(x) { return x*scx + dx };
	if (/top/.test(pos)) 
	{	dy = -ex[1]*scy;
	}
	else if (/middle/.test(pos)) 
	{	dy = canvas.height/2 - (ex[3]-ex[1])*scy/2;
	}
	else if (/bottom/.test(pos)) 
	{	dy = canvas.height - (ex[3]-ex[1])*scy;
	}
	var fy = function(y) { return y*scy + dy; };
	ctx.moveTo ( fx(coords[0][0]), fy(coords[0][1]) );
	for (var i=1, p; p=coords[i]; i++) 
	{	ctx.lineTo ( fx(p[0]), fy(p[1]) );
	}
	ctx.lineTo ( fx(coords[0][0]), fy(coords[0][1]) );
};
ol.filter.Clip.prototype.precompose = function(e)
{	if (!this.get("color"))
	{	e.context.save();
		e.context.beginPath();
		this.clipPath_(e);
		e.context.clip();
	}
}
ol.filter.Clip.prototype.postcompose = function(e)
{	if (this.get("color"))
	{	var ctx = e.context;
		var canvas = e.context.canvas;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(0,canvas.height);
		ctx.lineTo(canvas.width, canvas.height);
		ctx.lineTo(canvas.width, canvas.height);
		ctx.lineTo(canvas.width, 0);
		ctx.lineTo(0, 0);
		this.clipPath_(e);
		ctx.fillStyle = this.get("color");
		ctx.fill("evenodd");
	}
	e.context.restore();
}

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** @typedef {Object} FilterColorizeOptions
 *  @property {ol.Color} color style to fill with
 *  @property {string} operation 'enhance' or a CanvasRenderingContext2D.globalCompositeOperation
 *  @property {number} value a [0-1] value to modify the effect value
 *  @property {boolean} inner mask inner, default false
 */
/** Colorize map or layer
 * @constructor
 * @requires ol.filter
 * @extends {ol.filter.Base}
 * @author Thomas Tilak https://github.com/thhomas
 * @author Jean-Marc Viglino https://github.com/viglino
 * @param {FilterColorizeOptions} options
 */
ol.filter.Colorize = function(options)
{	ol.filter.Base.call(this, options);
	this.setFilter(options);
}
ol.ext.inherits(ol.filter.Colorize, ol.filter.Base);
/** Set options to the filter
 * @param {FilterColorizeOptions} [options]
 */
ol.filter.Colorize.prototype.setFilter = function(options)
{	options = options || {};
	switch (options)
	{	case "grayscale": options = { operation:'hue', red:0, green:0, blue:0, value:1 }; break;
		case "invert": options = { operation:'difference', red:255, green:255, blue:255, value:1 }; break;
		case "sepia": options = { operation:'color', red:153, green:102, blue:51, value:0.6 }; break;
		default: break;
	}
	var color = options.color ? ol.color.asArray(options.color) : [ options.red, options.green, options.blue, options.value];
	this.set('color', ol.color.asString(color))
	this.set ('value', color[3]||1);
	var v;
	switch (options.operation)
	{	case 'color':
		case 'hue':
		case 'difference':
		case 'color-dodge':
		case 'enhance':
			this.set ('operation', options.operation);
			break;
		case 'saturation':
			v = 255*(options.value || 0);
			this.set('color', ol.color.asString([0,0,v,v||1]));
			this.set ('operation', options.operation);
			break;
		case 'luminosity':
			v = 255*(options.value || 0);
			this.set('color', ol.color.asString([v,v,v,255]));
			//this.set ('operation', 'luminosity')
			this.set ('operation', 'hard-light');
			break;
		case 'contrast':
			v = 255*(options.value || 0);
			this.set('color', ol.color.asString([v,v,v,255]));
			this.set('operation', 'soft-light');
			break;
		default: 
			this.set ('operation', 'color');
			break;
	}
}
/** Set the filter value
 *  @param {ol.Color} options.color style to fill with
 */
ol.filter.Colorize.prototype.setValue = function(v)
{	this.set ('value', v);
	var c = ol.color.asArray(this.get("color"));
	c[3] = v;
	this.set("color", ol.color.asString(c));
}
/** Set the color value
 *  @param {number} options.value a [0-1] value to modify the effect value
 */
ol.filter.Colorize.prototype.setColor = function(c)
{	c = ol.color.asArray(c);
	if (c)
	{	c[3] = this.get("value");
		this.set("color", ol.color.asString(c));
	}
}
/** @private 
 */
ol.filter.Colorize.prototype.precompose = function(/* e */) {
}
/** @private 
 */
ol.filter.Colorize.prototype.postcompose = function(e) {
	// Set back color hue
	var ctx = e.context;
	var canvas = ctx.canvas;
	ctx.save();
		if (this.get('operation')=='enhance')
		{	var v = this.get('value');
			if (v)
			{	var w = canvas.width;
				var h = canvas.height;
				ctx.globalCompositeOperation = 'color-burn'
				ctx.globalAlpha = v;
				ctx.drawImage (canvas, 0, 0, w, h);
				ctx.drawImage (canvas, 0, 0, w, h);
				ctx.drawImage (canvas, 0, 0, w, h);
			}
		}
		else
		{	ctx.globalCompositeOperation = this.get('operation');
			ctx.fillStyle = this.get('color');
			ctx.fillRect(0,0,canvas.width,canvas.height);  
		}
	ctx.restore();
}

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Colorize map or layer
* @constructor
* @requires ol.filter
* @extends {ol.filter.Base}
* @param {Object} options
*   @param {string} options.operation composite operation
*/
ol.filter.Composite = function(options)
{	ol.filter.Base.call(this, options);
	this.set("operation", options.operation || "source-over");
}
ol.ext.inherits(ol.filter.Composite, ol.filter.Base);
/** Change the current operation
*	@param {string} operation composite function
*/
ol.filter.Composite.prototype.setOperation = function(operation)
{	this.set('operation', operation || "source-over");
}
ol.filter.Composite.prototype.precompose = function(e)
{	var ctx = e.context;
	ctx.save();
	ctx.globalCompositeOperation = this.get('operation');
}
ol.filter.Composite.prototype.postcompose = function(e)
{	e.context.restore();
}

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Crop drawing using an ol.Feature
* @constructor
* @requires ol.filter
* @requires ol.filter.Mask
* @extends {ol.filter.Mask}
* @param {Object} [options]
*  @param {ol.Feature} [options.feature] feature to crop with
*  @param {boolean} [options.inner=false] mask inner, default false
*/
ol.filter.Crop = function(options) {
  options = options || {};
  ol.filter.Mask.call(this, options);
}
ol.ext.inherits(ol.filter.Crop, ol.filter.Mask);
ol.filter.Crop.prototype.precompose = function(e) {
  if (this.feature_) {
    var ctx = e.context;
    ctx.save();
      this.drawFeaturePath_(e, this.get("inner"));
      ctx.clip("evenodd");
  }
}
ol.filter.Crop.prototype.postcompose = function(e) {
  if (this.feature_) e.context.restore();
}

/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Fold filer map
 * @constructor
 * @requires ol.filter
 * @extends {ol.filter.Base}
 * @param {Object} [options]
 *  @param {Array<number>} [options.fold] number of fold (horizontal and vertical)
 *  @param {number} [options.margin] margin in px, default 8
 *  @param {number} [options.padding] padding in px, default 8
 *  @param {number|number[]} [options.fsize] fold size in px, default 8,10
 *  @param {boolean} [options.fill] true to fill the background, default false
 *  @param {boolean} [options.shadow] true to display shadow, default true
 */
ol.filter.Fold = function(options) {
  options = options || {};
  ol.filter.Base.call(this, options);
  this.set('fold', options.fold || [8,4]);
  this.set('margin', options.margin || 8);
  this.set('padding', options.padding || 8);
  if (typeof options.fsize == 'number') options.fsize = [options.fsize,options.fsize];
  this.set('fsize', options.fsize || [8,10]);
  this.set('fill', options.fill);
  this.set('shadow', options.shadow!==false);
};
ol.ext.inherits(ol.filter.Fold, ol.filter.Base);
ol.filter.Fold.prototype.drawLine_ = function(ctx, d, m) {
  var canvas = ctx.canvas;
  var fold = this.get("fold");
  var w = canvas.width;
  var h = canvas.height;
  var x, y, i;
  ctx.beginPath();
  ctx.moveTo ( m, m );
  for (i=1; i<=fold[0]; i++) {
    x = i*w/fold[0] - (i==fold[0] ? m : 0);
    y =  d[1]*(i%2) +m;
    ctx.lineTo ( x, y );
  }
  for (i=1; i<=fold[1]; i++) {
    x = w - d[0]*(i%2) - m;
    y = i*h/fold[1] - (i==fold[1] ? d[0]*(fold[0]%2) + m : 0);
    ctx.lineTo ( x, y );
  }
  for (i=fold[0]; i>0; i--) {
    x = i*w/fold[0] - (i==fold[0] ? d[0]*(fold[1]%2) + m : 0);
    y = h - d[1]*(i%2) -m;
    ctx.lineTo ( x, y );
  }
  for (i=fold[1]; i>0; i--) {
    x = d[0]*(i%2) + m;
    y = i*h/fold[1] - (i==fold[1] ? m : 0);
    ctx.lineTo ( x, y );
  }
  ctx.closePath();
};
ol.filter.Fold.prototype.precompose = function(e) {
  var ctx = e.context;
  ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    this.drawLine_(ctx, this.get("fsize"), this.get("margin"));
    ctx.fillStyle="#fff";
    if (this.get('fill')) ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.stroke();
  ctx.restore();
  ctx.save();
    this.drawLine_(ctx, this.get("fsize"), this.get("margin") + this.get("padding"));
    ctx.clip();
};
ol.filter.Fold.prototype.postcompose = function(e) {
  var ctx = e.context;
  var canvas = ctx.canvas;
  ctx.restore();
  ctx.save();
    this.drawLine_(ctx, this.get("fsize"), this.get("margin"));
    ctx.clip();
    if (this.get('shadow')) {
      var fold = this.get("fold");
      var w = canvas.width/fold[0];
      var h = canvas.height/fold[1];
      var grd = ctx.createRadialGradient(5*w/8,5*w/8,w/4,w/2,w/2,w);
      grd.addColorStop(0,"transparent");
      grd.addColorStop(1,"rgba(0,0,0,0.2)");
      ctx.fillStyle = grd;
      ctx.scale (1,h/w);
      for (var i=0; i<fold[0]; i++) for (var j=0; j<fold[1]; j++) {
        ctx.save()
        ctx.translate(i*w, j*w);
        ctx.fillRect(0,0,w,w);
        ctx.restore()
      }
    }
  ctx.restore();
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Make a map or layer look like made of a set of Lego bricks.
 *  @constructor
 * @requires ol.filter
 * @extends {ol.filter.Base}
 * @param {Object} [options]
 *  @param {string} [options.img]
 *  @param {number} [options.brickSize] size of te brick, default 30
 *  @param {null | string | undefined} [options.crossOrigin] crossOrigin attribute for loaded images.
 */
ol.filter.Lego = function(options) {
  if (!options) options = {};
  ol.filter.Base.call(this, options);
  var img = new Image();
  // Default image
  img.src = this.img[options.img] || this.img.ol3;
  img.crossOrigin = options.crossOrigin || null;
  // and pattern 
  this.pattern = {
    canvas: document.createElement('canvas')
  };
  this.setBrick (options.brickSize, img);
  this.internal_ = document.createElement('canvas');
}
ol.ext.inherits(ol.filter.Lego, ol.filter.Base);
/** Image definition
*/
ol.filter.Lego.prototype.img = {
  brick: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAAnNCSVQICFXsRgQAAAAJcEhZcwAAD10AAA9dAah0GUAAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAGAElEQVRo3sWZy4tkVx3HP+fcc29Vd1dP17TdTcbJPDKPMGR0kVEZkuBCF0EE9Z8QXLhxMUsRF4oLwYWQTSCgSxUXroQhoiEuskgEUUQh+BhHOpkZO11dr3vvefxc3FPlNHNvPbrD1Dl016XoqvM539/znFbcZo3VjbFmxcMA3Mg2fSoAiQJDov7/B1o9+aEgkycv4PBSPU9eHeDEixNwOAFXPYvFia0+rcnQEeBr218cfLIwCqW1UWillEYphUKpCmCCIQAiCEhAJIggTiSISBAfggTvJZTifQghWO+89cOQexuOXN8Pwz/9ff9X/xF0uEA7AmTsjLp/2xZQCgXHlj0OEBEAeRwGkep3qN6pfibDB3DBixMnvdCXt8J3FZowNYFSjgv71RtPaehjD0alalVOqCtHU3qlAGrVAGbidCtUYLUAiV6dCUx8XV4BhUKjY0AJgUB4LE8sA7CkCRSalFYnE72WiBrLSCKCp6TALZNRDEDCwgAKQ/vyRidN9c32K1sbqlCP/C+P9kXJI597PA7HkGJRCLNUGCY767udF9e+9dz1S5ueoRzIEZa1OxcK9td+/fAHvYH0LY6MkgHFIuYwS0ifXe1+qXvn1vk99QfzCwokToUylPrre1/de/vMnf9+5MsSg2HMELegAsl86duvnP3e8y/f1r83v8Li1RO7k/9c2t/avHnt27xpyhRDguEIuxDA3OXXX93+8a0rz6ZvcKgadqUEL73wx+9sb5//WWKTGCOHsxEWM0H71e2ffmF3lPyEkZppVyVYefCw/9a5f3epSvsWh7MMsUgeaL20/dpLu4fJXZUvFCgi46/8i5RNFCCc4bA5JuZ7f/Kp7g9fuLSdvLnY8lEHxz8ItOPcaN7gPAB1tvPl7udupT9nvGSmLLlHSosWLdbJTgpgLna+eVv9hiO1ZIpFOGBEFmejBnrO/tc/0znXTf+sHMuPwD0MrSnETID6/SXPrH/junp3Xiw3atCjxJCRktKu10DHzrZ+pOvpc5cP/6T8CWtt4BATZ4tkBoCvTz8tbTb8TnHiYi/0pgCmPufMUkB1ss9vtU7Trgt9EgyGhIS0zgjRB6RukaSdfHpLPly2xTg2chQJmgRN2qiAa3DBtu5kYXgqAIFYEzTJDAVCnQIqaA+O0wyFjj8q1oY6AB/qd5nLw9JvcpqOOcFMT5dqlg/UAoy5exS2TgGg6DxhkHofqHVCGYf3ho/S904DcHZ6jpZ6lWMY1iogCDxsn8oDduP3BEI9QvSBWgU8YRDeGezsyEk1SNlD8HF51wjQoEAgHNkffXBw+XfJiZbXXCTBT2fZaAJfn4iEEt+z73bTk92jZTxPwOFxVCeGRif0tt4HCtxB+f0P7l//rTlBAN6gjcNicThcfU2NCnjf0NU43L59vf2XZf1A8wzX8JRTgLw+Ckx17SahIZGOyMri7dHalXf6DJdYfovPAgVlRLAzAXwI0gCQU5La8m6SXeH9pi+pWf5lUooIUFKSN6V0A1AE39RyeAYYEpvYNjf4OwP8XNuf50UycnKKKURjSTMALkjzzgpyEhI0LW7ygHvYRh00G7zARQL5dBYU9JtLWvQB52e0VX0MOl5anmOP+3yIjZldpteZijZXuIbBxZ1PAEbkc05GVspZtnX04hlHEDKucpUePYbklCgyNjjDLp9AERhjKSNAQc6IwSzPMQClt37OIeOQ7vQWxJPSZSf2OZMyK1h8jHsbNSgY0Z/tNRWA2HmuVXLIZsxnliw2mROAyR2Rjwmn8vyC0XynrUwQ3PzGs6QX06rDRgD9GIDEjF9pUFLSXyRsowLFIp2/44icDpZ02umq6S3ZxDwupp3hYs1cVMAu1noLBZaMNbJoAD3tl6prOodnTF5feBoBRmGweO8fyClISMlIowkkApRYyqbeZ5YJQrHc4UNieeGYArL8NeUkFcvgJKc/AU56ajxejod+/DT/W/IkQC4P3GoBwoGsFKAf9v2qAGIxej9MU8rTGdNjWtVsJv315aL3YwDYqG5MTDxAPMvTNkJS3ReY6AmtlTrhKsf/AHgAA6ezGE+FAAAAAElFTkSuQmCC",
  ol3: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAAnNCSVQICFXsRgQAAAAJcEhZcwAAD10AAA9dAah0GUAAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAHtUlEQVRo3sWZTWxcVxXHf/d9zIztcTz+pE6cOHXiyLJJadKgKE2oCBLlQwIWSCxYI0WiGxZZIYRAArFAYoEEi0hIsGBBURd0g4iK2lJAaWlaojZVKkU0H26cxB8Zz/f7uPeweHdebDLPnqlQ5l2N5/mN7tz/+Z//OffcM4rPUKCPl0eBAqqfAEAt5Ia1LwCuAg93CyCnAzgj7TstEKMluW+/x0AsWmKBmFggTu4lIpYome2Qw0kA8I2xL9T2Bp5COY6ncJRSDkopFEolANowBEAEATGIGBEkFjEiYkQbI0ZrMaFobYwxkY51pOumpSNTiau6bm7oZX1NP4Ai+ylYADkmGqUPxwSUQsG2ZbcDsBAA2QoGkeSvSZ4kr/alDcRGSyyxbJqqvG5+pHAwbRegVMz+leTBY7qcbTee8vsmQycRmnL6CkD1G4DXFl0fGegvANfpnws8+947AwqFg2MDSjAYzJY80QuAHl2gcPDJF3PiDLiimtIQC0ETEhD3klE8AJeuASg8CgeHir7vLBVOjwypQK3plyoromRNtzSamJg6QbcgvJ7C0J0YnCweG/jek/Ozw5q6bEiFiIHz+wNWBv68+rPNmlQjYnKE1Ai6cYfXA/W5Q6Uvl84f3zel3vH+SIDYoVAeofOdqa9PvbHn/PoDHYZ4eDSpE3fJgLs79YXToz858uxJ5+/en4jQ6hHr5OPZlZHhpcM/4BUv9PFw8agQdQVg1+UHnx/75fG5Gf83lFWGVUrQsmmu/HBsbN8f3Mi1MVLeGUJ3Lig8P/a7s5MN97c01I5+VUIk91err0/fLqFwgBHKOzmimzyQPzX2q1OTZfeianUVKCLNr93EZxiFIOyhnB0Tu6vf/XTp54uzY+4r3S1veYj5CEPBjqFsA3cDoEaLXy199rj/Is0eM2XILXzy5MkzSO6TAvAOFF84qf5KRfWYYhE2aJCzI5MDbxf7B58pTpf89x8qX1yWGKXKFaUBZIF1tWo/KzJPiYi3VAgYbrFEnpiYiBzBTgx0ts99YvDcvHr7YSBJka/Q4k1u3jz5eQ/EYebkXvL241NUeZN/31gkDwibhHjk8PGzTh+OrWw7X/6g/+TB8nuJrQCc4Z/KU08rb+1f/1gCSqy9NUNoP72txtXRb40dfJ+nkgMEZTw78riZLhDRndNP3vGG9GBKnRzhrppmilfhmcWoRYkxyuxv86euUaT24h4W2WN53WQmheB1ygc7MaCKuc+N5LeW6wfOXeUorwFQZIV5RlnbNqcGjBMyaAFUcfHwcHHxOznBakA6JQq34B4dkXtt+8QjvnCQa/Z/jxpFCmdbpPSJI7NyhMVzK/j2UQuFi4OLkz57FECcIcGCU8yZeirQvdxjjuvpTKGAem2EcjpjkjnUC5cvfIm/bRG3Y4e7AwOmEwPKOJotfhvlPj61dGaBEChtAdD88Yeq9et1LqWOUTj2lYzOItSmcxi2ZDXUw+k0n0bqDoXDJBsMM8rHKeIKFbxgIV9nL3cSFlPpZQBoa6AjgCYXK2YkndbckkxmWWfu2D00ozzYNinOlagwbRct/k92zNJARxFK01yur/mX2wDWGE0jfuHyNfa+Y6hQYNsmJQ45hqwwFaPpOVo6s2zDsCMDgsBq2sBR9xj8ZvX70+LJc9w+scA1Sjz49rjMy7zMywE5IY64PMcNDlkHKCbt9xhMZwhOooGODGhMzVyqTUxIm4Pll9797ixnWFZ3WORdSqz//hI+Pv7LT5dXOcNZltUa49y3qplC0Hb5uBMAbwcGDKYS/eLu6YMfrSZCUhWY+QCfGZ7iZYRbarSdYMfd0bvXazh8ii/yF2vcAVwitB1hZirWnROREFLYjN4uLQ5QTZ/WmeA2VwDUHbBks351HRxK3OaqtTTHEQwxmpjkxJApQh111kBAvBH+9O7y/KveFsfcYyNj82qywqZdxmWBAjEREbHdkrNEqNE6o6qJiVeiC4UPHuqg20PvExxGE6YAWp2jwEvabmIyqpoGuTB4ozEwd6lKvYflRzgBBIQWQrQjAG2MZABoEeJH4UU3N8f1rC/psPyz+AQWQEhIK6s09wACk+EC0NTwcCM3KrDAf6ihd6ui2ccxcrRoEaQg6lnQPYDYSLZlAS1cXBzyLHGfW0SZPDgMscgBDK10BARUs48mVgNxtl2GKh6ObVpOM8Uy94hsZpe0nakoMMdhPGJreRtAg9YuJ6NIwp18G7OJsilVyHGIQ2yySZ0WIYocQ+xhknEUhiYRoQUQ0KJBbSfleAChjvQuh4wypbQLovEpMWHrnPY2K0RoG/eR5SCgQXVn1SQAJNpNWiFlhm0+i8jZIrMNoN0j0jbhJMoPaOwu2sQFJt69oRKyadNqTGQBOFsAiM34CQchIdVuwtYyEOgu4jumQosiEX5a6aq0S9Z2T2zTThfdkS0MRN21lISAiBwD5KwDnLReStp0MZomrc4bTyaAhql131gztAhw8cnhWxeIBRASEWbVPju5wAS9/VYgdnthGwPSe5uynYqlpun9EuCTzHt0O67r5uP8teRRAC25H/cXgNmQvgKomhXdLwB2M7pu0pTyeK70mJYUm251sLfo/T8AGEoKes8eIGZ43E5wk36BBwhO2mbqgwZa9C0CAP4LFLGzNDDzmrAAAAAASUVORK5CYII=",
  lego: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAA/CAQAAAD9VthUAAAAAnNCSVQICFXsRgQAAAAJcEhZcwAADzoAAA86AZc528IAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAHvElEQVRYw8WZWWxcVxnHf+fec2fGu+M4qbPH2EmTLk4FApqQNrgiVYyKeClIwBsvPCAQkZAQPND2gRekCoGQEItYHhBLurCksoTKA6QNJW0CBZLWCc3qEBvHy3hsz93O+XiYMxM7nhmPGxGf++Dre2fO7/v+5/u+s4zigzSxVq3osaZNAwzkuq1nPeUrAE9p99JTAKWn5WYEwErpv9TdGbECRlKMgBEjRlIgsqlAKBBaSKUokAjgkcFz+Ce6BvM9sVbKU55WKKWUh1IeoJQCFhsgIIIgIohYEWwq1ooVK9ZasdbG1hhrjUmMsYlZsJEJzYIpmLwZs/8xZ9JpaGYHOYfPyvrChrdbpAxbjFRltCqhnQ2yxBTKf0WQUgNrwYqIFStGUkkllqIU5E/2aQBbEV8pz/ZM3Or8/95UmeUB+J63RiHoAWi1ZHTvNl6pNfXe99Taeq/W1HvuYOzvKG5c4q1afIWHj4eHBwgWwWCQ1aWvBvC8VXngE5DbmO3UxrOeqEhmTFEcPiIiadwEfVttWxmd623tyu7Mfnrjru5cM0Th+Nyp2Z/MztvJNDLkSImZJ27MhNWIr8j1tn+g9at7+/ubivaSHYkmjPF1f+sj7Uc3Xc29VPjm1JSJEzJkCZkjaVT8hvzubDvQ8cz9AwPeG/rHFD3BZkoeTqLwCuqzrQf7nw9+UJhOidEEFAhX0sCJr1fyXm/uPLr5849n/u1/j3mMWtqtYEFm5v/2pXUHdhzNjgaxzunQQzNX3wDdWIT0dT3bP3Qo8wIXSVWNDpWQys2xmW/3fbn1WpAWXUrWNaARvN+/7lu7jzysf8q4siuEh5A8fX5/+8XepLyEs8zfCd7raP/K9scf1T9iQjUUzU+JynOR3TQBgpAS1a16dVtusONTH8kc42ZjcFFKEApcJyBHjizt+O8Wr3e2P7Uv+3curyT7InhJ8nFCMmTJkqWlVlnzVsj0psc69vbrV1SyKnjJgCsEZMiQoanWINcfe39v6xfv808Suu6f5EVlQA7QAcC/1DXp42GmuazOiaJbjjDFSTUNCLOEZMiQEJAjrZYB9b0PmoPe7fpNZQAkYFb1A9CphtWwGlbNkmX/R59TpzhPAAwdf37XKWac1JZJAnc1VSfp0ufSqtK3NT/Y3DJVKZ5tYbHiwfvJAjc5dO7Pw4cZOb4vc51ccvZjh7ZfubaTC8y4evgeAjQaTYCpgZfq06TXpD++Rd6hHHTdZ8JKDs8yAsAD92/gjxSfGNvYzp7Wt3nj6sS2D5NxtXAeHNwnIFpOqSe+bg+2d6ejFXzXS8WlJUSyhBiKoAqj1yFuYQLQZCvFOMLDx8evPFuOF7HV0sqzXmsuP1mJ5tbfVirYc++VITnItvyN8rhJjqIrL7qS50KCX1mWeLXFr5Z02nqiJ2+lXOasIQHJkD75C6DjtQ8dH6Eg99FHyD+LBRclaomnqgL3lo++w4utWsBVbNYtr1htYZFBZgm2299Z5rmXl4+ZtwaPjDlt9CJ0gIeqXNXFN7WKDtMLnW1y+9e6Txc5z2le25Te0BTVic89ovf3yIXE1QeP4FbJbmCla21V723evjklncued/0mZA6AcEABfH/6rXzb2IM5fJD1zLvIB02zm3ak+iK0hK8mvmBnzA/Hoy3LJoyW4XIITn5daAbaX0w3XBnIIsCBL7zDpFNvPWoRvBY+larBZ5Gb6eX20xXxf/2QDMkgmc+sl8MyJH2cf/Seka3yGFv+kR7Ok/1riwxhvruJUYffhGCxWKS0IqqReFXFN5g583qaNokC0aSf/JUaVn95ufNrJ9SwGlapMkkUXuPMAy/E24CJbQVeVWeIXDAFbEYwWCymes3XAMZW9d5gC8k3Rn++79hJjErvvcBB0P53/sBBAOa5knmdnWwlywlQZ7mHfQivOsd6yVDEkGIwxDVrfo2yY4nJ5tMTLe9rkYKSkUtcEqXk9/DKok9d5nLlfpzxyn0Tu7Gk7jLVNx8eQFw98oUi6Vz07NiZ3c/4y+bz+i1gHxliEhJnQFKn6MbVu01ISRaSX2b8vk/4q4D77GErCTGxM2EBW1P8pLr4YJkjiKORhZ91hR1qpsG9m89O9pASOXxMXF6wrCb0ACIidBJe8ZNdjHID24DsA/RhCImInAnztQqr897UeI1lDp3ToU8TO2jiat39q0cLD7GJlNBdERFhLd8dPjamtldx98K8dhNGD91cZ6zKPl6hyNJPP5rYIcsGFGprVva+Nl4GF455lVzI0UcvU0ySX7R5aKabHnrwMRSJlhiQr7fT1QCprYPnmKHgzjQtliwZNrIZHyHBkHHLSMG4KI+JK6Lna+9wFuETUzecLAUHN6QkBARofHwCFImr6Mbld+Lw0Upwhy/acKWUMswS07YI77tllHJTqsW4t4lLtcLKBwyl0JN05YQSiqS0knW+a7eGu4W3rrgmJMwRNpCkLvRsaBoqKAkzZGgi66S/HV+Sf4GQxvor4xPbYDkVIuLS2RZ6CV4wRMQkNNpXGb9go1V8BSElJXRrWIXCupM9We2hvMPPG1bbaqxf3sWhamTzhjVpHsCc/a9dQ3xo82uJL9jRNRLfTTnnBO+u/pTkLT5c8fPNd9nt5tLmRbsVynbsXR704Bbeq775v0uht3btfyZT7OA5knjdAAAAAElFTkSuQmCC"
};
/** Overwrite to handle brickSize
* @param {string} key
* @param {any} val
*/
ol.filter.Lego.prototype.set = function (key, val) {
  ol.filter.Base.prototype.set.call(this, key, val);
  if (key=="brickSize" && this.pattern.canvas.width!=val) {
    this.setBrick(val);
  }
}
/** Set the current brick
*	@param {number} width the pattern width, default 30
*	@param {'brick'|'ol3'|'lego'|undefined} img the pattern, default ol3
*	@param {string} crossOrigin
*/
ol.filter.Lego.prototype.setBrick = function (width, img, crossOrigin) {
  width = Number(width) || 30;
  if (typeof(img) === 'string') {
    var i = new Image;
    i.src = this.img[img] || this.img.ol3;
    i.crossOrigin = crossOrigin || null;
    img = i;
  }
  if (img) this.pattern.img = img;
  if (!this.pattern.img.width) {
    var self = this;
    this.pattern.img.onload = function() {
      self.setBrick(width,img);
    }
    return;
  }
  this.pattern.canvas.width = this.pattern.canvas.height = width;
  this.pattern.ctx = this.pattern.canvas.getContext("2d");
  this.pattern.ctx.fillStyle = this.pattern.ctx.createPattern (this.pattern.img, 'repeat');
  this.set("brickSize", width);
  this.set("img", img.src);
};
/** Get translated pattern
*	@param {number} offsetX x offset
*	@param {number} offsetY y offset
*/
ol.filter.Lego.prototype.getPattern = function (offsetX, offsetY) {	
  if (!this.pattern.ctx) return "transparent";
  //return this.pattern.ctx.fillStyle
  var c = this.pattern.canvas;
  var ctx = this.pattern.ctx;
  var sc = c.width / this.pattern.img.width;
  ctx.save();
    ctx.clearRect(0,0,c.width,c.height);
    ctx.scale(sc,sc);
    offsetX /= sc;
    offsetY /= sc;
    ctx.translate(offsetX, offsetY);
    ctx.beginPath();
    ctx.clearRect(-2*c.width, -2*c.height, 4*c.width, 4*c.height);
    ctx.rect(-offsetX, -offsetY, 2*c.width/sc, 2*c.height/sc);
    ctx.fill(); 
  ctx.restore();
  return ctx.createPattern(c, 'repeat');
};
/** Postcompose operation
*/
ol.filter.Lego.prototype.postcompose = function(e) {
  // Set back color hue
  var ctx = e.context;
  var canvas = ctx.canvas;
  var ratio = e.frameState.pixelRatio;
  // ol v6+
  if (e.type==='postrender') {
    ratio = 1;
  }
  ctx.save();
    // resize 
    var step = this.pattern.canvas.width*ratio;
    var p = e.frameState.extent;
    var res = e.frameState.viewState.resolution/ratio;
    var offset = [ -Math.round((p[0]/res)%step), Math.round((p[1]/res)%step) ];
    var ctx2 = this.internal_.getContext("2d");
    var w = this.internal_.width = canvas.width;
    var h = this.internal_.height = canvas.height;
    // No smoothing please
    ctx2.webkitImageSmoothingEnabled =
    ctx2.mozImageSmoothingEnabled =
    ctx2.msImageSmoothingEnabled =
    ctx2.imageSmoothingEnabled = false;
    var w2 = Math.floor((w-offset[0])/step);
    var h2 = Math.floor((h-offset[1])/step);
    ctx2.drawImage (canvas, offset[0], offset[1], w2*step, h2*step, 0, 0, w2, h2);
    //
    ctx.webkitImageSmoothingEnabled =
    ctx.mozImageSmoothingEnabled =
    ctx.msImageSmoothingEnabled =
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect (0, 0, w,h);
    ctx.drawImage (this.internal_, 0,0, w2,h2, offset[0],offset[1], w2*step, h2*step);
/*
    for (var x=offset[0]; x<w; x+=step) for (var y=offset[1]; y<h; y+=step)
    {	if (x>=0 && y<h) ctx2.drawImage (canvas, x, y, 1, 1, x, y, step, step);
    }
    ctx.clearRect (0, 0, w,h);
    ctx.drawImage (c, 0, 0);
*/
    // Draw brick stud
    ctx.scale(ratio,ratio);
    ctx.fillStyle = this.getPattern (offset[0]/ratio, offset[1]/ratio);
    ctx.rect(0,0, w, h);
    ctx.fill(); 
  ctx.restore();
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** @typedef {Object} FilterTextureOptions
 *  @property {Image | undefined} img Image object for the texture
 *  @property {string} src Image source URI
 *  @property {number} scale scale to draw the image. Default 1.
 *  @property {number} [opacity]
 *  @property {boolean} rotate Whether to rotate the texture with the view (may cause animation lags on mobile or slow devices). Default is true.
 *  @property {null | string | undefined} crossOrigin The crossOrigin attribute for loaded images.
 */
/** Add texture effects on maps or layers
 * @constructor
 * @requires ol.filter
 * @extends {ol.filter.Base}
 * @param {FilterTextureOptions} options
 */
ol.filter.Texture = function(options)
{	ol.filter.Base.call(this, options);
	this.setFilter(options);
}
ol.ext.inherits(ol.filter.Texture, ol.filter.Base);
/** Set texture
 * @param {FilterTextureOptions} [options]
 */
ol.filter.Texture.prototype.setFilter = function(options)
{	var img;
	options = options || {};
	if (options.img) img = options.img;
	else 
	{	img = new Image();
		if (options.src) {
			// Look for a texture stored in ol.filter.Texture.Image
			if (ol.filter.Texture.Image && ol.filter.Texture.Image[options.src]) {
				img.src = ol.filter.Texture.Image[options.src];
			} 
			// default source
			else {
				if (!img.src) img.src = options.src;
			}
		}
		img.crossOrigin = options.crossOrigin || null;
	}
	this.set('rotateWithView', options.rotateWithView !== false);
	this.set('opacity', typeof(options.opacity)=='number' ? options.opacity : 1);
	this.set('ready', false);
	var self = this;
	function setPattern(img)
	{	self.pattern = {};
		self.pattern.scale = options.scale || 1;
		self.pattern.canvas = document.createElement('canvas');
		self.pattern.canvas.width = img.width * self.pattern.scale;
		self.pattern.canvas.height = img.height * self.pattern.scale;
		self.pattern.canvas.width = img.width;// * self.pattern.scale;
		self.pattern.canvas.height = img.height;// * self.pattern.scale;
		self.pattern.ctx = self.pattern.canvas.getContext("2d");
		self.pattern.ctx.fillStyle = self.pattern.ctx.createPattern(img, 'repeat');
		// Force refresh
		self.set('ready', true);
	}
	if (img.width) 
	{	setPattern(img);
	}
	else
	{	img.onload = function()
		{	setPattern(img);
		}
	}
}
/** Get translated pattern
 *	@param {number} offsetX x offset
 *	@param {number} offsetY y offset
 */
ol.filter.Texture.prototype.getPattern = function (offsetX, offsetY)
{	var c = this.pattern.canvas;
	var ctx = this.pattern.ctx;
	ctx.save();
	/*
		offsetX /= this.pattern.scale;
		offsetY /= this.pattern.scale;
		ctx.scale(this.pattern.scale,this.pattern.scale);
	*/
		ctx.translate(-offsetX, offsetY);
		ctx.beginPath();
		ctx.rect(offsetX, -offsetY, c.width, c.height);
		ctx.fill();
	ctx.restore();
	return ctx.createPattern(c, 'repeat');
}
/** Draw pattern over the map on postcompose */
ol.filter.Texture.prototype.postcompose = function(e)
{	// not ready
	if (!this.pattern) return;
	// Set back color hue
	var ctx = e.context;
	var canvas = ctx.canvas;
	var m = 1.5 * Math.max(canvas.width, canvas.height);
	var mt = e.frameState.pixelToCoordinateTransform;
	// Old version (matrix)
	if (!mt)
	{	mt = e.frameState.pixelToCoordinateMatrix,
		mt[2] = mt[4];
		mt[3] = mt[5];
		mt[4] = mt[12];
		mt[5] = mt[13];
	}
	var ratio = e.frameState.pixelRatio;
	var res = e.frameState.viewState.resolution;
	var w = canvas.width/2, 
		h = canvas.height/2;
	ctx.save();
		ctx.globalCompositeOperation = "multiply";
		//ctx.globalCompositeOperation = "overlay";
		//ctx.globalCompositeOperation = "color";
		ctx.globalAlpha = this.get('opacity');
		ctx.scale(ratio*this.pattern.scale,ratio*this.pattern.scale);
		if (this.get('rotateWithView'))
		{	// Translate pattern
			res *= this.pattern.scale
			ctx.fillStyle = this.getPattern ((w*mt[0] + h*mt[1] + mt[4])/res, (w*mt[2] + h*mt[3] + mt[5])/res);
			// Rotate on canvas center and fill
			ctx.translate(w/this.pattern.scale, h/this.pattern.scale);
			ctx.rotate(e.frameState.viewState.rotation);
			ctx.beginPath();
			ctx.rect(-w-m, -h-m, 2*m, 2*m);
			ctx.fill(); 
		}
		else
		{
			/**/
				var dx = -(w*mt[0] + h*mt[1] + mt[4])/res;
				var dy = (w*mt[2] + h*mt[3] + mt[5])/res;
				var cos = Math.cos(e.frameState.viewState.rotation);
				var sin = Math.sin(e.frameState.viewState.rotation);
				var offsetX = (dx*cos - dy*sin) / this.pattern.scale;
				var offsetY = (dx*sin + dy*cos) / this.pattern.scale;
				ctx.translate(offsetX, offsetY);
				ctx.beginPath();
				ctx.fillStyle = this.pattern.ctx.fillStyle;
				ctx.rect(-offsetX -m , -offsetY -m, 2*m, 2*m);
				ctx.fill(); 
			/*	//old version without centered rotation
				var offsetX = -(e.frameState.extent[0]/res) % this.pattern.canvas.width;
				var offsetY = (e.frameState.extent[1]/res) % this.pattern.canvas.height;
				ctx.rotate(e.frameState.viewState.rotation);
				ctx.translate(offsetX, offsetY);
				ctx.beginPath();
				ctx.fillStyle = this.pattern.ctx.fillStyle
				ctx.rect(-offsetX -m , -offsetY -m, 2*m, 2*m);
				ctx.fill(); 
			*/
		}
	ctx.restore();
}

/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Feature format for reading data in the GeoRSS format.
 * @constructor ol.fromat.GeoRSS
 * @extends {ol.Object}
 * @param {*} options options.
 *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
 *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
 */
ol.format.GeoRSS = function(options) {
  options = options || {};
  ol.Object.call (this, options);
};
ol.ext.inherits(ol.format.GeoRSS, ol.Object);
/**
 * Read a feature.  Only works for a single feature. Use `readFeatures` to
 * read a feature collection.
 *
 * @param {Node|string} source Source.
 * @param {*} options Read options.
 *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
 *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
 * @return {ol.Feature} Feature or null if no feature read
 * @api
 */
ol.format.GeoRSS.prototype.readFeature = function(source, options) {
  options = options || {};
  var att, atts = source.children;
  var f = new ol.Feature();
  // Get attributes
  for (var j=0; att = atts[j]; j++) {
    f.set(att.tagName, att.innerHTML);
  }
  var temp, g, coord=[];
  // Get geometry
  if (f.get('geo:long')) {
    // LonLat
    g = new ol.geom.Point([f.get('geo:long'), f.get('geo:lat')]);
    f.unset('geo:long');
    f.unset('geo:lat');
  } else if (f.get('georss:point')) {
    // Point
    coord = f.get('georss:point').trim().split(' ');
    g = new ol.geom.Point([parseFloat(coord[1]), parseFloat(coord[0])]);
    f.unset('georss:point');
  } else if (f.get('georss:polygon')) {
    // Polygon
    temp = f.get('georss:polygon').trim().split(' ');
    for (var i=0; i<temp.length; i += 2) {
      coord.push([parseFloat(temp[i+1]), parseFloat(temp[i])]) 
    }
    g = new ol.geom.Polygon([coord]);
    console.log(temp,coord)
    f.unset('georss:polygon');
  } else if (f.get('georss:where')) {
    // GML
    console.warn('[GeoRSS] GML format not implemented')
    f.unset('georss:where');
    return null;
  } else {
    console.warn('[GeoRSS] unknown geometry')
    return null;
  }
  if (options.featureProjection || this.get('featureProjection')) {
    g.transform (options.dataProjection || this.get('dataProjection') || 'EPSG:4326', options.featureProjection || this.get('featureProjection'));
  }
  f.setGeometry(g);
  return f;
};
/**
 * Read all features.  Works with both a single feature and a feature
 * collection.
 *
 * @param {Document|Node|string} source Source.
 * @param {*} options Read options.
 *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
 *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
 * @return {Array<ol.Feature>} Features.
 * @api
 */
ol.format.GeoRSS.prototype.readFeatures = function(source, options) {
  var items;
  if (typeof(source)==='string') {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(source,"text/xml");
    items = xmlDoc.getElementsByTagName('item');
  } else if (source instanceof Document) {
    items = source.getElementsByTagName('item');
  } else if (source instanceof Node) {
    items = source;
  } else {
    return [];
  }
  var features = []
  for (var i=0, item; item = items[i]; i++) {
    var f = this.readFeature(item, options);
    if (f) features.push(f);
  }
  return features;
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Handles coordinates on the center of the viewport.
 * It can be used as abstract base class used for creating subclasses. 
 * The CenterTouch interaction modifies map browser event coordinate and pixel properties to force pointer on the viewport center to any interaction that them.
 * Only pointermove pointerup are concerned with it.
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {ol.style.Style|Array<ol.style.Style>} options.targetStyle a style to draw the target point, default cross style
 *  @param {string} options.compositecomposite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
ol.interaction.CenterTouch = function(options)
{	options = options || {};
	// LIst of listerner on the object
	this._listener = {};
	// Filter event
	var rex = /^pointermove$|^pointerup$/;
	// Default style = cross
	this.targetStyle = options.targetStyle ||
		[	new ol.style.Style({ image: new ol.style.RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol.style.Stroke({ color: "#fff", width:3 }) }) }),
			new ol.style.Style({ image: new ol.style.RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol.style.Stroke({ color: "#000", width:1 }) }) })
		];
	if (!(this.targetStyle instanceof Array)) this.targetStyle = [this.targetStyle];
	this.composite = options.composite || '';
	// Interaction to defer center on top of the interaction 
	// this is done to enable other coordinates manipulation inserted after the interaction (snapping)
	this.ctouch = new ol.interaction.Interaction(
		{	handleEvent: function(e) 
				{	if (rex.test(e.type) && this.getMap()) 
					{	e.coordinate = this.getMap().getView().getCenter();
						e.pixel = this.getMap().getSize();
						e.pixel = [ e.pixel[0]/2, e.pixel[1]/2 ];
					}
					return true; 
				}
		});
	// Target on map center
	this._target = new ol.control.Target();
	ol.interaction.Interaction.call(this,
		{	handleEvent: function(e) 
			{	if (rex.test(e.type)) this.pos_ = e.coordinate;
				if (options.handleEvent) return options.handleEvent.call (this,e);
				return true; 
			}
		});
};
ol.ext.inherits(ol.interaction.CenterTouch, ol.interaction.Interaction);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol.interaction.CenterTouch.prototype.setMap = function(map)
{	if (this.getMap())
	{	this.getMap().removeInteraction(this.ctouch);
		this.getMap().removeInteraction(this._target);
	}
	ol.interaction.Interaction.prototype.setMap.call (this, map);
	if (this.getMap())
	{	if (this.getActive()) {
			this.getMap().addInteraction(this.ctouch);
			this.getMap().addControl(this._target);
		}
	}
};
/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol.interaction.CenterTouch.prototype.setActive = function(b)
{	ol.interaction.Interaction.prototype.setActive.call (this, b);
	this.pos_ = null;
	if (this.getMap())
	{	if (this.getActive()) 
		{	this.getMap().addInteraction(this.ctouch);
			this.getMap().addControl(this._target);
		}
		else {
			this.getMap().removeInteraction(this.ctouch);
			this.getMap().removeControl(this._target);
		}
	}
};
/** Get the position of the target
 * @return {ol.coordinate}
 */
ol.interaction.CenterTouch.prototype.getPosition = function ()
{	if (!this.pos_) 
	{	var px =this.getMap().getSize();
		px = [ px[0]/2, px[1]/2 ];
		this.pos_ = this.getMap().getCoordinateFromPixel(px);
	}
	return this.pos_; 
};

/** Clip interaction to clip layers in a circle
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @param {ol.interaction.Clip.options} options flashlight  param
 *  @param {number} options.radius radius of the clip, default 100
 *	@param {ol.layer|Array<ol.layer>} options.layers layers to clip
 */
ol.interaction.Clip = function(options) {
  this.layers_ = [];
  ol.interaction.Pointer.call(this, {
    handleDownEvent: this.setPosition,
    handleMoveEvent: this.setPosition
  });
  this.precomposeBind_ = this.precompose_.bind(this);
  this.postcomposeBind_ = this.postcompose_.bind(this);
  // Default options
  options = options || {};
  this.pos = false;
  this.radius = (options.radius||100);
  if (options.layers) this.addLayer(options.layers);
};
ol.ext.inherits(ol.interaction.Clip, ol.interaction.Pointer);
/** Set the map > start postcompose
*/
ol.interaction.Clip.prototype.setMap = function(map) {
  var i;
  if (this.getMap()) {
    for (i=0; i<this.layers_.length; i++) {
      this.layers_[i].un(['precompose','prerender'], this.precomposeBind_);
      this.layers_[i].un(['postcompose','postrender'], this.postcomposeBind_);
    }
    this.getMap().renderSync();
  }
  ol.interaction.Pointer.prototype.setMap.call(this, map);
  if (map) {
    for (i=0; i<this.layers_.length; i++) {
      this.layers_[i].on(['precompose','prerender'], this.precomposeBind_);
      this.layers_[i].on(['postcompose','postrender'], this.postcomposeBind_);
    }
    map.renderSync();
  }
}
/** Set clip radius
 *	@param {integer} radius
*/
ol.interaction.Clip.prototype.setRadius = function(radius) {
  this.radius = radius;
  if (this.getMap()) this.getMap().renderSync();
}
/** Add a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
*/
ol.interaction.Clip.prototype.addLayer = function(layers)  {
  if (!(layers instanceof Array)) layers = [layers];
  for (var i=0; i<layers.length; i++) {
    if (this.getMap()) {
      layers[i].on(['precompose','prerender'], this.precomposeBind_);
      layers[i].on(['postcompose','postrender'], this.postcomposeBind_);
      this.getMap().renderSync();
    }
    this.layers_.push(layers[i]);
  }
};
/** Remove a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
*/
ol.interaction.Clip.prototype.removeLayer = function(layers) {
  if (!(layers instanceof Array)) layers = [layers];
  for (var i=0; i<layers.length; i++) {
    var k;
    for (k=0; k<this.layers_.length; k++) {
      if (this.layers_[k]===layers[i]) {
        break;
      }
    }
    if (k!=this.layers_.length && this.getMap()) {
      this.layers_[k].un(['precompose','prerender'], this.precomposeBind_);
      this.layers_[k].un(['postcompose','postrender'], this.postcomposeBind_);
      this.layers_.splice(k,1);
      this.getMap().renderSync();
    }
  }
};
/** Set position of the clip
*	@param {ol.Pixel|ol.MapBrowserEvent}
*/
ol.interaction.Clip.prototype.setPosition = function(e) {
  if (e.pixel) this.pos = e.pixel;
  else {
    if (e && e instanceof Array) this.pos = e;
    else e = [-10000000,-10000000];
  }
  if (this.getMap()) this.getMap().renderSync();
};
/* @private
*/
ol.interaction.Clip.prototype.precompose_ = function(e) {
  var ctx = e.context;
  var ratio = e.frameState.pixelRatio;
  ctx.save();
  ctx.beginPath();
  ctx.arc (this.pos[0]*ratio, this.pos[1]*ratio, this.radius*ratio, 0, 2*Math.PI);
  ctx.clip();
};
/* @private
*/
ol.interaction.Clip.prototype.postcompose_ = function(e) {
  e.context.restore();
};
/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol.interaction.Clip.prototype.setActive = function(b) {
  if (b===this.getActive()) return;
  ol.interaction.Pointer.prototype.setActive.call (this, b);
  var i;
  if (b) {
    for(i=0; i<this.layers_.length; i++) {
      this.layers_[i].on(['precompose','prerender'], this.precomposeBind_);
      this.layers_[i].on(['postcompose','postrender'], this.postcomposeBind_);
    }
  } else {
    for(i=0; i<this.layers_.length; i++) {
      this.layers_[i].un(['precompose','prerender'], this.precomposeBind_);
      this.layers_[i].un(['postcompose','postrender'], this.postcomposeBind_);
    }
  }
  if (this.getMap()) this.getMap().renderSync();
};

/** An interaction to copy/paste features on a map
 * @constructor
 * @fires focus
 * @fires copy
 * @fires paste
 * @extends {ol.interaction.Interaction}
 * @param {Object} options Options
 *  @param {function} options.condition a function that take a mapBrowserEvent and return the actio nto perform: 'copy', 'cut' or 'paste', default Ctrl+C / Ctrl+V
 *  @param {ol.Collection<ol.Feature>} options.features list of features to copy
 *  @param {ol.source.Vector | Array<ol.source.Vector>} options.sources the source to copy from (used for cut), if not defined, it will use the destination
 *  @param {ol.source.Vector} options.destination the source to copy to
 */
ol.interaction.CopyPaste = function(options) {
  options = options || {};
  // Features to copy
  this.features = [];
  this._cloneFeature = true;
  var condition = options.condition;
  if (typeof (condition) !== 'function') {
    condition = function (e) {
      if (e.originalEvent.ctrlKey) {
        if (/^c$/i.test(e.originalEvent.key)) return 'copy';
        if (/^x$/i.test(e.originalEvent.key)) return 'cut';
        if (/^v$/i.test(e.originalEvent.key)) return 'paste';
      }
      return false;
    }
  }
  this._featuresSource = options.features || new ol.Collection();
  this.setSources(options.sources);
  this.setDestination(options.destination);
  // Create intreaction
  ol.interaction.Interaction.call(this, {
    handleEvent: function(e) {
      if (e.type==='keydown' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        switch (condition(e)) {
          case 'copy': {
            this.copy({ silent: false });
            break;
          }
          case 'cut': {
            this.copy({ cut: true, silent: false });
            break;
          }
          case 'paste': {
            this.paste({ silent: false });
            break;
          }
          default: break;
        }
      }
      return true;
    }.bind(this)
  });
};
ol.ext.inherits(ol.interaction.CopyPaste, ol.interaction.Interaction);
/** Sources to cut feature from
 * @param { ol.source.Vector | Array<ol.source.Vector> } sources
 */
ol.interaction.CopyPaste.prototype.setSources = function (sources) {
  if (sources) {
    this._source = [];
    this._source = sources instanceof Array ? sources : [sources];
  } else {
    this._source = null;
  }
};
/** Get sources to cut feature from
 * @return { Array<ol.source.Vector> } 
 */
ol.interaction.CopyPaste.prototype.getSources = function () {
  return this._source;
};
/** Source to paste features
 * @param { ol.source.Vector } source
 */
ol.interaction.CopyPaste.prototype.setDestination = function (destination) {
  this._destination = destination;
};
/** Get source to paste features
 * @param { ol.source.Vector } 
 */
ol.interaction.CopyPaste.prototype.getDestination = function () {
  return this._destination;
};
/** Get current feature to copy
 * @return {Array<ol.Feature>}
 */
ol.interaction.CopyPaste.prototype.getFeatures = function() {
  return this.features;
};
/** Set current feature to copy
 * @param {Object} options
 *  @param {Array<ol.Feature> | ol.Collection<ol.Feature>} options.features feature to copy, default get in the provided collection
 *  @param {boolean} options.cut try to cut feature from the sources, default false
 *  @param {boolean} options.silent true to send an event, default true
 */
ol.interaction.CopyPaste.prototype.copy = function (options) {
  options = options || {};
  var features = options.features || this._featuresSource.getArray();
  // Try to remove feature from sources
  if (options.cut) {
    var sources = this._source || [this._destination];
    // Remove feature from sources
    features.forEach(function(f) {
      sources.forEach(function(source) {
        try {
          source.removeFeature(f);
        } catch(e) {/*ok*/}
      });
    });
  }
  if (this._cloneFeature) {
    this.features = [];
    features.forEach(function(f) {
      this.features.push(f.clone());
    }.bind(this));
  } else {
    this.features = features;
  }
  // Send an event
  if (options.silent===false) this.dispatchEvent({ type: options.cut ? 'cut' : 'copy', time: (new Date).getTime() });
};
/** Paste features
 * @param {Object} options
 *  @param {Array<ol.Feature> | ol.Collection<ol.Feature>} features feature to copy, default get current features
 *  @param {ol.source.Vector} options.destination Source to paste to, default the current source
 *  @param {boolean} options.silent true to send an event, default true
 */
ol.interaction.CopyPaste.prototype.paste = function(options) {
  options = options || {};
  var features = options.features || this.features;
  if (features) {
    var destination = options.destination || this._destination;
    if (destination) {
      destination.addFeatures(this.features);
      if (this._cloneFeature) this.copy({ features: this.features });
    }
  }
  // Send an event
  if (options.silent===false) this.dispatchEvent({ type:'paste', features: features, time: (new Date).getTime() });
};

/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A Select interaction to delete features on click.
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires deletestart
 * @fires deleteend
 * @param {*} options ol.interaction.Select options
 */
ol.interaction.Delete = function(options) {
  ol.interaction.Select.call(this, options);
  this.on('select', function(e) {
    this.getFeatures().clear();
    this.delete(e.selected);
  }.bind(this));
};
ol.ext.inherits(ol.interaction.Delete, ol.interaction.Select);
/** Get vector source of the map
 * @return {Array<ol.source.Vector>}
 */
ol.interaction.Delete.prototype._getSources = function(layers) {
  if (!this.getMap()) return [];
  if (!layers) layers = this.getMap().getLayers();
  var sources = [];
  layers.forEach(function (l) {
    // LayerGroup
    if (l.getLayers) {
      sources = sources.concat(this._getSources(l.getLayers()));
    } else {
      if (l.getSource && l.getSource() instanceof ol.source.Vector) {
        sources.push(l.getSource());
      }
    }
  }.bind(this));
  return sources;
};
/** Delete features: remove the features from the map (from all layers in the map)
 * @param {ol.Collection<ol.Feature>|Array<ol.Feature>} features The features to delete
 * @api
 */
ol.interaction.Delete.prototype.delete = function(features) {
  if (features && (features.length || features.getLength())) {
    this.dispatchEvent({ type: 'deletestart', features: features });
    var delFeatures = [];
    // Get the sources concerned
    this._getSources().forEach(function (source) {
      try {
        // Try to delete features in the source
        features.forEach(function(f) {
          source.removeFeature(f);
          delFeatures.push(f);
        });
      } catch(e) { /* ok */ }
    })
    this.dispatchEvent({ type: 'deleteend', features: delFeatures });
  }
};

/** Drag an overlay on the map
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @fires dragstart
 * @fires dragging
 * @fires dragend
 * @param {any} options
 *  @param {ol.Overlay|Array<ol.Overlay>} options.overlays the overlays to drag
 */
ol.interaction.DragOverlay = function(options) {
  if (!options) options = {};
  // Extend pointer
  ol.interaction.Pointer.call(this, {
    // start draging on an overlay
    handleDownEvent: function(evt) {
      // Click on a button (closeBox) or on a link: don't drag!
      if (/^(BUTTON|A)$/.test(evt.originalEvent.target.tagName)) {
        this._dragging = false;
        return true;
      }
      // Start dragging
      if (this._dragging) {
        this._dragging.setPosition(evt.coordinate);
        this.dispatchEvent({ 
          type: 'dragstart',
          overlay: this._dragging,
          coordinate: evt.coordinate
        });
        return true;
      }
      return false;
    },
    // Drag
    handleDragEvent: function(evt) {
      if (this._dragging) {
        this._dragging.setPosition(evt.coordinate);
        this.dispatchEvent({ 
          type: 'dragging',
          overlay: this._dragging,
          coordinate: evt.coordinate
        });
      }
    },
    // Stop dragging
    handleUpEvent: function(evt) {
      if (this._dragging) {
        this.dispatchEvent({ 
          type: 'dragend',
          overlay: this._dragging,
          coordinate: evt.coordinate
        });
      }
      return (this._dragging = false);
    }
  });
  // List of overlays / listeners
  this._overlays = [];
  if (!(options.overlays instanceof Array)) options.overlays = [options.overlays];
  options.overlays.forEach(this.addOverlay.bind(this));
};
ol.ext.inherits(ol.interaction.DragOverlay, ol.interaction.Pointer);
/** Add an overlay to the interacton
 * @param {ol.Overlay} ov
 */
ol.interaction.DragOverlay.prototype.addOverlay = function (ov) {
  for (var i=0, o; o=this._overlays[i]; i++) {
    if (o===ov) return;
  }
  // Stop event overlay
  if (ov.element.parentElement && ov.element.parentElement.classList.contains('ol-overlaycontainer-stopevent')) {
    console.warn('[DragOverlay.addOverlay] overlay must be created with stopEvent set to false!');
    return;
  }
  // Add listener on overlay of the same map
  var handler = function() {
    if (this.getMap()===ov.getMap()) this._dragging = ov;
  }.bind(this);
  this._overlays.push({
    overlay: ov,
    listener: handler
  });
  ov.element.addEventListener('pointerdown', handler);
};
/** Remove an overlay from the interacton
 * @param {ol.Overlay} ov
 */
ol.interaction.DragOverlay.prototype.removeOverlay = function (ov) {
  for (var i=0, o; o=this._overlays[i]; i++) {
    if (o.overlay===ov) {
      var l = this._overlays.splice(i,1)[0];
      ov.element.removeEventListener('pointerdown', l.listener);
      break;
    }
  }
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction to draw holes in a polygon.
 * It fires a drawstart, drawend event when drawing the hole
 * and a modifystart, modifyend event before and after inserting the hole in the feature geometry.
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires drawstart
 * @fires drawend
 * @fires modifystart
 * @fires modifyend
 * @param {olx.interaction.DrawHoleOptions} options extend olx.interaction.DrawOptions
 * 	@param {Array<ol.layer.Vector> | function | undefined} options.layers A list of layers from which polygons should be selected. Alternatively, a filter function can be provided. default: all visible layers
 * 	@param { ol.style.Style | Array<ol.style.Style> | StyleFunction | undefined }	Style for the selected features, default: default edit style
 */
ol.interaction.DrawHole = function(options) {
  if (!options) options = {};
  var self = this;
  // Select interaction for the current feature
  this._select = new ol.interaction.Select({ style: options.style });
  this._select.setActive(false);
  // Geometry function that test points inside the current
  var geometryFn, geomFn = options.geometryFunction;
  if (geomFn) {
    geometryFn = function(c,g) {
      g = self._geometryFn (c, g);
      return geomFn (c,g);
    }
  } else {
    geometryFn = function(c,g) { return self._geometryFn (c, g); }
  }
  // Create draw interaction
  options.type = "Polygon";
  options.geometryFunction = geometryFn;
  ol.interaction.Draw.call(this, options);
  // Layer filter function
  if (options.layers) {
    if (typeof (options.layers) === 'function') {
      this.layers_ = options.layers;
    } else if (options.layers.indexOf) {
      this.layers_ = function(l) {
        return (options.layers.indexOf(l) >= 0); 
      };
    }
  }
  // Start drawing if inside a feature
  this.on('drawstart', this._startDrawing.bind(this));
  // End drawing add the hole to the current Polygon
  this.on('drawend', this._finishDrawing.bind(this));
};
ol.ext.inherits(ol.interaction.DrawHole, ol.interaction.Draw);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.DrawHole.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeInteraction(this._select);
  if (map) map.addInteraction(this._select);
  ol.interaction.Draw.prototype.setMap.call (this, map);
};
/**
 * Activate/deactivate the interaction
 * @param {boolean}
 * @api stable
 */
ol.interaction.DrawHole.prototype.setActive = function(b) {
  this._select.getFeatures().clear();
  ol.interaction.Draw.prototype.setActive.call (this, b);
};
/**
 * Remove last point of the feature currently being drawn 
 * (test if points to remove before).
 */
ol.interaction.DrawHole.prototype.removeLastPoint = function() {
  if (this._feature && this._feature.getGeometry().getCoordinates()[0].length>2) {
    ol.interaction.Draw.prototype.removeLastPoint.call(this);
  }
};
/** 
 * Get the current polygon to hole
 * @return {ol.Feature}
 */
ol.interaction.DrawHole.prototype.getPolygon = function() {
  return this._polygon;
  // return this._select.getFeatures().item(0).getGeometry();
};
/**
 * Get current feature to add a hole and start drawing
 * @param {ol.interaction.Draw.Event} e
 * @private
 */
ol.interaction.DrawHole.prototype._startDrawing = function(e) {
  var map = this.getMap();
  var layersFilter = this.layers_;
  this._feature = e.feature;
  var coord = e.feature.getGeometry().getCoordinates()[0][0];
  // Check object under the pointer
  var features = map.getFeaturesAtPixel(
    map.getPixelFromCoordinate(coord), {
      layerFilter: layersFilter
    }
  );
  this._current = null;
  if (features) {
    for (var k=0; k<features.length; k++) {
      var poly = features[k].getGeometry();
      if (poly.getType() === "Polygon"
        && poly.intersectsCoordinate(coord)) {
        this._polygonIndex = false;
        this._polygon = poly;
        this._current = features[k];
      }
      else if (poly.getType() === "MultiPolygon"
        && poly.intersectsCoordinate(coord)) {
        for (var i=0, p; p=poly.getPolygon(i); i++) {
          if (p.intersectsCoordinate(coord)) {
            this._polygonIndex = i;
            this._polygon = p;
            this._current = features[k];
            break;
          }
        }
      }
      if (this._current) break;
    }
  }
  this._select.getFeatures().clear();
  if (!this._current) {
    this.setActive(false);
    this.setActive(true);
  } else {
    this._select.getFeatures().push(this._current);
  }
};
/**
 * Stop drawing and add the sketch feature to the target feature. 
 * @param {ol.interaction.Draw.Event} e
 * @private
 */
ol.interaction.DrawHole.prototype._finishDrawing = function(e) {
  // The feature is the hole
  e.hole = e.feature;
  // Get the current feature
  e.feature = this._select.getFeatures().item(0);
  this.dispatchEvent({ type: 'modifystart', features: [ this._current ] });
  // Create the hole
  var c = e.hole.getGeometry().getCoordinates()[0];
  if (c.length > 3) {
    if (this._polygonIndex!==false) {
      var geom = e.feature.getGeometry();
      var newGeom = new ol.geom.MultiPolygon([]);
      for (var i=0, pi; pi=geom.getPolygon(i); i++) {
        if (i===this._polygonIndex) {
          pi.appendLinearRing(new ol.geom.LinearRing(c));
          newGeom.appendPolygon(pi);
        } else {
          newGeom.appendPolygon(pi);
        }
      }
      e.feature.setGeometry(newGeom);
    } else {
      this.getPolygon().appendLinearRing(new ol.geom.LinearRing(c));
    }
  }
  this.dispatchEvent({ type: 'modifyend', features: [ this._current ] });
  // reset
  this._feature = null;
  this._select.getFeatures().clear();
};
/**
 * Function that is called when a geometry's coordinates are updated.
 * @param {Array<ol.coordinate>} coordinates
 * @param {ol.geom.Polygon} geometry
 * @return {ol.geom.Polygon}
 * @private
 */
ol.interaction.DrawHole.prototype._geometryFn = function(coordinates, geometry) {
  var coord = coordinates[0].pop();
  if (!this.getPolygon() || this.getPolygon().intersectsCoordinate(coord)) {
    this.lastOKCoord = [coord[0],coord[1]];
  }
  coordinates[0].push([this.lastOKCoord[0],this.lastOKCoord[1]]);
  if (geometry) {
    geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
  } else {
    geometry = new ol.geom.Polygon(coordinates);
  }
  return geometry;
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction rotate
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires drawstart, drawing, drawend, drawcancel
 * @param {olx.interaction.TransformOptions} options
 *  @param {Array<ol.Layer>} source Destination source for the drawn features
 *  @param {ol.Collection<ol.Feature>} features Destination collection for the drawn features 
 *  @param {ol.style.Style | Array.<ol.style.Style> | ol.style.StyleFunction | undefined} style style for the sketch
 *  @param {integer} sides number of sides, default 0 = circle
 *  @param { ol.events.ConditionType | undefined } squareCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw square features.
 *  @param { ol.events.ConditionType | undefined } centerCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw centered features.
 *  @param { bool } canRotate Allow rotation when centered + square, default: true
 *  @param { number } clickTolerance click tolerance on touch devices, default: 6
 *  @param { number } maxCircleCoordinates Maximum number of point on a circle, default: 100
 */
ol.interaction.DrawRegular = function(options) {
  if (!options) options={};
  this.squaredClickTolerance_ = options.clickTolerance ? options.clickTolerance * options.clickTolerance : 36;
  this.maxCircleCoordinates_ = options.maxCircleCoordinates || 100;
  // Collection of feature to transform 
  this.features_ = options.features;
  // List of layers to transform 
  this.source_ = options.source;
  // Square condition
  this.squareFn_ = options.squareCondition;
  // Centered condition
  this.centeredFn_ = options.centerCondition;
  // Allow rotation when centered + square
  this.canRotate_ = (options.canRotate !== false);
  // Specify custom geometry name
  this.geometryName_ = options.geometryName
  // Number of sides (default=0: circle)
  this.setSides(options.sides);
  // Style
  var white = [255, 255, 255, 1];
  var blue = [0, 153, 255, 1];
  var width = 3;
  var defaultStyle = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({ color: white, width: width + 2 })
    }),
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: width * 2,
        fill: new ol.style.Fill({ color: blue }),
        stroke: new ol.style.Stroke({ color: white, width: width / 2 })
      }),
      stroke: new ol.style.Stroke({ color: blue, width: width }),
      fill: new ol.style.Fill({
        color: [255, 255, 255, 0.5]
      })
    })
  ];
  // Create a new overlay layer for the sketch
  this.sketch_ = new ol.Collection();
  this.overlayLayer_ = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: this.sketch_,
      useSpatialIndex: false
    }),
    name:'DrawRegular overlay',
    displayInLayerSwitcher: false,
    style: options.style || defaultStyle
  });
  ol.interaction.Interaction.call(this, {	
      /*
      handleDownEvent: this.handleDownEvent_,
      handleMoveEvent: this.handleMoveEvent_,
      handleUpEvent: this.handleUpEvent_,
      */
      handleEvent: this.handleEvent_
    });
};
ol.ext.inherits(ol.interaction.DrawRegular, ol.interaction.Interaction);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
  ol.interaction.Interaction.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
};
/**
 * Activate/deactivate the interaction
 * @param {boolean}
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setActive = function(b) {
  this.reset();
  ol.interaction.Interaction.prototype.setActive.call (this, b);
}
/**
 * Reset the interaction
 * @api stable
 */
ol.interaction.DrawRegular.prototype.reset = function() {
  this.overlayLayer_.getSource().clear();
  this.started_ = false;
}
/**
 * Set the number of sides.
 * @param {int} number of sides.
 * @api stable
 */
ol.interaction.DrawRegular.prototype.setSides = function (nb) {
  nb = parseInt(nb);
  this.sides_ = nb>2 ? nb : 0;
}
/**
 * Allow rotation when centered + square
 * @param {bool} 
 * @api stable
 */
ol.interaction.DrawRegular.prototype.canRotate = function (b) {
  if (b===true || b===false) this.canRotate_ = b;
  return this.canRotate_;
}
/**
 * Get the number of sides.
 * @return {int} number of sides.
 * @api stable
 */
ol.interaction.DrawRegular.prototype.getSides = function () {
  return this.sides_;
}
/** Default start angle array for each sides
*/
ol.interaction.DrawRegular.prototype.startAngle = {
  'default':Math.PI/2,
  3: -Math.PI/2,
  4: Math.PI/4
};
/** Get geom of the current drawing
* @return {ol.geom.Polygon | ol.geom.Point}
*/
ol.interaction.DrawRegular.prototype.getGeom_ = function () {
  this.overlayLayer_.getSource().clear();
  if (!this.center_) return false;
  var g;
  if (this.coord_) {
    var center = this.center_;
    var coord = this.coord_;
    // Specific case: circle
    var d, dmax, r, circle, centerPx;
    if (!this.sides_ && this.square_ && !this.centered_) {
      center = [(coord[0] + center[0])/2, (coord[1] + center[1])/2];
      d = [coord[0] - center[0], coord[1] - center[1]];
      r = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
      circle = new ol.geom.Circle(center, r, 'XY');
      // Optimize points on the circle
      centerPx = this.getMap().getPixelFromCoordinate(center);
      dmax = Math.max (100, Math.abs(centerPx[0]-this.coordPx_[0]), Math.abs(centerPx[1]-this.coordPx_[1]));
      dmax = Math.min ( this.maxCircleCoordinates_, Math.round(dmax / 3 ));
      return ol.geom.Polygon.fromCircle (circle, dmax, 0);
    } else {
      var hasrotation = this.canRotate_ && this.centered_ && this.square_;
      d = [coord[0] - center[0], coord[1] - center[1]];
      if (this.square_ && !hasrotation) {
        //var d = [coord[0] - center[0], coord[1] - center[1]];
        var dm = Math.max (Math.abs(d[0]), Math.abs(d[1])); 
        coord = [ 
          center[0] + (d[0]>0 ? dm:-dm),
          center[1] + (d[1]>0 ? dm:-dm)
        ];
      }
      r = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
      if (r>0) {
        circle = new ol.geom.Circle(center, r, 'XY');
        var a;
        if (hasrotation) a = Math.atan2(d[1], d[0]);
        else a = this.startAngle[this.sides_] || this.startAngle['default'];
        if (this.sides_) {
          g = ol.geom.Polygon.fromCircle (circle, this.sides_, a);
        } else {
          // Optimize points on the circle
          centerPx = this.getMap().getPixelFromCoordinate(this.center_);
          dmax = Math.max (100, Math.abs(centerPx[0]-this.coordPx_[0]), Math.abs(centerPx[1]-this.coordPx_[1]));
          dmax = Math.min ( this.maxCircleCoordinates_, Math.round(dmax / (this.centered_ ? 3:5) ));
          g = ol.geom.Polygon.fromCircle (circle, dmax, 0);
        }
        if (hasrotation) return g;
        // Scale polygon to fit extent
        var ext = g.getExtent();
        if (!this.centered_) center = this.center_;
        else center = [ 2*this.center_[0]-this.coord_[0], 2*this.center_[1]-this.coord_[1] ];
        var scx = (center[0] - coord[0]) / (ext[0] - ext[2]);
        var scy = (center[1] - coord[1]) / (ext[1] - ext[3]);
        if (this.square_) {
          var sc = Math.min(Math.abs(scx),Math.abs(scy));
          scx = Math.sign(scx)*sc;
          scy = Math.sign(scy)*sc;
        }
        var t = [ center[0] - ext[0]*scx, center[1] - ext[1]*scy ];
        g.applyTransform(function(g1, g2, dim) {
          for (var i=0; i<g1.length; i+=dim) {
            g2[i] = g1[i]*scx + t[0];
            g2[i+1] = g1[i+1]*scy + t[1];
          }
          return g2;
        });
        return g;
      }
    }
  }
  // No geom => return a point
  return new ol.geom.Point(this.center_);
};
/** Draw sketch
* @return {ol.Feature} The feature being drawn.
*/
ol.interaction.DrawRegular.prototype.drawSketch_ = function(evt) {
  this.overlayLayer_.getSource().clear();
  if (evt) {
    this.square_ = this.squareFn_ ? this.squareFn_(evt) : evt.originalEvent.shiftKey;
    this.centered_ = this.centeredFn_ ? this.centeredFn_(evt) : evt.originalEvent.metaKey || evt.originalEvent.ctrlKey;
    var g = this.getGeom_();
    if (g) {
      var f = this.feature_;
      if (this.geometryName_) f.setGeometryName(this.geometryName_)
      //f.setGeometry (g);
      if (g.getType()==='Polygon') f.getGeometry().setCoordinates(g.getCoordinates());
      this.overlayLayer_.getSource().addFeature(f);
      if (this.coord_ 
        && this.square_ 
        && ((this.canRotate_ && this.centered_ && this.coord_) || (!this.sides_ && !this.centered_))) {
        this.overlayLayer_.getSource().addFeature(new ol.Feature(new ol.geom.LineString([this.center_,this.coord_])));
      }
      return f;
    }
  }
};
/** Draw sketch (Point)
*/
ol.interaction.DrawRegular.prototype.drawPoint_ = function(pt, noclear) {
  if (!noclear) this.overlayLayer_.getSource().clear();
  this.overlayLayer_.getSource().addFeature(new ol.Feature(new ol.geom.Point(pt)));
};
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ol.interaction.DrawRegular.prototype.handleEvent_ = function(evt) {
  var dx, dy;
  // Event date time
  this._eventTime = new Date();
  switch (evt.type) {
    case "pointerdown": {
      this.downPx_ = evt.pixel;
      this.start_(evt);
      // Test long touch
      var dt = 500;
      this._longTouch = false;
      setTimeout(function() {
        this._longTouch = (new Date() - this._eventTime > .9*dt);
        if (this._longTouch) this.handleMoveEvent_(evt);
      }.bind(this), dt);
      break;
    }
    case "pointerup": {
      // Started and fisrt move
      if (this.started_ && this.coord_) {
        dx = this.downPx_[0] - evt.pixel[0];
        dy = this.downPx_[1] - evt.pixel[1];
        if (dx*dx + dy*dy <= this.squaredClickTolerance_) {
          // The pointer has moved
          if ( this.lastEvent == "pointermove" || this.lastEvent == "keydown" ) {
            this.end_(evt);
          }
          // On touch device there is no move event : terminate = click on the same point
          else {
            dx = this.upPx_[0] - evt.pixel[0];
            dy = this.upPx_[1] - evt.pixel[1];
            if ( dx*dx + dy*dy <= this.squaredClickTolerance_) {
              this.end_(evt);
            } else  {
              this.handleMoveEvent_(evt);
              this.drawPoint_(evt.coordinate,true);
            }
          }
        }
      }
      this.upPx_ = evt.pixel;	
      break;
    }
    case "pointerdrag": {
      if (this.started_) {
        var centerPx = this.getMap().getPixelFromCoordinate(this.center_);
        dx = centerPx[0] - evt.pixel[0];
        dy = centerPx[1] - evt.pixel[1];
        if (dx*dx + dy*dy <= this.squaredClickTolerance_) {
          this.reset();
        }
      }
      return !this._longTouch;
      // break;
    }
    case "pointermove": {
      if (this.started_) {
        dx = this.downPx_[0] - evt.pixel[0];
        dy = this.downPx_[1] - evt.pixel[1];
        if (dx*dx + dy*dy > this.squaredClickTolerance_) {
          this.handleMoveEvent_(evt);
          this.lastEvent = evt.type;
        }
      }
      break;
    }
    default: {
      this.lastEvent = evt.type;
      // Prevent zoom in on dblclick
      if (this.started_ && evt.type==='dblclick') {
        //evt.stopPropagation();
        return false;
      }
      break;
    }
  }
  return true;
}
/** Stop drawing.
 */
ol.interaction.DrawRegular.prototype.finishDrawing = function() {
  if (this.started_ && this.coord_) {
    this.end_({ pixel: this.upPx_, coordinate: this.coord_});
  }
};
/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol.interaction.DrawRegular.prototype.handleMoveEvent_ = function(evt) {
  if (this.started_) {
    this.coord_ = evt.coordinate;
    this.coordPx_ = evt.pixel;
    var f = this.drawSketch_(evt);
    this.dispatchEvent({ 
      type:'drawing', 
      feature: f, 
      pixel: evt.pixel, 
      startCoordinate: this.center_,
      coordinate: evt.coordinate, 
      square: this.square_, 
      centered: this.centered_ 
    });
  } else  {
    this.drawPoint_(evt.coordinate);
  }
};
/** Start an new draw
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol.interaction.DrawRegular.prototype.start_ = function(evt) {
  if (!this.started_) {
    this.started_ = true;
    this.center_ = evt.coordinate;
    this.coord_ = null;
    var geom = new ol.geom.Polygon([[evt.coordinate,evt.coordinate,evt.coordinate]]);
    var f = this.feature_ = new ol.Feature(geom);
    this.drawSketch_(evt);
    this.dispatchEvent({ type:'drawstart', feature: f, pixel: evt.pixel, coordinate: evt.coordinate });
  } else {
    this.coord_ = evt.coordinate;
  }
};
/** End drawing
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol.interaction.DrawRegular.prototype.end_ = function(evt) {
  this.coord_ = evt.coordinate;
  this.started_ = false;
  // Add new feature
  if (this.coord_ && this.center_[0]!=this.coord_[0] && this.center_[1]!=this.coord_[1]) {
    var f = this.feature_;
    if (this.geometryName_) f.setGeometryName(this.geometryName_)
    f.setGeometry(this.getGeom_());
    if (this.source_) this.source_.addFeature(f);
    else if (this.features_) this.features_.push(f);
    this.dispatchEvent({ type:'drawend', feature: f, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
  } else {
    this.dispatchEvent({ type:'drawcancel', feature: null, pixel: evt.pixel, coordinate: evt.coordinate, square: this.square_, centered: this.centered_ });
  }
  this.center_ = this.coord_ = null;
  this.drawSketch_();
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction DrawTouch :
 * @constructor
 * @fires drawstart
 * @fires drawend
 * @extends {ol.interaction.CenterTouch}
 * @param {olx.interaction.DrawOptions} options
 *  @param {ol.source.Vector | undefined} options.source Destination source for the drawn features.
 *  @param {ol.geom.GeometryType} options.type Drawing type ('Point', 'LineString', 'Polygon') not ('MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle'). Required.
 *	@param {boolean} options.tap enable on tap, default true
 *  @param {ol.style.Style|Array<ol.style.Style>} options.targetStyle a style to draw the target point, default cross style
 *  @param {string} options.composite composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
ol.interaction.DrawTouch = function(options) {
  options = options||{};
  options.handleEvent = function(e) {
    if (this.get("tap")) {
      switch (e.type) {
        case "singleclick": {
          this.addPoint();
          break;
        }
        case "dblclick": {
          this.addPoint();
          this.finishDrawing();
          return false;
          //break;
        }
        default: break;
      }
    }
    return true;
  }
  ol.interaction.CenterTouch.call(this, options);
  this.typeGeom_ = options.type;
  this.source_ = options.source;
  this.set("tap", (options.tap!==false));
  // Style
  var white = [255, 255, 255, 1];
  var blue = [0, 153, 255, 1];
  var width = 3;
  var defaultStyle = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({ color: white, width: width + 2 })
    }),
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: width * 2,
        fill: new ol.style.Fill({ color: blue }),
        stroke: new ol.style.Stroke({ color: white, width: width / 2 })
      }),
      stroke: new ol.style.Stroke({ color: blue, width: width }),
      fill: new ol.style.Fill({
        color: [255, 255, 255, 0.5]
      })
    })
  ];
  this.overlay_ = new ol.layer.Vector({
    source: new ol.source.Vector({useSpatialIndex: false }),
    style: defaultStyle
  });
  this.geom_ = [];
};
ol.ext.inherits(ol.interaction.DrawTouch, ol.interaction.CenterTouch);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.DrawTouch.prototype.setMap = function(map) {
  if (this._listener.drawSketch) ol.Observable.unByKey(this._listener.drawSketch);
  this._listener.drawSketch = null;
  ol.interaction.CenterTouch.prototype.setMap.call (this, map);
  this.overlay_.setMap(map);
  if (this.getMap()){
    this._listener.drawSketch = this.getMap().on("postcompose", this.drawSketchLink_.bind(this));
  }
};
/** Get geometry type
 * @return {ol.geom.GeometryType}
 */
ol.interaction.DrawTouch.prototype.getGeometryType = function() {
  return this.typeGeom_;
};
/** Start drawing and add the sketch feature to the target layer. 
 * The ol.interaction.Draw.EventType.DRAWEND event is dispatched before inserting the feature.
 */
ol.interaction.DrawTouch.prototype.finishDrawing = function() {
  if (!this.getMap()) return;
  var valid = true;
  if (this._feature) {
    switch (this.typeGeom_) {
      case "LineString": {
        if (this.geom_.length > 1) {
          this._feature.setGeometry(new ol.geom.LineString(this.geom_));
        } else {
          valid = false;
        }
        break;
      }
      case "Polygon": {
        // Close polygon
        if (this.geom_[this.geom_.length-1] != this.geom_[0]) {
          this.geom_.push(this.geom_[0]);
        }
        // Valid ?
        if (this.geom_.length > 3) {
          this._feature.setGeometry(new ol.geom.Polygon([ this.geom_ ]));
        } else {
          valid = false;
        }
        break;
      }
      default: break;
    }
    if (this._feature) this.source_.addFeature (this._feature);
    this.dispatchEvent({ 
      type: 'drawend',
      feature: this._feature,
      valid: valid
    });
  }  
  // reset
  this.geom_ = [];
  this.drawSketch_();
  this._feature = null;
};
/** Add a new Point to the drawing
 */
ol.interaction.DrawTouch.prototype.addPoint = function() {
  if (!this.getMap()) return;
  this.geom_.push(this.getPosition());
  var start = false;
  if (!this._feature) {
    this._feature = new ol.Feature();
    start = true;
  }
  switch (this.typeGeom_) {
    case "Point": 
      this._feature.setGeometry(new ol.geom.Point(this.geom_.pop()));
      break;
    case "LineString":
    case "Polygon":
      this.drawSketch_();
      break;
    default: break;
  }
  // Dispatch events
  if (start) {
    this.dispatchEvent({ 
      type: 'drawstart',
      feature: this._feature
    });
  }
  if (this.typeGeom_ ==='Point') {
      this.finishDrawing();
  }
};
/** Remove last point of the feature currently being drawn.
 */
ol.interaction.DrawTouch.prototype.removeLastPoint = function() {
  if (!this.getMap()) return;
  this.geom_.pop();
  this.drawSketch_();
};
/** Draw sketch
 * @private
 */
ol.interaction.DrawTouch.prototype.drawSketch_ = function() {
  if (!this.overlay_) return;
  this.overlay_.getSource().clear();
  if (this.geom_.length) {
    var geom = new ol.geom.LineString(this.geom_);
    if (this.typeGeom_ == "Polygon") {
      if (!this._feature.getGeometry()) {
        this._feature.setGeometry(new ol.geom.Polygon([this.geom_]));
      } else {
        this._feature.getGeometry().setCoordinates([this.geom_]);
      }
      this.overlay_.getSource().addFeature(new ol.Feature(geom));
    } else {
      if (!this._feature.getGeometry()) {
        this._feature.setGeometry(new ol.geom.LineString(this.geom_));
      } else {
        this._feature.getGeometry().setCoordinates(this.geom_);
      }
    }
    this.overlay_.getSource().addFeature(this._feature);
    var f = new ol.Feature( new ol.geom.Point (this.geom_.slice(-1).pop()) );
    this.overlay_.getSource().addFeature(f);
  }
};
/** Draw contruction lines on postcompose
 * @private
 */
ol.interaction.DrawTouch.prototype.drawSketchLink_ = function(e) {
  if (!this.getActive() || !this.getPosition()) return;
  var ctx = e.context || ol.ext.getMapCanvas(this.getMap()).getContext('2d');
  ctx.save();
    var p, pt = this.getMap().getPixelFromCoordinate(this.getPosition());
    var ratio = e.frameState.pixelRatio || 1;
    ctx.scale(ratio,ratio);
    ctx.strokeStyle = "rgba(0, 153, 255, 1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc (pt[0],pt[1], 5, 0, 2*Math.PI);
    ctx.stroke();
    if (this.geom_.length) {
      p = this.getMap().getPixelFromCoordinate(this.geom_[this.geom_.length-1]);
      ctx.beginPath();
      ctx.moveTo(p[0],p[1]);
      ctx.lineTo(pt[0],pt[1]);
      if (this.typeGeom_ == "Polygon") {
        p = this.getMap().getPixelFromCoordinate(this.geom_[0]);
        ctx.lineTo(p[0],p[1]);
      }
      ctx.stroke();
    }
  ctx.restore();
};
/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol.interaction.DrawTouch.prototype.setActive = function(b) {
  ol.interaction.CenterTouch.prototype.setActive.call (this, b);
  if (!b) this.geom_ = [];
  this.drawSketch_();
};

/** Extend DragAndDrop choose drop zone + fires loadstart, loadend
 * @constructor
 * @extends {ol.interaction.DragAndDrop}
 *	@fires loadstart, loadend, addfeatures
 *	@param {ol.dropfile.options} flashlight options param
 *		- zone {string} selector for the drop zone, default document
 *		- projection {ol.projection} default projection of the map
 *		- formatConstructors {Array<function(new:ol.format.Feature)>|undefined} Format constructors, default [ ol.format.GPX, ol.format.GeoJSON, ol.format.IGC, ol.format.KML, ol.format.TopoJSON ]
 *		- accept {Array<string>|undefined} list of eccepted format, default ["gpx","json","geojson","igc","kml","topojson"]
 */
ol.interaction.DropFile = function(options)
{	options = options||{};
	ol.interaction.DragAndDrop.call(this, {});
	var zone = options.zone || document;
	zone.addEventListener('dragenter', this.onstop );
	zone.addEventListener('dragover', this.onstop );
	zone.addEventListener('dragleave', this.onstop );
	// Options
	this.formatConstructors_ = options.formatConstructors || [ ol.format.GPX, ol.format.GeoJSON, ol.format.IGC, ol.format.KML, ol.format.TopoJSON ];
	this.projection_ = options.projection;
	this.accept_ = options.accept || ["gpx","json","geojson","igc","kml","topojson"];
	var self = this;
	zone.addEventListener('drop', function(e){ return self.ondrop(e);});
};
ol.ext.inherits(ol.interaction.DropFile, ol.interaction.DragAndDrop);
/** Set the map
*/
ol.interaction.DropFile.prototype.setMap = function(map)
{	ol.interaction.Interaction.prototype.setMap.call(this, map);
};
/** Do somthing when over
*/
ol.interaction.DropFile.prototype.onstop = function(e)
{	e.preventDefault();
	e.stopPropagation();
	return false;
}
/** Do something when over
*/
ol.interaction.DropFile.prototype.ondrop = function(e)
{	e.preventDefault();
	if (e.dataTransfer && e.dataTransfer.files.length)
	{	var self = this;
		// fetch FileList object
		var files = e.dataTransfer.files; // e.originalEvent.target.files ?
		// process all File objects
		var file;
		var pat = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/;
		for (var i=0; file=files[i]; i++)
		{	var ex = file.name.match(pat)[0];
			self.dispatchEvent({ type:'loadstart', file: file, filesize: file.size, filetype: file.type, fileextension: ex, projection: projection, target: self });
			// Load file
			var reader = new FileReader();
			var projection = this.projection_ || this.getMap().getView().getProjection();
			var formatConstructors = this.formatConstructors_
			if (!projection) return;
			var tryReadFeatures = function (format, result, options)
			{	try
				{	return format.readFeatures(result, options);
				} catch (e) { /* ok */ }
			}
			var theFile = file;
			reader.onload = function(e)
			{	var result = e.target.result;
				var features = [];
				var i, ii;
				for (i = 0, ii = formatConstructors.length; i < ii; ++i)
				{	var formatConstructor = formatConstructors[i];
					var format = new formatConstructor();
					features = tryReadFeatures(format, result, { featureProjection: projection });
					if (features && features.length > 0)
					{	self.dispatchEvent({ type:'addfeatures', features: features, file: theFile, projection: projection, target: self });
						self.dispatchEvent({ type:'loadend', features: features, file: theFile, projection: projection, target: self });
						return;
					}
				}
				self.dispatchEvent({ type:'loadend', file: theFile, target: self });
			};
			reader.readAsText(file);
		}
	}
    return false;
};

/** A Select interaction to fill feature's properties on click.
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires setattributestart
 * @fires setattributeend
 * @param {*} options extentol.interaction.Select options
 *  @param {boolean} options.active activate the interaction on start, default true
 *  @param {boolean} options.cursor use a paint bucket cursor, default true
 * @param {*} properties The properties as key/value
 */
ol.interaction.FillAttribute = function(options, properties) {
  options = options || {};
  if (!options.condition) options.condition = ol.events.condition.click;
  ol.interaction.Select.call(this, options);
  this.setActive(options.active!==false)
  this._attributes = properties;
  this.on('select', function(e) {
    this.getFeatures().clear();
    this.fill(e.selected, this._attributes);
  }.bind(this));
  if (options.cursor!==false) {
    var canvas = document.createElement('CANVAS');
    canvas.width = canvas.height = 32;
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
      ctx.moveTo(9,3);
      ctx.lineTo(2,9);
      ctx.lineTo(10,17);
      ctx.lineTo(17,11);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
      ctx.moveTo(6,4);
      ctx.lineTo(0,8);
      ctx.lineTo(0,13);
      ctx.lineTo(3,17);
      ctx.lineTo(3,8);
    ctx.closePath();
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.stroke();
    ctx.moveTo(8,8);
    ctx.lineTo(10,0);
    ctx.lineTo(11,0);
    ctx.lineTo(13,3);
    ctx.lineTo(13,7);
    ctx.stroke();
    this._cursor = 'url('+canvas.toDataURL()+') 0 13, auto';
  }
};
ol.ext.inherits(ol.interaction.FillAttribute, ol.interaction.Select);
/** Activate the interaction
 * @param {boolean} active
 */
ol.interaction.FillAttribute.prototype.setActive = function(active) {
  if(active === this.getActive()) return;
  ol.interaction.Select.prototype.setActive.call(this, active);
  if (this.getMap() && this._cursor) {
    if (active) {
      this._previousCursor = this.getMap().getTargetElement().style.cursor;
      this.getMap().getTargetElement().style.cursor = this._cursor;
//      console.log('setCursor',this._cursor)
    } else {
      this.getMap().getTargetElement().style.cursor = this._previousCursor;
      this._previousCursor = undefined;
    }
  }
};
/** Set attributes
 * @param {*} properties The properties as key/value
 */
ol.interaction.FillAttribute.prototype.setAttributes = function(properties) {
  this._attributes = properties;
};
/** Set an attribute
 * @param {string} key 
 * @param {*} val 
 */
ol.interaction.FillAttribute.prototype.setAttribute = function(key, val) {
  this._attributes[key] = val;
};
/** get attributes
 * @return {*} The properties as key/value
 */
ol.interaction.FillAttribute.prototype.getAttributes = function() {
  return this._attributes;
};
/** Get an attribute
 * @param {string} key 
 * @return {*} val 
 */
ol.interaction.FillAttribute.prototype.getAttribute = function(key) {
  return this._attributes[key];
};
/** Fill feature attributes
 * @param {Array<ol.Feature>} features The features to modify
 * @param {*} properties The properties as key/value
 */
ol.interaction.FillAttribute.prototype.fill = function(features, properties) {
  if (features.length && properties) {
    this.dispatchEvent({ type: 'setattributestart', features: features, properties: properties });
    features.forEach(function(f) {
      for (var p in properties) {
        f.set(p, properties[p]);
      }
    });
    this.dispatchEvent({ type: 'setattributeend', features: features, properties: properties });
  }
};

/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @param {ol.flashlight.options} flashlight options param
 *	@param {ol.Color} options.color light color, default transparent
 *  @param {ol.Color} options.fill fill color, default rgba(0,0,0,0.8)
 *  @param {number} options.radius radius of the flash
 */
ol.interaction.Flashlight = function(options) {
  ol.interaction.Pointer.call(this, {
    handleDownEvent: this.setPosition,
    handleMoveEvent: this.setPosition
  });
  // Default options
  options = options||{};
  this.pos = false;
  this.radius = (options.radius||100);
  this.setColor(options);
};
ol.ext.inherits(ol.interaction.Flashlight, ol.interaction.Pointer);
/** Set the map > start postcompose
*/
ol.interaction.Flashlight.prototype.setMap = function(map) {
  if (this.getMap()) {
    this.getMap().render();
  }
  if (this._listener) ol.Observable.unByKey(this._listener);
  this._listener = null;
  ol.interaction.Pointer.prototype.setMap.call(this, map);
  if (map) {
    this._listener = map.on('postcompose', this.postcompose_.bind(this));
  }
}
/** Set flashlight radius
 *	@param {integer} radius
*/
ol.interaction.Flashlight.prototype.setRadius = function(radius) {
  this.radius = radius
  if (this.getMap()) this.getMap().renderSync();
}
/** Set flashlight color
 *	@param {ol.flashlight.options} flashlight options param
*		- color {ol.Color} light color, default transparent
*		- fill {ol.Color} fill color, default rgba(0,0,0,0.8)
*/
ol.interaction.Flashlight.prototype.setColor = function(options) {
  // Backcolor
  var color = (options.fill ? options.fill : [0,0,0,0.8]);
  var c = ol.color.asArray(color);
  this.startColor = ol.color.asString(c);
  // Halo color
  if (options.color) {
    c = this.endColor = ol.color.asString(ol.color.asArray(options.color)||options.color);
  } else  {
    c[3] = 0
    this.endColor = ol.color.asString(c);
  }
  c[3] = 0.1;
  this.midColor = ol.color.asString(c);
  if (this.getMap()) this.getMap().renderSync();
}
/** Set position of the flashlight
*	@param {ol.Pixel|ol.MapBrowserEvent}
*/
ol.interaction.Flashlight.prototype.setPosition = function(e) {
  if (e.pixel) this.pos = e.pixel;
  else this.pos = e;
  if (this.getMap()) {
    this.getMap().renderSync();
  }
}
/** Postcompose function
*/
ol.interaction.Flashlight.prototype.postcompose_ = function(e) {
  var ctx = ol.ext.getMapCanvas(this.getMap()).getContext('2d');
  var ratio = e.frameState.pixelRatio;
  var w = ctx.canvas.width;
  var h = ctx.canvas.height;
  ctx.save();
  ctx.scale(ratio,ratio);
  if (!this.pos) {
    ctx.fillStyle = this.startColor;
    ctx.fillRect( 0,0,w,h );
  } else {
    var d = Math.max(w, h);
    // reveal wherever we drag
    var radGrd = ctx.createRadialGradient( this.pos[0], this.pos[1], w*this.radius/d, this.pos[0], this.pos[1], h*this.radius/d );
    radGrd.addColorStop(   0, this.startColor );
    radGrd.addColorStop( 0.8, this.midColor );
    radGrd.addColorStop(   1, this.endColor );
    ctx.fillStyle = radGrd;
    ctx.fillRect( this.pos[0] - d, this.pos[1] - d, 2*d, 2*d );
  }
  ctx.restore();
};

/** An interaction to focus on the map on click. Usefull when using keyboard event on the map.
 * @constructor
 * @fires focus
 * @extends {ol.interaction.Interaction}
 */
ol.interaction.FocusMap = function() {
  //
  ol.interaction.Interaction.call(this, {});
  // Focus (hidden) button to focus on the map when click on it 
  this.focusBt = ol.ext.element.create('BUTTON', {
    on: {
      focus: function() {
        this.dispatchEvent({ type:'focus' });
      }.bind(this)
    },
    style: {
      position: 'absolute',
      zIndex: -1,
      top: 0,
      opacity: 0
    }
  });
};
ol.ext.inherits(ol.interaction.FocusMap, ol.interaction.Interaction);
/** Set the map > add the focus button and focus on the map when pointerdown to enable keyboard events.
 */
ol.interaction.FocusMap.prototype.setMap = function(map) {
  if (this._listener) ol.Observable.unByKey(this._listener);
  this._listener = null;
  if (this.getMap()) { this.getMap().getViewport().removeChild(this.focusBt); }
  ol.interaction.Interaction.prototype.setMap.call (this, map);
  if (this.getMap()) {
    // Force focus on the clicked map
    this._listener = this.getMap().on('pointerdown', function() {
      if (this.getActive()) this.focusBt.focus();
    }.bind(this));
    this.getMap().getViewport().appendChild(this.focusBt); 
  }
};

/** Interaction to draw on the current geolocation
 *	It combines a draw with a ol.Geolocation
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires drawstart, drawend, drawing, tracking, follow
 * @param {any} options
 *  @param { ol.Collection.<ol.Feature> | undefined } option.features Destination collection for the drawn features.
 *  @param { ol.source.Vector | undefined } options.source Destination source for the drawn features.
 *  @param {ol.geom.GeometryType} options.type Drawing type ('Point', 'LineString', 'Polygon'), default LineString.
 *  @param {Number | undefined} options.minAccuracy minimum accuracy underneath a new point will be register (if no condition), default 20
 *  @param {function | undefined} options.condition a function that take a ol.Geolocation object and return a boolean to indicate whether location should be handled or not, default return true if accuraty < minAccuraty
 *  @param {Object} options.attributes a list of attributes to register as Point properties: {accuracy:true,accuracyGeometry:true,heading:true,speed:true}, default none.
 *  @param {Number} options.tolerance tolerance to add a new point (in projection unit), use ol.geom.LineString.simplify() method, default 5
 *  @param {Number} options.zoom zoom for tracking, default 16
 *  @param {boolean|auto|position|visible} options.followTrack true if you want the interaction to follow the track on the map, default true
 *  @param { ol.style.Style | Array.<ol.style.Style> | ol.StyleFunction | undefined } options.style Style for sketch features.
 */
ol.interaction.GeolocationDraw = function(options) {
  if (!options) options={};
  // Geolocation
  this.geolocation = new ol.Geolocation(({ 
    projection: "EPSG:4326",
    trackingOptions: {
      maximumAge: 10000,
      enableHighAccuracy: true,
      timeout: 600000
    }
  }));
  this.geolocation.on('change', this.draw_.bind(this));
  // Current path
  this.path_ = [];
  this.lastPosition_ = false;
  // Default style
  var white = [255, 255, 255, 1];
  var blue = [0, 153, 255, 1];
  var width = 3;
  var circle = new ol.style.Circle({
    radius: width * 2,
    fill: new ol.style.Fill({ color: blue }),
    stroke: new ol.style.Stroke({ color: white, width: width / 2 })
  });
  var style = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({ color: white, width: width + 2 })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({ color: blue, width: width }),
      fill: new ol.style.Fill({
        color: [255, 255, 255, 0.5]
      })
    })
  ];
  var triangle = new ol.style.RegularShape({
    radius: width * 3.5,
    points: 3,
    rotation: 0,
    fill: new ol.style.Fill({ color: blue }),
    stroke: new ol.style.Stroke({ color: white, width: width / 2 })
  });
  // stretch the symbol
  var c = triangle.getImage();
  var ctx = c.getContext("2d");
  var c2 = document.createElement('canvas');
  c2.width = c2.height = c.width;
  c2.getContext("2d").drawImage(c, 0,0);
  ctx.clearRect(0,0,c.width,c.height);
  ctx.drawImage(c2, 0,0, c.width, c.height, width, 0, c.width-2*width, c.height);
  var defaultStyle = function(f) {
    if (f.get('heading')===undefined) {
      style[1].setImage(circle);
    } else {
      style[1].setImage(triangle);
      triangle.setRotation( f.get('heading') || 0);
    }
    return style;
  }
  // Style for the accuracy geometry
  this.locStyle = {
    error: new ol.style.Style({ fill: new ol.style.Fill({ color: [255, 0, 0, 0.2] }) }),
    warn: new ol.style.Style({ fill: new ol.style.Fill({ color: [255, 192, 0, 0.2] }) }),
    ok: new ol.style.Style({ fill: new ol.style.Fill({ color: [0, 255, 0, 0.2] }) }),
  };
  // Create a new overlay layer for the sketch
  this.overlayLayer_ = new ol.layer.Vector({
    source: new ol.source.Vector(),
    name:'GeolocationDraw overlay',
    style: options.style || defaultStyle
  });
  this.sketch_ = [new ol.Feature(), new ol.Feature(), new ol.Feature()];
  this.overlayLayer_.getSource().addFeatures(this.sketch_);
  this.features_ = options.features;
  this.source_ = options.source;
  this.condition_ = options.condition || function(loc) { return loc.getAccuracy() < this.get("minAccuracy") };
  // Prevent interaction when tracking
  ol.interaction.Interaction.call(this, {
    handleEvent: function() {
      return (!this.get('followTrack') || this.get('followTrack')=='auto');//  || !geoloc.getTracking());
    }
  });
  this.set("type", options.type||"LineString");
  this.set("attributes", options.attributes||{});
  this.set("minAccuracy", options.minAccuracy||20);
  this.set("tolerance", options.tolerance||5);
  this.set("zoom", options.zoom);
  this.setFollowTrack (options.followTrack===undefined ? true : options.followTrack);
  this.setActive(false);
};
ol.ext.inherits(ol.interaction.GeolocationDraw, ol.interaction.Interaction);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.GeolocationDraw.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
  ol.interaction.Pointer.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
  if (map) this.geolocation.setProjection(map.getView().getProjection());
};
/** Activate or deactivate the interaction.
 * @param {boolean} active
 */
ol.interaction.GeolocationDraw.prototype.setActive = function(active) {
  if (active === this.getActive()) return;
  ol.interaction.Interaction.prototype.setActive.call(this, active);
  this.overlayLayer_.setVisible(active);
  if (this.getMap()) {
    this.geolocation.setTracking(active);
    this.getMap().renderSync();
  }
  this.pause(!active);
  if (active) {
    // Start drawing
    this.reset();
    this.dispatchEvent({ type:'drawstart', feature: this.sketch_[1]});
  } else {
    var f = this.sketch_[1].clone();
    if (f.getGeometry()) {
      if (this.features_) this.features_.push(f);
      if (this.source_) this.source_.addFeature(f);
      this.dispatchEvent({ type:'drawend', feature: f});
    }
  }
};
/** Reset drawing
*/
ol.interaction.GeolocationDraw.prototype.reset = function() {
  this.sketch_[1].setGeometry();
  this.path_ = [];
  this.lastPosition_ = false;
};
/** Start tracking = setActive(true)
 */
ol.interaction.GeolocationDraw.prototype.start = function() {
  this.setActive(true);
};
/** Stop tracking = setActive(false)
 */
ol.interaction.GeolocationDraw.prototype.stop = function() {
  this.setActive(false);
};
/** Pause drawing
 * @param {boolean} b 
 */
ol.interaction.GeolocationDraw.prototype.pause = function(b) {
  this.pause_ = b!==false;
};
/** Is paused
 * @return {boolean} b 
 */
ol.interaction.GeolocationDraw.prototype.isPaused = function() {
  return this.pause_;
};
/** Enable following the track on the map
* @param {boolean|auto|position|visible} follow, 
*	false: don't follow, 
*	true: follow (position+zoom), 
*	'position': follow only position,
*	'auto': start following until user move the map,
*	'visible': center when position gets out of the visible extent
*/
ol.interaction.GeolocationDraw.prototype.setFollowTrack = function(follow) {
  this.set('followTrack', follow);
  var map = this.getMap();
  // Center if wanted
  if (follow !== false && !this.lastPosition_ && map) {
    var pos = this.path_[this.path_.length-1];
    if (pos) {
      map.getView().animate({
        center: pos,
        zoom: (follow!="position" ? this.get("zoom") : undefined)
      });
    }
  }
  this.lastPosition_ = false;				
  this.dispatchEvent({ type:'follow', following: follow!==false });
};
/** Add a new point to the current path
 * @private
 */
ol.interaction.GeolocationDraw.prototype.draw_ = function() {
  var map = this.getMap();
  if (!map) return;
  // Current location
  var loc = this.geolocation;
  var accu = loc.getAccuracy();
  var pos = loc.getPosition();
  pos.push (Math.round((loc.getAltitude()||0)*100)/100);
  pos.push (Math.round((new Date()).getTime()/1000));
  var p = loc.getAccuracyGeometry();
  // Center on point
  // console.log(this.get('followTrack'))
  switch (this.get('followTrack')) {
    // Follow center + zoom
    case true: {
      // modify zoom
      if (this.get('followTrack') == true) {
        map.getView().setZoom( this.get("zoom") || 16 );
        if (!ol.extent.containsExtent(map.getView().calculateExtent(map.getSize()), p.getExtent())) {
          map.getView().fit(p.getExtent());
        }
      }
      map.getView().setCenter( pos );
      break;
    }
    // Follow  position 
    case 'position': {
      // modify center
      map.getView().setCenter( pos );
      break;
    }
    // Keep on following 
    case 'auto': {
      if (this.lastPosition_) {
        var center = map.getView().getCenter();
        // console.log(center,this.lastPosition_)
        if (center[0]!=this.lastPosition_[0] || center[1]!=this.lastPosition_[1]) {
          //this.dispatchEvent({ type:'follow', following: false });
          this.setFollowTrack (false);
        } else {
          map.getView().setCenter( pos );	
          this.lastPosition_ = pos;
        }
      } else {
        map.getView().setCenter( pos );	
        if (this.get("zoom")) map.getView().setZoom( this.get("zoom") );
        this.lastPosition_ = pos;
      }
      break;
    }
    // Force to stay on the map
    case 'visible': {
      if (!ol.extent.containsCoordinate(map.getView().calculateExtent(map.getSize()), pos)) {
        map.getView().setCenter (pos);
      }
      break;
    }
    // Don't follow
    default: break;
  }
  // Draw occuracy
  var f = this.sketch_[0];
  f.setGeometry(p);
  if (accu < this.get("minAccuracy")/2) f.setStyle(this.locStyle.ok);
  else if (accu < this.get("minAccuracy")) f.setStyle(this.locStyle.warn);
  else f.setStyle(this.locStyle.error);
  var geo;
  if (!this.pause_ && this.condition_.call(this, loc)) {
    f = this.sketch_[1];
    this.path_.push(pos);
    switch (this.get("type")) {
      case "Point":
        this.path_ = [pos];
        f.setGeometry(new ol.geom.Point(pos, 'XYZM'));
        var attr = this.get('attributes');
        if (attr.heading) f.set("heading",loc.getHeading());
        if (attr.accuracy) f.set("accuracy",loc.getAccuracy());
        if (attr.altitudeAccuracy) f.set("altitudeAccuracy",loc.getAltitudeAccuracy());
        if (attr.speed) f.set("speed",loc.getSpeed());
        break;
      case "LineString":
        if (this.path_.length>1) {
          geo = new ol.geom.LineString(this.path_, 'XYZM');
          geo.simplify (this.get("tolerance"));
          f.setGeometry(geo);
        } else {
          f.setGeometry();
        }
        break;
      case "Polygon":
        if (this.path_.length>2) {
          geo = new ol.geom.Polygon([this.path_], 'XYZM');
          geo.simplify (this.get("tolerance"));
          f.setGeometry(geo);
        }
        else f.setGeometry();
        break;
    }
    this.dispatchEvent({ type:'drawing', feature: this.sketch_[1], geolocation: loc });
  }
  this.sketch_[2].setGeometry(new ol.geom.Point(pos));
  this.sketch_[2].set("heading",loc.getHeading());
  // Drawing
  this.dispatchEvent({ type:'tracking', feature: this.sketch_[1], geolocation: loc });
};

/** Interaction hover do to something when hovering a feature
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires hover, enter, leave
 * @param {olx.interaction.HoverOptions} 
 *  @param { string | undefined } options.cursor css cursor propertie or a function that gets a feature, default: none
 *  @param {function | undefined} optionsfeatureFilter filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature 
 *  @param {function | undefined} options.layerFilter filter a function with one argument, the layer to test. Return true to test the layer
 *  @param {Array<ol.layer> | undefined} options.layers a set of layers to test
 *  @param {number | undefined} options.hitTolerance Hit-detection tolerance in pixels.
 *  @param { function | undefined } options.handleEvent Method called by the map to notify the interaction that a browser event was dispatched to the map. The function may return false to prevent the propagation of the event to other interactions in the map's interactions chain.
 */
ol.interaction.Hover = function(options) {
  if (!options) options={};
  var self = this;
  ol.interaction.Interaction.call(this, {
    handleEvent: function(e) {
      if (e.type=="pointermove") { self.handleMove_(e); } 
      if (options.handleEvent) return options.handleEvent(e);
      return true; 
    }
  });
  if (options.layers && options.layers.length) {
    this.setFeatureFilter(function(f, l) {
      return (options.layers.indexOf(l) >= 0);
    })
  } else {
    this.setFeatureFilter (options.featureFilter);
  }
  this.setLayerFilter (options.layerFilter);
  this.set('hitTolerance', options.hitTolerance)
  this.setCursor (options.cursor);
};
ol.ext.inherits(ol.interaction.Hover, ol.interaction.Interaction);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.Hover.prototype.setMap = function(map) {
  if (this.previousCursor_!==undefined && this.getMap()) {
    this.getMap().getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = undefined;
  }
  ol.interaction.Interaction.prototype.setMap.call (this, map);
};
/**
 * Set cursor on hover
 * @param { string } cursor css cursor propertie or a function that gets a feature, default: none
 * @api stable
 */
ol.interaction.Hover.prototype.setCursor = function(cursor) {
  if (!cursor && this.previousCursor_!==undefined && this.getMap()) {
    this.getMap().getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = undefined;
  }
  this.cursor_ = cursor;
};
/** Feature filter to get only one feature
* @param {function} filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature 
*/
ol.interaction.Hover.prototype.setFeatureFilter = function(filter) {
  if (typeof (filter) == 'function') this.featureFilter_ = filter;
  else this.featureFilter_ = function(){ return true; };
};
/** Feature filter to get only one feature
* @param {function} filter a function with one argument, the layer to test. Return true to test the layer
*/
ol.interaction.Hover.prototype.setLayerFilter = function(filter) {
  if (typeof (filter) == 'function') this.layerFilter_ = filter;
  else this.layerFilter_ = function(){ return true; };
};
/** Get features whenmove
* @param {ol.event} e "move" event
*/
ol.interaction.Hover.prototype.handleMove_ = function(e) {
  var map = this.getMap();
  if (map) {
    //var b = map.hasFeatureAtPixel(e.pixel);
    var feature, layer;
    var self = this;
    var b = map.forEachFeatureAtPixel(
      e.pixel, 
      function(f, l) {
        if (self.layerFilter_.call(null, l) 
        && self.featureFilter_.call(null,f,l)) {
          feature = f;
          layer = l;
          return true;
        } else {
          feature = layer = null;
          return false;
        }
      },{ 
        hitTolerance: this.get('hitTolerance') 
      }
    );
    if (b) this.dispatchEvent({ 
      type: 'hover', 
      feature: feature, 
      layer: layer, 
      coordinate: e.coordinate, 
      pixel: e.pixel, 
      map: e.map, 
      dragging: e.dragging 
    });
    if (this.feature_===feature && this.layer_===layer){
      /* ok */
    } else {
      this.feature_ = feature;
      this.layer_ = layer;
      if (feature) {
        this.dispatchEvent({ 
          type: 'enter', 
          feature: feature, 
          layer: layer, 
          coordinate: e.coordinate, 
          pixel: e.pixel, 
          map: e.map, 
          dragging: e.dragging 
        });
      } else {
        this.dispatchEvent({ 
          type: 'leave', 
          coordinate: e.coordinate, 
          pixel: e.pixel, 
          map: e.map, 
          dragging: e.dragging 
        });
      }
    }
    if (this.cursor_) {
      var style = map.getTargetElement().style;
      if (b) {
        if (style.cursor != this.cursor_) {
          this.previousCursor_ = style.cursor;
          style.cursor = this.cursor_;
        }
      } else if (this.previousCursor_ !== undefined) {
        style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
      }
    }
  }
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction to handle longtouch events
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {olx.interaction.LongTouchOptions} 
 * 	@param {function | undefined} options.handleLongTouchEvent Function handling "longtouch" events, it will receive a mapBrowserEvent.
 *	@param {interger | undefined} options.delay The delay for a long touch in ms, default is 1000
 */
ol.interaction.LongTouch = function(options)
{	if (!options) options = {};
	this.delay_ = options.delay || 1000;
	var ltouch = options.handleLongTouchEvent || function(){};
	var _timeout = null;
	ol.interaction.Interaction.call(this,
	{	handleEvent: function(e)
		{	if (this.getActive())
			{	switch (e.type)
				{	case 'pointerdown': 
						if (_timeout) clearTimeout(_timeout);
						_timeout = setTimeout (function()
							{	e.type = "longtouch";
								ltouch(e) 
							}, this.delay_);
						break;
					/* case 'pointermove': */
					case 'pointerdrag':
					case 'pointerup':
						if (_timeout) 
						{	clearTimeout(_timeout);
							_timeout = null;
						}
						break;
					default: break;
				}
			}
			else
			{	if (_timeout) 
				{	clearTimeout(_timeout);
					_timeout = null;
				}
			}
			return true;
		}
	});
};
ol.ext.inherits(ol.interaction.LongTouch, ol.interaction.Interaction);

// Use ol.getUid for Openlayers < v6
/* Extent the ol/interaction/Modify with a getModifyFeatures
 * Get the features modified by the interaction
 * @return {Array<ol.Feature>} the modified features
 */
ol.interaction.Modify.prototype.getModifiedFeatures = function() {
  var featuresById = {};
  this.dragSegments_.forEach( function(s) {
    var feature = s[0].feature;
    // Openlayers > v.6
    if (window.ol && window.ol.util) featuresById[ol.util.getUid(feature)] = feature;
    // old version of Openlayers (< v.6) or ol all versions
    else featuresById[ol.getUid(feature)] = feature;
  });
  var features = [];
  for (var i in featuresById) features.push(featuresById[i]);
  return features;
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction for modifying feature geometries. Similar to the core ol/interaction/Modify.
 * The interaction is more suitable to use to handle feature modification: only features concerned 
 * by the modification are passed to the events (instead of all feature with ol/interaction/Modify)
 * - the modifystart event is fired before the feature is modified (no points still inserted)
 * - the modifyend event is fired after the modification
 * - it fires a modifying event
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @fires modifystart
 * @fires modifying
 * @fires modifyend
 * @param {*} options
 *	@param {ol.source.Vector|Array<ol.source.Vector>} options.source a list of source to modify (configured with useSpatialIndex set to true)
 *  @param {ol.Collection.<ol.Feature>} options.features collection of feature to modify
 *  @param {integer} options.pixelTolerance Pixel tolerance for considering the pointer close enough to a segment or vertex for editing. Default is 10.
 *  @param {function|undefined} options.filter a filter that takes a feature and return true if it can be modified, default always true.
 *  @param {ol.style.Style | Array<ol.style.Style> | undefined} options.style Style for the sketch features.
 *  @param {ol.EventsConditionType | undefined} options.condition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event will be considered to add or move a vertex to the sketch. Default is ol.events.condition.primaryAction.
 *  @param {ol.EventsConditionType | undefined} options.deleteCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event should be handled. By default, ol.events.condition.singleClick with ol.events.condition.altKeyOnly results in a vertex deletion.
 *  @param {ol.EventsConditionType | undefined} options.insertVertexCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether a new vertex can be added to the sketch features. Default is ol.events.condition.always
 */
ol.interaction.ModifyFeature = function(options){
  if (!options) options = {};
  var dragging, modifying;
  ol.interaction.Pointer.call(this,{
    /*
    handleDownEvent: this.handleDownEvent,
    handleDragEvent: this.handleDragEvent,
    handleMoveEvent: this.handleMoveEvent,
    handleUpEvent: this.handleUpEvent,
    */
    handleEvent: function(e) {
      switch(e.type) {
        case 'pointerdown': {
          dragging = this.handleDownEvent(e);
          modifying = dragging || this._deleteCondition(e);
          return !dragging;
        }
        case 'pointerup': {
          dragging = false;
          return this.handleUpEvent(e);
        }
        case 'pointerdrag': {
          if (dragging) return this.handleDragEvent(e);
          else return true;
        }
        case 'pointermove': {
          if (!dragging) return this.handleMoveEvent(e);
          else return true;
        }
        case 'singleclick':
        case 'click': {
          // Prevent click when modifying
          return !modifying;
        }
        default: return true;
      }
    }
  });
  // Snap distance (in px)
  this.snapDistance_ = options.pixelTolerance || 10;
  // Split tolerance between the calculated intersection and the geometry
  this.tolerance_ = 1e-10;
  // Cursor
  this.cursor_ = options.cursor;
  // List of source to split
  this.sources_ = options.sources ? (options.sources instanceof Array) ? options.sources:[options.sources] : [];
  if (options.features) {
    this.sources_.push (new ol.source.Vector({ features: options.features }));
  }
  // Get all features candidate
  this.filterSplit_ = options.filter || function(){ return true; };
  this._condition = options.condition || ol.events.condition.primaryAction;
  this._deleteCondition = options.deleteCondition || ol.events.condition.altKeyOnly;
  this._insertVertexCondition = options.insertVertexCondition || ol.events.condition.always;
  // Default style
  var sketchStyle = function() {
    return [ new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({ color: [0, 153, 255, 1] }),
          stroke: new ol.style.Stroke({ color: '#FFF', width: 1.25 })
        })
      })
    ];
  }
  // Custom style
  if (options.style) {
    if (typeof(options.style) === 'function') {
      sketchStyle = options.style
     } else {
       sketchStyle = function() { return options.style; }
     }
  }
  // Create a new overlay for the sketch
  this.overlayLayer_ = new ol.layer.Vector({
    source: new ol.source.Vector({
      useSpatialIndex: false
    }),
    name:'Modify overlay',
    displayInLayerSwitcher: false,
    style: sketchStyle
  });
};
ol.ext.inherits(ol.interaction.ModifyFeature, ol.interaction.Pointer);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.ModifyFeature.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
  ol.interaction.Interaction.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
};
/**
 * Activate or deactivate the interaction + remove the sketch.
 * @param {boolean} active.
 * @api stable
 */
ol.interaction.ModifyFeature.prototype.setActive = function(active) {
  ol.interaction.Interaction.prototype.setActive.call (this, active);
  if (this.overlayLayer_) this.overlayLayer_.getSource().clear();
};
/** Get closest feature at pixel
 * @param {ol.Pixel} 
 * @return {*} 
 * @private
 */
ol.interaction.ModifyFeature.prototype.getClosestFeature = function(e) {
  var f, c, d = this.snapDistance_+1;
  for (var i=0; i<this.sources_.length; i++) {
    var source = this.sources_[i];
    f = source.getClosestFeatureToCoordinate(e.coordinate);
    if (f && this.filterSplit_(f)) {
      var ci = f.getGeometry().getClosestPoint(e.coordinate);
      var di = ol.coordinate.dist2d(e.coordinate,ci) / e.frameState.viewState.resolution;
      if (di < d){
        d = di;
        c = ci;
      }
      break;
    }
  }
  if (d > this.snapDistance_) {
    return false;
  } else {
    // Snap to node
    var coord = this.getNearestCoord (c, f.getGeometry());
    if (coord) {
      coord = coord.coord;
      var p = this.getMap().getPixelFromCoordinate(coord);
      if (ol.coordinate.dist2d(e.pixel, p) < this.snapDistance_) {
        c = coord;
      }
      //
      return { source:source, feature:f, coord: c };
    }
  }
}
/** Get nearest coordinate in a list 
* @param {ol.coordinate} pt the point to find nearest
* @param {ol.geom} coords list of coordinates
* @return {*} the nearest point with a coord (projected point), dist (distance to the geom), ring (if Polygon)
*/
ol.interaction.ModifyFeature.prototype.getNearestCoord = function(pt, geom) {
  var i, l, p, p0, dm;
  switch (geom.getType()) {
    case 'Point': {
      return { coord: geom.getCoordinates(), dist: ol.coordinate.dist2d(geom.getCoordinates(), pt) };
    }
    case 'MultiPoint': {
      return this.getNearestCoord (pt, new ol.geom.LineString(geom.getCoordinates()));
    }
    case 'LineString':
    case 'LinearRing': {
      var d;
      dm = Number.MAX_VALUE;
      var coords = geom.getCoordinates();
      for (i=0; i < coords.length; i++) {
        d = ol.coordinate.dist2d (pt, coords[i]);
        if (d < dm) {
          dm = d;
          p0 = coords[i];
        }
      }
      return { coord: p0, dist: dm };
    }
    case 'MultiLineString': {
      var lstring = geom.getLineStrings();
      p0 = false, dm = Number.MAX_VALUE;
      for (i=0; l=lstring[i]; i++) {
        p = this.getNearestCoord(pt, l);
        if (p && p.dist<dm) {
          p0 = p;
          dm = p.dist;
          p0.ring = i;
        }
      }
      return p0;
    }
    case 'Polygon': {
      var lring = geom.getLinearRings();
      p0 = false;
      dm = Number.MAX_VALUE;
      for (i=0; l=lring[i]; i++) {
        p = this.getNearestCoord(pt, l);
        if (p && p.dist<dm) {
          p0 = p;
          dm = p.dist;
          p0.ring = i;
        }
      }
      return p0;
    }
    case 'MultiPolygon': {
      var poly = geom.getPolygons();
      p0 = false;
      dm = Number.MAX_VALUE;
      for (i=0; l=poly[i]; i++) {
        p = this.getNearestCoord(pt, l);
        if (p && p.dist<dm) {
          p0 = p;
          dm = p.dist;
          p0.poly = i;
        }
      }
      return p0;
    }
    case 'GeometryCollection': {
      var g = geom.getGeometries();
      p0 = false;
      dm = Number.MAX_VALUE;
      for (i=0; l=g[i]; i++) {
        p = this.getNearestCoord(pt, l);
        if (p && p.dist<dm) {
          p0 = p;
          dm = p.dist;
          p0.geom = i;
        }
      }
      return p0;
    }
    default: return false;
  }
};
/** Get arcs concerned by a modification 
 * @param {ol.geom} geom the geometry concerned
 * @param {ol.coordinate} coord pointed coordinates
 */
ol.interaction.ModifyFeature.prototype.getArcs = function(geom, coord) {
  var arcs = false;
  var coords, i, s, l;
  switch(geom.getType()) {
    case 'Point': {
      if (ol.coordinate.equal(coord, geom.getCoordinates())) {
        arcs = { 
          geom: geom, 
          type: geom.getType(),
          coord1: [],
          coord2: [],
          node: true
        }
      }
      break;
    }
    case 'MultiPoint': {
      coords = geom.getCoordinates();
      for (i=0; i < coords.length; i++) {
        if (ol.coordinate.equal(coord, coords[i])) {
          arcs = { 
            geom: geom, 
            type: geom.getType(),
            index: i,
            coord1: [],
            coord2: [],
            node: true
          }
          break;
        }
      }
      break;
    }
    case 'LinearRing': 
    case 'LineString': {
      var p = geom.getClosestPoint(coord);
      if (ol.coordinate.dist2d(p,coord) < 1.5*this.tolerance_) {
        var split;
        // Split the line in two
        if (geom.getType() === 'LinearRing') {
          var g = new ol.geom.LineString(geom.getCoordinates());
          split = g.splitAt(coord, this.tolerance_);
        } else {
          split = geom.splitAt(coord, this.tolerance_);
        }
        // If more than 2
        if (split.length>2) {
          coords = split[1].getCoordinates();
          for (i=2; s=split[i]; i++) {
            var c = s.getCoordinates();
            c.shift();
            coords = coords.concat(c);
          }
          split = [ split[0], new ol.geom.LineString(coords) ];
        }
        // Split in two
        if (split.length === 2) {
          var c0 = split[0].getCoordinates();
          var c1 = split[1].getCoordinates();
          var nbpt = c0.length + c1.length -1;
          c0.pop();
          c1.shift();
          arcs = { 
            geom: geom, 
            type: geom.getType(),
            coord1: c0, 
            coord2: c1,
            node: (geom.getCoordinates().length === nbpt),
            closed: false
          }
        } else if (split.length === 1) {
          s = split[0].getCoordinates();
          var start = ol.coordinate.equal(s[0], coord);
          var end = ol.coordinate.equal(s[s.length-1], coord);
          // Move first point
          if (start) {
            s.shift();
            if (end) s.pop();
            arcs = { 
              geom: geom, 
              type: geom.getType(),
              coord1: [], 
              coord2: s,
              node: true,
              closed: end
            }
          } else if (end) {
            // Move last point
            s.pop()
            arcs = { 
              geom: geom, 
              type: geom.getType(),
              coord1: s, 
              coord2: [],
              node: true,
              closed: false
            }
          }
        }
      }
      break;
    }
    case 'MultiLineString': {
      var lstring = geom.getLineStrings();
      for (i=0; l=lstring[i]; i++) {
        arcs = this.getArcs(l, coord);
        if (arcs) {
          arcs.geom = geom;
          arcs.type = geom.getType();
          arcs.lstring = i;
          break;
        }
      }
      break;
    }
    case 'Polygon': {
      var lring = geom.getLinearRings();
      for (i=0; l=lring[i]; i++) {
        arcs = this.getArcs(l, coord);
        if (arcs) {
          arcs.geom = geom;
          arcs.type = geom.getType();
          arcs.index = i;
          break;
        }
      }
      break;
    }
    case 'MultiPolygon': {
      var poly = geom.getPolygons();
      for (i=0; l=poly[i]; i++) {
        arcs = this.getArcs(l, coord);
        if (arcs) {
          arcs.geom = geom;
          arcs.type = geom.getType();
          arcs.poly = i;
          break;
        }
      }
      break;
    }
    case 'GeometryCollection': {
      // var g = geom.getGeometries();
      for (i=0; l=g[i]; i++) {
        arcs = this.getArcs(l, coord);
        if (arcs) {
          arcs.geom = geom;
          arcs.g = i;
          arcs.typeg = arcs.type;
          arcs.type = geom.getType();
          break;
        }
      }
      break;
    }
    default: {
      console.error('ol/interaction/ModifyFeature '+geom.getType()+' not supported!');
      break;
    }
  }
  return arcs;
};
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ol.interaction.ModifyFeature.prototype.handleDownEvent = function(evt) {
  if (!this.getActive()) return false;
  // Something to split ?
  var current = this.getClosestFeature(evt);
  if (current && (this._condition(evt) || this._deleteCondition(evt))) {
    var features = [];
    this.arcs = [];
    // Get features concerned
    this.sources_.forEach(function(s) {
      var extent = ol.extent.buffer (ol.extent.boundingExtent([current.coord]), this.tolerance_);
      features = features.concat(features, s.getFeaturesInExtent(extent));
    }.bind(this));
    // Get arcs concerned
    this._modifiedFeatures = [];
    features.forEach(function(f) {
      var a = this.getArcs(f.getGeometry(), current.coord);
      if (a) {
        if (this._insertVertexCondition(evt) || a.node) {
          a.feature = f;
          this._modifiedFeatures.push(f);
          this.arcs.push(a);
        }
      }
    }.bind(this));
    if (this._modifiedFeatures.length) {
      if (this._deleteCondition(evt)) {
        return !this._removePoint(current, evt); 
      } else {
        this.dispatchEvent({ 
          type:'modifystart', 
          coordinate: current.coord,
          originalEvent: evt.originalEvent,
          features: this._modifiedFeatures
        });
        this.handleDragEvent({ coordinate: current.coord })
        return true;
      }
    } else {
      return true;
    }
  } else {
    return false;
  }
};
/** Get modified features
 * @return {Array<ol.Feature>} list of modified features
 */
ol.interaction.ModifyFeature.prototype.getModifiedFeatures = function() {
  return this._modifiedFeatures || [];
};
/** Removes the vertex currently being pointed.
 */
ol.interaction.ModifyFeature.prototype.removePoint = function() {
  this._removePoint({},{});
};
/**
 * @private
 */
ol.interaction.ModifyFeature.prototype._getModification = function(a) {
  var coords = a.coord1.concat(a.coord2);
  switch (a.type) {
    case 'LineString': {
      if (a.closed) coords.push(coords[0]);
      if (coords.length>1) {
        if (a.geom.getCoordinates().length != coords.length) {
          a.coords = coords;
          return true;
        }
      }
      break;
    }
    case 'MultiLineString': {
      if (a.closed) coords.push(coords[0]);
      if (coords.length>1) {
        var c = a.geom.getCoordinates();
        if (c[a.lstring].length != coords.length) {
          c[a.lstring] = coords;
          a.coords = c;
          return true;
        }
      }
      break;
    }
    case 'Polygon': {
      if (a.closed) coords.push(coords[0]);
      if (coords.length>3) {
        c = a.geom.getCoordinates();
        if (c[a.index].length != coords.length) {
          c[a.index] = coords;
          a.coords = c;
          return true;
        }
      }
      break;
    }
    case 'MultiPolygon': {
      if (a.closed) coords.push(coords[0]);
      if (coords.length>3) {
        c = a.geom.getCoordinates();
        if (c[a.poly][a.index].length != coords.length) {
          c[a.poly][a.index] = coords;
          a.coords = c;
          return true;
        }
      }
      break;
    }
    case 'GeometryCollection': {
      a.type = a.typeg;
      var geom = a.geom;
      var geoms = geom.getGeometries();
      a.geom = geoms[a.g];
      var found = this._getModification(a);
      // Restore current arc
      geom.setGeometries(geoms);
      a.geom = geom;
      a.type = 'GeometryCollection';
      return found;
    }
    default: {
      //console.error('ol/interaction/ModifyFeature '+a.type+' not supported!');
      break;
    }
  }
  return false;
};
/** Removes the vertex currently being pointed.
 * @private
 */
ol.interaction.ModifyFeature.prototype._removePoint = function(current, evt) {
  if (!this.arcs) return false;
  this.overlayLayer_.getSource().clear();
  var found = false;
  // Get all modifications
  this.arcs.forEach(function(a) {
    found = found || this._getModification(a);
  }.bind(this));
  // Almost one point is removed
  if (found) {
    this.dispatchEvent({ 
      type:'modifystart', 
      coordinate: current.coord,
      originalEvent: evt.originalEvent,
      features: this._modifiedFeatures
    });
    this.arcs.forEach(function(a) {
      if (a.geom.getType() === 'GeometryCollection') {
        if (a.coords) {
          var geoms = a.geom.getGeometries();
          geoms[a.g].setCoordinates(a.coords);
          a.geom.setGeometries(geoms);
        }
      } else {
        if (a.coords) a.geom.setCoordinates(a.coords);
      }
    }.bind(this));
    this.dispatchEvent({ 
      type:'modifyend', 
      coordinate: current.coord,
      originalEvent: evt.originalEvent,
      features: this._modifiedFeatures
    });
  }
  this.arcs = [];
  return found;
};
/**
 * @private
 */
ol.interaction.ModifyFeature.prototype.handleUpEvent = function(e) {
  if (!this.getActive()) return false;
  if (!this.arcs || !this.arcs.length) return true;
  this.overlayLayer_.getSource().clear();
  this.dispatchEvent({ 
    type:'modifyend', 
    coordinate: e.coordinate,
    originalEvent: e.originalEvent,
    features: this._modifiedFeatures
  });
  this.arcs = [];
  return true;
};
/**
 * @private
 */
ol.interaction.ModifyFeature.prototype.setArcCoordinates = function(a, coords) {
  var c;
  switch (a.type) {
    case 'Point': {
      a.geom.setCoordinates(coords[0]);
      break;
    }
    case 'MultiPoint': {
      c = a.geom.getCoordinates();
      c[a.index] = coords[0];
      a.geom.setCoordinates(c);
      break;
    }
    case 'LineString': {
      a.geom.setCoordinates(coords);
      break;
    }
    case 'MultiLineString': {
      c = a.geom.getCoordinates();
      c[a.lstring] = coords;
      a.geom.setCoordinates(c);
      break;
    }
    case 'Polygon': {
      c = a.geom.getCoordinates();
      c[a.index] = coords;
      a.geom.setCoordinates(c);
      break;
    }
    case 'MultiPolygon': {
      c = a.geom.getCoordinates();
      c[a.poly][a.index] = coords;
      a.geom.setCoordinates(c);
      break;
    }
    case 'GeometryCollection': {
      a.type = a.typeg;
      var geom = a.geom;
      var geoms = geom.getGeometries();
      a.geom = geoms[a.g];
      this.setArcCoordinates(a, coords);
      geom.setGeometries(geoms);
      a.geom = geom;
      a.type = 'GeometryCollection';
      break;
    }
  }
};
/**
 * @private
 */
ol.interaction.ModifyFeature.prototype.handleDragEvent = function(e) {
  if (!this.getActive()) return false;
  if (!this.arcs) return true;
  // Show sketch
  this.overlayLayer_.getSource().clear();
  var p = new ol.Feature(new ol.geom.Point(e.coordinate));
  this.overlayLayer_.getSource().addFeature(p);
  // Nothing to do
  if (!this.arcs.length) return true;
  // Move arcs
  this.arcs.forEach(function(a) {
    var coords = a.coord1.concat([e.coordinate], a.coord2);
    if (a.closed) coords.push(e.coordinate);
    this.setArcCoordinates(a, coords);
  }.bind(this));
  this.dispatchEvent({ 
    type:'modifying', 
    coordinate: e.coordinate,
    originalEvent: e.originalEvent,
    features: this._modifiedFeatures
  });
  return true;
};
/**
 * @param {ol.MapBrowserEvent} evt Event.
 * @private
 */
ol.interaction.ModifyFeature.prototype.handleMoveEvent = function(e) {
  if (!this.getActive()) return false;
  this.overlayLayer_.getSource().clear();
  var current = this.getClosestFeature(e);
  // Draw sketch
  if (current) {
    var p = new ol.Feature(new ol.geom.Point(current.coord));
    this.overlayLayer_.getSource().addFeature(p);
  }
  // Show cursor
  var element = e.map.getTargetElement();
  if (this.cursor_) {
    if (current) {
      if (element.style.cursor != this.cursor_) {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Modify interaction with a popup to delet a point on touch device
 * @constructor
 * @fires showpopup
 * @fires hidepopup
 * @extends {ol.interaction.Modify}
 * @param {olx.interaction.ModifyOptions} options
 *  @param {String|undefined} options.title title to display, default "remove point"
 *  @param {Boolean|undefined} options.usePopup use a popup, default true
 */
ol.interaction.ModifyTouch = function(options) {
  var self = this;
  if (!options) options = {};
  this._popup = new ol.Overlay.Popup ({
    popupClass: options.calssName || 'modifytouch',
    positioning: 'bottom-rigth',
    offsetBox: 10
  });
  this._source = options.source;
  this._features = options.features;
  // popup content
  var a = document.createElement('a');
  a.appendChild(document.createTextNode(options.title || "remove point"));
  a.onclick = function() {
    self.removePoint();
  };
  this.setPopupContent(a);
  var pixelTolerance = options.pixelTolerance || 0;
  var searchDist = pixelTolerance +5;
  // Check if there is a feature to select
  options.condition = function(e) {
		var features = this.getMap().getFeaturesAtPixel(e.pixel,{
      hitTolerance: searchDist
    });
    var p0, p1, found = false;
		if (features) {
      var search = this._features;
      if (!search) {
        p0 = [e.pixel[0] - searchDist, e.pixel[1] - searchDist]
        p1 = [e.pixel[0] + searchDist, e.pixel[1] + searchDist]
        p0 = this.getMap().getCoordinateFromPixel(p0);
        p1 = this.getMap().getCoordinateFromPixel(p1);
        var ext = ol.extent.boundingExtent([p0,p1]);
        search = this._source.getFeaturesInExtent(ext);
      } 
      if (search.getArray) search = search.getArray();
      for (var i=0, f; f=features[i]; i++) {
        if (search.indexOf(f) >= 0) break;
      }
      if (f) {
        p0 = e.pixel;
        p1 = f.getGeometry().getClosestPoint(e.coordinate);
        p1 = this.getMap().getPixelFromCoordinate(p1);
        var dx = p0[0] - p1[0];
        var dy = p0[1] - p1[1];
        found = (Math.sqrt(dx*dx+dy*dy) < searchDist);
      }
    }
    // Show popup if any
    this.showDeleteBt(found ? { type:'show', feature:f, coordinate: e.coordinate } : { type:'hide' });
    // Prevent click on the popup
    e.preventDefault();
    e.stopPropagation();
		return true;
  };
  // Hide popup on insert
	options.insertVertexCondition = function() {
		this.showDeleteBt({ type:'hide' });
		return true;
  }
  ol.interaction.Modify.call(this, options);
  this.on(['modifystart','modifyend'], function(){
		this.showDeleteBt({ type:'hide', modifying: true });
  });
  // Use a popup ?
  this.set('usePopup', options.usePopup !== false);
};
ol.ext.inherits(ol.interaction.ModifyTouch, ol.interaction.Modify);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.ModifyTouch.prototype.setMap = function(map) {	
  if (this.getMap()) {
    this.getMap().removeOverlay(this._popup);
  }
	ol.interaction.Modify.prototype.setMap.call (this, map);
  if (this.getMap()) {
    this.getMap().addOverlay(this._popup);
  }
};
/** Activate the interaction and remove popup
 * @param {Boolean} b
 */
ol.interaction.ModifyTouch.prototype.setActive = function(b) {	
  ol.interaction.Modify.prototype.setActive.call (this, b);
  this.showDeleteBt({ type:'hide' });
};
/**
 * Remove the current point
 */
ol.interaction.ModifyTouch.prototype.removePoint = function() {	
  // Prevent touch + click on popup 
  if (new Date() - this._timeout < 200) return;
  // Remove point
  ol.interaction.Modify.prototype.removePoint.call (this);
  this.showDeleteBt({ type:'hide' });
}
/**
 * Show the delete button (menu)
 * @param {Event} e
 * @api stable
 */
ol.interaction.ModifyTouch.prototype.showDeleteBt = function(e) {
  if (this.get('usePopup') && e.type==='show') {
    this._popup.show(e.coordinate, this._menu);
  } else {
    this._popup.hide();
  }
  e.type += 'popup';
  this.dispatchEvent(e);
  // Date if popup start a timeout to prevent touch + click on the popup
  this._timeout = new Date();
};
/**
 * Change the popup content
 * @param {DOMElement} html 
 */
ol.interaction.ModifyTouch.prototype.setPopupContent = function(html) {
  this._menu = html;
}
/**
 * Get the popup content
 * @return {DOMElement}
 */
ol.interaction.ModifyTouch.prototype.getPopupContent = function() {
  return this._menu;
}

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Offset interaction for offseting feature geometry
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @fires offsetstart
 * @fires offsetting
 * @fires offsetend
 * @param {any} options
 *	@param {ol.layer.Vector | Array<ol.layer.Vector>} options.layers list of feature to transform 
 *	@param {ol.Collection.<ol.Feature>} options.features collection of feature to transform
 *	@param {ol.source.Vector | undefined} options.source source to duplicate feature when ctrl key is down
 *	@param {boolean} options.duplicate force feature to duplicate (source must be set)
 */
ol.interaction.Offset = function(options) {
  if (!options) options = {};
	// Extend pointer
	ol.interaction.Pointer.call(this, {
    handleDownEvent: this.handleDownEvent_,
    handleDragEvent: this.handleDragEvent_,
    handleMoveEvent: this.handleMoveEvent_,
    handleUpEvent: this.handleUpEvent_
  });
	// Collection of feature to transform
	this.features_ = options.features;
	// List of layers to transform
  this.layers_ = options.layers ? (options.layers instanceof Array) ? options.layers:[options.layers] : null;
  // duplicate
  this.set('duplicate', options.duplicate);
  this.source_ = options.source;
  // init
  this.previousCursor_ = false;
};
ol.ext.inherits(ol.interaction.Offset, ol.interaction.Pointer);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.Offset.prototype.setMap = function(map) {
	ol.interaction.Pointer.prototype.setMap.call (this, map);
};
/** Get Feature at pixel
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {any} a feature and the hit point
 * @private
 */
ol.interaction.Offset.prototype.getFeatureAtPixel_ = function(e) {
  var self = this;
	return this.getMap().forEachFeatureAtPixel(e.pixel,
		function(feature, layer) {
      var current;
			// feature belong to a layer
			if (self.layers_) {
        for (var i=0; i<self.layers_.length; i++) {
          if (self.layers_[i]===layer) {
            current = feature;
            break;
          }
				}
			}
			// feature in the collection
			else if (self.features_) {
        self.features_.forEach (function(f) {
          if (f===feature) {
            current = feature 
          }
        });
			}
			// Others
			else {
        current = feature;
      }
      // Only poygon or linestring
      var typeGeom = current.getGeometry().getType();
      if (current && /Polygon|LineString/.test(typeGeom)) {
        if (typeGeom==='Polygon' && current.getGeometry().getCoordinates().length>1) return false;
        // test distance
        var p = current.getGeometry().getClosestPoint(e.coordinate);
        var dx = p[0]-e.coordinate[0];
        var dy = p[1]-e.coordinate[1];
        var d = Math.sqrt(dx*dx+dy*dy) / e.frameState.viewState.resolution;
        if (d<5) {
          return { 
            feature: current, 
            hit: p, 
            coordinates: current.getGeometry().getCoordinates(),
            geom: current.getGeometry().clone(),
            geomType: typeGeom
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
		},  { hitTolerance: 5 });
};
/**
 * @param {ol.MapBrowserEvent} e Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 * @private
 */
ol.interaction.Offset.prototype.handleDownEvent_ = function(e) {	
  this.current_ = this.getFeatureAtPixel_(e);
  if (this.source_ && (this.get('duplicate') || e.originalEvent.ctrlKey)) {
    this.current_.feature = this.current_.feature.clone();
    this.source_.addFeature(this.current_.feature);
  } else {
    // Modify the current feature
    if (this.current_) {
      this.dispatchEvent({ type:'modifystart', features: [ this.current_.feature ] });
    }
  }
	if (this.current_) {
    this.dispatchEvent({ type:'offsetstart', feature: this.current_.feature, offset: 0 });
    return true;
  } else  {
    return false;
  }
};
/**
 * @param {ol.MapBrowserEvent} e Map browser event.
 * @private
 */
ol.interaction.Offset.prototype.handleDragEvent_ = function(e) {
  var p = this.current_.geom.getClosestPoint(e.coordinate);
  var d = ol.coordinate.dist2d(p, e.coordinate);
  var seg, v1, v2, offset;
  switch (this.current_.geomType) {
    case  'Polygon': {
      seg = ol.coordinate.findSegment(p, this.current_.coordinates[0]).segment;
      if (seg) {
        v1 = [ seg[1][0]-seg[0][0], seg[1][1]-seg[0][1] ];
        v2 = [ e.coordinate[0]-p[0], e.coordinate[1]-p[1] ];
        if (v1[0]*v2[1] - v1[1]*v2[0] > 0) {
          d = -d;
        }
        offset = [];
        for (var i=0; i<this.current_.coordinates.length; i++) {
          offset.push( ol.coordinate.offsetCoords(this.current_.coordinates[i], i==0 ? d : -d) );
        }
        this.current_.feature.setGeometry(new ol.geom.Polygon(offset));
      }
      break;
    }
    case 'LineString': {
      seg = ol.coordinate.findSegment(p, this.current_.coordinates).segment;
      if (seg) {
        v1 = [ seg[1][0]-seg[0][0], seg[1][1]-seg[0][1] ];
        v2 = [ e.coordinate[0]-p[0], e.coordinate[1]-p[1] ];
        if (v1[0]*v2[1] - v1[1]*v2[0] > 0) {
          d = -d;
        }
        offset = ol.coordinate.offsetCoords(this.current_.coordinates, d);
        this.current_.feature.setGeometry(new ol.geom.LineString(offset));
      }
      break;
    }
    default: {
      break;
    }
  }
  this.dispatchEvent({ type:'offsetting', feature: this.current_.feature, offset: d, segment: [p, e.coordinate], coordinate: e.coordinate });  
};
/**
 * @param {ol.MapBrowserEvent} e Map browser event.
 * @private
 */
ol.interaction.Offset.prototype.handleUpEvent_ = function(e) {
  this.dispatchEvent({ type:'offsetend', feature: this.current_.feature, coordinate: e.coordinate });  
  this.current_ = false;
};
/**
 * @param {ol.MapBrowserEvent} e Event.
 * @private
 */
ol.interaction.Offset.prototype.handleMoveEvent_ = function(e) {	
  var f = this.getFeatureAtPixel_(e);
  if (f) {
    if (this.previousCursor_ === false) {
      this.previousCursor_ = e.map.getTargetElement().style.cursor;
    }
    e.map.getTargetElement().style.cursor = 'pointer';
  } else {
    e.map.getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = false;
  }
};

/*	
  Water ripple effect.
  Original code (Java) by Neil Wallis 
  @link http://www.neilwallis.com/java/water.html
  Original code (JS) by Sergey Chikuyonok (serge.che@gmail.com)
  @link http://chikuyonok.ru
  @link http://media.chikuyonok.ru/ripple/
  Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  @link https://github.com/Viglino
*/
/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @param {*} options
 *  @param {ol/layer/Layer} options.layer layer to animate
 *  @param {number} options.radius raindrop radius
 *  @param {number} options.interval raindrop interval (in ms), default 1000
 */
ol.interaction.Ripple = function(options) {
  ol.interaction.Pointer.call(this, {
    handleDownEvent: this.rainDrop,
    handleMoveEvent: this.rainDrop
  });
  // Default options
  options = options||{};
  this.riprad = options.radius || 3;
  this.ripplemap = [];
  this.last_map = [];
  // Generate random ripples
  this.rains (this.interval);
  options.layer.on(['postcompose', 'postrender'], this.postcompose_.bind(this));
};
ol.ext.inherits(ol.interaction.Ripple, ol.interaction.Pointer);
/** Generate random rain drop
*	@param {integer} interval
*/
ol.interaction.Ripple.prototype.rains = function(interval) {
  if (this.onrain) clearTimeout (this.onrain);
  var self = this;
  var vdelay = (typeof(interval)=="number" ? interval : 1000)/2;
  var delay = 3*vdelay/2;
  var rnd = Math.random;
  function rain() {
    if (self.width) self.rainDrop([rnd() * self.width, rnd() * self.height]);
    self.onrain = setTimeout (rain, rnd()*vdelay + delay);
  }
  // Start raining
  if (delay) rain();
}
/** Disturb water at specified point
*	@param {ol.Pixel|ol.MapBrowserEvent}
*/
ol.interaction.Ripple.prototype.rainDrop = function(e) {
  if (!this.width) return;
  var dx,dy;
  if (e.pixel) {
    dx = e.pixel[0]*this.ratio;
    dy = e.pixel[1]*this.ratio;
  } else {
    dx = e[0]*this.ratio;
    dy = e[1]*this.ratio;
  }
  dx <<= 0;
  dy <<= 0;
  for (var j = dy - this.riprad*this.ratio; j < dy + this.riprad*this.ratio; j++) {
    for (var k = dx - this.riprad*this.ratio; k < dx + this.riprad*this.ratio; k++) {
      this.ripplemap[this.oldind + (j * this.width) + k] += 128;
    }
  }
}
/** Postcompose function
*/
ol.interaction.Ripple.prototype.postcompose_ = function(e) {
  var ctx = e.context;
  var canvas = ctx.canvas;
  // Initialize when canvas is ready / modified
  if (this.width != canvas.width || this.height != canvas.height) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ratio = e.frameState.pixelRatio;
    this.half_width = this.width >> 1;
    this.half_height = this.height >> 1;
    this.size = this.width * (this.height + 2) * 2;
    this.oldind = this.width;
    this.newind = this.width * (this.height + 3);
    for (var i = 0; i < this.size; i++) {
      this.last_map[i] = this.ripplemap[i] = 0;
    }
  }
  this.texture = ctx.getImageData(0, 0, this.width, this.height);
  this.ripple = ctx.getImageData(0, 0, this.width, this.height);	
  // Run animation
  var a, b, data, cur_pixel, new_pixel;
    var t = this.oldind; this.oldind = this.newind; this.newind = t;
    i = 0;
    var _rd = this.ripple.data,
        _td = this.texture.data;
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
          var _newind = this.newind + i,
      _mapind = this.oldind + i;
      data = (
          this.ripplemap[_mapind - this.width] + 
          this.ripplemap[_mapind + this.width] + 
          this.ripplemap[_mapind - 1] + 
          this.ripplemap[_mapind + 1]) >> 1;
      data -= this.ripplemap[_newind];
      data -= data >> 5;
      this.ripplemap[_newind] = data;
      //where data=0 then still, where data>0 then wave
      data = 1024 - data;
      if (this.last_map[i] != data) {
        this.last_map[i] = data;
        //offsets
        a = (((x - this.half_width) * data / 1024) << 0) + this.half_width;
        b = (((y - this.half_height) * data / 1024) << 0) + this.half_height;
        //bounds check
        if (a >= this.width) a = this.width - 1;
        if (a < 0) a = 0;
        if (b >= this.height) b = this.height - 1;
        if (b < 0) b = 0;
        new_pixel = (a + (b * this.width)) * 4;
        cur_pixel = i * 4;
        /**/
        _rd[cur_pixel] = _td[new_pixel];
        _rd[cur_pixel + 1] = _td[new_pixel + 1];
        _rd[cur_pixel + 2] = _td[new_pixel + 2];
        /*/
        // only in blue pixels 
                if (_td[new_pixel + 2]>_td[new_pixel + 1]
          && _td[new_pixel + 2]>_td[new_pixel])
        {
                _rd[cur_pixel] = _td[new_pixel];
                _rd[cur_pixel + 1] = _td[new_pixel + 1];
                _rd[cur_pixel + 2] = _td[new_pixel + 2];
        }
        else this.ripplemap[_newind] = 0;
        /**/
      }
      ++i;
    }
  }
  ctx.putImageData(this.ripple, 0, 0);
  // tell OL3 to continue postcompose animation
  this.getMap().render(); 
};

/*
	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (http://www.cecill.info/).
	ol.interaction.SelectCluster is an interaction for selecting vector features in a cluster.
*/
/**
 * @classdesc
 * Interaction for selecting vector features in a cluster. 
 * It can be used as an ol.interaction.Select. 
 * When clicking on a cluster, it springs apart to reveal the features in the cluster.
 * Revealed features are selectable and you can pick the one you meant.
 * Revealed features are themselves a cluster with an attribute features that contain the original feature.
 * 
 * @constructor
 * @extends {ol.interaction.Select}
 * @param {olx.interaction.SelectOptions=} options SelectOptions.
 *  @param {ol.style} options.featureStyle used to style the revealed features as options.style is used by the Select interaction.
 * 	@param {boolean} options.selectCluster false if you don't want to get cluster selected
 * 	@param {Number} options.pointRadius to calculate distance between the features
 * 	@param {bool} options.spiral means you want the feature to be placed on a spiral (or a circle)
 * 	@param {Number} options.circleMaxObject number of object that can be place on a circle
 * 	@param {Number} options.maxObjects number of object that can be drawn, other are hidden
 * 	@param {bool} options.animate if the cluster will animate when features spread out, default is false
 * 	@param {Number} options.animationDuration animation duration in ms, default is 500ms
 * @fires ol.interaction.SelectEvent
 * @api stable
 */
ol.interaction.SelectCluster = function(options) 
{	options = options || {};
	var fn; 
	this.pointRadius = options.pointRadius || 12;
	this.circleMaxObjects = options.circleMaxObjects || 10;
	this.maxObjects = options.maxObjects || 60;
	this.spiral = (options.spiral !== false);
	this.animate = options.animate;
	this.animationDuration = options.animationDuration || 500;
	this.selectCluster_ = (options.selectCluster !== false);
	// Create a new overlay layer for 
	var overlay = this.overlayLayer_ = new ol.layer.Vector(
		{	source: new ol.source.Vector({
				features: new ol.Collection(),
				wrapX: options.wrapX,
				useSpatialIndex: true
			}),
			name:'Cluster overlay',
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			displayInLayerSwitcher: false,
			style: options.featureStyle
		});
	// Add the overlay to selection
	if (options.layers)
	{	if (typeof(options.layers) == "function")
		{	fn = options.layers;
			options.layers = function(layer)
			{	return (layer===overlay || fn(layer));
			};
		}
		else if (options.layers.push)
		{	options.layers.push(this.overlayLayer_);
		}
	}
	// Don't select links
	if (options.filter)
	{	fn = options.filter;
		options.filter = function(f,l)
		{	//if (l===overlay && f.get("selectclusterlink")) return false;
			if (!l && f.get("selectclusterlink")) return false;
			else return fn(f,l);
		};
	}
	else options.filter = function(f,l) 
	{	//if (l===overlay && f.get("selectclusterlink")) return false; 
		if (!l && f.get("selectclusterlink")) return false; 
		else return true;
	};
	this.filter_ = options.filter;
	ol.interaction.Select.call(this, options);
	this.on("select", this.selectCluster.bind(this));
};
ol.ext.inherits(ol.interaction.SelectCluster, ol.interaction.Select);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.SelectCluster.prototype.setMap = function(map) {
	if (this.getMap()) {
		this.getMap().removeLayer(this.overlayLayer_);
	}
	if (this._listener) ol.Observable.unByKey(this._listener);
	this._listener = null;
	ol.interaction.Select.prototype.setMap.call (this, map);
	this.overlayLayer_.setMap(map);
	// map.addLayer(this.overlayLayer_);
	if (map && map.getView()) {
		this._listener = map.getView().on('change:resolution', this.clear.bind(this));
	}
};
/**
 * Clear the selection, close the cluster and remove revealed features
 * @api stable
 */
ol.interaction.SelectCluster.prototype.clear = function() 
{	this.getFeatures().clear();
	this.overlayLayer_.getSource().clear();
};
/**
 * Get the layer for the revealed features
 * @api stable
 */
ol.interaction.SelectCluster.prototype.getLayer = function() 
{	return this.overlayLayer_;
};
/**
 * Select a cluster 
 * @param {ol.Feature} a cluster feature ie. a feature with a 'features' attribute.
 * @api stable
 */
ol.interaction.SelectCluster.prototype.selectCluster = function (e) 
{	// Nothing selected
	if (!e.selected.length)
	{	this.clear();
		return;
	}
	// Get selection
	var feature = e.selected[0];
	// It's one of ours
	if (feature.get('selectclusterfeature')) return;
	// Clic out of the cluster => close it
	var source = this.overlayLayer_.getSource();
	source.clear();
	var cluster = feature.get('features');
	// Not a cluster (or just one feature)
	if (!cluster || cluster.length==1) return;
	// Remove cluster from selection
	if (!this.selectCluster_) this.getFeatures().clear();
	var center = feature.getGeometry().getCoordinates();
	// Pixel size in map unit
	var pix = this.getMap().getView().getResolution();
	var r = pix * this.pointRadius * (0.5 + cluster.length / 4);
	var a, i, max;
	var p, cf, lk;
	// The features
	var features = [];
	// Draw on a circle
	if (!this.spiral || cluster.length <= this.circleMaxObjects)
	{	max = Math.min(cluster.length, this.circleMaxObjects);
		for (i=0; i<max; i++)
		{	a = 2*Math.PI*i/max;
			if (max==2 || max == 4) a += Math.PI/4;
			p = [ center[0]+r*Math.sin(a), center[1]+r*Math.cos(a) ];
			cf = new ol.Feature({ 'selectclusterfeature':true, 'features':[cluster[i]], geometry: new ol.geom.Point(p) });
			cf.setStyle(cluster[i].getStyle());
			features.push(cf);
			lk = new ol.Feature({ 'selectclusterlink':true, geometry: new ol.geom.LineString([center,p]) });
			features.push(lk);
		}
	}
	// Draw on a spiral
	else
	{	// Start angle
		a = 0;
		r;
		var d = 2*this.pointRadius;
		max = Math.min (this.maxObjects, cluster.length);
		// Feature on a spiral
		for (i=0; i<max; i++)
		{	// New radius => increase d in one turn
			r = d/2 + d*a/(2*Math.PI);
			// Angle
			a = a + (d+0.1)/r;
			var dx = pix*r*Math.sin(a)
			var dy = pix*r*Math.cos(a)
			p = [ center[0]+dx, center[1]+dy ];
			cf = new ol.Feature({ 'selectclusterfeature':true, 'features':[cluster[i]], geometry: new ol.geom.Point(p) });
			cf.setStyle(cluster[i].getStyle()); 
			features.push(cf);
			lk = new ol.Feature({ 'selectclusterlink':true, geometry: new ol.geom.LineString([center,p]) });
			features.push(lk);
		}
	}
	source.clear();
	if (this.animate) {
		this.animateCluster_(center, features);
	} else {
		source.addFeatures(features);
	}
};
/**
 * Animate the cluster and spread out the features
 * @param {ol.Coordinates} the center of the cluster
 */
ol.interaction.SelectCluster.prototype.animateCluster_ = function(center, features)
{	// Stop animation (if one is running)
	if (this.listenerKey_) {
		ol.Observable.unByKey(this.listenerKey_);
	}
	// Features to animate
	// var features = this.overlayLayer_.getSource().getFeatures();
	if (!features.length) return;
	var style = this.overlayLayer_.getStyle();
	var stylefn = (typeof(style) == 'function') ? style : style.length ? function(){ return style; } : function(){ return [style]; } ;
	var duration = this.animationDuration || 500;
	var start = new Date().getTime();
	// Animate function
	function animate(event) {
		var vectorContext = event.vectorContext || ol.render.getVectorContext(event);
		// Retina device
		var ratio = event.frameState.pixelRatio;
		var res = this.getMap().getView().getResolution();
		var e = ol.easing.easeOut((event.frameState.time - start) / duration);
		for (var i=0, feature; feature = features[i]; i++) if (feature.get('features'))
		{	var pt = feature.getGeometry().getCoordinates();
			pt[0] = center[0] + e * (pt[0]-center[0]);
			pt[1] = center[1] + e * (pt[1]-center[1]);
			var geo = new ol.geom.Point(pt);
			// Image style
			var st = stylefn(feature, res);
			for (var s=0; s<st.length; s++)
			{	var sc;
				// OL < v4.3 : setImageStyle doesn't check retina
				var imgs = ol.Map.prototype.getFeaturesAtPixel ? false : st[s].getImage();
				if (imgs)
				{	sc = imgs.getScale();
					imgs.setScale(ratio); 
				}
				// OL3 > v3.14
				if (vectorContext.setStyle)
				{	vectorContext.setStyle(st[s]);
					vectorContext.drawGeometry(geo);
				}
				// older version
				else
				{	vectorContext.setImageStyle(imgs);
					vectorContext.drawPointGeometry(geo);
				}
				if (imgs) imgs.setScale(sc);
			}
		}
		// Stop animation and restore cluster visibility
		if (e > 1.0) {
			ol.Observable.unByKey(this.listenerKey_);
			this.overlayLayer_.getSource().addFeatures(features);
			this.overlayLayer_.changed();
			return;
		}
		// tell OL3 to continue postcompose animation
		event.frameState.animate = true;
	}
	// Start a new postcompose animation
	this.listenerKey_ = this.overlayLayer_.on(['postcompose','postrender'], animate.bind(this));
	// Start animation with a ghost feature
	var feature = new ol.Feature(new ol.geom.Point(this.getMap().getView().getCenter()));
	feature.setStyle(new ol.style.Style({ image: new ol.style.Circle({}) }));
	this.overlayLayer_.getSource().addFeature(feature);
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction to snap to guidelines
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {*} options
 *  @param {number | undefined} options.pixelTolerance distance (in px) to snap to a guideline, default 10 px
 *  @param {bool | undefined} options.enableInitialGuides whether to draw initial guidelines based on the maps orientation, default false.
 *  @param {ol.style.Style | Array<ol.style.Style> | undefined} options.style Style for the sektch features.
 *  @param {*} options.vectorClass a vector layer class to create the guides with ol6, use ol/layer/VectorImage using ol6
 */
ol.interaction.SnapGuides = function(options) {
  if (!options) options = {};
  // Intersect 2 guides
  function getIntersectionPoint (d1, d2) {
    var d1x = d1[1][0] - d1[0][0];
    var d1y = d1[1][1] - d1[0][1];
    var d2x = d2[1][0] - d2[0][0];
    var d2y = d2[1][1] - d2[0][1];
    var det = d1x * d2y - d1y * d2x;
    if (det != 0) {
      var k = (d1x * d1[0][1] - d1x * d2[0][1] - d1y * d1[0][0] + d1y * d2[0][0]) / det;
      return [d2[0][0] + k*d2x, d2[0][1] + k*d2y];
    }
    else return false;
  }
  function dist2D (p1,p2) {
    var dx = p1[0]-p2[0];
    var dy = p1[1]-p2[1];
    return Math.sqrt(dx*dx+dy*dy);
  }
  // Snap distance (in px)
  this.snapDistance_ = options.pixelTolerance || 10;
  this.enableInitialGuides_ = options.enableInitialGuides || false;
  // Default style
  var sketchStyle = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        lineDash: [8,5],
        width: 1.25
      })
    })
  ];
  // Custom style
  if (options.style) sketchStyle = options.style instanceof Array ? options.style : [options.style];
  // Create a new overlay for the sketch
  this.overlaySource_ = new ol.source.Vector({
    features: new ol.Collection(),
    useSpatialIndex: false
  });
  // Use ol/layer/VectorImage to render the snap guides as an image to improve performance on rerenderers
  var vectorClass = options.vectorClass || ol.layer.Vector;
  this.overlayLayer_ = new vectorClass({
    // render the snap guides as an image to improve performance on rerenderers
    renderMode: 'image',
    source: this.overlaySource_,
      style: function() {
        return sketchStyle;
      },
      name:'Snap overlay',
      displayInLayerSwitcher: false
    });
  // Use snap interaction
  ol.interaction.Interaction.call(this, {
    handleEvent: function(e) {
      if (this.getActive()) {
        var features = this.overlaySource_.getFeatures();
        var prev = null;
        var p = null;
        var res = e.frameState.viewState.resolution;
        for (var i=0, f; f = features[i]; i++) {
          var c = f.getGeometry().getClosestPoint(e.coordinate);
          if ( dist2D(c, e.coordinate) / res < this.snapDistance_) {
            // Intersection on 2 lines
            if (prev) {
              var c2 = getIntersectionPoint(prev.getGeometry().getCoordinates(),  f.getGeometry().getCoordinates());
              if (c2) {
                if (dist2D(c2, e.coordinate) / res < this.snapDistance_) {
                  p = c2;
                }
              }
            } else {
              p = c;
            }
            prev = f;
          }
        }
        if (p) e.coordinate = p;
      }
      return true;
    }
  });
};
ol.ext.inherits(ol.interaction.SnapGuides, ol.interaction.Interaction);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.SnapGuides.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
  ol.interaction.Interaction.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
  if (map) this.projExtent_ = map.getView().getProjection().getExtent();
};
/** Activate or deactivate the interaction.
 * @param {boolean} active
 */
ol.interaction.SnapGuides.prototype.setActive = function(active) {
  this.overlayLayer_.setVisible(active);
  ol.interaction.Interaction.prototype.setActive.call (this, active);
}
/** Clear previous added guidelines
 * @param {Array<ol.Feature> | undefined} features a list of feature to remove, default remove all feature
 */
ol.interaction.SnapGuides.prototype.clearGuides = function(features) {
  if (!features) {
    this.overlaySource_.clear();
  } else {
    for (var i=0, f; f=features[i]; i++) {
      try {
        this.overlaySource_.removeFeature(f);
      } catch(e) {/* nothing to to */}
    }
  }
};
/** Get guidelines
 * @return {ol.Collection} guidelines features
 */
ol.interaction.SnapGuides.prototype.getGuides = function() {
  return this.overlaySource_.getFeaturesCollection();
}
/** Add a new guide to snap to
 * @param {Array<ol.coordinate>} v the direction vector
 * @return {ol.Feature} feature guide
 */
ol.interaction.SnapGuides.prototype.addGuide = function(v, ortho) {
  if (v) {
    var map = this.getMap();
    // Limit extent
    var extent = map.getView().calculateExtent(map.getSize());
    var guideLength = Math.max(
      this.projExtent_[2] - this.projExtent_[0],
      this.projExtent_[3] - this.projExtent_[1]
    );
    extent = ol.extent.buffer(extent, guideLength * 1.5);
    //extent = ol.extent.boundingExtent(extent, this.projExtent_);
    if (extent[0]<this.projExtent_[0]) extent[0]=this.projExtent_[0];
    if (extent[1]<this.projExtent_[1]) extent[1]=this.projExtent_[1];
    if (extent[2]>this.projExtent_[2]) extent[2]=this.projExtent_[2];
    if (extent[3]>this.projExtent_[3]) extent[3]=this.projExtent_[3];
    var dx = v[0][0] - v[1][0];
    var dy = v[0][1] - v[1][1];
    var d = 1 / Math.sqrt(dx*dx+dy*dy);
    var generateLine = function(loopDir) {
      var p, g = [];
      var loopCond = guideLength*loopDir*2;
      for (var i=0; loopDir > 0 ? i < loopCond : i > loopCond; i+=(guideLength * loopDir) / 100) {
        if (ortho) p = [ v[0][0] + dy*d*i, v[0][1] - dx*d*i];
        else p = [ v[0][0] + dx*d*i, v[0][1] + dy*d*i];
        if (ol.extent.containsCoordinate(extent, p)) g.push(p);
        else break;
      }
      return new ol.Feature(new ol.geom.LineString([g[0], g[g.length-1]]));
    }
    var f0 = generateLine(1);
    var f1 = generateLine(-1);
    this.overlaySource_.addFeature(f0);
    this.overlaySource_.addFeature(f1);
    return [f0, f1];
  }
};
/** Add a new orthogonal guide to snap to
 * @param {Array<ol.coordinate>} v the direction vector
 * @return {ol.Feature} feature guide
 */
ol.interaction.SnapGuides.prototype.addOrthoGuide = function(v) {
  return this.addGuide(v, true);
};
/** Listen to draw event to add orthogonal guidelines on the first and last point.
 * @param {_ol_interaction_Draw_} drawi a draw interaction to listen to
 * @api
 */
ol.interaction.SnapGuides.prototype.setDrawInteraction = function(drawi) {
  var self = this;
  // Number of points currently drawing
  var nb = 0;
  // Current guidelines
  var features = [];
  function setGuides(e) {
    var coord = e.target.getCoordinates();
    var s = 2;
    switch (e.target.getType()) {
      case 'Point':
        return;
      case 'Polygon':
        coord = coord[0].slice(0, -1);
        break;
      default: break;
    }
    var l = coord.length;
    if (l === s && self.enableInitialGuides_) {
      var x = coord[0][0];
      var y = coord[0][1];
      coord = [[x, y], [x, y - 1]];
    }
    if (l != nb && (self.enableInitialGuides_ ? l >= s : l > s)) {
      self.clearGuides(features);
      // use try catch to remove a bug on freehand draw...
      try {
        var p1 = coord[l - s], p2 = coord[l - s - 1];
        if (l > s && !(p1[0] === p2[0] && p1[1] === p2[1])) {
          features = self.addOrthoGuide([coord[l - s], coord[l - s - 1]]);
        }
        features = features.concat(self.addGuide([coord[0], coord[1]]));
        features = features.concat(self.addOrthoGuide([coord[0], coord[1]]));
        nb = l;
      } catch (e) { /* ok*/ }
    }
  }
  // New drawing
  drawi.on ("drawstart", function(e) {
    // When geom is changing add a new orthogonal direction 
    e.feature.getGeometry().on("change", setGuides);
  });
  // end drawing / deactivate => clear directions
  drawi.on (["drawend", "change:active"], function(e) {
    self.clearGuides(features);
    if (e.feature) e.feature.getGeometry().un("change", setGuides);
    nb = 0;
    features = [];
  });
};
/** Listen to modify event to add orthogonal guidelines relative to the currently dragged point
 * @param {_ol_interaction_Modify_} modifyi a modify interaction to listen to
 * @api
 */
ol.interaction.SnapGuides.prototype.setModifyInteraction = function (modifyi) {
  function mod(d, n) {
    return ((d % n) + n) % n;
  }
  var self = this;
  // Current guidelines
  var features = [];
  function computeGuides(e) {
    var selectedVertex = e.target.vertexFeature_
    if (!selectedVertex) return;
    var f = e.target.getModifiedFeatures()[0];
    var geom = f.getGeometry();
    var coord = geom.getCoordinates();
    switch (geom.getType()) {
      case 'Point':
        return;
      case 'Polygon':
        coord = coord[0].slice(0, -1);
        break;
      default: break;
    }
    var modifyVertex = selectedVertex.getGeometry().getCoordinates();
    var idx = coord.findIndex(function(c) {
      return c[0] === modifyVertex[0] && c[1] === modifyVertex[1]
    });
    var l = coord.length;
    self.clearGuides(features);
    features = self.addOrthoGuide([coord[mod(idx - 1, l)], coord[mod(idx - 2, l)]]);
    features = features.concat(self.addGuide([coord[mod(idx - 1, l)], coord[mod(idx - 2, l)]]));
    features = features.concat(self.addGuide([coord[mod(idx + 1, l)], coord[mod(idx + 2, l)]]));
    features = features.concat(self.addOrthoGuide([coord[mod(idx + 1, l)], coord[mod(idx + 2, l)]]));
  }
  function setGuides(e) {
    // This callback is called before ol adds the vertex to the feature, so
    // defer a moment for openlayers to add the new vertex
    setTimeout(computeGuides, 0, e);
  }
  function drawEnd() {
    self.clearGuides(features);
    features = [];
  }
  // New drawing
  modifyi.on("modifystart", setGuides);
  // end drawing, clear directions
  modifyi.on("modifyend", drawEnd);
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction split interaction for splitting feature geometry
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires  beforesplit, aftersplit, pointermove
 * @param {*} 
 *  @param {ol.source.Vector|Array<ol.source.Vector>} options.source a list of source to split (configured with useSpatialIndex set to true)
 *  @param {ol.Collection.<ol.Feature>} options.features collection of feature to split
 *  @param {integer} options.snapDistance distance (in px) to snap to an object, default 25px
 *	@param {string|undefined} options.cursor cursor name to display when hovering an objet
 *  @param {function|undefined} opttion.filter a filter that takes a feature and return true if it can be clipped, default always split.
 *  @param ol.style.Style | Array<ol.style.Style> | false | undefined} options.featureStyle Style for the selected features, choose false if you don't want feature selection. By default the default edit style is used.
 *  @param {ol.style.Style | Array<ol.style.Style> | undefined} options.sketchStyle Style for the sektch features. 
 *  @param {function|undefined} options.tolerance Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split.  Default is 1e-10.
 */
ol.interaction.Split = function(options) {
  if (!options) options = {};
  ol.interaction.Interaction.call(this, {
    handleEvent: function(e) {
      switch (e.type) {
        case "singleclick":
          return this.handleDownEvent(e);
        case "pointermove":
          return this.handleMoveEvent(e);
        default: 
          return true;
      }
      //return true;
    }
  });
  // Snap distance (in px)
  this.snapDistance_ = options.snapDistance || 25;
  // Split tolerance between the calculated intersection and the geometry
  this.tolerance_ = options.tolerance || 1e-10;
  // Cursor
  this.cursor_ = options.cursor;
  // List of source to split
  this.sources_ = options.sources ? (options.sources instanceof Array) ? options.sources:[options.sources] : [];
  if (options.features) {
    this.sources_.push (new ol.source.Vector({ features: options.features }));
  }
  // Get all features candidate
  this.filterSplit_ = options.filter || function(){ return true; };
  // Default style
  var white = [255, 255, 255, 1];
  var blue = [0, 153, 255, 1];
  var width = 3;
  var fill = new ol.style.Fill({ color: 'rgba(255,255,255,0.4)' });
  var stroke = new ol.style.Stroke({
    color: '#3399CC',
    width: 1.25
  });
  var sketchStyle = [
    new ol.style.Style({
      image: new ol.style.Circle({
        fill: fill,
        stroke: stroke,
        radius: 5
      }),
      fill: fill,
      stroke: stroke
    })
  ];
  var featureStyle = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: white,
        width: width + 2
      })
    }),
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 2*width,
        fill: new ol.style.Fill({
          color: blue
        }),
        stroke: new ol.style.Stroke({
          color: white,
          width: width/2
        })
      }),
      stroke: new ol.style.Stroke({
          color: blue,
          width: width
        })
    }),
  ];
  // Custom style
  if (options.sketchStyle) sketchStyle = options.sketchStyle instanceof Array ? options.sketchStyle : [options.sketchStyle];
  if (options.featureStyle) featureStyle = options.featureStyle instanceof Array ? options.featureStyle : [options.featureStyle];
  // Create a new overlay for the sketch
  this.overlayLayer_ = new ol.layer.Vector({
    source: new ol.source.Vector({
      useSpatialIndex: false
    }),
    name:'Split overlay',
    displayInLayerSwitcher: false,
    style: function(f) {
      if (f._sketch_) return sketchStyle;
      else return featureStyle;
    }
  });
};
ol.ext.inherits(ol.interaction.Split, ol.interaction.Interaction);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.Split.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
  ol.interaction.Interaction.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
};
/** Get closest feature at pixel
 * @param {ol.Pixel} 
 * @return {ol.feature} 
 * @private
 */
ol.interaction.Split.prototype.getClosestFeature = function(e) {
  var f, c, g, d = this.snapDistance_+1;
  for (var i=0; i<this.sources_.length; i++) {
    var source = this.sources_[i];
    f = source.getClosestFeatureToCoordinate(e.coordinate);
    if (f && f.getGeometry().splitAt) {
      c = f.getGeometry().getClosestPoint(e.coordinate);
      g = new ol.geom.LineString([e.coordinate,c]);
      d = g.getLength() / e.frameState.viewState.resolution;
      break;
    }
  }
  if (d > this.snapDistance_) {
    return false;
  } else {
    // Snap to node
    var coord = this.getNearestCoord (c, f.getGeometry().getCoordinates());
    var p = this.getMap().getPixelFromCoordinate(coord);
    if (ol.coordinate.dist2d(e.pixel, p) < this.snapDistance_) {
      c = coord;
    }
    //
    return { source:source, feature:f, coord: c, link: g };
  }
}
/** Get nearest coordinate in a list 
* @param {ol.coordinate} pt the point to find nearest
* @param {Array<ol.coordinate>} coords list of coordinates
* @return {ol.coordinate} the nearest coordinate in the list
*/
ol.interaction.Split.prototype.getNearestCoord = function(pt, coords) {
  var d, dm=Number.MAX_VALUE, p0;
  for (var i=0; i < coords.length; i++) {
    d = ol.coordinate.dist2d (pt, coords[i]);
    if (d < dm) {
      dm = d;
      p0 = coords[i];
    }
  }
  return p0;
};
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ol.interaction.Split.prototype.handleDownEvent = function(evt) {
  // Something to split ?
  var current = this.getClosestFeature(evt);
  if (current) {
    var self = this;
    self.overlayLayer_.getSource().clear();
    var split = current.feature.getGeometry().splitAt(current.coord, this.tolerance_);
    var i;
    if (split.length > 1) {
      var tosplit = [];
      for (i=0; i<split.length; i++) {
        var f = current.feature.clone();
        f.setGeometry(split[i]);
        tosplit.push(f);
      }
      self.dispatchEvent({ type:'beforesplit', original: current.feature, features: tosplit });
      current.source.dispatchEvent({ type:'beforesplit', original: current.feature, features: tosplit });
      current.source.removeFeature(current.feature);
      for (i=0; i<tosplit.length; i++) {
        current.source.addFeature(tosplit[i]);
      }
      self.dispatchEvent({ type:'aftersplit', original: current.feature, features: tosplit });
      current.source.dispatchEvent({ type:'aftersplit', original: current.feature, features: tosplit });
    }
  }
  return false;
};
/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol.interaction.Split.prototype.handleMoveEvent = function(e) {
  var map = e.map;
  this.overlayLayer_.getSource().clear();
  var current = this.getClosestFeature(e);
  if (current && this.filterSplit_(current.feature)) {
    var p, l;
    // Draw sketch
    this.overlayLayer_.getSource().addFeature(current.feature);
    p = new ol.Feature(new ol.geom.Point(current.coord));
    p._sketch_ = true;
    this.overlayLayer_.getSource().addFeature(p);
    //
    l = new ol.Feature(current.link);
    l._sketch_ = true;
    this.overlayLayer_.getSource().addFeature(l);
    // move event
    this.dispatchEvent({
      type: 'pointermove',
      coordinate: e.coordinate,
      frameState: e.frameState,
      originalEvent: e.originalEvent,
      map: e.map,
      pixel: e.pixel,
      feature: current.feature,
      linkGeometry: current.link
    });
  } else {
    this.dispatchEvent(e);
  }
  var element = map.getTargetElement();
  if (this.cursor_) {
    if (current) {
      if (element.style.cursor != this.cursor_) {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
/** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires  beforesplit, aftersplit
 * @param {olx.interaction.SplitOptions} 
 *	- source {ol.source.Vector|Array{ol.source.Vector}} The target source (or array of source) with features to be split (configured with useSpatialIndex set to true)
 *	- triggerSource {ol.source.Vector} Any newly created or modified features from this source will be used to split features on the target source. If none is provided the target source is used instead.
 *	- features {ol.Collection.<ol.Feature>} A collection of feature to be split (replace source target).
 *	- triggerFeatures {ol.Collection.<ol.Feature>} Any newly created or modified features from this collection will be used to split features on the target source (replace triggerSource).
 *	- filter {function|undefined} a filter that takes a feature and return true if the feature is eligible for splitting, default always split.
 *	- tolerance {function|undefined} Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split. Default is 1e-10.
 * @todo verify auto intersection on features that split.
 */
ol.interaction.Splitter = function(options)
{	if (!options) options = {};
	ol.interaction.Interaction.call(this,
	{	handleEvent: function(e)
			{	// Hack to get only one changeFeature when draging with ol.interaction.Modify on.
				if (e.type != "pointermove" && e.type != "pointerdrag")
				{	if (this.lastEvent_)
					{	this.splitSource(this.lastEvent_.feature);
						this.lastEvent_ = null;
					}
					this.moving_ = false;
				}
				else this.moving_ = true;
				return true; 
			},
	});
	// Features added / remove
	this.added_ = [];
	this.removed_ = [];
	// Source to split
	if (options.features)
	{	this.source_ = new ol.source.Vector({ features: options.features });
	}
	else 
	{	this.source_ = options.source ? options.source : new ol.source.Vector({ features: new ol.Collection() });
	}
	var trigger = this.triggerSource;
	if (options.triggerFeatures)
	{	trigger = new ol.source.Vector({ features: options.triggerFeatures });
	}
	if (trigger)
	{	trigger.on("addfeature", this.onAddFeature.bind(this));
		trigger.on("changefeature", this.onChangeFeature.bind(this));
		trigger.on("removefeature", this.onRemoveFeature.bind(this));
	}
	else
	{	this.source_.on("addfeature", this.onAddFeature.bind(this));
		this.source_.on("changefeature", this.onChangeFeature.bind(this));
		this.source_.on("removefeature", this.onRemoveFeature.bind(this));
	}
	// Split tolerance between the calculated intersection and the geometry
	this.tolerance_ = options.tolerance || 1e-10;
	// Get all features candidate
	this.filterSplit_ = options.filter || function(){ return true; };
};
ol.ext.inherits(ol.interaction.Splitter, ol.interaction.Interaction);
/** Calculate intersection on 2 segs
* @param {Array<_ol_coordinate_>} s1 first seg to intersect (2 points)
* @param {Array<_ol_coordinate_>} s2 second seg to intersect (2 points)
* @return { boolean | _ol_coordinate_ } intersection point or false no intersection
*/
ol.interaction.Splitter.prototype.intersectSegs = function(s1,s2)
{	var tol = this.tolerance_;
	// Solve
	var x12 = s1[0][0] - s1[1][0];
	var x34 = s2[0][0] - s2[1][0];
	var y12 = s1[0][1] - s1[1][1];
	var y34 = s2[0][1] - s2[1][1];
	var det = x12 * y34 - y12 * x34;
	// No intersection
	if (Math.abs(det) < tol)
	{	return false;
	}
	else
	{	// Outside segement
		var r1 = ((s1[0][0] - s2[1][0])*y34 - (s1[0][1] - s2[1][1])*x34) / det;
		if (Math.abs(r1)<tol) return s1[0];
		if (Math.abs(1-r1)<tol) return s1[1];
		if (r1<0 || r1>1) return false;
		var r2 = ((s1[0][1] - s2[1][1])*x12 - (s1[0][0] - s2[1][0])*y12) / det;
		if (Math.abs(r2)<tol) return s2[1];
		if (Math.abs(1-r2)<tol) return s2[0];
		if (r2<0 || r2>1) return false;
		// Intersection
		var a = s1[0][0] * s1[1][1] - s1[0][1] * s1[1][0];
		var b = s2[0][0] * s2[1][1] - s2[0][1] * s2[1][0];
		var p = [(a * x34 - b * x12) / det, (a * y34 - b * y12) / det];
		// Test start / end
/*
console.log("r1: "+r1)
console.log("r2: "+r2)
console.log ("s10: "+(_ol_coordinate_.dist2d(p,s1[0])<tol)) ;
console.log ("s11: "+(_ol_coordinate_.dist2d(p,s1[1])<tol)) ;
console.log ("s20: "+(_ol_coordinate_.dist2d(p,s2[0])<tol)) ;
console.log ("s21: "+(_ol_coordinate_.dist2d(p,s2[1])<tol)) ;
*/
		return p;
	}
};
/** Split the source using a feature
* @param {ol.Feature} feature The feature to use to split.
*/
ol.interaction.Splitter.prototype.splitSource = function(feature)
{	// Allready perform a split
	if (this.splitting) return;
	var self = this;
	var i, k, f2;
	// Start splitting
	this.source_.dispatchEvent({ type:'beforesplit', feaure: feature, source: this.source_ });
	this.splitting = true;
	this.added_ = [];
	this.removed_ = [];
	var c = feature.getGeometry().getCoordinates();
	var seg, split = [];
	function intersect (f)
	{	if (f !== feature)
		{	var c2 = f.getGeometry().getCoordinates();
			for (var j=0; j<c2.length-1; j++)
			{	var p = this.intersectSegs (seg, [c2[j],c2[j+1]]);
				if (p)
				{	split.push(p);
					g = f.getGeometry().splitAt(p, this.tolerance_);
					if (g && g.length>1)
					{	found = f;
						return true;
					}
				}
			}
		}
		return false;
	}
	// Split existing features
	for (i=0; i<c.length-1; i++)
	{	seg = [c[i],c[i+1]];
		var extent = ol.extent.buffer(ol.extent.boundingExtent(seg), this.tolerance_ /*0.01*/ );
		var g;
		while (true)
		{	var found = false;
			this.source_.forEachFeatureIntersectingExtent(extent, intersect.bind(this));
			// Split feature
			if (found)
			{	var f = found;
				this.source_.removeFeature(f);
				for (k=0; k<g.length; k++)
				{	f2 = f.clone();
					f2.setGeometry(g[k]);
					this.source_.addFeature(f2);
				}
			}
			else break;
		}
	}
	// Auto intersect
	for (i=0; i<c.length-2; i++)
	{	for (var j=i+1; j<c.length-1; j++)
		{	var p = this.intersectSegs ([c[i],c[i+1]], [c[j],c[j+1]]);
			if (p && p!=c[i+1])
			{	split.push(p);
			}
		}
	}
	// Split original
	var splitOriginal = false;
	if (split.length)
	{	var result = feature.getGeometry().splitAt(split, this.tolerance_);
		if (result.length>1)
		{	for (k=0; k<result.length; k++)
			{	f2 = feature.clone();
				f2.setGeometry(result[k]);
				this.source_.addFeature(f2);
			}
			splitOriginal = true;
		}
	}
	// If the interaction is inserted after modify interaction, the objet is not consistant 
	// > wait end of other interactions
	setTimeout (function()
	{	if (splitOriginal) self.source_.removeFeature(feature);
		self.source_.dispatchEvent({ type:'aftersplit', featureAdded: self.added_, featureRemoved: self.removed_, source: this.source_ });
		// Finish
		self.splitting = false;
	},0);
};
/** New feature source is added 
*/
ol.interaction.Splitter.prototype.onAddFeature = function(e)
{	this.splitSource(e.feature);
	if (this.splitting) 
	{	this.added_.push(e.feature);
	}
	/*
	if (this.splitting) return;
	var self = this;
	setTimeout (function() { self.splitSource(e.feature); }, 0);
	*/
};
/** Feature source is removed > count features added/removed
*/
ol.interaction.Splitter.prototype.onRemoveFeature = function(e)
{	if (this.splitting) 
	{	var n = this.added_.indexOf(e.feature);
		if (n==-1)
		{	this.removed_.push(e.feature);
		}
		else
		{	this.added_.splice(n,1);
		}
	}
};
/** Feature source is changing 
*/
ol.interaction.Splitter.prototype.onChangeFeature = function(e)
{	if (this.moving_) 
	{	this.lastEvent_ = e;
	}
	else this.splitSource(e.feature);
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction synchronize
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {olx.interaction.SynchronizeOptions} 
 *  - maps {Array<ol.Map>} An array of maps to synchronize with the map of the interaction
 */
ol.interaction.Synchronize = function(options)
{	if (!options) options={};
	var self = this;
	ol.interaction.Interaction.call(this,
		{	handleEvent: function(e)
				{	if (e.type=="pointermove") { self.handleMove_(e); }
					return true;
				}
		});
	this.maps = options.maps;
};
ol.ext.inherits(ol.interaction.Synchronize, ol.interaction.Interaction);
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.Synchronize.prototype.setMap = function(map)
{
	if (this._listener) {
		ol.Observable.unByKey(this._listener.center);
		ol.Observable.unByKey(this._listener.rotation);
		ol.Observable.unByKey(this._listener.resolution);
		this.getMap().getTargetElement().removeEventListener('mouseout', this._listener.mouseout);
	}
	this._listener = null;
	ol.interaction.Interaction.prototype.setMap.call (this, map);
	if (map) {
		this._listener = {};
		this._listener.center = this.getMap().getView().on('change:center', this.syncMaps.bind(this));
		this._listener.rotation = this.getMap().getView().on('change:rotation', this.syncMaps.bind(this));
		this._listener.resolution = this.getMap().getView().on('change:resolution', this.syncMaps.bind(this));
		this._listener.mouseout = this.handleMouseOut_.bind(this);
		this.getMap().getTargetElement().addEventListener('mouseout', this._listener.mouseout);
		this.syncMaps();
	}
};
/** Synchronize the maps
*/
ol.interaction.Synchronize.prototype.syncMaps = function(e)
{	var map = this.getMap();
	if (!e) e = { type:'all' };
	if (map)
	{	for (var i=0; i<this.maps.length; i++)
		{	switch (e.type)
			{	case 'change:rotation':
					if (this.maps[i].getView().getRotation() != map.getView().getRotation())
						this.maps[i].getView().setRotation(map.getView().getRotation()); 
					break;
				case 'change:center':
					if (this.maps[i].getView().getCenter() != map.getView().getCenter())
						this.maps[i].getView().setCenter(map.getView().getCenter()); 
					break;
				case 'change:resolution':
					if (this.maps[i].getView().getResolution() != map.getView().getResolution())
					{	/* old version prior to 1.19.1
						this.maps[i].beforeRender ( ol.animation.zoom(
							{	duration: 250,
								resolution: this.maps[i].getView().getResolution()
							}));
						*/
						this.maps[i].getView().setResolution(map.getView().getResolution());
					}
					break;
				default:
					this.maps[i].getView().setRotation(map.getView().getRotation());
					this.maps[i].getView().setCenter(map.getView().getCenter());
					this.maps[i].getView().setResolution(map.getView().getResolution());
					break;
			}
		}
	}
};
/** Cursor move > tells other maps to show the cursor
* @param {ol.event} e "move" event
*/
ol.interaction.Synchronize.prototype.handleMove_ = function(e)
{	for (var i=0; i<this.maps.length; i++)
	{	this.maps[i].showTarget(e.coordinate);
	}
	this.getMap().showTarget();
};
/** Cursor out of map > tells other maps to hide the cursor
* @param {event} e "mouseOut" event
*/
ol.interaction.Synchronize.prototype.handleMouseOut_ = function(/*e*/) {
	for (var i=0; i<this.maps.length; i++) {
		this.maps[i].targetOverlay_.setPosition(undefined);
	}
};
/** Show a target overlay at coord
* @param {ol.coordinate} coord
*/
ol.Map.prototype.showTarget = function(coord)
{	if (!this.targetOverlay_)
	{	var elt = document.createElement("div");
				elt.classList.add("ol-target");
		this.targetOverlay_ = new ol.Overlay({ element: elt });
		this.targetOverlay_.setPositioning('center-center');
		this.addOverlay(this.targetOverlay_);
		elt.parentElement.classList.add("ol-target-overlay");
		// hack to render targetOverlay before positioning it
		this.targetOverlay_.setPosition([0,0]);
	}
	this.targetOverlay_.setPosition(coord);
};
/** Hide the target overlay
*/
ol.Map.prototype.hideTarget = function()
{
	this.removeOverlay(this.targetOverlay_);
	this.targetOverlay_ = undefined;
};

/*	
  Tinker Bell effect on maps.
  Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  @link https://github.com/Viglino
*/
/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 *	@param {ol.interaction.TinkerBell.options}  options flashlight param
*		- color {ol.color} color of the sparkles
*/
ol.interaction.TinkerBell = function(options) {
  options = options || {};
  ol.interaction.Pointer.call(this, {
    handleDownEvent: this.onMove,
    handleMoveEvent: this.onMove
  });
  this.set('color', options.color ? ol.color.asString(options.color) : "#fff");
  this.sparkle = [0,0];
  this.sparkles = [];
  this.lastSparkle = this.time = new Date();
  var self = this;
  this.out_ = function() { self.isout_=true; };
  this.isout_ = true;
};
ol.ext.inherits(ol.interaction.TinkerBell, ol.interaction.Pointer);
/** Set the map > start postcompose
*/
ol.interaction.TinkerBell.prototype.setMap = function(map) {
  if (this._listener) ol.Observable.unByKey(this._listener);
  this._listener = null;
  if (this.getMap()) {
    map.getViewport().removeEventListener('mouseout', this.out_, false);
    this.getMap().render();
  }
  ol.interaction.Pointer.prototype.setMap.call(this, map);
  if (map) {
    this._listener = map.on('postcompose', this.postcompose_.bind(this));
    map.getViewport().addEventListener('mouseout', this.out_, false);
  }
};
ol.interaction.TinkerBell.prototype.onMove = function(e) {
  this.sparkle = e.pixel;
  this.isout_ = false;
  this.getMap().render();
};
/** Postcompose function
*/
ol.interaction.TinkerBell.prototype.postcompose_ = function(e) {
  var delta = 15;
  var ctx = e.context || ol.ext.getMapCanvas(this.getMap()).getContext('2d');
  var dt = e.frameState.time - this.time;
  this.time = e.frameState.time;
  if (e.frameState.time-this.lastSparkle > 30 && !this.isout_) {
    this.lastSparkle = e.frameState.time;
    this.sparkles.push({ p:[this.sparkle[0]+Math.random()*delta-delta/2, this.sparkle[1]+Math.random()*delta], o:1 });
  }
  ctx.save();
    ctx.scale(e.frameState.pixelRatio,e.frameState.pixelRatio);
    ctx.fillStyle = this.get("color");
    for (var i=this.sparkles.length-1, p; p=this.sparkles[i]; i--) {
      if (p.o < 0.2) {
        this.sparkles.splice(0,i+1);
        break;
      }
      ctx.globalAlpha = p.o;
      ctx.beginPath();
      ctx.arc (p.p[0], p.p[1], 2.2, 0, 2 * Math.PI, false);
      ctx.fill();
      p.o *= 0.98;
      p.p[0] += (Math.random()-0.5);
      p.p[1] += dt*(1+Math.random())/30;
    }
  ctx.restore();
  // continue postcompose animation
  if (this.sparkles.length) this.getMap().render(); 
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @param {olx.interaction.TouchCompass} 
 *	- onDrag {function|undefined} Function handling "drag" events. It provides a dpixel and a traction (in projection) vector form the center of the compas
 *	- size {Number} size of the compass in px, default 80
 *	- alpha {Number} opacity of the compass, default 0.5
 */
ol.interaction.TouchCompass = function(options) {
	options = options||{};
	var opt = {};
	// Click on the compass
	opt.handleDownEvent = function(e)
	{	var s = this.getCenter_();
		var dx = e.pixel[0]-s[0];
		var dy = e.pixel[1]-s[1];
		this.start = e;
		return (Math.sqrt(dx*dx+dy*dy) < this.size/2);
	};
	// Pn drag
	opt.handleDragEvent = function(e)
	{	if (!this.pos) 
		{	this.pos = this.start;
			this.getMap().renderSync();
		}
		this.pos = e;
	};
	// Stop drag
	opt.handleUpEvent = function()
	{	this.pos = false;
		return true;
	};
	ol.interaction.Pointer.call(this, opt);
	this.ondrag_ = options.onDrag;
	this.size = options.size || 80;
	this.alpha = options.alpha || 0.5;
	if (!ol.interaction.TouchCompass.prototype.compass)
	{	var canvas = ol.interaction.TouchCompass.prototype.compass = document.createElement('canvas');
		var ctx = canvas.getContext("2d");
		var s = canvas.width = canvas.height = this.size;
		var w = s/10;
		var r = s/2;
		var r2 = 0.22*r;
		ctx.translate(r,r);
		ctx.fillStyle = "#999";
		ctx.strokeStyle = "#ccc";
		ctx.lineWidth = w;
		ctx.beginPath();
		ctx.arc (0,0, s*0.42, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#99f";
		ctx.beginPath();
		ctx.moveTo (0,0); 
		ctx.lineTo (r,0); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (-r,0); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
		ctx.lineTo (0,r); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (0,-r); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
		ctx.fill();
		ctx.fillStyle = "#eee";
		ctx.beginPath();
		ctx.moveTo (0,0); 
		ctx.lineTo (r,0); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
		ctx.lineTo (-r,0); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (0,r); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (0,-r); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
		ctx.fill();
	}
};
ol.ext.inherits(ol.interaction.TouchCompass, ol.interaction.Pointer);
/** Compass Image as a JS Image object
* @api
*/
ol.interaction.TouchCompass.prototype.compass = null;
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol.interaction.TouchCompass.prototype.setMap = function(map) {
	if (this._listener) ol.Observable.unByKey(this._listener);
	this._listener = null;
	ol.interaction.Pointer.prototype.setMap.call (this, map);
	if (map) {
		this._listener = map.on('postcompose', this.drawCompass_.bind(this));
		ol.ext.getMapCanvas(map);
	}
};
/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol.interaction.TouchCompass.prototype.setActive = function(b)
{	ol.interaction.Pointer.prototype.setActive.call (this, b);
	if (this.getMap()) this.getMap().renderSync();
}
/**
 * Get the center of the compass
 * @param {_ol_coordinate_}
 * @private
 */
ol.interaction.TouchCompass.prototype.getCenter_ = function()
{	var margin = 10;
	var s = this.size;
	var c = this.getMap().getSize(); 
	return [c[0]/2, c[1]-margin-s/2];
}
/**
 * Draw the compass on post compose
 * @private
 */
ol.interaction.TouchCompass.prototype.drawCompass_ = function(e)
{	if (!this.getActive()) return;
	var ctx = e.context || ol.ext.getMapCanvas(this.getMap()).getContext('2d');
	var ratio = e.frameState.pixelRatio;
	ctx.save();
	ctx.scale(ratio,ratio);
	ctx.globalAlpha = this.alpha;
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 5;
	var s = this.size;
	var c = this.getCenter_();
	ctx.drawImage(this.compass, 0,0,this.compass.width,this.compass.height, c[0]-s/2, c[1]-s/2, s,s);
	if (this.pos)
	{	var dx = this.pos.pixel[0]-this.start.pixel[0];
		var dy = this.pos.pixel[1]-this.start.pixel[1];
		for (var i=1; i<=4; i++)
		{	ctx.beginPath();
			ctx.arc (c[0] +dx/4*i, c[1] +dy/4*i, s/2*(0.6+0.4*i/4), 0, 2*Math.PI);
			ctx.stroke();
		}
	}
	ctx.restore();
	if (this.pos)
	{	// Get delta
		if (this.ondrag_) 
		{	var r = this.getMap().getView().getResolution();
			var delta = 
				{	dpixel: [ this.pos.pixel[0] - this.start.pixel[0], this.pos.pixel[1] - this.start.pixel[1] ]
				}
			delta.traction = [ delta.dpixel[0]*r, -delta.dpixel[1]*r];
			this.ondrag_(delta, this.pos);
		}
		// Continue animation
		e.frameState.animate = true;
	}
};

/** Interaction rotate
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @fires select | rotatestart | rotating | rotateend | translatestart | translating | translateend | scalestart | scaling | scaleend
 * @param {any} options
 *  @param {function} options.filter A function that takes a Feature and a Layer and returns true if the feature may be transformed or false otherwise.
 *  @param {Array<ol.Layer>} options.layers array of layers to transform,
 *  @param {ol.Collection<ol.Feature>} options.features collection of feature to transform,
 *	@param {ol.EventsConditionType|undefined} options.condition A function that takes an ol.MapBrowserEvent and a feature collection and returns a boolean to indicate whether that event should be handled. default: ol.events.condition.always.
 *	@param {ol.EventsConditionType|undefined} options.addCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event should be handled ie. the feature will be added to the transforms features. default: ol.events.condition.never.
 *	@param {number | undefined} options.hitTolerance Tolerance to select feature in pixel, default 0
 *	@param {bool} options.translateFeature Translate when click on feature
 *	@param {bool} options.translate Can translate the feature
 *	@param {bool} options.stretch can stretch the feature
 *	@param {bool} options.scale can scale the feature
 *	@param {bool} options.rotate can rotate the feature
 *	@param {bool} options.noFlip prevent the feature geometry to flip, default false
 *	@param {bool} options.selection the intraction handle selection/deselection, if not use the select prototype to add features to transform, default true
 *	@param {ol.events.ConditionType | undefined} options.keepAspectRatio A function that takes an ol.MapBrowserEvent and returns a boolean to keep aspect ratio, default ol.events.condition.shiftKeyOnly.
 *	@param {ol.events.ConditionType | undefined} options.modifyCenter A function that takes an ol.MapBrowserEvent and returns a boolean to apply scale & strech from the center, default ol.events.condition.metaKey or ol.events.condition.ctrlKey.
 *	@param {boolean} options.enableRotatedTransform Enable transform when map is rotated
 *	@param {} options.style list of ol.style for handles
 *
 */
ol.interaction.Transform = function(options) {
  if (!options) options = {};
	var self = this;
  this.selection_ = new ol.Collection();
	// Create a new overlay layer for the sketch
	this.handles_ = new ol.Collection();
	this.overlayLayer_ = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: this.handles_,
      useSpatialIndex: false,
      wrapX: false // For vector editing across the -180° and 180° meridians to work properly, this should be set to false
    }),
    name:'Transform overlay',
    displayInLayerSwitcher: false,
    // Return the style according to the handle type
    style: function (feature) {
      return (self.style[(feature.get('handle')||'default')+(feature.get('constraint')||'')+(feature.get('option')||'')]);
    },
  });
  // Extend pointer
  ol.interaction.Pointer.call(this, {
    handleDownEvent: this.handleDownEvent_,
    handleDragEvent: this.handleDragEvent_,
    handleMoveEvent: this.handleMoveEvent_,
    handleUpEvent: this.handleUpEvent_
  });
  // Collection of feature to transform
  this.features_ = options.features;
  // Filter or list of layers to transform
  if (typeof(options.filter)==='function') this._filter = options.filter;
  this.layers_ = options.layers ? (options.layers instanceof Array) ? options.layers:[options.layers] : null;
  this._handleEvent = options.condition || function() { return true; };
  this.addFn_ = options.addCondition || function() { return false; };
  /* Translate when click on feature */
  this.set('translateFeature', (options.translateFeature!==false));
  /* Can translate the feature */
  this.set('translate', (options.translate!==false));
  /* Can stretch the feature */
  this.set('stretch', (options.stretch!==false));
  /* Can scale the feature */
  this.set('scale', (options.scale!==false));
  /* Can rotate the feature */
  this.set('rotate', (options.rotate!==false));
  /* Keep aspect ratio */
  this.set('keepAspectRatio', (options.keepAspectRatio || function(e){ return e.originalEvent.shiftKey }));
  /* Modify center */
  this.set('modifyCenter', (options.modifyCenter || function(e){ return e.originalEvent.metaKey || e.originalEvent.ctrlKey }));
  /* Prevent flip */
  this.set('noFlip', (options.noFlip || false));
  /* Handle selection */
  this.set('selection', (options.selection !== false));
  /*  */
  this.set('hitTolerance', (options.hitTolerance || 0));
  /* Enable view rotated transforms */
  this.set('enableRotatedTransform', (options.enableRotatedTransform || false));
  // Force redraw when changed
  this.on ('propertychange', function() {
    this.drawSketch_();
  });
  // setstyle
  this.setDefaultStyle();
};
ol.ext.inherits(ol.interaction.Transform, ol.interaction.Pointer);
/** Cursors for transform
*/
ol.interaction.Transform.prototype.Cursors = {
  'default': 'auto',
  'select': 'pointer',
  'translate': 'move',
  'rotate': 'move',
  'rotate0': 'move',
  'scale': 'nesw-resize',
  'scale1': 'nwse-resize',
  'scale2': 'nesw-resize',
  'scale3': 'nwse-resize',
  'scalev': 'ew-resize',
  'scaleh1': 'ns-resize',
  'scalev2': 'ew-resize',
  'scaleh3': 'ns-resize'
};
/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.Transform.prototype.setMap = function(map) {
  if (this.getMap()) {
    this.getMap().removeLayer(this.overlayLayer_);
    if (this.previousCursor_) {
      this.getMap().getTargetElement().style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
  ol.interaction.Pointer.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
  if (map === null) {
    this.select(null);
  }
  if (map !== null) {
    this.isTouch = /touch/.test(map.getViewport().className);
    this.setDefaultStyle();
  }
};
/**
 * Activate/deactivate interaction
 * @param {bool}
 * @api stable
 */
ol.interaction.Transform.prototype.setActive = function(b) {
  this.select(null);
  this.overlayLayer_.setVisible(b);
  ol.interaction.Pointer.prototype.setActive.call (this, b);
};
/** Set efault sketch style
*/
ol.interaction.Transform.prototype.setDefaultStyle = function() {
  // Style
  var stroke = new ol.style.Stroke({ color: [255,0,0,1], width: 1 });
  var strokedash = new ol.style.Stroke({ color: [255,0,0,1], width: 1, lineDash:[4,4] });
  var fill0 = new ol.style.Fill({ color:[255,0,0,0.01] });
  var fill = new ol.style.Fill({ color:[255,255,255,0.8] });
  var circle = new ol.style.RegularShape({
      fill: fill,
      stroke: stroke,
      radius: this.isTouch ? 12 : 6,
      points: 15
    });
  circle.getAnchor()[0] = this.isTouch ? -10 : -5;
  var bigpt = new ol.style.RegularShape({
      fill: fill,
      stroke: stroke,
      radius: this.isTouch ? 16 : 8,
      points: 4,
      angle: Math.PI/4
    });
  var smallpt = new ol.style.RegularShape({
      fill: fill,
      stroke: stroke,
      radius: this.isTouch ? 12 : 6,
      points: 4,
      angle: Math.PI/4
    });
  function createStyle (img, stroke, fill) {
    return [ new ol.style.Style({image:img, stroke:stroke, fill:fill}) ];
  }
  /** Style for handles */
  this.style = {
    'default': createStyle (bigpt, strokedash, fill0),
    'translate': createStyle (bigpt, stroke, fill),
    'rotate': createStyle (circle, stroke, fill),
    'rotate0': createStyle (bigpt, stroke, fill),
    'scale': createStyle (bigpt, stroke, fill),
    'scale1': createStyle (bigpt, stroke, fill),
    'scale2': createStyle (bigpt, stroke, fill),
    'scale3': createStyle (bigpt, stroke, fill),
    'scalev': createStyle (smallpt, stroke, fill),
    'scaleh1': createStyle (smallpt, stroke, fill),
    'scalev2': createStyle (smallpt, stroke, fill),
    'scaleh3': createStyle (smallpt, stroke, fill),
  };
  this.drawSketch_();
}
/**
 * Set sketch style.
 * @param {style} style Style name: 'default','translate','rotate','rotate0','scale','scale1','scale2','scale3','scalev','scaleh1','scalev2','scaleh3'
 * @param {ol.style.Style|Array<ol.style.Style>} olstyle
 * @api stable
 */
ol.interaction.Transform.prototype.setStyle = function(style, olstyle) {
  if (!olstyle) return;
  if (olstyle instanceof Array) this.style[style] = olstyle;
  else this.style[style] = [ olstyle ];
  for (var i=0; i<this.style[style].length; i++) {
    var im = this.style[style][i].getImage();
    if (im) {
      if (style == 'rotate') im.getAnchor()[0] = -5;
      if (this.isTouch) im.setScale(1.8);
    }
    var tx = this.style[style][i].getText();
    if (tx) {
      if (style == 'rotate') tx.setOffsetX(this.isTouch ? 14 : 7);
      if (this.isTouch) tx.setScale(1.8);
    }
  }
  this.drawSketch_();
};
/** Get Feature at pixel
 * @param {ol.Pixel}
 * @return {ol.feature}
 * @private
 */
ol.interaction.Transform.prototype.getFeatureAtPixel_ = function(pixel) {
  var self = this;
  return this.getMap().forEachFeatureAtPixel(pixel,
    function(feature, layer) {
      var found = false;
      // Overlay ?
      if (!layer) {
        if (feature===self.bbox_) return false;
        self.handles_.forEach (function(f) { if (f===feature) found=true; });
        if (found) return { feature: feature, handle:feature.get('handle'), constraint:feature.get('constraint'), option:feature.get('option') };
      }
      // No seletion
      if (!self.get('selection')) {
        // Return the currently selected feature the user is interacting with.
        if (self.selection_.getArray().some(function(f) { return feature === f; })) {
          return { feature: feature };
        }
        return null;
      }
      // filter condition
      if (self._filter) {
        if (self._filter(feature,layer)) return { feature: feature };
        else return null;
      }
      // feature belong to a layer
      else if (self.layers_) {
        for (var i=0; i<self.layers_.length; i++) {
          if (self.layers_[i]===layer) return { feature: feature };
        }
        return null;
      }
      // feature in the collection
      else if (self.features_) {
        self.features_.forEach (function(f) { if (f===feature) found=true; });
        if (found) return { feature: feature };
        else return null;
      }
      // Others
      else return { feature: feature };
    },
    { hitTolerance: this.get('hitTolerance') }
  ) || {};
}
/** Rotate feature from map view rotation
 * @param {ol.Feature} f the feature
 * @param {boolean} clone clone resulting geom
 * @param {ol.geom.Geometry} rotated geometry
 */
ol.interaction.Transform.prototype.getGeometryRotateToZero_ = function(f, clone) {
  var origGeom = f.getGeometry();
  var viewRotation = this.getMap().getView().getRotation();
  if (viewRotation === 0 || !this.get('enableRotatedTransform')) {
    return (clone) ? origGeom.clone() : origGeom;
  }
  var rotGeom = origGeom.clone();
  rotGeom.rotate(viewRotation * -1, this.getMap().getView().getCenter());
  return rotGeom;
}
/** Draw transform sketch
* @param {boolean} draw only the center
*/
ol.interaction.Transform.prototype.drawSketch_ = function(center) {
  var i, f, geom;
  this.overlayLayer_.getSource().clear();
  if (!this.selection_.getLength()) return;
  var viewRotation = this.getMap().getView().getRotation();
  var ext = this.getGeometryRotateToZero_(this.selection_.item(0)).getExtent();
  // Clone and extend
  ext = ol.extent.buffer(ext, 0);
  this.selection_.forEach(function (f) {
    var extendExt = this.getGeometryRotateToZero_(f).getExtent();
    ol.extent.extend(ext, extendExt);
  }.bind(this));
  if (center===true) {
    if (!this.ispt_) {
      this.overlayLayer_.getSource().addFeature(new ol.Feature( { geometry: new ol.geom.Point(this.center_), handle:'rotate0' }) );
      geom = ol.geom.Polygon.fromExtent(ext);
      if (this.get('enableRotatedTransform') && viewRotation !== 0) {
        geom.rotate(viewRotation, this.getMap().getView().getCenter())
      }
      f = this.bbox_ = new ol.Feature(geom);
      this.overlayLayer_.getSource().addFeature (f);
    }
  }
  else {
    if (this.ispt_) {
      var p = this.getMap().getPixelFromCoordinate([ext[0], ext[1]]);
      ext = ol.extent.boundingExtent([
        this.getMap().getCoordinateFromPixel([p[0]-10, p[1]-10]),
        this.getMap().getCoordinateFromPixel([p[0]+10, p[1]+10])
      ]);
    }
    geom = ol.geom.Polygon.fromExtent(ext);
    if (this.get('enableRotatedTransform') && viewRotation !== 0) {
      geom.rotate(viewRotation, this.getMap().getView().getCenter())
    }
    f = this.bbox_ = new ol.Feature(geom);
    var features = [];
    var g = geom.getCoordinates()[0];
    if (!this.ispt_) {
      features.push(f);
      // Middle
      if (!this.iscircle_ && this.get('stretch') && this.get('scale')) for (i=0; i<g.length-1; i++) {
        f = new ol.Feature( { geometry: new ol.geom.Point([(g[i][0]+g[i+1][0])/2,(g[i][1]+g[i+1][1])/2]), handle:'scale', constraint:i%2?"h":"v", option:i });
        features.push(f);
      }
      // Handles
      if (this.get('scale')) for (i=0; i<g.length-1; i++) {
        f = new ol.Feature( { geometry: new ol.geom.Point(g[i]), handle:'scale', option:i });
        features.push(f);
      }
      // Center
      if (this.get('translate') && !this.get('translateFeature')) {
        f = new ol.Feature( { geometry: new ol.geom.Point([(g[0][0]+g[2][0])/2, (g[0][1]+g[2][1])/2]), handle:'translate' });
        features.push(f);
      }
    }
    // Rotate
    if (!this.iscircle_ && this.get('rotate')) {
      f = new ol.Feature( { geometry: new ol.geom.Point(g[3]), handle:'rotate' });
      features.push(f);
    }
    // Add sketch
    this.overlayLayer_.getSource().addFeatures(features);
  }
};
/** Select a feature to transform
* @param {ol.Feature} feature the feature to transform
* @param {boolean} add true to add the feature to the selection, default false
*/
ol.interaction.Transform.prototype.select = function(feature, add) {
  if (!feature) {
    this.selection_.clear();
    this.drawSketch_();
    return;
  }
  if (!feature.getGeometry || !feature.getGeometry()) return;
  // Add to selection
  if (add) {
    this.selection_.push(feature);
  } else {
	var index = this.selection_.getArray().indexOf(feature);
	this.selection_.removeAt(index);	
  }
  this.ispt_ = (this.selection_.getLength()===1 ? (this.selection_.item(0).getGeometry().getType() == "Point") : false);
  this.iscircle_ = (this.selection_.getLength()===1 ? (this.selection_.item(0).getGeometry().getType() == "Circle") : false);
  this.drawSketch_();
  this.watchFeatures_();
  // select event
  this.dispatchEvent({ type:'select', feature: feature, features: this.selection_ });
};
/** Watch selected features
 * @private
 */
ol.interaction.Transform.prototype.watchFeatures_ = function() {
  // Listen to feature modification
  if (this._featureListeners) {
    this._featureListeners.forEach(function (l) {
      ol.Observable.unByKey(l)
    });
  }
  this._featureListeners = [];
  this.selection_.forEach(function(f) {
    this._featureListeners.push(
      f.on('change', function() {
        this.drawSketch_();
      }.bind(this))
    );
  }.bind(this));
};
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 * @private
 */
ol.interaction.Transform.prototype.handleDownEvent_ = function(evt) {
  if (!this._handleEvent(evt, this.selection_)) return;
  var sel = this.getFeatureAtPixel_(evt.pixel);
  var feature = sel.feature;
  if (this.selection_.getLength()
    && this.selection_.getArray().indexOf(feature) >= 0
    && ((this.ispt_ && this.get('translate')) || this.get('translateFeature'))
  ){
    sel.handle = 'translate';
  }
  if (sel.handle) {
    this.mode_ = sel.handle;
    this.opt_ = sel.option;
    this.constraint_ = sel.constraint;
    // Save info
    var viewRotation = this.getMap().getView().getRotation();
    this.coordinate_ = evt.coordinate;
    this.pixel_ = evt.pixel;
    this.geoms_ = [];
    this.rotatedGeoms_ = [];
    var extent = ol.extent.createEmpty();
    var rotExtent = ol.extent.createEmpty();
    for (var i=0, f; f=this.selection_.item(i); i++) {
      this.geoms_.push(f.getGeometry().clone());
      extent = ol.extent.extend(extent, f.getGeometry().getExtent());
      if (this.get('enableRotatedTransform') && viewRotation !== 0) {
        var rotGeom = this.getGeometryRotateToZero_(f, true);
        this.rotatedGeoms_.push(rotGeom);
        rotExtent = ol.extent.extend(rotExtent, rotGeom.getExtent());
      }
    }
    this.extent_ = (ol.geom.Polygon.fromExtent(extent)).getCoordinates()[0];
    if (this.get('enableRotatedTransform') && viewRotation !== 0) {
      this.rotatedExtent_ = (ol.geom.Polygon.fromExtent(rotExtent)).getCoordinates()[0];
    }
    if (this.mode_==='rotate') {
      this.center_ = this.getCenter() || ol.extent.getCenter(extent);
      if (this.get('enableRotatedTransform') && viewRotation !== 0) {
        this.rotatedCenter_ = this.getCenter() || ol.extent.getCenter(rotExtent);
      }
      // we are now rotating (cursor down on rotate mode), so apply the grabbing cursor
      var element = evt.map.getTargetElement();
      element.style.cursor = this.Cursors.rotate0;
      this.previousCursor_ = element.style.cursor;
    } else {
      this.center_ = ol.extent.getCenter(extent);
      if (this.get('enableRotatedTransform') && viewRotation !== 0) {
        this.rotatedCenter_ = ol.extent.getCenter(rotExtent);
      }
    }
    this.angle_ = Math.atan2(this.center_[1]-evt.coordinate[1], this.center_[0]-evt.coordinate[0]);
    if (this.get('enableRotatedTransform') && viewRotation !== 0) {
      var downPoint = new ol.geom.Point(evt.coordinate);
      downPoint.rotate(viewRotation * -1, this.rotatedCenter_);
      this.rotatedCoordinate_ = downPoint.getCoordinates();
    }
    this.dispatchEvent({
      type: this.mode_+'start',
      feature: this.selection_.item(0), // backward compatibility
      features: this.selection_,
      pixel: evt.pixel,
      coordinate: evt.coordinate
    });
    return true;
  }
  else if (this.get('selection')) {
    if (feature){
      if (!this.addFn_(evt)) this.selection_.clear();
      var index = this.selection_.getArray().indexOf(feature);
      if (index < 0) this.selection_.push(feature);
      else this.selection_.removeAt(index);
    } else {
      this.selection_.clear();
    }
    this.ispt_ = this.selection_.getLength()===1 ? (this.selection_.item(0).getGeometry().getType() == "Point") : false;
    this.iscircle_ = (this.selection_.getLength()===1 ? (this.selection_.item(0).getGeometry().getType() == "Circle") : false);
    this.drawSketch_();
    this.watchFeatures_();
    this.dispatchEvent({ type:'select', feature: feature, features: this.selection_, pixel: evt.pixel, coordinate: evt.coordinate });
    return false;
  }
};
/**
 * Get features to transform
 * @return {ol.Collection<ol.Feature>}
 */
ol.interaction.Transform.prototype.getFeatures = function() {
  return this.selection_;
};
/**
 * Get the rotation center
 * @return {ol.coordinates|undefined}
 */
ol.interaction.Transform.prototype.getCenter = function() {
  return this.get('center');
};
/**
 * Set the rotation center
 * @param {ol.coordinates|undefined} c the center point, default center on the objet
 */
ol.interaction.Transform.prototype.setCenter = function(c) {
  return this.set('center', c);
}
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @private
 */
ol.interaction.Transform.prototype.handleDragEvent_ = function(evt) {
  if (!this._handleEvent(evt, this.features_)) return;
  var i, f, geometry;
  switch (this.mode_) {
    case 'rotate': {
      var a = Math.atan2(this.center_[1]-evt.coordinate[1], this.center_[0]-evt.coordinate[0]);
      if (!this.ispt) {
        // var geometry = this.geom_.clone();
        // geometry.rotate(a-this.angle_, this.center_);
        // this.feature_.setGeometry(geometry);
        for (i=0, f; f=this.selection_.item(i); i++) {
          geometry = this.geoms_[i].clone();
          geometry.rotate(a - this.angle_, this.center_);
          // bug: ol, bad calculation circle geom extent
          if (geometry.getType() == 'Circle') geometry.setCenterAndRadius(geometry.getCenter(), geometry.getRadius());
          f.setGeometry(geometry);
        }
      }
      this.drawSketch_(true);
      this.dispatchEvent({
        type:'rotating',
        feature: this.selection_.item(0),
        features: this.selection_,
        angle: a-this.angle_,
        pixel: evt.pixel,
        coordinate: evt.coordinate
      });
      break;
    }
    case 'translate': {
      var deltaX = evt.coordinate[0] - this.coordinate_[0];
      var deltaY = evt.coordinate[1] - this.coordinate_[1];
      //this.feature_.getGeometry().translate(deltaX, deltaY);
      for (i=0, f; f=this.selection_.item(i); i++) {
        f.getGeometry().translate(deltaX, deltaY);
      }
      this.handles_.forEach(function(f) {
        f.getGeometry().translate(deltaX, deltaY);
      });
      this.coordinate_ = evt.coordinate;
      this.dispatchEvent({
        type:'translating',
        feature: this.selection_.item(0),
        features: this.selection_,
        delta:[deltaX,deltaY],
        pixel: evt.pixel,
        coordinate: evt.coordinate
      });
      break;
    }
    case 'scale': {
      var viewRotation = this.getMap().getView().getRotation();
      var center = this.center_;
      var rotationCenter = this.center_;
      if (this.get('modifyCenter')(evt)) {
        var extentCoordinates = this.extent_;
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          extentCoordinates = this.rotatedExtent_;
        }
        center = extentCoordinates[(Number(this.opt_)+2)%4];
      }
      var downCoordinate = this.coordinate_;
      if (this.get('enableRotatedTransform') && viewRotation !== 0) {
        downCoordinate = this.rotatedCoordinate_;
      }
      var dragCoordinate = evt.coordinate;
      if (this.get('enableRotatedTransform') && viewRotation !== 0) {
        var dragPoint = new ol.geom.Point(evt.coordinate);
        dragPoint.rotate(viewRotation * -1, rotationCenter);
        dragCoordinate = dragPoint.getCoordinates();
      }
      var scx = ((dragCoordinate)[0] - (center)[0]) / (downCoordinate[0] - (center)[0]);
      var scy = ((dragCoordinate)[1] - (center)[1]) / (downCoordinate[1] - (center)[1]);
      if (this.get('noFlip')) {
        if (scx<0) scx=-scx;
        if (scy<0) scy=-scy;
      }
      if (this.constraint_) {
        if (this.constraint_=="h") scx=1;
        else scy=1;
      } else {
        if (this.get('keepAspectRatio')(evt)) {
          scx = scy = Math.min(scx,scy);
        }
      }
      for (i=0, f; f=this.selection_.item(i); i++) {
        geometry = (viewRotation === 0 || !this.get('enableRotatedTransform')) ? this.geoms_[i].clone() : this.rotatedGeoms_[i].clone();
        geometry.applyTransform(function(g1, g2, dim) {
          if (dim<2) return g2;
          for (var j=0; j<g1.length; j+=dim) {
            if (scx!=1) g2[j] = center[0] + (g1[j]-center[0])*scx;
            if (scy!=1) g2[j+1] = center[1] + (g1[j+1]-center[1])*scy;
          }
          // bug: ol, bad calculation circle geom extent
          if (geometry.getType() == 'Circle') geometry.setCenterAndRadius(geometry.getCenter(), geometry.getRadius());
          return g2;
        });
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          //geometry.rotate(viewRotation, rotationCenter);
          geometry.rotate(viewRotation, this.getMap().getView().getCenter());
        }
        f.setGeometry(geometry);
      }
      this.drawSketch_();
      this.dispatchEvent({
        type:'scaling',
        feature: this.selection_.item(0),
        features: this.selection_,
        scale:[scx,scy],
        pixel: evt.pixel,
        coordinate: evt.coordinate
      });
      break;
    }
    default: break;
  }
};
/**
 * @param {ol.MapBrowserEvent} evt Event.
 * @private
 */
ol.interaction.Transform.prototype.handleMoveEvent_ = function(evt) {
  if (!this._handleEvent(evt, this.features_)) return;
  // console.log("handleMoveEvent");
  if (!this.mode_) {
    var sel = this.getFeatureAtPixel_(evt.pixel);
    var element = evt.map.getTargetElement();
    if (sel.feature) {
      var c = sel.handle ? this.Cursors[(sel.handle||'default')+(sel.constraint||'')+(sel.option||'')] : this.Cursors.select;
      if (this.previousCursor_===undefined) {
        this.previousCursor_ = element.style.cursor;
      }
      element.style.cursor = c;
    } else {
      if (this.previousCursor_!==undefined) element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
};
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
ol.interaction.Transform.prototype.handleUpEvent_ = function(evt) {
  // remove rotate0 cursor on Up event, otherwise it's stuck on grab/grabbing
  if (this.mode_ === 'rotate') {
    var element = evt.map.getTargetElement();
    element.style.cursor = this.Cursors.default;
    this.previousCursor_ = undefined;
  }
  //dispatchEvent
  this.dispatchEvent({
    type:this.mode_+'end',
    feature: this.selection_.item(0),
    features: this.selection_,
    oldgeom: this.geoms_[0],
    oldgeoms: this.geoms_
  });
  this.drawSketch_();
  this.mode_ = null;
  return false;
};
/** Get the features that are selected for transform
 * @return ol.Collection
 */
ol.interaction.Transform.prototype.getFeatures = function() {
  return this.selection_;
};

/** Undo/redo interaction
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires undo
 * @fires redo
 * @param {*} options
 */
ol.interaction.UndoRedo = function(options) {
  if (!options) options = {};
	ol.interaction.Interaction.call(this, {	
    handleEvent: function() { 
      return true; 
    }
  });
  this._undoStack = [];
  this._redoStack = [];
  // Block counter
  this._block = 0;
  // Start recording
  this._record = true;
  // Custom definitions
  this._defs = {};
};
ol.ext.inherits(ol.interaction.UndoRedo, ol.interaction.Interaction);
/** Add a custom undo/redo
 * @param {string} action the action key name
 * @param {function} undoFn function called when undoing
 * @param {function} redoFn function called when redoing
 * @api
 */
ol.interaction.UndoRedo.prototype.define = function(action, undoFn, redoFn) {
  this._defs['_'+action] = { undo: undoFn, redo: redoFn };
};
/** Set a custom undo/redo
 * @param {string} action the action key name
 * @param {any} prop an object that will be passed in the undo/redo fucntions of the action
 * @return {boolean} true if the action is defined
 */
ol.interaction.UndoRedo.prototype.push = function(action, prop) {
  if (this._defs['_'+action]) {
    this._undoStack.push({type: '_'+action, prop: prop });
    return true;
  } else {
    return false;
  }
};
/** Activate or deactivate the interaction, ie. records or not events on the map.
 * @param {boolean} active
 * @api stable
 */
ol.interaction.UndoRedo.prototype.setActive = function(active) {
  ol.interaction.Interaction.prototype.setActive.call (this, active);
  this._record = active;
};
/**
 * Remove the interaction from its current map, if any, and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.UndoRedo.prototype.setMap = function(map) {
  ol.interaction.Interaction.prototype.setMap.call (this, map);
  // Watch sources
  this._watchSources();
  this._watchInteractions();
};
/** Watch for changes in the map sources
 * @private
 */
ol.interaction.UndoRedo.prototype._watchSources = function() {
  var map = this.getMap();
  // Clear listeners
  if (this._sourceListener) {
    this._sourceListener.forEach(function(l) { ol.Observable.unByKey(l); })
  }
  this._sourceListener = [];
  // Ges vector layers 
  function getVectorLayers(layers, init) {
    if (!init) init = [];
    layers.forEach(function(l) {
      if (l instanceof ol.layer.Vector) {
        init.push(l);
      } else if (l.getLayers) {
        getVectorLayers(l.getLayers(), init);
      }
    });
    return init;
  }
  if (map) {
    // Watch the vector sources in the map 
    var vectors = getVectorLayers(map.getLayers());
    vectors.forEach((function(l) {
      var s = l.getSource();
      this._sourceListener.push( s.on(['addfeature', 'removefeature'], this._onAddRemove.bind(this)) );
      this._sourceListener.push( s.on('clearstart', this.blockStart.bind(this)) );
      this._sourceListener.push( s.on('clearend', this.blockEnd.bind(this)) );
    }).bind(this));
    // Watch new inserted/removed
    this._sourceListener.push( map.getLayers().on(['add', 'remove'], this._watchSources.bind(this) ) );
  }
};
/** Watch for interactions
 * @private
 */
ol.interaction.UndoRedo.prototype._watchInteractions = function() {
  var map = this.getMap();
  // Clear listeners
  if (this._interactionListener) {
    this._interactionListener.forEach(function(l) { ol.Observable.unByKey(l); })
  }
  this._interactionListener = [];
  if (map) {
    // Watch the interactions in the map 
    map.getInteractions().forEach((function(i) {
      this._interactionListener.push(i.on(
        ['setattributestart', 'modifystart', 'rotatestart', 'translatestart', 'scalestart', 'deletestart', 'deleteend', 'beforesplit', 'aftersplit'], 
        this._onInteraction.bind(this)
      ));
    }).bind(this));
    // Watch new inserted / unwatch removed
    this._interactionListener.push( map.getInteractions().on(
      ['add', 'remove'], 
      this._watchInteractions.bind(this)
    ));
  }
};
/** A feature is added / removed
 */
ol.interaction.UndoRedo.prototype._onAddRemove = function(e) {
  if (this._record) {
    this._undoStack.push({type: e.type, source: e.target, feature: e.feature });
    this._redoStack = [];
  }
};
ol.interaction.UndoRedo.prototype._onInteraction = function(e) {
  var fn = this._onInteraction[e.type];
  if (fn) fn.call(this,e);
};
/** Set attribute
 * @private
 */
ol.interaction.UndoRedo.prototype._onInteraction.setattributestart = function(e) {
  this.blockStart();
  var newp = Object.assign({}, e.properties);
  e.features.forEach(function(f) {
    var oldp = {};
    for (var p in newp) {
      oldp[p] = f.get(p);
    }
    this._undoStack.push({
      type: 'changeattribute', 
      feature: f, 
      newProperties: newp,
      oldProperties: oldp
    });
  }.bind(this));
  this.blockEnd();
};
ol.interaction.UndoRedo.prototype._onInteraction.rotatestart = 
ol.interaction.UndoRedo.prototype._onInteraction.translatestart = 
ol.interaction.UndoRedo.prototype._onInteraction.scalestart = 
ol.interaction.UndoRedo.prototype._onInteraction.modifystart = function (e) {
  this.blockStart();
  e.features.forEach(function(m) {
    this._undoStack.push({type: 'changefeature', feature: m, oldFeature: m.clone()  });
  }.bind(this));
  this.blockEnd();
};
/** Start an undo block
 * @api
 */
ol.interaction.UndoRedo.prototype.blockStart = function () {
  this._undoStack.push({ type: 'blockstart' });
  this._redoStack = [];
};
/** @private
 */
ol.interaction.UndoRedo.prototype._onInteraction.beforesplit =
ol.interaction.UndoRedo.prototype._onInteraction.deletestart =
ol.interaction.UndoRedo.prototype.blockStart;
/** End an undo block
 * @api
 */
ol.interaction.UndoRedo.prototype.blockEnd = function () {
  this._undoStack.push({ type: 'blockend' });
};
/** @private
 */
ol.interaction.UndoRedo.prototype._onInteraction.aftersplit =
ol.interaction.UndoRedo.prototype._onInteraction.deleteend =
ol.interaction.UndoRedo.prototype.blockEnd;
/** handle undo/redo
 * @private
 */
ol.interaction.UndoRedo.prototype._handleDo = function(e, undo) {
  // Not active
  if (!this.getActive()) return;
  // Stop recording while undoing
  this._record = false;
  switch (e.type) {
    case 'addfeature': {
      if (undo) e.source.removeFeature(e.feature);
      else e.source.addFeature(e.feature);
      break;
    }
    case 'removefeature': {
      if (undo) e.source.addFeature(e.feature);
      else e.source.removeFeature(e.feature);
      break;
    }
    case 'changefeature': {
      var geom = e.feature.getGeometry();
      e.feature.setGeometry(e.oldFeature.getGeometry());
      e.oldFeature.setGeometry(geom);
      break;
    }
    case 'changeattribute': {
      var newp = e.newProperties;
      var oldp = e.oldProperties;
      for (var p in oldp) {
        if (oldp === undefined) e.feature.unset(p);
        else e.feature.set(p, oldp[p]);
      }
      e.oldProperties = newp;
      e.newProperties = oldp;
      break;
    }
    case 'blockstart': {
      this._block += undo ? -1 : 1;
      break;
    }
    case 'blockend': {
      this._block += undo ? 1 : -1;
      break;
    }
    default: {
      if (this._defs[e.type]) {
        if (undo) this._defs[e.type].undo(e.prop);
        else this._defs[e.type].redo(e.prop);
      } else {
        console.warn('[UndoRedoInteraction]: "'+e.type.substr(1)+'" is not defined.');
      }
    }
  }
  // Handle block
  if (this._block<0) this._block = 0;
  if (this._block) {
    if (undo) this.undo();
    else this.redo();
  }
  this._record = true;
  // Dispatch event
  this.dispatchEvent( { 
    type: undo ? 'undo' : 'redo',
    action: e
  });
};
/** Undo last operation
 * @api
 */
ol.interaction.UndoRedo.prototype.undo = function() {
  var e = this._undoStack.pop();
  if (!e) return;
  this._redoStack.push(e);
  this._handleDo(e, true);
};
/** Redo last operation
 * @api
 */
ol.interaction.UndoRedo.prototype.redo = function() {
  var e = this._redoStack.pop();
  if (!e) return;
  this._undoStack.push(e);
  this._handleDo(e, false);
};
/** Clear undo stack
 * @api
 */
ol.interaction.UndoRedo.prototype.clear = function() {
  this._undoStack = [];
  this._redoStack = [];
};
/** Check if undo is avaliable
 * @return {number} the number of undo 
 * @api
 */
ol.interaction.UndoRedo.prototype.hasUndo = function() {
  return this._undoStack.length;
};
/** Check if redo is avaliable
 * @return {number} the number of redo
 * @api
 */
ol.interaction.UndoRedo.prototype.hasRedo = function() {
  return this._redoStack.length;
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Abstract base class; normally only used for creating subclasses. Bin collector for data
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol.source.VectorOptions + grid option
 *  @param {ol.source.Vector} options.source Source
 *  @param {boolean} options.listenChange listen changes (move) on source features to recalculate the bin, default true
 *  @param {fucntion} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
ol.source.BinBase = function (options) {
  options = options || {};
  this._bindModify = this._onModifyFeature.bind(this);
  this._watch === true;
  ol.source.Vector.call(this, options);
  this._origin = options.source;
  this._listen = (options.listenChange !== false);
  // Geometry function
  this._geomFn = options.geometryFunction || ol.coordinate.getFeatureCenter || function (f) { return f.getGeometry().getFirstCoordinate(); };
  // Existing features
  this.reset();
  // Future features
  this._origin.on('addfeature', this._onAddFeature.bind(this));
  this._origin.on('removefeature', this._onRemoveFeature.bind(this));
  this._origin.on('clearstart', this._onClearFeature.bind(this));
  this._origin.on('clearend', this._onClearFeature.bind(this));
  if (typeof (options.flatAttributes) === 'function') this._flatAttributes = options.flatAttributes;
};
ol.ext.inherits(ol.source.BinBase, ol.source.Vector);
/**
 * On add feature
 * @param {ol.events.Event} e
 * @param {ol.Feature} bin
 * @private
 */
ol.source.BinBase.prototype._onAddFeature = function (e, bin, listen) {
  var f = e.feature || e.target;
  bin = bin || this.getBinAt(this._geomFn(f), true);
  if (bin) bin.get('features').push(f);
  if (this._listen && listen!==false) f.on('change', this._bindModify);
};
/**
 *  On remove feature
 *  @param {ol.events.Event} e
 *  @param {ol.Feature} bin
 *  @private
 */
ol.source.BinBase.prototype._onRemoveFeature = function (e, bin, listen) {
  if (!this._watch) return;
  var f = e.feature || e.target;
  bin = bin || this.getBinAt(this._geomFn(f));
  if (bin) {
    // Remove feature from bin
    var features = bin.get('features');
    for (var i=0, fi; fi=features[i]; i++) {
      if (fi===f) {
        features.splice(i, 1);
        break;
      }
    }
    // Remove bin if no features
    if (!features.length) {
      this.removeFeature(bin);
    }
  } else {
    // console.log("[ERROR:Bin] remove feature: feature doesn't exists anymore.");
  }
  if (this._listen && listen!==false) f.un('change', this._bindModify);
};
/** When clearing features remove the listener
 * @private
 */
ol.source.BinBase.prototype._onClearFeature = function (e) {
  if (e.type==='clearstart') {
    if (this._listen) {
      this._origin.getFeatures().forEach(function (f) {
        f.un('change', this._bindModify);
      }.bind(this));
    }
    this.clear();
    this._watch = false;
  } else {
    this._watch = true;
  }
};
/**
 * Get the bin that contains a feature
 * @param {ol.Feature} f the feature
 * @return {ol.Feature} the bin or null it doesn't exit
 */
ol.source.BinBase.prototype.getBin = function (feature) {
  var bins = this.getFeatures();
  for (var i=0, b; b = bins[i]; i++) {
    var features = b.get('features');
    for (var j=0, f; f=features[j]; j++) {
      if (f===feature) return b;
    }
  }
  return null;
}
/** Get the grid geometry at the coord 
 * @param {ol.Coordinate} coord
 * @param {Object} attributes add key/value to this object to add properties to the grid feature
 * @returns {ol.geom.Polygon} 
 * @api
 */
ol.source.BinBase.prototype.getGridGeomAt = function (coord /*, attributes */) {
  return new ol.geom.Polygon([coord]);
};
/** Get the bean at a coord
 * @param {ol.Coordinate} coord
 * @param {boolean} create true to create if doesn't exit
 * @return {ol.Feature} the bin or null it doesn't exit
 */
ol.source.BinBase.prototype.getBinAt = function (coord, create) {
  var attributes = {};
  var g = this.getGridGeomAt(coord, attributes);
  if (!g) return null;
  var center = g.getInteriorPoint ? g.getInteriorPoint().getCoordinates() : g.getInteriorPoints().getCoordinates()[0];// ol.extent.getCenter(g.getExtent());
  var features = this.getFeaturesAtCoordinate( center );
  var bin = features[0];
  if (!bin && create) {
    attributes.geometry = g;
    attributes.features = [];
    attributes.center = center;
    bin = new ol.Feature(attributes);
    this.addFeature(bin);
  }
  return bin || null;
};
/**
 *  A feature has been modified
 *  @param {ol.events.Event} e
 *  @private
 */
ol.source.BinBase.prototype._onModifyFeature = function (e) {
  var bin = this.getBin(e.target);
  var bin2 = this.getBinAt(this._geomFn(e.target), 'create');
  if (bin !== bin2) {
    // remove from the bin
    if (bin) {
      this._onRemoveFeature(e, bin, false);
    }
    // insert in the new bin
    if (bin2) {
      this._onAddFeature(e, bin2, false);
    }
  }
  this.changed();
};
/** Clear all bins and generate a new one. 
 */
ol.source.BinBase.prototype.reset = function () {
  this.clear();
  var features = this._origin.getFeatures();
  for (var i = 0, f; f = features[i]; i++) {
    this._onAddFeature({ feature: f });
  }
};
/**
 * Get features without circular dependencies (vs. getFeatures)
 * @return {Array<ol.Feature>}
 */
ol.source.BinBase.prototype.getGridFeatures = function () {
  var features = [];
  this.getFeatures().forEach(function (f) {
    var bin = new ol.Feature(f.getGeometry().clone());
    for (var i in f.getProperties()) {
      if (i!=='features' && i!=='geometry') {
        bin.set(i, f.get(i));
      }
    }
    bin.set('nb', f.get('features').length);
    this._flatAttributes(bin, f.get('features'));
    features.push(bin);
  }.bind(this));
  return features;
};
/** Create bin attributes using the features it contains when exporting 
 * @param {ol.Feature} bin the bin to export
 * @param {Array<ol.Features>} features the features it contains
 */
ol.source.BinBase.prototype._flatAttributes = function(/*bin, features*/) {
};
/**
 * Get the orginal source
 * @return {ol.source.Vector}
 */
ol.source.BinBase.prototype.getSource = function () {
  return this._origin;
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  @classdesc
  ol.source.DBPedia is a DBPedia layer source that load DBPedia located content in a vector layer.
  olx.source.DBPedia: olx.source.Vector
  {	url: {string} Url for DBPedia SPARQL 
  }
  Inherits from:
  <ol.source.Vector>
*/
/**
* @constructor ol.source.DBPedia
* @extends {ol.source.Vector}
* @param {olx.source.DBPedia=} opt_options
*/
ol.source.DBPedia = function(opt_options) {
  var options = opt_options || {};
  options.loader = this._loaderFn;
  /** Url for DBPedia SPARQL */
  this._url = options.url || "http://fr.dbpedia.org/sparql";
  /** Max resolution to load features  */
  this._maxResolution = options.maxResolution || 100;
  /** Result language */
  this._lang = options.lang || "fr";
  /** Query limit */
  this._limit = options.limit || 1000;
  /** Default attribution */
  if (!options.attributions) options.attributions = [ "&copy; <a href='http://dbpedia.org/'>DBpedia</a> CC-by-SA" ];
  // Bbox strategy : reload at each move
    if (!options.strategy) options.strategy = ol.loadingstrategy.bbox;
  ol.source.Vector.call (this, options);
};
ol.ext.inherits(ol.source.DBPedia, ol.source.Vector);
/** Decode RDF attributes and choose to add feature to the layer
* @param {feature} the feature
* @param {attributes} RDF attributes
* @param {lastfeature} last feature added (null if none)
* @return {boolean} true: add the feature to the layer
* @API stable
*/
ol.source.DBPedia.prototype.readFeature = function (feature, attributes, lastfeature) {
  // Copy RDF attributes values
  for (var i in attributes) {
    if (attributes[i].type==='uri') attributes[i].value = encodeURI(attributes[i].value);
    feature.set (i, attributes[i].value);
  }
  // Prevent same feature with different type duplication
  if (lastfeature && lastfeature.get("subject") == attributes.subject.value) {
    // Kepp dbpedia.org type ?
    // if (bindings[i].type.match ("dbpedia.org") lastfeature.get("type") = bindings[i].type.value;
    // Concat types
    lastfeature.set("type", lastfeature.get("type") +"\n"+ attributes.type.value);
    return false;
  } else {
    return true;
  }
};
/** Set RDF query subject, default: select label, thumbnail, abstract and type
* @API stable
*/
ol.source.DBPedia.prototype.querySubject = function () {
  return "?subject rdfs:label ?label. "
    + "OPTIONAL {?subject dbpedia-owl:thumbnail ?thumbnail}."
    + "OPTIONAL {?subject dbpedia-owl:abstract ?abstract} . "
    + "OPTIONAL {?subject rdf:type ?type}";
}
/** Set RDF query filter, default: select language
* @API stable
*/
ol.source.DBPedia.prototype.queryFilter = function () {
  return	 "lang(?label) = '"+this._lang+"' "
    + "&& lang(?abstract) = '"+this._lang+"'"
  // Filter on type 
  //+ "&& regex (?type, 'Monument|Sculpture|Museum', 'i')"
}
/** Loader function used to load features.
* @private
*/
ol.source.DBPedia.prototype._loaderFn = function(extent, resolution, projection) {
  if (resolution > this._maxResolution) return;
  var self = this;
  var bbox = ol.proj.transformExtent(extent, projection, "EPSG:4326");
  // SPARQL request: for more info @see http://fr.dbpedia.org/
  var query =	"PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> "
        + "SELECT DISTINCT * WHERE { "
        + "?subject geo:lat ?lat . "
        + "?subject geo:long ?long . "
        + this.querySubject()+" . "
        + "FILTER("+this.queryFilter()+") . "
        // Filter bbox
        + "FILTER(xsd:float(?lat) <= " + bbox[3] + " && " + bbox[1] + " <= xsd:float(?lat) "
        + "&& xsd:float(?long) <= " + bbox[2] + " && " + bbox[0] + " <= xsd:float(?long) "
        + ") . "
        + "} LIMIT "+this._limit;
  // Ajax request to get the tile
  ol.ext.Ajax.get({
    url: this._url,
    data: { query: query, format:"json" },
    success: function(data) {
      var bindings = data.results.bindings;
      var features = [];
      var att, pt, feature, lastfeature = null;
      for ( var i in bindings ) {
        att = bindings[i];
        pt = [Number(bindings[i].long.value), Number(bindings[i].lat.value)];
        feature = new ol.Feature(new ol.geom.Point(ol.proj.transform (pt,"EPSG:4326",projection)));
        if (self.readFeature(feature, att, lastfeature)) {
          features.push(feature);
          lastfeature = feature;
        }
      }
      self.addFeatures(features);
    }});
};
ol.style.clearDBPediaStyleCache;
ol.style.dbPediaStyleFunction; 
(function(){
// Style cache
var styleCache = {};
/** Reset the cache (when fonts are loaded)
*/
ol.style.clearDBPediaStyleCache = function() {
  styleCache = {};
}
/** Get a default style function for dbpedia
* @param {} options
* @param {string|function|undefined} options.glyph a glyph name or a function that takes a feature and return a glyph
* @param {number} options.radius radius of the symbol, default 8
* @param {ol.style.Fill} options.fill style for fill, default navy
* @param {ol.style.stroke} options.stroke style for stroke, default 2px white
* @param {string} options.prefix a prefix if many style used for the same type
*
* @require ol.style.FontSymbol and FontAwesome defs are required for dbPediaStyleFunction()
*/
ol.style.dbPediaStyleFunction = function(options) {
  if (!options) options={};
  // Get font function using dbPedia type
  var getFont;
  switch (typeof(options.glyph)) {
    case "function": getFont = options.glyph; break;
    case "string": getFont = function(){ return options.glyph; }; break;
    default: {
      getFont = function (f) {
        var type = f.get("type");
        if (type) {
          if (type.match("/Museum")) return "fa-camera";
          else if (type.match("/Monument")) return "fa-building";
          else if (type.match("/Sculpture")) return "fa-android";
          else if (type.match("/Religious")) return "fa-institution";
          else if (type.match("/Castle")) return "fa-key";
          else if (type.match("Water")) return "fa-tint";
          else if (type.match("Island")) return "fa-leaf";
          else if (type.match("/Event")) return "fa-heart";
          else if (type.match("/Artwork")) return "fa-asterisk";
          else if (type.match("/Stadium")) return "fa-futbol-o";
          else if (type.match("/Place")) return "fa-street-view";
        }
        return "fa-star";
      }
      break;
    }
  }
  // Default values
  var radius = options.radius || 8;
  var fill = options.fill || new ol.style.Fill({ color:"navy"});
  var stroke = options.stroke || new ol.style.Stroke({ color: "#fff", width: 2 });
  var prefix = options.prefix ? options.prefix+"_" : "";
  // Vector style function
  return function (feature) {
    var glyph = getFont(feature);
    var k = prefix + glyph;
    var style = styleCache[k];
    if (!style) {
      styleCache[k] = style = new ol.style.Style ({
        image: new ol.style.FontSymbol({
          glyph: glyph, 
          radius: radius, 
          fill: fill,
          stroke: stroke
        })
      });
    }
    return [style];
  }
};
})();

/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** DFCI source: a source to display the French DFCI grid on a map
 * @see http://ccffpeynier.free.fr/Files/dfci.pdf
 * @constructor ol.source.DFCI
 * @extends {ol/source/Vector}
 * @param {any} options Vector source options
 *  @param {Array<Number>} resolutions a list of resolution to change the drawing level, default [1000,100,20]
 */
ol.source.DFCI = function(options) {
	options = options || {};
	options.loader = this._calcGrid;
  options.strategy =  function(extent, resolution) {
    if (this.resolution && this.resolution != resolution){
      this.clear();
      this.refresh();
    }
    return [extent];
  }
  this._bbox = [[0,1600000],[11*100000, 1600000+10*100000]];
  ol.source.Vector.call (this, options);
  this.set('resolutions', options.resolutions || [1000,100,20]);
  // Add Lambert IIe proj 
  if (!proj4.defs["EPSG:27572"]) proj4.defs("EPSG:27572","+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs");
  ol.proj.proj4.register(proj4);
};
ol.ext.inherits(ol.source.DFCI, ol.source.Vector);
/** Cacluate grid according extent/resolution
 */
ol.source.DFCI.prototype._calcGrid = function (extent, resolution, projection) {
  // Show step 0
  var f, ext, res = this.get('resolutions');
  if (resolution > (res[0] || 1000)) {
    if (this.resolution != resolution) {
      if (!this._features0) {
        ext = [this._bbox[0][0], this._bbox[0][1],this._bbox[1][0], this._bbox[1][1]];
        this._features0 = this._getFeatures(0, ext, projection);
      }
      this.addFeatures(this._features0);
    }
  }
  else if (resolution > (res[1] || 100)) {
    this.clear();
    ext = ol.proj.transformExtent(extent, projection, 'EPSG:27572');
    f = this._getFeatures(1, ext, projection)
    this.addFeatures(f);
  }
  else if (resolution > (res[2] || 0)) {
    this.clear();
    ext = ol.proj.transformExtent(extent, projection, 'EPSG:27572');
    f = this._getFeatures(2, ext, projection)
    this.addFeatures(f);
  }
  else {
    this.clear();
    ext = ol.proj.transformExtent(extent, projection, 'EPSG:27572');
    f = this._getFeatures(3, ext, projection)
    this.addFeatures(f);
  }
  // reset load
  this.resolution = resolution;
};
/**
 * Get middle point
 * @private
 */
ol.source.DFCI.prototype._midPt = function(p1,p2) {
  return [(p1[0]+p2[0])/2, (p1[1]+p2[1])/2];
};
/**
 * Get feature with geom
 * @private
 */
ol.source.DFCI.prototype._trFeature = function(geom, id, level, projection) {
  var g  = new ol.geom.Polygon([geom]);
  var f = new ol.Feature(g.transform('EPSG:27572', projection));
  f.set('id', id);
  f.set('level', level);
  return f;
};
/** Get features
 * 
 */
ol.source.DFCI.prototype._getFeatures = function (level, extent, projection) {
  var features = [];
  var i;
  var step = 100000;
  if (level>0) step /= 5;
  if (level>1) step /= 10;
  var p0 = [
    Math.max(this._bbox[0][0], Math.floor(extent[0]/step)*step), 
    Math.max(this._bbox[0][1], Math.floor(extent[1]/step)*step)
  ];
  var p1 = [
    Math.min(this._bbox[1][0]+99999, Math.floor(extent[2]/step)*step), 
    Math.min(this._bbox[1][1]+99999, Math.floor(extent[3]/step)*step)
  ];
  for (var x=p0[0]; x<=p1[0]; x += step) {
    for (var y=p0[1]; y<=p1[1]; y += step) {
      var p, geom = [ [x,y], [x+step, y], [x+step, y+step], [x , y+step], [x,y]];
      if (level>2) {
        var m = this._midPt(geom[0],geom[2]);
        // .5
        var g = [];
        for (i=0; i<geom.length; i++) {
          g.push(this._midPt(geom[i],m))
        }
        features.push(this._trFeature(g, ol.coordinate.toDFCI([x,y], 2)+'.5', level, projection));
        // .1 > .4
        for (i=0; i<4; i++) {
          g = [];
          g.push(geom[i]);
          g.push(this._midPt(geom[i],geom[(i+1)%4]));
          g.push(this._midPt(m,g[1]));
          g.push(this._midPt(m,geom[i]));
          p = this._midPt(geom[i],geom[(i+3)%4]);
          g.push(this._midPt(m,p));
          g.push(p);
          g.push(geom[i]);
          features.push(this._trFeature(g, ol.coordinate.toDFCI([x,y], 2)+'.'+(4-i), level, projection));
        }
      } else {
        features.push(this._trFeature(geom, ol.coordinate.toDFCI([x,y], level), level, projection));
      }
    }
  }
  return features
};

/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** DayNight source: a source to display day/night on a map
 * @constructor 
 * @extends {ol.source.Vector}
 * @param {any} options Vector source options
 *  @param {string|Date} time source date time
 *  @param {number} step step in degree for coordinate precision
 */
ol.source.DayNight = function(options) {
  options = options || {};
  options.loader = this._loader
  options.strategy = ol.loadingstrategy.all;
  ol.source.Vector.call (this, options);
  this.set('time', options.time || new Date());
  this.set('step', options.step || 1);
};
ol.ext.inherits(ol.source.DayNight, ol.source.Vector);
(function(){
/** Loader
 * @private
 */
ol.source.DayNight.prototype._loader = function(extent, resolution, projection) {
  var lonlat = this.getCoordinates(this.get('time'));
  var geom = new ol.geom.Polygon([lonlat]);
  geom.transform('EPSG:4326', projection);
  this.addFeature(new ol.Feature(geom));
};
/** Set source date time
 * @param {string|Date} time source date time
 */
ol.source.DayNight.prototype.setTime = function(time) {
  this.set('time', time);
  this.refresh();
};
/** Compute the position of the Sun in ecliptic coordinates at julianDay.
 * @see http://en.wikipedia.org/wiki/Position_of_the_Sun 
 * @param {number} julianDay
 * @private
 */
function _sunEclipticPosition(julianDay) {
  var deg2rad = Math.PI / 180;
  // Days since start of J2000.0
  var n = julianDay - 2451545.0;
  // mean longitude of the Sun
  var L = 280.460 + 0.9856474 * n;
  L %= 360;
  // mean anomaly of the Sun
  var g = 357.528 + 0.9856003 * n;
  g %= 360;
  // ecliptic longitude of Sun
  var lambda = L + 1.915 * Math.sin(g * deg2rad) +
    0.02 * Math.sin(2 * g * deg2rad);
  // distance from Sun in AU
  var R = 1.00014 - 0.01671 * Math.cos(g * deg2rad) -
    0.0014 * Math.cos(2 * g * deg2rad);
  return { lambda: lambda, R: R };
}
/** 
 * @see http://en.wikipedia.org/wiki/Axial_tilt#Obliquity_of_the_ecliptic_.28Earth.27s_axial_tilt.29
 * @param {number} julianDay
 * @private
 */
function _eclipticObliquity(julianDay) {
  var n = julianDay - 2451545.0;
  // Julian centuries since J2000.0
  var T = n / 36525;
  var epsilon = 23.43929111 -
    T * (46.836769 / 3600
      - T * (0.0001831 / 3600
        + T * (0.00200340 / 3600
          - T * (0.576e-6 / 3600
            - T * 4.34e-8 / 3600))));
  return epsilon;
}
/* Compute the Sun's equatorial position from its ecliptic position.
 * @param {number} sunEclLng sun lon in degrees
 * @param {number} eclObliq secliptic position in degrees
 * @return {number} position in degrees
 * @private
 */
function _sunEquatorialPosition(sunEclLon, eclObliq) {
  var rad2deg = 180 / Math.PI;
  var deg2rad = Math.PI / 180;
  var alpha = Math.atan(Math.cos(eclObliq * deg2rad)
    * Math.tan(sunEclLon * deg2rad)) * rad2deg;
  var delta = Math.asin(Math.sin(eclObliq * deg2rad)
    * Math.sin(sunEclLon * deg2rad)) * rad2deg;
  var lQuadrant = Math.floor(sunEclLon / 90) * 90;
  var raQuadrant = Math.floor(alpha / 90) * 90;
  alpha = alpha + (lQuadrant - raQuadrant);
  return {alpha: alpha, delta: delta};
};
/** Get night-day separation line
 * @param {string} time DateTime string, default yet
 * @param {string} options use 'line' to get the separation line, 'day' to get the day polygon, 'night' to get the night polygon or 'daynight' to get both polygon, default 'night'
 * @return {Array<ol.Point>|Array<Array<ol.Point>>}
 */
ol.source.DayNight.prototype.getCoordinates = function (time, options) {
  var rad2deg = 180 / Math.PI;
  var deg2rad = Math.PI / 180;
  var date = time ? new Date(time) : new Date();
  // Calculate the present UTC Julian Date. 
  // Function is valid after the beginning of the UNIX epoch 1970-01-01 and ignores leap seconds. 
  var julianDay = (date / 86400000) + 2440587.5;
  // Calculate Greenwich Mean Sidereal Time (low precision equation).
  // http://aa.usno.navy.mil/faq/docs/GAST.php 
  var gst = (18.697374558 + 24.06570982441908 * (julianDay - 2451545.0)) % 24;
  var lonlat = [];
  var sunEclPos = _sunEclipticPosition(julianDay);
  var eclObliq = _eclipticObliquity(julianDay);
  var sunEqPos = _sunEquatorialPosition(sunEclPos.lambda, eclObliq);
  var step = this.get('step') || 1;
  for (var i = -180; i <= 180; i += step) {
    var lon = i;
    // Hour angle (indegrees) of the sun for a longitude on Earth.
    var ha = (gst * 15 + lon) - sunEqPos.alpha;
    // Latitude     
    var lat = Math.atan(-Math.cos(ha * deg2rad) /
      Math.tan(sunEqPos.delta * deg2rad)) * rad2deg;
    // New point
    lonlat.push([lon, lat]);
  }
  switch (options) {
    case 'line': break;
    case 'day': sunEqPos.delta *= -1;
    // fallthrough
    default: {
      // Close polygon
      lat = (sunEqPos.delta < 0) ? 90 : -90;
      lonlat.unshift([-180, lat]);
      lonlat.push([180, lat]);
      lonlat.push(lonlat[0])
      break;
    }
  }
  // Return night + day polygon
  if (options === 'daynight') {
    var day = [];
    lonlat.forEach(function (t) { day.push(t.slice()); });
    day[0][1] = -day[0][1];
    day[day.length-1][1] = -day[0][1];
    day[day.length-1][1] = -day[0][1];
    lonlat = [ lonlat, day ];
  }
  // Return polygon
  return lonlat;
};
})();

/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
/** Delaunay source
 * Calculate a delaunay triangulation from points in a source
 * @param {*} options extend ol/source/Vector options
 *  @param {ol/source/Vector} options.source the source that contains the points
 */
ol.source.Delaunay = function(options) {
  options = options || {};
  this._nodes = options.source;
  delete options.source;
  ol.source.Vector.call (this, options);
  // Convex hull
  this.hull = [];
  // A new node is added to the source node: calculate the new triangulation
  this._nodes.on('addfeature', this._onAddNode.bind(this));
  // A new node is removed from the source node: calculate the new triangulation
  this._nodes.on('removefeature', this._onRemoveNode.bind(this));
  this.set ('epsilon', options.epsilon || .0001)
};
ol.ext.inherits(ol.source.Delaunay, ol.source.Vector);
/** Add a new triangle in the source
 * @param {Array<ol/coordinates>} pts
 */
ol.source.Delaunay.prototype._addTriangle = function(pts) {
  var triangle = new ol.Feature(new ol.geom.Polygon([pts]));
  this.addFeature(triangle);
  this.flip.push(triangle);
  return triangle;
};
/** Get nodes 
 */
ol.source.Delaunay.prototype.getNodes = function () {
  return this._nodes.getFeatures();
};
/** Get nodes source
 */
ol.source.Delaunay.prototype.getNodeSource = function () {
  return this._nodes;
};
/**
 * A point has been removed
 * @param {ol/source/Vector.Event} evt 
 */
ol.source.Delaunay.prototype._onRemoveNode = function(evt) {
  // console.log(evt)
  var pt = evt.feature.getGeometry().getCoordinates();
  if (!pt) return;
  // Still there (when removing duplicated points)
  if (this.getNodesAt(pt).length) return;
  // Get associated triangles
  var triangles = this.getTrianglesAt(pt);
  this.flip=[];
  // Get hole
  var i;
  var edges = [];
  while (triangles.length) {
    var tr = triangles.pop()
    this.removeFeature(tr);
    tr = tr.getGeometry().getCoordinates()[0];
    var pts = [];
    for (i=0, p; p = tr[i]; i++) {
      if (!ol.coordinate.equal(p,pt)) {
        pts.push(p);
      }
    }
    edges.push(pts);
  }
  pts = edges.pop();
var se = '';
edges.forEach(function(e){
  se += ' - '+this.listpt(e);
}.bind(this));
console.log('EDGES', se);
  i = 0;
  function testEdge(p0, p1, index) {
    if (ol.coordinate.equal(p0, pts[index])) {
      if (index) pts.push(p1);
      else pts.unshift(p1);
      return true
    }
    return false;
  }
  while (true) {
    var e = edges[i];
    if ( testEdge(e[0], e[1], 0) 
      || testEdge(e[1], e[0], 0)
      || testEdge(e[0], e[1], pts.length-1)
      || testEdge(e[1], e[0], pts.length-1)
    ) {
      edges.splice(i,1);
      i = 0;
    } else {
      i++
    }
    if (!edges.length) break;
    if (i>=edges.length) {
      console.log(this.listpt(pts), this.listpt(edges));
      throw '[DELAUNAY:removePoint] No edge found';
    }
  }
  // Closed = interior
console.log('PTS', this.listpt(pts))
  var closed = ol.coordinate.equal(pts[0], pts[pts.length-1]);
  if (closed) pts.pop();
  // Update convex hull: remove pt + add new ones
  var p;
  for (i; p=this.hull[i]; i++) {
    if (ol.coordinate.equal(pt,p)) {
      this.hull.splice(i,1);
      break;
    }
  }
  this.hull = ol.coordinate.convexHull(this.hull.concat(pts));
// select.getFeatures().clear();
  // 
  var clockwise = function (t) {
    var i1, s = 0;
    for (var i=0; i<t.length; i++) {
      i1 = (i+1) % t.length;
      s += (t[i1][0] - t[i][0]) * (t[i1][1] + t[i][1]);
    }
    console.log(s)
    return (s>=0 ? 1:-1)
  };
  // Add ears
  // a l'interieur : Si surface ear et surface de l'objet ont meme signe
  // extrieur ? ajoute le point et idem ? + ferme la 
  var clock;
var enveloppe = pts.slice();
  if (closed) {
    clock = clockwise(pts);
  } else {
    console.log('ouvert', pts, pts.slice().push(pt))
enveloppe.push(pt);
    clock = clockwise(enveloppe);
  }
console.log('S=',clock,'CLOSED',closed)
console.log('E=',this.listpt(enveloppe))
  for (i=0; i<=pts.length+1; i++) {
    if (pts.length<3) break;
    var t = [
      pts[i % pts.length],
      pts[(i+1) % pts.length],
      pts[(i+2) % pts.length] 
    ];
    if (clockwise(t)===clock) {
      var ok = true;
      for (var k=i+3; k<i+pts.length; k++) {
        console.log('test '+k, this.listpt([pts[k % pts.length]]))
        if (this.inCircle(pts[k % pts.length], t)) {
          ok = false;
          break;
        }
      }
      if (ok) {
console.log(this.listpt(t),'ok');
        this._addTriangle(t);
        // remove
        pts.splice((i+1) % pts.length, 1);
        // and restart
        i = -1;
      }
    }
else console.log(this.listpt(t),'nok');
  }
/* DEBUG * /
if (pts.length>3) console.log('oops');
console.log('LEAV',this.listpt(pts));
var ul = $('ul.triangles').html('');
$('<li>')
.text('E:'+this.listpt(enveloppe)+' - '+clock+' - '+closed)
.data('triangle', new ol.Feature(new ol.geom.Polygon([enveloppe])))
.click(function(){
  var t = $(this).data('triangle');
  select.getFeatures().clear();
  select.getFeatures().push(t);
})
.appendTo(ul);
for (var i=0; i<this.flip.length; i++) {
  $('<li>')
    .text(this.listpt(this.flip[i].getGeometry().getCoordinates()[0])
        +' - ' + clockwise(this.flip[i].getGeometry().getCoordinates()[0]))
    .data('triangle', this.flip[i])
    .click(function(){
      var t = $(this).data('triangle');
      select.getFeatures().clear();
      select.getFeatures().push(t);
    })
    .appendTo(ul);
}
/**/
  // Flip?
  this.flipTriangles();
};
/**
 * A new point has been added
 * @param {ol/source/VectorEvent} e 
 */
ol.source.Delaunay.prototype._onAddNode = function(e) {
  var finserted = e.feature;
  var i, p;
  // Not a point!
  if (finserted.getGeometry().getType() !== 'Point') {
    this._nodes.removeFeature(finserted);
    return;
  }
  // Reset flip table
  this.flip = [];
  var nodes = this.getNodes();
  // The point
  var pt = finserted.getGeometry().getCoordinates();
  // Test existing point
  if (this.getNodesAt(pt).length > 1) {
    console.log('remove duplicated points')
    this._nodes.removeFeature(finserted);
    return;
  }
  // Triangle needs at least 3 points
  if (nodes.length <= 3) {
    if (nodes.length===3) {
      var pts = [];
      for (i=0; i<3; i++) pts.push(nodes[i].getGeometry().getCoordinates());
      this._addTriangle(pts);
      this.hull = ol.coordinate.convexHull(pts);
    }
    return;
  }
  // Get the triangle
  var t = this.getFeaturesAtCoordinate(pt)[0];
  if (t) {
    this.removeFeature(t);
    t.set('del', true);
    var c = t.getGeometry().getCoordinates()[0];
    for (i=0; i<3; i++) {
      this._addTriangle([ pt, c[i], c[(i+1)%3]]);
    }
  } else {
    // Calculate new convex hull
    var hull2 = this.hull.slice();
    hull2.push(pt);
    hull2 = ol.coordinate.convexHull(hull2);
    // Search for points
    for (i=0; p=hull2[i]; i++) {
      if (ol.coordinate.equal(p,pt)) break;
    }
    i = (i!==0 ? i-1 : hull2.length-1);
    var p0 = hull2[i];
    var stop = hull2[(i+2) % hull2.length];
    for (i=0; p=this.hull[i]; i++) {
      if (ol.coordinate.equal(p,p0)) break;
    }
    // Connect to the hull
    while (true) {
      // DEBUG: prevent infinit loop
      if (i>1000) {
        console.error('[DELAUNAY:addPoint] Too many iterations')
        break;
      }
      i++;
      p = this.hull[i % this.hull.length];
      this._addTriangle([pt, p, p0]);
      p0 = p;
      if (p[0] === stop[0] && p[1] === stop[1]) break;
    }
    this.hull = hull2;
  }
  this.flipTriangles();
};
/** Flipping algorithme: test new inserted triangle and flip
 */
ol.source.Delaunay.prototype.flipTriangles = function ()	{
  var count = 1000; // Count to prevent too many iterations
  var pi;
  while (this.flip.length) {
    // DEBUG: prevent infinite loop
    if (count--<0) {
      console.error('[DELAUNAY:flipTriangles] Too many iterations')
      break;
    }
    var tri = this.flip.pop();
    if (tri.get('del')) continue;
    var ti = tri.getGeometry().getCoordinates()[0];
    for (var k=0; k<3; k++) {
      // Get facing triangles
      var mid = [(ti[(k+1)%3][0]+ti[k][0])/2, (ti[(k+1)%3][1]+ti[k][1])/2];
      var triangles = this.getTrianglesAt(mid);
      var pt1 = null;
      // Get opposite point
      if (triangles.length>1) {
        var t0 = triangles[0].getGeometry().getCoordinates()[0];
        var t1 = triangles[1].getGeometry().getCoordinates()[0];
        for (pi=0; pi<t1.length; pi++) {
          if (!this._ptInTriangle(t1[pi], t0)) {
            pt1 = t1[pi];
            break;
          }
        }
      }
      if (pt1) {
        // Is in circle ?
        if (this.inCircle(pt1, t0)) {
          var pt2;
          // Get opposite point
          for (pi=0; pi<t0.length; pi++) {
            if (!this._ptInTriangle(t0[pi], t1)) {
              pt2 = t0.splice(pi,1)[0];
              break;
            }
          }
          // Flip triangles
          if (this.intersectSegs([pt1, pt2], t0)) {
            while (triangles.length) {
              var tmp = triangles.pop();
              tmp.set('del', true);
              this.removeFeature(tmp);
            }
            this._addTriangle([pt1, pt2, t0[0]]);
            this._addTriangle([pt1, pt2, t0[1]]);
          }
        }
      }
    }
  }
};
/** Test intersection beetween 2 segs
 * @param {Array<ol.coordinates>} d1
 * @param {Array<ol.coordinates>} d2
 * @return {bbolean}
 */
ol.source.Delaunay.prototype.intersectSegs = function (d1, d2)	{
  var d1x = d1[1][0] - d1[0][0];
  var d1y = d1[1][1] - d1[0][1];
  var d2x = d2[1][0] - d2[0][0];
  var d2y = d2[1][1] - d2[0][1];
  var det = d1x * d2y - d1y * d2x;
  if (det != 0) {
    var k = (d1x * d1[0][1] - d1x * d2[0][1] - d1y * d1[0][0] + d1y * d2[0][0]) / det;
    // Intersection: return [d2[0][0] + k*d2x, d2[0][1] + k*d2y];
    return (0<k && k<1);
  }
  else return false;
};
/** Test pt is a triangle's node
 * @param {ol.coordinate} pt
 * @param {Array<ol.coordinate>} triangle
 * @return {boolean}
 */
ol.source.Delaunay.prototype._ptInTriangle = function(pt, triangle) {
  for (var i=0, p; p=triangle[i]; i++) {
    if (ol.coordinate.equal(pt,p)) return true;
  }
  return false;
};
/** List points in a triangle (assume points get an id) for debug purposes
 * @param {Array<ol.coordinate>} pts
 * @return {String} ids list
 */
ol.source.Delaunay.prototype.listpt = function (pts) {
  var s = '';
  for (var i=0, p; p = pts[i]; i++) {
    var c = this._nodes.getClosestFeatureToCoordinate(p);
    if (!ol.coordinate.equal(c.getGeometry().getCoordinates(), p)) c=null;
    s += (s?', ':'') + (c ? c.get('id') : '?');
  }
  return s;
};
/** Test if coord is within triangle's circumcircle 
 * @param {ol.coordinate} coord
 * @param {Array<ol.coordinate>} triangle
 * @return {boolean}
 */
ol.source.Delaunay.prototype.inCircle = function (coord, triangle) {
  var c = this.getCircumCircle(triangle);
  return ol.coordinate.dist2d(coord, c.center) < c.radius;
}
/** Calculate the circumcircle of a triangle
 * @param {Array<ol.coordinate>} triangle
 * @return {*}
 */
ol.source.Delaunay.prototype.getCircumCircle = function (triangle) {
  var x1 = triangle[0][0];
  var y1 = triangle[0][1];
  var x2 = triangle[1][0];
  var y2 = triangle[1][1];
  var x3 = triangle[2][0];
  var y3 = triangle[2][1];
  var m1 = (x1-x2)/(y2-y1);
  var m2 = (x1-x3)/(y3-y1);
  var b1 = ((y1+y2)/2) - m1*(x1+x2)/2;
  var b2 = ((y1+y3)/2) - m2*(x1+x3)/2;
  var cx = (b2-b1)/(m1-m2);
  var cy = m1*cx + b1;
  var center = [cx, cy];
  return  { 
    center: center, 
    radius: ol.coordinate.dist2d(center,triangle[0])
  };
};
/** Get triangles at a point
 */
ol.source.Delaunay.prototype.getTrianglesAt = function(coord) {
  var extent = ol.extent.buffer (ol.extent.boundingExtent([coord]), this.get('epsilon'));
  var result = [];
  this.forEachFeatureIntersectingExtent(extent, function(f){
    result.push(f);
  });
  return result;
};
/** Get nodes at a point
 */
ol.source.Delaunay.prototype.getNodesAt = function(coord) {
  var extent = ol.extent.buffer (ol.extent.boundingExtent([coord]), this.get('epsilon'));
  return this._nodes.getFeaturesInExtent(extent);
};

  /*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A source for INSEE grid
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol.source.VectorOptions + grid option
 *  @param {ol.source.Vector} options.source Source
 *  @param {number} [options.size] size of the grid in meter, default 200m
 *  @param {function} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
ol.source.FeatureBin = function (options) {
  options = options || {};
  this._sourceFeature = new ol.source.Vector ({ features: options.features || [] });
  ol.source.BinBase.call(this, options);
};
ol.ext.inherits(ol.source.FeatureBin, ol.source.BinBase);
/** Set grid size
 * @param {ol.Feature} features
 */
ol.source.FeatureBin.prototype.setFeatures = function (features) {
  this._sourceFeature.clear();
  this._sourceFeature.addFeatures(features || []);
  this.reset();
};
/** Get the grid geometry at the coord 
 * @param {ol.Coordinate} coord
 * @returns {ol.geom.Polygon} 
 * @api
 */
ol.source.FeatureBin.prototype.getGridGeomAt = function (coord, attributes) {
  var f = this._sourceFeature.getFeaturesAtCoordinate(coord)[0];
  if (!f) return null;
  var a = f.getProperties();
  for (var i in a) {
    if (i!=='geometry') attributes[i] = a[i];
  }
  return f.getGeometry();
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  ol.source.GeoImage is a layer source with georeferencement to place it on a map.
  olx.source.GeoImageOptions:
  {	url: {string} url of the static image
    image: {image} the static image, if not provided, use url to load an image
    imageCenter: {ol.Coordinate} of the center of the image
    imageScale: {ol.Size|Number} [scalex, scaley] of the image
    imageRotate: {number} angle of the image in radian, default 0
    imageCrop: {ol.Extent} of the image to be show (in the image) default: [0,0,imageWidth,imageHeight]
    imageMask: {Array.<ol.Coordinate>} - linestring to mask the image on the map
  }
*/
/** Layer source with georeferencement to place it on a map
* @constructor 
* @extends {ol.source.ImageCanvas}
* @param {olx.source.GeoImageOptions=} options
*/
ol.source.GeoImage = function(opt_options) {
  var options = { 
    attributions: opt_options.attributions,
    logo: opt_options.logo,
    projection: opt_options.projection
  };
  // options.projection = opt_options.projection;
  // Coordinate of the image center 
  this.center = opt_options.imageCenter;
  // Scale of the image 
  this.scale = opt_options.imageScale;
  // Rotation of the image
  this.rotate = opt_options.imageRotate ? opt_options.imageRotate : 0;
  // Crop of the image
  this.crop = opt_options.imageCrop;
  // Mask of the image
  this.mask = opt_options.imageMask;
  // Load Image
  this._image = (opt_options.image ? opt_options.image : new Image );
  this._image.crossOrigin = opt_options.crossOrigin; // 'anonymous';
  // Show image on load
  var self = this;
  this._image.onload = function() {
    self.setCrop (self.crop);
    self.changed();
  }
  if (!opt_options.image) this._image.src = opt_options.url;
  // Draw image on canvas
  options.canvasFunction = function(extent, resolution, pixelRatio, size /*, projection*/ ) {
    var canvas = document.createElement('canvas');
    canvas.width = size[0];
    canvas.height = size[1];
    var ctx = canvas.getContext('2d');
    if (!this._imageSize) return canvas;
    // transform coords to pixel
    function tr(xy) {
      return [
        (xy[0]-extent[0])/(extent[2]-extent[0]) * size[0],
        (xy[1]-extent[3])/(extent[1]-extent[3]) * size[1]
      ];
    }
    // Clipping mask
    if (this.mask) {
      ctx.beginPath();
      var p = tr(this.mask[0]);
      ctx.moveTo(p[0],p[1]);
      for (var i=1; i<this.mask.length; i++) {
        p = tr(this.mask[i]);
        ctx.lineTo(p[0],p[1]);
      }
      ctx.clip();
    }
    // Draw
    var pixel = tr(this.center);
    var dx = (this._image.naturalWidth/2 - this.crop[0]) *this.scale[0] /resolution *pixelRatio;
    var dy = (this._image.naturalHeight/2 - this.crop[1]) *this.scale[1] /resolution *pixelRatio;
    var sx = this._imageSize[0]*this.scale[0]/resolution *pixelRatio;
    var sy = this._imageSize[1]*this.scale[1]/resolution *pixelRatio;
    ctx.translate(pixel[0],pixel[1]);
    if (this.rotate) ctx.rotate(this.rotate);
    ctx.drawImage(this._image, this.crop[0], this.crop[1], this._imageSize[0], this._imageSize[1], -dx, -dy, sx,sy);
    return canvas;
  }
  ol.source.ImageCanvas.call (this, options);	
  this.setCrop (this.crop);
  // Calculate extent on change
  this.on('change', function() {
    this.set('extent', this.calculateExtent());
  }.bind(this));
};
ol.ext.inherits(ol.source.GeoImage, ol.source.ImageCanvas);
/**
 * Get coordinate of the image center.
 * @return {ol.Coordinate} coordinate of the image center.
 * @api stable
 */
ol.source.GeoImage.prototype.getCenter = function() {
  return this.center;
}
/**
 * Set coordinate of the image center.
 * @param {ol.Coordinate} coordinate of the image center.
 * @api stable
 */
ol.source.GeoImage.prototype.setCenter = function(center) {
  this.center = center;
  this.changed();
}
/**
 * Get image scale.
 * @return {ol.size} image scale (along x and y axis).
 * @api stable
 */
ol.source.GeoImage.prototype.getScale = function() {
  return this.scale;
}
/**
 * Set image scale.
 * @param {ol.size|Number} image scale (along x and y axis or both).
 * @api stable
 */
ol.source.GeoImage.prototype.setScale = function(scale) {
  switch (typeof(scale)) {
    case 'number':
      scale = [scale,scale];
      break;
    case 'object': 
      if (scale.length != 2) return;
      break;
    default: return;
  }
  this.scale = scale;
  this.changed();
};
/**
 * Get image rotation.
 * @return {Number} rotation in degre.
 * @api stable
 */
ol.source.GeoImage.prototype.getRotation = function() {
  return this.rotate;
};
/**
 * Set image rotation.
 * @param {Number} rotation in radian.
 * @api stable
 */
ol.source.GeoImage.prototype.setRotation = function(angle) {
  this.rotate = angle;
  this.changed();
};
/**
 * Get the image.
 * @api stable
 */
ol.source.GeoImage.prototype.getGeoImage = function() {
  return this._image;
};
/**
 * Get image crop extent.
 * @return {ol.extent} image crop extent.
 * @api stable
 */
ol.source.GeoImage.prototype.getCrop = function() {
  return this.crop;
};
/**
 * Set image mask.
 * @param {ol.geom.LineString} coords of the mask
 * @api stable
 */
ol.source.GeoImage.prototype.setMask = function(mask) {
  this.mask = mask;
  this.changed();
};
/**
 * Get image mask.
 * @return {ol.geom.LineString} coords of the mask
 * @api stable
 */
ol.source.GeoImage.prototype.getMask = function() {
  return this.mask;
};
/**
 * Set image crop extent.
 * @param {ol.extent|Number} image crop extent or a number to crop from original size.
 * @api stable
 */
ol.source.GeoImage.prototype.setCrop = function(crop) {
  // Image not loaded => get it latter
  if (!this._image.naturalWidth) {
    this.crop = crop;
    return;
  }
  if (crop) {
    switch (typeof(crop)) {
      case 'number':
        crop = [crop,crop,this._image.naturalWidth-crop,this._image.naturalHeight-crop];
        break;
      case 'object': 
        if (crop.length != 4) return;
        break;
      default: return;
    }
    crop = ol.extent.boundingExtent([ [crop[0],crop[1]], [crop[2],crop[3]] ]);
    this.crop = [ Math.max(0,crop[0]), Math.max(0,crop[1]), Math.min(this._image.naturalWidth,crop[2]), Math.min(this._image.naturalHeight,crop[3]) ];
  }
  else this.crop = [0,0, this._image.naturalWidth,this._image.naturalHeight];
  if (this.crop[2]<=this.crop[0]) this.crop[2] = this.crop[0]+1;
  if (this.crop[3]<=this.crop[1]) this.crop[3] = this.crop[1]+1;
  this._imageSize = [ this.crop[2]-this.crop[0], this.crop[3]-this.crop[1] ];
  this.changed();
};
/** Get the extent of the source.
 * @param {module:ol/extent~Extent} extent If provided, no new extent will be created. Instead, that extent's coordinates will be overwritten.
 * @return {ol.extent}
 */
ol.source.GeoImage.prototype.getExtent = function(opt_extent) {
  if (opt_extent) {
    var ext = this.get('extent');
    for (var i=0; i<opt_extent.length; i++) {
      opt_extent[i] = ext[i];
    }
    return ext;
  } else {
    return this.get('extent');
  }
};
/** Calculate the extent of the source image.
 * @param {boolean} usemask return the mask extent, default return the image extent
 * @return {ol.extent}
 */
ol.source.GeoImage.prototype.calculateExtent = function(usemask) {
  var polygon;
  if (usemask!==false && this.getMask()) {
    polygon = new ol.geom.Polygon([this.getMask()])
  } else {
    var center = this.getCenter();
    var scale = this.getScale();
    var width = this.getGeoImage().width * scale[0];
    var height = this.getGeoImage().height * scale[1];
    var extent = ol.extent.boundingExtent([
      [ center[0]-width/2, center[1]-height/2 ],
      [ center[0]+width/2, center[1]+height/2 ]
    ]);
    polygon = ol.geom.Polygon.fromExtent(extent);
    polygon.rotate(-this.getRotation(), center);
  }
  var ext = polygon.getExtent();
  return ext;
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** ol.source.GeoRSS is a source that load Wikimedia Commons content in a vector layer.
 * @constructor 
 * @extends {ol.source.Vector}
 * @param {*} options source options
 *  @param {string} options.url GeoRSS feed url
 */
ol.source.GeoRSS = function(options) {
  options = options || {};
  options.loader = this._loaderFn;
  ol.source.Vector.call (this, options);
};
ol.ext.inherits(ol.source.GeoRSS, ol.source.Vector);
/** Loader function used to load features.
* @private
*/
ol.source.GeoRSS.prototype._loaderFn = function(extent, resolution, projection){
  // Ajax request to get source
  ol.ext.Ajax.get({
    url: this.getUrl(),
    dataType: 'XML',
    error: function(){ console.log('oops'); },
    success: function(xml) {
      var features = (new ol.format.GeoRSS()).readFeatures(xml, { featureProjection: projection });
      this.addFeatures(features);
    }.bind(this)
  });
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** IGN's Geoportail WMTS source
 * @constructor
 * @extends {ol.source.WMTS}
 * @param {String=} layer Layer name.
 * @param {olx.source.OSMOptions=} options WMTS options 
 *  @param {number} options.minZoom
 *  @param {number} options.maxZoom
 *  @param {string} options.server
 *  @param {string} options.gppKey api key, default 'choisirgeoportail'
 *  @param {string} options.authentication basic authentication associated with the gppKey as btoa("login:pwd")
 *  @param {string} options.format image format, default 'image/jpeg'
 *  @param {string} options.style layer style, default 'normal'
 *  @param {string} options.crossOrigin default 'anonymous'
 *  @param {string} options.wrapX default true
 */
ol.source.Geoportail = function (layer, options) {
  options = options || {};
  var matrixIds = new Array();
  var resolutions = new Array();//[156543.03392804103,78271.5169640205,39135.75848201024,19567.879241005125,9783.939620502562,4891.969810251281,2445.9849051256406,1222.9924525628203,611.4962262814101,305.74811314070485,152.87405657035254,76.43702828517625,38.218514142588134,19.109257071294063,9.554628535647034,4.777314267823517,2.3886571339117584,1.1943285669558792,0.5971642834779396,0.29858214173896974,0.14929107086948493,0.07464553543474241];
  var size = ol.extent.getWidth(ol.proj.get('EPSG:3857').getExtent()) / 256;
  for (var z=0; z <= (options.maxZoom ? options.maxZoom : 20) ; z++) {
    matrixIds[z] = z ; 
    resolutions[z] = size / Math.pow(2, z);
  }
  var tg = new ol.tilegrid.WMTS ({
    origin: [-20037508, 20037508],
    resolutions: resolutions,
    matrixIds: matrixIds
  });
  tg.minZoom = (options.minZoom ? options.minZoom : 0);
  var attr = [ ol.source.Geoportail.prototype.attribution ];
  if (options.attributions) attr = options.attributions;
  this._server = options.server || 'https://wxs.ign.fr/geoportail/wmts';
  this._gppKey = options.gppKey || 'choisirgeoportail';
  var wmts_options = {
    url: this.serviceURL(),
    layer: layer,
    matrixSet: 'PM',
    format: options.format ? options.format : 'image/jpeg',
    projection: 'EPSG:3857',
    tileGrid: tg,
    style: options.style ? options.style : 'normal',
    attributions: attr,
    crossOrigin: (typeof options.crossOrigin == 'undefined') ? 'anonymous' : options.crossOrigin,
    wrapX: !(options.wrapX===false)
  };
  ol.source.WMTS.call(this, wmts_options);
  // Load url using basic authentification
  if (options.authentication) {
    this.setTileLoadFunction(ol.source.Geoportail.tileLoadFunctionWithAuthentication(options.authentication, this.getFormat()));
  }
};
ol.ext.inherits(ol.source.Geoportail, ol.source.WMTS);
/** Standard IGN-GEOPORTAIL attribution 
*/
ol.source.Geoportail.prototype.attribution = '<a href="http://www.geoportail.gouv.fr/">Géoportail</a> &copy; <a href="http://www.ign.fr/">IGN-France</a>';
/** Get service URL according to server url or standard url
*/
ol.source.Geoportail.prototype.serviceURL = function() {
  if (this._server) {
    return this._server.replace (/^(https?:\/\/[^/]*)(.*)$/, "$1/"+this._gppKey+"$2") ;
  } else {
    return (window.geoportailConfig ? window.geoportailConfig.url : "https://wxs.ign.fr/") +this._gppKey+ "/geoportail/wmts" ;
  }
};
/**
 * Return the associated API key of the Map.
 * @function
 * @return the API key.
 * @api stable
 */
ol.source.Geoportail.prototype.getGPPKey = function() {
  return this._gppKey;
};
/**
 * Set the associated API key to the Map.
 * @param {String} key the API key.
 * @param {String} authentication as btoa("login:pwd")
 * @api stable
 */
ol.source.Geoportail.prototype.setGPPKey = function(key, authentication) {
  this._gppKey = key;
  var serviceURL = this.serviceURL();
  this.setTileUrlFunction (function() {
    var url = ol.source.Geoportail.prototype.getTileUrlFunction().apply(this, arguments);
    if (url) {
      var args = url.split("?");
      return serviceURL+"?"+args[1];
    }
    else return url;
  });
  // Load url using basic authentification
  if (authentication) {
    this.setTileLoadFunction(ol.source.Geoportail.tileLoadFunctionWithAuthentication(authentication, this.getFormat()));
  }
};
/** Return the GetFeatureInfo URL for the passed coordinate, resolution, and
 * projection. Return `undefined` if the GetFeatureInfo URL cannot be
 * constructed.
 * @param {ol.Coordinate} coord 
 * @param {Number} resolution 
 * @param {ol.proj.Projection} projection default the source projection
 * @param {Object} options 
 *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
 * @return {String|undefined} GetFeatureInfo URL.
 */
ol.source.Geoportail.prototype.getFeatureInfoUrl  = function(coord, resolution, projection, options) {
  options = options || {};
  if (!projection) projection = this.getProjection();
  var tileCoord = this.tileGrid.getTileCoordForCoordAndResolution(coord, resolution);
  var ratio = 1;
  var url = this.getTileUrlFunction()(tileCoord, ratio, projection);
  if (!url) return url;
  var tileResolution = this.tileGrid.getResolution(tileCoord[0]);
  var tileExtent = this.tileGrid.getTileCoordExtent(tileCoord);
  var i = Math.floor((coord[0] - tileExtent[0]) / (tileResolution / ratio));
  var j = Math.floor((tileExtent[3] - coord[1]) / (tileResolution / ratio));
  return url.replace(/Request=GetTile/i, 'Request=getFeatureInfo')
    +'&INFOFORMAT='+(options.INFO_FORMAT||'text/plain')
    +'&I='+i
    +'&J='+j;
};
/** Get feature info
 * @param {ol.Coordinate} coord 
 * @param {Number} resolution 
 * @param {ol.proj.Projection} projection default the source projection
 * @param {Object} options 
 *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
 *  @param {function} options.callback a function that take the response as parameter
 *  @param {function} options.error function called when an error occurred
 */
ol.source.Geoportail.prototype.getFeatureInfo = function(coord, resolution, options) {
  var url = this.getFeatureInfoUrl(coord, resolution, null, options);
  ol.ext.Ajax.get({
    url: url,
    dataType: options.format || 'text/plain',
    options: { 
      encode: false 
    },
    success: function(resp) {
      if (options.callback) options.callback(resp);
    },
    error: options.error || function(){}
  })
};
/** Get a tile load function to load tiles with basic authentication
 * @param {string} authentication as btoa("login:pwd")
 * @param {string} format mime type
 * @return {function} tile load function to load tiles with basic authentication
 */
ol.source.Geoportail.tileLoadFunctionWithAuthentication = function(authentication, format) {
  if (!authentication) return undefined;
  return function(tile, src) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", src);
    xhr.setRequestHeader("Authorization", "Basic " + authentication);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
      var arrayBufferView = new Uint8Array(this.response);
      var blob = new Blob([arrayBufferView], { type: format });
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL(blob);
      tile.getImage().src = imageUrl;
    };
    xhr.onerror = function () {
      tile.getImage().src = "";
    };
    xhr.send();
  };
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A source for grid binning
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol.source.VectorOptions + grid option
 *  @param {ol.source.Vector} options.source Source
 *  @param {number} [options.size] size of the grid in meter, default 200m
 *  @param {function} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
ol.source.GridBin = function (options) {
  options = options || {};
  ol.source.BinBase.call(this, options);
  this.set('gridProjection', options.gridProjection || 'EPSG:4326');
  this.set('size', options.size || 1);
};
ol.ext.inherits(ol.source.GridBin, ol.source.BinBase);
/** Set grid projection
 * @param {ol.ProjectionLike} proj
 */
ol.source.GridBin.prototype.setGridProjection = function (proj) {
  this.set('gridProjection', proj);
  this.reset();
};
/** Set grid size
 * @param {number} size
 */
ol.source.GridBin.prototype.setSize = function (size) {
  this.set('size', size);
  this.reset();
};
/** Get the grid geometry at the coord 
 * @param {ol.Coordinate} coord
 * @returns {ol.geom.Polygon} 
 * @api
 */
ol.source.GridBin.prototype.getGridGeomAt = function (coord) {
  coord = ol.proj.transform (coord, this.getProjection() || 'EPSG:3857', this.get('gridProjection'));
  var size = this.get('size');
  var x = size * Math.floor(coord[0] / size);
  var y = size * Math.floor(coord[1] / size);
  var geom = new ol.geom.Polygon([[[x,y], [x+size,y], [x+size,y+size], [x,y+size], [x,y]]]);
  return geom.transform(this.get('gridProjection'), this.getProjection() || 'EPSG:3857');
};

/*	Copyright (c) 2017-2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A source for hexagonal binning
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol.source.VectorOptions + ol.HexGridOptions
 *  @param {ol.source.Vector} options.source Source
 *  @param {number} [options.size] size of the hexagon in map units, default 80000
 *  @param {ol.coordinate} [options.origin] origin of the grid, default [0,0]
 *  @param {HexagonLayout} [options.layout] grid layout, default pointy
 *  @param {function} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
ol.source.HexBin = function (options) {
  options = options || {};
  /** The HexGrid
   * 	@type {ol.HexGrid}
   */
  this._hexgrid = new ol.HexGrid(options);
  ol.source.BinBase.call(this, options);
};
ol.ext.inherits(ol.source.HexBin, ol.source.BinBase);
/** Get the hexagon geometry at the coord 
 * @param {ol.Coordinate} coord
 * @returns {ol.geom.Polygon} 
 * @api
 */
ol.source.HexBin.prototype.getGridGeomAt = function (coord) {
  var h = this._hexgrid.coord2hex(coord);
  return new ol.geom.Polygon([this._hexgrid.getHexagon(h)])
};
/**	Set the inner HexGrid size.
 * 	@param {number} newSize
 * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
 */
ol.source.HexBin.prototype.setSize = function (newSize, noreset) {
  this._hexgrid.setSize(newSize);
  if (!noreset) {
    this.reset();
  }
}
/**	Get the inner HexGrid size.
 * 	@return {number}
 */
ol.source.HexBin.prototype.getSize = function () {
  return this._hexgrid.getSize();
}
/**	Set the inner HexGrid layout.
 * 	@param {HexagonLayout} newLayout
 * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
 */
ol.source.HexBin.prototype.setLayout = function (newLayout, noreset) {
  this._hexgrid.setLayout(newLayout);
  if (!noreset) {
    this.reset();
  }
}
/**	Get the inner HexGrid layout.
 * 	@return {HexagonLayout}
 */
ol.source.HexBin.prototype.getLayout = function () {
  return this._hexgrid.getLayout();
};
/**	Set the inner HexGrid origin.
 * 	@param {ol.Coordinate} newLayout
 * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
 */
ol.source.HexBin.prototype.setOrigin = function (newLayout, noreset) {
  this._hexgrid.setOrigin(newLayout);
  if (!noreset) {
    this.reset();
  }
};
/**	Get the inner HexGrid origin.
 * 	@return {ol.Coordinate}
 */
ol.source.HexBin.prototype.getOrigin = function () {
  return this._hexgrid.getOrigin();
};
/**
 * Get hexagons without circular dependencies (vs. getFeatures)
 * @return {Array<ol.Feature>}
 */
ol.source.HexBin.prototype.getHexFeatures = function () {
  return ol.source.BinBase.prototype.getGridFeatures.call(this);
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A source for INSEE grid
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol.source.VectorOptions + grid option
 *  @param {ol.source.Vector} options.source Source
 *  @param {number} [options.size] size of the grid in meter, default 200m
 *  @param {function} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
ol.source.InseeBin = function (options) {
  options = options || {};
  this._grid = new ol.InseeGrid({ size: options.size });
  ol.source.BinBase.call(this, options);
};
ol.ext.inherits(ol.source.InseeBin, ol.source.BinBase);
/** Set grid size
 * @param {number} size
 */
ol.source.InseeBin.prototype.setSize = function (size) {
  if (this.getSize() !== size) {
    this._grid.set('size', size);
    this.reset();
  }
};
/** Get grid size
 * @return {number} size
 */
ol.source.InseeBin.prototype.getSize = function () {
  return this._grid.get('size');
};
/** Get the grid geometry at the coord 
 * @param {ol.Coordinate} coord
 * @returns {ol.geom.Polygon} 
 * @api
 */
ol.source.InseeBin.prototype.getGridGeomAt = function (coord) {
  return this._grid.getGridAtCoordinate(coord, this.getProjection());
};
/** Get grid extent 
 * @param {ol.ProjectionLike} proj
 * @return {ol.Extent}
 */
ol.source.InseeBin.prototype.getGridExtent = function (proj) {
  return this._grid.getExtent(proj);
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	@classdesc
	ol.source.Mapillary is a source that load Mapillary's geotagged photos in a vector layer.
	Inherits from:
	<ol.source.Vector>
*/
/**
* @constructor ol.source.Mapillary
* @extends {ol.source.Vector}
* @param {olx.source.Mapillary=} options
*/
ol.source.Mapillary = function(opt_options)
{	var options = opt_options || {};
	options.loader = this._loaderFn;
	/** Max resolution to load features  */
	this._maxResolution = options.maxResolution || 100;
	/** Query limit */
	this._limit = options.limit || 100;
	/** Default attribution */
	if (!options.attributions) options.attributions = [ "&copy; <a href='https://www.mapillary.com/'>Mapillary</a>" ];
	// Bbox strategy : reload at each move
    if (!options.strategy) options.strategy = ol.loadingstrategy.bbox;
	// Init parent
	ol.source.Vector.call (this, options);
	// Client ID
	// this.set("clientId", options.clientId);
};
ol.ext.inherits(ol.source.Mapillary, ol.source.Vector);
/** Decode wiki attributes and choose to add feature to the layer
* @param {feature} the feature
* @param {attributes} wiki attributes
* @return {boolean} true: add the feature to the layer
* @API stable
*/
ol.source.Mapillary.prototype.readFeature = function (/*feature, attributes*/)
{	// Allways read feature (no filter)
	return true;
};
/** Loader function used to load features.
* @private
*/
ol.source.Mapillary.prototype._loaderFn = function(extent, resolution, projection)
{	if (resolution > this._maxResolution) return;
	var bbox = ol.proj.transformExtent(extent, projection, "EPSG:4326");
	// Commons API: for more info @see https://www.mapillary.com/developer
	var date = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;
	var url = "https://a.mapillary.com/v2/search/im?client_id="
		+ this.get('clientId')
		+ "&max_lat=" + bbox[3]
		+ "&max_lon=" + bbox[2]
		+ "&min_lat=" + bbox[1]
		+ "&min_lon=" + bbox[0]
		+ "&limit="+(this._limit-1)
		+ "&start_time=" + date;
	// Ajax request to get the tile
	ol.ext.Ajax.get(
	{	url: url,
		dataType: 'jsonp', 
		success: function(data) 
		{	console.log(data);
			/*
			var features = [];
			var att, pt, feature, lastfeature = null;
			if (data.query && data.query.pages) return;
			for ( var i in data.query.pages)
			{	att = data.query.pages[i];
				if (att.coordinates && att.coordinates.length ) 
				{	pt = [att.coordinates[0].lon, att.coordinates[0].lat];
				}
				else
				{	var meta = att.imageinfo[0].metadata;
					if (!meta)
					{	//console.log(att);
						continue;
					}
					pt = [];
					for (var k=0; k<meta.length; k++)
					{	if (meta[k].name=="GPSLongitude") pt[0] = meta[k].value;
						if (meta[k].name=="GPSLatitude") pt[1] = meta[k].value;
					}
					if (!pt.length) 
					{	//console.log(att);
						continue;
					}
				}
				feature = new ol.Feature(new ol.geom.Point(ol.proj.transform (pt,"EPSG:4326",projection)));
				att.imageinfo[0].title = att.title;
				if (self.readFeature(feature, att.imageinfo[0]))
				{	features.push(feature);
				}
			}
			self.addFeatures(features);
			*/
    }});
};

/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * OSM layer using the Ovepass API
 * @constructor ol.source.Overpass
 * @extends {ol.source.Vector}
 * @param {any} options
 *  @param {string} options.url service url, default: https://overpass-api.de/api/interpreter
 *  @param {Array<string>} options.filter an array of tag filters, ie. ["key", "key=value", "key~value", ...]
 *  @param {boolean} options.node get nodes, default: true
 *  @param {boolean} options.way get ways, default: true
 *  @param {boolean} options.rel get relations, default: false
 *  @param {number} options.maxResolution maximum resolution to load features
 *  @param {string|ol.Attribution|Array<string>} options.attributions source attribution, default OSM attribution
 *  @param {ol.loadingstrategy} options.strategy loading strategy, default ol.loadingstrategy.bbox
 */
ol.source.Overpass = function(options) {
	options = options || {};
	options.loader = this._loaderFn;
	/** Ovepass API Url */
	this._url = options.url || 'https://overpass-api.de/api/interpreter';
	/** Max resolution to load features  */
	this._maxResolution = options.maxResolution || 100;
	/** Default attribution */
	if (!options.attributions) {
    options.attributions = ol.source.OSM.ATTRIBUTION;
  }
	// Bbox strategy : reload at each move
  if (!options.strategy) options.strategy = ol.loadingstrategy.bbox;
  ol.source.Vector.call (this, options);
  this._types = {
    node: options.node!==false,
    way: options.way!==false,
    rel: options.rel===true
  };
  this._filter = options.filter;
};
ol.ext.inherits(ol.source.Overpass, ol.source.Vector);
/** Loader function used to load features.
* @private
*/
ol.source.Overpass.prototype._loaderFn = function(extent, resolution, projection) {
  if (resolution > this._maxResolution) return;
	var self = this;
  var bbox = ol.proj.transformExtent(extent, projection, "EPSG:4326");
  bbox = bbox[1] + ',' + bbox[0] + ',' + bbox[3] + ',' + bbox[2];
  // Overpass QL
  var query = '[bbox:'+bbox+'][out:xml][timeout:25];';
  query += '(';
  // Search attributes
  for (var t in this._types) {
    if (this._types[t]) {
      query += t;
      for (var n=0, filter; filter = this._filter[n]; n++) {
        query += '['+filter+']';
      }
      query += ';'
    }
  }
  query +=');out;>;out skel qt;'
  var ajax = new XMLHttpRequest();
	ajax.open('POST', this._url, true);
	ajax.onload = function () {
    var features = new ol.format.OSMXML().readFeatures(this.responseText,{featureProjection: projection});
    var result = [];
    // Remove duplicated features
    for (var i=0, f; f=features[i]; i++) {
      if (!self.hasFeature(f)) result.push(f);
    }
    self.addFeatures(result);
	};
	ajax.onerror = function () {
		console.log(arguments);
	};
  ajax.send('data='+query);
};
/**
 * Search if feature is allready loaded
 * @param {ol.Feature} feature
 * @return {boolean} 
 * @private
 */
ol.source.Overpass.prototype.hasFeature = function(feature) {
	var p = feature.getGeometry().getFirstCoordinate();
	var id = feature.getId();
	var existing = this.getFeaturesInExtent([p[0]-0.1, p[1]-0.1, p[0]+0.1, p[1]+0.1]);
	for (var i=0, f; f=existing[i]; i++) {
		if (id===f.getId()) {
      return true;
    }
	}
	return false;
};

(function () {
  var clear = ol.source.Vector.prototype.clear;
  /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
   */
  ol.source.Vector.prototype.clear = function(opt_fast) {
    this.dispatchEvent({ type: 'clearstart' });
    clear.call(this, opt_fast)
    this.dispatchEvent({ type: 'clearend' });
  };
})();

/** 
 * @classdesc 3D vector layer rendering
 * @constructor
 * @extends {pl.layer.Image}
 * @param {Object} options
 *  @param {ol.layer.Vector} options.source the source to display in 3D
 *  @param {ol.style.Style} options.styler drawing style
 *  @param {number} options.maxResolution  max resolution to render 3D
 *  @param {number} options.defaultHeight default height if none is return by a propertie
 *  @param {function|string|Number} options.height a height function (returns height giving a feature) or a popertie name for the height or a fixed value
 *  @param {Array<number>} options.center center of the view, default [.5,1]
 */
ol.layer.Vector3D = function (options) {
  options = options || {};
  this._source = options.source;
  this.height_ = options.height = this.getHfn (options.height);
  var canvas = document.createElement('canvas');
  ol.layer.Image.call (this, { 
    source: new ol.source.ImageCanvas({
      canvasFunction: function(extent, resolution, pixelRatio, size /*, projection*/ ) {
        canvas.width = size[0];
        canvas.height = size[1];
        return canvas;
      }
    }), 
    height: options.height,
    center: options.center || [.5,1],
    defaultHeight: options.defaultHeight || 0,
    maxResolution: options.maxResolution || Infinity 
  });
  this.setStyle(options.style);
  this.on (['postcompose', 'postrender'], this.onPostcompose_.bind(this));
}
ol.ext.inherits(ol.layer.Vector3D, ol.layer.Image);
/**
 * Set style associated with the renderer
 * @param {ol.style.Style} s
 */
ol.layer.Vector3D.prototype.setStyle = function(s) {
  if (s instanceof ol.style.Style) this._style = s;
  else this._style = new ol.style.Style();
  if (!this._style.getStroke()) {
    this._style.setStroke(new ol.style.Stroke({
      width: 1,
      color: 'red'
    }));
  }
  if (!this._style.getFill()) {
    this._style.setFill( new ol.style.Fill({ color: 'rgba(0,0,255,0.5)'}) );
  }
  if (!this._style.getText()) {
    this._style.setText( new ol.style.Fill({ 
      color: 'red'}) 
    );
  }
  // Get the geometry
  if (s && s.getGeometry()) {
    var geom = s.getGeometry();
    if (typeof(geom)==='function') {
      this.set('geometry', geom);
    } else {
      this.set('geometry', function() { return geom; });
    }
  } else {
    this.set('geometry', function(f) { return f.getGeometry(); });
  }
};
/**
 * Get style associated with the renderer
 * @return {ol.style.Style}
 */
ol.layer.Vector3D.prototype.getStyle = function() {
  return this._style;
};
/** Calculate 3D at potcompose
*/
ol.layer.Vector3D.prototype.onPostcompose_ = function(e) {
  var res = e.frameState.viewState.resolution;
  if (res > this.get('maxResolution')) return;
  this.res_ = res*400;
  if (this.animate_) {
    var elapsed = e.frameState.time - this.animate_;
    if (elapsed < this.animateDuration_) {
      this.elapsedRatio_ = this.easing_(elapsed / this.animateDuration_);
      // tell OL3 to continue postcompose animation
      e.frameState.animate = true;
    } else {
      this.animate_ = false;
      this.height_ = this.toHeight_
    }
  }
  var ratio = e.frameState.pixelRatio;
  var ctx = e.context;
  var m = this.matrix_ = e.frameState.coordinateToPixelTransform;
  // Old version (matrix)
  if (!m) {
    m = e.frameState.coordinateToPixelMatrix,
    m[2] = m[4];
    m[3] = m[5];
    m[4] = m[12];
    m[5] = m[13];
  }
  this.center_ = [ 
    ctx.canvas.width*this.get('center')[0]/ratio, 
    ctx.canvas.height*this.get('center')[1]/ratio 
  ];
  var f = this._source.getFeaturesInExtent(e.frameState.extent);
  ctx.save();
    ctx.scale(ratio,ratio);
    var s = this.getStyle();
    ctx.lineWidth = s.getStroke().getWidth();
    ctx.lineCap = s.getStroke().getLineCap();
    ctx.strokeStyle = ol.color.asString(s.getStroke().getColor());
    ctx.fillStyle = ol.color.asString(s.getFill().getColor());
    var builds = [];
    for (var i=0; i<f.length; i++) {
      builds.push (this.getFeature3D_ (f[i], this.getFeatureHeight(f[i])));
    }
    this.drawFeature3D_ (ctx, builds);
  ctx.restore();
};
/** Create a function that return height of a feature
*	@param {function|string|number} h a height function or a popertie name or a fixed value
*	@return {function} function(f) return height of the feature f
*/
ol.layer.Vector3D.prototype.getHfn= function(h) {
  switch (typeof(h)) {
    case 'function': return h;
    case 'string': {
      var dh = this.get('defaultHeight');
        return (function(f) {
          return (Number(f.get(h)) || dh); 
        });
      }
    case 'number': return (function(/*f*/) { return h; });
    default: return (function(/*f*/) { return 10; });
  }
}
/** Animate rendering
 * @param {olx.render3D.animateOptions}
 *  @param {string|function|number} param.height an attribute name or a function returning height of a feature or a fixed value
 *  @param {number} param.duration the duration of the animatioin ms, default 1000
 *  @param {ol.easing} param.easing an ol easing function
 *	@api
 */
ol.layer.Vector3D.prototype.animate = function(options) {
  options = options || {};
  this.toHeight_ = this.getHfn(options.height);
  this.animate_ = new Date().getTime();
  this.animateDuration_ = options.duration ||1000;
  this.easing_ = options.easing || ol.easing.easeOut;
  // Force redraw
  this.changed();
}
/** Check if animation is on
*	@return {bool}
*/
ol.layer.Vector3D.prototype.animating = function() {
  if (this.animate_ && new Date().getTime() - this.animate_ > this.animateDuration_) {
    this.animate_ = false;
  }
  return !!this.animate_;
}
/** 
*/
ol.layer.Vector3D.prototype.getFeatureHeight = function (f) {
  if (this.animate_) {
    var h1 = this.height_(f);
    var h2 = this.toHeight_(f);
    return (h1*(1-this.elapsedRatio_)+this.elapsedRatio_*h2);
  }
  else return this.height_(f);
};
/**
*/
ol.layer.Vector3D.prototype.hvector_ = function (pt, h) {
  var p0 = [
    pt[0]*this.matrix_[0] + pt[1]*this.matrix_[1] + this.matrix_[4],
    pt[0]*this.matrix_[2] + pt[1]*this.matrix_[3] + this.matrix_[5]
  ];
  return {
    p0: p0, 
    p1: [
      p0[0] + h/this.res_ * (p0[0]-this.center_[0]),
      p0[1] + h/this.res_ * (p0[1]-this.center_[1])
    ]
  };
};
/**
*/
ol.layer.Vector3D.prototype.getFeature3D_ = function (f, h) {
  var geom = this.get('geometry')(f);
  var c = geom.getCoordinates();
  switch (geom.getType()) {
    case "Polygon":
      c = [c];
    // fallthrough
    case "MultiPolygon":
      var build = [];
      for (var i=0; i<c.length; i++) {
        for (var j=0; j<c[i].length; j++) {
          var b = [];
          for (var k=0; k<c[i][j].length; k++) {
            b.push( this.hvector_(c[i][j][k], h) );
          }
          build.push(b);
        }
      }
      return { type:"MultiPolygon", feature: f, geom: build };
    case "Point":
      return { type:"Point", feature: f, geom: this.hvector_(c,h) };
    default: return {};
  }
}
/**
*/
ol.layer.Vector3D.prototype.drawFeature3D_ = function(ctx, build) {
  var i,j, b, k;
  // Construct
  for (i=0; i<build.length; i++) {	
    switch (build[i].type) {
      case "MultiPolygon": {
        for (j=0; j<build[i].geom.length; j++) {
          b = build[i].geom[j];
          for (k=0; k < b.length; k++) {
            ctx.beginPath();
            ctx.moveTo(b[k].p0[0], b[k].p0[1]);
            ctx.lineTo(b[k].p1[0], b[k].p1[1]);
            ctx.stroke();
          }
        }
        break;
      }
      case "Point": {
        var g = build[i].geom;
          ctx.beginPath();
          ctx.moveTo(g.p0[0], g.p0[1]);
          ctx.lineTo(g.p1[0], g.p1[1]);
          ctx.stroke();
          break;
        }
      default: break;
    }
  }
  // Roof
  for (i=0; i<build.length; i++) {
    switch (build[i].type) {
      case "MultiPolygon": {
        ctx.beginPath();
        for (j=0; j<build[i].geom.length; j++) {
          b = build[i].geom[j];
          if (j==0) {
            ctx.moveTo(b[0].p1[0], b[0].p1[1]);
            for (k=1; k < b.length; k++) {
              ctx.lineTo(b[k].p1[0], b[k].p1[1]);
            }
          } else {
            ctx.moveTo(b[0].p1[0], b[0].p1[1]);
            for (k=b.length-2; k>=0; k--) {
              ctx.lineTo(b[k].p1[0], b[k].p1[1]);
            }
          }
          ctx.closePath();
        }
        ctx.fill("evenodd");
        ctx.stroke();
        break;
      }
      case "Point": {
        b = build[i];
        var t = b.feature.get('label');
        if (t) {
          var p = b.geom.p1;
          var m = ctx.measureText(t);
          var h = Number (ctx.font.match(/\d+(\.\d+)?/g).join([]));
          ctx.fillRect (p[0]-m.width/2 -5, p[1]-h -5, m.width +10, h +10)
          ctx.strokeRect (p[0]-m.width/2 -5, p[1]-h -5, m.width +10, h +10)
          ctx.save()
            ctx.fillStyle = ol.color.asString(this._style.getText().getFill().getColor());
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText ( t, p[0], p[1] );
          ctx.restore();
        }
        break;
      }
      default: break;
    }
  }
}

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  @classdesc
  ol.source.WikiCommons is a source that load Wikimedia Commons content in a vector layer.
  Inherits from:
  <ol.source.Vector>
*/
/**
* @constructor ol.source.WikiCommons
* @extends {ol.source.Vector}
* @param {olx.source.WikiCommons=} options
*/
ol.source.WikiCommons = function(opt_options) {
  var options = opt_options || {};
  options.loader = this._loaderFn;
  /** Max resolution to load features  */
  this._maxResolution = options.maxResolution || 100;
  /** Result language */
  this._lang = options.lang || "fr";
  /** Query limit */
  this._limit = options.limit || 100;
  /** Default attribution */
  if (!options.attributions) options.attributions = [ "&copy; <a href='https://commons.wikimedia.org/'>Wikimedia Commons</a>" ];
  // Bbox strategy : reload at each move
    if (!options.strategy) options.strategy = ol.loadingstrategy.bbox;
  ol.source.Vector.call (this, options);
};
ol.ext.inherits(ol.source.WikiCommons, ol.source.Vector);
/** Decode wiki attributes and choose to add feature to the layer
* @param {feature} the feature
* @param {attributes} wiki attributes
* @return {boolean} true: add the feature to the layer
* @API stable
*/
ol.source.WikiCommons.prototype.readFeature = function (feature, attributes){
  feature.set("descriptionurl", attributes.descriptionurl);
  feature.set("url", attributes.url);
  feature.set("title", attributes.title.replace(/^file:|.jpg$/ig,""));
  feature.set("thumbnail", attributes.url.replace(/^(.+wikipedia\/commons)\/([a-zA-Z0-9]\/[a-zA-Z0-9]{2})\/(.+)$/,"$1/thumb/$2/$3/200px-$3"));
  feature.set("user", attributes.user);
  if (attributes.extmetadata && attributes.extmetadata.LicenseShortName) feature.set("copy", attributes.extmetadata.LicenseShortName.value);
  return true;
};
/** Loader function used to load features.
* @private
*/
ol.source.WikiCommons.prototype._loaderFn = function(extent, resolution, projection){
  if (resolution > this._maxResolution) return;
  var self = this;
  var bbox = ol.proj.transformExtent(extent, projection, "EPSG:4326");
  // Commons API: for more info @see https://commons.wikimedia.org/wiki/Commons:API/MediaWiki
  var url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=coordinates|imageinfo"
    + "&generator=geosearch&iiprop=timestamp|user|url|extmetadata|metadata|size&iiextmetadatafilter=LicenseShortName"
    + "&ggsbbox=" + bbox[3] + "|" + bbox[0] + "|" + bbox[1] + "|" + bbox[2]
    + "&ggslimit="+this._limit
    + "&iilimit="+(this._limit-1)
    + "&ggsnamespace=6";
  // Ajax request to get the tile
  ol.ext.Ajax.get({
    url: url,
    success: function(data) {
      //console.log(data);
      var features = [];
      var att, pt, feature;
      if (!data.query || !data.query.pages) return;
      for ( var i in data.query.pages){
        att = data.query.pages[i];
        if (att.coordinates && att.coordinates.length ) {
          pt = [att.coordinates[0].lon, att.coordinates[0].lat];
        } else {
          var meta = att.imageinfo[0].metadata;
          if (!meta) {
            //console.log(att);
            continue;
          }
          pt = [];
          var found=0;
          for (var k=0; k<meta.length; k++) {
            if (meta[k].name=="GPSLongitude") {
              pt[0] = meta[k].value;
              found++;
            }
            if (meta[k].name=="GPSLatitude") {
              pt[1] = meta[k].value;
              found++;
            }
          }
          if (found!=2) {
            //console.log(att);
            continue;
          }
        }
        feature = new ol.Feature(new ol.geom.Point(ol.proj.transform (pt,"EPSG:4326",projection)));
        att.imageinfo[0].title = att.title;
        if (self.readFeature(feature, att.imageinfo[0])) {
          features.push(feature);
        }
      }
      self.addFeatures(features);
  }});
};

/*
	Copyright (c) 2015 Jean-Marc VIGLINO,
	released under the CeCILL-B license (http://www.cecill.info/).
	ol.layer.AnimatedCluster is a vector layer that animate cluster
*/
/**
 *  A vector layer for animated cluster
 * @constructor 
 * @extends {ol.layer.Vector}
 * @param {olx.layer.AnimatedClusterOptions=} options extend olx.layer.Options
 * 	@param {Number} options.animationDuration animation duration in ms, default is 700ms 
 * 	@param {ol.easingFunction} animationMethod easing method to use, default ol.easing.easeOut
 */
ol.layer.AnimatedCluster = function(opt_options)
{	var options = opt_options || {};
	ol.layer.Vector.call (this, options);
	this.oldcluster = new ol.source.Vector();
	this.clusters = [];
	this.animation={start:false};
	this.set('animationDuration', typeof(options.animationDuration)=='number' ? options.animationDuration : 700);
	this.set('animationMethod', options.animationMethod || ol.easing.easeOut);
	// Save cluster before change
	this.getSource().on('change', this.saveCluster.bind(this));
	// Animate the cluster
	this.on(['precompose','prerender'], this.animate.bind(this));
	this.on(['postcompose','postrender'], this.postanimate.bind(this));
};
ol.ext.inherits(ol.layer.AnimatedCluster, ol.layer.Vector);
/** save cluster features before change
 * @private
 */
ol.layer.AnimatedCluster.prototype.saveCluster = function() {
	if (this.oldcluster) {
		this.oldcluster.clear();
		if (!this.get('animationDuration')) return;
		var features = this.getSource().getFeatures();
		if (features.length && features[0].get('features'))
		{	this.oldcluster.addFeatures (this.clusters);
			this.clusters = features.slice(0);
			this.sourceChanged = true;
		}
	}
};
/** 
 * Get the cluster that contains a feature
 * @private
*/
ol.layer.AnimatedCluster.prototype.getClusterForFeature = function(f, cluster)
{	for (var j=0, c; c=cluster[j]; j++)
	{	var features = c.get('features');
		if (features && features.length) 
		{	for (var k=0, f2; f2=features[k]; k++)
			{	if (f===f2) 
				{	return c;
				}
			}
		}
	}
	return false;
};
/** 
 * Stop animation 
 * @private 
 */
ol.layer.AnimatedCluster.prototype.stopAnimation = function()
{	this.animation.start = false;
	this.animation.cA = [];
	this.animation.cB = [];
};
/** 
 * animate the cluster
 * @private
 */
ol.layer.AnimatedCluster.prototype.animate = function(e)
{	var duration = this.get('animationDuration');
	if (!duration) return;
	var resolution = e.frameState.viewState.resolution;
	var i, c0, a = this.animation;
	var time = e.frameState.time;
	// Start a new animation, if change resolution and source has changed
	if (a.resolution != resolution && this.sourceChanged)
	{	var extent = e.frameState.extent;
		if (a.resolution < resolution)
		{	extent = ol.extent.buffer(extent, 100*resolution);
			a.cA = this.oldcluster.getFeaturesInExtent(extent);
			a.cB = this.getSource().getFeaturesInExtent(extent);
			a.revers = false;
		}
		else
		{	extent = ol.extent.buffer(extent, 100*resolution);
			a.cA = this.getSource().getFeaturesInExtent(extent);
			a.cB = this.oldcluster.getFeaturesInExtent(extent);
			a.revers = true;
		}
		a.clusters = [];
		for (i=0, c0; c0=a.cA[i]; i++)
		{	var f = c0.get('features');
			if (f && f.length) 
			{	var c = this.getClusterForFeature (f[0], a.cB);
				if (c) a.clusters.push({ f:c0, pt:c.getGeometry().getCoordinates() });
			}
		}
		// Save state
		a.resolution = resolution;
		this.sourceChanged = false;
		// No cluster or too much to animate
		if (!a.clusters.length || a.clusters.length>1000) 
		{	this.stopAnimation();
			return;
		}
		// Start animation from now
		time = a.start = (new Date()).getTime();
	}
	// Run animation
	if (a.start) {
		var vectorContext = e.vectorContext || ol.render.getVectorContext(e);
		var d = (time - a.start) / duration;
		// Animation ends
		if (d > 1.0) 
		{	this.stopAnimation();
			d = 1;
		}
		d = this.get('animationMethod')(d);
		// Animate
		var style = this.getStyle();
		var stylefn = (typeof(style) == 'function') ? style : style.length ? function(){ return style; } : function(){ return [style]; } ;
		// Layer opacity
		e.context.save();
		e.context.globalAlpha = this.getOpacity();
		for (i=0, c; c=a.clusters[i]; i++)
		{	var pt = c.f.getGeometry().getCoordinates();
			var dx = pt[0]-c.pt[0];
			var dy = pt[1]-c.pt[1];
			if (a.revers)
			{	pt[0] = c.pt[0] + d * dx;
				pt[1] = c.pt[1] + d * dy;
			}
			else
			{	pt[0] = pt[0] - d * dx;
				pt[1] = pt[1] - d * dy;
			}
			// Draw feature
			var st = stylefn(c.f, resolution, true);
			if (!st.length) st = [st];
			// If one feature: draw the feature
			if (c.f.get("features").length===1 && !dx && !dy) {
				f = c.f.get("features")[0];
			}
			// else draw a point
			else {
				var geo = new ol.geom.Point(pt);
				f = new ol.Feature(geo);
			}
			for (var k=0, s; s=st[k]; k++) {
				// Multi-line text
				if (s.getText() && /\n/.test(s.getText().getText())) {
					var offsetX = s.getText().getOffsetX();
					var offsetY = s.getText().getOffsetY();
					var rot = s.getText().getRotation() || 0;
					var fontSize = Number((s.getText().getFont() || '10px').match(/\d+/)) * 1.2;
					var str = s.getText().getText().split('\n')
					var dl, nb = str.length-1;
					var s2 = s.clone();
					// Draw each lines
					str.forEach(function(t, i) {
						if (i==1) {
							// Allready drawn
							s2.setImage();
							s2.setFill();
							s2.setStroke();
						}
						switch (s.getText().getTextBaseline()) {
							case 'alphabetic':
							case 'ideographic':
							case 'bottom': {
								dl = nb;
								break;
							}
							case 'hanging':
							case 'top': {
								dl = 0;
								break;
							}
							default : {
								dl = nb/2;
								break;
							}
						}
						s2.getText().setOffsetX(offsetX - Math.sin(rot)*fontSize*(i - dl));
						s2.getText().setOffsetY(offsetY + Math.cos(rot)*fontSize*(i - dl));
						s2.getText().setText(t);
						vectorContext.drawFeature(f, s2);
					});
				} else {
					vectorContext.drawFeature(f, s);
				}
				/* OLD VERSION OL < 4.3
				// Retina device
				var ratio = e.frameState.pixelRatio;
				var sc;
				// OL < v4.3 : setImageStyle doesn't check retina
				var imgs = ol.Map.prototype.getFeaturesAtPixel ? false : s.getImage();
				if (imgs)
				{	sc = imgs.getScale(); 
					imgs.setScale(sc*ratio); 
				}
				// OL3 > v3.14
				if (vectorContext.setStyle)
				{	// If one feature: draw the feature
					if (c.f.get("features").length===1 && !dx && !dy) {
						vectorContext.drawFeature(c.f.get("features")[0], s);
					}
					// else draw a point
					else {
						vectorContext.setStyle(s);
						vectorContext.drawGeometry(geo);
					}
				}
				// older version
				else
				{	vectorContext.setImageStyle(imgs);
					vectorContext.setTextStyle(s.getText());
					vectorContext.drawPointGeometry(geo);
				}
				if (imgs) imgs.setScale(sc);
				*/
			}
		}
		e.context.restore();
		// tell ol to continue postcompose animation
		e.frameState.animate = true;
		// Prevent layer drawing (clip with null rect)
		e.context.save();
		e.context.beginPath();
		e.context.rect(0,0,0,0);
		e.context.clip();
		this.clip_ = true;
	}
	return;
};
/**  
 * remove clipping after the layer is drawn
 * @private
 */
ol.layer.AnimatedCluster.prototype.postanimate = function(e)
{	if (this.clip_)
	{	e.context.restore();
		this.clip_ = false;
	}
};

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc
 * Image layer to use with a GeoImage source and return the extent calcaulted with this source.
 * @extends {ol.layer.Image}
 * @param {Object=} options Layer Image options.
 * @api
 */
ol.layer.GeoImage = function(options) {
  ol.layer.Image.call(this, options);
}
ol.ext.inherits (ol.layer.GeoImage, ol.layer.Image);
/**
 * Return the {@link module:ol/extent~Extent extent} of the source associated with the layer.
 * @return {ol.Extent} The layer extent.
 * @observable
 * @api
 */
ol.layer.GeoImage.prototype.getExtent = function() {
  return this.getSource().getExtent();
}

/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
// 
/** IGN's Geoportail WMTS layer definition
 * @constructor 
 * @extends {ol.layer.Tile}
 * @param {string} layer Layer name
 * @param {olx.layer.WMTSOptions=} options WMTS options if not defined default are used
 *  @param {string} options.gppKey Geoportail API key
 * @param {olx.source.WMTSOptions=} tileoptions WMTS options if not defined default are used
 */
ol.layer.Geoportail = function(layer, options, tileoptions) {
  options = options || {};
	tileoptions = tileoptions || {};
	var capabilities = window.geoportailConfig ? window.geoportailConfig.capabilities[options.gppKey || options.key] || window.geoportailConfig.capabilities["default"] || ol.layer.Geoportail.capabilities : ol.layer.Geoportail.capabilities;
  capabilities = capabilities[layer];
	if (!capabilities) {
    capabilities = { title: layer, originators: [] };
    console.error("ol.layer.Geoportail: no layer definition for \""+layer+"\"\nTry to use ol/layer/Geoportail~loadCapabilities() to get it.");
    // throw new Error("ol.layer.Geoportail: no layer definition for \""+layer+"\"");
  }
	// tile options & default params
	for (var i in capabilities) if (typeof	tileoptions[i]== "undefined") tileoptions[i] = capabilities[i];
	this._originators = capabilities.originators;
	if (!tileoptions.gppKey) tileoptions.gppKey = options.gppKey || options.key;
	options.source = new ol.source.Geoportail(layer, tileoptions);
	if (!options.name) options.name = capabilities.title;
	if (!options.desc) options.desc = capabilities.desc;
	if (!options.extent && capabilities.bbox) {
    if (capabilities.bbox[0]>-170 && capabilities.bbox[2]<170)
    options.extent = ol.proj.transformExtent(capabilities.bbox, 'EPSG:4326', 'EPSG:3857');
	}
	// calculate layer max resolution
	if (!options.maxResolution && tileoptions.minZoom) {
    options.source.getTileGrid().minZoom -= (tileoptions.minZoom>1 ? 2 : 1);
		options.maxResolution = options.source.getTileGrid().getResolution(options.source.getTileGrid().minZoom)
		options.source.getTileGrid().minZoom = tileoptions.minZoom;
  }
  ol.layer.Tile.call (this, options);
  this.set('layer', layer);
  this.set('queryable', capabilities.queryable);
  // BUG GPP: Attributions constraints are not set properly :(
/** /
  // Set attribution according to the originators
  var counter = 0;
  // Get default attribution
  var getAttrib = function(title, o) {
    if (this.get('attributionMode')==='logo') {
      if (!title) return ol.source.Geoportail.prototype.attribution;
      else return '<a href="'+o.href+'"><img src="'+o.logo+'" title="&copy; '+o.attribution+'" /></a>';
    } else {
      if (!title) return ol.source.Geoportail.prototype.attribution;
      else return '&copy; <a href="'+o.href+'" title="&copy; '+(o.attribution||title)+'" >'+title+'</a>'
    }
  }.bind(this);
  var currentZ, currentCenter = [];
  var setAttribution = function(e) {
    var a, o, i;
    counter--;
    if (!counter) {
      var z = e.frameState.viewState.zoom;
      console.log(e)
      if (z===currentZ 
        && e.frameState.viewState.center[0]===currentCenter[0]
        && e.frameState.viewState.center[1]===currentCenter[1]){
          return;
      }
      currentZ = z;
      currentCenter = e.frameState.viewState.center;
      var ex = e.frameState.extent;
      ex = ol.proj.transformExtent (ex, e.frameState.viewState.projection, 'EPSG:4326');
      if (this._originators) {
        var attrib = this.getSource().getAttributions();
        // ol v5
        if (typeof(attrib)==='function') attrib = attrib();
        attrib.splice(0, attrib.length);
        var maxZoom = 0;
        for (a in this._originators) {
          o = this._originators[a];
          for (i=0; i<o.constraint.length; i++) {
            if (o.constraint[i].maxZoom > maxZoom
              && ol.extent.intersects(ex, o.constraint[i].bbox)) {
                maxZoom = o.constraint[i].maxZoom;
            }
          }	
        }
        if (maxZoom < z) z = maxZoom;
        if (this.getSource().getTileGrid() && z < this.getSource().getTileGrid().getMinZoom()) {
          z = this.getSource().getTileGrid().getMinZoom();
        }
        for (a in this._originators) {
          o = this._originators[a];
          if (!o.constraint.length) {
            attrib.push (getAttrib(a, o));
          } else {
            for (i=0; i<o.constraint.length; i++) {
              if ( z <= o.constraint[i].maxZoom 
                && z >= o.constraint[i].minZoom 
                && ol.extent.intersects(ex, o.constraint[i].bbox)) {
                  attrib.push (getAttrib(a, o));
                  break;
              }
            }
          }
        }
        if (!attrib.length) attrib.push ( getAttrib() );
        this.getSource().setAttributions(attrib);
      }
    }
  }.bind(this);
  this.on('precompose', function(e) {
    counter++;
    setTimeout(function () { setAttribution(e) }, 500);
  });
/**/
};
ol.ext.inherits (ol.layer.Geoportail, ol.layer.Tile);
/** Default capabilities for main layers
 */
ol.layer.Geoportail.capabilities = {
  "GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD","title":"Carte IGN","format":"image/jpeg","style":"normal","queryable":false,"tilematrix":"PM","minZoom":0,"maxZoom":18,"bbox":[-179.62723,-84.5047,179.74588,85.47958],"desc":"Cartographie topographique multi-échelles du territoire français issue des bases de données vecteur de l’IGN - emprise nationale, visible du 1/200 au 1/130000000","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":0,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":13,"bbox":[-63.37252,13.428586,11.429714,51.44377]},{"minZoom":11,"maxZoom":12,"bbox":[-63.37252,13.428586,11.496459,51.444122]},{"minZoom":9,"maxZoom":9,"bbox":[-64.81273,13.428586,11.496459,51.444016]},{"minZoom":10,"maxZoom":10,"bbox":[-63.37252,13.428586,11.496459,51.444016]},{"minZoom":0,"maxZoom":2,"bbox":[-175.99709,-84.42859,175.99709,84.2865]},{"minZoom":4,"maxZoom":4,"bbox":[-179.62723,-84.0159,-179.21112,85.47958]},{"minZoom":18,"maxZoom":18,"bbox":[-63.189068,-21.428364,55.846638,51.175068]},{"minZoom":15,"maxZoom":17,"bbox":[-63.189117,-21.428364,55.84698,51.175068]},{"minZoom":14,"maxZoom":14,"bbox":[-63.283817,-21.7006,56.039127,51.44377]},{"minZoom":6,"maxZoom":8,"bbox":[-179.49689,-84.02368,179.74588,85.30035]},{"minZoom":3,"maxZoom":3,"bbox":[-176.23093,-84.5047,179.08267,84.89126]},{"minZoom":5,"maxZoom":5,"bbox":[-179.57285,-83.84196,178.4975,85.36646]}]}}},
  "ELEVATION.SLOPES": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"ELEVATION.SLOPES","title":"Altitude","format":"image/jpeg","style":"normal","queryable":true,"tilematrix":"PM","minZoom":6,"maxZoom":14,"bbox":[-178.20589,-22.595179,167.43176,50.93085],"desc":"La couche altitude se compose d'un MNT (Modèle Numérique de Terrain) affiché en teintes hypsométriques et issu de la BD ALTI®.","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":6,"maxZoom":14,"constraint":[{"minZoom":6,"maxZoom":14,"bbox":[55.205746,-21.392344,55.846554,-20.86271]}]}}},
  "GEOGRAPHICALGRIDSYSTEMS.MAPS.BDUNI.J1": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"GEOGRAPHICALGRIDSYSTEMS.MAPS.BDUNI.J1","title":"Plan IGN j+1","format":"image/png","style":"normal","queryable":false,"tilematrix":"PM","minZoom":0,"maxZoom":18,"bbox":[-179.5,-75,179.5,75],"desc":"Plan IGN j+1","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":0,"maxZoom":18,"constraint":[{"minZoom":0,"maxZoom":18,"bbox":[-179,-80,179,80]}]}}},
  "CADASTRALPARCELS.PARCELS": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"CADASTRALPARCELS.PARCELS","title":"Parcelles cadastrales","format":"image/png","style":"bdparcellaire","queryable":false,"tilematrix":"PM","minZoom":0,"maxZoom":20,"bbox":[-63.160706,-21.39223,55.84643,51.090965],"desc":"Limites des parcelles cadastrales issues de plans scannés et de plans numériques.","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":0,"maxZoom":20,"constraint":[{"minZoom":0,"maxZoom":20,"bbox":[-63.160706,-21.39223,55.84643,51.090965]}]}}},
  "ORTHOIMAGERY.ORTHOPHOTOS": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"ORTHOIMAGERY.ORTHOPHOTOS","title":"Photographies aériennes","format":"image/jpeg","style":"normal","queryable":true,"tilematrix":"PM","minZoom":0,"bbox":[-180,-86,180,84],"desc":"Photographies aériennes","originators":{"PLANETOBSERVER":{"href":"http://www.planetobserver.com/","attribution":"PlanetObserver (images satellites)","logo":"https://wxs.ign.fr/static/logos/PLANETOBSERVER/PLANETOBSERVER.gif","minZoom":0,"maxZoom":12,"constraint":[{"minZoom":0,"maxZoom":12,"bbox":[-180,-86,180,84]}]},"MPM":{"href":"http://www.marseille-provence.com/","attribution":"Marseille Provence Métropole","logo":"https://wxs.ign.fr/static/logos/MPM/MPM.gif","minZoom":20,"maxZoom":20,"constraint":[{"minZoom":20,"maxZoom":20,"bbox":[5.076959,43.153347,5.7168245,43.454994]}]},"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":13,"maxZoom":20,"constraint":[{"bbox":[0.035491213,43.221077,6.0235267,49.696926]},{"minZoom":20,"maxZoom":20,"bbox":[0.035491213,43.221077,6.0235267,49.696926]},{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CRAIG":{"href":"http://www.craig.fr","attribution":"Centre Régional Auvergnat de l'Information Géographique (CRAIG)","logo":"https://wxs.ign.fr/static/logos/CRAIG/CRAIG.gif","minZoom":13,"maxZoom":20,"constraint":[{"minZoom":20,"maxZoom":20,"bbox":[2.2243388,44.76621,2.7314367,45.11295]},{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CNES":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES/CNES.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CG06":{"href":"http://www.cg06.fr","attribution":"Département Alpes Maritimes (06) en partenariat avec : Groupement Orthophoto 06 (NCA, Ville de Cannes, CARF, CASA,CG06, CA de Grasse) ","logo":"https://wxs.ign.fr/static/logos/CG06/CG06.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CG45":{"href":"http://www.loiret.com","attribution":"Le conseil général du Loiret","logo":"https://wxs.ign.fr/static/logos/CG45/CG45.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"RGD_SAVOIE":{"href":"http://www.rgd.fr","attribution":"Régie de Gestion de Données des Pays de Savoie (RGD 73-74)","logo":"https://wxs.ign.fr/static/logos/RGD_SAVOIE/RGD_SAVOIE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"e-Megalis":{"href":"http://www.e-megalisbretagne.org//","attribution":"Syndicat mixte de coopération territoriale (e-Megalis)","logo":"https://wxs.ign.fr/static/logos/e-Megalis/e-Megalis.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"SIGLR":{"href":"http://www.siglr.org//","attribution":"SIGLR","logo":"https://wxs.ign.fr/static/logos/SIGLR/SIGLR.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"PPIGE":{"href":"http://www.ppige-npdc.fr/","attribution":"PPIGE","logo":"https://wxs.ign.fr/static/logos/PPIGE/PPIGE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"FEDER2":{"href":"http://www.europe-en-france.gouv.fr/","attribution":"Fonds européen de développement économique et régional","logo":"https://wxs.ign.fr/static/logos/FEDER2/FEDER2.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"FEDER":{"href":"http://www.europe-en-france.gouv.fr/","attribution":"Fonds européen de développement économique et régional","logo":"https://wxs.ign.fr/static/logos/FEDER/FEDER.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CRCORSE":{"href":"http://www.corse.fr//","attribution":"CRCORSE","logo":"https://wxs.ign.fr/static/logos/CRCORSE/CRCORSE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CNES_AUVERGNE":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_AUVERGNE/CNES_AUVERGNE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"FEDER_PAYSDELALOIRE":{"href":"http://www.europe-en-paysdelaloire.eu/","attribution":"Pays-de-la-Loire","logo":"https://wxs.ign.fr/static/logos/FEDER_PAYSDELALOIRE/FEDER_PAYSDELALOIRE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"FEDER_AUVERGNE":{"href":"http://www.europe-en-auvergne.eu/","attribution":"Auvergne","logo":"https://wxs.ign.fr/static/logos/FEDER_AUVERGNE/FEDER_AUVERGNE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"PREFECTURE_GUADELOUPE":{"href":"www.guadeloupe.pref.gouv.fr/","attribution":"guadeloupe","logo":"https://wxs.ign.fr/static/logos/PREFECTURE_GUADELOUPE/PREFECTURE_GUADELOUPE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"BOURGOGNE-FRANCHE-COMTE":{"href":"https://www.bourgognefranchecomte.fr/","attribution":"Auvergne","logo":"https://wxs.ign.fr/static/logos/BOURGOGNE-FRANCHE-COMTE/BOURGOGNE-FRANCHE-COMTE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"ASTRIUM":{"href":"http://www.geo-airbusds.com/","attribution":"Airbus Defence and Space","logo":"https://wxs.ign.fr/static/logos/ASTRIUM/ASTRIUM.gif","minZoom":13,"maxZoom":16,"constraint":[{"minZoom":13,"maxZoom":16,"bbox":[-55.01953,1.845384,-50.88867,6.053161]}]},"DITTT":{"href":"http://www.dittt.gouv.nc/portal/page/portal/dittt/","attribution":"Direction des Infrastructures, de la Topographie et des Transports Terrestres","logo":"https://wxs.ign.fr/static/logos/DITTT/DITTT.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[163.47784,-22.767689,167.94624,-19.434975]}]},"CNES_ALSACE":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_ALSACE/CNES_ALSACE.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_971":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_971/CNES_971.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_972":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_972/CNES_972.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_974":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_974/CNES_974.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_975":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_975/CNES_975.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_976":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_976/CNES_976.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_977":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_977/CNES_977.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_978":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_978/CNES_978.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]}}},
  "GEOGRAPHICALGRIDSYSTEMS.PLANIGN": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"GEOGRAPHICALGRIDSYSTEMS.PLANIGN","title":"Plan IGN","format":"image/jpeg","style":"normal","queryable":false,"tilematrix":"PM","minZoom":0,"maxZoom":18,"bbox":[-179.5,-75,179.5,75],"desc":"Représentation graphique des bases de données IGN.","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":0,"maxZoom":18,"constraint":[{"minZoom":10,"maxZoom":18,"bbox":[-63.37252,-21.475586,55.925865,51.31212]},{"minZoom":0,"maxZoom":9,"bbox":[-179.5,-75,179.5,75]}]}}},
  "GEOGRAPHICALGRIDSYSTEMS.MAPS": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"GEOGRAPHICALGRIDSYSTEMS.MAPS","title":"Cartes IGN","format":"image/jpeg","style":"normal","queryable":true,"tilematrix":"PM","minZoom":0,"maxZoom":18,"bbox":[-180,-68.138855,180,80],"desc":"Cartes IGN","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":0,"maxZoom":18,"constraint":[{"minZoom":17,"maxZoom":17,"bbox":[-63.189117,-21.428364,55.84698,51.175068]},{"minZoom":18,"maxZoom":18,"bbox":[-63.189068,-21.428364,55.846638,51.175068]},{"minZoom":7,"maxZoom":8,"bbox":[-178.20573,-68.138855,144.84375,51.909786]},{"minZoom":13,"maxZoom":14,"bbox":[-178.20573,-67.101425,142.03836,51.44377]},{"minZoom":11,"maxZoom":12,"bbox":[-178.20573,-67.101425,142.03836,51.444122]},{"minZoom":9,"maxZoom":10,"bbox":[-178.20573,-68.138855,144.84375,51.444016]},{"minZoom":15,"maxZoom":16,"bbox":[-178.20573,-46.502903,77.60037,51.175068]},{"minZoom":0,"maxZoom":6,"bbox":[-180,-60,180,80]}]},"NCL-DITTT":{"href":"http://www.dittt.gouv.nc/portal/page/portal/dittt","attribution":"Direction des Infrastructures, de la Topographie et des Transports Terrestres du gouvernement de la Nouvelle-Calédonie","logo":"https://wxs.ign.fr/static/logos/NCL-DITTT/NCL-DITTT.gif","minZoom":8,"maxZoom":16,"constraint":[{"minZoom":8,"maxZoom":10,"bbox":[163.47784,-22.854631,168.24048,-19.402704]},{"minZoom":11,"maxZoom":13,"bbox":[163.47784,-22.972307,168.24327,-19.494438]},{"minZoom":14,"maxZoom":15,"bbox":[164.53125,-22.75592,168.22266,-20.303417]},{"minZoom":16,"maxZoom":16,"bbox":[163.47784,-22.79525,168.19109,-19.494438]}]}}},
  "TRANSPORTNETWORKS.ROADS": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"TRANSPORTNETWORKS.ROADS","title":"Routes","format":"image/png","style":"normal","queryable":false,"tilematrix":"PM","minZoom":6,"maxZoom":18,"bbox":[-63.969162,-21.49687,55.964417,71.584076],"desc":"Affichage du réseau routier français et européen.","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":6,"maxZoom":18,"constraint":[{"minZoom":15,"maxZoom":18,"bbox":[-63.37252,-21.475586,55.925865,51.31212]},{"minZoom":6,"maxZoom":14,"bbox":[-63.969162,-21.49687,55.964417,71.584076]}]}}},
};
/** Load capabilities from the service
 * @param {string} gppKey the API key to get capabilities for
 * @return {*} Promise-like response
 */
ol.layer.Geoportail.loadCapabilities = function(gppKey, all) {
  var onSuccess = function() {}
  var onError = function() {}
  var onFinally = function() {};
  this.getCapabilities(gppKey,all).then(function(c) {
    ol.layer.Geoportail.capabilities = c;
    onSuccess(c);
  }).catch(function(e) { 
    onError(e);
  }).finally(function(c) {
    onFinally(c);
  });
  var response = {
    then: function (callback) {
      if (typeof(callback)==='function') onSuccess = callback;
      return response;
    },
    catch: function (callback) {
      if (typeof(callback)==='function') onError = callback;
      return response;
    },
    finally: function (callback) {
      if (typeof(callback)==='function') onFinally = callback;
      return response;
    }
  }
  return response;
};
/** Get Key capabilities
 * @param {string} gppKey the API key to get capabilities for
 * @return {*} Promise-like response
 */
ol.layer.Geoportail.getCapabilities = function(gppKey) {
  var capabilities = {};
  var onSuccess = function() {}
  var onError = function() {}
  var onFinally = function() {}
  var geopresolutions = [156543.03390625,78271.516953125,39135.7584765625,19567.87923828125,9783.939619140625,4891.9698095703125,2445.9849047851562,1222.9924523925781,611.4962261962891,305.74811309814453,152.87405654907226,76.43702827453613,38.218514137268066,19.109257068634033,9.554628534317017,4.777314267158508,2.388657133579254,1.194328566789627,0.5971642833948135,0.29858214169740677,0.14929107084870338];
  // Transform resolution to zoom
	function getZoom(res) {
    res = Number(res) * 0.000281;
		for (var r=0; r<geopresolutions.length; r++) 
			if (res>geopresolutions[r]) return r;
  }
  // Merge constraints 
  function mergeConstraints(ori) {
    for (var i=ori.constraint.length-1; i>0; i--) {
      for (var j=0; j<i; j++) {
        var bok = true;
        for (var k=0; k<4; k++) {
          if (ori.constraint[i].bbox[k] != ori.constraint[j].bbox[k]) {
            bok = false;
            break;
          }
        }
        if (!bok) continue;
        if (ori.constraint[i].maxZoom == ori.constraint[j].minZoom 
         || ori.constraint[j].maxZoom == ori.constraint[i].minZoom 
         || ori.constraint[i].maxZoom+1 == ori.constraint[j].minZoom 
         || ori.constraint[j].maxZoom+1 == ori.constraint[i].minZoom
         || ori.constraint[i].minZoom-1 == ori.constraint[j].maxZoom
         || ori.constraint[j].minZoom-1 == ori.constraint[i].maxZoom) {
          ori.constraint[j].maxZoom = Math.max(ori.constraint[i].maxZoom, ori.constraint[j].maxZoom);
          ori.constraint[j].minZoom = Math.min(ori.constraint[i].minZoom, ori.constraint[j].minZoom);
          ori.constraint.splice(i,1);
          break;
        }
      }
    }
  }
  // Get capabilities
  ol.ext.Ajax.get({
    url: 'https://wxs.ign.fr/'+gppKey+'/autoconf/',
    dataType: 'TEXT',
    error: function (e) {
      onError(e);
      onFinally({});
    },
    success: function(resp) {
      var parser = new DOMParser();
      var config = parser.parseFromString(resp,"text/xml");
      var layers = config.getElementsByTagName('Layer');
      for (var i=0, l; l=layers[i]; i++) {
        // WMTS ?
        if (!/WMTS/.test(l.getElementsByTagName('Server')[0].attributes['service'].value)) continue;
//        if (!all && !/geoportail\/wmts/.test(l.find("OnlineResource").attr("href"))) continue;
        var service = {
          server: l.getElementsByTagName('gpp:Key')[0].innerHTML.replace(gppKey+"/",""), 
          layer: l.getElementsByTagName('Name')[0].innerHTML,
          title: l.getElementsByTagName('Title')[0].innerHTML,
          format: l.getElementsByTagName('Format')[0].innerHTML,
          style: l.getElementsByTagName('Style')[0].getElementsByTagName('Name')[0].innerHTML,
          queryable: (l.attributes.queryable.value==='1'),
          tilematrix: 'PM',
          minZoom: getZoom(l.getElementsByTagName('sld:MaxScaleDenominator')[0].innerHTML),
          maxZoom: getZoom(l.getElementsByTagName('sld:MinScaleDenominator')[0].innerHTML),
          bbox: JSON.parse('['+l.getElementsByTagName('gpp:BoundingBox')[0].innerHTML+']'),
          desc: l.getElementsByTagName('Abstract')[0].innerHTML.replace(/^<!\[CDATA\[(.*)\]\]>$/, '$1')
        };
        service.originators = {};
        var origin = l.getElementsByTagName('gpp:Originator');
        for (var k=0, o; o=origin[k]; k++) {
          var ori = service.originators[o.attributes['name'].value] = {
            href: o.getElementsByTagName('gpp:URL')[0].innerHTML,
						attribution: o.getElementsByTagName('gpp:Attribution')[0].innerHTML,
						logo: o.getElementsByTagName('gpp:Logo')[0].innerHTML,
						minZoom: 20,
						maxZoom: 0,
						constraint: []
          };
          // Scale contraints
          var constraint = o.getElementsByTagName('gpp:Constraint');
					for (var j=0, c; c=constraint[j]; j++) {
            var zmax = getZoom(c.getElementsByTagName('sld:MinScaleDenominator')[0].innerHTML);
						var zmin = getZoom(c.getElementsByTagName('sld:MaxScaleDenominator')[0].innerHTML);
						if (zmin > ori.maxZoom) ori.maxZoom = zmin;
						if (zmin < ori.minZoom) ori.minZoom = zmin;
						if (zmax>ori.maxZoom) ori.maxZoom = zmax;
						if (zmax<ori.minZoom) ori.minZoom = zmax;
						ori.constraint.push({
              minZoom: zmin,
							maxZoom: zmax,
							bbox: JSON.parse('['+c.getElementsByTagName('gpp:BoundingBox')[0].innerHTML+']')
						});
          }
          // Merge constraints
          mergeConstraints(ori)
        }
        capabilities[service.layer] = service;
      }
      onSuccess(capabilities);
      onFinally(capabilities);
    }
  });
  // Promise like response
  var response = {
    then: function (callback) {
      if (typeof(callback)==='function') onSuccess = callback;
      return response;
    },
    catch: function (callback) {
      if (typeof(callback)==='function') onError = callback;
      return response;
    },
    finally: function (callback) {
      if (typeof(callback)==='function') onFinally = callback;
      return response;
    },
  }
  return response;
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Return a preview image of the source.
 * @param {ol.Coordinate|undefined} lonlat The center of the preview.
 * @param {number} resolution of the preview.
 * @return {String} the preview url
 * @api
 */
ol.source.Source.prototype.getPreview = function(/*lonlat, resolution*/) {
	return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAk6QAAJOkBUCTn+AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANeSURBVHic7ZpPiE1RHMc/780MBhkik79JSUlIUbOxI+wkI2yRhYSUlJLNpJF/xcpiJBmZGBZsNM1CkmhKITGkGbH0/BuPmXnP4rxbb/TOn3fvOffeec6nfqvb/b7f93fveeec37ng8Xg8Ho/nf6Uu4d+fDswFssCvhHOJhaXAMeApMAQUyyIPPAdOAiuTStAVy4EHjDWsix5gdRLJ2mY34ulWYz6IEeA4kIk9awtkgTOEM/5vdAKT4k0/Ou3YMR/ELcbRm9AKFLBbgCJwNE4TYZkJfMG++SIwDCyLz0o4bI17WdyJz0r1TAZ+oDcxCBwAFgIzEIuhvcBbg3sLwOK4DFXLFvQGniCGSSUagS4DjUPOHESkA3XiOWCORqMR6Nfo9DjI3QqPUSd+ylBnv0Zn0GrWFvmIOvGNhjqrNDp/EAutyFgRKUM2tgO+Gur81FxvAKYZaimxXYBvmuuLDHWWaK4X0RfJCNsF6NdcbzXU2a65PohYFKWOc+jn8PUajbWIXaBKp9NB7lZYh34OzwFbFfd/NtDYYSth27urLGIm0M31AL3APWAAmIooymaDnPIl/Vz4NN1yHrd7gcvxWQnHAuA3bsyPop8hUsE13BSgK04TUViBeFo2zedJ8S6wElexW4D2eNOPTjNi6WvD/DtEr8E6tk6GGoAmxFY2iFHE9NZiQf8gogiB9gTEH23izAZuE77vHyU+ANucO1QwD3hD/MbLowAcdm20EmkwXx4n3NodS9rMB2HabYpEWs0HcRqHp0fNwAvJD+eBTZr7p6BvmQVxUaEzEbiruNfJekH15L8jtrEm7JJolEcOmKXRqQOuKDQuY7HZY8s8iNfzkSLxIuI43FTrkkLnOlBfRW4VsWk+oAX5weknxFAxJQNckGgVgZuIRVoomoGXEmGTMa+iQ6K7M4SW7k24QYgiuDQPYinbhugiF4H3RGtzZYCzyIvQXfpNI1ybLyeLpf5+iTbkRbiP2EcocTHm4+YI8iI8RFHwWjAfsA95Q+YZFU6wasl8wB7kReijtNbIILa0vcg/PRlGfPQwHmlCviDqAzaA+OREtzqr1ejOIDorxlNEjTGUBV4nnUWCvAJxGDlA8q9j3DEArAn2zvXAfOwfl6eVAmJrPpJ0Ih6Px+PxeJLjLwPul3vj5d0eAAAAAElFTkSuQmCC";
};
/**
 * Return the tile image of the source.
 * @param {ol.Coordinate|undefined} lonlat The center of the preview.
 * @param {number} resolution of the preview.
 * @return {String} the preview url
 * @api
 */
ol.source.Tile.prototype.getPreview = function(lonlat, resolution)
{	if (!lonlat) lonlat = [21020, 6355964];
	if (!resolution) resolution = 150;
	var coord = this.getTileGrid().getTileCoordForCoordAndResolution(lonlat, resolution);
	var fn = this.getTileUrlFunction();
	return fn.call(this, coord, this.getProjection());
};
/**
 * Return the tile image of the source.
 * @param {ol.Coordinate|undefined} lonlat The center of the preview.
 * @param {number} resolution of the preview.
 * @return {String} the preview url
 * @api
 */
ol.source.TileWMS.prototype.getPreview = function(lonlat, resolution)
{	if (!lonlat) lonlat = [21020, 6355964];
	if (!resolution) resolution = 150;
/*	No way to acces tileUrlFunction...
	var fn = this.getTileUrlFunction();
	return fn.call(this, lonlat, this.getProjection());
*/
	// Use getfeature info instead
	var url = this.getGetFeatureInfoUrl ? 
		this.getGetFeatureInfoUrl(lonlat, resolution, this.getProjection() || 'EPSG:3857', {})
		: this.getFeatureInfoUrl(lonlat, resolution, this.getProjection() || 'EPSG:3857', {});
	url = url.replace(/getfeatureinfo/i,"GetMap");
	return url;
};
/**
 * Return a preview for the layer.
 * @param {ol.Coordinate|undefined} lonlat The center of the preview.
 * @param {number} resolution of the preview.
 * @return {Array<String>} list of preview url
 * @api
 */
ol.layer.Base.prototype.getPreview = function(lonlat, resolution)
{	if (this.get("preview")) return [ this.get("preview") ];
	if (!resolution) resolution = 150;
	// Get middle resolution
	if (resolution < this.getMinResolution() || resolution > this.getMaxResolution()) 
	{	var rmin = this.getMinResolution(),
			rmax = this.getMaxResolution();
		if (rmax>100000) rmax = 156543;	// min zoom : world
		if (rmin<0.15) rmin = 0.15;	// max zoom 
		resolution = rmax;
		while (rmax>rmin) 
		{	rmin *= 2;
			rmax /= 2;
			resolution = rmin;
		}
	}
	var e = this.getExtent();
	if (!lonlat) lonlat = [21020, 6355964];	// Default lonlat
	if (e && !ol.extent.containsCoordinate(e,lonlat)) lonlat = [ (e[0]+e[2])/2, (e[1]+e[3])/2 ];
	if (this.getSource) return [ this.getSource().getPreview(lonlat, resolution) ];
	return [];
};
/**
 * Return a preview for the layer.
 * @param {_ol_coordinate_|undefined} lonlat The center of the preview.
 * @param {number} resolution of the preview.
 * @return {Array<String>} list of preview url
 * @api
 */
ol.layer.Group.prototype.getPreview = function(lonlat, resolution)
{	if (this.get("preview")) return [ this.get("preview") ];
	var t = [];
	if (this.getLayers) 
	{	var l = this.getLayers().getArray();
		for (var i=0; i<l.length; i++) 
		{	t = t.concat(l[i].getPreview(lonlat, resolution));
		}
	}
	return t;
};
//NB: (Not confirmed)To use this module, you just have to :
				//   import('ol-ext/layer/getpreview')

/** ol.layer.Vector.prototype.setRender3D
 * @extends {ol.layer.Vector}
 * @param {ol.render3D}
 */
ol.layer.Vector.prototype.setRender3D = function (r) {
  r.setLayer(this);
}
/** 
 * @classdesc
 *ol.render3D 3D vector layer rendering
 * @constructor
 * @param {Object} param
 *  @param {ol.layer.Vector} param.layer the layer to display in 3D
 *  @param {ol.style.Style} options.styler drawing style
 *  @param {number} param.maxResolution  max resolution to render 3D
 *  @param {number} param.defaultHeight default height if none is return by a propertie
 *  @param {function|string|Number} param.height a height function (returns height giving a feature) or a popertie name for the height or a fixed value
 */
ol.render3D = function (options) {
  options = options || {};
  options.maxResolution = options.maxResolution || 100
  options.defaultHeight = options.defaultHeight || 0;
  ol.Object.call (this, options);
  this.setStyle(options.style);
  this.height_ = options.height = this.getHfn (options.height);
  if (options.layer) this.setLayer(options.layer);
}
ol.ext.inherits(ol.render3D, ol.Object);
/**
 * Set style associated with the renderer
 * @param {ol.style.Style} s
 */
ol.render3D.prototype.setStyle = function(s) {
  if (s instanceof ol.style.Style) this._style = s;
  else this._style = new ol.style.Style ();
  if (!this._style.getStroke()) {
    this._style.setStroke(new ol.style.Stroke({
      width: 1,
      color: 'red'
    }));
  }
  if (!this._style.getFill()) {
    this._style.setFill( new ol.style.Fill({ color: 'rgba(0,0,255,0.5)'}) );
  }
  // Get the geometry
  if (s && s.getGeometry()) {
    var geom = s.getGeometry();
    if (typeof(geom)==='function') {
      this.set('geometry', geom);
    } else {
      this.set('geometry', function() { return geom; });
    }
  } else {
    this.set('geometry', function(f) { return f.getGeometry(); });
  }
};
/**
 * Get style associated with the renderer
 * @return {ol.style.Style}
 */
ol.render3D.prototype.getStyle = function() {
  return this._style;
};
/** Calculate 3D at potcompose
*/
ol.render3D.prototype.onPostcompose_ = function(e) {
  var res = e.frameState.viewState.resolution;
  if (res > this.get('maxResolution')) return;
  this.res_ = res*400;
  if (this.animate_) {
    var elapsed = e.frameState.time - this.animate_;
    if (elapsed < this.animateDuration_) {
      this.elapsedRatio_ = this.easing_(elapsed / this.animateDuration_);
      // tell OL3 to continue postcompose animation
      e.frameState.animate = true;
    } else {
      this.animate_ = false;
      this.height_ = this.toHeight_
    }
  }
  var ratio = e.frameState.pixelRatio;
  var ctx = e.context;
  var m = this.matrix_ = e.frameState.coordinateToPixelTransform;
  // Old version (matrix)
  if (!m) {
    m = e.frameState.coordinateToPixelMatrix,
    m[2] = m[4];
    m[3] = m[5];
    m[4] = m[12];
    m[5] = m[13];
  }
  this.center_ = [ ctx.canvas.width/2/ratio, ctx.canvas.height/ratio ];
  var f = this.layer_.getSource().getFeaturesInExtent(e.frameState.extent);
  ctx.save();
    ctx.scale(ratio,ratio);
    var s = this.getStyle();
    ctx.lineWidth = s.getStroke().getWidth();
    ctx.strokeStyle = ol.color.asString(s.getStroke().getColor());
    ctx.fillStyle = ol.color.asString(s.getFill().getColor());
    var builds = [];
    for (var i=0; i<f.length; i++) {
      builds.push (this.getFeature3D_ (f[i], this.getFeatureHeight(f[i])));
    }
    this.drawFeature3D_ (ctx, builds);
  ctx.restore();
};
/** Set layer to render 3D
*/
ol.render3D.prototype.setLayer = function(l) {
  if (this._listener) {
    this._listener.forEach( function(l) { 
      ol.Observable.unByKey(l); 
    });
  }
  this.layer_ = l;
  this._listener = l.on (['postcompose', 'postrender'], this.onPostcompose_.bind(this));
}
/** Create a function that return height of a feature
*	@param {function|string|number} h a height function or a popertie name or a fixed value
*	@return {function} function(f) return height of the feature f
*/
ol.render3D.prototype.getHfn= function(h) {
  switch (typeof(h)) {
    case 'function': return h;
    case 'string': {
      var dh = this.get('defaultHeight');
        return (function(f) {
          return (Number(f.get(h)) || dh); 
        });
      }
    case 'number': return (function(/*f*/) { return h; });
    default: return (function(/*f*/) { return 10; });
  }
}
/** Animate rendering
 * @param {olx.render3D.animateOptions}
 *  @param {string|function|number} param.height an attribute name or a function returning height of a feature or a fixed value
 *  @param {number} param.duration the duration of the animatioin ms, default 1000
 *  @param {ol.easing} param.easing an ol easing function
 *	@api
 */
ol.render3D.prototype.animate = function(options) {
  options = options || {};
  this.toHeight_ = this.getHfn(options.height);
  this.animate_ = new Date().getTime();
  this.animateDuration_ = options.duration ||1000;
  this.easing_ = options.easing || ol.easing.easeOut;
  // Force redraw
  this.layer_.changed();
}
/** Check if animation is on
*	@return {bool}
*/
ol.render3D.prototype.animating = function() {
  if (this.animate_ && new Date().getTime() - this.animate_ > this.animateDuration_) {
    this.animate_ = false;
  }
  return !!this.animate_;
}
/** 
*/
ol.render3D.prototype.getFeatureHeight = function (f) {
  if (this.animate_) {
    var h1 = this.height_(f);
    var h2 = this.toHeight_(f);
    return (h1*(1-this.elapsedRatio_)+this.elapsedRatio_*h2);
  }
  else return this.height_(f);
};
/**
*/
ol.render3D.prototype.hvector_ = function (pt, h) {
  var p0 = [
    pt[0]*this.matrix_[0] + pt[1]*this.matrix_[1] + this.matrix_[4],
    pt[0]*this.matrix_[2] + pt[1]*this.matrix_[3] + this.matrix_[5]
  ];
  return {
    p0: p0, 
    p1: [
      p0[0] + h/this.res_ * (p0[0]-this.center_[0]),
      p0[1] + h/this.res_ * (p0[1]-this.center_[1])
    ]
  };
};
/**
*/
ol.render3D.prototype.getFeature3D_ = function (f, h) {
  var geom = this.get('geometry')(f);
  var c = geom.getCoordinates();
  switch (geom.getType()) {
    case "Polygon":
      c = [c];
    // fallthrough
    case "MultiPolygon":
      var build = [];
      for (var i=0; i<c.length; i++) {
        for (var j=0; j<c[i].length; j++) {
          var b = [];
          for (var k=0; k<c[i][j].length; k++) {
            b.push( this.hvector_(c[i][j][k], h) );
          }
          build.push(b);
        }
      }
      return { type:"MultiPolygon", feature: f, geom: build };
    case "Point":
      return { type:"Point", feature: f, geom: this.hvector_(c,h) };
    default: return {};
  }
}
/**
*/
ol.render3D.prototype.drawFeature3D_ = function(ctx, build) {
  var i,j, b, k;
  // Construct
  for (i=0; i<build.length; i++) {	
    switch (build[i].type) {
      case "MultiPolygon": {
        for (j=0; j<build[i].geom.length; j++) {
          b = build[i].geom[j];
          for (k=0; k < b.length; k++) {
            ctx.beginPath();
            ctx.moveTo(b[k].p0[0], b[k].p0[1]);
            ctx.lineTo(b[k].p1[0], b[k].p1[1]);
            ctx.stroke();
          }
        }
        break;
      }
      case "Point": {
        var g = build[i].geom;
          ctx.beginPath();
          ctx.moveTo(g.p0[0], g.p0[1]);
          ctx.lineTo(g.p1[0], g.p1[1]);
          ctx.stroke();
          break;
        }
      default: break;
    }
  }
  // Roof
  for (i=0; i<build.length; i++) {
    switch (build[i].type) {
      case "MultiPolygon": {
        ctx.beginPath();
        for (j=0; j<build[i].geom.length; j++) {
          b = build[i].geom[j];
          if (j==0) {
            ctx.moveTo(b[0].p1[0], b[0].p1[1]);
            for (k=1; k < b.length; k++) {
              ctx.lineTo(b[k].p1[0], b[k].p1[1]);
            }
          } else {
            ctx.moveTo(b[0].p1[0], b[0].p1[1]);
            for (k=b.length-2; k>=0; k--) {
              ctx.lineTo(b[k].p1[0], b[k].p1[1]);
            }
          }
          ctx.closePath();
        }
        ctx.fill("evenodd");
        ctx.stroke();
        break;
      }
      case "Point": {
        b = build[i];
        var t = b.feature.get('label');
        if (t) {
          var p = b.geom.p1;
          var f = ctx.fillStyle;
          ctx.fillStyle = ctx.strokeStyle;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText ( t, p[0], p[1] );
          var m = ctx.measureText(t);
          var h = Number (ctx.font.match(/\d+(\.\d+)?/g).join([]));
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillRect (p[0]-m.width/2 -5, p[1]-h -5, m.width +10, h +10)
          ctx.strokeRect (p[0]-m.width/2 -5, p[1]-h -5, m.width +10, h +10)
          ctx.fillStyle = f;
          //console.log(build[i].feature.getProperties())
        }
        break;
      }
      default: break;
    }
  }
}

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc
 * A popup element to be displayed over the map and attached to a single map
 * location. The popup are customized using CSS.
 *
 * @example
var popup = new ol.Overlay.Popup();
map.addOverlay(popup);
popup.show(coordinate, "Hello!");
popup.hide();
*
* @constructor
* @extends {ol.Overlay}
* @param {} options Extend Overlay options 
*	@param {String} options.popupClass the a class of the overlay to style the popup.
*	@param {bool} options.closeBox popup has a close box, default false.
*	@param {function|undefined} options.onclose: callback function when popup is closed
*	@param {function|undefined} options.onshow callback function when popup is shown
*	@param {Number|Array<number>} options.offsetBox an offset box
*	@param {ol.OverlayPositioning | string | undefined} options.positioning 
*		the 'auto' positioning var the popup choose its positioning to stay on the map.
* @api stable
*/
ol.Overlay.Popup = function (options) {
  var self = this;
  options = options || {};
  if (typeof(options.offsetBox)==='number') this.offsetBox = [options.offsetBox,options.offsetBox,options.offsetBox,options.offsetBox];
  else this.offsetBox = options.offsetBox;
  // Popup div
  var element = document.createElement("div");
  //element.classList.add('ol-overlaycontainer-stopevent');
  options.element = element;
  // Anchor div
  var anchorElement = document.createElement("div");
  anchorElement.classList.add("anchor");
  element.appendChild(anchorElement);
  // Content
  this.content = ol.ext.element.create("div", { 
    html: options.html || '',
    className: "ol-popup-content",
    parent: element
  });
  // Closebox
  this.closeBox = options.closeBox;
  this.onclose = options.onclose;
  this.onshow = options.onshow;
  var button = document.createElement("button");
  button.classList.add("closeBox");
  if (options.closeBox) button.classList.add('hasclosebox');
  button.setAttribute('type', 'button');
  element.insertBefore(button, anchorElement);
  button.addEventListener("click", function() {
    self.hide();
  });
  // Stop event
  if (options.stopEvent) {
    element.addEventListener("mousedown", function(e){ e.stopPropagation(); });
    element.addEventListener("touchstart", function(e){ e.stopPropagation(); });
  }
  ol.Overlay.call(this, options);
  this._elt = this.element;
  // call setPositioning first in constructor so getClassPositioning is called only once
  this.setPositioning(options.positioning || 'auto');
  this.setPopupClass(options.popupClass || options.className || 'default');
  // Show popup on timeout (for animation purposes)
  if (options.position) {
    setTimeout(function(){ this.show(options.position); }.bind(this));
  }
};
ol.ext.inherits(ol.Overlay.Popup, ol.Overlay);
/**
 * Get CSS class of the popup according to its positioning.
 * @private
 */
ol.Overlay.Popup.prototype.getClassPositioning = function () {
  var c = "";
  var pos = this.getPositioning();
  if (/bottom/.test(pos)) c += "ol-popup-bottom ";
  if (/top/.test(pos)) c += "ol-popup-top ";
  if (/left/.test(pos)) c += "ol-popup-left ";
  if (/right/.test(pos)) c += "ol-popup-right ";
  if (/^center/.test(pos)) c += "ol-popup-middle ";
  if (/center$/.test(pos)) c += "ol-popup-center ";
  return c;
};
/**
 * Set a close box to the popup.
 * @param {bool} b
 * @api stable
 */
ol.Overlay.Popup.prototype.setClosebox = function (b) {
  this.closeBox = b;
  if (b) this._elt.classList.add("hasclosebox");
  else this._elt.classList.remove("hasclosebox");
};
/**
 * Set the CSS class of the popup.
 * @param {string} c class name.
 * @api stable
 */
ol.Overlay.Popup.prototype.setPopupClass = function (c) {
  this._elt.className = "";
    var classesPositioning = this.getClassPositioning().split(' ')
      .filter(function(className) {
        return className.length > 0;
      });
    var classes = ["ol-popup"];
    if (c) {
      c.split(' ').filter(function(className) {
        return className.length > 0;
      })
      .forEach(function(className) {
        classes.push(className);
      });
    } else {
      classes.push("default");
    }
      classesPositioning.forEach(function(className) {
        classes.push(className);
      });
    if (this.closeBox) {
      classes.push("hasclosebox");
    }
    this._elt.classList.add.apply(this._elt.classList, classes);
};
/**
 * Add a CSS class to the popup.
 * @param {string} c class name.
 * @api stable
 */
ol.Overlay.Popup.prototype.addPopupClass = function (c) {
  this._elt.classList.add(c);
};
/**
 * Remove a CSS class to the popup.
 * @param {string} c class name.
 * @api stable
 */
ol.Overlay.Popup.prototype.removePopupClass = function (c) {
  this._elt.classList.remove(c);
};
/**
 * Set positionning of the popup
 * @param {ol.OverlayPositioning | string | undefined} pos an ol.OverlayPositioning 
 * 		or 'auto' to var the popup choose the best position
 * @api stable
 */
ol.Overlay.Popup.prototype.setPositioning = function (pos) {
  if (pos === undefined)
    return;
  if (/auto/.test(pos)) {
    this.autoPositioning = pos.split('-');
    if (this.autoPositioning.length==1) this.autoPositioning[1]="auto";
  }
  else this.autoPositioning = false;
  pos = pos.replace(/auto/g,"center");
  if (pos=="center") pos = "bottom-center";
  this.setPositioning_(pos);
};
/** @private
 * @param {ol.OverlayPositioning | string | undefined} pos
 */
ol.Overlay.Popup.prototype.setPositioning_ = function (pos) {
  if (this._elt) {
    ol.Overlay.prototype.setPositioning.call(this, pos);
    this._elt.classList.remove("ol-popup-top", "ol-popup-bottom", "ol-popup-left", "ol-popup-right", "ol-popup-center", "ol-popup-middle");
    var classes = this.getClassPositioning().split(' ')
      .filter(function(className) {
        return className.length > 0;
      });
    this._elt.classList.add.apply(this._elt.classList, classes);
  }
};
/** Check if popup is visible
* @return {boolean}
*/
ol.Overlay.Popup.prototype.getVisible = function () {
  return this._elt.classList.contains("visible");
};
/**
 * Set the position and the content of the popup.
 * @param {ol.Coordinate|string} coordinate the coordinate of the popup or the HTML content.
 * @param {string|undefined} html the HTML content (undefined = previous content).
 * @example
var popup = new ol.Overlay.Popup();
// Show popup
popup.show([166000, 5992000], "Hello world!");
// Move popup at coord with the same info
popup.show([167000, 5990000]);
// set new info
popup.show("New informations");
* @api stable
*/
ol.Overlay.Popup.prototype.show = function (coordinate, html) {
  if (!html && typeof(coordinate)=='string') {
    html = coordinate; 
    coordinate = null;
  }
  if (coordinate===true) {
    coordinate = this.getPosition();
  }
  var self = this;
  var map = this.getMap();
  if (!map) return;
  if (html && html !== this.prevHTML) {
    // Prevent flickering effect
    this.prevHTML = html;
    this.content.innerHTML = "";
    if (html instanceof Element) {
      this.content.appendChild(html);
    } else {
      this.content.insertAdjacentHTML('beforeend', html);
    }
    // Refresh when loaded (img)
    Array.prototype.slice.call(this.content.querySelectorAll('img'))
      .forEach(function(image) {
        image.addEventListener("load", function() {
          map.renderSync();
        });
      });
  }
  if (coordinate) {
    // Auto positionning
    if (this.autoPositioning) {
      var p = map.getPixelFromCoordinate(coordinate);
      var s = map.getSize();
      var pos=[];
      if (this.autoPositioning[0]=='auto') {
        pos[0] = (p[1]<s[1]/3) ? "top" : "bottom";
      }
      else pos[0] = this.autoPositioning[0];
      pos[1] = (p[0]<2*s[0]/3) ? "left" : "right";
      this.setPositioning_(pos[0]+"-"+pos[1]);
      if (this.offsetBox) {
        this.setOffset([this.offsetBox[pos[1]=="left"?2:0], this.offsetBox[pos[0]=="top"?3:1] ]);
      }
    } else {
      if (this.offsetBox){
        this.setOffset(this.offsetBox);
      }
    }
    // Show
    this.setPosition(coordinate);
    // Set visible class (wait to compute the size/position first)
    this._elt.parentElement.style.display = '';
    if (typeof (this.onshow) == 'function') this.onshow();
    this._tout = setTimeout (function() {
      self._elt.classList.add("visible"); 
    }, 0);
  }
};
/**
 * Hide the popup
 * @api stable
 */
ol.Overlay.Popup.prototype.hide = function () {
  if (this.getPosition() == undefined) return;
  if (typeof (this.onclose) == 'function') this.onclose();
  this.setPosition(undefined);
  if (this._tout) clearTimeout(this._tout);
  this._elt.classList.remove("visible");
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc
 *	The Magnify overlay add a "magnifying glass" effect to an OL3 map that displays 
 *	a portion of the map in a different zoom (and actually display different content).
 *
 * @constructor
 * @extends {ol.Overlay}
 * @param {olx.OverlayOptions} options Overlay options 
 * @api stable
 */
ol.Overlay.Magnify = function (options) {
	var elt = document.createElement("div");
			elt.className = "ol-magnify";
	this._elt = elt;
	ol.Overlay.call(this,
		{	positioning: options.positioning || "center-center",
			element: this._elt,
			stopEvent: false
		});
	// Create magnify map
	this.mgmap_ = new ol.Map(
	{	controls: new ol.Collection(),
		interactions: new ol.Collection(),
		target: options.target || this._elt,
		view: new ol.View({ projection: options.projection }),
		layers: options.layers
	});
	this.mgview_ = this.mgmap_.getView();
	this.external_ = options.target?true:false;
	this.set("zoomOffset", options.zoomOffset||1);
	this.set("active", true);
	this.on("propertychange", this.setView_.bind(this));
};
ol.ext.inherits(ol.Overlay.Magnify, ol.Overlay);
/**
 * Set the map instance the overlay is associated with.
 * @param {ol.Map} map The map instance.
 */
ol.Overlay.Magnify.prototype.setMap = function(map) {
	if (this.getMap()) {
		this.getMap().getViewport().removeEventListener("mousemove", this.onMouseMove_);
	}
	if (this._listener) ol.Observable.unByKey(this._listener);
	this._listener = null;
	ol.Overlay.prototype.setMap.call(this, map);
	map.getViewport().addEventListener("mousemove", this.onMouseMove_.bind(this));
	this._listener = map.getView().on('propertychange', this.setView_.bind(this));
	this.setView_();
};
/** Get the magnifier map
*	@return {_ol_Map_}
*/
ol.Overlay.Magnify.prototype.getMagMap = function()
{	return this.mgmap_;
};
/** Magnify is active
*	@return {boolean}
*/
ol.Overlay.Magnify.prototype.getActive = function()
{	return this.get("active");
};
/** Activate or deactivate
*	@param {boolean} active
*/
ol.Overlay.Magnify.prototype.setActive = function(active)
{	return this.set("active", active);
};
/** Mouse move
 * @private
 */
ol.Overlay.Magnify.prototype.onMouseMove_ = function(e)
{	var self = this;
	if (!self.get("active"))
	{	self.setPosition();
	}
	else
	{	var px = self.getMap().getEventCoordinate(e);
		if (!self.external_) self.setPosition(px);
		self.mgview_.setCenter(px);
		if (self._elt.querySelector('canvas').style.display =="none") self.mgmap_.updateSize();
	}
};
/** View has changed
 * @private
 */
ol.Overlay.Magnify.prototype.setView_ = function(e)
{	if (!this.get("active"))
	{	this.setPosition();
		return;
	}
	if (!e)
	{	// refresh all
		this.setView_({key:'rotation'});
		this.setView_({key:'resolution'});
		return;
	}
	// Set the view params
	switch (e.key)
	{	case 'rotation':
			this.mgview_.setRotation(this.getMap().getView().getRotation());
			break;
		case 'zoomOffset':
		case 'resolution':
		{	var z = Math.max(0,this.getMap().getView().getZoom()+Number(this.get("zoomOffset")));
			this.mgview_.setZoom(z);
			break;
		}
		default: break;
	}
};

/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc
 * A placemark element to be displayed over the map and attached to a single map
 * location. The placemarks are customized using CSS.
 *
 * @example
var popup = new ol.Overlay.Placemark();
map.addOverlay(popup);
popup.show(coordinate);
popup.hide();
*
* @constructor
* @extends {ol.Overlay}
* @param {} options Extend ol/Overlay/Popup options 
*	@param {String} options.color placemark color
*	@param {String} options.backgroundColor placemark color
*	@param {String} options.contentColor placemark color
*	@param {Number} options.radius placemark radius in pixel
*	@param {String} options.popupClass the a class of the overlay to style the popup.
*	@param {function|undefined} options.onclose: callback function when popup is closed
*	@param {function|undefined} options.onshow callback function when popup is shown
* @api stable
*/
ol.Overlay.Placemark = function (options) {
  options = options || {};
  options.popupClass = (options.popupClass || '') + ' placemark anim'
  options.positioning = 'bottom-center',
  ol.Overlay.Popup.call(this, options);
  this.setPositioning = function(){};
  if (options.color) this.element.style.color = options.color;
  if (options.backgroundColor ) this.element.style.backgroundColor  = options.backgroundColor ;
  if (options.contentColor ) this.setContentColor(options.contentColor);
  if (options.size) this.setRadius(options.size);
};
ol.ext.inherits(ol.Overlay.Placemark, ol.Overlay.Popup);
/**
 * Set the position and the content of the placemark (hide it before to enable animation).
 * @param {ol.Coordinate|string} coordinate the coordinate of the popup or the HTML content.
 * @param {string|undefined} html the HTML content (undefined = previous content).
 */
ol.Overlay.Placemark.prototype.show = function(coordinate, html) {
  if (coordinate===true) {
    coordinate = this.getPosition();
  }
  this.hide();
  ol.Overlay.Popup.prototype.show.apply(this, [coordinate, html]);
};
/**
 * Set the placemark color.
 * @param {string} color
 */
ol.Overlay.Placemark.prototype.setColor = function(color) {
  this.element.style.color = color;
};
/**
 * Set the placemark background color.
 * @param {string} color
 */
ol.Overlay.Placemark.prototype.setBackgroundColor = function(color) {
  this.element.style.backgroundColor = color;
};
/**
 * Set the placemark content color.
 * @param {string} color
 */
ol.Overlay.Placemark.prototype.setContentColor = function(color) {
  var c = this.element.getElementsByClassName('ol-popup-content')[0];
  if (c) c.style.color = color;
};
/**
 * Set the placemark class.
 * @param {string} name
 */
ol.Overlay.Placemark.prototype.setClassName = function(name) {
  var oldclass = this.element.className;
  this.element.className = 'ol-popup placemark ol-popup-bottom ol-popup-center ' 
    + (/visible/.test(oldclass) ? 'visible ' : '')
    + (/anim/.test(oldclass) ? 'anim ' : '')
    + name;
};
/**
 * Set the placemark radius.
 * @param {number} size size in pixel
 */
ol.Overlay.Placemark.prototype.setRadius = function(size) {
  this.element.style.fontSize = size + 'px';
};

/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Template attributes for popup
 * @typedef {Object} TemplateAttributes
 * @property {string} title
 * @property {function} format a function that takes an attribute and a feature and returns the formated attribute
 * @property {string} before string to instert before the attribute (prefix)
 * @property {string} after string to instert after the attribute (sudfix)
 * @property {boolean|function} visible boolean or a function (feature, value) that decides the visibility of a attribute entry
 */
/** Template 
 * @typedef {Object} Template
 * @property {string|function} title title of the popup, attribute name or a function that takes a feature and returns the title
 * @property {Object.<TemplateAttributes>} attributes a list of template attributes 
 */
/**
 * A popup element to be displayed on a feature.
 *
 * @constructor
 * @extends {ol.Overlay.Popup}
 * @param {} options Extend Popup options 
 *  @param {String} options.popupClass the a class of the overlay to style the popup.
 *  @param {bool} options.closeBox popup has a close box, default false.
 *  @param {function|undefined} options.onclose: callback function when popup is closed
 *  @param {function|undefined} options.onshow callback function when popup is shown
 *  @param {Number|Array<number>} options.offsetBox an offset box
 *  @param {ol.OverlayPositioning | string | undefined} options.positionning 
 *    the 'auto' positioning var the popup choose its positioning to stay on the map.
 *  @param {Template} options.template A template with a list of properties to use in the popup
 *  @param {boolean} options.canFix Enable popup to be fixed, default false
 *  @param {boolean} options.showImage display image url as image, default false
 *  @param {boolean} options.maxChar max char to display in a cell, default 200
 *  @api stable
 */
ol.Overlay.PopupFeature = function (options) {
  options = options || {};
  ol.Overlay.Popup.call(this, options);
  this.setTemplate(options.template);
  this.set('canFix', options.canFix)
  this.set('showImage', options.showImage)
  this.set('maxChar', options.maxChar||200)
  // Bind with a select interaction
  if (options.select && (typeof options.select.on ==='function')) {
    this._select = options.select;
    options.select.on('select', function(e){
      if (!this._noselect) this.show(e.mapBrowserEvent.coordinate, options.select.getFeatures().getArray());
    }.bind(this));
  }
};
ol.ext.inherits(ol.Overlay.PopupFeature, ol.Overlay.Popup);
/** Set the template
 * @param {Template} template A template with a list of properties to use in the popup
 */
ol.Overlay.PopupFeature.prototype.setTemplate = function(template) {
  this._template = template;
  if (this._template && this._template.attributes instanceof Array) {
    var att = {};
    this._template.attributes.forEach(function (a) {
      att[a] = true;
    });
    this._template.attributes = att;
  }
};
/** Show the popup on the map
 * @param {ol.coordinate|undefined} coordinate Position of the popup
 * @param {ol.Feature|Array<ol.Feature>} features The features on the popup
 */
ol.Overlay.PopupFeature.prototype.show = function(coordinate, features) {
  if (coordinate instanceof ol.Feature 
    || (coordinate instanceof Array && coordinate[0] instanceof ol.Feature)) {
    features = coordinate;
    coordinate = null;
  }
  if (!(features instanceof Array)) features = [features];
  this._features = features.slice();
  if (!this._count) this._count = 1;
  // Calculate html upon feaures attributes
  this._count = 1;
  var html = this._getHtml(features[0]);
  this.hide();
  if (html) {
    if (!coordinate || features[0].getGeometry().getType()==='Point') {
      coordinate = features[0].getGeometry().getFirstCoordinate();
    }
    ol.Overlay.Popup.prototype.show.call(this, coordinate, html);
  }
};
/**
 * @private
 */
ol.Overlay.PopupFeature.prototype._getHtml = function(feature) {
  if (!feature) return '';
  var html = ol.ext.element.create('DIV', { className: 'ol-popupfeature' });
  if (this.get('canFix')) {
    ol.ext.element.create('I', { className:'ol-fix', parent: html })
      .addEventListener('click', function(){
        this.element.classList.toggle('ol-fixed');
      }.bind(this));
  }
  var template = this._template;
  // calculate template
  if (!template || !template.attributes) {
    template = template || {};
    template. attributes = {};
    for (var i in feature.getProperties()) if (i!='geometry') {
      template.attributes[i] = i;
    }
  }
  // Display title
  if (template.title) {
    var title;
    if (typeof template.title === 'function') {
      title = template.title(feature);
    } else {
      title = feature.get(template.title);
    }
    ol.ext.element.create('H1', { html:title, parent: html });
  }
  // Display properties in a table
  if (template.attributes) {
    var tr, table = ol.ext.element.create('TABLE', { parent: html });
    var atts = template.attributes;
    for (var att in atts) {
      var a = atts[att];
      var content, val = feature.get(att);
      // Get calculated value
      if (typeof(a.format)==='function') {
        val = a.format(val, feature);
      }
      // Is entry visible?
      var visible = true;
      if (typeof(a.visible)==='boolean') {
        visible = a.visible;
      } else if (typeof(a.visible)==='function') {
        visible = a.visible(feature, val);
      }
      if (visible) {
        tr = ol.ext.element.create('TR', { parent: table });
        ol.ext.element.create('TD', { html: a.title || att, parent: tr });
        // Show image or content
        if (this.get('showImage') && /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/.test(val)) {
          content = ol.ext.element.create('IMG',{
            src: val
          });
        } else {
          content = (a.before||'') + val + (a.after||'');
          var maxc = this.get('maxChar') || 200;
          if (typeof(content) === 'string' && content.length>maxc) content = content.substr(0,maxc)+'[...]';
        }
        // Add value
        ol.ext.element.create('TD', {
          html: content,
          parent: tr
        });
      }
    }
  }
  // Zoom button
  ol.ext.element.create('BUTTON', { className: 'ol-zoombt', parent: html })
    .addEventListener('click', function() {
      if (feature.getGeometry().getType()==='Point') {
        this.getMap().getView().animate({
          center: feature.getGeometry().getFirstCoordinate(),
          zoom:  Math.max(this.getMap().getView().getZoom(), 18)
        });
      } else  {
        var ext = feature.getGeometry().getExtent();
        this.getMap().getView().fit(ext, { duration:1000 });
      }
    }.bind(this));
  // Counter
  if (this._features.length > 1) {
    var div = ol.ext.element.create('DIV', { className: 'ol-count', parent: html });
    ol.ext.element.create('DIV', { 
      className: 'ol-prev', 
      parent: div,
      click: function() {
        this._count--;
        if (this._count<1) this._count = this._features.length;
        html = this._getHtml(this._features[this._count-1]);
        setTimeout(function() { 
          ol.Overlay.Popup.prototype.show.call(this, this.getPosition(), html); 
        }.bind(this), 350 );
      }.bind(this)
    });
    ol.ext.element.create('TEXT', { html:this._count+'/'+this._features.length, parent: div });
    ol.ext.element.create('DIV', { 
      className: 'ol-next', 
      parent: div,
      click: function() {
        this._count++;
        if (this._count>this._features.length) this._count = 1;
        html = this._getHtml(this._features[this._count-1]);
        setTimeout(function() { 
          ol.Overlay.Popup.prototype.show.call(this, this.getPosition(), html); 
        }.bind(this), 350 );
      }.bind(this)
    });
  }
  // Use select interaction
  if (this._select) {
    this._noselect = true;
    this._select.getFeatures().clear();
    this._select.getFeatures().push(feature);
    this._noselect = false;
  }
  return html;
};
/** Fix the popup
 * @param {boolean} fix
 */
ol.Overlay.PopupFeature.prototype.setFix = function (fix) {
  if (fix) this.element.classList.add('ol-fixed');
  else this.element.classList.remove('ol-fixed');
};
/** Is a popup fixed
 * @return {boolean} 
 */
ol.Overlay.PopupFeature.prototype.getFix = function () {
  return this.element.classList.contains('ol-fixed');
};
/** Get a function to use as format to get local string for an attribute
 * if the attribute is a number: Number.toLocaleString()
 * if the attribute is a date: Date.toLocaleString()
 * otherwise the attibute itself
 * @param {string} locales string with a BCP 47 language tag, or an array of such strings
 * @param {*} options Number or Date toLocaleString options
 * @return {function} a function that takes an attribute and return the formated attribute
 */
ol.Overlay.PopupFeature.localString = function (locales , options) {
  return function (a) {
    if (a && a.toLocaleString) {
      return a.toLocaleString(locales , options);
    } else {
      // Try to get a date from a string
      var date = new Date(a);
      if (isNaN(date)) return a;
      else return date.toLocaleString(locales , options);
    }
  };
};

/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A tooltip element to be displayed over the map and attached on the cursor position.
 * @constructor
 * @extends {ol.Overlay.Popup}
 * @param {} options Extend Popup options 
 *	@param {String} options.popupClass the a class of the overlay to style the popup.
 *  @param {number} options.maximumFractionDigits maximum digits to display on measure, default 2
 *  @param {function} options.formatLength a function that takes a number and returns the formated value, default length in meter
 *  @param {function} options.formatArea a function that takes a number and returns the formated value, default length in square-meter
 *  @param {function} options.getHTML a function that takes a feature and the info string and return a formated info to display in the tooltip, default display feature measure & info
 *	@param {Number|Array<number>} options.offsetBox an offset box
 *	@param {ol.OverlayPositioning | string | undefined} options.positionning 
 *		the 'auto' positioning var the popup choose its positioning to stay on the map.
 * @api stable
 */
ol.Overlay.Tooltip = function (options) {
  options = options || {};
  options.popupClass = options.popupClass || options.className || 'tooltips black';
  options.positioning = options.positioning || 'center-left';
  options.stopEvent = !!(options.stopEvent);
  ol.Overlay.Popup.call(this, options);
  this.set('maximumFractionDigits', options.maximumFractionDigits||2);
  if (typeof(options.formatLength)==='function') this.formatLength = options.formatLength;
  if (typeof(options.formatArea)==='function') this.formatArea = options.formatArea;
  if (typeof(options.getHTML)==='function') this.getHTML = options.getHTML;
  this._interaction = new ol.interaction.Interaction({
    handleEvent: function(e){
      if (e.type==='pointermove' || e.type==='click') {
        var info = this.getHTML(this._feature, this.get('info'));
        if (info) {
          this.show(e.coordinate, info);
        }
        else this.hide();
        this._coord = e.coordinate;
      }
      return true;
    }.bind(this)
  });
};
ol.ext.inherits(ol.Overlay.Tooltip, ol.Overlay.Popup);
/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol.Overlay.Tooltip.prototype.setMap = function (map) {
  if (this.getMap()) this.getMap().removeInteraction(this._interaction);
  ol.Overlay.Popup.prototype.setMap.call(this, map);
  if (this.getMap()) this.getMap().addInteraction(this._interaction);
};
/** Get the information to show in the tooltip
 * The area/length will be added if a feature is attached.
 * @param {ol.Feature|undefined} feature the feature
 * @param {string} info the info string
 * @api
 */
ol.Overlay.Tooltip.prototype.getHTML = function(feature, info) {
  if (this.get('measure')) return this.get('measure') + (info ? '<br/>'+ info : '');
  else return info || '';
};
/** Set the Tooltip info
 * If information is not null it will be set with a delay,
 * thus watever the information is inserted, the significant information will be set.
 * ie. ttip.setInformation('ok'); ttip.setInformation(null); will set 'ok' 
 * ttip.set('info','ok'); ttip.set('info', null); will set null
 * @param {string} what The information to display in the tooltip, default remove information
 */
ol.Overlay.Tooltip.prototype.setInfo = function(what) {
  if (!what) {
    this.set('info','');
    this.hide();
  }
  else setTimeout(function() { 
    this.set('info', what); 
    this.show(this._coord, this.get('info'));
  }.bind(this));
};
/** Remove the current featue attached to the tip 
 * Similar to setFeature() with no argument
 */
ol.Overlay.Tooltip.prototype.removeFeature = function() {
  this.setFeature();
};
/** Format area to display in the popup. 
 * Can be overwritten to display measure in a different unit (default: square-metter).
 * @param {number} area area in m2
 * @return {string} the formated area
 * @api
 */
ol.Overlay.Tooltip.prototype.formatArea = function(area) {
  if (area > Math.pow(10,-1*this.get('maximumFractionDigits'))) {
    if (area>10000) {
      return (area/1000000).toLocaleString(undefined, {maximumFractionDigits: this.get('maximumFractionDigits)')}) + ' km²';
    } else {
      return area.toLocaleString(undefined, {maximumFractionDigits: this.get('maximumFractionDigits')}) + ' m²';
    }
  } else {
    return '';
  }
};
/** Format area to display in the popup
 * Can be overwritten to display measure in different unit (default: meter).
 * @param {number} length length in m
 * @return {string} the formated length
 * @api
 */
ol.Overlay.Tooltip.prototype.formatLength = function(length) {
  if (length > Math.pow(10,-1*this.get('maximumFractionDigits'))) {
    if (length>100) {
      return (length/1000).toLocaleString(undefined, {maximumFractionDigits: this.get('maximumFractionDigits')}) + ' km';
    } else {
      return length.toLocaleString(undefined, {maximumFractionDigits: this.get('maximumFractionDigits')}) + ' m';
    }
  } else {
    return '';
  }
};
/** Set a feature associated with the tooltips, measure info on the feature will be added in the tooltip
 * @param {ol.Feature|ol.Event} feature an ol.Feature or an event (object) with a feature property
 */
ol.Overlay.Tooltip.prototype.setFeature = function(feature) {
  // Handle event with a feature as property.
  if (feature && feature.feature) feature = feature.feature;
  // The feature
  this._feature = feature;
  if (this._listener) {
    this._listener.forEach(function(l) {
      ol.Observable.unByKey(l);
    });
  }
  this._listener = [];
  this.set('measure', '');
  if (feature) {
    this._listener.push(feature.getGeometry().on('change', function(e){ 
      var geom = e.target;
      var measure;
      if (geom.getArea) {
        measure = this.formatArea(ol.sphere.getArea(geom, { projection: this.getMap().getView().getProjection() }));
      } else if (geom.getLength) {
        measure = this.formatLength(ol.sphere.getLength(geom, { projection: this.getMap().getView().getProjection() }));
      }
      this.set('measure', measure);
    }.bind(this)));
  }
};

/*
	Copyright (c) 2017 Jean-Marc VIGLINO,
	released under the CeCILL-B license (http://www.cecill.info/).
	ol.coordinate.convexHull compute a convex hull using Andrew's Monotone Chain Algorithm.
	@see https://en.wikipedia.org/wiki/Convex_hull_algorithms
*/
ol.coordinate.convexHull;
(function(){
/** Tests if a point is left or right of line (a,b).
* @param {ol.coordinate} a point on the line
* @param {ol.coordinate} b point on the line
* @param {ol.coordinate} o
* @return {bool} true if (a,b,o) turns clockwise
*/
var clockwise = function (a, b, o) {
  return ((a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]) <= 0);
};
/** Compute a convex hull using Andrew's Monotone Chain Algorithm
 * @param {Array<ol.geom.Point>} points an array of 2D points
 * @return {Array<ol.geom.Point>} the convex hull vertices
 */
ol.coordinate.convexHull = function (points) {	// Sort by increasing x and then y coordinate
  var i;
  points.sort(function(a, b) {
    return a[0] == b[0] ? a[1] - b[1] : a[0] - b[0];
  });
  // Compute the lower hull
  var lower = [];
  for (i = 0; i < points.length; i++) {
    while (lower.length >= 2 && clockwise(lower[lower.length - 2], lower[lower.length - 1], points[i])) {
      lower.pop();
    }
    lower.push(points[i]);
  }
  // Compute the upper hull
  var upper = [];
  for (i = points.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && clockwise(upper[upper.length - 2], upper[upper.length - 1], points[i])) {
      upper.pop();
    }
    upper.push(points[i]);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
};
/* Get coordinates of a geometry */
var getCoordinates = function (geom) {
  var i, p
  var h = [];
  switch (geom.getType()) {
    case "Point":h.push(geom.getCoordinates());
      break;
    case "LineString":
    case "LinearRing":
    case "MultiPoint":h = geom.getCoordinates();
      break;
    case "MultiLineString":
      p = geom.getLineStrings();
      for (i = 0; i < p.length; i++) h.concat(getCoordinates(p[i]));
      break;
    case "Polygon":
      h = getCoordinates(geom.getLinearRing(0));
      break;
    case "MultiPolygon":
      p = geom.getPolygons();
      for (i = 0; i < p.length; i++) h.concat(getCoordinates(p[i]));
      break;
    case "GeometryCollection":
      p = geom.getGeometries();
      for (i = 0; i < p.length; i++) h.concat(getCoordinates(p[i]));
      break;
    default:break;
  }
  return h;
};
/** Compute a convex hull on a geometry using Andrew's Monotone Chain Algorithm
 * @return {Array<ol.geom.Point>} the convex hull vertices
 */
ol.geom.Geometry.prototype.convexHull = function() {
  return ol.coordinate.convexHull(getCoordinates(this));
};
})();

/*
	Copyright (c) 2018 Jean-Marc VIGLINO,
	released under the CeCILL-B license (http://www.cecill.info/).
*/
/** Convert coordinate to French DFCI grid
 * @param {ol/coordinate} coord
 * @param {number} level [0-3]
 * @param {ol/proj/Projection} projection of the coord, default EPSG:27572
 * @return {String} the DFCI index
 */
ol.coordinate.toDFCI = function (coord, level, projection) {
  if (!level && level !==0) level = 3;
  if (projection) {
    if (!ol.proj.get('EPSG:27572')) {
      // Add Lambert IIe proj 
      if (!proj4.defs["EPSG:27572"]) proj4.defs("EPSG:27572","+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs");
      ol.proj.proj4.register(proj4);
    }
    coord = ol.proj.transform(coord, projection, 'EPSG:27572');
  }
  var x = coord[0];
  var y = coord[1];
  var s = '';
  // Level 0
  var step = 100000;
  s += String.fromCharCode(65 + Math.floor((x<800000?x:x+200000)/step))
    + String.fromCharCode(65 + Math.floor((y<2300000?y:y+200000)/step) - 1500000/step);
  if (level === 0) return s;
  // Level 1
  var step1 = 100000/5;
  s += 2*Math.floor((x%step)/step1);
  s += 2*Math.floor((y%step)/step1);
  if (level === 1) return s;
  // Level 2
  var step2 = step1 / 10;
  var x0 = Math.floor((x%step1)/step2);
  s += String.fromCharCode(65 + (x0<8 ? x0 : x0+2));
  s += Math.floor((y%step1)/step2);
  if (level === 2) return s;
  // Level 3
  var x3 = Math.floor((x%step2)/500);
  var y3 = Math.floor((y%step2)/500);
  if (x3<1) {
    if (y3>1) s += '.1';
    else s += '.4';
  } else if (x3>2) {
    if (y3>1) s += '.2';
    else s += '.3';
  } else if (y3>2) {
    if (x3<2) s += '.1';
    else s += '.2';
  } else if (y3<1) {
    if (x3<2) s += '.4';
    else s += '.3';
  } else {
    s += '.5';
  }
  return s;
};
/** Get coordinate from French DFCI index
 * @param {String} index the DFCI index
 * @param {ol/proj/Projection} projection result projection, default EPSG:27572
 * @return {ol/coordinate} coord
 */
ol.coordinate.fromDFCI = function (index, projection) {
  var coord;
  // Level 0
  var step = 100000;
  var x = index.charCodeAt(0) - 65;
  x = (x<8 ? x : x-2)*step;
  var y = index.charCodeAt(1) - 65;
  y = (y<8 ? y : y-2)*step + 1500000;
  if (index.length===2) {
    coord = [x+step/2, y+step/2];
  } else {
    // Level 1
    step /= 5;
    x += Number(index.charAt(2))/2*step;
    y += Number(index.charAt(3))/2*step;
    if (index.length===4) {
      coord = [x+step/2, y+step/2];
    } else {
      // Level 2
      step /= 10;
      var x0 = index.charCodeAt(4) - 65;
      x += (x0<8 ? x0 : x0-2)*step;
      y += Number(index.charAt(5))*step;
      if (index.length === 6) {
        coord = [x+step/2, y+step/2];
      } else {
        // Level 3
        switch (index.charAt(7)) {
          case '1':
            coord = [x+step/4, y+3*step/4];
            break;
          case '2':
            coord = [x+3*step/4, y+3*step/4];
            break;
          case '3':
            coord = [x+3*step/4, y+step/4];
            break;
          case '4':
            coord = [x+step/4, y+step/4];
            break;
          default:
            coord = [x+step/2, y+step/2];
            break;
        }
      }
    }
  }
  // Convert ?
  if (projection) {
    if (!ol.proj.get('EPSG:27572')) {
      // Add Lambert IIe proj 
      if (!proj4.defs["EPSG:27572"]) proj4.defs("EPSG:27572","+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs");
      ol.proj.proj4.register(proj4);
    }
    coord = ol.proj.transform(coord, 'EPSG:27572', projection);
  }
  return coord;
};
/** The string is a valid DFCI index
 * @param {string} index DFCI index
 * @return {boolean}
 */
ol.coordinate.validDFCI = function (index) {
  if (index.length<2 || index.length>8) return false;
  if (/[^A-H|^K-N]/.test(index.substr(0,1))) return false;
  if (/[^B-H|^K-N]/.test(index.substr(1,1))) return false;
  if (index.length>2) {
    if (index.length<4) return false;
    if (/[^0,^2,^4,^6,^8]/.test(index.substr(2,1))) return false;
    if (/[^0,^2,^4,^6,^8]/.test(index.substr(3,1))) return false;
  }
  if (index.length>4) {
    if (index.length<6) return false;
    if (/[^A-H|^K-L]/.test(index.substr(4,1))) return false;
    if (/[^0-9]/.test(index.substr(5,1))) return false;
  }
  if (index.length>6) {
    if (index.length<8) return false;
    if (index.substr(6,1)!=='.') return false;
    if (/[^1-5]/.test(index.substr(7,1))) return false;
  }
  return true;
}
/** Coordinate is valid for DFCI 
 * @param {ol/coordinate} coord
 * @param {ol/proj/Projection} projection result projection, default EPSG:27572
 * @return {boolean}
 */
ol.coordinate.validDFCICoord = function (coord, projection) {
  if (projection) {
    if (!ol.proj.get('EPSG:27572')) {
      // Add Lambert IIe proj 
      if (!proj4.defs["EPSG:27572"]) proj4.defs("EPSG:27572","+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs");
      ol.proj.proj4.register(proj4);
    }
    coord = ol.proj.transform(coord, projection, 'EPSG:27572');
  }
  // Test extent
  if (0 > coord[0] || coord[0] > 1200000 ) return false;
  if (1600000 > coord[1] || coord[1] > 2700000 ) return false;
  return true;
};

/*
	Copyright (c) 2018 Jean-Marc VIGLINO,
	released under the CeCILL-B license (http://www.cecill.info/).
*/
/* Define namespace
 */
ol.graph = {};
/** 
 * @classdesc 
 * Compute the shortest paths between nodes in a graph source
 * The source must only contains LinesString.
 * 
 * It uses a A* optimisation.
 * You can overwrite methods to customize the result.
 * @see https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
 * @constructor
 * @fires calculating 
 * @fires start
 * @fires finish
 * @fires pause
 * @param {any} options
 *  @param {ol/source/Vector} options.source the source for the edges 
 *  @param {integer} [options.maxIteration=20000] maximum iterations before a pause event is fired, default 20000
 *  @param {integer} [options.stepIteration=2000] number of iterations before a calculating event is fired, default 2000
 *  @param {number} [options.epsilon=1E-6] geometric precision (min distance beetween 2 points), default 1E-6
 */
ol.graph.Dijskra = function (options) {
  options = options || {};
  this.source = options.source;
  this.nodes = new ol.source.Vector();
  // Maximum iterations
  this.maxIteration = options.maxIteration || 20000;
  this.stepIteration = options.stepIteration || 2000;
  // A* optimisation
  this.astar = true;
  this.candidat = [];
  ol.Object.call (this);
  this.set ('epsilon', options.epsilon || 1E-6);
};
ol.ext.inherits(ol.graph.Dijskra, ol.Object);
/** Get the weighting of the edge, for example a speed factor
 * The function returns a value beetween ]0,1]
 * - 1   = no weighting
 * - 0.5 = goes twice more faster on this road
 * 
 * If no feature is provided you must return the lower weighting you're using
 * @param {ol/Feature} feature
 * @return {number} a number beetween 0-1 
 * @api
 */
ol.graph.Dijskra.prototype.weight = function(/* feature */) {
  return 1;
};
/** Get the edge direction
 * -  0 : the road is blocked
 * -  1 : direct way
 * - -1 : revers way
 * -  2 : both way
 * @param {ol/Feature} feature
 * @return {Number} 0: blocked, 1: direct way, -1: revers way, 2:both way 
 * @api
 */
ol.graph.Dijskra.prototype.direction = function(/* feature */) {
  return 2;
};
/** Calculate the length of an edge
 * @param {ol/Feature|ol/geom/LineString} geom
 * @return {number}
 * @api
 */
ol.graph.Dijskra.prototype.getLength = function(geom) {
  if (geom.getGeometry) geom = geom.getGeometry();
  return geom.getLength();
};
/** Get the nodes source concerned in the calculation
 * @return {ol/source/Vector}
 */
ol.graph.Dijskra.prototype.getNodeSource = function() {
  return this.nodes;
};
/** Get all features at a coordinate
 * @param {ol/coordinate} coord
 * @return {Array<ol/Feature>}
 */
ol.graph.Dijskra.prototype.getEdges = function(coord) {
  var extent = ol.extent.buffer (ol.extent.boundingExtent([coord]), this.get('epsilon'));
  var result = [];
  this.source.forEachFeatureIntersectingExtent(extent, function(f){
    result.push(f);
  });
  return result;
};
/** Get a node at a coordinate
 * @param {ol/coordinate} coord
 * @return {ol/Feature} the node
 */
ol.graph.Dijskra.prototype.getNode = function(coord) {
  var extent = ol.extent.buffer (ol.extent.boundingExtent([coord]), this.get('epsilon'));
  var result = [];
  this.nodes.forEachFeatureIntersectingExtent(extent, function(f){
    result.push(f);
  });
  return result[0];
};
/** Add a node
 * @param {ol/coorindate} p
 * @param {number} wdist the distance to reach this node
 * @param {ol/Feature} from the feature used to come to this node
 * @param {ol/Feature} prev the previous node
 * @return {ol/Feature} the node
 * @private
 */
ol.graph.Dijskra.prototype.addNode = function(p, wdist, dist, from, prev) {
  // Final condition
  if (this.wdist && wdist > this.wdist) return false;
  // Look for existing point
  var node = this.getNode(p);
  // Optimisation ?
  var dtotal = wdist + this.getLength(new ol.geom.LineString([this.end, p])) * this.weight();
  if (this.astar && this.wdist && dtotal > this.wdist) return false;
  if (node) {
    // Allready there
    if (node!==this.arrival && node.get('wdist') <= wdist) return node;
    // New candidat
    node.set('dist', dist);
    node.set('wdist', wdist);
    node.set('dtotal', dtotal);
    node.set('from', from);
    node.set('prev', prev);
    if (node===this.arrival) {
      this.wdist = wdist;
    }
    this.candidat.push (node);
  } else {
    // New candidat
    node =  new ol.Feature({
      geometry: new ol.geom.Point(p),
      from: from, 
      prev: prev, 
      dist: dist || 0, 
      wdist: wdist, 
      dtotal: dtotal, 
    });
    if (wdist<0) {
      node.set('wdist', false);
    }
    else this.candidat.push (node);
    // Add it in the node source
    this.nodes.addFeature(node);
  }
  return node;
};
/** Get the closest coordinate of a node in the graph source (an edge extremity)
 * @param {ol/coordinate} p
 * @return {ol/coordinate} 
 * @private
 */
ol.graph.Dijskra.prototype.closestCoordinate = function(p) {
  var e = this.source.getClosestFeatureToCoordinate(p);
  var p0 = e.getGeometry().getFirstCoordinate();
  var p1 = e.getGeometry().getLastCoordinate();
  if (ol.coordinate.dist2d(p, p0) < ol.coordinate.dist2d(p, p1)) return p0;
  else return p1;
};
/** Calculate a path beetween 2 points
 * @param {ol/coordinate} start
 * @param {ol/coordinate} end
 * @return {boolean|Array<ol/coordinate>} false if don't start (still running) or start and end nodes
 */
ol.graph.Dijskra.prototype.path = function(start, end) {
  if (this.running) return false;
  // Starting nodes
  start = this.closestCoordinate(start);
  this.end = this.closestCoordinate(end);
  if (start[0]===this.end[0] 
    && start[1]===this.end[1]) {
      this.dispatchEvent({
        type: 'finish',
        route: [],
        wDistance: -1,
        distance: this.wdist
      });
      return false;
    }
  // Initialize
  var self = this;
  this.nodes.clear();
  this.candidat = [];
  this.wdist = 0;
  this.running = true;
  // Starting point
  this.addNode(start, 0);
  // Arrival
  this.arrival = this.addNode(this.end, -1);
  // Start
  this.nb = 0;
  this.dispatchEvent({
    type: 'start'
  });
  setTimeout(function() { self._resume(); });
  return [start, this.end];
};
/** Restart after pause
 */
ol.graph.Dijskra.prototype.resume = function() {
  if (this.running) return;
  if (this.candidat.length) {
    this.running = true;
    this.nb = 0;
    this._resume();
  }
};
/** Pause 
 */
ol.graph.Dijskra.prototype.pause = function() {
  if (!this.running) return;
  this.nb = -1;
};
/** Get the current 'best way'.
 * This may be used to animate while calculating.
 * @return {Array<ol/Feature>}
 */
ol.graph.Dijskra.prototype.getBestWay = function() {
  var node, max = -1;
  for (var i=0, n; n = this.candidat[i]; i++) {
    if (n.get('wdist') > max) {
      node = n;
      max = n.get('wdist');
    }
  }
  // Calculate route to this node
  return this.getRoute(node);
};
/** Go on searching new candidats
 * @private
 */
ol.graph.Dijskra.prototype._resume = function() {
  if (!this.running) return;
  while (this.candidat.length) {
    // Sort by wdist
    this.candidat.sort (function(a,b) {
      return (a.get('dtotal') < b.get('dtotal') ? 1 : a.get('dtotal')===b.get('dtotal') ? 0 : -1);
    });
    // First candidate
    var node = this.candidat.pop();
    var p = node.getGeometry().getCoordinates();
    // Find connected edges
    var edges = this.getEdges(p);
    for (var i=0, e; e=edges[i]; i++) {
      if (node.get('from')!==e) {
        var dist = this.getLength (e);
        if (dist < 0) {
          console.log ('distance < 0!');
          // continue;
        }
        var wdist = node.get('wdist') + dist * this.weight(e);
        dist = node.get('dist') + dist;
        var pt1 = e.getGeometry().getFirstCoordinate();
        var pt2 = e.getGeometry().getLastCoordinate();
        var sens = this.direction(e);
        if (sens!==0) {
          if (p[0]===pt1[0] && p[1]===pt1[1] && sens!==-1) {
            this.addNode(pt2, wdist, dist, e, node);
          }
          if (p[0]===pt2[0] && p[0]===pt2[0] && sens!==1) {
            this.addNode(pt1, wdist, dist, e, node);
          }
        }
      }
      // Test overflow or pause
      if (this.nb === -1 || this.nb++ > this.maxIteration) {
        this.running = false;
        this.dispatchEvent({
          type: 'pause',
          overflow: (this.nb !== -1)
        });
        return;
      }
      // Take time to do something
      if (!(this.nb % this.stepIteration)){
        var self = this;
        window.setTimeout(function() { self._resume() }, 5);
        this.dispatchEvent({
          type: 'calculating'
        });
        return;
      }
    }
  }
  // Finish!
  this.nodes.clear();
  this.running = false;
  this.dispatchEvent({
    type: 'finish',
    route: this.getRoute(this.arrival),
    wDistance: this.wdist,
    distance: this.arrival.get('dist')
  });
};
/** Get the route to a node
 * @param {ol/Feature} node
 * @return {Array<ol/Feature>}
 * @private
 */
ol.graph.Dijskra.prototype.getRoute = function(node) {
  var route = [];
  while (node) {
    route.unshift(node.get('from'));
    node = node.get('prev');
  }
  route.shift();
  return route;
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  Usefull function to handle geometric operations
*/
/** Distance beetween 2 points
 *	Usefull geometric functions
 * @param {ol.Coordinate} p1 first point
 * @param {ol.Coordinate} p2 second point
 * @return {number} distance
 */
ol.coordinate.dist2d = function(p1, p2) {
  var dx = p1[0]-p2[0];
  var dy = p1[1]-p2[1];
  return Math.sqrt(dx*dx+dy*dy);
}
/** 2 points are equal
 *	Usefull geometric functions
 * @param {ol.Coordinate} p1 first point
 * @param {ol.Coordinate} p2 second point
 * @return {boolean}
 */
ol.coordinate.equal = function(p1, p2) {
  return (p1[0]==p2[0] && p1[1]==p2[1]);
}
/** Get center coordinate of a feature
 * @param {ol.Feature} f
 * @return {ol.coordinate} the center
 */
ol.coordinate.getFeatureCenter = function(f) {
  return ol.coordinate.getGeomCenter (f.getGeometry());
};
/** Get center coordinate of a geometry
* @param {ol.Feature} geom
* @return {ol.Coordinate} the center
*/
ol.coordinate.getGeomCenter = function(geom) {
  switch (geom.getType()) {
    case 'Point': 
      return geom.getCoordinates();
    case "MultiPolygon":
            geom = geom.getPolygon(0);
            // fallthrough
    case "Polygon":
      return geom.getInteriorPoint().getCoordinates();
    default:
      return geom.getClosestPoint(ol.extent.getCenter(geom.getExtent()));
  }
};
/** Offset a polyline
 * @param {Array<ol.Coordinate>} coords
 * @param {number} offset
 * @return {Array<ol.Coordinate>} resulting coord
 * @see http://stackoverflow.com/a/11970006/796832
 * @see https://drive.google.com/viewerng/viewer?a=v&pid=sites&srcid=ZGVmYXVsdGRvbWFpbnxqa2dhZGdldHN0b3JlfGd4OjQ4MzI5M2Y0MjNmNzI2MjY
 */
ol.coordinate.offsetCoords = function (coords, offset) {
  var path = [];
  var N = coords.length-1;
  var max = N;
  var mi, mi1, li, li1, ri, ri1, si, si1, Xi1, Yi1;
  var p0, p1, p2;
  var isClosed = ol.coordinate.equal(coords[0],coords[N]);
  if (!isClosed) {
    p0 = coords[0];
    p1 = coords[1];
    p2 = [
      p0[0] + (p1[1] - p0[1]) / ol.coordinate.dist2d(p0,p1) *offset,
      p0[1] - (p1[0] - p0[0]) / ol.coordinate.dist2d(p0,p1) *offset
    ];
    path.push(p2);
    coords.push(coords[N])
    N++;
    max--;
  }
  for (var i = 0; i < max; i++) {
    p0 = coords[i];
    p1 = coords[(i+1) % N];
    p2 = coords[(i+2) % N];
    mi = (p1[1] - p0[1])/(p1[0] - p0[0]);
    mi1 = (p2[1] - p1[1])/(p2[0] - p1[0]);
    // Prevent alignements
    if (Math.abs(mi-mi1) > 1e-10) {
      li = Math.sqrt((p1[0] - p0[0])*(p1[0] - p0[0])+(p1[1] - p0[1])*(p1[1] - p0[1]));
      li1 = Math.sqrt((p2[0] - p1[0])*(p2[0] - p1[0])+(p2[1] - p1[1])*(p2[1] - p1[1]));
      ri = p0[0] + offset*(p1[1] - p0[1])/li;
      ri1 = p1[0] + offset*(p2[1] - p1[1])/li1;
      si = p0[1] - offset*(p1[0] - p0[0])/li;
      si1 = p1[1] - offset*(p2[0] - p1[0])/li1;
      Xi1 = (mi1*ri1-mi*ri+si-si1) / (mi1-mi);
      Yi1 = (mi*mi1*(ri1-ri)+mi1*si-mi*si1) / (mi1-mi);
      // Correction for vertical lines
      if(p1[0] - p0[0] == 0) {
        Xi1 = p1[0] + offset*(p1[1] - p0[1])/Math.abs(p1[1] - p0[1]);
        Yi1 = mi1*Xi1 - mi1*ri1 + si1;
      }
      if (p2[0] - p1[0] == 0 ) {
        Xi1 = p2[0] + offset*(p2[1] - p1[1])/Math.abs(p2[1] - p1[1]);
        Yi1 = mi*Xi1 - mi*ri + si;
      }
      path.push([Xi1, Yi1]);
    }
  }
  if (isClosed) {
    path.push(path[0]);
  } else {
    coords.pop();
    p0 = coords[coords.length-1];
    p1 = coords[coords.length-2];
    p2 = [
      p0[0] - (p1[1] - p0[1]) / ol.coordinate.dist2d(p0,p1) *offset,
      p0[1] + (p1[0] - p0[0]) / ol.coordinate.dist2d(p0,p1) *offset
    ];
    path.push(p2);
  }
  return path;
}
/** Find the segment a point belongs to
 * @param {ol.Coordinate} pt
 * @param {Array<ol.Coordinate>} coords
 * @return {} the index (-1 if not found) and the segment
 */
ol.coordinate.findSegment = function (pt, coords) {
  for (var i=0; i<coords.length-1; i++) {
    var p0 = coords[i];
    var p1 = coords[i+1];
    if (ol.coordinate.equal(pt, p0) || ol.coordinate.equal(pt, p1)) {
      return { index:1, segment: [p0,p1] };
    } else {
      var d0 = ol.coordinate.dist2d(p0,p1);
      var v0 = [ (p1[0] - p0[0]) / d0, (p1[1] - p0[1]) / d0 ];
      var d1 = ol.coordinate.dist2d(p0,pt);
      var v1 = [ (pt[0] - p0[0]) / d1, (pt[1] - p0[1]) / d1 ];
      if (Math.abs(v0[0]*v1[1] - v0[1]*v1[0]) < 1e-10) {
        return { index:1, segment: [p0,p1] };
      }
    }
  }
  return { index: -1 };
};
/**
 * Split a Polygon geom with horizontal lines
 * @param {Array<ol.Coordinate>} geom
 * @param {number} y the y to split
 * @param {number} n contour index
 * @return {Array<Array<ol.Coordinate>>}
 */
ol.coordinate.splitH = function (geom, y, n) {
  var x, abs;
  var list = [];
  for (var i=0; i<geom.length-1; i++) {
    // Hole separator?
    if (!geom[i].length || !geom[i+1].length) continue;
    // Intersect
    if (geom[i][1]<=y && geom[i+1][1]>y || geom[i][1]>=y && geom[i+1][1]<y) {
      abs = (y-geom[i][1]) / (geom[i+1][1]-geom[i][1]);
      x = abs * (geom[i+1][0]-geom[i][0]) + geom[i][0];
      list.push ({ contour: n, index: i, pt: [x,y], abs: abs });
    }
  }
  // Sort x
  list.sort(function(a,b) { return a.pt[0] - b.pt[0] });
  // Horizontal segment
  var result = [];
  for (var j=0; j<list.length-1; j += 2) {
    result.push([list[j], list[j+1]])
  }
  return result;
};
/** Create a geometry given a type and coordinates */
ol.geom.createFromType = function (type, coordinates) {
  switch (type) {
    case 'LineString': return new ol.geom.LineString(coordinates);
    case 'LinearRing': return new ol.geom.LinearRing(coordinates);
    case 'MultiLineString': return new ol.geom.MultiLineString(coordinates);
    case 'MultiPoint': return new ol.geom.MultiPoint(coordinates);
    case 'MultiPolygon': return new ol.geom.MultiPolygon(coordinates);
    case 'Point': return new ol.geom.Point(coordinates);
    case 'Polygon': return new ol.geom.Polygon(coordinates);
    default:
      console.error('[createFromType] Unsupported type: '+type);
      return null;
  }
};

/** Split a lineString by a point or a list of points
 *	NB: points must be on the line, use getClosestPoint() to get one
* @param {ol.Coordinate | Array<ol.Coordinate>} pt points to split the line
* @param {Number} tol distance tolerance for 2 points to be equal
*/
ol.geom.LineString.prototype.splitAt = function(pt, tol) {
  var i;
  if (!pt) return [this];
    if (!tol) tol = 1e-10;
    // Test if list of points
    if (pt.length && pt[0].length) {
      var result = [this];
      for (i=0; i<pt.length; i++) {
        var r = [];
        for (var k=0; k<result.length; k++) {
          var ri = result[k].splitAt(pt[i], tol);
          r = r.concat(ri);
        }
        result = r;
      }
      return result;
    }
    // Nothing to do
    if (ol.coordinate.equal(pt,this.getFirstCoordinate())
    || ol.coordinate.equal(pt,this.getLastCoordinate())) {
      return [this];
    }
    // Get
    var c0 = this.getCoordinates();
    var ci=[c0[0]];
    var c = [];
    for (i=0; i<c0.length-1; i++) {
      // Filter equal points
      if (ol.coordinate.equal(c0[i],c0[i+1])) continue;
      // Extremity found
      if (ol.coordinate.equal(pt,c0[i+1])) {
        ci.push(c0[i+1]);
        c.push(new ol.geom.LineString(ci));
        ci = [];
      }
      // Test alignement
      else if (!ol.coordinate.equal(pt,c0[i])) {
        var d1, d2, split=false;
        if (c0[i][0] == c0[i+1][0]) {
          d1 = (c0[i][1]-pt[1]) / (c0[i][1]-c0[i+1][1]);
          split = (c0[i][0] == pt[0]) && (0 < d1 && d1 <= 1)
        } else if (c0[i][1] == c0[i+1][1]) {
          d1 = (c0[i][0]-pt[0]) / (c0[i][0]-c0[i+1][0]);
          split = (c0[i][1] == pt[1]) && (0 < d1 && d1 <= 1)
        } else {
          d1 = (c0[i][0]-pt[0]) / (c0[i][0]-c0[i+1][0]);
          d2 = (c0[i][1]-pt[1]) / (c0[i][1]-c0[i+1][1]);
          split = (Math.abs(d1-d2) <= tol && 0 < d1 && d1 <= 1)
        }
        // pt is inside the segment > split
        if (split) {
          ci.push(pt);
          c.push (new ol.geom.LineString(ci));
          ci = [pt];
        }
      }
      ci.push(c0[i+1]);
    }
    if (ci.length>1) c.push (new ol.geom.LineString(ci));
    if (c.length) return c;
    else return [this];
}
// import('ol-ext/geom/LineStringSplitAt')
/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	Usefull function to handle geometric operations
*/
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
/**
 * Calculate a MultiPolyline to fill a Polygon with a scribble effect that appears hand-made
 * @param {} options
 *  @param {Number} options.interval interval beetween lines
 *  @param {Number} options.angle hatch angle in radian, default PI/2
 * @return {ol.geom.MultiLineString|null} the resulting MultiLineString geometry or null if none
 */
ol.geom.MultiPolygon.prototype.scribbleFill = function (options) {
  var scribbles = [];
  var poly = this.getPolygons();
  var i, p, s;
  for (i=0; p=poly[i]; i++) {
    var mls = p.scribbleFill(options);
    if (mls) scribbles.push(mls);
  } 
  if (!scribbles.length) return null;
  // Merge scribbles
  var scribble = scribbles[0];
    var ls;
    for (i = 0; s = scribbles[i]; i++) {
        ls = s.getLineStrings();
        for (var k = 0; k < ls.length; k++) {
            scribble.appendLineString(ls[k]);
        }
    }
  return scribble;
};
/**
 * Calculate a MultiPolyline to fill a Polygon with a scribble effect that appears hand-made
 * @param {} options
 *  @param {Number} options.interval interval beetween lines
 *  @param {Number} options.angle hatch angle in radian, default PI/2
 * @return {ol.geom.MultiLineString|null} the resulting MultiLineString geometry or null if none
 */
ol.geom.Polygon.prototype.scribbleFill = function (options) {
	var step = options.interval;
  var angle = options.angle || Math.PI/2;
  var i, k,l;
  // Geometry + rotate
	var geom = this.clone();
	geom.rotate(angle, [0,0]);
  var coords = geom.getCoordinates();
  // Merge holes
  var coord = coords[0];
  for (i=1; i<coords.length; i++) {
    // Add a separator
    coord.push([]);
    // Add the hole
    coord = coord.concat(coords[i]);
  }
  // Extent 
	var ext = geom.getExtent();
	// Split polygon with horizontal lines
  var lines = [];
	for (var y = (Math.floor(ext[1]/step)+1)*step; y<ext[3]; y += step) {
    l = ol.coordinate.splitH(coord, y, i);
    lines = lines.concat(l);
  }
  if (!lines.length) return null;
  // Order lines on segment index
  var mod = coord.length-1;
	var first = lines[0][0].index;
	for (k=0; l=lines[k]; k++) {
		lines[k][0].index = (lines[k][0].index-first+mod) % mod;
		lines[k][1].index = (lines[k][1].index-first+mod) % mod;
	}
  var scribble = [];
  while (true) {
    for (k=0; l=lines[k]; k++) {
      if (!l[0].done) break;
    }
    if (!l) break;
    var scrib = [];
    while (l) {
      l[0].done = true;
      scrib.push(l[0].pt);
      scrib.push(l[1].pt);
      var nexty = l[0].pt[1] + step;
      var d0 = Infinity;
      var l2 = null;
      while (lines[k]) {
        if (lines[k][0].pt[1] > nexty) break;
        if (lines[k][0].pt[1] === nexty) {
          var d = Math.min(
            (lines[k][0].index - l[0].index + mod) % mod,
            (l[0].index - lines[k][0].index + mod) % mod
          );
          var d2 = Math.min(
            (l[1].index - l[0].index + mod) % mod,
            (l[0].index - l[1].index + mod) % mod
          );
          if (d<d0 && d<d2) {
            d0 = d;
            if (!lines[k][0].done) l2 = lines[k];
            else l2 = null;
          }
        }
        k++;
      }
      l = l2;
    }
    if (scrib.length) {
      scribble.push(scrib);
    }
  }
  // Return the scribble as MultiLineString
  if (!scribble.length) return null;
  var mline = new ol.geom.MultiLineString(scribble);
  mline.rotate(-angle,[0,0]);
	return mline.cspline({ pointsPerSeg:8, tension:.9 });
};
// import('ol-ext/geom/Scribble')
/** Compute great circle bearing of two points.
 * @See http://www.movable-type.co.uk/scripts/latlong.html for the original code
 * @param {ol.coordinate} origin origin in lonlat
 * @param {ol.coordinate} destination destination in lonlat
 * @return {number} bearing angle in radian
 */
ol.sphere.greatCircleBearing = function(origin, destination) {
  var toRad = Math.PI/180;
  var ori = [ origin[0]*toRad, origin[1]*toRad ];
  var dest = [ destination[0]*toRad, destination[1]*toRad ];
  var bearing = Math.atan2(
    Math.sin(dest[0] - ori[0]) * Math.cos(dest[1]),
    Math.cos(ori[1]) * Math.sin(dest[1]) - Math.sin(ori[1]) * Math.cos(dest[1]) * Math.cos(dest[0] - ori[0])
  );
  return bearing;
};
/** 
 * Computes the destination point given an initial point, a distance and a bearing
 * @See http://www.movable-type.co.uk/scripts/latlong.html for the original code
 * @param {ol.coordinate} origin stating point in lonlat coords
 * @param {number} distance
 * @param {number} bearing bearing angle in radian
 * @param {*} options
 *  @param {booelan} normalize normalize longitude beetween -180/180, deafulet true
 *  @param {number|undefined} options.radius sphere radius, default 6371008.8
 */
ol.sphere.computeDestinationPoint = function(origin, distance, bearing, options) {
  options = options || {};
  var toRad = Math.PI/180;
  var radius = options.radius || 6371008.8;
  var phi1 = origin[1] * toRad;
  var lambda1 = origin[0] * toRad;
  var delta = distance / radius;
  var phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(delta) +
    Math.cos(phi1) * Math.sin(delta) * Math.cos(bearing)
  );
  var lambda2 = lambda1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2)
    );
  var lon = lambda2 / toRad;
  // normalise to >=-180 and <=180° 
  if (options.normalize!==false && (lon < -180 || lon > 180)) {
    lon = ((lon * 540) % 360) - 180;
  }
  return [ lon, phi2 / toRad ];
};
/** Calculate a track along the great circle given an origin and a destination
 * @param {ol.coordinate} origin origin in lonlat
 * @param {ol.coordinate} destination destination in lonlat
 * @param {number} distance distance between point along the track in meter, default 1km (1000)
 * @param {number|undefined} radius sphere radius, default 6371008.8
 * @return {Array<ol.coordinate>}
 */
ol.sphere.greatCircleTrack = function(origin, destination, options) {
  options = options || {};
  var bearing = ol.sphere.greatCircleBearing(origin, destination);
  var dist = ol.sphere.getDistance(origin, destination, options.radius);
  var distance = options.distance || 1000;
  var d = distance;
  var geom = [origin];
  while (d < dist) {
    geom.push(ol.sphere.computeDestinationPoint(origin, d, bearing, { radius: options.radius, normalize: false }));
    d += distance;
  }
  var pt = ol.sphere.computeDestinationPoint(origin, dist, bearing, { radius: options.radius, normalize: false });
  if (Math.abs(pt[0]-destination[0]) > 1) {
    if (pt[0] > destination[0]) destination[0] += 360;
    else destination[0] -= 360;
  } 
  geom.push(destination);
  return geom;
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Pulse an extent on postcompose
*	@param {ol.coordinates} point to pulse
*	@param {ol.pulse.options} options pulse options param
*	  @param {ol.projectionLike|undefined} options.projection projection of coords, default no transform
*	  @param {Number} options.duration animation duration in ms, default 2000
*	  @param {ol.easing} options.easing easing function, default ol.easing.upAndDown
*	  @param {ol.style.Stroke} options.style stroke style, default 2px red
*/
ol.Map.prototype.animExtent = function(extent, options)
{	var listenerKey;
	options = options || {};
	// Change to map's projection
	if (options.projection)
	{	extent = ol.proj.transformExtent (extent, options.projection, this.getView().getProjection());
	}
	// options
	var start = new Date().getTime();
	var duration = options.duration || 1000;
	var easing = options.easing || ol.easing.upAndDown;
	var width = options.style ? options.style.getWidth() || 2 : 2;
	var color = options.style ? options.style.getColr() || 'red' : 'red';
	// Animate function
	function animate(event) 
	{	var frameState = event.frameState;
		var ratio = frameState.pixelRatio;
		var elapsed = frameState.time - start;
		if (elapsed > duration) ol.Observable.unByKey(listenerKey);
		else
		{	var elapsedRatio = elapsed / duration;
			var p0 = this.getPixelFromCoordinate([extent[0],extent[1]]);
			var p1 = this.getPixelFromCoordinate([extent[2],extent[3]]);
			var context = event.context;
			context.save();
			context.scale(ratio,ratio);
			context.beginPath();
			// var e = easing(elapsedRatio)
			context.globalAlpha = easing(1 - elapsedRatio);
			context.lineWidth = width;
			context.strokeStyle = color;
			context.rect(p0[0], p0[1], p1[0]-p0[0], p1[1]-p0[1]);
			context.stroke();
			context.restore();
			// tell OL3 to continue postcompose animation
			frameState.animate = true;
		}
	}
	// Launch animation
	listenerKey = this.on('postcompose', animate.bind(this));
	this.renderSync();
}

/** Create a cardinal spline version of this geometry.
*	Original https://github.com/epistemex/cardinal-spline-js
*	@see https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Cardinal_spline
*
* @param {} options
*	@param {Number} options.tension a [0,1] number / can be interpreted as the "length" of the tangent, default 0.5
*	@param {Number} options.resolution size of segment to split
*	@param {Interger} options.pointsPerSeg number of points per segment to add if no resolution is provided, default add 10 points per segment
*/
/** Cache cspline calculation
*/
ol.geom.Geometry.prototype.cspline = function(options)
{	// Calculate cspline
	if (this.calcCSpline_)
	{	if (this.csplineGeometryRevision != this.getRevision() 
			|| this.csplineOption != JSON.stringify(options))
		{	this.csplineGeometry_ = this.calcCSpline_(options)
			this.csplineGeometryRevision = this.getRevision();
			this.csplineOption = JSON.stringify(options);
		}
		return this.csplineGeometry_;
	}
	// Default do nothing
	else
	{	return this;
	}
}
ol.geom.GeometryCollection.prototype.calcCSpline_ = function(options)
{	var g=[], g0=this.getGeometries();
	for (var i=0; i<g0.length; i++)
	{	g.push(g0[i].cspline(options));
	}
	return new ol.geom.GeometryCollection(g);
}
ol.geom.MultiLineString.prototype.calcCSpline_ = function(options)
{	var g=[], lines = this.getLineStrings();
	for (var i=0; i<lines.length; i++)
	{	g.push(lines[i].cspline(options).getCoordinates());
	}
	return new ol.geom.MultiLineString(g);
}
ol.geom.Polygon.prototype.calcCSpline_ = function(options)
{	var g=[], g0=this.getCoordinates();
	for (var i=0; i<g0.length; i++)
	{	g.push((new ol.geom.LineString(g0[i])).cspline(options).getCoordinates());
	}
	return new ol.geom.Polygon(g);
}
ol.geom.MultiPolygon.prototype.calcCSpline_ = function(options)
{	var g=[], g0=this.getPolygons();
	for (var i=0; i<g0.length; i++)
	{	g.push(g0[i].cspline(options).getCoordinates());
	}
	return new ol.geom.MultiPolygon(g);
}
/**
*/
ol.geom.LineString.prototype.calcCSpline_ = function(options)
 {	if (!options) options={};
	var line = this.getCoordinates();
	var tension = typeof options.tension === "number" ? options.tension : 0.5;
	var resolution = options.resolution || (this.getLength() / line.length / (options.pointsPerSeg || 10));
	var pts, res = [],			// clone array
		x, y,					// our x,y coords
		t1x, t2x, t1y, t2y,		// tension vectors
		c1, c2, c3, c4,			// cardinal points
		st, t, i;				// steps based on num. of segments
	// clone array so we don't change the original
	//
	pts = line.slice(0);
	// The algorithm require a previous and next point to the actual point array.
	// Check if we will draw closed or open curve.
	// If closed, copy end points to beginning and first points to end
	// If open, duplicate first points to befinning, end points to end
	if (line.length>2 && line[0][0]==line[line.length-1][0] && line[0][1]==line[line.length-1][1]) 
	{	pts.unshift(line[line.length-2]);
		pts.push(line[1]);
	}
	else 
	{	pts.unshift(line[0]);
		pts.push(line[line.length-1]);
	}
	// ok, lets start..
	function dist2d(x1, y1, x2, y2)
	{	var dx = x2-x1;
		var dy = y2-y1;
		return Math.sqrt(dx*dx+dy*dy);
	}
	// 1. loop goes through point array
	// 2. loop goes through each segment between the 2 pts + 1e point before and after
	for (i=1; i < (pts.length - 2); i++) 
	{	var d1 = dist2d (pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1]);
		var numOfSegments = Math.round(d1/resolution);
		var d=1;
		if (options.normalize)
		{	d1 = dist2d (pts[i+1][0], pts[i+1][1], pts[i-1][0], pts[i-1][1]);
			var d2 = dist2d (pts[i+2][0], pts[i+2][1], pts[i][0], pts[i][1]);
			if (d1<d2) d = d1/d2;
			else d = d2/d1;
		}
		// calc tension vectors
		t1x = (pts[i+1][0] - pts[i-1][0]) * tension *d;
		t2x = (pts[i+2][0] - pts[i][0]) * tension *d;
		t1y = (pts[i+1][1] - pts[i-1][1]) * tension *d;
		t2y = (pts[i+2][1] - pts[i][1]) * tension *d;
		for (t=0; t <= numOfSegments; t++) 
		{	// calc step
			st = t / numOfSegments;
			// calc cardinals
			c1 =   2 * Math.pow(st, 3) 	- 3 * Math.pow(st, 2) + 1; 
			c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2); 
			c3 = 	   Math.pow(st, 3)	- 2 * Math.pow(st, 2) + st; 
			c4 = 	   Math.pow(st, 3)	- 	  Math.pow(st, 2);
			// calc x and y cords with common control vectors
			x = c1 * pts[i][0]	+ c2 * pts[i+1][0] + c3 * t1x + c4 * t2x;
			y = c1 * pts[i][1]	+ c2 * pts[i+1][1] + c3 * t1y + c4 * t2y;
			//store points in array
			if (x && y) res.push([x,y]);
		}
	}
	return new ol.geom.LineString(res);
}
//NB: (Not confirmed)To use this module, you just have to :
//   import('ol-ext/utils/cspline')
/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** @typedef {'pointy' | 'flat'} HexagonLayout
 *  Layout of a Hexagon. Flat means the bottom part of the hexagon is flat.
 */
/**
* Hexagonal grids
* @classdesc ol.HexGrid is a class to compute hexagonal grids
* @see http://www.redblobgames.com/grids/hexagons
*
* @constructor ol.HexGrid
* @extends {ol.Object}
* @param {Object} [options]
*	@param {number} [options.size] size of the exagon in map units, default 80000
*	@param {ol.Coordinate} [options.origin] orgin of the grid, default [0,0]
*	@param {HexagonLayout} [options.layout] grid layout, default pointy
*/
ol.HexGrid = function (options)
{	options = options || {};
	ol.Object.call (this, options);
	// Options
	this.size_ = options.size||80000;
	this.origin_ = options.origin || [0,0];
	this.layout_ = this.layout[options.layout] || this.layout.pointy;
};
ol.ext.inherits(ol.HexGrid, ol.Object);
/** Layout
*/
ol.HexGrid.prototype.layout =
{	pointy: 
	[	Math.sqrt(3), Math.sqrt(3)/2, 0, 3/2, 
		Math.sqrt(3)/3, -1/3, 0, 2/3, 
		// corners
		Math.cos(Math.PI / 180 * (60 * 0 + 30)), Math.sin(Math.PI / 180 * (60 * 0 + 30)), 
		Math.cos(Math.PI / 180 * (60 * 1 + 30)), Math.sin(Math.PI / 180 * (60 * 1 + 30)), 
		Math.cos(Math.PI / 180 * (60 * 2 + 30)), Math.sin(Math.PI / 180 * (60 * 2 + 30)), 
		Math.cos(Math.PI / 180 * (60 * 3 + 30)), Math.sin(Math.PI / 180 * (60 * 3 + 30)), 
		Math.cos(Math.PI / 180 * (60 * 4 + 30)), Math.sin(Math.PI / 180 * (60 * 4 + 30)), 
		Math.cos(Math.PI / 180 * (60 * 5 + 30)), Math.sin(Math.PI / 180 * (60 * 5 + 30))
	],
	flat: 
	[	3/2, 0, Math.sqrt(3)/2, Math.sqrt(3), 2/3, 
		0, -1/3, Math.sqrt(3) / 3, 
		// corners
		Math.cos(Math.PI / 180 * (60 * 0)), Math.sin(Math.PI / 180 * (60 * 0)), 
		Math.cos(Math.PI / 180 * (60 * 1)), Math.sin(Math.PI / 180 * (60 * 1)), 
		Math.cos(Math.PI / 180 * (60 * 2)), Math.sin(Math.PI / 180 * (60 * 2)), 
		Math.cos(Math.PI / 180 * (60 * 3)), Math.sin(Math.PI / 180 * (60 * 3)), 
		Math.cos(Math.PI / 180 * (60 * 4)), Math.sin(Math.PI / 180 * (60 * 4)), 
		Math.cos(Math.PI / 180 * (60 * 5)), Math.sin(Math.PI / 180 * (60 * 5))
	]
};
/** Set layout
* @param {HexagonLayout | undefined} layout name, default pointy
*/
ol.HexGrid.prototype.setLayout = function (layout)
{	this.layout_ = this.layout[layout] || this.layout.pointy;
	this.changed();
}
/** Get layout
* @return {HexagonLayout} layout name
*/
ol.HexGrid.prototype.getLayout = function ()
{	return (this.layout_[9]!=0 ? 'pointy' : 'flat');
}
/** Set hexagon origin
* @param {ol.Coordinate} coord origin
*/
ol.HexGrid.prototype.setOrigin = function (coord)
{	this.origin_ = coord;
	this.changed();
}
/** Get hexagon origin
* @return {ol.Coordinate} coord origin
*/
ol.HexGrid.prototype.getOrigin = function ()
{	return this.origin_;
}
/** Set hexagon size
* @param {number} hexagon size
*/
ol.HexGrid.prototype.setSize = function (s) {
	this.size_ = s || 80000;
	this.changed();
}
/** Get hexagon size
* @return {number} hexagon size
*/
ol.HexGrid.prototype.getSize = function () {
	return this.size_;
}
/** Convert cube to axial coords
* @param {ol.Coordinate} c cube coordinate
* @return {ol.Coordinate} axial coordinate
*/
ol.HexGrid.prototype.cube2hex = function (c)
{	return [c[0], c[2]];
};
/** Convert axial to cube coords
* @param {ol.Coordinate} h axial coordinate
* @return {ol.Coordinate} cube coordinate
*/
ol.HexGrid.prototype.hex2cube = function(h)
{	return [h[0], -h[0]-h[1], h[1]];
};
/** Convert offset to axial coords
* @param {ol.Coordinate} h axial coordinate
* @return {ol.Coordinate} offset coordinate
*/
ol.HexGrid.prototype.hex2offset = function (h)
{	if (this.layout_[9]) return [ h[0] + (h[1] - (h[1]&1)) / 2, h[1] ];
	else return [ h[0], h[1] + (h[0] + (h[0]&1)) / 2 ];
}
/** Convert axial to offset coords
* @param {ol.Coordinate} o offset coordinate
* @return {ol.Coordinate} axial coordinate
*/
ol.HexGrid.prototype.offset2hex = function(o)
{	if (this.layout_[9]) return [ o[0] - (o[1] - (o[1]&1)) / 2,  o[1] ];
	else return [ o[0], o[1] - (o[0] + (o[0]&1)) / 2 ];
}
/** Convert offset to cube coords
* @param {ol.Coordinate} c cube coordinate
* @return {ol.Coordinate} offset coordinate
* /
ol.HexGrid.prototype.cube2offset = function(c)
{	return hex2offset(cube2hex(c));
};
/** Convert cube to offset coords
* @param {ol.Coordinate} o offset coordinate
* @return {ol.Coordinate} cube coordinate
* /
ol.HexGrid.prototype.offset2cube = function (o)
{	return hex2cube(offset2Hex(o));
};
/** Round cube coords
* @param {ol.Coordinate} h cube coordinate
* @return {ol.Coordinate} rounded cube coordinate
*/
ol.HexGrid.prototype.cube_round = function(h)
{	var rx = Math.round(h[0])
	var ry = Math.round(h[1])
	var rz = Math.round(h[2])
	var x_diff = Math.abs(rx - h[0])
	var y_diff = Math.abs(ry - h[1])
	var z_diff = Math.abs(rz - h[2])
	if (x_diff > y_diff && x_diff > z_diff) rx = -ry-rz
	else if (y_diff > z_diff) ry = -rx-rz
	else rz = -rx-ry
	return [rx, ry, rz];
};
/** Round axial coords
* @param {ol.Coordinate} h axial coordinate
* @return {ol.Coordinate} rounded axial coordinate
*/
ol.HexGrid.prototype.hex_round = function(h)
{	return this.cube2hex( this.cube_round( this.hex2cube(h )) );
};
/** Get hexagon corners
*/
ol.HexGrid.prototype.hex_corner = function(center, size, i)
{	return [ center[0] + size * this.layout_[8+(2*(i%6))], center[1] + size * this.layout_[9+(2*(i%6))]];
};
/** Get hexagon coordinates at a coordinate
* @param {ol.Coordinate} coord
* @return {Arrary<ol.Coordinate>}
*/
ol.HexGrid.prototype.getHexagonAtCoord = function (coord)
{	return (this.getHexagon(this.coord2hex(coord)));
};
/** Get hexagon coordinates at hex
* @param {ol.Coordinate} hex
* @return {Arrary<ol.Coordinate>}
*/
ol.HexGrid.prototype.getHexagon = function (hex)
{	var p = [];
	var c = this.hex2coord(hex);
	for (var i=0; i<=7; i++)
	{	p.push(this.hex_corner(c, this.size_, i, this.layout_[8]));
	}
	return p;
};
/** Convert hex to coord
* @param {ol.hex} hex
* @return {ol.Coordinate}
*/
ol.HexGrid.prototype.hex2coord = function (hex)
{	return [
		this.origin_[0] + this.size_ * (this.layout_[0] * hex[0] + this.layout_[1] * hex[1]), 
		this.origin_[1] + this.size_ * (this.layout_[2] * hex[0] + this.layout_[3] * hex[1])
	];
};
/** Convert coord to hex
* @param {ol.Coordinate} coord
* @return {ol.hex}
*/
ol.HexGrid.prototype.coord2hex = function (coord)
{	var c = [ (coord[0]-this.origin_[0]) / this.size_, (coord[1]-this.origin_[1]) / this.size_ ];
	var q = this.layout_[4] * c[0] + this.layout_[5] * c[1];
	var r = this.layout_[6] * c[0] + this.layout_[7] * c[1];
	return this.hex_round([q, r]);
};
/** Calculate distance between to hexagon (number of cube)
* @param {ol.Coordinate} a first cube coord
* @param {ol.Coordinate} a second cube coord
* @return {number} distance
*/
ol.HexGrid.prototype.cube_distance = function (a, b)
{	//return ( (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2])) / 2 );
	return ( Math.max (Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2])) );
};
(function(){
/** Line interpolation
*/
function lerp(a, b, t)
{	// for floats
    return a + (b - a) * t;
}
function cube_lerp(a, b, t)
{	// for hexes
    return [ 
		lerp (a[0]+1e-6, b[0], t), 
		lerp (a[1]+1e-6, b[1], t),
		lerp (a[2]+1e-6, b[2], t)
	];
}
/** Calculate line between to hexagon
* @param {ol.Coordinate} a first cube coord
* @param {ol.Coordinate} b second cube coord
* @return {Array<ol.Coordinate>} array of cube coordinates
*/
ol.HexGrid.prototype.cube_line = function (a, b)
{	var d = this.cube_distance(a, b);
	if (!d) return [a];
    var results = []
    for (var i=0; i<=d; i++) 
	{	results.push ( this.cube_round ( cube_lerp(a, b, i/d) ) );
	}
    return results;
};
})();
ol.HexGrid.prototype.neighbors =
{	'cube':	[ [+1, -1,  0], [+1,  0, -1], [0, +1, -1], [-1, +1,  0], [-1,  0, +1], [0, -1, +1] ],
	'hex':	[ [+1, 0], [+1,  -1], [0, -1], [-1, 0], [-1, +1], [0, +1] ]
};
/** Get the neighbors for an hexagon
* @param {ol.Coordinate} h axial coord
* @param {number} direction
* @return { ol.Coordinate | Array<ol.Coordinate> } neighbor || array of neighbors
*/
ol.HexGrid.prototype.hex_neighbors = function (h, d)
{	if (d!==undefined)
	{	return [ h[0] + this.neighbors.hex[d%6][0], h[1]  + this.neighbors.hex[d%6][1] ];
	}
	else
	{	var n = [];
		for (d=0; d<6; d++)
		{	n.push ([ h[0] + this.neighbors.hex[d][0], h[1]  + this.neighbors.hex[d][1] ]);
		}
		return n;
	}
};
/** Get the neighbors for an hexagon
* @param {ol.Coordinate} c cube coord
* @param {number} direction
* @return { ol.Coordinate | Array<ol.Coordinate> } neighbor || array of neighbors
*/
ol.HexGrid.prototype.cube_neighbors = function (c, d)
{	if (d!==undefined)
	{	return [ c[0] + this.neighbors.cube[d%6][0], c[1]  + this.neighbors.cube[d%6][1], c[2]  + this.neighbors.cube[d%6][2] ];
	}
	else
	{	var n = [];
		for (d=0; d<6; d++)
		{	n.push ([ c[0] + this.neighbors.cube[d][0], c[1]  + this.neighbors.cube[d][1], c[2]  + this.neighbors.cube[d][2] ]);
		}
		for (d=0; d<6; d++) n[d] = this.cube2hex(n[d])
		return n;
	}
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * French INSEE grids
 * @classdesc a class to compute French INSEE grids, ie. fix area (200x200m) square grid, 
 * based appon EPSG:3035
 *
 * @requires proj4
 * @constructor 
 * @extends {ol.Object}
 * @param {Object} [options]
 *  @param {number} [options.size] size grid size in meter, default 200 (200x200m)
 */
ol.InseeGrid = function (options) {
  options = options || {};
  // Define EPSG:3035 if none
  if (!proj4.defs["EPSG:3035"]) {
    proj4.defs("EPSG:3035","+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m +no_defs");
    ol.proj.proj4.register(proj4);
  }
  ol.Object.call (this, options);
  // Options
  var size = Math.max(200, Math.round((options.size||0)/200) * 200);
  this.set('size', size);
};
ol.ext.inherits (ol.InseeGrid, ol.Object);
/** Grid extent (in EPSG:3035)
 */
ol.InseeGrid.extent = [3200000,2000000,4300000,3140000];
/** Get the grid extent
 * @param {ol.proj.ProjLike} [proj='EPSG:3857']
 */
ol.InseeGrid.prototype.getExtent = function (proj) {
  return ol.proj.transformExtent(ol.InseeGrid.extent, proj||'EPSG:3035', 'EPSG:3857')
};
/** Get grid geom at coord
 * @param {ol.Coordinate} coord
 * @param {ol.proj.ProjLike} [proj='EPSG:3857']
 */
ol.InseeGrid.prototype.getGridAtCoordinate = function (coord, proj) {
  var c = ol.proj.transform(coord, proj||'EPSG:3857', 'EPSG:3035')
  var s = this.get('size');
  var x = Math.floor(c[0]/s) * s;
  var y = Math.floor(c[1]/s) * s;
  var geom = new ol.geom.Polygon([[[x,y],[x+s,y],[x+s,y+s],[x,y+s],[x,y]]]);
  geom.transform('EPSG:3035', proj||'EPSG:3857');
  return geom;
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Show a markup a point on postcompose
*	@deprecated use map.animateFeature instead
*	@param {ol.coordinates} point to pulse
*	@param {ol.markup.options} pulse options param
*		- projection {ol.projection|String|undefined} projection of coords, default none
*		- delay {Number} delay before mark fadeout
*		- maxZoom {Number} zoom when mark fadeout
*		- style {ol.style.Image|ol.style.Style|Array<ol.style.Style>} Image to draw as markup, default red circle
*	@return Unique key for the listener with a stop function to stop animation
*/
ol.Map.prototype.markup = function(coords, options)
{	var listenerKey;
	var self = this;
	options = options || {};
	// Change to map's projection
	if (options.projection)
	{	coords = ol.proj.transform(coords, options.projection, this.getView().getProjection());
	}
	// options
	var start = new Date().getTime();
	var delay = options.delay || 3000;
	var duration = 1000;
	var maxZoom = options.maxZoom || 100;
	var easing = ol.easing.easeOut;
	var style = options.style;
	if (!style) style = new ol.style.Circle({ radius:10, stroke:new ol.style.Stroke({color:'red', width:2 }) });
	if (style instanceof ol.style.Image) style = new ol.style.Style({ image: style });
	if (!(style instanceof Array)) style = [style];
	// Animate function
	function animate(event) 
	{	var frameState = event.frameState;
		var elapsed = frameState.time - start;
		if (elapsed > delay+duration) 
		{	ol.Observable.unByKey(listenerKey);
			listenerKey = null;
		}
		else 
		{	if (delay>elapsed && this.getView().getZoom()>maxZoom) delay = elapsed;
			var ratio = frameState.pixelRatio;
			var elapsedRatio = 0;
			if (elapsed > delay) elapsedRatio = (elapsed-delay) / duration;
			var context = event.context;
			context.save();
			context.beginPath();
			context.globalAlpha = easing(1 - elapsedRatio);
			for (var i=0; i<style.length; i++)
			{	var imgs = style[i].getImage();
				var sc = imgs.getScale(); 
				imgs.setScale(sc*ratio);
				event.vectorContext.setStyle(style[i]);
				event.vectorContext.drawGeometry(new ol.geom.Point(coords));
				imgs.setScale(sc);
			}
			context.restore();
			// tell OL3 to continue postcompose animation
			if (elapsed >= delay) frameState.animate = true;
		}
	}
	setTimeout (function()
		{	if (listenerKey) self.renderSync(); 
		}, delay);
	// Launch animation
	listenerKey = this.on('postcompose', animate.bind(this));
	this.renderSync();
	listenerKey.stop = function()
	{	delay = duration = 0;
		this.target.renderSync();
	};
	return listenerKey;
}
/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Ordering function for ol.layer.Vector renderOrder parameter
*	ol.ordering.fn (options)
*	It will return an ordering function (f0,f1)
*	@namespace
*/
ol.ordering = {};
/** y-Ordering
*	@return ordering function (f0,f1)
*/
ol.ordering.yOrdering = function()
{	return function(f0,f1)
	{	return f1.getGeometry().getExtent()[1] - f0.getGeometry().getExtent()[1] ;
	};
};
/** Order with a feature attribute
 * @param options
 *  @param {string} options.attribute ordering attribute, default zIndex
 *  @param {function} options.equalFn ordering function for equal values
 * @return ordering function (f0,f1)
 */
ol.ordering.zIndex = function(options)
{	if (!options) options = {};
	var attr = options.attribute || 'zIndex';
	if (options.equalFn)
	{	return function(f0,f1)
		{	if (f0.get(attr) == f1.get(attr)) return options.equalFn(f0,f1);
			else return f0.get(attr) < f1.get(attr) ? 1:-1;
		};
	}
	else
	{	return function(f0,f1)
		{	if (f0.get(attr) == f1.get(attr)) return 0;
			else return f0.get(attr) < f1.get(attr) ? 1:-1;
		};
	}
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Pulse a point on postcompose
*	@deprecated use map.animateFeature instead
*	@param {ol.coordinates} point to pulse
*	@param {ol.pulse.options} pulse options param
*		- projection {ol.projection||String} projection of coords
*		- duration {Number} animation duration in ms, default 3000
*		- amplitude {Number} movement amplitude 0: none - 0.5: start at 0.5*radius of the image - 1: max, default 1
*		- easing {ol.easing} easing function, default ol.easing.easeOut
*		- style {ol.style.Image|ol.style.Style|Array<ol.style.Style>} Image to draw as markup, default red circle
*/
ol.Map.prototype.pulse = function(coords, options)
{	var listenerKey;
	options = options || {};
	// Change to map's projection
	if (options.projection)
	{	coords = ol.proj.transform(coords, options.projection, this.getView().getProjection());
	}
	// options
	var start = new Date().getTime();
	var duration = options.duration || 3000;
	var easing = options.easing || ol.easing.easeOut;
	var style = options.style;
	if (!style) style = new ol.style.Circle({ radius:30, stroke:new ol.style.Stroke({color:'red', width:2 }) });
	if (style instanceof ol.style.Image) style = new ol.style.Style({ image: style });
	if (!(style instanceof Array)) style = [style];
	var amplitude = options.amplitude || 1;
	if (amplitude<0) amplitude=0;
	var maxRadius = options.radius || 15;
	if (maxRadius<0) maxRadius = 5;
	/*
	var minRadius = maxRadius - (options.amplitude || maxRadius); //options.minRadius || 0;
	var width = options.lineWidth || 2;
	var color = options.color || 'red';
	console.log("pulse")
	*/
	// Animate function
	function animate(event) 
	{	var frameState = event.frameState;
		var ratio = frameState.pixelRatio;
		var elapsed = frameState.time - start;
		if (elapsed > duration) ol.Observable.unByKey(listenerKey);
		else
		{	var elapsedRatio = elapsed / duration;
			var context = event.context;
			context.save();
			context.beginPath();
			var e = easing(elapsedRatio)
			context.globalAlpha = easing(1 - elapsedRatio);
			console.log("anim")
			for (var i=0; i<style.length; i++)
			{	var imgs = style[i].getImage();
				var sc = imgs.getScale(); 
				imgs.setScale(ratio*sc*(1+amplitude*(e-1)));
				event.vectorContext.setStyle(style[i]);
				event.vectorContext.drawGeometry(new ol.geom.Point(coords));
				imgs.setScale(sc);
			}
			context.restore();
			// tell OL3 to continue postcompose animation
			frameState.animate = true;
		}
	}
	// Launch animation
	listenerKey = this.on('postcompose', animate.bind(this));
	this.renderSync();
}

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*
*  Add a chart style to display charts (pies or bars) on a map 
*/
/**
 * @requires ol.style.Circle
 * @requires ol.structs.IHasChecksum
 */
/**
 * @classdesc
 * Set chart style for vector features.
 *
 * @constructor
 * @param {} options
 *	@param {String} options.type Chart type: pie,pie3D, donut or bar
 *	@param {number} options.radius Chart radius/size, default 20
 *	@param {number} options.rotation Rotation in radians (positive rotation clockwise). Default is 0.
 *	@param {bool} options.snapToPixel use integral numbers of pixels, default true
 *	@param {_ol_style_Stroke_} options.stroke stroke style
 *	@param {String|Array<ol.color>} options.colors predefined color set "classic","dark","pale","pastel","neon" / array of color string, default classic
 *	@param {number} options.offsetX X offset in px
 *	@param {number} options.offsetY Y offset in px
 *	@param {number} options.animation step in an animation sequence [0,1]
 *	@param {number} options.max maximum value for bar chart
 * @see [Statistic charts example](../../examples/map.style.chart.html)
 * @extends {ol.style.RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
ol.style.Chart = function(opt_options) {
  var options = opt_options || {};
  var strokeWidth = 0;
  if (opt_options.stroke) strokeWidth = opt_options.stroke.getWidth();
  ol.style.RegularShape.call (this, {
    radius: options.radius + strokeWidth, 
    fill: new ol.style.Fill({color: [0,0,0]}),
    rotation: options.rotation,
    snapToPixel: options.snapToPixel
  });
  if (options.scale) this.setScale(options.scale);
  this.stroke_ = options.stroke;
  this.radius_ = options.radius || 20;
  this.donutratio_ = options.donutRatio || 0.5;
  this.type_ = options.type;
  this.offset_ = [options.offsetX ? options.offsetX : 0, options.offsetY ? options.offsetY : 0];
  this.animation_ = (typeof(options.animation) == 'number') ? { animate:true, step:options.animation } : this.animation_ = { animate:false, step:1 };
  this.max_ = options.max;
  this.data_ = options.data;
  if (options.colors instanceof Array) {
    this.colors_ = options.colors;
  } else {
    this.colors_ = ol.style.Chart.colors[options.colors];
    if(!this.colors_) this.colors_ = ol.style.Chart.colors.classic;
  }
  this.renderChart_();
};
ol.ext.inherits(ol.style.Chart, ol.style.RegularShape);
/** Default color set: classic, dark, pale, pastel, neon
*/
ol.style.Chart.colors = {
  "classic":	["#ffa500","blue","red","green","cyan","magenta","yellow","#0f0"],
  "dark":		["#960","#003","#900","#060","#099","#909","#990","#090"],
  "pale":		["#fd0","#369","#f64","#3b7","#880","#b5d","#666"],
  "pastel":	["#fb4","#79c","#f66","#7d7","#acc","#fdd","#ff9","#b9b"], 
  "neon":		["#ff0","#0ff","#0f0","#f0f","#f00","#00f"]
}
/**
 * Clones the style. 
 * @return {ol.style.Chart}
 */
ol.style.Chart.prototype.clone = function() {
  var s = new ol.style.Chart({
    type: this.type_,
    radius: this.radius_,
    rotation: this.getRotation(),
    scale: this.getScale(),
    data: this.getData(),
    snapToPixel: this.getSnapToPixel ? this.getSnapToPixel() : false,
    stroke: this.stroke_,
    colors: this.colors_,
    offsetX: this.offset_[0],
    offsetY: this.offset_[1],
    animation: this.animation_
  });
  s.setScale(this.getScale());
  s.setOpacity(this.getOpacity());
  return s;
};
/** Get data associatied with the chart
*/
ol.style.Chart.prototype.getData = function() {
  return this.data_;
}
/** Set data associatied with the chart
*	@param {Array<number>}
*/
ol.style.Chart.prototype.setData = function(data) {
  this.data_ = data;
  this.renderChart_();
}
/** Get symbol radius
*/
ol.style.Chart.prototype.getRadius = function() {
  return this.radius_;
}
/** Set symbol radius
*	@param {number} symbol radius
*	@param {number} donut ratio
*/
ol.style.Chart.prototype.setRadius = function(radius, ratio) {
  this.radius_ = radius;
  this.donuratio_ = ratio || this.donuratio_;
  this.renderChart_();
}
/** Set animation step 
*	@param {false|number} false to stop animation or the step of the animation [0,1]
*/
ol.style.Chart.prototype.setAnimation = function(step) {
  if (step===false) {
    if (this.animation_.animate == false) return;
    this.animation_.animate = false;
  } else {
    if (this.animation_.step == step) return;
    this.animation_.animate = true;
    this.animation_.step = step;
  }
  this.renderChart_();
}
/** @private
*/
ol.style.Chart.prototype.renderChart_ = function() {
  var strokeStyle;
  var strokeWidth = 0;
  if (this.stroke_)  {
    strokeStyle = ol.color.asString(this.stroke_.getColor());
    strokeWidth = this.stroke_.getWidth();
  }
  // no atlas manager is used, create a new canvas
  var canvas = this.getImage();
  // draw the circle on the canvas
  var context = (canvas.getContext('2d'));
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineJoin = 'round';
  var sum=0;
  var i, c;
  for (i=0; i<this.data_.length; i++) {
    sum += this.data_[i];
  }
  // reset transform
  context.setTransform(1, 0, 0, 1, 0, 0);
  // then move to (x, y)
  context.translate(0,0);
  var step = this.animation_.animate ? this.animation_.step : 1;
  //console.log(this.animation_.step)
  // Draw pie
  switch (this.type_) {
    case "donut":
    case "pie3D":
    case "pie": {
      var a, a0 = Math.PI * (step-1.5);
      c = canvas.width/2;
      context.strokeStyle = strokeStyle;
      context.lineWidth = strokeWidth;
      context.save();
      if (this.type_=="pie3D") {
        context.translate(0, c*0.3);
        context.scale(1, 0.7);
        context.beginPath();
        context.fillStyle = "#369";
        context.arc ( c, c*1.4, this.radius_ *step, 0, 2*Math.PI);
        context.fill();
        context.stroke();
      }
      if (this.type_=="donut") {
        context.save();
        context.beginPath();
        context.rect ( 0,0,2*c,2*c );
        context.arc ( c, c, this.radius_ *step *this.donutratio_, 0, 2*Math.PI);
        context.clip("evenodd");
      }
      for (i=0; i<this.data_.length; i++) {
        context.beginPath();
        context.moveTo(c,c);
        context.fillStyle = this.colors_[i%this.colors_.length];
        a = a0 + 2*Math.PI*this.data_[i]/sum *step;
        context.arc ( c, c, this.radius_ *step, a0, a);
        context.closePath();
        context.fill();
        context.stroke();
        a0 = a;
      }
      if (this.type_=="donut") {
        context.restore();
        context.beginPath();
        context.strokeStyle = strokeStyle;
        context.lineWidth = strokeWidth;
        context.arc ( c, c, this.radius_ *step *this.donutratio_, Math.PI * (step-1.5), a0);
        context.stroke();
      }
      context.restore();
      break;
    }
    case "bar":
    default: {
      var max=0;
      if (this.max_) {
        max = this.max_;
      } else {
        for (i=0; i<this.data_.length; i++) {
          if (max < this.data_[i]) max = this.data_[i];
        }
      }
      var s = Math.min(5,2*this.radius_/this.data_.length);
      c = canvas.width/2;
      var b = canvas.width - strokeWidth;
      var x, x0 = c - this.data_.length*s/2
      context.strokeStyle = strokeStyle;
      context.lineWidth = strokeWidth;
      for (i=0; i<this.data_.length; i++) {
        context.beginPath();
        context.fillStyle = this.colors_[i%this.colors_.length];
        x = x0 + s;
        var h = this.data_[i]/max*2*this.radius_ *step;
        context.rect ( x0, b-h, s, h);
        //console.log ( x0+", "+(b-this.data_[i]/max*2*this.radius_)+", "+x+", "+b);
        context.closePath();
        context.fill();
        context.stroke();
        x0 = x;
      }
    }
  }
  // Set Anchor
  var anchor = this.getAnchor();
  anchor[0] = c - this.offset_[0];
  anchor[1] = c - this.offset_[1];
};
/**
 * @inheritDoc
 */
ol.style.Chart.prototype.getChecksum = function() {
  var strokeChecksum = (this.stroke_!==null) ?
    this.stroke_.getChecksum() : '-';
  var fillChecksum;
  var recalculate = (this.checksums_===null) ||
    (strokeChecksum != this.checksums_[1] ||
    fillChecksum != this.checksums_[2] ||
    this.radius_ != this.checksums_[3] ||
    this.data_.join('|') != this.checksums_[4]);
  if (recalculate) {
    var checksum = 'c' + strokeChecksum + fillChecksum 
      + ((this.radius_ !== void 0) ? this.radius_.toString() : '-')
      + this.data_.join('|');
    this.checksums_ = [checksum, strokeChecksum, fillChecksum, this.radius_, this.data_.join('|')];
  }
  return this.checksums_[0];
};

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc
 * Fill style with named pattern
 *
 * @constructor
 * @param {olx.style.FillPatternOption=}  options
 *	@param {ol.style.Image|undefined} options.image an image pattern, image must be preloaded to draw on first call
 *	@param {number|undefined} options.opacity opacity with image pattern, default:1
 *	@param {olx.style.fillPattern} options.pattern pattern name (override by image option)
 *	@param {ol.color} options.color pattern color
 *	@param {ol.style.Fill} options.fill fill color (background)
 *	@param {number} options.offset pattern offset for hash/dot/circle/cross pattern
 *	@param {number} options.size line size for hash/dot/circle/cross pattern
 *	@param {number} options.spacing spacing for hash/dot/circle/cross pattern
 *	@param {number|bool} options.angle angle for hash pattern / true for 45deg dot/circle/cross
 *	@param {number} options.scale pattern scale 
 * @extends {ol.style.Fill}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
ol.style.FillPattern = function(options)
{	if (!options) options = {};
	var pattern;
	var canvas = this.canvas_ = document.createElement('canvas');
	var scale = Number(options.scale)>0 ? Number(options.scale) : 1;
	var ratio = scale*ol.has.DEVICE_PIXEL_RATIO || ol.has.DEVICE_PIXEL_RATIO;
	var ctx = canvas.getContext('2d');
	if (options.image)
	{	options.image.load();
		var i;
		var img = options.image.getImage();
		if (img.width)
		{	canvas.width = Math.round(img.width *ratio);
			canvas.height = Math.round(img.height *ratio);
			ctx.globalAlpha = typeof(options.opacity) == 'number' ? options.opacity:1;
			ctx.drawImage(img, 0,0, img.width, img.height, 0, 0, canvas.width, canvas.height);
			pattern = ctx.createPattern(canvas, 'repeat');
		}
		else 
		{	var self = this;
			pattern = [0,0,0,0];
			img.onload = function ()
			{	canvas.width = Math.round(img.width *ratio);
				canvas.height = Math.round(img.height *ratio);
				ctx.globalAlpha = typeof(options.opacity) == 'number' ? options.opacity:1;
				ctx.drawImage(img, 0,0, img.width, img.height, 0, 0, canvas.width, canvas.height);
				pattern = ctx.createPattern(canvas, 'repeat');
				self.setColor(pattern);
			}
		}
	}
	else
	{	var pat = this.getPattern_(options);
		canvas.width = Math.round(pat.width *ratio);
		canvas.height = Math.round(pat.height *ratio);
		ctx.beginPath();
		if (options.fill) 
		{	ctx.fillStyle = ol.color.asString(options.fill.getColor());
			ctx.fillRect(0,0, canvas.width, canvas.height);
		}
		ctx.scale(ratio,ratio);
		ctx.lineCap = "round";
		ctx.lineWidth = pat.stroke || 1;
		ctx.fillStyle = ol.color.asString(options.color||"#000");
		ctx.strokeStyle = ol.color.asString(options.color||"#000");
		if (pat.circles) for (i=0; i<pat.circles.length; i++)
		{	var ci = pat.circles[i]; 
			ctx.beginPath();
			ctx.arc(ci[0], ci[1], ci[2], 0,2*Math.PI);
			if (pat.fill) ctx.fill();
			if (pat.stroke) ctx.stroke();
		}
		if (!pat.repeat) pat.repeat=[[0,0]];
		if (pat.char)
		{	ctx.font = pat.font || (pat.width)+"px Arial";
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			if (pat.angle) 
			{	ctx.fillText(pat.char, pat.width/4, pat.height/4);
				ctx.fillText(pat.char, 5*pat.width/4, 5*pat.height/4);
				ctx.fillText(pat.char, pat.width/4, 5*pat.height/4);
				ctx.fillText(pat.char, 5*pat.width/4, pat.height/4);
				ctx.fillText(pat.char, 3*pat.width/4, 3*pat.height/4);
				ctx.fillText(pat.char, -pat.width/4, -pat.height/4);
				ctx.fillText(pat.char, 3*pat.width/4, -pat.height/4);
				ctx.fillText(pat.char, -pat.width/4, 3*pat.height/4);
			}
			else ctx.fillText(pat.char, pat.width/2, pat.height/2);
		}
		if (pat.lines) for (i=0; i<pat.lines.length; i++) for (var r=0; r<pat.repeat.length; r++)
		{	var li = pat.lines[i];
			ctx.beginPath();
			ctx.moveTo(li[0]+pat.repeat[r][0],li[1]+pat.repeat[r][1]);
			for (var k=2; k<li.length; k+=2)
			{	ctx.lineTo(li[k]+pat.repeat[r][0],li[k+1]+pat.repeat[r][1]);
			}
			if (pat.fill) ctx.fill();
			if (pat.stroke) ctx.stroke();
			ctx.save()
			ctx.strokeStyle = 'red';
			ctx.strokeWidth = 0.1;
			//ctx.strokeRect(0,0,canvas.width,canvas.height);
			ctx.restore()
		}
		pattern = ctx.createPattern(canvas, 'repeat');
		if (options.offset)
		{	var offset = options.offset;
			if (typeof(offset) == "number") offset = [offset,offset];
			if (offset instanceof Array) 
			{	var dx = Math.round((offset[0]*ratio));
				var dy = Math.round((offset[1]*ratio));
				// New pattern
				ctx.scale(1/ratio,1/ratio)
				ctx.clearRect(0,0,canvas.width,canvas.height);
				ctx.translate(dx,dy);
				ctx.fillStyle = pattern;
				ctx.fillRect(-dx, -dy, canvas.width,canvas.height);
				pattern = ctx.createPattern(canvas, 'repeat');
			}
		}
	}
	ol.style.Fill.call (this, { color: pattern });
};
ol.ext.inherits(ol.style.FillPattern, ol.style.Fill);
/**
 * Clones the style. 
 * @return {ol.style.FillPattern}
 */
ol.style.FillPattern.prototype.clone = function()
{	var s = ol.style.Fill.prototype.clone.call(this);
	s.canvas_ = this.canvas_;
	return s;
};
/** Get canvas used as pattern
*	@return {canvas}
*/
ol.style.FillPattern.prototype.getImage = function()
{	return this.canvas_;
}
/** Get pattern
*	@param {olx.style.FillPatternOption}
*/
ol.style.FillPattern.prototype.getPattern_ = function(options)
{	var pat = ol.style.FillPattern.prototype.patterns[options.pattern]
		|| ol.style.FillPattern.prototype.patterns.dot;
	var d = Math.round(options.spacing)||10;
	var size;
	switch (options.pattern)
	{	case 'dot':
		case 'circle':
		{	size = options.size===0 ? 0 : options.size/2 || 2;
			if (!options.angle)
			{	pat.width = pat.height = d;
				pat.circles = [[ d/2, d/2, size ]]
				if (options.pattern=='circle')
				{	pat.circles = pat.circles.concat([
						[ d/2+d, d/2, size ],
						[ d/2-d, d/2, size ],
						[ d/2, d/2+d, size ],
						[ d/2, d/2-d, size ],
						[ d/2+d, d/2+d, size ],
						[ d/2+d, d/2-d, size ],
						[ d/2-d, d/2+d, size ],
						[ d/2-d, d/2-d, size ] ])
				}
			}
			else
			{	d = pat.width = pat.height = Math.round(d*1.4);
				pat.circles = [[ d/4, d/4, size ], [ 3*d/4, 3*d/4, size ]];
				if (options.pattern=='circle')
				{	pat.circles = pat.circles.concat([
						[ d/4+d, d/4, size ],
						[ d/4, d/4+d, size ],
						[ 3*d/4-d, 3*d/4, size ],
						[ 3*d/4, 3*d/4-d, size ],
						[ d/4+d, d/4+d, size ], 
						[ 3*d/4-d, 3*d/4-d, size ] ]);
				}
			}
			break;
		}
		case 'tile':
		case 'square':
		{	size = options.size===0 ? 0 : options.size/2 || 2;
			if (!options.angle)
			{	pat.width = pat.height = d;
				pat.lines = [[ d/2-size, d/2-size, d/2+size, d/2-size, d/2+size, d/2+size, d/2-size,d/2+size, d/2-size, d/2-size ]]
			}
			else
			{	pat.width = pat.height = d;
				//size *= Math.sqrt(2);
				pat.lines = [[ d/2-size,d/2, d/2,d/2-size, d/2+size,d/2, d/2,d/2+size, d/2-size,d/2 ]]
			}
			if (options.pattern=='square') pat.repeat = [[0,0], [0,d], [d,0], [0,-d], [-d,0], [-d,-d], [d,d], [-d,d], [d,-d] ]
			break;
		}
		case 'cross':
		{	// Limit angle to 0 | 45
			if (options.angle) options.angle = 45;
		}
		// fallsthrough
		case 'hatch':
		{	var a = Math.round(((options.angle||0)-90)%360);
			if (a>180) a -= 360;
			a *= Math.PI/180;
			var cos = Math.cos(a);
			var sin = Math.sin(a);
			if (Math.abs(sin)<0.0001)
			{	pat.width = pat.height = d;	
				pat.lines = [ [ 0,0.5, d, 0.5 ] ];
				pat.repeat = [ [0,0], [0,d] ];
			}
			else  if (Math.abs(cos)<0.0001)
			{	pat.width = pat.height = d;	
				pat.lines = [ [ 0.5,0, 0.5, d] ];
				pat.repeat = [ [0,0], [d,0] ];
				if (options.pattern=='cross') 
				{	pat.lines.push ([ 0,0.5, d, 0.5 ]);
					pat.repeat.push([0,d]);
				}
			}
			else
			{	var w = pat.width = Math.round(Math.abs(d/sin)) || 1;
				var h = pat.height = Math.round(Math.abs(d/cos)) || 1;
				if (options.pattern=='cross')
				{	pat.lines = [ [-w,-h, 2*w,2*h], [2*w,-h, -w,2*h] ];
					pat.repeat = [ [0,0] ];
				}
				else if (cos*sin>0) 
				{	pat.lines = [ [-w,-h, 2*w,2*h] ];
					pat.repeat = [ [0,0], [w,0], [0,h] ];
				}
				else 
				{	pat.lines = [ [2*w,-h, -w,2*h] ];
					pat.repeat = [ [0,0], [-w,0], [0,h] ];
				}
			}
			pat.stroke = options.size===0 ? 0 : options.size||4;
			break;
		}
		default: break;
	}
	return pat
}
/** Static fuction to add char patterns
*	@param {title} 
*	@param {olx.fillpattern.Option}
*		- size {integer} default 10
*		- width {integer} default 10
*		- height {integer} default 10
*		- circles {Array<circles>}
*		- lines: {Array<pointlist>}
*		- stroke {integer}
*		- fill {bool}
*		- char {char}
*		- font {string} default "10px Arial"
*/
ol.style.FillPattern.addPattern = function (title, options)
{	if (!options) options={};
	ol.style.FillPattern.prototype.patterns[title || options.char] =
	{	width: options.width || options.size || 10,
		height: options.height || options.size || 10,
		font: options.font,
		char: options.char,
		circles: options.circles,
		lines: options.lines,
		repeat: options.repeat,
		stroke: options.stroke,
		angle: options.angle,
		fill: options.fill
	}
}
/** Patterns definitions
	Examples : http://seig.ensg.ign.fr/fichchap.php?NOFICHE=FP31&NOCHEM=CHEMS009&NOLISTE=1&N=8
*/
ol.style.FillPattern.prototype.patterns =
{
	"hatch":
	{	width:5,
		height:5,
		lines:[[0,2.5,5,2.5]],
		stroke:1
	},
	"cross":
	{	width:7,
		height:7,
		lines:[[0,3,10,3],[3,0,3,10]],
		stroke:1
	},
	"dot":
	{	width:8,
		height:8,
		circles:[[5,5,2]],
		stroke:false,
		fill:true,
	},
	"circle":
	{	width:10,
		height:10,
		circles:[[5,5,2]],
		stroke:1,
		fill:false,
	},
	"square":
	{	width:10,
		height:10,
		lines:[[3,3, 3,8, 8,8, 8,3, 3,3]],
		stroke:1,
		fill:false,
	},
	"tile":
	{	width:10,
		height:10,
		lines:[[3,3, 3,8, 8,8, 8,3, 3,3]],
		fill:true,
	},
	"woven":
	{	width: 12,
		height: 12,
		lines: [[ 3,3, 9,9 ],[0,12, 3,9], [9,3, 12,0], [-1,1,1,-1], [13,11,11,13]],
		stroke: 1
	},
	"crosses":
	{	width: 8,
		height: 8,
		lines: [[ 2,2, 6,6 ],[2,6,6,2]],
		stroke: 1
	},
	"caps":
	{	width: 8,
		height: 8,
		lines: [[ 2,6, 4,2, 6,6 ]],
		stroke: 1
	},
	"nylon":
	{	width: 20,
		height: 20,
//		lines: [[ 0,5, 0,0, 5,0 ],[ 5,10, 10,10, 10,5 ], [ 10,15, 10,20, 15,20 ],[ 15,10, 20,10, 20,15 ]],
//		repeat: [[0,0], [20,0], [0,20], [-20,0], [0,-20], [-20,-20]],
		lines: [[ 1,6, 1,1, 6,1 ],[ 6,11, 11,11, 11,6 ], [ 11,16, 11,21, 16,21 ],[ 16,11, 21,11, 21,16 ]],
		repeat: [[0,0], [-20,0], [0,-20] ],
		stroke: 1
	},
	"hexagon":
	{	width: 20,
		height: 12,
		lines: [[ 0,10, 4,4, 10,4, 14,10, 10,16, 4,16, 0,10 ]],
		stroke:1,
		repeat:[[0,0],[10,6],[10,-6],[-10,-6]]
	},
	"cemetry":
	{	width:15,
		height:19,
		lines:[[0,3.5,7,3.5],[3.5,0,3.5,10],
			//[7,12.5,14,12.5],[10.5,9,10.5,19]
			],
		stroke:1,
		repeat:[[0,0],[7,9]]
	},
	"sand":
	{	width:20,
		height:20,
		circles:[[1,2,1],[9,3,1],[2,16,1],
				[7,8,1],[6,14,1],[4,19,1],
				[14,2,1],[12,10,1],[14,18,1],
				[18,8,1],[18,14,1]],
		fill:1
	},
	"conglomerate":
	{	width:30,
		height:20,
		circles:[[2,4,1],[17,3,1],[26,18,1],[12,17,1],[5,17,2],[28,11,2]],
		lines:[[7,5, 6,7, 9,9, 11,8, 11,6, 9,5, 7,5], 
			[16,10, 15,13, 16,14, 19,15, 21,13, 22,9, 20,8, 19,8, 16,10], 
			[24,6, 26,7, 27,5, 26,4, 24,4, 24,6]],
		stroke:1
	},
	"gravel":
	{	width:15,
		height:10,
		circles:[[4,2,1],[5,9,1],[1,7,1]],//[9,9,1],,[15,2,1]],
		lines:[[7,5, 6,6, 7,7, 8,7, 9,7, 10,5, 9,4, 7,5], [11,2, 14,4, 14,1, 12,1, 11,2]],
		stroke:1
	},
	"brick":
	{	width:18,
		height:16,
		lines:[	[0,1,18,1],[0,10,18,10], [6,1,6,10],[12,10,12,18],[12,0,12,1]],
		stroke:1
	},
	"dolomite":
	{	width:20,
		height:16,
		lines:[[0,1,20,1],[0,9,20,9],[1,9,6,1],[11,9,14,16],[14,0,14.4,1]],
		stroke:1
	},
	"coal":
	{	width:20,
		height:16,
		lines:[[1,5, 7,1, 7,7], [11,10, 12,5, 18,9], [5,10, 2,15, 9,15,], [15,16, 15,13, 20,16], [15,0, 15,2, 20,0]],
		fill:1
	},
	"breccia":
	{	width:20,
		height:16,
		lines:[[1,5, 7,1, 7,7, 1,5], [11,10, 12,5, 18,9, 11,10], [5,10, 2,15, 9,15, 5,10], [15,16, 15,13, 22,18], [15,0, 15,2, 20,0] ],
		stroke:1,
	},
	"clay":
	{	width:20,
		height:20,
		lines:[[0,0, 3,11, 0,20], [11,0, 10,3, 13,13, 11,20], [0,0, 10,3, 20,0], [0,12, 3,11, 13,13, 20,12]],
		stroke:1
	},
	"flooded":
	{	width:15,
		height:10,
		lines:[	[0,1,10,1],[0,6,5,6], [10,6,15,6]],
		stroke:1
	},
	"chaos":
	{	width:40,
		height:40,
		lines:[[40,2, 40,0, 38,0, 40,2], 
			[4,0, 3,2, 2,5, 0,0, 0,3, 2,7, 5,6, 7,7, 8,10, 9,12, 9,13, 9,14, 8,14, 6,15, 2,15, 0,20, 0,22, 2,20, 5,19, 
				8,15, 10,14, 11,12.25, 10,12, 10,10, 12,9, 13,7, 12,6, 13,4, 16,7, 17,4, 20,0, 18,0, 15,3, 14,2, 14,0,
				12,1, 11,0, 10,1, 11,4, 10,7, 9,8, 8,5, 6,4, 5,3, 5,1, 5,0, 4,0],
			[7,1, 7,3, 8,3, 8,2, 7,1], [4,3, 5,5, 4,5, 4,3], [34,5, 33,7, 38,10, 38,8, 36,5, 34,5], 
			[ 27,0, 23,2, 21,8, 30,0, 27,0], 
			[25,8, 26,12, 26,16, 22.71875,15.375, 20,13, 18,15, 17,18, 13,22, 17,21, 19,22, 21,20, 19,18, 22,17, 30,25, 
			26,26, 24,28, 21.75,33.34375, 20,36, 18,40, 20,40, 24,37, 25,32, 27,31, 26,38, 27,37, 30,32, 32,35, 36,37, 
			38,40, 38,39, 40,40, 37,36, 34,32, 37,31, 36,29, 33,27, 34,24, 39,21, 40,21, 40,16, 37,20, 31,22, 32,25, 
			27,20, 29,15, 30,20, 32,20, 34,18, 33,12, 31,11, 29,14, 26,9, 25,8], [39,24, 37,26, 40,28, 39,24], 
			[13,15, 9,19, 14,18, 13,15], [18,23, 14,27, 16,27, 17,25, 20,26, 18,23], 
			[6,24, 2,26, 1,28, 2,30, 5,28, 12,30, 16,32, 18,30, 15,30, 12,28, 9,25, 7,27, 6,24], 
			[29,27, 32,28, 33,31, 30,29, 27,28, 29,27], 
			[5,35, 1,33, 3,36, 13,38, 15,35, 10,36, 5,35]],
		fill:1,
	},
	"grass":
	{	width:27,
		height:22,
		lines: [[0,10.5,13,10.5], [2.5,10,1.5,7], [4.5,10, 4.5,5, 3.5,4 ], [7,10, 7.5,6, 8.5,3], [10,10,11,6]],
		repeat: [[0,0],[14,10]],
		stroke:1
	},
	"swamp":
	{	width:24,
		height:23,
		lines:[ [0,10.5,9.5,10.5], [2.5,10,2.5,7], [4.5,10,4.5,4], [6.5,10,6.5,6], [3,12.5,7,12.5] ],
		repeat: [[0,0],[14,10]],
		stroke:1
	},
	"wave":
	{	width:10,
		height:8,
		lines:[ [0,0, 5,4, 10,0] ],
		stroke:1
	},
	"vine":
	{	width:13,
		height:13,
		lines:[[3,0,3,6],[9,7,9,13]],
		stroke:1.0
	},
	"forest":
	{	width:55,
		height:30,
		circles:[[7,7,3.5],[20,20,1.5],[42,22,3.5],[35,5,1.5]],
		stroke:1
	},
	"scrub":
	{	width:26,
		height:20,
		lines:[ [1,4, 4,8, 6,4] ],
		circles:[[20,13,1.5]],
		stroke:1,
	},
	"tree":
	{	width:30,
		height:30,
		lines:[[7.78,10.61,4.95,10.61,4.95,7.78,3.54,7.78,2.12,6.36,0.71,6.36,0,4.24,0.71,2.12,4.24,0,7.78,0.71,9.19,3.54,7.78,4.95,7.07,7.07,4.95,7.78]],
		repeat: [[3,1],[18,16]],
		stroke:1
	},
	"pine":
	{	width:30,
		height:30,
		lines:[[5.66,11.31,2.83,11.31,2.83,8.49,0,8.49,2.83,0,5.66,8.49,2.83,8.49]],
		repeat:[[3,1],[18,16]],
		stroke:1
	},
	"pines":
	{	width:22,
		height:20,
		lines:[[1,4,3.5,1,6,4],[1,8,3.5,5,6,8],[3.5,1,3.5,11],[12,14.5,14.5,14,17,14.5],[12,18,17,18],[14.5,12,14.5,18]],
		repeat: [[2,1]],
		stroke:1
	},
	"rock":
	{	width:20,
		height:20,
		lines:[	[1,0,1,9],[4,0,4,9],[7,0,7,9], 
				[10,1,19,1],[10,4,19,4],[10,7,19,7],
				[0,11,9,11],[0,14,9,14],[0,17,9,17], 
				[12,10,12,19],[15,10,15,19],[18,10,18,19] ],
		repeat:[[0.5,0.5]],
		stroke:1
	},
	"rocks":
	{	width:20,
		height:20,
		lines:[	[5,0, 3,0, 5,4, 4,6, 0,3, 0,5, 3,6, 5,9, 3.75,10, 2.5,10, 0,9, 0,10, 4,11, 5,14, 4,15, 0,13,
			0,13, 0,13, 0,14, 0,14, 5,16, 5,18, 3,19, 0,19, -0.25,19.9375, 5,20, 10,19, 10,20, 11,20, 12,19,
			14,20, 15,20, 17,19, 20,20, 20,19, 19,16, 20,15, 20,11, 20,10, 19,8, 20,5, 20,0, 19,0, 20,2, 19,4,
			17,4, 16,3, 15,0, 14,0, 15,4, 11,5, 10,4, 11,0, 10,0, 9,4, 6,5, 5,0,],
			[18,5, 19,6, 18,10, 16,10, 14,9, 16,5, 18,5], 
			[5,6, 9,5, 10,6, 10,9, 6,10, 5,6], 
			[14,5, 14,8, 13,9, 12,9, 11,7, 12,5, 14,5], 
			[ 5,11, 8,10, 9,11, 10,14, 6,15, 6,15, 5,11], 
			[13,10, 14,11, 15,14, 15,14, 15,14, 11,15, 10,11, 11,10, 13,10], 
			[15,12, 16,11, 19,11, 19,15, 16,14, 16,14, 15,12], 
			[6,16, 9,15, 10,18, 5,19, 6,16], 
			[10,16, 14,16, 14,18, 13,19, 11,18, 10,16], 
			[15,15, 18,16, 18,18, 16,19, 15,18, 15,15]],
		stroke:1
	}
}
/**
 * /
ol.style.FillPattern.prototype.getChecksum = function()
{
	var strokeChecksum = (this.stroke_!==null) ?
		this.stroke_.getChecksum() : '-';
	var fillChecksum = (this.fill_!==null) ?
		this.fill_.getChecksum() : '-';
	var recalculate = (this.checksums_===null) ||
		(strokeChecksum != this.checksums_[1] ||
		fillChecksum != this.checksums_[2] ||
		this.radius_ != this.checksums_[3] ||
		this.form_+"-"+this.glyphs_ != this.checksums_[4]);
	if (recalculate) {
		var checksum = 'c' + strokeChecksum + fillChecksum 
			+ ((this.radius_ !== void 0) ? this.radius_.toString() : '-')
			+ this.form_+"-"+this.glyphs_;
		this.checksums_ = [checksum, strokeChecksum, fillChecksum, this.radius_, this.form_+"-"+this.glyphs_];
	}
	return this.checksums_[0];
};
/**/

/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Flow line style
 * Draw LineString with a variable color / width
 *
 * @extends {ol.style.Style}
 * @constructor
 * @param {Object} options
 *  @param {boolean} options.visible draw only the visible part of the line, default true
 *  @param {number|function} options.width Stroke width or a function that gets a feature and the position (beetween [0,1]) and returns current width
 *  @param {number} options.width2 Final stroke width
 *  @param {ol.colorLike|function} options.color Stroke color or a function that gets a feature and the position (beetween [0,1]) and returns current color
 *  @param {ol.colorLike} options.color2 Final sroke color
 */
ol.style.FlowLine = function(options) {
  if (!options) options = {};
  ol.style.Style.call (this, { 
    renderer: this._render.bind(this),
    geometry: options.geometry
  });
  // Draw only visible
  this._visible = (options.visible !== false);
  // Width
  if (typeof options.width === 'function') {
    this._widthFn = options.width;
  } else {
    this.setWidth(options.width);
  }
  this.setWidth2(options.width2);
  // Color
  if (typeof options.color === 'function') {
    this._colorFn = options.color;
  } else {
    this.setColor(options.color);
  }
  this.setColor2(options.color2);
  // LineCap
  this.setLineCap(options.lineCap);
};
ol.ext.inherits(ol.style.FlowLine, ol.style.Style);
/** Set the initial width
 * @param {number} width width, default 0
 */
ol.style.FlowLine.prototype.setWidth = function(width) {
  this._width = width || 0;
};
/** Set the final width
 * @param {number} width width, default 0
 */
ol.style.FlowLine.prototype.setWidth2 = function(width) {
  this._width2 = width;
};
/** Set the LineCap
 * @param {steing} cap LineCap (round or mitter), default mitter
 */
ol.style.FlowLine.prototype.setLineCap = function(cap) {
  this._lineCap = (cap==='round' ? 'round' : 'mitter');
};
/** Get the current width at step
 * @param {ol.feature} feature
 * @param {number} step current drawing step beetween [0,1] 
 * @return {number} 
 */
ol.style.FlowLine.prototype.getWidth = function(feature, step) {
  if (this._widthFn) return this._widthFn(feature, step);
  var w2 = (typeof(this._width2) === 'number') ? this._width2 : this._width;
  return this._width + (w2-this._width) * step;
};
/** Set the initial color
 * @param {ol.colorLike} color
 */
ol.style.FlowLine.prototype.setColor = function(color) {
  try{
    this._color = ol.color.asArray(color);
  } catch(e) {
    this._color = [0,0,0,1];
  }
};
/** Set the final color
 * @param {ol.colorLike} color
 */
ol.style.FlowLine.prototype.setColor2 = function(color) {
  try {
    this._color2 = ol.color.asArray(color);
  } catch(e) {
    this._color2 = null;    
  }
};
/** Get the current color at step
 * @param {ol.feature} feature
 * @param {number} step current drawing step beetween [0,1] 
 * @return {string} 
 */
ol.style.FlowLine.prototype.getColor = function(feature, step) {
  if (this._colorFn) return ol.color.asString(this._colorFn(feature, step));
  var color = this._color;
  var color2 = this._color2 || this._color
  return 'rgba('+
          + Math.round(color[0] + (color2[0]-color[0]) * step) +','
          + Math.round(color[1] + (color2[1]-color[1]) * step) +','
          + Math.round(color[2] + (color2[2]-color[2]) * step) +','
          + (color[3] + (color2[3]-color[3]) * step)
          +')';
};
/** Renderer function
 * @param {Array<ol.coordinate>} geom The pixel coordinates of the geometry in GeoJSON notation
 * @param {ol.render.State} e The olx.render.State of the layer renderer
 */
ol.style.FlowLine.prototype._render = function(geom, e) {
  if (e.geometry.getType()==='LineString') {
    var i, p, ctx = e.context;
    // Get geometry used at drawing
    if (!this._visible) {
      var a = e.pixelRatio / e.resolution;
      var g = e.geometry.getCoordinates();
      var dx = geom[0][0] - g[0][0] * a;
      var dy = geom[0][1] + g[0][1] * a;
      geom = [];
      for (i=0; p=g[i]; i++) {
        geom[i] = [ dx + p[0] * a, dy - p[1] * a];
      }
    }
    // Split into
    var geoms = this._splitInto(geom, 255, 2);
    var k = 0;
    var nb = geoms.length;
    // Draw
    ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = this._lineCap || 'mitter';
      geoms.forEach(function(g) {
        var step = k++/nb;
        ctx.lineWidth = this.getWidth(e.feature, step) * e.pixelRatio;
        ctx.strokeStyle = this.getColor(e.feature, step);
        ctx.beginPath();
        ctx.moveTo(g[0][0],g[0][1]);
        for (i=1; p=g[i]; i++) {
          ctx.lineTo(p[0],p[1]);
          ctx.stroke();
        }
      }.bind(this));
    ctx.restore();
  }
};
/** Split line geometry into equal length geometries
 * @param {Array<ol.coordinate>} geom
 * @param {number} nb number of resulting geometries, default 255
 * @param {number} nim minimum length of the resulting geometries, default 1
 */
ol.style.FlowLine.prototype._splitInto = function(geom, nb, min) {
  var i, p;
  // Split geom into equal length geoms
  var geoms = [];
  var dl, l = 0;
  for (i=1; p=geom[i]; i++) {
    l += ol.coordinate.dist2d(geom[i-1], p);
  }
  var length = Math.max (min||2, l/(nb||255));
  var p0 = geom[0];
  l = 0;
  var g = [p0];
  i = 1;
  p = geom[1];
  while (i < geom.length) {
    var dx = p[0]-p0[0];
    var dy = p[1]-p0[1];
    dl = Math.sqrt(dx*dx + dy*dy);
    if (l+dl > length) {
      var d = (length-l) / dl;
      g.push([ 
        p0[0] + dx * d,  
        p0[1] + dy * d 
      ]);
      geoms.push(g);
      p0 =[ 
        p0[0] + dx * d*.9,  
        p0[1] + dy * d*.9
      ];
      g = [p0];
      l = 0;
    } else {
      l += dl;
      p0 = p;
      g.push(p0);
      i++;
      p = geom[i];
    }
  }
  geoms.push(g);
  return geoms;
}

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc
 * A marker style to use with font symbols.
 *
 * @constructor
 * @param {} options Options.
 *  @param {number} options.glyph the glyph name or a char to display as symbol. 
 * 		The name must be added using the {@link ol.style.FontSymbol.addDefs} function.
 *  @param {string} options.form 
 * 		none|circle|poi|bubble|marker|coma|shield|blazon|bookmark|hexagon|diamond|triangle|sign|ban|lozenge|square
 * 		a form that will enclose the glyph, default none
 *  @param {number} options.radius
 *  @param {number} options.rotation
 *  @param {number} options.rotateWithView
 *  @param {number} options.opacity
 *  @param {number} options.fontSize, default 1
 *  @param {string} options.fontStyle the font style (bold, italic, bold italic, etc), default none
 *  @param {boolean} options.gradient true to display a gradient on the symbol
 *  @param {_ol_style_Fill_} options.fill
 *  @param {_ol_style_Stroke_} options.stroke
 * @extends {ol.style.RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
ol.style.FontSymbol = function(options)
{	options = options || {};
	var strokeWidth = 0;
	if (options.stroke) strokeWidth = options.stroke.getWidth();
	ol.style.RegularShape.call (this,{ radius: options.radius, fill:options.fill,
									rotation:options.rotation, rotateWithView: options.rotateWithView });
	if (typeof(options.opacity)=="number") this.setOpacity(options.opacity);
	this.color_ = options.color;
	this.fontSize_ = options.fontSize || 1;
	this.fontStyle_ = options.fontStyle || '';
	this.stroke_ = options.stroke;
	this.fill_ = options.fill;
	this.radius_ = options.radius -strokeWidth;
	this.form_ = options.form || "none";
	this.gradient_ = options.gradient;
	this.offset_ = [options.offsetX ? options.offsetX :0, options.offsetY ? options.offsetY :0];
	this.glyph_ = this.getGlyph(options.glyph) || "";
	this.renderMarker_();
};
ol.ext.inherits(ol.style.FontSymbol, ol.style.RegularShape);
/** Cool stuff to get the image symbol for a style
*/
ol.style.Image.prototype.getImagePNG = function()
{	var canvas = this.getImage();
	if (canvas) 
	{	try { return canvas.toDataURL("image/png"); }
		catch(e) { return false; }
	}
	else return false;
}
/** 
 *	Font defs
 */
ol.style.FontSymbol.prototype.defs = { 'fonts':{}, 'glyphs':{} };
/** Static function : add new font defs 
 * @param {String|Object} font the font desciption
 * @param {} glyphs a key / value list of glyph definitions. 
 * 		Each key is the name of the glyph, 
 * 		the value is an object that code the font, the caracter code, 
 * 		the name and a search string for the glyph.
 */
 ol.style.FontSymbol.addDefs = function(font, glyphs)
 {	var thefont = font;
	if (typeof(font) == "string") thefont = {"font":font, "name":font, "copyright":"" };
	if (!thefont.font || typeof(thefont.font) != "string") 
	{	console.log("bad font def");
		return;
	}
	var fontname = thefont.font;
	ol.style.FontSymbol.prototype.defs.fonts[fontname] = thefont;
	for (var i in glyphs)
	{	var g = glyphs[i];
		if (typeof(g) == "string" && g.length==1) g = { char: g };
		ol.style.FontSymbol.prototype.defs.glyphs[i] =
			{	font: thefont.font,
				char: g.char || ""+String.fromCharCode(g.code) || "",
				theme: g.theme || thefont.name,
				name: g.name || i,
				search: g.search || ""
			};
	}
 };
/**
 * Clones the style. 
 * @return {ol.style.FontSymbol}
 */
ol.style.FontSymbol.prototype.clone = function()
{	var g = new ol.style.FontSymbol(
	{	glyph: "",
		color: this.color_,
		fontSize: this.fontSize_,
		fontStyle: this.fontStyle_,
		stroke: this.stroke_,
		fill: this.fill_,
		radius: this.radius_ + (this.stroke_ ? this.stroke_.getWidth():0),
		form: this.form_,
		gradient: this.gradient_,
		offsetX: this.offset_[0],
		offsetY: this.offset_[1],
		opacity: this.getOpacity(),
		rotation: this.getRotation(),
		rotateWithView: this.getRotateWithView()
	});
	g.setScale(this.getScale());
	g.glyph_ = this.glyph_;
	g.renderMarker_();
	return g;
};
/**
 * Get the fill style for the symbol.
 * @return {ol.style.Fill} Fill style.
 * @api
 */
ol.style.FontSymbol.prototype.getFill = function() {
  return this.fill_;
};
/**
 * Get the stroke style for the symbol.
 * @return {_ol_style_Stroke_} Stroke style.
 * @api
 */
ol.style.FontSymbol.prototype.getStroke = function() {
  return this.stroke_;
};
/**
 * Get the glyph definition for the symbol.
 * @param {string|undefined} name a glyph name to get the definition, default return the glyph definition for the style.
 * @return {_ol_style_Stroke_} Stroke style.
 * @api
 */
ol.style.FontSymbol.prototype.getGlyph = function(name)
{	if (name) return ol.style.FontSymbol.prototype.defs.glyphs[name] || { "font":"none","char":name.charAt(0),"theme":"none","name":"none", "search":""};
	else return this.glyph_;
};
/**
 * Get the glyph name.
 * @return {string} the name
 * @api
 */
ol.style.FontSymbol.prototype.getGlyphName = function()
{	for (var i in ol.style.FontSymbol.prototype.defs.glyphs)
	{	if (ol.style.FontSymbol.prototype.defs.glyphs[i] === this.glyph_) return i;
	}
	return "";
};
/**
 * Get the stroke style for the symbol.
 * @return {_ol_style_Stroke_} Stroke style.
 * @api
 */
ol.style.FontSymbol.prototype.getFontInfo = function(glyph)
{	return ol.style.FontSymbol.prototype.defs.fonts[glyph.font];
}
/** @private
 */
ol.style.FontSymbol.prototype.renderMarker_ = function()
{
	var strokeStyle;
	var strokeWidth = 0;
	if (this.stroke_) 
	{	strokeStyle = ol.color.asString(this.stroke_.getColor());
		strokeWidth = this.stroke_.getWidth();
	}
	// no atlas manager is used, create a new canvas
	var canvas = this.getImage();
	//console.log(this.getImage().width+" / "+(2 * (this.radius_ + strokeWidth) + 1));
	/** @type {ol.style.FontSymbol.RenderOptions} */
	var renderOptions = {
		strokeStyle: strokeStyle,
		strokeWidth: strokeWidth,
		size: canvas.width,
	};
	// draw the circle on the canvas
	var context = (canvas.getContext('2d'));
	context.clearRect(0, 0, canvas.width, canvas.height);
	this.drawMarker_(renderOptions, context, 0, 0);
	// Set Anchor
	var a = this.getAnchor();
	a[0] = canvas.width / 2 - this.offset_[0];
	a[1] = canvas.width / 2 - this.offset_[1];
	//this.createMarkerHitDetectionCanvas_(renderOptions);
};
/**
 * @private
 * @param {ol.style.FontSymbol.RenderOptions} renderOptions
 * @param {CanvasRenderingContext2D} context
 */
ol.style.FontSymbol.prototype.drawPath_ = function(renderOptions, context)
{
	var s = 2*this.radius_+renderOptions.strokeWidth+1;
	var w = renderOptions.strokeWidth/2;
	var c = renderOptions.size / 2;
	// Transfo to place the glyph at the right place
	var transfo = { fac:1, posX:renderOptions.size / 2, posY:renderOptions.size / 2 };
	context.lineJoin = 'round';
	context.beginPath();
	// Draw the path with the form
	switch (this.form_)
	{	case "none": transfo.fac=1;  break;
		case "circle":
		case "ban":
			context.arc ( c, c, s/2, 0, 2 * Math.PI, true);
			break;
		case "poi":
			context.arc ( c, c -0.4*this.radius_, 0.6*this.radius_, 0.15*Math.PI, 0.85*Math.PI, true);
			context.lineTo ( c-0.89*0.05*s, (0.95+0.45*0.05)*s+w);
			context.arc ( c, 0.95*s+w, 0.05*s, 0.85*Math.PI, 0.15*Math.PI, true);
			transfo = { fac:0.45, posX:c, posY:c -0.35*this.radius_ };
			break;
		case "bubble":
			context.arc ( c, c -0.2*this.radius_, 0.8*this.radius_, 0.4*Math.PI, 0.6*Math.PI, true);
			context.lineTo ( 0.5*s+w, s+w);
			transfo = { fac:0.7, posX:c, posY:c -0.2*this.radius_ };
			break;
		case "marker":
			context.arc ( c, c -0.2*this.radius_, 0.8*this.radius_, 0.25*Math.PI, 0.75*Math.PI, true);
			context.lineTo ( 0.5*s+w, s+w);
			transfo = { fac:0.7, posX: c, posY: c -0.2*this.radius_ };
			break;
		case "coma":
		/*
			context.arc( renderOptions.size / 2, renderOptions.size / 2 +0.2*this.radius_, 0.8*this.radius_, 0.5*Math.PI, 0, true);
			context.arc( renderOptions.size / 2, renderOptions.size / 2 -0.2*this.radius_, 0.8*this.radius_, 0, 0.5*Math.PI, true);
		*/
			context.moveTo ( c + 0.8*this.radius_, c -0.2*this.radius_);
			context.quadraticCurveTo ( 0.95*s+w, 0.75*s+w, 0.5*s+w, s+w);
			context.arc ( c, c -0.2*this.radius_, 0.8*this.radius_, 0.45*Math.PI, 0, false);
			transfo = { fac:0.7, posX: c, posY: c -0.2*this.radius_ };
			break;
		default:
		{	var pts;
			switch (this.form_)
			{	case "shield": 
					pts = [ 0.05,0, 0.95,0, 0.95,0.8, 0.5,1, 0.05,0.8, 0.05,0 ]; 
					transfo.posY = 0.45*s+w ;
					break;
				case "blazon": 
					pts = [ 0.1,0, 0.9,0, 0.9,0.8, 0.6,0.8, 0.5,1, 0.4,0.8, 0.1,0.8, 0.1,0 ]; 
					transfo.fac = 0.8;
					transfo.posY = 0.4*s+w ;
					break;
				case "bookmark": 
					pts = [ 0.05,0, 0.95,0, 0.95,1, 0.5,0.8, 0.05,1, 0.05,0 ]; 
					transfo.fac = 0.9;
					transfo.posY = 0.4*s+w ;
					break;
				case "hexagon": 
					pts = [ 0.05,0.2, 0.5,0, 0.95,0.2, 0.95,0.8, 0.5,1, 0.05,0.8, 0.05,0.2 ]; 
					transfo.fac = 0.9;
					transfo.posY = 0.5*s+w ;
					break;
				case "diamond": 
					pts = [ 0.25,0, 0.75,0, 1,0.2, 1,0.4, 0.5,1, 0,0.4, 0,0.2, 0.25,0 ]; 
					transfo.fac = 0.75 ;
					transfo.posY = 0.35*s+w ;
					break;
				case "triangle": 
					pts = [ 0,0, 1,0, 0.5,1, 0,0 ]; 
					transfo.fac = 0.6 ;
					transfo.posY = 0.3*s+w ;
					break;
				case "sign": 
					pts = [ 0.5,0.05, 1,0.95, 0,0.95, 0.5,0.05 ]; 
					transfo.fac = 0.7 ;
					transfo.posY = 0.65*s+w ;
					break;
				case "lozenge": 
					pts = [ 0.5,0, 1,0.5, 0.5,1, 0,0.5, 0.5,0 ]; 
					transfo.fac = 0.7;
					break;
				case "square": 
				default: 
					pts = [ 0,0, 1,0, 1,1, 0,1, 0,0 ]; break;
			}
			for (var i=0; i<pts.length; i+=2) context.lineTo ( pts[i]*s+w, pts[i+1]*s+w);
		}
	}
	context.closePath();
	return transfo;
}
/**
 * @private
 * @param {ol.style.FontSymbol.RenderOptions} renderOptions
 * @param {CanvasRenderingContext2D} context
 * @param {number} x The origin for the symbol (x).
 * @param {number} y The origin for the symbol (y).
 */
ol.style.FontSymbol.prototype.drawMarker_ = function(renderOptions, context, x, y)
{	var fcolor = this.fill_ ? this.fill_.getColor() : "#000";
	var scolor = this.stroke_ ? this.stroke_.getColor() : "#000";
	if (this.form_ == "none" && this.stroke_ && this.fill_)
	{	scolor = this.fill_.getColor();
		fcolor = this.stroke_.getColor();
	}
	// reset transform
	context.setTransform(1, 0, 0, 1, 0, 0);
	// then move to (x, y)
	context.translate(x, y);
	var tr = this.drawPath_(renderOptions, context);
	if (this.fill_) 
	{	if (this.gradient_ && this.form_!="none")
		{	var grd = context.createLinearGradient(0,0,renderOptions.size/2,renderOptions.size);
			grd.addColorStop (1, ol.color.asString(fcolor));
			grd.addColorStop (0, ol.color.asString(scolor));
			context.fillStyle = grd;
		}
		else context.fillStyle = ol.color.asString(fcolor);
		context.fill();
	}
	if (this.stroke_ && renderOptions.strokeWidth) {
		context.strokeStyle = renderOptions.strokeStyle;
		context.lineWidth = renderOptions.strokeWidth;
		context.stroke();
	}
	// Draw the symbol
	if (this.glyph_.char)
	{	context.font = this.fontStyle_ +' '
				+ (2*tr.fac*(this.radius_)*this.fontSize_)+"px "
				+ this.glyph_.font;
		context.strokeStyle = context.fillStyle;
		context.lineWidth = renderOptions.strokeWidth * (this.form_ == "none" ? 2:1);
		context.fillStyle = ol.color.asString(this.color_ || scolor);
		context.textAlign = "center";
		context.textBaseline = "middle";
		var t = this.glyph_.char;
		if (renderOptions.strokeWidth && scolor!="transparent") context.strokeText(t, tr.posX, tr.posY);
		context.fillText(t, tr.posX, tr.posY);
	}
	if (this.form_=="ban" && this.stroke_ && renderOptions.strokeWidth) 
	{	context.strokeStyle = renderOptions.strokeStyle;
		context.lineWidth = renderOptions.strokeWidth;
		var r = this.radius_ + renderOptions.strokeWidth;
		var d = this.radius_ * Math.cos(Math.PI/4);
		context.moveTo(r + d, r - d);
		context.lineTo(r - d, r + d);
		context.stroke();
	}
};
/**
 * @inheritDoc
 */
ol.style.FontSymbol.prototype.getChecksum = function()
{
	var strokeChecksum = (this.stroke_!==null) ?
		this.stroke_.getChecksum() : '-';
	var fillChecksum = (this.fill_!==null) ?
		this.fill_.getChecksum() : '-';
	var recalculate = (this.checksums_===null) ||
		(strokeChecksum != this.checksums_[1] ||
		fillChecksum != this.checksums_[2] ||
		this.radius_ != this.checksums_[3] ||
		this.form_+"-"+this.glyphs_ != this.checksums_[4]);
	if (recalculate) {
		var checksum = 'c' + strokeChecksum + fillChecksum 
			+ ((this.radius_ !== void 0) ? this.radius_.toString() : '-')
			+ this.form_+"-"+this.glyphs_;
		this.checksums_ = [checksum, strokeChecksum, fillChecksum, this.radius_, this.form_+"-"+this.glyphs_];
	}
	return this.checksums_[0];
};

/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*
*  Photo style for vector features
*/
/**
 * @classdesc
 * Set Photo style for vector features.
 *
 * @constructor
 * @param {} options
 *  @param { default | square | round | anchored | folio } options.kind
 *  @param {boolean} options.crop crop within square, default is false
 *  @param {Number} options.radius symbol size
 *  @param {boolean} options.shadow drop a shadow
 *  @param {ol.style.Stroke} options.stroke
 *  @param {String} options.src image src
 *  @param {String} options.crossOrigin The crossOrigin attribute for loaded images. Note that you must provide a crossOrigin value if you want to access pixel data with the Canvas renderer.
 *  @param {Number} options.offsetX Horizontal offset in pixels. Default is 0.
 *  @param {Number} options.offsetY Vertical offset in pixels. Default is 0.
 *  @param {function} options.onload callback when image is loaded (to redraw the layer)
 * @extends {ol.style.RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
ol.style.Photo = function(options) {
  options = options || {};
  this.sanchor_ = options.kind=="anchored" ? 8:0;
  this.shadow_ = Number(options.shadow) || 0;
  if (!options.stroke) {
    options.stroke = new ol.style.Stroke({ width: 0, color: "#000"})
  }
  var strokeWidth = options.stroke.getWidth();
  if (strokeWidth<0) strokeWidth = 0;
  if (options.kind=='folio') strokeWidth += 6;
  options.stroke.setWidth(strokeWidth);
  ol.style.RegularShape.call (this, {
    radius: options.radius + strokeWidth + this.sanchor_/2 + this.shadow_/2, 
    points:0
  //	fill:new ol.style.Fill({color:"red"}) // No fill to create a hit detection Image
  });
  // Hack to get the hit detection Image (no API exported)
  if (!this.hitDetectionCanvas_) {
    var img = this.getImage();
    for (var i in this) {
      if (this[i] && this[i].getContext && this[i]!==img) {
        this.hitDetectionCanvas_ = this[i];
        break;
      }
    }
  }
  // Clone canvas for hit detection
  this.hitDetectionCanvas_ = document.createElement('canvas');
  this.hitDetectionCanvas_.width = this.getImage().width;
  this.hitDetectionCanvas_.height = this.getImage().height;
  this.stroke_ = options.stroke;
  this.fill_ = options.fill;
  this.crop_ = options.crop;
  this.crossOrigin_ = options.crossOrigin;
  this.kind_ = options.kind || "default";
  this.radius_ = options.radius;
  this.src_ = options.src;
  this.offset_ = [options.offsetX ? options.offsetX :0, options.offsetY ? options.offsetY :0];
  this.onload_ = options.onload;
  if (typeof(options.opacity)=='number') this.setOpacity(options.opacity);
  if (typeof(options.rotation)=='number') this.setRotation(options.rotation);
  this.renderPhoto_();
};
ol.ext.inherits(ol.style.Photo, ol.style.RegularShape);
/**
 * Clones the style. 
 * @return {ol.style.Photo}
 */
ol.style.Photo.prototype.clone = function() {
  return new ol.style.Photo({
    stroke: this.stroke_,
    fill: this.fill_,
    shadow: this.shadow_,
    crop: this.crop_,
    crossOrigin: this.crossOrigin_,
    kind: this.kind_,
    radius: this.radius_,
    src: this.src_,
    offsetX: this.offset_[0],
    offsetY: this.offset_[1],
    opacity: this.getOpacity(),
    rotation: this.getRotation()
  });
};
/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * Draw a rectangle if the radius is null.
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius.
 */
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (!r) {
    this.rect(x,y,w,h);
  } else {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y, x+w, y+h, r);
    this.arcTo(x+w, y+h, x, y+h, r);
    this.arcTo(x, y+h, x, y, r);
    this.arcTo(x, y, x+w, y, r);
    this.closePath();
  }
  return this;
};
/**
 * Draw the form without the image
 * @private
 */
ol.style.Photo.prototype.drawBack_ = function(context, color, strokeWidth) {
  var canvas = context.canvas;
  context.beginPath();
  context.fillStyle = color;
  context.clearRect(0, 0, canvas.width, canvas.height);
  switch (this.kind_) {
    case 'square': {
      context.rect(0,0,canvas.width-this.shadow_, canvas.height-this.shadow_);
      break;
    }
    case 'circle': {
      context.arc(this.radius_+strokeWidth, this.radius_+strokeWidth, this.radius_+strokeWidth, 0, 2 * Math.PI, false);
      break;
    }
    case 'folio': {
      var offset = 6;
      strokeWidth -= offset;
      context.strokeStyle = 'rgba(0,0,0,0.5)';
      var w = canvas.width-this.shadow_-2*offset;
      var a = Math.atan(6/w);
      context.save();
      context.rotate(-a);
      context.translate(-6,2);
      context.beginPath();
      context.rect(offset,offset,w,w);
      context.stroke();
      context.fill();
      context.restore();
      context.save();
      context.translate(6,-1);
      context.rotate(a);
      context.beginPath();
      context.rect(offset,offset,w,w);
      context.stroke();
      context.fill();
      context.restore();
      context.beginPath();
      context.rect(offset,offset,w,w);
      context.stroke();
      break;
    }
    case 'anchored': {
      context.roundRect(this.sanchor_/2,0,canvas.width-this.sanchor_-this.shadow_, canvas.height-this.sanchor_-this.shadow_, strokeWidth);
      context.moveTo(canvas.width/2-this.sanchor_-this.shadow_/2,canvas.height-this.sanchor_-this.shadow_);
      context.lineTo(canvas.width/2+this.sanchor_-this.shadow_/2,canvas.height-this.sanchor_-this.shadow_);
      context.lineTo(canvas.width/2-this.shadow_/2,canvas.height-this.shadow_);break;
    }
    default: {
      // roundrect
      context.roundRect(0,0,canvas.width-this.shadow_, canvas.height-this.shadow_, strokeWidth);
      break;
    }
  }
  context.closePath();
};
/**
 * @private
 */
ol.style.Photo.prototype.renderPhoto_ = function() {
  var strokeStyle;
  var strokeWidth = 0;
  if (this.stroke_) {
    strokeStyle = ol.color.asString(this.stroke_.getColor());
    strokeWidth = this.stroke_.getWidth();
  }
  var canvas = this.getImage();
  // Draw hitdetection image
  var context = this.hitDetectionCanvas_.getContext('2d');
  this.drawBack_(context,"#000",strokeWidth);
  context.fill();
  // Draw the image
  context = canvas.getContext('2d');
  this.drawBack_(context,strokeStyle,strokeWidth);
  // Draw a shadow
  if (this.shadow_) {
    context.shadowColor = 'rgba(0,0,0,0.5)';
    context.shadowBlur = this.shadow_/2;
    context.shadowOffsetX = this.shadow_/2;
    context.shadowOffsetY = this.shadow_/2;
  }
  context.fill();
  context.shadowColor = 'transparent';
  var self = this;
  var img = this.img_ = new Image();
  if (this.crossOrigin_) img.crossOrigin = this.crossOrigin_;
  img.src = this.src_;
  // Draw image
  if (img.width) {
    self.drawImage_(img);
  } else {
    img.onload = function() {
      self.drawImage_(img);
      // Force change (?!)
      // self.setScale(1);
      if (self.onload_) self.onload_();
    };
  }
  // Set anchor
  var a = this.getAnchor();
  a[0] = (canvas.width - this.shadow_)/2;
  a[1] = (canvas.height - this.shadow_)/2;
  if (this.sanchor_) {
    a[1] = canvas.height - this.shadow_;
  }
};
/**
 * Draw an timage when loaded
 * @private
 */
ol.style.Photo.prototype.drawImage_ = function(img) {
  var canvas = this.getImage();
  // Remove the circle on the canvas
  var context = (canvas.getContext('2d'));
  var strokeWidth = 0;
  if (this.stroke_) strokeWidth = this.stroke_.getWidth();
  var size = 2*this.radius_;
  context.save();
  if (this.kind_=='circle') {
    context.beginPath();
    context.arc(this.radius_+strokeWidth, this.radius_+strokeWidth, this.radius_, 0, 2 * Math.PI, false);
    context.clip();
  }
  var s, x, y, w, h, sx, sy, sw, sh;
  // Crop the image to a square vignette
  if (this.crop_) {
    s = Math.min (img.width/size, img.height/size);
    sw = sh = s*size;
    sx = (img.width-sw)/2;
    sy = (img.height-sh)/2;
    x = y = 0;
    w = h = size+1;
  } else {
    // Fit the image to the size
    s = Math.min (size/img.width, size/img.height);
    sx = sy = 0;
    sw = img.width;
    sh = img.height;
    w = s*sw;
    h = s*sh;
    x = (size-w)/2;
    y = (size-h)/2;
  }
  x += strokeWidth + this.sanchor_/2;
  y += strokeWidth;
  context.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  context.restore();
  // Draw a circle to avoid aliasing on clip
  if (this.kind_=='circle' && strokeWidth) {
    context.beginPath();
    context.strokeStyle = ol.color.asString(this.stroke_.getColor());
    context.lineWidth = strokeWidth/4;
    context.arc(this.radius_+strokeWidth, this.radius_+strokeWidth, this.radius_, 0, 2 * Math.PI, false);
    context.stroke();
  }
};

/** Add a setTextPath style to draw text along linestrings
@toto letterpadding/spacing, wordpadding/spacing
*/
(function()
{
/** Internal drawing function called on postcompose
* @param {ol.eventPoscompose} e postcompose event
*/
function drawTextPath (e)
{	// Prent drawing at large resolution
	if (e.frameState.viewState.resolution > this.textPathMaxResolution_) return;
	var extent = e.frameState.extent;
	var c2p = e.frameState.coordinateToPixelTransform;
	// Get pixel path with coordinates
	var k;
	function getPath(c, readable)
	{	var path1 = [];
		for (k=0; k<c.length; k++) 
		{	path1.push(c2p[0]*c[k][0]+c2p[1]*c[k][1]+c2p[4]);
			path1.push(c2p[2]*c[k][0]+c2p[3]*c[k][1]+c2p[5]);
		}
		// Revert line ?
		if (readable && path1[0]>path1[path1.length-2])
		{	var path2 = [];
			for (k=path1.length-2; k>=0; k-=2)
			{	path2.push(path1[k]);
				path2.push(path1[k+1]);
			}
			return path2;
		}
		else return path1;
	}
	var ctx = e.context;
	ctx.save();
	ctx.scale(e.frameState.pixelRatio,e.frameState.pixelRatio);
	var features = this.getSource().getFeaturesInExtent(extent);
	for (var i=0, f; f=features[i]; i++)
	{	{	var style = this.textPathStyle_(f,e.frameState.viewState.resolution);
			for (var s,j=0; s=style[j]; j++)
			{	
				var g = s.getGeometry() || f.getGeometry();
				var c;
				switch (g.getType())
				{	case "LineString": c = g.getCoordinates(); break;
					case "MultiLineString": c = g.getLineString(0).getCoordinates(); break;
					default: continue;
				}
				var st = s.getText();
				var path = getPath(c, st.getRotateWithView() );
				ctx.font = st.getFont();
				ctx.textBaseline = st.getTextBaseline();
				ctx.textAlign = st.getTextAlign();
				ctx.lineWidth = st.getStroke() ? (st.getStroke().getWidth()||0) : 0;
				ctx.strokeStyle = st.getStroke() ? (st.getStroke().getColor()||"#fff") : "#fff";
				ctx.fillStyle = st.getFill() ? st.getFill().getColor()||"#000" : "#000";
				// New params
				ctx.textJustify = st.getTextAlign()=="justify";
				ctx.textOverflow = st.getTextOverflow ? st.getTextOverflow():"";
				ctx.minWidth = st.getMinWidth ? st.getMinWidth():0;
				// Draw textpath
				ctx.textPath(st.getText()||f.get("name"), path);
			}
		}
	}
	ctx.restore();
}
/** Set the style for features. 
*	This can be a single style object, an array of styles, or a function that takes a feature and resolution and 
*	returns an array of styles. If it is undefined the default style is used. 
*	If it is null the layer has no style (a null style). 
*	See ol.style for information on the default style.
*	@param {ol.style.Style|Array.<ol.style.Style>|ol.StyleFunction} style
*	@param {Number} maxResolution to display text, default: 0
*/
ol.layer.Vector.prototype.setTextPathStyle = function(style, maxResolution)
{
	// Remove existing style
	if (style===null)
	{	if (this.textPath_) this.unByKey(this.textPath_);
		this.textPath_ = null;
		this.changed();
		return;
	}
	// New postcompose
	if (!this.textPath_)
	{	this.textPath_ = this.on(['postcompose','postrender'], drawTextPath.bind(this));
	}
	// Set textPathStyle
	if (style===undefined)
	{	style = [ new ol.style.Style({ text: new ol.style.Text()}) ];
	}
	if (typeof(style) == "function") this.textPathStyle_ = style;
	else this.textPathStyle_ = function() { return style; };
	this.textPathMaxResolution_ = Number(maxResolution) || Number.MAX_VALUE;
	// Force redraw
	this.changed();
}
/** Add new properties to ol.style.Text
* to use with ol.layer.Vector.prototype.setTextPathStyle
* @constructor
* @param {} options
*	@param {visible|ellipsis|string} textOverflow
*	@param {number} minWidth minimum width (px) to draw text, default 0
*/
ol.style.TextPath = function(options)
{	if (!options) options={};
	ol.style.Text.call (this, options);
	this.textOverflow_ = typeof(options.textOverflow)!="undefined" ?  options.textOverflow : "visible";
	this.minWidth_ = options.minWidth || 0;
}
ol.ext.inherits(ol.style.TextPath, ol.style.Text);
ol.style.TextPath.prototype.getTextOverflow = function()
{	return this.textOverflow_; 
};
ol.style.TextPath.prototype.getMinWidth = function()
{	return this.minWidth_; 
};
/**/
})();
/** CanvasRenderingContext2D: draw text along path
* @param {string} text
* @param {Array<Number>} path
*/
CanvasRenderingContext2D.prototype.textPath = function (text, path)
{
	var ctx = this;
	function dist2D(x1,y1,x2,y2)
	{	var dx = x2-x1;
		var dy = y2-y1;
		return Math.sqrt(dx*dx+dy*dy);
	}
	var di, dpos=0;
	var pos=2;
	function getPoint(path, dl)
	{	if (!di || dpos+di<dl)
		{ for (; pos<path.length; )
			{	di = dist2D(path[pos-2],path[pos-1],path[pos],path[pos+1]);
				if (dpos+di>dl) break;
				pos += 2;
				if (pos>=path.length) break;
				dpos += di;
			}
		}
		var x, y, a, dt = dl-dpos;
		if (pos>=path.length) 
		{	pos = path.length-2;
		}
		if (!dt) 
		{	x = path[pos-2];
			y = path[pos-1];
			a = Math.atan2(path[pos+1]-path[pos-1], path[pos]-path[pos-2]);
		}
		else
		{	x = path[pos-2]+ (path[pos]-path[pos-2])*dt/di;
			y = path[pos-1]+(path[pos+1]-path[pos-1])*dt/di;
			a = Math.atan2(path[pos+1]-path[pos-1], path[pos]-path[pos-2]);
		}
		return [x,y,a];
	}
	var letterPadding = ctx.measureText(" ").width *0.25;
	var start = 0;
	var d = 0;
	for (var i=2; i<path.length; i+=2)
	{	d += dist2D(path[i-2],path[i-1],path[i],path[i+1])
	}
	if (d < ctx.minWidth) return;
	var nbspace = text.split(" ").length -1;
	// Remove char for overflow
	if (ctx.textOverflow != "visible")
	{	if (d < ctx.measureText(text).width + (text.length-1 + nbspace) * letterPadding)
		{	var overflow = (ctx.textOverflow=="ellipsis") ? '\u2026' : ctx.textOverflow;
			do
			{	nbspace = text.split(" ").length -1;
				text = text.slice(0,text.length-1);
			} while (text && d < ctx.measureText(text+overflow).width + (text.length + overflow.length-1 + nbspace) * letterPadding)
			text += overflow;
		}
	}
	switch (ctx.textJustify || ctx.textAlign)
	{	case true: // justify
		case "center":
		case "end":
		case "right":
		{	// Text align
			if (ctx.textJustify) 
			{	start = 0;
				letterPadding = (d - ctx.measureText(text).width) / (text.length-1 + nbspace);
			}
			else
			{	start = d - ctx.measureText(text).width - (text.length + nbspace) * letterPadding;
				if (ctx.textAlign == "center") start /= 2;
			}
			break;
		}
		default: break;
	}
	for (var t=0; t<text.length; t++)
	{	var letter = text[t];
		var wl = ctx.measureText(letter).width;
		var p = getPoint(path, start+wl/2);
		ctx.save();
		ctx.textAlign = "center";
		ctx.translate(p[0], p[1]);
		ctx.rotate(p[2]);
		if (ctx.lineWidth) ctx.strokeText(letter,0,0);
		ctx.fillText(letter,0,0);
		ctx.restore();
		start += wl+letterPadding*(letter==" "?2:1);
	}
};
//NB: (Not confirmed)To use this module, you just have to :
//   import('ol-ext/layer/getpreview')
/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*
*  Shadow image style for point vector features
*/
/**
 * @requires ol.style.Circle
 * @requires ol.structs.IHasChecksum
 */
/**
 * @classdesc
 * Set Shadow style for point vector features.
 *
 * @constructor
 * @param {} options Options.
 *   @param {ol.style.Fill | undefined} options.fill fill style, default rgba(0,0,0,0.5)
 *   @param {number} options.radius point radius
 * 	 @param {number} options.blur lur radius, default radius/3
 * 	 @param {number} options.offsetX x offset, default 0
 * 	 @param {number} options.offsetY y offset, default 0
 * @extends {ol.style.RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
ol.style.Shadow = function(options)
{	options = options || {};
	if (!options.fill) options.fill = new ol.style.Fill({ color: "rgba(0,0,0,0.5)" });
	ol.style.RegularShape.call (this,{ radius: options.radius, fill: options.fill });
	this.fill_ = options.fill;
	this.radius_ = options.radius;
	this.blur_ = options.blur===0 ? 0 : options.blur || options.radius/3;
	this.offset_ = [options.offsetX ? options.offsetX : 0, options.offsetY ? options.offsetY : 0];
	this.renderShadow_();
};
ol.ext.inherits(ol.style.Shadow, ol.style.RegularShape);
/**
 * Clones the style. 
 * @return {ol.style.Shadow}
 */
ol.style.Shadow.prototype.clone = function()
{	var s = new ol.style.Shadow(
	{	fill: this.fill_,
		radius: this.radius_,
		blur: this.blur_,
		offsetX: this.offset_[0],
		offsetY: this.offset_[1]
	});
	s.setScale(this.getScale());
	s.setOpacity(this.getOpacity());
	return s;
};
/**
 * @private
 */
ol.style.Shadow.prototype.renderShadow_ = function()
{	
	var radius = this.radius_;
	var canvas = this.getImage();
	var s = [canvas.width, canvas.height];
	s[1] = radius;
	// Remove the circle on the canvas
	var context = (canvas.getContext('2d'));
	context.beginPath();
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.scale(1,0.5);
	context.arc(radius, -radius, radius-this.blur_, 0, 2 * Math.PI, false);
    context.fillStyle = '#000';
	context.shadowColor = this.fill_.getColor();
	context.shadowBlur = 0.7*this.blur_;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 1.5*radius;
	context.closePath();
    context.fill();
	context.shadowColor = 'transparent';
	// Set anchor
	var a = this.getAnchor();
	a[0] = canvas.width /2 -this.offset_[0];
	a[1] = canvas.height/2 -this.offset_[1];
}
/**
 * @inheritDoc
 */
ol.style.Shadow.prototype.getChecksum = function()
{
	var strokeChecksum = (this.stroke_!==null) ?
		this.stroke_.getChecksum() : '-';
	var fillChecksum = (this.fill_!==null) ?
		this.fill_.getChecksum() : '-';
	var recalculate = (this.checksums_===null) ||
		(strokeChecksum != this.checksums_[1] ||
		fillChecksum != this.checksums_[2] ||
		this.radius_ != this.checksums_[3] ||
		this.form_+"-"+this.glyphs_ != this.checksums_[4]);
	if (recalculate) {
		var checksum = 'c' + strokeChecksum + fillChecksum 
			+ ((this.radius_ !== void 0) ? this.radius_.toString() : '-')
			+ this.form_+"-"+this.glyphs_;
		this.checksums_ = [checksum, strokeChecksum, fillChecksum, this.radius_, this.form_+"-"+this.glyphs_];
	}
	return this.checksums_[0];
};

/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc
 * Stroke style with named pattern
 *
 * @constructor
 * @param {any}  options
 *	@param {ol.style.Image|undefined} options.image an image pattern, image must be preloaded to draw on first call
 *	@param {number|undefined} options.opacity opacity with image pattern, default:1
 *	@param {olx.style.fillPattern} options.pattern pattern name (override by image option)
 *	@param {ol.colorLike} options.color pattern color
 *	@param {ol.style.Fill} options.fill fill color (background)
 *	@param {number} options.offset pattern offset for hash/dot/circle/cross pattern
 *	@param {number} options.size line size for hash/dot/circle/cross pattern
 *	@param {number} options.spacing spacing for hash/dot/circle/cross pattern
 *	@param {number|bool} options.angle angle for hash pattern / true for 45deg dot/circle/cross
 *	@param {number} options.scale pattern scale 
 * @extends {ol.style.Fill}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
ol.style.StrokePattern = function(options)
{	if (!options) options = {};
	var pattern, i;
	var canvas = this.canvas_ = document.createElement('canvas');
	var scale = Number(options.scale)>0 ? Number(options.scale) : 1;
	var ratio = scale*ol.has.DEVICE_PIXEL_RATIO || ol.has.DEVICE_PIXEL_RATIO;
	var ctx = canvas.getContext('2d');
	if (options.image)
	{	options.image.load();
		var img = options.image.getImage();
		if (img.width)
		{	canvas.width = Math.round(img.width *ratio);
			canvas.height = Math.round(img.height *ratio);
			ctx.globalAlpha = typeof(options.opacity) == 'number' ? options.opacity:1;
			ctx.drawImage(img, 0,0, img.width, img.height, 0, 0, canvas.width, canvas.height);
			pattern = ctx.createPattern(canvas, 'repeat');
		}
		else 
		{	var self = this;
			pattern = [0,0,0,0];
			img.onload = function ()
			{	canvas.width = Math.round(img.width *ratio);
				canvas.height = Math.round(img.height *ratio);
				ctx.globalAlpha = typeof(options.opacity) == 'number' ? options.opacity:1;
				ctx.drawImage(img, 0,0, img.width, img.height, 0, 0, canvas.width, canvas.height);
				pattern = ctx.createPattern(canvas, 'repeat');
				self.setColor(pattern);
			}
		}
	}
	else
	{	var pat = this.getPattern_(options);
		canvas.width = Math.round(pat.width *ratio);
		canvas.height = Math.round(pat.height *ratio);
		ctx.beginPath();
		if (options.fill) 
		{	ctx.fillStyle = ol.color.asString(options.fill.getColor());
			ctx.fillRect(0,0, canvas.width, canvas.height);
		}
		ctx.scale(ratio,ratio);
		ctx.lineCap = "round";
		ctx.lineWidth = pat.stroke || 1;
		ctx.fillStyle = ol.color.asString(options.color||"#000");
		ctx.strokeStyle = ol.color.asString(options.color||"#000");
		if (pat.circles) for (i=0; i<pat.circles.length; i++)
		{	var ci = pat.circles[i]; 
			ctx.beginPath();
			ctx.arc(ci[0], ci[1], ci[2], 0,2*Math.PI);
			if (pat.fill) ctx.fill();
			if (pat.stroke) ctx.stroke();
		}
		if (!pat.repeat) pat.repeat=[[0,0]];
		if (pat.char)
		{	ctx.font = pat.font || (pat.width)+"px Arial";
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			if (pat.angle) 
			{	ctx.fillText(pat.char, pat.width/4, pat.height/4);
				ctx.fillText(pat.char, 5*pat.width/4, 5*pat.height/4);
				ctx.fillText(pat.char, pat.width/4, 5*pat.height/4);
				ctx.fillText(pat.char, 5*pat.width/4, pat.height/4);
				ctx.fillText(pat.char, 3*pat.width/4, 3*pat.height/4);
				ctx.fillText(pat.char, -pat.width/4, -pat.height/4);
				ctx.fillText(pat.char, 3*pat.width/4, -pat.height/4);
				ctx.fillText(pat.char, -pat.width/4, 3*pat.height/4);
			}
			else ctx.fillText(pat.char, pat.width/2, pat.height/2);
		}
		if (pat.lines) for (i=0; i<pat.lines.length; i++) for (var r=0; r<pat.repeat.length; r++)
		{	var li = pat.lines[i];
			ctx.beginPath();
			ctx.moveTo(li[0]+pat.repeat[r][0],li[1]+pat.repeat[r][1]);
			for (var k=2; k<li.length; k+=2)
			{	ctx.lineTo(li[k]+pat.repeat[r][0],li[k+1]+pat.repeat[r][1]);
			}
			if (pat.fill) ctx.fill();
			if (pat.stroke) ctx.stroke();
			ctx.save()
			ctx.strokeStyle = 'red';
			ctx.strokeWidth = 0.1;
			//ctx.strokeRect(0,0,canvas.width,canvas.height);
			ctx.restore()
		}
		pattern = ctx.createPattern(canvas, 'repeat');
		if (options.offset)
		{	var offset = options.offset;
			if (typeof(offset) == "number") offset = [offset,offset];
			if (offset instanceof Array) 
			{	var dx = Math.round((offset[0]*ratio));
				var dy = Math.round((offset[1]*ratio));
				// New pattern
				ctx.scale(1/ratio,1/ratio)
				ctx.clearRect(0,0,canvas.width,canvas.height);
				ctx.translate(dx,dy);
				ctx.fillStyle = pattern;
				ctx.fillRect(-dx, -dy, canvas.width,canvas.height);
				pattern = ctx.createPattern(canvas, 'repeat');
			}
		}
	}
	options.color = pattern;
	ol.style.Stroke.call (this, options);
};
ol.ext.inherits(ol.style.StrokePattern, ol.style.Stroke);
/**
 * Clones the style. 
 * @return {ol.style.StrokePattern}
 */
ol.style.StrokePattern.prototype.clone = function() {
	var s = ol.style.Fill.prototype.clone.call(this);
	s.canvas_ = this.canvas_;
	return s;
};
/** Get canvas used as pattern
*	@return {canvas}
*/
ol.style.StrokePattern.prototype.getImage = function()
{	return this.canvas_;
}
/** Get pattern
*	@param {olx.style.FillPatternOption}
*/
ol.style.StrokePattern.prototype.getPattern_ = function(options)
{	var pat = ol.style.FillPattern.prototype.patterns[options.pattern]
		|| ol.style.FillPattern.prototype.patterns.dot;
	var d = Math.round(options.spacing)||10;
	var size;
//	var d2 = Math.round(d/2)+0.5;
	switch (options.pattern)
	{	case 'dot':
		case 'circle':
		{	size = options.size===0 ? 0 : options.size/2 || 2;
			if (!options.angle)
			{	pat.width = pat.height = d;
				pat.circles = [[ d/2, d/2, size ]]
				if (options.pattern=='circle')
				{	pat.circles = pat.circles.concat([
						[ d/2+d, d/2, size ],
						[ d/2-d, d/2, size ],
						[ d/2, d/2+d, size ],
						[ d/2, d/2-d, size ],
						[ d/2+d, d/2+d, size ],
						[ d/2+d, d/2-d, size ],
						[ d/2-d, d/2+d, size ],
						[ d/2-d, d/2-d, size ] ])
				}
			}
			else
			{	d = pat.width = pat.height = Math.round(d*1.4);
				pat.circles = [[ d/4, d/4, size ], [ 3*d/4, 3*d/4, size ]];
				if (options.pattern=='circle')
				{	pat.circles = pat.circles.concat([
						[ d/4+d, d/4, size ],
						[ d/4, d/4+d, size ],
						[ 3*d/4-d, 3*d/4, size ],
						[ 3*d/4, 3*d/4-d, size ],
						[ d/4+d, d/4+d, size ], 
						[ 3*d/4-d, 3*d/4-d, size ] ]);
				}
			}
			break;
		}
		case 'tile':
		case 'square':
		{	size = options.size===0 ? 0 : options.size/2 || 2;
			if (!options.angle)
			{	pat.width = pat.height = d;
				pat.lines = [[ d/2-size, d/2-size, d/2+size, d/2-size, d/2+size, d/2+size, d/2-size,d/2+size, d/2-size, d/2-size ]]
			}
			else
			{	pat.width = pat.height = d;
				//size *= Math.sqrt(2);
				pat.lines = [[ d/2-size,d/2, d/2,d/2-size, d/2+size,d/2, d/2,d/2+size, d/2-size,d/2 ]]
			}
			if (options.pattern=='square') pat.repeat = [[0,0], [0,d], [d,0], [0,-d], [-d,0], [-d,-d], [d,d], [-d,d], [d,-d] ]
			break;
		}
		case 'cross':
		{	// Limit angle to 0 | 45
			if (options.angle) options.angle = 45;
		}
		// fallthrough
		case 'hatch':
		{	var a = Math.round(((options.angle||0)-90)%360);
			if (a>180) a -= 360;
			a *= Math.PI/180;
			var cos = Math.cos(a);
			var sin = Math.sin(a);
			if (Math.abs(sin)<0.0001)
			{	pat.width = pat.height = d;	
				pat.lines = [ [ 0,0.5, d, 0.5 ] ];
				pat.repeat = [ [0,0], [0,d] ];
			}
			else  if (Math.abs(cos)<0.0001)
			{	pat.width = pat.height = d;	
				pat.lines = [ [ 0.5,0, 0.5, d] ];
				pat.repeat = [ [0,0], [d,0] ];
				if (options.pattern=='cross') 
				{	pat.lines.push ([ 0,0.5, d, 0.5 ]);
					pat.repeat.push([0,d]);
				}
			}
			else
			{	var w = pat.width = Math.round(Math.abs(d/sin)) || 1;
				var h = pat.height = Math.round(Math.abs(d/cos)) || 1;
				if (options.pattern=='cross')
				{	pat.lines = [ [-w,-h, 2*w,2*h], [2*w,-h, -w,2*h] ];
					pat.repeat = [ [0,0] ];
				}
				else if (cos*sin>0) 
				{	pat.lines = [ [-w,-h, 2*w,2*h] ];
					pat.repeat = [ [0,0], [w,0], [0,h] ];
				}
				else 
				{	pat.lines = [ [2*w,-h, -w,2*h] ];
					pat.repeat = [ [0,0], [-w,0], [0,h] ];
				}
			}
			pat.stroke = options.size===0 ? 0 : options.size||4;
			break;
		}
		default: {
			break;
		}
	}
	return pat
}
