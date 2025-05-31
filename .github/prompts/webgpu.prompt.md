# prompt.md – WebGPU 跑分網頁應用 Copilot Agent Prompt

## 任務目標

建立一個基於 WebGPU 的前端網頁應用，能在瀏覽器中加載與渲染 3D 模型，並進行 GPU 性能跑分（benchmarking），針對 NVIDIA Orin 平台進行最佳化。此應用將使用原生 WebGPU API 搭配現代前端技術實作，並部署於 GitHub Pages 上。

---

## 開發規格

### 技術棧

* **HTML5**、**CSS3**、**JavaScript (ES6+)**
* **WebGPU API**：用於 GPU 計算與渲染
* **Three.js** 或 **Babylon.js**：作為 WebGPU 的 3D 渲染框架
* **Tailwind CSS (CDN)**：快速打造響應式界面
* **glTF / OBJ**：支援的 3D 模型格式

---

##  UI 組件需求

* **模型檢視區（Canvas）**：顯示 3D 模型並啟用 WebGPU 渲染
* **性能跑分控制面板**

  * 開始跑分按鈕
  * 實時數據顯示（FPS、幀時間、GPU 使用率等）
  * 跑分結果呈現（分數、等級、統計圖表）
* **模型上傳功能**

  * 支援拖拉上傳 `.glb`, `.gltf`, `.obj` 檔案
* **使用者介面**

  * 頁面風格採用 Tailwind 統一化設計
  * 響應式支援手機與桌面瀏覽器

---

## 核心功能模組

### 1. WebGPU 初始化模組

* 檢查瀏覽器是否支援 WebGPU
* 初始化 GPU 裝置與渲染管線
* 創建渲染畫布並掛載至 DOM

### 2. 模型加載與渲染模組

* 支援使用 Three.js 加載 3D 模型
* 使用 WebGPU 渲染路徑（`renderer.setRenderer("webgpu")`）
* 模型自動縮放至視窗大小，並允許用戶旋轉/縮放檢視
* 站台會放一個模型，預設狀態下載入它
  - ./models/

### 3. 性能測試模組（跑分）

* 計算並顯示以下指標：

  * 平均幀率（FPS）
  * 幀渲染時間（ms）
  * 渲染呼叫次數與記憶體用量
* 可定義測試場景（如大量頂點、粒子系統、光線追蹤）
* 顯示視覺化評估結果（圖表或進度條）

### 4. 前端數據儲存模組

* 使用 `localStorage` 儲存最近跑分記錄與模型快取（選配）

---

## 專案結構建議

```plaintext
webgpu-benchmark/
├── index.html           # 主頁與 Canvas 容器
├── styles.css           # 自定義樣式（含 Tailwind CDN）
├── main.js              # 應用入口，初始化 WebGPU
├── benchmark.js         # 跑分邏輯模組
├── model-loader.js      # 模型加載邏輯
├── utils.js             # 公用工具函數
├── /assets/             # 靜態資源（範例模型、圖片）
└── README.md            # 專案說明
```

---

## 注意事項

* **WebGPU 支援性**：目前僅 Chromium-based 瀏覽器支援 WebGPU，需提醒用戶使用支援版本（如最新版 Chrome / Edge）。
* **模型大小限制**：限制模型檔案大小（如 50MB）以避免瀏覽器崩潰。
* **跨平台測試**：針對不同 GPU 裝置進行測試（桌機、筆電、嵌入式系統如 Orin）。
* **無後端儲存機制**：所有資料應在瀏覽器端處理，不依賴伺服器或資料庫。

---

## 成果驗證標準

* 成功加載並渲染至少一個 glTF 模型
* 能透過按鈕觸發跑分，並即時更新 FPS 數據
* 在 Orin 平台上可穩定執行，顯示正確跑分結果
* 完整前端 UI 可透過 GitHub Pages 訪問與操作

## Ref

https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0/WaterBottle