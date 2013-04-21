from app.lib.base.model import Base
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import tornado.web
import time

class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    nickname = Column(String(30), nullable=False)
    email = Column(String(75), nullable=False)

    def __init__(self, params):
        try:
            self.email = params['email']
            self.nickname = params.get('nickname',params['email'])
        except KeyError:
            print "missing user param, ya dick."
            
    def __repr__(self):
        return "<User('%s')>" % (self.email)

    def readFields(self,user):
        if self.id == user.id:
            return ["id","nickname","email"]
        elif user:
            return ["id","nickname"]
        else:
            return None
        
    def writeFields(self,user):
        if self.id == user.id:
            return ["nickname","email"]
        else:
            return None
