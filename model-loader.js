/**
 * 3D 模型載入器模組
 * 支援多種 3D 模型格式的載入與處理
 */

import * as THREE from 'three';

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class ModelLoader {
    constructor() {
        this.loadingManager = new THREE.LoadingManager();
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.objLoader = new OBJLoader(this.loadingManager);
        this.fbxLoader = new FBXLoader(this.loadingManager);
        
        // 設定 Draco 解碼器以支援壓縮模型
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        
        // 載入進度回調
        this.onProgress = null;
        this.onError = null;
        this.onLoad = null;
        
        this.setupLoadingManager();
    }

    /**
     * 設定載入管理器
     */
    setupLoadingManager() {
        this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
            console.log('開始載入:', url);
        };

        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = (itemsLoaded / itemsTotal) * 100;
            if (this.onProgress) {
                this.onProgress(progress, url);
            }
        };

        this.loadingManager.onLoad = () => {
            console.log('載入完成');
            if (this.onLoad) {
                this.onLoad();
            }
        };

        this.loadingManager.onError = (url) => {
            console.error('載入失敗:', url);
            if (this.onError) {
                this.onError(new Error(`載入失敗: ${url}`));
            }
        };
    }

    /**
     * 載入模型
     * @param {string|File} source - 模型來源（URL 或 File 物件）
     * @param {Object} options - 載入選項
     */
    async loadModel(source, options = {}) {
        const defaultOptions = {
            autoScale: true,
            autoCenter: true,
            targetSize: 3,
            enableShadows: true,
            enableAnimations: true,
            optimizeGeometry: true
        };

        const config = { ...defaultOptions, ...options };

        try {
            let url, filename;
            
            if (source instanceof File) {
                url = URL.createObjectURL(source);
                filename = source.name;
            } else {
                url = source;
                filename = source.split('/').pop();
            }

            const extension = this.getFileExtension(filename);
            const loader = this.getLoaderForExtension(extension);

            if (!loader) {
                throw new Error(`不支援的檔案格式: ${extension}`);
            }

            const result = await this.loadWithLoader(loader, url, extension);
            
            // 清理 URL（如果是從 File 創建的）
            if (source instanceof File) {
                URL.revokeObjectURL(url);
            }

            // 處理載入的模型
            const processedModel = this.processModel(result, config);
            
            return {
                model: processedModel,
                animations: result.animations || [],
                metadata: this.extractMetadata(result, filename)
            };

        } catch (error) {
            console.error('模型載入失敗:', error);
            throw error;
        }
    }

    /**
     * 獲取檔案副檔名
     */
    getFileExtension(filename) {
        return filename.toLowerCase().split('.').pop();
    }

    /**
     * 根據副檔名獲取對應的載入器
     */
    getLoaderForExtension(extension) {
        switch (extension) {
            case 'gltf':
            case 'glb':
                return this.gltfLoader;
            case 'obj':
                return this.objLoader;
            case 'fbx':
                return this.fbxLoader;
            default:
                return null;
        }
    }

    /**
     * 使用指定載入器載入模型
     */
    loadWithLoader(loader, url, extension) {
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (result) => {
                    // 根據不同格式處理結果
                    switch (extension) {
                        case 'gltf':
                        case 'glb':
                            resolve(result);
                            break;
                        case 'obj':
                        case 'fbx':
                            resolve({ scene: result, animations: [] });
                            break;
                        default:
                            resolve({ scene: result, animations: [] });
                    }
                },
                (progress) => {
                    // 進度更新已在 LoadingManager 中處理
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    /**
     * 處理載入的模型
     */
    processModel(result, config) {
        const model = result.scene.clone();

        // 優化幾何體
        if (config.optimizeGeometry) {
            this.optimizeGeometry(model);
        }

        // 自動縮放
        if (config.autoScale) {
            this.scaleModel(model, config.targetSize);
        }

        // 自動置中
        if (config.autoCenter) {
            this.centerModel(model);
        }

        // 啟用陰影
        if (config.enableShadows) {
            this.enableShadows(model);
        }

        // 修復材質
        this.fixMaterials(model);

        return model;
    }

    /**
     * 優化幾何體
     */
    optimizeGeometry(model) {
        model.traverse((child) => {
            if (child.isMesh && child.geometry) {
                const geometry = child.geometry;
                
                // 合併頂點
                if (geometry.attributes.position) {
                    geometry.mergeVertices();
                }
                
                // 計算法線（如果沒有）
                if (!geometry.attributes.normal) {
                    geometry.computeVertexNormals();
                }
                
                // 計算邊界球
                geometry.computeBoundingSphere();
                
                // 計算邊界盒
                geometry.computeBoundingBox();
            }
        });
    }

    /**
     * 縮放模型到指定大小
     */
    scaleModel(model, targetSize) {
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        if (maxDim > 0) {
            const scale = targetSize / maxDim;
            model.scale.setScalar(scale);
        }
    }

    /**
     * 將模型置中
     */
    centerModel(model) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        
        model.position.sub(center);
    }

    /**
     * 啟用陰影
     */
    enableShadows(model) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    /**
     * 修復材質
     */
    fixMaterials(model) {
        model.traverse((child) => {
            if (child.isMesh) {
                if (!child.material) {
                    // 創建預設材質
                    child.material = new THREE.MeshLambertMaterial({ 
                        color: 0x888888 
                    });
                } else if (Array.isArray(child.material)) {
                    // 處理多材質
                    child.material.forEach((material, index) => {
                        this.fixSingleMaterial(material);
                    });
                } else {
                    this.fixSingleMaterial(child.material);
                }
            }
        });
    }

    /**
     * 修復單個材質
     */
    fixSingleMaterial(material) {
        // 確保材質相容 WebGPU
        if (material.isMeshBasicMaterial || material.isMeshLambertMaterial || material.isMeshPhongMaterial) {
            // 這些材質已經相容
            return;
        }

        // 轉換不相容的材質
        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
            // 保持原有屬性，但使用相容的材質類型
            const newMaterial = new THREE.MeshLambertMaterial({
                color: material.color,
                map: material.map,
                transparent: material.transparent,
                opacity: material.opacity,
                side: material.side
            });
            
            // 複製材質屬性
            Object.assign(material, newMaterial);
        }
    }

    /**
     * 提取模型元數據
     */
    extractMetadata(result, filename) {
        const metadata = {
            filename: filename,
            format: this.getFileExtension(filename),
            loadTime: Date.now()
        };

        // 統計模型資訊
        if (result.scene) {
            let meshCount = 0;
            let materialCount = 0;
            let triangleCount = 0;
            let textureCount = 0;
            const materials = new Set();
            const textures = new Set();

            result.scene.traverse((child) => {
                if (child.isMesh) {
                    meshCount++;
                    
                    // 統計三角形
                    if (child.geometry) {
                        const geometry = child.geometry;
                        if (geometry.index) {
                            triangleCount += geometry.index.count / 3;
                        } else if (geometry.attributes.position) {
                            triangleCount += geometry.attributes.position.count / 3;
                        }
                    }
                    
                    // 統計材質
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => materials.add(mat));
                        } else {
                            materials.add(child.material);
                        }
                    }
                }
            });

            // 統計貼圖
            materials.forEach(material => {
                Object.values(material).forEach(value => {
                    if (value && value.isTexture) {
                        textures.add(value);
                    }
                });
            });

            metadata.statistics = {
                meshCount,
                materialCount: materials.size,
                triangleCount: Math.floor(triangleCount),
                textureCount: textures.size,
                hasAnimations: result.animations && result.animations.length > 0,
                animationCount: result.animations ? result.animations.length : 0
            };
        }

        return metadata;
    }

    /**
     * 驗證檔案
     */
    validateFile(file) {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const supportedFormats = ['gltf', 'glb', 'obj', 'fbx'];
        
        if (file.size > maxSize) {
            throw new Error(`檔案大小超過限制 (${Math.round(maxSize / 1024 / 1024)}MB)`);
        }
        
        const extension = this.getFileExtension(file.name);
        if (!supportedFormats.includes(extension)) {
            throw new Error(`不支援的檔案格式: ${extension}`);
        }
        
        return true;
    }

    /**
     * 獲取支援的檔案格式列表
     */
    getSupportedFormats() {
        return [
            { extension: 'gltf', name: 'glTF 2.0', description: '推薦格式，支援動畫和材質' },
            { extension: 'glb', name: 'glTF Binary', description: '二進位 glTF，檔案較小' },
            { extension: 'obj', name: 'Wavefront OBJ', description: '常見格式，僅支援幾何體' },
            { extension: 'fbx', name: 'Autodesk FBX', description: '支援動畫，檔案較大' }
        ];
    }

    /**
     * 創建材質預覽
     */
    createMaterialPreview(material) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // 繪製材質顏色
        ctx.fillStyle = `#${material.color.getHexString()}`;
        ctx.fillRect(0, 0, 64, 64);
        
        // 如果有貼圖，嘗試繪製
        if (material.map && material.map.image) {
            try {
                ctx.globalAlpha = 0.8;
                ctx.drawImage(material.map.image, 0, 0, 64, 64);
            } catch (e) {
                console.warn('無法繪製材質貼圖預覽:', e);
            }
        }
        
        return canvas;
    }

    /**
     * 清理資源
     */
    dispose() {
        // 清理載入器快取
        if (this.gltfLoader.manager) {
            this.gltfLoader.manager.dispose();
        }
    }
}
