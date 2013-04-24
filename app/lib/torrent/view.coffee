View = require 'lib/base/view'

module.exports = class Server extends View 
  
  events:=>
    "change #files":"upload"
    "click .action":"action"

  upload:(evt)=>
    files = evt.target.files
    for f in files
      if !f.type.match('torrent.*')
        continue
    
  action:(evt)=>
    action = $(evt.target).data('action')
    state = @model.states.indexOf(action)
    @model.set('state',state)
    @model.save()
