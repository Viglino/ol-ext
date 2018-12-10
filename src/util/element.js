/** Vanilla JS helper to manipulate DOM without jQuery
 * @see https://github.com/nefe/You-Dont-Need-jQuery
 * @see https://plainjs.com/javascript/
 */
var ol_ext_element = {};

/**
 * Create an element
 * @param {string} tagName The element tag, use 'TEXT' to create a text node
 * @param {*} options
 *  @param {string} className The element class name 
 *  @param {Element} parent Parent to append the element as child
 *  @param {Element|string} html Content of the element
 *  @param {string} * Any other attribut to add to the element
 */
ol_ext_element.create = function (tagName, options) {
  options = options || {};
  // Text noe
  if (tagName === 'TEXT') {
    var elt = document.createTextNode(options.html||'');
    if (options.parent) options.parent.appendChild(elt);
  } else {
    // Other element
    var elt = document.createElement(tagName);
    if (/button/i.test(tagName)) elt.setAttribute('type', 'button');
    for (var attr in options) {
      switch (attr) {
        case 'className': {
          elt.setAttribute('class', options.className.trim());
          break;
        }
        case 'html': {
          if (options.html instanceof Element) elt.appendChild(options.html)
          else elt.innerHTML = options.html;
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
        default: {
          elt.setAttribute(attr, options[attr]);
          break;
        }
      }
    }
  }

  return elt;
};

/**
 * Add a set of event listener to an element
 * @param {Element} element
 * @param {string|Array<string>} eventType
 * @param {function} fn
 */
ol_ext_element.addListener = function (element, eventType, fn) {
  if (typeof eventType === 'string') eventType = [eventType];
  eventType.forEach(function(e) {
    element.addEventListener(e, fn);
  });
};

/**
 * Show an element
 * @param {Element} element
 */
ol_ext_element.show = function (element) {
  element.style.display = '';
};

/**
 * Hide an element
 * @param {Element} element
 */
ol_ext_element.hide = function (element) {
  element.style.display = 'none';
};

/**
 * Toggle an element
 * @param {Element} element
 */
ol_ext_element.toggle = function (element) {
  element.style.display = (element.style.display==='none' ? '' : 'none');
};

/** Set style of an element
 * @param {DOMElement} el the element
 * @param {*} st list of style
 */
ol_ext_element.setStyle = function(el, st) {
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
        if (typeof(st[s] === 'number')) {
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
ol_ext_element.getStyle = function(el, styleProp) {
  var value, defaultView = (el.ownerDocument || document).defaultView;
  // W3C standard way:
  if (defaultView && defaultView.getComputedStyle) {
    // sanitize property name to css notation
    // (hypen separated words eg. font-Size)
    styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
    value = defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  } else if (el.currentStyle) { // IE
    // sanitize property name to camelCase
    styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
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

/** Make a div scrollable withiout scrollbar.
 * On touch devices the default behavior is preserved
 * @param {DOMElement} elt
 * @param {function} onmove a function that takes a boolean indicating that the div is scrolling
 */
ol_ext_element.scrollDiv = function(elt, options) {
  var pos = false;
  var speed = 0;
  var dt = 0;

  var onmove = (typeof(options.onmove) === 'function' ? options.onmove : function(){});

  // Start scrolling
  ol_ext_element.addListener(elt, ['mousedown'], function(e) {
    pos = e.pageX;
    dt = new Date();
    elt.classList.add('ol-move');
  });
  
  // Register scroll
  ol_ext_element.addListener(window, ['mousemove'], function(e) {
    if (pos !== false) {
      var delta = pos - e.pageX;
      elt.scrollLeft += delta;
      speed = (speed + delta / (new Date() - dt))/2;
      pos = e.pageX;
      dt = new Date();
      // Tell we are moving
      if (delta) onmove(true);
    } else {
      // Not moving yet
      onmove(false);
    }
  });
  
  // Stop scrolling
  ol_ext_element.addListener(window, ['mouseup'], function(e) {
    elt.classList.remove('ol-move');
    dt = new Date() - dt;
    if (dt>100) {
      // User stop: no speed
      speed = 0;
    } else if (dt>0) {
      // Calculate new speed
      speed = (speed + (pos - e.pageX) / dt) / 2;
    } 
    elt.scrollLeft += speed*100;
    pos = false;
    speed = 0;
  });
};

export default ol_ext_element