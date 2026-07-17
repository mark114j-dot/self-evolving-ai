# 項目使用指南

## 🚀 快速開始

### 1. 環境設置

```bash
# 克隆倉庫
git clone https://github.com/mark114j-dot/self-evolving-ai.git
cd self-evolving-ai

# 創建虛擬環境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安裝依賴
pip install -r requirements.txt

# 配置環境變數
cp config/env.example .env
# 編輯 .env 文件，設置你的 API 金鑰
```

### 2. 本地運行

```bash
# 啟動 FastAPI 服務
python api/main.py

# 服務將運行在 http://localhost:8000
```

### 3. Docker 運行

```bash
# 啟動所有服務
docker-compose up -d

# 檢查服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f api
```

## 📚 核心概念

### LLM 引擎

LLM 引擎是系統的核心，負責與 OpenAI API 交互。

```python
from core.llm_engine import LLMEngine

# 創建引擎
llm = LLMEngine()

# 發送聊天消息
response = llm.chat("你好")

# 生成代碼
code = llm.generate_code("創建一個求和函數")

# 分析意圖
intent = llm.analyze_intent("幫我創建一個天氣工具")
```

### 對話管理

對話管理器追蹤用户對話並提取學習點。

```python
from core.conversation import ConversationManager

manager = ConversationManager()

# 創建會話
session = manager.create_session("sess1", "user1")

# 添加消息
manager.add_message("sess1", "user", "你好")

# 提取學習
learning_points = manager.extract_learning("sess1")

# 獲取洞察
insights = manager.get_global_insights()
```

### 工具管理

工具註冊表管理所有可用的命令和工具。

```python
from tools.tool_registry import ToolRegistry

registry = ToolRegistry()

# 列出工具
tools = registry.list_tools()

# 執行工具
result = registry.execute_tool("echo", message="test")

# 註冊新工具
def my_tool(x):
    return x * 2

registry.register_tool(
    name="double",
    description="Double the input",
    function=my_tool
)
```

### API 連接

API 管理器處理外部 API 集成。

```python
from api_connector.api_manager import APIManager

api_manager = APIManager()

# 註冊 API
api_manager.register_api(
    name="weather",
    url="https://api.example.com/weather",
    method="GET"
)

# 調用 API
data = api_manager.call_api("weather", params={"city": "Beijing"})
```

### 代碼生成

代碼生成器自動生成代碼。

```python
from code_generator.generator import CodeGenerator
from code_generator.validator import CodeValidator

generator = CodeGenerator()
validator = CodeValidator()

# 生成函數
code = generator.generate_function(
    function_name="add",
    description="Add two numbers",
    parameters={"a": "int", "b": "int"}
)

# 驗證代碼
is_valid, messages = validator.validate(code, language="python")
```

### 知識庫

知識庫存儲和檢索系統學到的知識。

```python
from knowledge_base.kb_manager import KnowledgeBase

kb = KnowledgeBase()

# 添加知識
kb.add_knowledge(
    key="python_basics",
    content="Python 基礎知識...",
    category="documentation"
)

# 搜索知識
results = kb.search_knowledge("python", category="documentation")

# 獲取統計
stats = kb.get_statistics()
```

### 版本控制

Git 處理器自動提交變更。

```python
from git_manager.git_handler import GitHandler

git = GitHandler()

# 創建或更新文件
git.create_or_update_file(
    file_path="src/new_feature.py",
    content="...",
    message="Add new feature"
)

# 創建分支
git.create_branch("feature/new-feature")

# 創建 Pull Request
git.create_pull_request(
    title="Add new feature",
    body="Description...",
    head_branch="feature/new-feature"
)
```

### 部署

部署管理器處理代碼部署。

```python
from deployer.deployment import DeploymentManager

deployer = DeploymentManager()

# 部署代碼
deployer.deploy_code(
    code_id="feature_001",
    code_content="...",
    code_type="function"
)

# 獲取部署狀態
status = deployer.get_deployment_status("feature_001")

# 回滾部署
deployer.rollback_deployment("feature_001")
```

## 🔌 API 端點

### 聊天
- `POST /chat` - 發送聊天消息

### 工具
- `GET /tools` - 列出工具
- `POST /tools/execute` - 執行工具

### 系統
- `GET /health` - 健康檢查
- `GET /insights` - 獲取洞察

詳見 [API 文檔](docs/api.md)

## 🧪 測試

```bash
# 運行所有測試
pytest tests/ -v

# 運行特定測試
pytest tests/test_core.py -v

# 生成覆蓋率報告
pytest tests/ --cov=. --cov-report=html
```

## 📦 項目結構

```
self-evolving-ai/
├── core/                    # 核心模塊
├── tools/                   # 工具管理
├── api_connector/           # API 集成
├── code_generator/          # 代碼生成
├── knowledge_base/          # 知識庫
├── git_manager/             # 版本控制
├── deployer/                # 部署管理
├── database/                # 數據庫
├── api/                     # REST API
├── config/                  # 配置
├── tests/                   # 測試
├── docs/                    # 文檔
└── requirements.txt         # 依賴
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 許可

MIT License

---

**更新時間**: 2026-07-17
