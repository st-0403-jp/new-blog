const browserSync = require('browser-sync');

browserSync.init({
  server: 'build',
  files: ['build/**/*.html', 'build/**/*.css'],
});
