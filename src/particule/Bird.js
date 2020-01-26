/*
  Copyright (c) 2020 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_particule_Base from './Base'

/** A cloud particule to display clouds over the map
 * @constructor
 * @extends {ol_particule_Base}
 * @param {*} options
 *  @param {ol.Overlay} options.overlay
 *  @param {ol.pixel} coordinate the position of the particule
 */
var ol_particule_Bird = function(options) {
  if (!options) options = {};
  
  ol_particule_Base.call(this, options);

  this.bird = new Image();
  this.bird.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABDCAQAAAD+S8VaAAAAAnNCSVQICFXsRgQAAAAJcEhZcwAAAvMAAALzAdLpCioAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAG90lEQVR42uWaaVRTRxTHJ4AUUIoIiqISOArIDiIhBBfccCMoR0vVUpXjTqun4Fr1tO5i3YuodaFqRMECKm4VUHEhUvWgBYuilgpiRVZpCARI3r8fWA4hYY9AXu77+ObNzO/O8u787xDSyeYSTzSICpu+DjV0ogrze84PBneByuJv3JpbBlx6MEBbJfG/8S2RAACFXXtU0gERN1BjCc9UEN/e7I2w1gFPinv3UDkHbFiGOqOwJVjlHMALRT3LLJ7trGIOuHwFUsY7q2IOuJ0u7YB//pswWFn6/vnUcbOCAn7ctfnUrsijl85dv5pw786fd9OTsvg5/JykN3fTb6ZcTDgVvefIkqXmVvKr0NN/IUQDO7C1qwJrOwyftIZ7cmIiN21eZlB+SOUtFKNl9kF0hb9ujmyVM73FMmWv3m+2J4zxw74NDN5/5vT1qzeT7j3n5/Bz7mcmPk24cy32Ai8i9Pj2nwIX+jo4kc8UMMqeXr5bfC6N/2tUHrdsCQ4gAR/QNhNRJ8+6GklXH7xStlxW+ViLxrpjqBswJ/z4rYyCFrQnwJPCxGe/x53i+fO+XOth2xpsvQm+PkfGP3YuYIo1oInTyIJiLDFtoZfUP+AXeaW2rZHXKZ8xJ35NeU+1odVSbIIBbEQeb70Tffd6ckmj0QbDy9/zOufdILE6SN0TBkVafnn0ka/NatrrditDXpmYKw36pREwPyr+Y0V72n0CsxoedTDFrMJJyRMDZJYIx8+yYICQKbDJtcjtL9IGAcEMKN7efIy+snnTYv/tR8Ry3+eWRUYFzavRB9SWL7icXKWAVrPRr96wEqjBTjg5bop03GGi77XF85FdqVZNIQ1konOsEvx35yOCN1xMFimszjNSDqh+ektGfVG3xjyTzaqkX3uDTiaCdh0ZA/qSgWXWWfb7CYMQQsiUUANK1j8hoJf1lSFUg0u+z1xCiFuMUYWsAy7QCj9ZzhIgIDCkpi4nhBCGsafNGx2peXCQRvhlcGrEAQSOhYQQQtyTG74YCglN8CswrVF8goEVhBBCrMzdozi33OOHJmvUvQqghQtKMEUu+GDB0Cj2Q/vsUdJn0JH8+oXG4rWS46djSD0ePcr2lUuafbZlIbN0UAnngpyA0I3FumeZxxQYVlZ/ooWleKm0+FHQbTDuWnAp5F6cbNfskcDtcg9J9aMGNUxDIiglgy+CPxhypj4Ddu/cfFpxOrIqrv7QAsH4V2nwYxoEvwQEOpRlAeeG07hWnopH7FMHgTr6VmhAA1xEQNjF4bMxQwpcj2I9duVZLiVtTb7YT7T2I30JccyqrrA7ZuESRF0SvhQ/QKfByDu/VZAs5O6rXS9U6onZ+A2CLgQvwWn0l5n4TAFnjOKksR5En6i73q6/q3IRhvwugB8LBylwi6IhixxX9Wd/CoWQwTrJTuaEOSwzENcKDR7Yj4xOg4+Hq3SEXzX8fIfcObAZPizV+bGxqLZhMyxBWgdP+xi4ScGbCNnhhrodqxnrso65pLidNxMQENihqoPgS3AY5rU7krh35eCPbon2c4hap2nnxob2GQQE+zpAM4qFb53EoUWxE3t93jXyBwyXcG1KD+8/IXwBAmFYg26Vx37oHjnIlnQlGzbJvMCX+lQrPgT6dat9yAcT/S6aSOIs2rjjxLaQ9SsX83gv8uShiNuAn4mR9fZ5dizpphRpREvj1YvOhiU84OdmoghFyKH47y/GHohtLf45ITvVuLyfyKLI5RlntyJSXx2+P+gaejt5O7FNCSEkcFHTuAmPom6/qqxJqFRee33wHGc6rVLjXtym8C8nTTcnDNMh/n5BfnN8mFY18jWdbPlceeBViEsPi16xxFSL7ncjukVelTvxUzsxjOlAUzsULv8/GfdEJa7G7D7YWLCcUzbNkfb42zaXNaG2h4XTHH/n9x+bjIHKqeAdNMZf55fbrKBYLNq+lqb433lkFrUk5hNKdu6mIf5XA1KetzibR+09TLcfonrMtVYlNKk9h2gV//FCW3tCFmMXT0nOe83bxpklbdDJqrD+BC1mwUzTtOw2Sl/UFjpsh8ci2pHirFgxV8nxV/oJxO2RwR6+HNFbmfkZ15PaqwQe/VmJ+R18Aql37XTAsQ9EefUBW6NeEk34IaWN8HkIQk+Jva0SzwGXP6p1XDeEoqB1qx/L0B3dKY+VSr0JDurDFNaK2ZoYg5142sx1m3LEYxUsq+Vv8ejVSv8bdJ/UXySds9eDB4JwEnFIRS6KUIi/8RJxCEEARte74GBR6DycFpGgtZNFPkHrHgOx61miSaPDEOtEn8qWwvepZMc5Mel3ItZmHbbM12wSXV/snMHZQ6eRlzEzI9d9rnftskwERhXVNxF7ik1Krd87pbLCbWYR9Y7v0f/htaJHbsoDhwAAAABJRU5ErkJggg==";
  this.set('size', [this.bird.width || 50, this.bird.height || 50]);
};
ol_ext_inherits(ol_particule_Bird, ol_particule_Base);

/** Draw the particule
 * @param {CanvasRenderingContext2D } ctx
 */
ol_particule_Bird.prototype.draw = function(ctx) {
  //ctx.drawImage(this.bird, this.coordinate[0], this.coordinate[1]);
  var angle = this.getOverlay().get('angle');
  ctx.save();
    ctx.translate (this.coordinate[0], this.coordinate[1]);
    ctx.rotate(angle+Math.PI/2);
    ctx.scale(.5,.5);
    ctx.drawImage( this.bird, -this.bird.width/2, -this.bird.height/2 );
  ctx.restore();
};

/** Update the particule
 * @param {number} dt timelapes since last call
 */
ol_particule_Bird.prototype.update = function(dt) {
  var speed = this.getOverlay().get('speed') * dt / this.getOverlay()._fps;
  var angle = this.getOverlay().get('angle');
  this.coordinate[0] += speed * Math.cos(angle);
  this.coordinate[1] += speed * Math.sin(angle);
};

export default ol_particule_Bird
