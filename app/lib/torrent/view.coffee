View = require 'lib/base/view'
RowTemplate = require 'lib/torrent/templates/row'

module.exports = class Torrent extends View 
  
  events:=>
    "change #files":"upload"
    "click .action":"action"

  render: =>
    super()
    @list = @$el.find('ul')[0]

  upload:(evt)=>
    if @collection?
      #collection = new @collection()
      files = evt.target.files
      @collection.readFiles(files, @update)
      for o in @collection.models
        view = @addSubview Torrent, @list, {append:o.cid,model:o,template:RowTemplate,tagName:'li'}
        view.render()
      
      #@collection.saveEach @update
      
  update: (model) =>
    model.save().then => @$el.find("##{model.cid}").html('UPLOADED!')
    #console.log response
    #@render()
      
  action:(evt)=>
    if @model?
      action = $(evt.target).data('action')
      state = @model.states.indexOf(action)
      @model.set('state',state)
      @model.save()
