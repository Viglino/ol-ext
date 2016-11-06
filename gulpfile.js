/** Gulp file to create dist
*/
var gulp = require("gulp");
var concat = require("gulp-concat");
var cssnext = require("gulp-cssnext");
var minify = require("gulp-minify")
var header = require('gulp-header');

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

gulp.task("css", function() {
	gulp.src([
		"./control/*.css",
		"./featureanimation/*.css", 
		"./filter/*.css",
		"./interaction/*.css",
		"./layer/*.css",
		"./overlay/*.css",
		"./style/*.css",
		"./utils/*.css"
		])
    .pipe(cssnext({
      compress: !options.dist,
      sourcemap: options.dist
    }))
	.pipe(concat("ol3-ext"+(!options.dist?"-min.css":".css")))
    .pipe(gulp.dest("./dist/"))
});

gulp.task("js", function() {
	gulp.src([
		"./control/layerswitchercontrol.js", "./control/*.js",
		"./featureanimation/featureanimation.js", "./featureanimation/*.js", 
		"./filter/filter.js", "./filter/maskfilter.js", "./filter/*.js",
		"./interaction/*.js",
		"./layer/*.js",
		"./overlay/*.js",
		"./style/fontsymbol.js", "./style/*.js",
		"./utils/*.js"
		])
	.pipe(concat("ol3-ext.js"))
    .pipe(minify({ }))
	.pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest("./dist/"))
});

gulp.task("dist", ["js","css"]);