/** Gulp file to create dist
*/
var gulp = require("gulp");
var concat = require("gulp-concat");
var cssnext = require("gulp-cssnext");
var minify = require("gulp-minify")
var header = require('gulp-header');

// Retrieve option (--debug for css)
var options = require("minimist")(process.argv.slice(2));

// using data from package.json 
var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @abstract <%= pkg.keywords %>',
  ' * @version v<%= pkg.version %>',
  ' * @author <%= pkg.author %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

// Build css. Use --debug to build in debug mode
gulp.task("css", function() {
	gulp.src([
		"./control/*.css",
		"./featureanimation/*.css", 
		"./filter/*.css",
		"./interaction/*.css",
		"./layer/*.css",
		"./overlay/*.css", "!./overlay/popupoverlay.anim.css",
		"./style/*.css",
		"./utils/*.css"
		])
    .pipe(cssnext({
      compress: !options.debug,
      sourcemap: options.debug
    }))
	.pipe(concat("ol3-ext"+(!options.debug?".min.css":".css")))
    .pipe(gulp.dest("./dist/"))
});

// Build css in debug mode
gulp.task("cssd", function() {
	options.debug = true;
	gulp.start("css");
});

// Build js
gulp.task("js", function() {
	gulp.src([
		"./control/layerswitchercontrol.js", "./control/*.js",
		"./featureanimation/featureanimation.js", "./featureanimation/*.js", 
		"./filter/filter.js", "./filter/maskfilter.js", "./filter/*.js",
		"./interaction/*.js",
		"./layer/*.js",
		"./overlay/*.js",
		"./style/fontsymbol.js", "./style/*.js",
		"./utils/*.js",
		"!./*/*.min.js",
		"!./*/texturefilterimage.js"
		])
	.pipe(concat("ol3-ext.js"))
    .pipe(minify(
		{	ext: { 
				src:".js", 
				min:".min.js" 
			}
		}))
	.pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest("./dist/"))
});

// build the dist
gulp.task("dist", ["js","css","cssd"]);

// The default task that will be run if no task is supplied
gulp.task("default", ["js","css","cssd"]);
