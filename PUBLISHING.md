"""
發佈指南
"""

# Self-Evolving AI 發佈指南

## 📦 發佈到 PyPI (Python Package Index)

### 前置條件
1. 創建 PyPI 賬戶: https://pypi.org/account/register/
2. 創建 API Token: https://pypi.org/manage/account/
3. 在 GitHub Secrets 中設置 `PYPI_API_TOKEN`

### 發佈步驟
```bash
# 本地測試 (可選)
python -m pip install --upgrade pip
pip install build twine
python -m build
twine check dist/*
twine upload dist/* --repository testpypi  # 測試上傳

# 正式發佈 - 只需要創建 git tag
git tag v0.1.0
git push origin v0.1.0
```

### 發佈後安裝
```bash
pip install self-evolving-ai
```

---

## 🐳 發佈到 Docker Hub

### 前置條件
1. 創建 Docker Hub 賬戶: https://hub.docker.com/
2. 在 GitHub Secrets 中設置:
   - `DOCKER_USERNAME` - 你的 Docker Hub 用户名
   - `DOCKER_PASSWORD` - 你的 Docker Hub 密碼或 Personal Access Token

### 自動發佈
推送代碼到 main 分支後，GitHub Actions 會自動構建並上傳到 Docker Hub。

### 手動發佈
```bash
# 構建 Docker 映像
docker build -t mark114j-dot/self-evolving-ai:latest .
docker build -t mark114j-dot/self-evolving-ai:0.1.0 .

# 登錄 Docker Hub
docker login

# 推送到 Docker Hub
docker push mark114j-dot/self-evolving-ai:latest
docker push mark114j-dot/self-evolving-ai:0.1.0
```

### 發佈後使用
```bash
docker run -e OPENAI_API_KEY=your_key -p 8000:8000 mark114j-dot/self-evolving-ai
```

---

## 🚀 部署到 Heroku (免費雲平台)

### 前置條件
1. 創建 Heroku 賬戶: https://www.heroku.com/
2. 安裝 Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
3. 創建應用: `heroku create your-app-name`
4. 在 GitHub Secrets 中設置:
   - `HEROKU_API_KEY` - Heroku API 密鑰
   - `HEROKU_APP_NAME` - 你的 Heroku 應用名稱
   - `HEROKU_EMAIL` - 你的 Heroku 郵箱

### 本地部署
```bash
# 安裝 Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 登錄
heroku login

# 創建應用
heroku create your-app-name

# 設置環境變數
heroku config:set OPENAI_API_KEY=your_key
heroku config:set GITHUB_TOKEN=your_token

# 部署
git push heroku main

# 查看日誌
heroku logs --tail
```

### 自動部署
推送到 main 分支後，GitHub Actions 會自動部署到 Heroku。

### 訪問應用
```
https://your-app-name.herokuapp.com/docs
```

---

## 📝 發佈到 GitHub Releases

### 前置條件
已有 GitHub 倉庫 ✅

### 創建 Release
```bash
# 創建 git 標籤
git tag -a v0.1.0 -m "Release version 0.1.0"

# 推送標籤
git push origin v0.1.0

# 在 GitHub 上創建 Release
# https://github.com/mark114j-dot/self-evolving-ai/releases/new
```

---

## 🔐 設置 GitHub Secrets

### 在 GitHub 倉庫設置 Secrets

1. 進入 Settings → Secrets and variables → Actions
2. 添加以下 Secret:

| Secret 名稱 | 值 | 說明 |
|------------|-----|------|
| `PYPI_API_TOKEN` | PyPI API Token | 從 PyPI 獲取 |
| `DOCKER_USERNAME` | Docker Hub 用户名 | Docker Hub 賬戶 |
| `DOCKER_PASSWORD` | Docker Hub 密碼/Token | Docker Hub 密碼或 PAT |
| `HEROKU_API_KEY` | Heroku API 密鑰 | 從 Heroku 獲取 |
| `HEROKU_EMAIL` | Heroku 郵箱 | 你的 Heroku 郵箱 |
| `HEROKU_APP_NAME` | Heroku 應用名 | 你的 Heroku 應用名 |

---

## 📋 發佈檢查清單

- [ ] 更新版本號 (setup.py, pyproject.toml)
- [ ] 更新 CHANGELOG
- [ ] 更新 README
- [ ] 所有測試通過 ✅
- [ ] 代碼質量檢查通過 ✅
- [ ] 設置 GitHub Secrets ✅
- [ ] 創建 git tag 並推送
- [ ] 監控 GitHub Actions 構建
- [ ] 驗證 PyPI 發佈
- [ ] 驗證 Docker Hub 發佈
- [ ] 驗證 Heroku 部署

---

## 🔗 發佈後的鏈接

### PyPI
https://pypi.org/project/self-evolving-ai/

### Docker Hub
https://hub.docker.com/r/mark114j-dot/self-evolving-ai

### Heroku
https://your-app-name.herokuapp.com/

### GitHub
https://github.com/mark114j-dot/self-evolving-ai

---

## 🚨 常見問題

### Q: 如何更新版本？
A: 編輯 setup.py 和 pyproject.toml 中的版本號，然後創建新的 git tag。

### Q: Docker 發佈失敗？
A: 檢查 DOCKER_USERNAME 和 DOCKER_PASSWORD 是否正確設置。

### Q: Heroku 部署失敗？
A: 檢查日誌 `heroku logs --tail`，確保環境變數設置正確。

### Q: PyPI 發佈重複？
A: 不能發佈相同版本。需要更新版本號。

---

## 📞 支持

- GitHub Issues: https://github.com/mark114j-dot/self-evolving-ai/issues
- 文檔: https://github.com/mark114j-dot/self-evolving-ai/tree/main/docs

---

**開始發佈你的 AI 產品！🚀**
