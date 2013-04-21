Application = require 'application'

# Initialize the application on DOM ready event.
$(document).on 'ready', ->
  _.templateSettings = {interpolate : /\{\{(.+?)\}\}/g}
  window.app = Application
  window.app.initialize({errorLevel:'DEBUG'})
