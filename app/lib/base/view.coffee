require 'helpers/view_helper' # Just load the view helpers, no return value
defaultTemplate = require './templates/default'

module.exports = class View extends Backbone.View
  template: defaultTemplate

  initialize:(options)=>
    if options.template?
      @template = options.template
    super()

  render: =>
    $('#body').html @$el.html(@template(@model.attributes))
    #console.log @template