'use strict';

var gulp = require('gulp');

var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var babel = require('gulp-babel');
var cache = require('gulp-cached');

var production = (process.env.NODE_ENV === 'production');
console.log('Building for ' + (production ? 'production' : 'development'));

var webType = production ? 'prod' : 'local';
var dbType = process.env.DATABASE === 'production' ? 'prod' : 'local';

var serverWatchGlobs = {};

/*
 * Start shared section
 */

function createWatchTask(name, globs) {
  gulp.task(name, function(cb) {
    for (var taskName in globs) {
      var glob = globs[taskName];
      gulp.watch(glob, [taskName]);
    }
    cb();
  });
}

var createCopyGulpTask = function(taskName, globs, destDir, watchGlobsVar) {
  watchGlobsVar[taskName] = globs;

  gulp.task(taskName, function() {
    return gulp.src(globs)
      .pipe(cache(taskName))
      .pipe(gulp.dest(destDir));
  });
};

var handleError = function(error) {
  var stack = error.stack;

  if (stack) {
    // Trim the parser junk that makes you have to scroll up a lot
    var firstParseIndex = stack.indexOf('Parser.pp.');
    if (firstParseIndex !== -1) {
      var trimmedStack = stack.substring(0, firstParseIndex);
      console.error(trimmedStack);
    } else {
      console.error(stack);
    }
  } else {
    console.error(error);
  }

  this.emit('end');
};

/*
 * End shared section
 */

/*
 * Start server section
 */

var createBuildServerGulpTask = function(name, globs, destination) {
  serverWatchGlobs[name] = globs;

  gulp.task(name, function() {
    return gulp.src(globs)
      .pipe(cache(name))
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['es2015'],
        plugins: ['transform-class-properties']
      }))
      .on('error', handleError)
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(destination));
  });
};

createBuildServerGulpTask('build-server-js', [
  'server/{**/*.js,bin/www}',
  '!server/{public,build,node_modules}/**/*.js'
], 'dist/app');

createCopyGulpTask('copy-server', 'server/{{logs,public,views}/**/*}', 'dist/app', serverWatchGlobs);

var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');

gulp.task('launch-server', function() {
  livereload.listen();
  nodemon({
    script: 'dist/app/bin/www',
    ext: 'js ejs css',
    env: {
      NODE_ENV: webType === 'prod' ? 'production' : 'development',
      DATABASE: dbType === 'prod' ? 'production' : 'development'
    },
    watch: 'dist/app',
    delay: 0.2,
    stdout: false
  }).on('readable', function() {
    this.stdout.on('data', function(chunk) {
      if (/^Express server listening on port/.test(chunk)) {
        livereload.changed(__dirname + '/dist/app');
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('build-server', ['build-server-js', 'copy-server']);

gulp.task('run-server', function(cb) {
  runSequence('build-server', 'launch-server', cb);
});


console.log(serverWatchGlobs);
createWatchTask('start-watching-server', serverWatchGlobs);

gulp.task('watch-server', ['run-server'], function(cb) { runSequence('start-watching-server', cb); });
gulp.task('server', ['watch-server']); // Alias

/*
 * End server section
 */

gulp.task('watch-all', ['watch-server']);
gulp.task('build-all', ['build-server']);

// Default development mode: use the live DB, but local server
gulp.task('all', function(cb) {
  webType = 'local';
  dbType = 'prod';
  runSequence('watch-all', cb);
});

// Other modes: all local (DB and web) and all live
gulp.task('all-local', function(cb) {
  webType = 'local';
  dbType = 'local';
  runSequence('watch-all', cb);
});
gulp.task('all-prod', function(cb) {
  webType = 'prod';
  dbType = 'prod';
  runSequence('watch-all', cb);
});
