View = require 'lib/base/view'

module.exports = class Torrent extends View 
  
  events:=>
    "change #files":"upload"
    "click .action":"action"

  upload:(evt)=>
    if @collection?
      #collection = new @collection()
      files = evt.target.files
      @collection.readFiles(files)
      @collection.saveEach @update
      
  update: (response) =>
    console.log response
      
  action:(evt)=>
    if @model?
      action = $(evt.target).data('action')
      state = @model.states.indexOf(action)
      @model.set('state',state)
      @model.save()
