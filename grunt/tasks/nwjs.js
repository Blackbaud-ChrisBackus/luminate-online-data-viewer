/* jshint strict:false */

module.exports = {
  options: {
    appName: '<%= pkg.window.title %>', 
    platforms: [
      'osx64', 
      'win32', 
      'win64'
    ], 
    buildDir: './download', 
    buildType: function() {
      return '';
    }
    /* TODO macIcns: './dist/images/osx-icon.icns' */
  }, 
  
  src: [
    './package.json', 
    './dist/**/*.*'
  ]
}