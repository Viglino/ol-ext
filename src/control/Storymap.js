import ol_control_Control from 'ol/control/Control.js'
import ol_ext_element from '../util/element.js'
import {fromLonLat as ol_proj_fromLonLat} from 'ol/proj.js'
// Add flyTo
import '../util/View.js'

/** A control with scroll-driven navigation to create narrative maps
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires scrollto
 * @fires clickimage
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control (scrollLine, scrollBox or any)
 *	@param {Element | string | undefined} [options.html] The storymap content
 *	@param {Element | string | undefined} [options.target] The target element to place the story. If no html is provided the content of the target will be used.
 *	@param {boolean} [options.minibar=false] add a mini scroll bar
 */
var ol_control_Storymap = class olcontrolStorymap extends ol_control_Control {
  constructor(options) {
    // Remove or get target content 
    if (options.target) {
      if (!options.html) {
        options.html = options.target.innerHTML
      } else if (options.html instanceof Element) {
        options.html = options.html.innerHTML
      }
      options.target.innerHTML = ''
    }

    // New element
    var element = ol_ext_element.create('DIV', {
      className: (options.className || '') + ' ol-storymap'
        + (options.target ? '' : ' ol-unselectable ol-control'),
    })

    // Initialize
    super({
      element: element,
      target: options.target
    })

    this.content = ol_ext_element.create('DIV', {
      parent: element
    })

    // Make a scroll div
    ol_ext_element.scrollDiv(this.content, {
      vertical: true,
      mousewheel: true,
      minibar: options.minibar
    })

    this.setStory(options.html)
  }
  /** Scroll to a chapter
   * @param {string} name Name of the chapter to scroll to
   */
  setChapter(name) {
    var chapter = this.content.querySelectorAll('.chapter')
    for (var i = 0, s; s = chapter[i]; i++) {
      if (s.getAttribute('name') === name) {
        this.content.scrollTop = s.offsetTop - 30
      }
    }
  }
  /** Scroll to a chapter
   * @param {string} name Name of the chapter to scroll to
   */
  setStory(html) {
    if (html instanceof Element) {
      this.content.innerHTML = ''
      this.content.appendChild(html)
    } else {
      this.content.innerHTML = html
    }

    this.content.querySelectorAll('.chapter').forEach(function (c) {
      c.addEventListener('click', function (e) {
        if (!c.classList.contains('ol-select')) {
          this.content.scrollTop = c.offsetTop - 30
          e.preventDefault()
        } else {
          if (e.target.tagName === 'IMG' && e.target.dataset.title) {
            this.dispatchEvent({
              coordinate: this.getMap() ? this.getMap().getCoordinateFromPixel([e.layerX, e.layerY]) : null,
              type: 'clickimage',
              img: e.target,
              title: e.target.dataset.title,
              element: c,
              name: c.getAttribute('name'),
              originalEvent: e
            })
          }
        }
      }.bind(this))
    }.bind(this))

    // Scroll to the next chapter
    var sc = this.content.querySelectorAll('.ol-scroll-next')
    sc.forEach(function (s) {
      s.addEventListener('click', function (e) {
        if (s.parentElement.classList.contains('ol-select')) {
          var chapter = this.content.querySelectorAll('.chapter')
          var scrollto = s.offsetTop
          for (var i = 0, c; c = chapter[i]; i++) {
            if (c.offsetTop > scrollto) {
              scrollto = c.offsetTop
              break
            }
          }
          this.content.scrollTop = scrollto - 30
          e.stopPropagation()
          e.preventDefault()
        }
      }.bind(this))
    }.bind(this))

    // Scroll top 
    sc = this.content.querySelectorAll('.ol-scroll-top')
    sc.forEach(function (i) {
      i.addEventListener('click', function (e) {
        this.content.scrollTop = 0
        e.stopPropagation()
        e.preventDefault()
      }.bind(this))
    }.bind(this))

    var getEvent = function (currentDiv) {
      var lonlat = [parseFloat(currentDiv.getAttribute('data-lon')),
      parseFloat(currentDiv.getAttribute('data-lat'))]
      var coord = ol_proj_fromLonLat(lonlat, this.getMap().getView().getProjection())
      var zoom = parseFloat(currentDiv.getAttribute('data-zoom'))
      return {
        type: 'scrollto',
        element: currentDiv,
        name: currentDiv.getAttribute('name'),
        coordinate: coord,
        lon: lonlat,
        zoom: zoom
      }
    }.bind(this)

    // Handle scrolling
    var currentDiv = this.content.querySelectorAll('.chapter')[0]
    setTimeout(function () {
      currentDiv.classList.add('ol-select')
      this.dispatchEvent(getEvent(currentDiv))
    }.bind(this))

    // Trigger change event on scroll
    this.content.addEventListener('scroll', function () {
      var current, chapter = this.content.querySelectorAll('.chapter')
      var height = ol_ext_element.getStyle(this.content, 'height')
      if (!this.content.scrollTop) {
        current = chapter[0]
      } else {
        for (var i = 0, s; s = chapter[i]; i++) {
          var p = s.offsetTop - this.content.scrollTop
          if (p > height / 3)
            break
          current = s
        }
      }
      if (current && current !== currentDiv) {
        if (currentDiv)
          currentDiv.classList.remove('ol-select')
        currentDiv = current
        currentDiv.classList.add('ol-select')
        var e = getEvent(currentDiv)
        var view = this.getMap().getView()
        view.cancelAnimations()
        switch (currentDiv.getAttribute('data-animation')) {
          case 'flyto': {
            view.flyTo({
              center: e.coordinate,
              zoomAt: Math.min(view.getZoom(), e.zoom) - 1,
              zoom: e.zoom
            })
            break
          }
          default: break
        }
        this.dispatchEvent(e)
      }
    }.bind(this))
  }
}

export default ol_control_Storymap