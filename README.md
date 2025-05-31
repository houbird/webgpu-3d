# WebGPU 3D 性能跑分工具

一個基於 WebGPU 技術的 3D 模型渲染與 GPU 性能測試平台，專為現代瀏覽器設計，特別針對 NVIDIA Orin 平台進行最佳化。

## 🚀 功能特色

### 核心功能
- **WebGPU 渲染**：使用最新的 WebGPU API 進行高效能 3D 渲染
- **多格式支援**：支援 GLB、GLTF、OBJ 等主流 3D 模型格式
- **性能跑分**：全面的 GPU 性能測試與評估
- **即時監控**：實時顯示 FPS、幀時間、記憶體使用等指標
- **響應式設計**：完美支援桌面與行動裝置

### 3D 模型功能
- 拖拉上傳模型檔案
- 自動模型縮放與置中
- 軌道控制器（旋轉、縮放、平移）
- 陰影與光照效果
- 材質優化

### 跑分測試
- 三種測試模式：基礎、中等、壓力測試
- 詳細性能指標分析
- 評分系統與等級評定
- 歷史記錄保存

## 🛠 技術架構

### 技術棧
- **前端**：HTML5, CSS3, ES6+ JavaScript
- **3D 引擎**：Three.js with WebGPU Renderer
- **UI 框架**：Tailwind CSS
- **模型載入**：GLTFLoader, OBJLoader, DRACOLoader

### 檔案結構
```
webgpu-3d/
├── index.html          # 主頁面
├── styles.css          # 自定義樣式
├── main.js            # 應用程式入口
├── benchmark.js       # 跑分測試模組
├── model-loader.js    # 模型載入器
├── utils.js           # 工具函數
├── models/            # 3D 模型資源
│   └── water-bottle.glb
└── README.md          # 專案說明
```

## 🎯 使用說明

### 系統需求
- **瀏覽器**：Chrome 113+, Edge 113+ 或其他支援 WebGPU 的瀏覽器
- **作業系統**：Windows 10+, macOS 12+, Linux（最新版本）
- **硬體**：支援 DirectX 12 或 Vulkan 的 GPU

### 快速開始

1. **直接使用**
   - 開啟瀏覽器並訪問應用頁面
   - 確保瀏覽器支援 WebGPU
   - 開始載入 3D 模型進行測試

2. **本地開發**
   ```bash
   # 使用簡單的 HTTP 伺服器
   python -m http.server 8000
   # 或使用 Node.js
   npx serve .
   ```

3. **GitHub Pages 部署**
   - 推送代碼到 GitHub 儲存庫
   - 啟用 GitHub Pages
   - 通過 HTTPS 訪問

### 操作指南

#### 載入模型
1. 點擊「選擇檔案」或直接拖拉檔案到上傳區域
2. 支援格式：.glb, .gltf, .obj（最大 50MB）
3. 模型會自動載入並顯示在 3D 檢視區

#### 開始跑分
1. 調整測試時間（10-120 秒）
2. 點擊「開始跑分測試」按鈕
3. 觀察即時性能數據變化
4. 測試完成後查看詳細結果

#### 檢視結果
- **分數**：綜合性能評分
- **等級**：S+, S, A+, A, B+, B, C+, C, D
- **詳細指標**：平均/最低/最高 FPS、穩定性等

## 📊 性能指標說明

### 基本指標
- **FPS（每秒幀數）**：渲染流暢度指標
- **幀時間**：單幀渲染所需時間
- **渲染呼叫**：GPU 渲染指令數量
- **記憶體使用**：JavaScript 堆積記憶體用量

### 評分系統
- **S+ 級（800+ 分）**：頂級性能
- **S 級（700-799 分）**：優秀性能
- **A 級（500-699 分）**：良好性能
- **B 級（300-499 分）**：普通性能
- **C 級（100-299 分）**：較低性能
- **D 級（<100 分）**：性能不足

### 測試模式
1. **基礎測試**：50 個簡單幾何體
2. **中等測試**：200 個中等複雜度物件
3. **壓力測試**：500 個高複雜度物件 + 粒子系統

## 🔧 開發指南

### 專案架構

#### 主要類別
- **WebGPUBenchmarkApp**：主應用程式類別
- **BenchmarkModule**：跑分測試模組
- **ModelLoader**：模型載入器

#### 核心模組

##### main.js
- WebGPU 初始化
- 場景設定
- 渲染循環
- 使用者介面控制

##### benchmark.js
- 性能測試邏輯
- 測試場景生成
- 指標收集與分析
- 結果計算

##### model-loader.js
- 多格式模型載入
- 模型優化處理
- 材質修復
- 元數據提取

##### utils.js
- 工具函數庫
- 數學運算
- 顏色處理
- 動畫輔助

### 自定義開發

#### 添加新的測試場景
```javascript
// 在 BenchmarkModule 中添加新的測試配置
this.testConfigs.extreme = { 
    objects: 1000, 
    complexity: 'extreme' 
};
```

#### 擴展模型格式支援
```javascript
// 在 ModelLoader 中添加新的載入器
import { CustomLoader } from 'custom-loader';
this.customLoader = new CustomLoader(this.loadingManager);
```

#### 自定義評分算法
```javascript
// 修改 BenchmarkModule 中的 calculateOverallScore 方法
calculateOverallScore(metrics) {
    // 自定義評分邏輯
}
```

## 🎨 UI 客製化

### 主題顏色
應用使用 Tailwind CSS，可輕鬆修改顏色主題：

```css
/* 在 styles.css 中覆寫顏色 */
:root {
    --primary-color: #3b82f6;    /* 藍色 */
    --secondary-color: #10b981;  /* 綠色 */
    --accent-color: #f59e0b;     /* 橙色 */
}
```

### 響應式斷點
- **手機**：< 768px
- **平板**：768px - 1024px
- **桌面**：> 1024px

## 🐛 故障排除

### 常見問題

#### WebGPU 不支援
**錯誤**：「此瀏覽器不支援 WebGPU」
**解決方案**：
- 更新瀏覽器到最新版本
- 使用 Chrome 113+ 或 Edge 113+
- 確保 GPU 驅動程式為最新版本

#### 模型載入失敗
**錯誤**：「載入模型失敗」
**解決方案**：
- 檢查檔案格式是否支援
- 確認檔案大小不超過 50MB
- 檢查檔案是否損壞

#### 性能測試異常
**錯誤**：FPS 數值異常或測試卡住
**解決方案**：
- 重新載入頁面
- 降低測試複雜度
- 檢查 GPU 記憶體是否充足

### 除錯模式
開啟瀏覽器開發者工具查看詳細錯誤資訊：
```javascript
// 在 console 中啟用除錯模式
localStorage.setItem('debug', 'true');
```

## 📈 性能最佳化

### 針對 NVIDIA Orin 平台
- 使用最佳化的幾何體複雜度
- 啟用硬體加速陰影
- 優化材質貼圖大小
- 限制同時渲染物件數量

### 一般最佳化建議
- 使用 GLB 格式以獲得最佳載入速度
- 壓縮貼圖檔案大小
- 減少不必要的光源數量
- 啟用幾何體合併

## 🤝 參與貢獻

歡迎提交 Issue 和 Pull Request！

### 開發流程
1. Fork 專案
2. 創建功能分支
3. 提交變更
4. 推送到分支
5. 創建 Pull Request

### 程式碼規範
- 使用 ES6+ 語法
- 遵循 JSDoc 註解規範
- 保持程式碼簡潔易讀
- 添加適當的錯誤處理

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🔗 相關連結

- [WebGPU 官方文件](https://gpuweb.github.io/gpuweb/)
- [Three.js 文件](https://threejs.org/docs/)
- [glTF 格式規範](https://github.com/KhronosGroup/glTF)
- [NVIDIA Orin 開發指南](https://developer.nvidia.com/embedded/jetson-orin)

## 📞 聯絡資訊

如有問題或建議，歡迎通過以下方式聯繫：
- 提交 GitHub Issue
- 發送電子郵件至專案維護者

---

**注意**：本專案僅供教育和測試目的使用，不保證在所有環境下的穩定性。使用前請確保您的系統滿足最低需求。
