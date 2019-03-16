import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'

/** Bookmark positions on ol maps.
 *
 * @constructor
 * @extends {ol_control_Control}
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
var ol_control_GeoBookmark = function(options) {
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
  ol_control_Control.call(this, {
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
ol_ext_inherits(ol_control_GeoBookmark, ol_control_Control);

/** Set bookmarks
* @param {} bmark a list of bookmarks, default retreave in the localstorage
* @example 
bm.setBookmarks({ 
  "Paris": {pos:_ol_proj_.transform([2.351828, 48.856578], 'EPSG:4326', 'EPSG:3857'), zoom:11, permanent: true },
  "London": {pos:_ol_proj_.transform([-0.1275,51.507222], 'EPSG:4326', 'EPSG:3857'), zoom:12}
});
*/
ol_control_GeoBookmark.prototype.setBookmarks = function(bmark) {
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
ol_control_GeoBookmark.prototype.getBookmarks = function() {
  return JSON.parse(localStorage[this.get('namespace')+"@bookmark"] || "{}");
};

/** Remove a Geo bookmark
* @param {string} name
*/
ol_control_GeoBookmark.prototype.removeBookmark = function(name) {
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
ol_control_GeoBookmark.prototype.addBookmark = function(name, position, zoom, permanent)
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

export default ol_control_GeoBookmark