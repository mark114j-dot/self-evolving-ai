"""
API 連接器模塊
動態發現和集成外部 API
"""

import logging
from typing import Dict, List, Optional, Any
import requests
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class APIEndpoint:
    """API 端點定義"""
    name: str
    url: str
    method: str = "GET"
    headers: Dict[str, str] = None
    parameters: Dict[str, Any] = None
    authentication: Optional[Dict[str, str]] = None


class APIManager:
    """API 管理器 - 管理所有集成的 API"""
    
    def __init__(self):
        self.apis: Dict[str, APIEndpoint] = {}
        self.cache: Dict[str, Any] = {}
    
    def register_api(
        self,
        name: str,
        url: str,
        method: str = "GET",
        headers: Optional[Dict[str, str]] = None,
        parameters: Optional[Dict[str, Any]] = None,
        authentication: Optional[Dict[str, str]] = None
    ) -> APIEndpoint:
        """
        註冊 API 端點
        
        Args:
            name: API 名稱
            url: API URL
            method: HTTP 方法
            headers: 請求頭
            parameters: 參數
            authentication: 認證信息
            
        Returns:
            API 端點對象
        """
        endpoint = APIEndpoint(
            name=name,
            url=url,
            method=method,
            headers=headers or {},
            parameters=parameters or {},
            authentication=authentication
        )
        self.apis[name] = endpoint
        logger.info(f"API registered: {name} ({url})")
        return endpoint
    
    def call_api(
        self,
        name: str,
        params: Optional[Dict[str, Any]] = None,
        use_cache: bool = True
    ) -> Any:
        """
        調用 API
        
        Args:
            name: API 名稱
            params: 請求參數
            use_cache: 是否使用緩存
            
        Returns:
            API 響應數據
        """
        if name not in self.apis:
            logger.error(f"API not found: {name}")
            raise ValueError(f"API not found: {name}")
        
        # 檢查緩存
        cache_key = f"{name}_{str(params)}"
        if use_cache and cache_key in self.cache:
            logger.info(f"API cache hit: {name}")
            return self.cache[cache_key]
        
        endpoint = self.apis[name]
        
        try:
            # 準備請求
            request_params = {**endpoint.parameters, **(params or {})}
            request_headers = endpoint.headers.copy()
            
            # 添加認證信息
            if endpoint.authentication:
                if "api_key" in endpoint.authentication:
                    request_headers["Authorization"] = f"Bearer {endpoint.authentication['api_key']}"
            
            # 發送請求
            response = requests.request(
                method=endpoint.method,
                url=endpoint.url,
                headers=request_headers,
                params=request_params if endpoint.method == "GET" else None,
                json=request_params if endpoint.method in ["POST", "PUT"] else None,
                timeout=10
            )
            
            response.raise_for_status()
            data = response.json()
            
            # 緩存結果
            self.cache[cache_key] = data
            
            logger.info(f"API call successful: {name}")
            return data
        
        except Exception as e:
            logger.error(f"Error calling API {name}: {str(e)}")
            raise
    
    def list_apis(self) -> List[Dict[str, Any]]:
        """
        列出所有 API
        
        Returns:
            API 列表
        """
        return [
            {
                "name": endpoint.name,
                "url": endpoint.url,
                "method": endpoint.method
            }
            for endpoint in self.apis.values()
        ]
    
    def remove_api(self, name: str) -> bool:
        """
        移除 API
        
        Args:
            name: API 名稱
            
        Returns:
            是否成功
        """
        if name in self.apis:
            del self.apis[name]
            logger.info(f"API removed: {name}")
            return True
        return False
    
    def discover_apis(self, url: str) -> List[str]:
        """
        自動發現 API
        
        Args:
            url: API 文檔 URL
            
        Returns:
            發現的 API 列表
        """
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            
            # 這裡可以添加更複雜的 API 發現邏輯
            # 例如解析 OpenAPI/Swagger 文檔
            
            logger.info(f"APIs discovered from {url}")
            return []
        
        except Exception as e:
            logger.error(f"Error discovering APIs: {str(e)}")
            return []
    
    def clear_cache(self):
        """清除緩存"""
        self.cache.clear()
        logger.info("API cache cleared")
