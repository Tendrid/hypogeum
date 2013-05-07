View = require 'lib/base/view'
RowTemplate = require 'lib/torrent/templates/row'

module.exports = class Torrent extends View 
  
  events:=>
    "change #files":"upload"
    "click .action":"action"

  bindAttr:=>
    id:{id:".id",func:@changeId}
    hash:{id:".hash"}
    path:{id:".path"}
    name:{id:".name"}
    state:{func:@changeState}

  changeId:(v)=>
    @$el.find('.controls').show()
    return v

  changeState:(v)=>
    @$el.find(".state#{v}").css('background-color','red')
    return v

  onError:(e)=>
    if e.severity >= 40
      @$el.html e.error
    return

  render: =>
    super()
    if @model? and !@model.get("id")
      @$el.find('.controls').hide()
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
    model.save() #.then => @$el.find("##{model.cid}").append('UPLOADED!')
    #console.log response
    #@render()
      
  action:(evt)=>
    if @model?
      action = $(evt.target).data('action')
      state = @model.states.indexOf(action)
      @model.set('state',state)
      @model.save()
