# 靈魂藍圖 Soul Blueprint - 部署指南

## 📁 專案結構
```
soul-blueprint/
├── index.html          # 入口 HTML
├── package.json        # 依賴配置
├── vite.config.js      # Vite 建構配置
└── src/
    ├── main.jsx        # React 入口
    └── App.jsx         # 主程式（所有邏輯都在這）
```

## 🚀 方案一：Cloudflare Pages（推薦，完全免費）

### 步驟：
1. 把這個資料夾上傳到 GitHub（建一個新 repo）
2. 登入 https://dash.cloudflare.com → Pages → Create a project
3. 選擇連接 GitHub，選你的 repo
4. 建構設定：
   - Build command: `npm run build`
   - Build output directory: `dist`
5. 點 Deploy，等 1-2 分鐘完成
6. 會拿到一個 `xxx.pages.dev` 的網址

### 綁定自訂網域：
- 在 Cloudflare Pages 設定 → Custom domains → 輸入你的域名
- 如果域名也在 Cloudflare 管理，DNS 會自動設定

---

## 🚀 方案二：Vercel（免費）

### 步驟：
1. 上傳到 GitHub
2. 登入 https://vercel.com → Import Project → 選你的 repo
3. Framework Preset 選 `Vite`
4. 點 Deploy
5. 拿到 `xxx.vercel.app` 網址

---

## 💻 本地測試

```bash
# 安裝依賴
npm install

# 開發模式（熱更新）
npm run dev

# 建構生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 📊 成本分析

| 項目 | Cloudflare Pages | Vercel | 
|------|-----------------|--------|
| 月費 | $0 | $0 |
| 頻寬 | 無限 | 100GB/月 |
| 建構 | 500次/月 | 100次/天 |
| 自訂域名 | ✅ 免費 | ✅ 免費 |
| SSL | ✅ 自動 | ✅ 自動 |
| CDN | ✅ 全球 | ✅ 全球 |

## ⚡ 效能
- 純前端，無需後端伺服器
- 所有命理計算都在瀏覽器端執行
- 建構後大約 90KB gzipped
- 首屏載入 < 1 秒

## 🔧 如果要加 Google Analytics
在 `index.html` 的 `<head>` 裡加入 GA 程式碼即可。
