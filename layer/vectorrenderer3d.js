/** ol.layer.Vector.prototype.setRender3D
 * @extends {ol.layer.Vector}
 * @param {olx.layer.Vector.WebpartOptions} 
 *		- height {string|Number} height attribute or fixed value
 */

(function(){

ol.layer.Vector.prototype.setRender3D = function (options)
{	var options = options || {};
	
	var height = options.height||10;
	var isAtt = (typeof (options.height) == 'string');

	var center, m, res, ctx;

	function t2(pt, d)
	{	p0 = [	pt[0]*m[0] + pt[1]*m[1] + m[12],
				pt[0]*m[4] + pt[1]*m[5] + m[13]
			];
		p1 = [	p0[0] + d/res*(p0[0]-center[0]),
				p0[1] + d/res*(p0[1]-center[1])
			];
		return {p0:p0, p1:p1};
	}

	function calcBuilding (f, h)
	{	var c = f.getGeometry().getCoordinates();
		switch (f.getGeometry().getType())
		{	case "Polygon":
				c = [c];
			case "MultiPolygon":
				var build = [];
				for (var i=0; i<c.length; i++) 
				{	var p0, p1;
					for (var j=0; j<c[i].length; j++)
					{	var b = [];
						for (var k=0; k<c[i][j].length; k++)
						{	b.push( t2(c[i][j][k], h) );
						}
						build.push(b);
					}
				}
				return { type:"MultiPolygon", feature:f, geom:build };
			case "Point":
				return { type:"Point", feature:f, geom:t2(c,h) };
			default: return {};
		}
			
	}
	function drawBuilding (build)
	{	// Construct
		for (var i=0; i<build.length; i++) 
		{	
			switch (build[i].type)
			{	case "MultiPolygon":
					for (var j=0; j<build[i].geom.length; j++)
					{	var b = build[i].geom[j];
						for (var k=0; k < b.length; k++)
						{	ctx.beginPath();
							ctx.moveTo(b[k].p0[0], b[k].p0[1]);
							ctx.lineTo(b[k].p1[0], b[k].p1[1]);
							ctx.stroke();
						}
					}
					break;
				case "Point":
					{	var g = build[i].geom;
						ctx.beginPath();
						ctx.moveTo(g.p0[0], g.p0[1]);
						ctx.lineTo(g.p1[0], g.p1[1]);
						ctx.stroke();
						break;
					}
				default: break;
			}
		}
		// Roof
		for (var i=0; i<build.length; i++) 
		{	switch (build[i].type)
			{	case "MultiPolygon":
				{	ctx.beginPath();
					for (var j=0; j<build[i].geom.length; j++)
					{	var b = build[i].geom[j];
						if (j==0)
						{	ctx.moveTo(b[0].p1[0], b[0].p1[1]);
							for (var k=1; k < b.length; k++)
							{	ctx.lineTo(b[k].p1[0], b[k].p1[1]);
							}
						}
						else
						{	ctx.moveTo(b[0].p1[0], b[0].p1[1]);
							for (var k=b.length-2; k>=0; k--)
							{	ctx.lineTo(b[k].p1[0], b[k].p1[1]);
							}
						}
						ctx.closePath();
					}
					ctx.fill();
					ctx.stroke();
					break;
				}
				case "Point":
				{	var b = build[i];
					var t = b.feature.get('label');
					var p = b.geom.p1;
					var f = ctx.fillStyle;
					ctx.fillStyle = ctx.strokeStyle;
					ctx.textAlign = 'center';
					ctx.textBaseline = 'bottom';
					ctx.fillText ( t, p[0], p[1] );
					var m = ctx.measureText(t);
					var h = Number (ctx.font.match(/\d+(\.\d+)?/g).join([]));
					ctx.fillStyle = "rgba(255,255,255,0.5)";
					ctx.fillRect (p[0]-m.width/2 -5, p[1]-h -5, m.width +10, h +10)
					ctx.strokeRect (p[0]-m.width/2 -5, p[1]-h -5, m.width +10, h +10)
					ctx.fillStyle = f;
					//console.log(build[i].feature.getProperties())
				}
				default: break;
			}
		}
	}

	this.on ('postcompose', function(e)
	{	
		res = e.frameState.viewState.resolution;
		if (res > (options.maxResolution||100)) return;
		res *= 400;

		ctx = e.context;
		m = e.frameState.coordinateToPixelMatrix;
		center = [ctx.canvas.width/2, ctx.canvas.height];

		var f = this.getSource().getFeaturesInExtent(e.frameState.extent);

		ctx.save();
		var ratio=1;
		ctx.scale(ratio,ratio);
		ctx.lineWidth = 1;
		ctx.strokeStyle = "red";
		ctx.fillStyle = "rgba(0,0,255,0.5)";
		var builds = [];
		for (var i=0; i<f.length; i++)
		{	builds.push (calcBuilding (f[i], isAtt ? Number(f[i].get(height)||options.defaultHeight||0) : height));
		}
//console.log(f.lenght+" "+builds.length)
		drawBuilding (builds);
		ctx.restore();
	}, this);
}

})();