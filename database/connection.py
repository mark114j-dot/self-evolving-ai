"""
數據庫連接管理
"""

import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from config.settings import settings

logger = logging.getLogger(__name__)


class DatabaseConnection:
    """數據庫連接管理器"""
    
    def __init__(self):
        self.engine = None
        self.SessionLocal = None
        self._initialize()
    
    def _initialize(self):
        """初始化數據庫連接"""
        try:
            # 創建數據庫引擎
            self.engine = create_engine(
                settings.database_url,
                poolclass=NullPool,
                echo=settings.debug
            )
            
            # 創建會話工廠
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )
            
            logger.info("Database connection initialized")
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            raise
    
    def get_session(self) -> Session:
        """
        獲取數據庫會話
        
        Returns:
            數據庫會話
        """
        return self.SessionLocal()
    
    def create_tables(self):
        """創建所有表"""
        try:
            from database.models import Base
            Base.metadata.create_all(bind=self.engine)
            logger.info("Database tables created")
        except Exception as e:
            logger.error(f"Error creating tables: {str(e)}")
            raise
    
    def drop_tables(self):
        """刪除所有表"""
        try:
            from database.models import Base
            Base.metadata.drop_all(bind=self.engine)
            logger.info("Database tables dropped")
        except Exception as e:
            logger.error(f"Error dropping tables: {str(e)}")
            raise
    
    def close(self):
        """關閉數據庫連接"""
        if self.engine:
            self.engine.dispose()
            logger.info("Database connection closed")


# 全局數據庫連接實例
db = DatabaseConnection()


def get_db() -> Session:
    """
    FastAPI 依賴注入函數
    
    Yields:
        數據庫會話
    """
    db_session = db.get_session()
    try:
        yield db_session
    finally:
        db_session.close()
