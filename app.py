#!/usr/bin/env python

#import markdown
import os.path
#import re
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
#import unicodedata
from sqlalchemy.orm import exc
import logging
from jinja2 import Environment, FileSystemLoader

from tornado.options import define, options
from tornado.escape import json_encode, json_decode

from app.lib import *  # import the engine to bind

class ErrorLog(object):
    log = False
    logStack = {}
    
    def __init__(self,logLevels):
        self.logLevels = logLevels
        self.purge()
    
    def log(self,errLvl,msg,*args,**kwargs):
        if int(errLvl) >= int(self.errorLevel):
            try:
                self.logStack[errLvl]
            except KeyError:
                self.logStack[errLvl] = []
            if self.log:
                pass
                #logging.log(errLvl,msg)
            self.logStack[errLvl].append(msg)
        
    def purge(self):
        log = self.logStack
        self.logStack = {}
        self.errorLevel = logging.CRITICAL
        #for i in self.logLevels:
        #    self.logStack[i] = []
        return log

class Application(tornado.web.Application):
    def __init__(self):
        define("port", default=8888, help="run on the given port", type=int)
        handlers = [
            (r"/", HomeHandler),
            (r"/auth/google/login", AuthGoogle),
            #(r"/auth/facebook/login", AuthFacebook),
            (r"/auth/logout", AuthLogout),
            (r"/rest/([^/]+)/([^/]*)(.*)",crud)
        ]
        settings = {
            "page_title":"rTorrent",
            "template_path":os.path.join(os.path.dirname(__file__), "templates"),
            "static_path":os.path.join(os.path.dirname(__file__), "static"),
            #"ui_modules":{"UserModule": UserModule},
            "xsrf_cookies":True,
            "cookie_secret":"fGBN76eREwSXCVhGBJVFCDEYhysUDYTFHvBI",
            "autoescape":None
        }
        tornado.web.Application.__init__(self, handlers, **settings)
        self.db = db
        self.logger = ErrorLog([10,20,30,40,50])


class BaseHandler(tornado.web.RequestHandler):
    env = Environment(loader=FileSystemLoader('./templates'))

    @property
    def db(self):
        return self.application.db
    @property
    def logger(self):
        return self.application.logger
    
    def get_current_user(self):
        user_id = self.get_secure_cookie("user")
        if not user_id: return None
        return self.db.query(User).get(user_id)

class crud(BaseHandler):
    def check(self,model,id,func):
        #self.xsrf_token
        self.logger.errorLevel = self.request.headers.get('X-Errorlevel','')
        try:
            postdata = json_decode(self.request.body)
        except ValueError:
            postdata = {}
        try:
            if func == 'post':
                obj = apiModels[model]()
            else:
                obj = self.db.query(apiModels[model]).filter_by(id=id).one()
            if func == 'raw':
                return obj
            retVal = getattr(obj,func)(current_user=self.current_user,postdata=postdata,app=self)
            self.db.commit()
            return retVal
            #self.finish(json_encode(retVal))
        except (KeyError, exc.NoResultFound) as e:
            raise tornado.web.HTTPError(404)

    #reads object
    def get (self, model, id, extendedRequests):
        #extendedRequests = filter(bool, extendedRequests.split('/'))
        
        #for search, when I get that far
        # 127.0.0.1:8888/rest/torrent/where/foo=bar&boo>1/&moo=boo|moo=doo
        where = self.get_argument('where',None)
        if where:
            where = json_decode(where)
            query = self._parseWhere(where)
            oz = []
            obj = {}
            if query:
                query = self.db.query(apiModels[model]).filter(query['query'])
                oz = query.all()
                obj = {"results":[]}
            for o in oz:
                obj['results'].append(getattr(o,"get")(current_user=self.current_user,app=self))
        else:
            obj = self.check(model,id,"get")
        #print obj
        obj['__errors'] = self.logger.purge()
        self.finish(json_encode(obj))

    # This method is super ugly, and has tons of slow regex hacks in it to protect against sql injection.
    # I'll make this better once i have time to dig in to SQLAlchemy more.
    # If you've stumbled across this and know how to fix it, feel free to submit a pull request
    def _parseWhere(self, where):
        import re
        from sqlalchemy import and_, or_
        _log = {"or":or_,"and":and_}
        _baseList = []
        cols = []
        i="and"
        for i,o in where.items():
            for li in o:
                if type(li) == dict:
                    out = self._parseWhere(li)
                    try:
                        _baseList.append(out["query"])
                        cols += out["cols"]
                    except KeyError:
                        return
                else:
                    _list = []
                    for qu in o:
                        sqli = re.search("[^\w\d\=<>]",qu)
                        if sqli:
                            self.logger.log(logging.CRITICAL,'sql injection detected: {}'.format(sqli.group()))
                            return {}
                        _ma = re.search("\w+$",qu).group()
                        qu = qu.replace(_ma, '"{}"'.format(_ma))
                        _list.append(qu)
                        col = re.match("[\w\.]+",qu).group()
                        if col not in cols:
                            cols.append(col)
                    return dict(cols=cols,query=_log[i](*_list))
        return dict(cols=cols,query=_log[i](*_baseList))
        
    #edits object
    def post (self, model, id, extendedRequests):
        extendedRequests = filter(bool, extendedRequests.split('/'))
        if extendedRequests and "permissions" in extendedRequests:
            obj = self.check(model,id,"raw")
            retVal = dict(readFields=obj.readFields(self.current_user),
                          writeFields=obj.writeFields(self.current_user),
                          executeFields=obj.executeFields(self.current_user),
                          createFields=obj.createFields(self.current_user),
                          deleteFields=obj.deleteFields(self.current_user))
            self.finish(json_encode(retVal))
        else:
            obj = self.check(model,id,"post")
            obj['__errors'] = self.logger.purge()
            self.finish(json_encode(obj))
    
    #creates object
    def put (self, model, id, extendedRequests):
        extendedRequests = filter(bool, extendedRequests.split('/'))
        obj = self.check(model,id,"put")
        obj['__errors'] = self.logger.purge()
        self.finish(json_encode(obj))
        
    #deletes object
    def delete (self, model, id, extendedRequests):
        extendedRequests = filter(bool, extendedRequests.split('/'))
        obj = self.check(model,id,"delete")
        self.finish(json_encode(obj))

    # TODO:
    #should update with header info (or any other meta info) telling update dt of the object
    def head (self, model, id, extendedRequests):
        extendedRequests = filter(bool, extendedRequests.split('/'))
        obj = self.check(model,id,"head")
        self.finish(json_encode(obj))
    
class HomeHandler(BaseHandler):
    def get(self):
        template = self.env.get_template('home.html')
        self.finish( template.render() )
        #self.render("home.html", entries=[])


class UserModule(tornado.web.UIModule):
    def render(self, user):
        return self.render_string("modules/user.html", user=user)

class AuthGoogle(BaseHandler, tornado.auth.GoogleMixin):
    @tornado.web.asynchronous
    def get(self):
        if self.get_argument("openid.mode", None):
            self.get_authenticated_user(self.async_callback(self._on_auth))
            return
        self.authenticate_redirect()
    
    def _on_auth(self, trusted):
        if not trusted:
            raise tornado.web.HTTPError(500, "Google auth failed")
        user = self.db.query(User).filter_by(email=trusted["email"]).one()
        if not user:
            # Auto-create first author
            user = User(trusted["email"])
            self.db.add(user)
            self.db.commit()
        self.set_secure_cookie("user", str(user.id))
        self.redirect(self.get_argument("next", "/"))

class AuthLogout(BaseHandler):
    def get(self):
        self.clear_cookie("user")
        self.redirect(self.get_argument("next", "/"))

def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
