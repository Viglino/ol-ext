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


export default ol_ext_element