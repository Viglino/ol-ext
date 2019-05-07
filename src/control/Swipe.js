/*	Copyright (c) 2015 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'

/**
 * @classdesc Swipe Control.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} Control options.
 *	@param {ol.layer} options.layers layer to swipe
 *	@param {ol.layer} options.rightLayer layer to swipe on right side
 *	@param {string} options.className control class name
 *	@param {number} options.position position propertie of the swipe [0,1], default 0.5
 *	@param {string} options.orientation orientation propertie (vertical|horizontal), default vertical
 */
var ol_control_Swipe = function(options) {
	options = options || {};

	var button = document.createElement('button');

	var element = document.createElement('div');
  element.className = (options.className || "ol-swipe") + " ol-unselectable ol-control";
  element.appendChild(button);

	element.addEventListener("mousedown", this.move.bind(this));
	element.addEventListener("touchstart", this.move.bind(this));

	ol_control_Control.call(this, {
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
ol_ext_inherits(ol_control_Swipe, ol_control_Control);

/**
 * Set the map instance the control associated with.
 * @param {_ol_Map_} map The map instance.
 */
ol_control_Swipe.prototype.setMap = function(map) {
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

	ol_control_Control.prototype.setMap.call(this, map);

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
ol_control_Swipe.prototype.isLayer_ = function(layer){
  for (var k=0; k<this.layers.length; k++) {
    if (this.layers[k].layer === layer) return k;
	}
	return -1;
};

/** Add a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
*	@param {bool} add layer in the right part of the map, default left.
*/
ol_control_Swipe.prototype.addLayer = function(layers, right) {
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
ol_control_Swipe.prototype.removeLayer = function(layers) {
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
ol_control_Swipe.prototype.move = function(e) {
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
ol_control_Swipe.prototype.precomposeLeft = function(e) {
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
ol_control_Swipe.prototype.precomposeRight = function(e) {
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
ol_control_Swipe.prototype.postcompose = function(e) {
  e.context.restore();
};

export default ol_control_Swipe
