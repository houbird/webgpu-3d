/**
 * WebGPU 性能跑分模組
 * 提供詳細的 GPU 性能測試功能
 */

import * as THREE from 'three';

export class BenchmarkModule {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        
        // 性能指標
        this.metrics = {
            fps: [],
            frameTime: [],
            drawCalls: [],
            triangles: [],
            memoryUsage: []
        };
        
        // 測試配置
        this.testConfigs = {
            basic: { objects: 50, complexity: 'low' },
            medium: { objects: 200, complexity: 'medium' },
            stress: { objects: 500, complexity: 'high' }
        };
        
        this.isRunning = false;
        this.currentTest = null;
        this.testObjects = [];
    }

    /**
     * 開始跑分測試
     * @param {string} testType - 測試類型: 'basic', 'medium', 'stress'
     * @param {number} duration - 測試時間（毫秒）
     */
    async startBenchmark(testType = 'medium', duration = 30000) {
        if (this.isRunning) {
            throw new Error('測試已在進行中');
        }

        this.isRunning = true;
        this.currentTest = testType;
        this.clearMetrics();
        
        try {
            // 準備測試場景
            await this.setupTestScene(testType);
            
            // 開始測試
            const startTime = performance.now();
            const endTime = startTime + duration;
            
            while (performance.now() < endTime && this.isRunning) {
                await this.collectMetrics();
                await this.waitFrame();
            }
            
            // 計算結果
            const results = this.calculateResults();
            
            // 清理測試場景
            this.cleanupTestScene();
            
            return results;
            
        } finally {
            this.isRunning = false;
            this.currentTest = null;
        }
    }

    /**
     * 停止當前測試
     */
    stopBenchmark() {
        this.isRunning = false;
    }

    /**
     * 設定測試場景
     */
    async setupTestScene(testType) {
        const config = this.testConfigs[testType];
        if (!config) {
            throw new Error(`未知的測試類型: ${testType}`);
        }

        this.testObjects = [];
        
        // 根據測試類型創建不同複雜度的物件
        switch (config.complexity) {
            case 'low':
                await this.createBasicObjects(config.objects);
                break;
            case 'medium':
                await this.createMediumObjects(config.objects);
                break;
            case 'high':
                await this.createComplexObjects(config.objects);
                break;
        }

        // 添加到場景
        this.testObjects.forEach(obj => this.scene.add(obj));
    }

    /**
     * 創建基礎測試物件
     */
    async createBasicObjects(count) {
        const geometries = [
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.SphereGeometry(0.3, 8, 6),
            new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8)
        ];

        for (let i = 0; i < count; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6) 
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            this.positionRandomly(mesh);
            this.testObjects.push(mesh);
        }
    }

    /**
     * 創建中等複雜度測試物件
     */
    async createMediumObjects(count) {
        const geometries = [
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.SphereGeometry(0.3, 16, 12),
            new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16),
            new THREE.TorusGeometry(0.3, 0.1, 8, 16)
        ];

        for (let i = 0; i < count; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6) 
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            this.positionRandomly(mesh);
            this.addAnimation(mesh);
            this.testObjects.push(mesh);
        }
    }

    /**
     * 創建高複雜度測試物件
     */
    async createComplexObjects(count) {
        const geometries = [
            new THREE.SphereGeometry(0.3, 32, 24),
            new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16),
            new THREE.DodecahedronGeometry(0.4),
            new THREE.IcosahedronGeometry(0.4, 2)
        ];

        for (let i = 0; i < count; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            
            // 使用更複雜的材質
            const material = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
                specular: 0x666666,
                shininess: 30,
                transparent: Math.random() > 0.7,
                opacity: Math.random() * 0.5 + 0.5
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            this.positionRandomly(mesh);
            this.addComplexAnimation(mesh);
            this.testObjects.push(mesh);
        }

        // 添加粒子系統
        await this.addParticleSystem();
    }

    /**
     * 添加粒子系統
     */
    async addParticleSystem() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;
            positions[i + 1] = (Math.random() - 0.5) * 20;
            positions[i + 2] = (Math.random() - 0.5) * 20;

            colors[i] = Math.random();
            colors[i + 1] = Math.random();
            colors[i + 2] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        const particles = new THREE.Points(geometry, material);
        this.testObjects.push(particles);
    }

    /**
     * 隨機定位物件
     */
    positionRandomly(mesh) {
        mesh.position.set(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 15
        );
        
        mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        
        const scale = Math.random() * 0.8 + 0.2;
        mesh.scale.setScalar(scale);
    }

    /**
     * 添加基礎動畫
     */
    addAnimation(mesh) {
        mesh.userData.animation = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            }
        };
    }

    /**
     * 添加複雜動畫
     */
    addComplexAnimation(mesh) {
        mesh.userData.animation = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            movement: {
                amplitude: Math.random() * 2 + 1,
                frequency: Math.random() * 0.02 + 0.01,
                offset: Math.random() * Math.PI * 2
            }
        };
    }

    /**
     * 更新動畫
     */
    updateAnimations() {
        const time = performance.now() * 0.001;
        
        this.testObjects.forEach(obj => {
            if (obj.userData.animation) {
                const anim = obj.userData.animation;
                
                // 旋轉動畫
                if (anim.rotationSpeed) {
                    obj.rotation.x += anim.rotationSpeed.x;
                    obj.rotation.y += anim.rotationSpeed.y;
                    obj.rotation.z += anim.rotationSpeed.z;
                }
                
                // 位移動畫
                if (anim.movement) {
                    obj.position.y += Math.sin(time * anim.movement.frequency + anim.movement.offset) * 0.01;
                }
            }
        });
    }

    /**
     * 收集性能指標
     */
    async collectMetrics() {
        const startTime = performance.now();
        
        // 更新動畫
        this.updateAnimations();
        
        // 渲染
        this.renderer.render(this.scene, this.camera);
        
        const frameTime = performance.now() - startTime;
        const fps = 1000 / frameTime;
        
        // 收集指標
        this.metrics.fps.push(fps);
        this.metrics.frameTime.push(frameTime);
        this.metrics.drawCalls.push(this.scene.children.length);
        this.metrics.triangles.push(this.countTriangles());
        
        if (performance.memory) {
            this.metrics.memoryUsage.push(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
    }

    /**
     * 計算三角形數量
     */
    countTriangles() {
        let triangles = 0;
        this.scene.traverse((child) => {
            if (child.isMesh && child.geometry) {
                const geometry = child.geometry;
                if (geometry.index) {
                    triangles += geometry.index.count / 3;
                } else if (geometry.attributes.position) {
                    triangles += geometry.attributes.position.count / 3;
                }
            }
        });
        return Math.floor(triangles);
    }

    /**
     * 等待下一幀
     */
    waitFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }

    /**
     * 計算測試結果
     */
    calculateResults() {
        const results = {
            testType: this.currentTest,
            timestamp: new Date().toISOString(),
            metrics: {}
        };

        // 計算各項指標的統計值
        for (const [key, values] of Object.entries(this.metrics)) {
            if (values.length > 0) {
                results.metrics[key] = {
                    average: values.reduce((a, b) => a + b) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    median: this.calculateMedian(values),
                    standardDeviation: this.calculateStandardDeviation(values)
                };
            }
        }

        // 計算綜合分數
        results.score = this.calculateOverallScore(results.metrics);
        results.grade = this.getPerformanceGrade(results.score);

        return results;
    }

    /**
     * 計算中位數
     */
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    /**
     * 計算標準差
     */
    calculateStandardDeviation(values) {
        const avg = values.reduce((a, b) => a + b) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / squareDiffs.length;
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * 計算綜合分數
     */
    calculateOverallScore(metrics) {
        let score = 0;
        
        // FPS 分數 (40%)
        if (metrics.fps) {
            const fpsScore = Math.min(metrics.fps.average / 60 * 400, 400);
            score += fpsScore * 0.4;
        }
        
        // 幀時間穩定性 (30%)
        if (metrics.frameTime) {
            const stability = 1 - (metrics.frameTime.standardDeviation / metrics.frameTime.average);
            const stabilityScore = Math.max(stability * 300, 0);
            score += stabilityScore * 0.3;
        }
        
        // 複雜度處理能力 (30%)
        if (metrics.triangles && metrics.fps) {
            const complexityScore = (metrics.triangles.average / 1000) * (metrics.fps.average / 60) * 300;
            score += Math.min(complexityScore, 300) * 0.3;
        }
        
        return Math.round(score);
    }

    /**
     * 獲取性能等級
     */
    getPerformanceGrade(score) {
        if (score >= 800) return 'S+';
        if (score >= 700) return 'S';
        if (score >= 600) return 'A+';
        if (score >= 500) return 'A';
        if (score >= 400) return 'B+';
        if (score >= 300) return 'B';
        if (score >= 200) return 'C+';
        if (score >= 100) return 'C';
        return 'D';
    }

    /**
     * 清理測試場景
     */
    cleanupTestScene() {
        this.testObjects.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        this.testObjects = [];
    }

    /**
     * 清空指標記錄
     */
    clearMetrics() {
        for (const key in this.metrics) {
            this.metrics[key] = [];
        }
    }

    /**
     * 獲取當前性能狀態
     */
    getCurrentPerformance() {
        if (this.metrics.fps.length === 0) return null;
        
        const recentCount = Math.min(this.metrics.fps.length, 60); // 最近60幀
        const recentFps = this.metrics.fps.slice(-recentCount);
        const recentFrameTime = this.metrics.frameTime.slice(-recentCount);
        
        return {
            fps: recentFps.reduce((a, b) => a + b) / recentFps.length,
            frameTime: recentFrameTime.reduce((a, b) => a + b) / recentFrameTime.length,
            objectCount: this.testObjects.length,
            triangleCount: this.countTriangles()
        };
    }
}
