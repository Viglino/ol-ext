/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** ol.control.Cloud adds an old map effect on a canvas renderer.
* It colors the map, adds a parchment texture and compass onto the map. 
* @constructor
* @param {Object} options
*	@param {_ol_color_} options.hue color to set hue of the map, default #963
*	@param {Number} options.saturation saturation of the hue color, default 0.6
*	@param {Number} options.opacity opacity of the overimpose image, default 0.7
* @todo add effects on pan / zoom change
*/
ol.control.Cloud = function(options) {
  options = options || {};
  var div = document.createElement('div');
  div.className = "ol-cloud ol-unselectable ol-control";
  ol.control.Control.call(this, {
    element: div
  });
  // Defaut cloud image
  this.cloud = options.img;
  if (!this.cloud) {
    this.cloud = new Image();
    this.cloud.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYRBhgFS4lkHAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAA6lBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+Le70HAAAATnRSTlMAAwkMDxUXGiAiJSowMzU3Ojw/QkRGSUtOT1JUV1lbXmBiZGZoam1ucXN0d3l6fX6AgoSGh4qLjY6QkpSVl5mbnJ6foaKkpaeoqqutrrA/NNYeAAAAAWJLR0QB/wIt3gAALhJJREFUeNrtfel6azeuLAryd9//fbuFuj+IkYtLkr2902dyEseDLIkkiKFQAET+h3/gH/iL//v4Xy0w//Ul53/xJcAHq3q1WHD+/9feEbH+u3zw7+4H//Jpg++2Ctc3cvwT/gPSwX9U3PHhfvct5H8RDXE8r+/dirZ8+Mrg14AQggL252R8TfAf3oAfv+DdH2K+yvv9Zt+H3xWEv64Drq+HswDcvih36fft4N9Y+usN+HPZw+nu490rtC1Al4A/vQy3f47fXvd19Ygrn7bijfYbB94lgL+wAfsK8X1b9tHqh/Dv/7vRpGy/2y+E68XfFwP8vnJBlwB8bgSPBnCqAP6+cfxdJejiPZZ/kALmZ97dgnH4/Yvf3gJ8V/u9/D32he/2b78FtxIAXkWAf8E0+tvkDxd8v/yuBHDZiRQBvvSBt8Vf9uFv+QGvD/nenuCk/ptLEN/z+DRTBXQJIPjnUnBePX9LB1xkPxZ82JOXB44bK5Ar50E3/qetgLTj3RaNzS/wt4DL0nGjDgn25XKeP//o/DcvnT97Ipci7NYfcl3+JRwmuG1G+1VX+9Ma4BfVIf5s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";
  }
  this.bird = options.bird;
  if (!this.bird) {
    this.bird = new Image();
    this.bird.src = "data:image/png;base64,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";
  }
  // Parameters
  this.set('opacity', options.opacity||0.3);
  this.set('density', options.density||0.5);
  this.setWind(options);
};
ol.ext.inherits(ol.control.Cloud, ol.control.Control);
/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol.control.Cloud.prototype.setMap = function (map) {
  if (this._listener) ol.Observable.unByKey(this._listener);
  this._listener = null;
  ol.control.Control.prototype.setMap.call(this, map);
  if (map) {
    this._listener = map.on('postcompose', this.drawCloud_.bind(this));
  }
};
/** Set wind direction / force
*/
ol.control.Cloud.prototype.setWind= function (options) {
  options = options || {};
  var rnd = Math.random;	
  var a = options.windAngle || rnd()*Math.PI;
  var speed = options.windSpeed || rnd();
  this.wind = { angle: a, cos: Math.cos(a), sin: Math.sin(a), speed: speed };
}
/**
*	@private
*/
ol.control.Cloud.prototype.drawCloud_ = function (event) {
  if (!this.getMap()) return;
  var ctx = event.context || ol.ext.getMapCanvas(this.getMap()).getContext('2d');
  var canvas = ctx.canvas;
//	var ratio = event.frameState.pixelRatio;
//	var m = Math.max(canvas.width, canvas.height);
//	var res = view.getResolution()/ratio;
//	var rot = view.getRotation();
  // Not ready !
  if (!this.cloud.width) return;
  // Go!
  var p = this.particules;
  var rnd = Math.random;	
  var w = this.cloud.width;
  var h = this.cloud.height;
  var w2 = this.cloud.width/2;
  var h2 = this.cloud.height/2;
  var d = (this.get('density')*10*canvas.width*canvas.height/w/h) << 0;
  var i;
  function addClouds (nb) {
    for (i=0; i<nb; i++) {
      p.push({ x: rnd()*canvas.width-w2, y: rnd()*canvas.height-h2 });
    }
  }
  // First time: init clouds
  if (!p) {
    p = this.particules = [];
    addClouds(d);
    // Wind
    this.width = canvas.width;
    this.height = canvas.height;
    // Birds
    this.birds = [];
    for (i=0; i<5; i++) {
      var b = { angle: rnd()*2*Math.PI, x: rnd()*canvas.width, y: rnd()*canvas.height, rot:0, fly:0 };
      b.cos = Math.cos(b.angle);
      b.sin = Math.cos(b.angle);
      this.birds.push (b);
    }
  } else if (d != p.length) {
    // Parameters changed
    if (this.width !== canvas.width || this.height !== canvas.height) {
      p = this.particules = [];
      addClouds(d);
      this.width = canvas.width;
      this.height = canvas.height;
    } else if (d > p.length) {
      addClouds(1);
    } else if (d < p.length) {
      p.splice ( (p.length*rnd()) << 0, 1);
    }
  }
  // Draw clouds
  var dx = this.wind.cos * this.wind.speed;
  var dy = this.wind.sin * this.wind.speed;
  for (i=0; i<p.length; i++) {
    p[i].x += dx + rnd()*2-1;
    p[i].y += dy + rnd()*2-1;
    // out!
    if (p[i].x < -w) {
      p[i].x = canvas.width;
      p[i].y = rnd()*canvas.height-h2;
    } else if (p[i].x > canvas.width) {
      p[i].x = -w;
      p[i].y = rnd()*canvas.height-h2;
    }
    if (p[i].y < -h) {
      p[i].y = canvas.height;
      p[i].x = rnd()*canvas.width-w2;
    } else if (p[i].y > canvas.height) {
      p[i].y = -h;
      p[i].x = rnd()*canvas.width-w2;
    }
  }
  // Draw clouds
  ctx.globalAlpha = this.get('opacity');
  for (i=0; i<p.length; i++) {
    ctx.drawImage(this.cloud, p[i].x,p[i].y);
  }
  ctx.globalAlpha = 1;
  // Draw birds
  w = this.bird.width/2;
  h = this.bird.height/2;
  var sc = 0.5;
  var dw = canvas.width+w;
  var dh = canvas.height+h;
  for (i=0; i<this.birds.length; i++) {
    var bi = this.birds[i];
    // Animate birds
    var sx = 0;
    if (bi.fly) {
      bi.fly = (++bi.fly%5)
      sx = -0.1
    } else if (rnd()<0.01) bi.fly=1;
    // Rotate birds
    if (bi.rot) {
      bi.angle += bi.rot;
      bi.cos = Math.cos(bi.angle);
      bi.sin = Math.sin(bi.angle);
    }
    if (rnd()<0.01) {
      bi.rot = bi.rot ? 0 : rnd()*Math.PI/200-Math.PI/400;
      bi.cos = Math.cos(bi.angle);
      bi.sin = Math.sin(bi.angle);
    }
    // Move birds
    bi.x += bi.sin;
    if (bi.x>dw) bi.x = -w;
    if (bi.x<-w) bi.x = dw;
    bi.y -= bi.cos;
    if (bi.y>dh) bi.y = -h;
    if (bi.y<-h) bi.y = dh;
    // Draw birds
    ctx.save();
      ctx.translate (bi.x, bi.y);
      ctx.rotate(bi.angle)
      ctx.scale(sc+sx,sc);
      ctx.drawImage( this.bird, -w,-h );
    ctx.restore();
  }
  // Continue animation
  this.getMap().render();
}
