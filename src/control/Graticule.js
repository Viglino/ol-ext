/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_proj_Projection from 'ol/proj/Projection'
import ol_style_Style from 'ol/style/Style'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_Text from 'ol/style/Text'
import {transform as ol_proj_transform} from 'ol/proj'
import {get as ol_proj_get} from 'ol/proj'
import ol_control_CanvasBase from './CanvasBase'

/**
 * Draw a graticule on the map.
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object=} _ol_control_ options.
 *  @param {ol.projectionLike} options.projection projection to use for the graticule, default EPSG:4326 
 *  @param {number} options.maxResolution max resolution to display the graticule
 *  @param {ol_style_Style} options.style Style to use for drawing the graticule, default black.
 *  @param {number} options.step step beetween lines (in proj units), default 1
 *  @param {number} options.stepCoord show a coord every stepCoord, default 1
 *  @param {number} options.spacing spacing beetween lines (in px), default 40px 
 *  @param {number} options.borderWidth width of the border (in px), default 5px 
 *  @param {number} options.margin margin of the border (in px), default 0px 
 *  @param {number} options.formatCoord a function that takes a coordinate and a position and return the formated coordinate
 */
var ol_control_Graticule = function(options) {
  if (!options) options = {};
  
  // Initialize parent
  var elt = document.createElement("div");
  elt.className = "ol-graticule ol-unselectable ol-hidden";
  
  ol_control_CanvasBase.call(this, { element: elt });

  this.set('projection', options.projection || 'EPSG:4326');

  // Use to limit calculation 
  var p = new ol_proj_Projection({code:this.get('projection')});
  var m = p.getMetersPerUnit();
  this.fac = 1;
  while (m/this.fac>10) {
    this.fac *= 10;
  }
  this.fac = 10000/this.fac;

  this.set('maxResolution', options.maxResolution || Infinity);
  this.set('step', options.step || 0.1);
  this.set('stepCoord', options.stepCoord || 1);
  this.set('spacing', options.spacing || 40);
  this.set('margin', options.margin || 0);
  this.set('borderWidth', options.borderWidth || 5);
  this.set('stroke', options.stroke!==false);
  this.formatCoord = options.formatCoord || function(c){return c;};

  if (options.style instanceof ol_style_Style) {
    this.setStyle(options.style);
  }
  else {
    this.setStyle(new ol_style_Style({
      stroke: new ol_style_Stroke({ color:"#000", width:1 }),
      fill: new ol_style_Fill({ color: "#fff" }),
      text: new ol_style_Text({
        stroke: new ol_style_Stroke({ color:"#fff", width:2 }),
        fill: new ol_style_Fill({ color:"#000" }),
      }) 
    }));
  }
};
ol_ext_inherits(ol_control_Graticule, ol_control_CanvasBase);

ol_control_Graticule.prototype.setStyle = function (style) {
  this._style = style;
};

ol_control_Graticule.prototype._draw = function (e) {
  if (this.get('maxResolution')<e.frameState.viewState.resolution) return;
  
  var ctx = this.getContext(e);
  var canvas = ctx.canvas;
  var ratio = e.frameState.pixelRatio;
  var w = canvas.width/ratio;
  var h = canvas.height/ratio;

  var proj = this.get('projection');

  var map = this.getMap();
  var bbox = 
  [	map.getCoordinateFromPixel([0,0]),
    map.getCoordinateFromPixel([w,0]),
    map.getCoordinateFromPixel([w,h]),
    map.getCoordinateFromPixel([0,h])
  ];
  var xmax = -Infinity;
  var xmin = Infinity;
  var ymax = -Infinity;
  var ymin = Infinity;
  for (var i=0, c; c=bbox[i]; i++)
  {	bbox[i] = ol_proj_transform (c, map.getView().getProjection(), proj);
    xmax = Math.max (xmax, bbox[i][0]);
    xmin = Math.min (xmin, bbox[i][0]);
    ymax = Math.max (ymax, bbox[i][1]);
    ymin = Math.min (ymin, bbox[i][1]);
  }

  var spacing = this.get('spacing');
  var step = this.get('step');
  var step2 = this.get('stepCoord');
  var borderWidth = this.get('borderWidth');
  var margin = this.get('margin');

  // Limit max line draw
  var ds = (xmax-xmin)/step*spacing;
  if (ds>w) 
  {	var dt = Math.round((xmax-xmin)/w*spacing /step);
    step *= dt;
    if (step>this.fac) step = Math.round(step/this.fac)*this.fac;
  }

  xmin = (Math.floor(xmin/step))*step -step;
  ymin = (Math.floor(ymin/step))*step -step;
  xmax = (Math.floor(xmax/step))*step +2*step;
  ymax = (Math.floor(ymax/step))*step +2*step;

  var extent = ol_proj_get(proj).getExtent();
  if (extent)
  {	if (xmin < extent[0]) xmin = extent[0];
    if (ymin < extent[1]) ymin = extent[1];
    if (xmax > extent[2]) xmax = extent[2]+step;
    if (ymax > extent[3]) ymax = extent[3]+step;
  }

  var hasLines = this.getStyle().getStroke() && this.get("stroke");
  var hasText = this.getStyle().getText();
  var hasBorder = this.getStyle().getFill();

  ctx.save();
    ctx.scale(ratio,ratio);

    ctx.beginPath();
    ctx.rect(margin, margin, w-2*margin, h-2*margin);
    ctx.clip();

    ctx.beginPath();

    var txt = {top:[],left:[],bottom:[], right:[]};
    var x, y, p, p0, p1;
    for (x=xmin; x<xmax; x += step)
    {	p0 = ol_proj_transform ([x, ymin], proj, map.getView().getProjection());
      p0 = map.getPixelFromCoordinate(p0);
      if (hasLines) ctx.moveTo(p0[0], p0[1]);
      p = p0;
      for (y=ymin+step; y<=ymax; y+=step)
      {	p1 = ol_proj_transform ([x, y], proj, map.getView().getProjection());
        p1 = map.getPixelFromCoordinate(p1);
        if (hasLines) ctx.lineTo(p1[0], p1[1]);
        if (p[1]>0 && p1[1]<0) txt.top.push([x, p]);
        if (p[1]>h && p1[1]<h) txt.bottom.push([x,p]);
        p = p1;
      }
    }
    for (y=ymin; y<ymax; y += step)
    {	p0 = ol_proj_transform ([xmin, y], proj, map.getView().getProjection());
      p0 = map.getPixelFromCoordinate(p0);
      if (hasLines) ctx.moveTo(p0[0], p0[1]);
      p = p0;
      for (x=xmin+step; x<=xmax; x+=step)
      {	p1 = ol_proj_transform ([x, y], proj, map.getView().getProjection());
        p1 = map.getPixelFromCoordinate(p1);
        if (hasLines) ctx.lineTo(p1[0], p1[1]);
        if (p[0]<0 && p1[0]>0) txt.left.push([y,p]);
        if (p[0]<w && p1[0]>w) txt.right.push([y,p]);
        p = p1;
      }
    }

    if (hasLines)
    {	ctx.strokeStyle = this.getStyle().getStroke().getColor();
      ctx.lineWidth = this.getStyle().getStroke().getWidth();
      ctx.stroke();
    }

    // Draw text
    if (hasText)
    {
      ctx.fillStyle = this.getStyle().getText().getFill().getColor();
      ctx.strokeStyle = this.getStyle().getText().getStroke().getColor();
      ctx.lineWidth = this.getStyle().getText().getStroke().getWidth();
      ctx.font = this.getStyle().getText().getFont();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'hanging';
      var t, tf;
      var offset = (hasBorder ? borderWidth : 0) + margin + 2;
      for (i=0; t = txt.top[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
      {	tf = this.formatCoord(t[0], 'top');
        ctx.strokeText(tf, t[1][0], offset);
        ctx.fillText(tf, t[1][0], offset);
      }
      ctx.textBaseline = 'alphabetic';
      for (i=0; t = txt.bottom[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
      {	tf = this.formatCoord(t[0], 'bottom');
        ctx.strokeText(tf, t[1][0], h-offset);
        ctx.fillText(tf, t[1][0], h-offset);
      }
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      for (i=0; t = txt.left[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
      {	tf = this.formatCoord(t[0], 'left');
        ctx.strokeText(tf, offset, t[1][1]);
        ctx.fillText(tf, offset, t[1][1]);
      }
      ctx.textAlign = 'right';
      for (i=0; t = txt.right[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
      {	tf = this.formatCoord(t[0], 'right');
        ctx.strokeText(tf, w-offset, t[1][1]);
        ctx.fillText(tf, w-offset, t[1][1]);
      }
    }

    // Draw border
    if (hasBorder)
    {	var fillColor = this.getStyle().getFill().getColor();
      var color, stroke;
      if (stroke = this.getStyle().getStroke())
      {	color = this.getStyle().getStroke().getColor();
      }
      else
      {	color = fillColor;
        fillColor = "#fff";
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = stroke ? stroke.getWidth() : 1;
      // 
      for (i=1; i<txt.top.length; i++)
      {	ctx.beginPath();
        ctx.rect(txt.top[i-1][1][0], margin, txt.top[i][1][0]-txt.top[i-1][1][0], borderWidth);
        ctx.fillStyle = Math.round(txt.top[i][0]/step)%2 ? color: fillColor;
        ctx.fill(); 
        ctx.stroke(); 
      }
      for (i=1; i<txt.bottom.length; i++)
      {	ctx.beginPath();
        ctx.rect(txt.bottom[i-1][1][0], h-borderWidth-margin, txt.bottom[i][1][0]-txt.bottom[i-1][1][0], borderWidth);
        ctx.fillStyle = Math.round(txt.bottom[i][0]/step)%2 ? color: fillColor;
        ctx.fill(); 
        ctx.stroke(); 
      }
      for (i=1; i<txt.left.length; i++)
      {	ctx.beginPath();
        ctx.rect(margin, txt.left[i-1][1][1], borderWidth, txt.left[i][1][1]-txt.left[i-1][1][1]);
        ctx.fillStyle = Math.round(txt.left[i][0]/step)%2 ? color: fillColor;
        ctx.fill(); 
        ctx.stroke(); 
      }
      for (i=1; i<txt.right.length; i++)
      {	ctx.beginPath();
        ctx.rect(w-borderWidth-margin, txt.right[i-1][1][1], borderWidth, txt.right[i][1][1]-txt.right[i-1][1][1]);
        ctx.fillStyle = Math.round(txt.right[i][0]/step)%2 ? color: fillColor;
        ctx.fill(); 
        ctx.stroke(); 
      }
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.rect(margin,margin, borderWidth, borderWidth);
      ctx.rect(margin,h-borderWidth-margin, borderWidth,borderWidth);
      ctx.rect(w-borderWidth-margin,margin, borderWidth, borderWidth);
      ctx.rect(w-borderWidth-margin,h-borderWidth-margin, borderWidth,borderWidth);
      ctx.fill(); 
    }

  ctx.restore();
};

export default ol_control_Graticule
