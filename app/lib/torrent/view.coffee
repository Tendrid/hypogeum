View = require 'lib/base/view'

module.exports = class Server extends View 
  
  events:=>
    "change #files":"upload"

  upload:(evt)=>
    files = evt.target.files
    for f in files
      if !f.type.match('torrent.*')
        continue

     console.log @model.readFile f