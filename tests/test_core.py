"""
測試核心模塊
"""

import pytest
from core.llm_engine import LLMEngine
from core.conversation import ConversationManager
from tools.tool_registry import ToolRegistry


class TestLLMEngine:
    """測試 LLM 引擎"""
    
    @pytest.fixture
    def llm_engine(self):
        return LLMEngine()
    
    def test_initialization(self, llm_engine):
        """測試初始化"""
        assert llm_engine.model == "gpt-4"
        assert llm_engine.temperature == 0.7
        assert len(llm_engine.conversation_history) == 0
    
    def test_clear_history(self, llm_engine):
        """測試清除歷史"""
        llm_engine.conversation_history.append({
            "role": "user",
            "content": "test"
        })
        llm_engine.clear_history()
        assert len(llm_engine.conversation_history) == 0


class TestConversationManager:
    """測試對話管理器"""
    
    @pytest.fixture
    def conversation_manager(self):
        return ConversationManager()
    
    def test_create_session(self, conversation_manager):
        """測試創建會話"""
        session = conversation_manager.create_session("sess1", "user1")
        assert session.session_id == "sess1"
        assert session.user_id == "user1"
    
    def test_add_message(self, conversation_manager):
        """測試添加消息"""
        conversation_manager.create_session("sess1", "user1")
        message = conversation_manager.add_message(
            "sess1",
            "user",
            "Hello"
        )
        assert message.content == "Hello"
        assert message.role == "user"


class TestToolRegistry:
    """測試工具註冊表"""
    
    @pytest.fixture
    def tool_registry(self):
        return ToolRegistry()
    
    def test_list_tools(self, tool_registry):
        """測試列出工具"""
        tools = tool_registry.list_tools()
        assert len(tools) > 0
        assert any(t["name"] == "echo" for t in tools)
    
    def test_register_tool(self, tool_registry):
        """測試註冊工具"""
        def dummy_func(x):
            return x * 2
        
        tool = tool_registry.register_tool(
            name="dummy",
            description="Dummy tool",
            function=dummy_func
        )
        
        assert tool_registry.get_tool("dummy") is not None
    
    def test_execute_tool(self, tool_registry):
        """測試執行工具"""
        result = tool_registry.execute_tool("echo", message="test")
        assert "test" in result
