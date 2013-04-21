require 'helpers/view_helper' # Just load the view helpers, no return value

module.exports = class View extends Backbone.View

  render: =>
    $('#body').html @$el.html(@template(@model.attributes))
    #console.log @template