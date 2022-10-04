import ol_control_Control from 'ol/control/Control.js'
import ol_ext_element from '../util/element.js'

/** Bookmark positions on ol maps.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires add
 * @fires remove
 * @fires select
 * @param {} options Geobookmark's options
 *  @param {string} options.className default ol-bookmark
 *  @param {string | undefined} options.title Title to use for the button tooltip, default "Geobookmarks"
 *  @param {string} options.placeholder input placeholder, default Add a new geomark...
 *  @param {string} [options.deleteTitle='Suppr.'] title for delete buttons
 *  @param {bool} options.editable enable modification, default true
 *  @param {string} options.namespace a namespace to save the boolmark (if more than one on a page), default ol
 *  @param {Array<any>} options.marks a list of default bookmarks: 
 * @see [Geobookmark example](../../examples/control/map.control.geobookmark.html)
 * @example 
var bm = new GeoBookmark ({ 
  marks: {
    "Paris": {pos:ol.proj.transform([2.351828, 48.856578], 'EPSG:4326', 'EPSG:3857'), zoom:11, permanent: true },
    "London": {pos:ol.proj.transform([-0.1275,51.507222], 'EPSG:4326', 'EPSG:3857'), zoom:12}
  }
});
 */
var ol_control_GeoBookmark = class olcontrolGeoBookmark extends ol_control_Control {
  constructor(options) {
    options = options || {};

    var element = document.createElement('div');
    // Init
    super({
      element: element,
      target: options.target
    });
    
    var self = this;

    if (options.target) {
      element.className = options.className || "ol-bookmark";
    } else {
      element.className = (options.className || "ol-bookmark") +
        " ol-unselectable ol-control ol-collapsed";
      element.addEventListener("mouseleave", function () {
        if (input !== document.activeElement) {
          menu.style.display = 'none';
        }
      });
      // Show bookmarks on click
      this.button = ol_ext_element.create('BUTTON', {
        type: 'button',
        title: options.title || 'Geobookmarks',
        click: function () {
          var show = (menu.style.display === '' || menu.style.display === 'none');
          menu.style.display = (show ? 'block' : 'none');
          if (show)
            this.setBookmarks();
        }.bind(this)
      });
      element.appendChild(this.button);
    }
    // The menu
    var menu = document.createElement('div');
    element.appendChild(menu);
    var ul = document.createElement('ul');
    menu.appendChild(ul);
    var input = document.createElement('input');
    input.setAttribute("placeholder", options.placeholder || "Add a new geomark...");
    input.addEventListener("keydown", function (e) {
      e.stopPropagation();
      if (e.keyCode === 13) {
        e.preventDefault();
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
      }
    });
    input.addEventListener("blur", function () {
      menu.style.display = 'none';
    });
    menu.appendChild(input);

    this.on("propertychange", function (e) {
      if (e.key === 'editable') {
        element.className = element.className.replace(" ol-editable", "");
        if (this.get('editable')) {
          element.className += " ol-editable";
        }
      }
      // console.log(e);
    }.bind(this));

    this.set("namespace", options.namespace || 'ol');
    this.set("editable", options.editable !== false);
    this.set('deleteTitle', options.deleteTitle || 'Suppr.');

    // Set default bmark
    var bmark = {};
    try {
      if (localStorage[this.get('namespace') + "@bookmark"]) {
        bmark = JSON.parse(localStorage[this.get('namespace') + "@bookmark"]);
      }
    } catch (e) { console.warn('Failed to access localStorage...'); }
    if (options.marks) {
      for (var i in options.marks) {
        bmark[i] = options.marks[i];
      }
    }
    this.setBookmarks(bmark);
  }
  /** Set bookmarks
   * @param {} bmark a list of bookmarks, default retreave in the localstorage
   * @example
  bm.setBookmarks({
    "Paris": {pos:_ol_proj_.transform([2.351828, 48.856578], 'EPSG:4326', 'EPSG:3857'), zoom:11, permanent: true },
    "London": {pos:_ol_proj_.transform([-0.1275,51.507222], 'EPSG:4326', 'EPSG:3857'), zoom:12}
  });
   */
  setBookmarks(bmark) {
    if (!bmark) {
      bmark = {};
      try {
        bmark = JSON.parse(localStorage[this.get('namespace') + "@bookmark"] || "{}");
      } catch (e) { console.warn('Failed to access localStorage...'); }
    }
    var modify = this.get("editable");
    var ul = this.element.querySelector("ul");
    var menu = this.element.querySelector("div");
    var self = this;

    ul.innerHTML = '';
    for (var b in bmark) {
      var li = document.createElement('li');
      li.textContent = b;
      li.setAttribute('data-bookmark', JSON.stringify(bmark[b]));
      li.setAttribute('data-name', b);
      li.addEventListener('click', function () {
        var bm = JSON.parse(this.getAttribute("data-bookmark"));
        self.getMap().getView().setCenter(bm.pos);
        self.getMap().getView().setZoom(bm.zoom);
        self.getMap().getView().setRotation(bm.rot || 0);
        menu.style.display = 'none';
        self.dispatchEvent({ type: 'select', name: this.getAttribute("data-name"), bookmark: bm });
      });
      ul.appendChild(li);
      if (modify && !bmark[b].permanent) {
        var button = document.createElement('button');
        button.setAttribute('data-name', b);
        button.setAttribute('type', 'button');
        button.setAttribute('title', this.get('deleteTitle') || 'Suppr.');
        button.addEventListener('click', function (e) {
          self.removeBookmark(this.getAttribute("data-name"));
          self.dispatchEvent({ type: "remove", name: this.getAttribute("data-name") });
          e.stopPropagation();
        });
        li.appendChild(button);
      }
    }
    try {
      localStorage[this.get('namespace') + "@bookmark"] = JSON.stringify(bmark);
    } catch (e) { console.warn('Failed to access localStorage...'); }
  }
  /** Get Geo bookmarks
   * @return {any} a list of bookmarks : { BM1:{pos:ol.coordinates, zoom: integer}, BM2:{pos:ol.coordinates, zoom: integer} }
   */
  getBookmarks() {
    var bm = {};
    try {
      bm = JSON.parse(localStorage[this.get('namespace') + "@bookmark"] || "{}");
    } catch (e) { console.warn('Failed to access localStorage...'); }
    return bm;
  }
  /** Remove a Geo bookmark
   * @param {string} name
   */
  removeBookmark(name) {
    if (!name) {
      return;
    }
    var bmark = this.getBookmarks();
    delete bmark[name];
    this.setBookmarks(bmark);
  }
  /** Add a new Geo bookmark (replace existing one if any)
   * @param {string} name name of the bookmark (display in the menu)
   * @param {*} options
   *  @param {ol.coordinate} position default current position
   *  @param {number} zoom default current map zoom
   *  @param {number} rotation default current map rotation
   *  @param {bool} permanent prevent from deletion, default false
   */
  addBookmark(name, position, zoom, permanent) {
    if (!name)
      return;
    var options = position;
    var rot;
    if (options && options.position) {
      zoom = options.zoom;
      permanent = options.permanent;
      rot = options.rotation;
      position = options.position;
    } else {
      rot = this.getMap().getView().getRotation();
    }
    var bmark = this.getBookmarks();
    // Don't override permanent bookmark
    if (bmark[name] && bmark[name].permanent)
      return;
    // Create or override
    bmark[name] = {
      pos: position || this.getMap().getView().getCenter(),
      zoom: zoom || this.getMap().getView().getZoom(),
      permanent: !!permanent
    };
    if (rot) {
      bmark[name].rot = rot;
    }
    this.setBookmarks(bmark);
  }
}

export default ol_control_GeoBookmark