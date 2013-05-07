require 'helpers/view_helper' # Just load the view helpers, no return value
defaultTemplate = require './templates/default'

module.exports = class View extends Backbone.View
  
  _init:(options)=>
    @htmltags = {}
    @subviews = []
    if !@target?
      @target = options.target || "#content"
    if !@tagName?
      @tagName = options.tagName || 'div'
    if !@template? and options.template?
      @template = options.template
    else
      @template = defaultTemplate


  initialize:(options={})=>
    @_init(options)
    super(options)
    if @model?
      @model.on "change", @_attrChange
      @model.on "__error", @onError

  _attrChange: (model,event)=>
    b = @bindAttr()
    for i,o of event.changes
      if o and b[i]?
        if b[i]["func"]?
          v = b[i]["func"](model.get(i))
        else
          v = model.get(i)
        if b[i]["id"]?
          @$el.find(b[i]["id"]).html v
          
  onError:(e)=>
    console.info e.severity,e.error
    return

  render: =>
    tagName = @tagName || 'div'
    className = @className || ''
    # Use `append` when creating a subview to append subview to an html element
    if @options.append?
      # Use `@htmltags` to pass key-pair values in as tags  
      # ie:  `{style:'width:100%;'}` becomes `style="width:100%;"`
      tags = ''
      for i,o of @htmltags
        tags+= i+'="'+o+'" '
      if !@options.parent.$('#'+@options.append).length
        $(@target).append('<'+tagName+' class="'+className+'" id="'+@options.append+'" '+tags+'/>')
      @setElement @options.parent.$ '#'+@options.append
    else
      el = $ @target
      foo = @setElement el
      el.addClass className
      # Use `@htmltags` to pass key-pair values in as tags  
      # ie:  `{style:'width:100%;'}` becomes `style="width:100%;"`
      for i,o of @htmltags
        el.attr i,o
      #$(@target).html @$el.html(@template({model:@model,collection:@collection}))
    @$el.html(@template({model:@model,collection:@collection}))
    @delegateEvents()

  addSubview: (viewClass, target, options) =>
    options = options or {}
    _.extend options,
      parent:@
      target:target
    view = new viewClass(options)  
    @subviews.push view
    return view

  clearSubviews: =>
    for name, subview of @subviews
      subview.remove()
      subview.unbind()
    @subviews = {}