/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_control_Control from 'ol/control/Control'
import ol_layer_Tile from 'ol/layer/Tile'
import ol_layer_Vector from 'ol/layer/Vector'
import ol_layer_VectorTile from 'ol/layer/VectorTile'
import ol_layer_Image from 'ol/layer/Image'
import ol_layer_Heatmap from 'ol/layer/Heatmap'
import {intersects as ol_extent_intersects} from 'ol/extent'

import ol_ext_element from '../util/element'

/**
 * @classdesc OpenLayers 3 Layer Switcher Control.
 * @fires drawlist
 * @fires toggle
 * @fires reorder-start
 * @fires reorder-end
 * 
 * @constructor
 * @extends {ol_control_Control}
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
 *  @param {ol.layer.Group} options.layerGroup a layer group to display in the switcher, default display all layers of the map
 *
 * Layers attributes that control the switcher
 *	- allwaysOnTop {boolean} true to force layer stay on top of the others while reordering, default false
 *	- displayInLayerSwitcher {boolean} display in switcher, default true
 *	- noSwitcherDelete {boolean} to prevent layer deletion (w. trash option = true), default false
 */
var ol_control_LayerSwitcher = function(options) {
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
  this._layerGroup = (options.layerGroup && options.layerGroup.getLayers) ? options.layerGroup : null;

  // displayInLayerSwitcher
  if (typeof(options.displayInLayerSwitcher) === 'function') {
    this.displayInLayerSwitcher = options.displayInLayerSwitcher;
  }

  var element;
  if (options.target) {
    element = ol_ext_element.create('DIV', {
      className: options.switcherClass || "ol-layerswitcher"
    });
  } else {
    element = ol_ext_element.create('DIV', {
      className: (options.switcherClass || "ol-layerswitcher") +' ol-unselectable ol-control'
    });
    if (options.collapsed !== false) element.classList.add('ol-collapsed'); 
    else element.classList.add('ol-forceopen'); 
  
    this.button = ol_ext_element.create('BUTTON', {
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

    this.topv = ol_ext_element.create('DIV', {
      className: 'ol-switchertopdiv',
      parent: element,
      click: function() {
        self.overflow("+50%");
      }
    });

    this.botv = ol_ext_element.create('DIV', {
      className: 'ol-switcherbottomdiv',
      parent: element,
      click: function() {
        self.overflow("-50%");
      }
    });
  }

  this.panel_ = ol_ext_element.create ('UL', {
    className: 'panel',
    parent: element
  });
  ol_ext_element.addListener (this.panel_, 'mousewheel DOMMouseScroll onmousewheel', function(e) {
    if (self.overflow(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))))) {
      e.stopPropagation();
      e.preventDefault();
    }
  });

  this.header_ = ol_ext_element.create('LI', {
    className: 'ol-header',
    parent: this.panel_
  });

  ol_control_Control.call (this, {
    element: element,
    target: options.target
  });

  this.set('drawDelay',options.drawDelay||0);
};
ol_ext_inherits(ol_control_LayerSwitcher, ol_control_Control);

/** List of tips for internationalization purposes
*/
ol_control_LayerSwitcher.prototype.tip = {
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
ol_control_LayerSwitcher.prototype.displayInLayerSwitcher = function(layer) {
  return (layer.get("displayInLayerSwitcher")!==false);
};

/**
 * Set the map instance the control is associated with.
 * @param {_ol_Map_} map The map instance.
 */
ol_control_LayerSwitcher.prototype.setMap = function(map) {
  ol_control_Control.prototype.setMap.call(this, map);
  this.drawPanel();
  
  if (this._listener) {
    if (this._listener) ol_Observable_unByKey(this._listener.change);
    if (this._listener) ol_Observable_unByKey(this._listener.moveend);
    if (this._listener) ol_Observable_unByKey(this._listener.size);
  }
  this._listener = null;

  // Get change (new layer added or removed)
  if (map) {
    this._listener = {
      moveend: map.on('moveend', this.viewChange.bind(this)),
      size: map.on('change:size', this.overflow.bind(this))
    }
    // Listen to a layer group
    if (this._layerGroup) {
      this._listener.change = this._layerGroup.on('change', this.drawPanel.bind(this));
    } else  {
      //Listen to all layers
      this._listener.change = map.getLayerGroup().on('change', this.drawPanel.bind(this));
    }
  }
};

/** Show control
 */
ol_control_LayerSwitcher.prototype.show = function() {
  this.element.classList.add("ol-forceopen");
  this.overflow();
};

/** Hide control
 */
ol_control_LayerSwitcher.prototype.hide = function() {
  this.element.classList.remove("ol-forceopen");
  this.overflow();
};

/** Toggle control
 */
ol_control_LayerSwitcher.prototype.toggle = function() {
  this.element.classList.toggle("ol-forceopen");
  this.overflow();
};

/** Is control open
 * @return {boolean}
 */
ol_control_LayerSwitcher.prototype.isOpen = function() {
  return this.element.classList.contains("ol-forceopen");
};

/** Add a custom header
 * @param {Element|string} html content html
 */
ol_control_LayerSwitcher.prototype.setHeader = function(html) {
  ol_ext_element.setHTML(this.header_, html);
};

/** Calculate overflow and add scrolls
 *	@param {Number} dir scroll direction -1|0|1|'+50%'|'-50%'
 */
ol_control_LayerSwitcher.prototype.overflow = function(dir) {	
  if (this.button) {
    // Nothing to show
    if (ol_ext_element.hidden(this.panel_)) {
      ol_ext_element.setStyle(this.element, { height: 'auto' });
      return;
    }
    // Calculate offset
    var h = ol_ext_element.outerHeight(this.element);
    var hp = ol_ext_element.outerHeight(this.panel_);
    var dh = this.button.offsetTop + ol_ext_element.outerHeight(this.button);
    //var dh = this.button.position().top + this.button.outerHeight(true);

    var top = this.panel_.offsetTop - dh;
    if (hp > h-dh) {
      // Bug IE: need to have an height defined
      ol_ext_element.setStyle(this.element, { height: '100%' });
      var lh = 2 * ol_ext_element.getStyle(this.panel_.querySelectorAll('li.visible .li-content')[0], 'height');
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
        ol_ext_element.hide(this.botv);
      } else {
        ol_ext_element.show(this.botv);
      }
      if (top >= 0) {
        top = 0;
        ol_ext_element.hide(this.topv);
      } else {
        ol_ext_element.show(this.topv);
      }
      // Scroll ?
      ol_ext_element.setStyle(this.panel_, { top: top+"px" });
      return true;
    } else {
      ol_ext_element.setStyle(this.element, { height: "auto" });
      ol_ext_element.setStyle(this.panel_, { top: 0 });
      ol_ext_element.hide(this.botv);
      ol_ext_element.hide(this.topv);
      return false;
    }
  }
  else return false;
};

/** Set the layer associated with a li
 * @param {Element} li
 * @param {ol.layer} layer
 */
ol_control_LayerSwitcher.prototype._setLayerForLI = function(li, layer) {
  this._layers.push({ li:li, layer:layer });
};

/** Get the layer associated with a li
 * @param {Element} li
 * @return {ol.layer}
 */
ol_control_LayerSwitcher.prototype._getLayerForLI = function(li) {
  for (var i=0, l; l=this._layers[i]; i++) {
    if (l.li===li) return l.layer;
  }
  return null;
};

/**
 * On view change hide layer depending on resolution / extent
 * @private
 */
ol_control_LayerSwitcher.prototype.viewChange = function() {
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
ol_control_LayerSwitcher.prototype.drawPanel = function() {
  if (!this.getMap()) return;
  var self = this;
  // Multiple event simultaneously / draw once => put drawing in the event queue
  this.dcount++;
  setTimeout (function(){ self.drawPanel_(); }, this.get('drawDelay') || 0);
};

/** Delayed draw panel control 
 * @private
 */
ol_control_LayerSwitcher.prototype.drawPanel_ = function() {
  if (--this.dcount || this.dragging_) return;
  // Remove existing layers
  this._layers = [];
  this.panel_.querySelectorAll('li').forEach (function(li) {
    if (!li.classList.contains('ol-header')) li.remove();
  }.bind(this));
  // Draw list
  this.drawList (this.panel_, this._layerGroup ?  this._layerGroup.getLayers() : this.getMap().getLayers());
};

/** Change layer visibility according to the baselayer option
 * @param {ol.layer}
 * @param {Array<ol.layer>} related layers
 */
ol_control_LayerSwitcher.prototype.switchLayerVisibility = function(l, layers) {
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
ol_control_LayerSwitcher.prototype.testLayerVisibility = function(layer) {
  if (!this.getMap()) return true;
  var res = this.getMap().getView().getResolution();
  if (layer.getMaxResolution()<=res || layer.getMinResolution()>=res) {
    return false;
  } else {
    var ex0 = layer.getExtent();
    if (ex0) {
      var ex = this.getMap().getView().calculateExtent(this.getMap().getSize());
      return ol_extent_intersects(ex, ex0);
    }
    return true;
  }
};


/** Start ordering the list
*	@param {event} e drag event
*	@private
*/
ol_control_LayerSwitcher.prototype.dragOrdering_ = function(e) {
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

    ol_ext_element.removeListener(document, 'mousemove touchmove', move);
    ol_ext_element.removeListener(document, 'mouseup touchend touchcancel', stop);
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
      dragElt = ol_ext_element.create('LI', { 
        className: 'ol-dragover',
        html: elt.innerHTML,
        style: { 
          position: "absolute", 
          "z-index": 10000, 
          left: elt.offsetLeft, 
          opacity: 0.5,
          width: ol_ext_element.outerWidth(elt),
          height: ol_ext_element.getStyle(elt,'height'),
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
      ol_ext_element.setStyle(dragElt, { top: pageY - ol_ext_element.offsetRect(panel).top + panel.scrollTop +5 });
      
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
        ol_ext_element.show(dragElt);
      } else {
        target = false;
        if (li===elt) ol_ext_element.hide(dragElt);
        else ol_ext_element.show(dragElt);
      }
      
      if (!target) dragElt.classList.add("forbidden");
      else dragElt.classList.remove("forbidden");
    }
  }

  // Start ordering
  ol_ext_element.addListener(document, 'mousemove touchmove', move);
  ol_ext_element.addListener(document, 'mouseup touchend touchcancel', stop);
};


/** Change opacity on drag 
*	@param {event} e drag event
*	@private
*/
ol_control_LayerSwitcher.prototype.dragOpacity_ = function(e) {
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
  var start = ol_ext_element.getStyle (elt, 'left') - x;
  self.dragging_ = true;

  // stop dragging
  function stop() {
    ol_ext_element.removeListener(document, "mouseup touchend touchcancel", stop);
    ol_ext_element.removeListener(document, "mousemove touchmove", move);
    self.dragging_ = false;
  }
  // On draggin
  function move(e) {
    var x = e.pageX 
      || (e.touches && e.touches.length && e.touches[0].pageX) 
      || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageX);
    var delta = (start + x) / ol_ext_element.getStyle(elt.parentNode, 'width');
    var opacity = Math.max (0, Math.min(1, delta));
    ol_ext_element.setStyle (elt, { left: (opacity*100) + "%" });
    elt.parentNode.nextElementSibling.innerHTML = Math.round(opacity*100);
    layer.setOpacity(opacity);
  }
  // Register move
  ol_ext_element.addListener(document, "mouseup touchend touchcancel", stop);
  ol_ext_element.addListener(document, "mousemove touchmove", move);
};


/** Render a list of layer
 * @param {Elemen} element to render
 * @layers {Array{ol.layer}} list of layer to show
 * @api stable
 */
ol_control_LayerSwitcher.prototype.drawList = function(ul, collection) {
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

    var li = ol_ext_element.create('LI', {
      className: (layer.getVisible()?"visible ":" ")+(layer.get('baseLayer')?"baselayer":""),
      parent: ul
    });
    this._setLayerForLI(li, layer);

    var layer_buttons = ol_ext_element.create('DIV', {
      className: 'ol-layerswitcher-buttons',
      parent: li
    });

    // Content div
    var d = ol_ext_element.create('DIV', {
      className: 'li-content',// + (this.testLayerVisibility(layer) ? '' : ' ol-layer-hidden'),
      parent: li
    });
    
    // Visibility
    ol_ext_element.create('INPUT', {
      type: layer.get('baseLayer') ? 'radio' : 'checkbox',
      checked: layer.getVisible(),
      click: setVisibility,
      parent: d
    });
    // Label
    ol_ext_element.create('LABEL', {
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
        ol_ext_element.create('DIV', {
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
        ol_ext_element.create('DIV', {
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
      ol_ext_element.create('DIV', {
        className: 'layerInfo',
        title: this.tip.info,
        click: onInfo,
        parent: layer_buttons
      });
    }
    // Layer remove
    if (this.hastrash && !layer.get("noSwitcherDelete")) {
      ol_ext_element.create('DIV', {
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
        ol_ext_element.create('DIV', {
          className: 'layerExtent',
          title: this.tip.extent,
          click: zoomExtent,
          parent: layer_buttons  
        });
      }
    }

    // Progress
    if (this.show_progress && layer instanceof ol_layer_Tile) {
      var p = ol_ext_element.create('DIV', {
        className: 'layerswitcher-progress',
        parent: d
      });
      this.setprogress_(layer);
      layer.layerswitcher_progress = ol_ext_element.create('DIV', { parent: p });
    }

    // Opacity
    var opacity = ol_ext_element.create('DIV', {
      className: 'layerswitcher-opacity',
      // Click on the opacity line
      click: function(e){
        if (e.target !== this) return;
        e.stopPropagation();
        e.preventDefault();
        var op = Math.max ( 0, Math.min( 1, e.offsetX / ol_ext_element.getStyle(this, 'width')));
        self._getLayerForLI(this.parentNode.parentNode).setOpacity(op);
      },
      parent: d
    });
    // Start dragging
    ol_ext_element.create('DIV', {
      className: 'layerswitcher-opacity-cursor',
      style: { left: (layer.getOpacity()*100)+"%" },
      on: {
        'mousedown touchstart': function(e) { self.dragOpacity_ (e); }
      },
      parent: opacity
    });
    // Percent
    ol_ext_element.create('DIV', {
      className: 'layerswitcher-opacity-label',
      html: Math.round(layer.getOpacity()*100),
      parent: d
    });

    // Layer group
    if (layer.getLayers) {
      li.classList.add('ol-layer-group');
      if (layer.get("openInLayerSwitcher") === true) {
        var ul2 = ol_ext_element.create('UL', {
          parent: li
        });
        this.drawList (ul2, layer.getLayers());
      }
    }
    else if (layer instanceof ol_layer_Vector) li.classList.add('ol-layer-vector');
    else if (layer instanceof ol_layer_VectorTile) li.classList.add('ol-layer-vector');
    else if (layer instanceof ol_layer_Tile) li.classList.add('ol-layer-tile');
    else if (layer instanceof ol_layer_Image) li.classList.add('ol-layer-image');
    else if (layer instanceof ol_layer_Heatmap) li.classList.add('ol-layer-heatmap');

    // Dispatch a dralist event to allow customisation
    this.dispatchEvent({ type:'drawlist', layer:layer, li:li });
  }

  this.viewChange();

  if (ul === this.panel_) this.overflow();
};

/** Handle progress bar for a layer
*	@private
*/
ol_control_LayerSwitcher.prototype.setprogress_ = function(layer) {
  if (!layer.layerswitcher_progress) {
    var loaded = 0;
    var loading = 0;
    var draw = function() {
      if (loading === loaded) {
        loading = loaded = 0;
        ol_ext_element.setStyle(layer.layerswitcher_progress, { width: 0 });// layer.layerswitcher_progress.width(0);
      } else {
        ol_ext_element.setStyle(layer.layerswitcher_progress, { width: (loaded / loading * 100).toFixed(1) + '%' });// layer.layerswitcher_progress.css('width', (loaded / loading * 100).toFixed(1) + '%');
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

export default ol_control_LayerSwitcher
