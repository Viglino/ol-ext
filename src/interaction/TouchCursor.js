/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_interaction_DragOverlay from './DragOverlay.js'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_interaction_Interaction from 'ol/interaction/Interaction.js'

import ol_ext_element from '../util/element.js'
import ol_Overlay_Fixed from '../overlay/Fixed.js'

/** Handle a touch cursor to defer event position on overlay position
 * It can be used as abstract base class used for creating subclasses. 
 * The TouchCursor interaction modifies map browser event coordinate and pixel properties to force pointer on the graphic cursor on the screen to any interaction that them.
 * @constructor
 * @extends {ol_interaction_DragOverlay}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {string} options.className cursor class name
 *  @param {ol.coordinate} options.coordinate position of the cursor
 *  @param {Array<*>} options.buttons an array of buttons
 *  @param {number} options.maxButtons maximum number of buttons (default 5)
 */
var ol_interaction_TouchCursor = class olinteractionTouchCursor extends ol_interaction_DragOverlay {
  constructor(options) {
    options = options || {}

    // Add Overlay
    var overlay = new ol_Overlay_Fixed({
      className: ('ol-touch-cursor ' + (options.className || '')).trim(),
      positioning: 'top-left',
      element: ol_ext_element.create('DIV', {}),
      stopEvent: false,
    })

    super({
      centerOnClick: false,
      //offset: [-20,-20],
      overlays: overlay
    })

    this.overlay = overlay;

    // List of listerner on the object
    this._listeners = {}

    // Interaction to defer position on top of the interaction 
    // this is done to enable other coordinates manipulation inserted after the interaction (snapping)
    var offset = [-35, -35]
    this.ctouch = new ol_interaction_Interaction({
      handleEvent: function (e) {
        if (!/drag/.test(e.type) && this.getMap()) {
          e.coordinate = this.overlay.getPosition()
          e.pixel = this.getMap().getPixelFromCoordinate(e.coordinate)
          this._lastEvent = e
        } else {
          var res = e.frameState.viewState.resolution
          var cosa = Math.cos(e.frameState.viewState.rotation)
          var sina = Math.sin(e.frameState.viewState.rotation)
          e.coordinate = [
            e.coordinate[0] + cosa * offset[0] * res + sina * offset[1] * res,
            e.coordinate[1] + sina * offset[0] * res - cosa * offset[1] * res
          ]
          e.pixel = this.getMap().getPixelFromCoordinate(e.coordinate)
        }
        return true
      }.bind(this)
    })
    // Force interaction on top
    this.ctouch.set('onTop', true)

    this.setPosition(options.coordinate, true)
    this.set('maxButtons', options.maxButtons || 5)

    if (options.buttons) {
      if (options.buttons.length > this.get('maxButtons'))
        this.set('maxButtons', options.buttons.length)
      var elt = this.overlay.element
      var begin = options.buttons.length > 4 ? 0 : 1
      options.buttons.forEach((function (b, i) {
        if (i < 5) {
          ol_ext_element.create('DIV', {
            className: ((b.className || '') + ' ol-button ol-button-' + (i + begin)).trim(),
            html: ol_ext_element.create('DIV', { html: b.html }),
            click: b.click,
            on: b.on,
            parent: elt
          })
        }
      }))
    }

    // Replace events to handle click
    var dragging = false
    var start = false
    this.on('dragstart', function (e) {
      this._pixel = this.getMap().getPixelFromCoordinate(this.overlay.getPosition())
      start = e
      return !e.overlay
    })
    this.on('dragend', function (e) {
      this._pixel = this.getMap().getPixelFromCoordinate(this.overlay.getPosition())
      if (!e.overlay)
        return true
      if (dragging) {
        this.dispatchEvent({
          type: 'dragend',
          dragging: dragging,
          originalEvent: e.originalEvent,
          frameState: e.frameState,
          pixel: this._pixel,
          coordinate: this.overlay.getPosition()
        })
        dragging = false
      } else {
        if (e.originalEvent.target === this.overlay.element) {
          this.dispatchEvent({
            type: 'click',
            dragging: dragging,
            originalEvent: e.originalEvent,
            frameState: e.frameState,
            pixel: this._pixel,
            coordinate: this.overlay.getPosition()
          })
        }
      }
      return false
    }.bind(this))
    this.on('dragging', function (e) {
      this._pixel = this.getMap().getPixelFromCoordinate(this.overlay.getPosition())
      if (!e.overlay)
        return true
      dragging = true
      if (start) {
        this.dispatchEvent({
          type: 'dragstart',
          dragging: dragging,
          originalEvent: start.originalEvent,
          frameState: e.frameState,
          pixel: this._pixel,
          coordinate: start.coordinate
        })
        start = false
      }
      this.dispatchEvent({
        type: 'dragging',
        dragging: dragging,
        originalEvent: e.originalEvent,
        frameState: e.frameState,
        pixel: this._pixel,
        coordinate: this.overlay.getPosition()
      })
      return false
    }.bind(this))
  }
  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {_ol_Map_} map Map.
   * @api stable
   */
  setMap(map) {
    // Reset
    if (this.getMap()) {
      this.getMap().removeInteraction(this.ctouch)
      if (this.getActive())
        this.getMap().removeOverlay(this.overlay)
    }
    for (let l in this._listeners) {
      ol_Observable_unByKey(this._listeners[l])
    }
    this._listeners = {}

    super.setMap(map)

    // Set listeners
    if (map) {
      if (this.getActive()) {
        map.addOverlay(this.overlay)
        setTimeout(function () {
          this.setPosition(this.getPosition() || map.getView().getCenter())
        }.bind(this))
      }
      map.addInteraction(this.ctouch)
      this._listeners.addInteraction = map.getInteractions().on('add', function (e) {
        // Move on top
        if (!e.element.get('onTop')) {
          map.removeInteraction(this.ctouch)
          map.addInteraction(this.ctouch)
        }
      }.bind(this))
    }
  }
  /**
   * Activate or deactivate the interaction.
   * @param {boolean} active Active.
   * @param {ol.coordinate|null} position position of the cursor (when activating), default viewport center.
   * @observable
   * @api
   */
  setActive(b, position) {
    if (b !== this.getActive()) {
      if (this.ctouch) this.ctouch.setActive(b)
      if (!b) {
        this.setPosition()
        this.overlay.element.classList.remove('active')
        if (this._activate)
          clearTimeout(this._activate)
        if (this.getMap())
          this.getMap().removeOverlay(this.overlay)
      } else {
        if (this.getMap()) {
          this.getMap().addOverlay(this.overlay)
        }
        if (position) {
          this.setPosition(position)
        } else if (this.getMap()) {
          this.setPosition(this.getMap().getView().getCenter())
        }
        this._activate = setTimeout(function () {
          this.overlay.element.classList.add('active')
        }.bind(this), 100)
      }
      super.setActive(b)
    } else if (position) {
      this.setPosition(position)
    } else if (this.getMap()) {
      this.setPosition(this.getMap().getView().getCenter())
    }
  }
  /** Set the position of the target
   * @param {ol.coordinate} coord
   */
  setPosition(coord) {
    this.overlay.setPosition(coord, true)
    if (this.getMap() && coord) {
      this._pixel = this.getMap().getPixelFromCoordinate(coord)
    }
  }
  /** Offset the target position
   * @param {ol.coordinate} coord
   */
  offsetPosition(coord) {
    var pos = this.overlay.getPosition()
    if (pos)
      this.overlay.setPosition([pos[0] + coord[0], pos[1] + coord[1]])
  }
  /** Get the position of the target
   * @return {ol.coordinate}
   */
  getPosition() {
    return this.overlay.getPosition()
  }
  /** Get pixel position
   * @return {ol.pixel}
   */
  getPixel() {
    if (this.getMap())
      return this.getMap().getPixelFromCoordinate(this.getPosition())
  }
  /** Get cursor overlay
   * @return {ol.Overlay}
   */
  getOverlay() {
    return this.overlay
  }
  /** Get cursor overlay element
   * @return {Element}
   */
  getOverlayElement() {
    return this.overlay.element
  }
  /** Get cursor button element
   * @param {string|number} button the button className or the button index
   * @return {Element}
   */
  getButtonElement(button) {
    if (typeof (button) === 'number')
      return this.getOverlayElement().getElementsByClassName('ol-button')[button]
    return this.getOverlayElement().getElementsByClassName(button)[0]
  }
  /** Remove a button element
   * @param {string|number|undefined} button the button className or the button index, if undefined remove all buttons, default remove all
   * @return {Element}
   */
  removeButton(button) {
    if (button === undefined) {
      var buttons = this.getOverlayElement().getElementsByClassName('ol-button')
      for (var i = buttons.length - 1; i >= 0; i--) {
        this.getOverlayElement().removeChild(buttons[i])
      }
    } else {
      var elt = this.getButtonElement(button)
      if (elt)
        this.getOverlayElement().removeChild(elt)
    }
  }
  /** Add a button element
   * @param {*} button
   *  @param {string} options.className button class name
   *  @param {DOMElement|string} options.html button content
   *  @param {function} options.click onclick function
   *  @param {*} options.on an object with
   *  @param {boolean} options.before
   */
  addButton(b) {
    var buttons = this.getOverlayElement().getElementsByClassName('ol-button')
    var max = (this.get('maxButtons') || 5)

    if (buttons.length >= max) {
      console.error('[ol/interaction/TouchCursor~addButton] too many button on the cursor (max=' + max + ')...')
      return
    }
    var button = ol_ext_element.create('DIV', {
      className: ((b.className || '') + ' ol-button').trim(),
      html: ol_ext_element.create('DIV', { html: b.html }),
      click: b.click,
      on: b.on
    })
    if (!b.before || buttons.length === 0)
      this.getOverlayElement().appendChild(button)
    else
      this.getOverlayElement().insertBefore(button, buttons[0])
    // Reorder buttons
    var start = buttons.length >= max ? 0 : 1
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].className = buttons[i].className.replace(/ol-button-\d/g, '').trim() + ' ol-button-' + (i + start)
    }
  }
}

export default ol_interaction_TouchCursor
