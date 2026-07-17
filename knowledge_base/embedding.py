"""
知識庫嵌入模塊
向量化和語義搜索
"""

import logging
from typing import List, Dict, Any
import numpy as np

logger = logging.getLogger(__name__)


class EmbeddingService:
    """嵌入服務"""
    
    def __init__(self):
        # TODO: 集成 sentence-transformers 或其他嵌入模型
        self.model = None
        self.embeddings_cache: Dict[str, List[float]] = {}
    
    def embed_text(self, text: str) -> List[float]:
        """
        生成文本嵌入
        
        Args:
            text: 輸入文本
            
        Returns:
            嵌入向量
        """
        if text in self.embeddings_cache:
            return self.embeddings_cache[text]
        
        try:
            # TODO: 使用模型生成嵌入
            # 這裡是簡單的演示實現
            embedding = self._simple_embed(text)
            self.embeddings_cache[text] = embedding
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            return []
    
    def similarity(
        self,
        embedding1: List[float],
        embedding2: List[float]
    ) -> float:
        """
        計算兩個嵌入之間的相似度
        
        Args:
            embedding1: 第一個嵌入
            embedding2: 第二個嵌入
            
        Returns:
            相似度分數 (0-1)
        """
        if not embedding1 or not embedding2:
            return 0.0
        
        try:
            arr1 = np.array(embedding1)
            arr2 = np.array(embedding2)
            
            # 計算餘弦相似度
            dot_product = np.dot(arr1, arr2)
            norm1 = np.linalg.norm(arr1)
            norm2 = np.linalg.norm(arr2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            similarity = dot_product / (norm1 * norm2)
            return max(0.0, min(1.0, (similarity + 1) / 2))
        except Exception as e:
            logger.error(f"Error calculating similarity: {str(e)}")
            return 0.0
    
    def _simple_embed(self, text: str) -> List[float]:
        """簡單的文本嵌入 (演示用)"""
        # 這只是一個簡單的實現
        # 實際應該使用更複雜的模型
        words = text.lower().split()
        embedding = [float(ord(c) % 10) for c in text[:128]]
        while len(embedding) < 384:
            embedding.append(0.0)
        return embedding[:384]
