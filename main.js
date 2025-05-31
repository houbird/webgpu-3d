import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import { BenchmarkModule } from './benchmark.js';
import { ModelLoader } from './model-loader.js';
import { formatNumber, storage, animate, easing } from './utils.js';

class WebGPUBenchmarkApp {  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.model = null;
    this.animationId = null;
    
    // 模組
    this.benchmarkModule = null;
    this.modelLoader = new ModelLoader();
    
    // 性能追蹤
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
    this.frameTime = 0;
    this.isRunning = false;
    
    // 跑分相關
    this.benchmarkActive = false;
    this.benchmarkStartTime = 0;
    this.benchmarkDuration = 30000; // 30 秒
    this.fpsHistory = [];
    this.frameTimeHistory = [];
    
    this.init();
  }

  async init() {    try {
      await this.checkWebGPUSupport();
      await this.initRenderer();
      this.initScene();
      this.initControls();
      this.initEventListeners();
      
      // 初始化跑分模組
      this.benchmarkModule = new BenchmarkModule(this.renderer, this.scene, this.camera);
      
      await this.loadDefaultModel();
      this.animate();
      this.updateUI();
    } catch (error) {
      console.error('初始化失敗:', error);
      this.showError('初始化失敗: ' + error.message);
    }
  }

  async checkWebGPUSupport() {
    if (!navigator.gpu) {
      throw new Error('此瀏覽器不支援 WebGPU。請使用最新版本的 Chrome 或 Edge。');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('無法獲取 GPU 適配器。');
    }

    // 更新 GPU 資訊
    document.getElementById('webgpu-support').textContent = '支援';
    document.getElementById('webgpu-support').className = 'text-green-400';
    
    // 嘗試獲取 GPU 資訊
    try {
      const info = await adapter.requestAdapterInfo();
      document.getElementById('gpu-vendor').textContent = info.vendor || '未知';
      document.getElementById('gpu-model').textContent = info.architecture || '未知';
      document.getElementById('driver-version').textContent = info.driver || '未知';
    } catch (e) {
      console.warn('無法獲取詳細 GPU 資訊:', e);
    }
  }

  async initRenderer() {
    const canvas = document.getElementById('webgpu-canvas');
    
    this.renderer = new WebGPURenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    
    await this.renderer.init();
    
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x1a1a2e, 1);
    
    // 啟用陰影
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    document.getElementById('webgpu-status').textContent = 'WebGPU 已啟用';
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    // 相機設定
    const canvas = document.getElementById('webgpu-canvas');
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 3, 8);

    // 燈光設定
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 0.8, 20);
    pointLight.position.set(-5, 5, -5);
    this.scene.add(pointLight);

    // 環境設定
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshLambertMaterial({ color: 0x2d3748 });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    this.scene.add(plane);
  }

  initControls() {
    const canvas = document.getElementById('webgpu-canvas');
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  initEventListeners() {
    // 視窗大小調整
    window.addEventListener('resize', () => this.onWindowResize());
    
    // 檔案上傳
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));
    
    // 拖拉上傳
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) this.handleFileUpload(file);
    });
    
    // 跑分控制
    document.getElementById('start-benchmark').addEventListener('click', () => this.startBenchmark());
    
    // 測試時間滑桿
    const durationSlider = document.getElementById('duration-slider');
    durationSlider.addEventListener('input', (e) => {
      this.benchmarkDuration = parseInt(e.target.value) * 1000;
      document.getElementById('test-duration').textContent = `${e.target.value} 秒`;
    });
  }

  async loadDefaultModel() {
    try {
      await this.loadModel('./models/water-bottle.glb');
    } catch (error) {
      console.warn('無法載入預設模型:', error);
    }
  }  async loadModel(url) {
    this.showLoading(true);
    
    try {
      // 使用模型載入器
      const result = await this.modelLoader.loadModel(url);
      
      // 移除舊模型
      if (this.model) {
        this.scene.remove(this.model);
      }
      
      this.model = result.model;
      this.model.position.y = -1;
      this.scene.add(this.model);
      
    } catch (error) {
      console.error('載入模型失敗:', error);
      this.showError('載入模型失敗: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }  async handleFileUpload(file) {
    if (!file) return;
    
    try {
      // 驗證檔案
      this.modelLoader.validateFile(file);
      
      // 載入模型
      const result = await this.modelLoader.loadModel(file);
      
      // 移除舊模型
      if (this.model) {
        this.scene.remove(this.model);
      }
      
      this.model = result.model;
      this.model.position.y = -1;
      this.scene.add(this.model);
      
      // 顯示模型資訊
      console.log('模型載入成功:', result.metadata);
      
    } catch (error) {
      this.showError(error.message);
    }
  }async startBenchmark() {
    if (this.benchmarkActive || !this.benchmarkModule) return;
    
    this.benchmarkActive = true;
    const button = document.getElementById('start-benchmark');
    button.textContent = '測試進行中...';
    button.disabled = true;
    
    // 重置進度條
    document.getElementById('progress-bar').style.width = '0%';
    document.getElementById('progress-text').textContent = '0%';
    
    try {
      // 使用跑分模組進行測試
      const results = await this.benchmarkModule.startBenchmark('medium', this.benchmarkDuration);
      this.displayBenchmarkResults(results);
      
      // 儲存結果
      this.saveBenchmarkResult(results);
      
    } catch (error) {
      console.error('跑分測試失敗:', error);
      this.showError('跑分測試失敗: ' + error.message);
    } finally {
      this.benchmarkActive = false;
      button.textContent = '開始跑分測試';
      button.disabled = false;
    }
  }displayBenchmarkResults(results) {
    const resultsHTML = `
      <div class="text-center">
        <div class="score-display">${results.score}</div>
        <div class="score-grade grade-${results.grade.toLowerCase().replace('+', '')}">${results.grade} 級</div>
      </div>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span>平均 FPS:</span>
          <span class="font-mono">${formatNumber(results.metrics.fps?.average || 0, 1)}</span>
        </div>
        <div class="flex justify-between">
          <span>平均幀時間:</span>
          <span class="font-mono">${formatNumber(results.metrics.frameTime?.average || 0, 2)} ms</span>
        </div>
        <div class="flex justify-between">
          <span>最低 FPS:</span>
          <span class="font-mono">${formatNumber(results.metrics.fps?.min || 0, 1)}</span>
        </div>
        <div class="flex justify-between">
          <span>最高 FPS:</span>
          <span class="font-mono">${formatNumber(results.metrics.fps?.max || 0, 1)}</span>
        </div>
        <div class="flex justify-between">
          <span>穩定性:</span>
          <span class="font-mono">${formatNumber((1 - (results.metrics.frameTime?.standardDeviation || 0) / (results.metrics.frameTime?.average || 1)) * 100, 1)}%</span>
        </div>
      </div>
    `;
    
    document.getElementById('benchmark-results').innerHTML = resultsHTML;
  }  saveBenchmarkResult(result) {
    const history = storage.get('benchmark-history', []);
    history.push({
      ...result,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    // 只保留最近 10 次記錄
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    storage.set('benchmark-history', history);
  }  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    const currentTime = performance.now();
    this.frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.frameCount++;
    
    // 每秒更新一次 FPS
    if (this.frameCount % 60 === 0) {
      this.fps = 1000 / this.frameTime;
      this.updatePerformanceDisplay();
    }
    
    // 旋轉模型
    if (this.model) {
      this.model.rotation.y += 0.005;
    }
    
    // 更新控制器
    this.controls.update();
    
    // 獲取跑分模組的當前性能數據
    if (this.benchmarkModule && this.benchmarkActive) {
      const performance = this.benchmarkModule.getCurrentPerformance();
      if (performance) {
        this.updateBenchmarkProgress();
      }
    }
    
    // 渲染場景
    this.renderer.render(this.scene, this.camera);
  }

  updateBenchmarkProgress() {
    if (!this.benchmarkActive || !this.benchmarkModule) return;
    
    const elapsed = performance.now() - this.benchmarkStartTime;
    const progress = Math.min((elapsed / this.benchmarkDuration) * 100, 100);
    
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${Math.round(progress)}%`;
  }

  updatePerformanceDisplay() {
    document.getElementById('fps-counter').textContent = `FPS: ${Math.round(this.fps)}`;
    document.getElementById('current-fps').textContent = Math.round(this.fps);
    document.getElementById('frame-time').textContent = `${this.frameTime.toFixed(2)} ms`;
    
    // 模擬渲染呼叫和記憶體使用
    const drawCalls = this.scene.children.length;
    const memoryUsage = (performance.memory ? 
      (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) : 
      'N/A');
    
    document.getElementById('draw-calls').textContent = drawCalls;
    document.getElementById('memory-usage').textContent = `${memoryUsage} MB`;
  }

  updateUI() {
    // 初始化 UI 狀態
    this.updatePerformanceDisplay();
  }

  onWindowResize() {
    const canvas = document.getElementById('webgpu-canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }

  showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = show ? 'flex' : 'none';
  }

  showError(message) {
    console.error(message);
    // 可以在這裡添加錯誤提示 UI
    alert(message);
  }
}

// 初始化應用
document.addEventListener('DOMContentLoaded', () => {
  new WebGPUBenchmarkApp();
});
