from sqlalchemy.ext.declarative import declared_attr
from tornado.escape import json_encode
import tornado.web
import time, datetime
from sqlalchemy.orm import class_mapper
from .. import db, rtorrent
from mongoengine import *
import logging
from auth import *
from sqlalchemy.exc import IntegrityError

"""
Model Decorators
"""

def toJson(fn):
    def wrapped(*args, **kwargs):
        return json_encode(fn(*args, **kwargs))
    return wrapped

#self.db.query(Act).filter_by(id_hash=hash).one()

# If you build it, they will come
class ModelBase(object):
    db = db
    rtorrent = rtorrent

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    __table_args__ = {'mysql_engine': 'InnoDB'}
    
    def get (self, *args, **kwargs):
        fields = self.readFields(kwargs['current_user'])
        if fields:
            retVal = {}
            for i in fields:
                val = getattr(self,i)
                if isinstance(val,ModelBase):
                    val = val.get(*args, **kwargs)
                if isinstance(val,datetime.datetime):
                    val = int(time.mktime(val.timetuple()))
                retVal[i] = val
            retVal["__model"] = self.__class__.__name__.lower()
            return retVal
        else:
            raise tornado.web.HTTPError(403)
        
    # new obj
    def post (self, *args, **kwargs):
        fields = self.createFields(kwargs['current_user'])
        pk = [key.name for key in class_mapper(self.__class__).primary_key]
        if fields:
            self.db.add(self)
            for i in kwargs["postdata"]:
                if i[0] == i[1] == "_":
                    continue
                if i in fields and i not in pk:
                    setattr(self,i,kwargs["postdata"][i])
                else:
                    kwargs['app'].logger.log(logging.INFO,'Field write not permitted: {0} in {1}'.format(i,self.__class__.__name__))
            try:
                self.db.commit()
            except IntegrityError:
                kwargs['app'].logger.log(logging.ERROR,'{0} already exists'.format(self.__class__.__name__))
                self.db.rollback()
                return dict()
            return self.get(*args, **kwargs)
        else:
            raise tornado.web.HTTPError(404)
            return None

    # edit obj
    def put (self, *args, **kwargs):
        fields = self.writeFields(kwargs['current_user'])
        if fields:
            _subModels = []
            # TODO: start transaction so we can roll back on fail of sub model failure
            if kwargs["postdata"]["__model"] != self.__class__.__name__.lower():
                kwargs['app'].logger.log(logging.CRITICAL, 'Model mismatch: Expected {0} given {1}'.format(self.__class__.__name__.lower(), kwargs["postdata"]["__model"]))
                return
            for i in kwargs["postdata"]:
                if i[0] == i[1] == "_":
                    continue
                #if type(kwargs["postdata"][i]) == dict:
                    ## init model based on data 
                    ## push on to _subModels
                    ##_subModels.append
                    #print kwargs["postdata"][i]
                if i in fields:
                    setattr(self,i,kwargs["postdata"][i])
                else:
                    kwargs['app'].logger.log(logging.INFO, 'Field write not permitted: {0} in {1}'.format(i,self.__class__.__name__))
            ## loop through _subModesl here and save
            ## finish transaction here
            self.db.commit()
            self.db.flush()
            return self.get(*args, **kwargs)
        else:
            raise tornado.web.HTTPError(403)

    #delete obj
    def delete (self, *args, **kwargs):
        fields = self.deleteFields(kwargs['current_user'])
        pk = [key.name for key in class_mapper(self.__class__).primary_key]
        for k in pk:
            if k not in fields:
                raise tornado.web.HTTPError(403)
        
        self.db.delete(self)
        self.db.flush()

    def head (self, *args, **kwargs):
        raise tornado.web.HTTPError(404)

    def options (self, *args, **kwargs):
        raise tornado.web.HTTPError(404)
        
    # defines which fields can be read
    def readFields(self,user):
        return None

    # defines which fields can be written
    def writeFields(self,user):
        return None

    # defines which fields can be written as an execute function
    def executeFields(self,user):
        return None

    # defines which fields can be written
    # item is created with these fields.  Defaults are used for all non permitted fields
    def createFields(self,user):
        return None

    # defines which fields can be set to null or empty
    # if private key is provided, item deletion is permitted
    def deleteFields(self,user):
        return None
        
# Kick out that Base class, sucka
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base(cls=ModelBase)
