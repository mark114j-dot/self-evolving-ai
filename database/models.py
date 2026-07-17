"""
數據庫模型定義
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, Integer, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    """用户模型"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ConversationSession(Base):
    """對話會話模型"""
    __tablename__ = "conversation_sessions"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False)
    title = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Message(Base):
    """消息模型"""
    __tablename__ = "messages"
    
    id = Column(String(36), primary_key=True)
    session_id = Column(String(36), nullable=False)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Tool(Base):
    """工具模型"""
    __tablename__ = "tools"
    
    id = Column(String(36), primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    version = Column(String(20), default="1.0.0")
    status = Column(String(20), default="active")  # active, inactive, deprecated
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Knowledge(Base):
    """知識項模型"""
    __tablename__ = "knowledge"
    
    id = Column(String(36), primary_key=True)
    key = Column(String(100), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    access_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Deployment(Base):
    """部署記錄模型"""
    __tablename__ = "deployments"
    
    id = Column(String(36), primary_key=True)
    code_id = Column(String(100), nullable=False)
    version = Column(Integer, default=1)
    status = Column(String(20), default="pending")  # pending, deployed, failed
    code_type = Column(String(50))
    deployed_by = Column(String(36))
    deployed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
