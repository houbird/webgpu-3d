/**
 * 公用工具函數
 * 提供應用中常用的輔助功能
 */

/**
 * 格式化數字顯示
 * @param {number} value - 要格式化的數值
 * @param {number} decimals - 小數點位數
 * @return {string} 格式化後的字串
 */
export function formatNumber(value, decimals = 2) {
    if (typeof value !== 'number' || isNaN(value)) {
        return '--';
    }
    return value.toFixed(decimals);
}

/**
 * 格式化檔案大小
 * @param {number} bytes - 位元組數
 * @return {string} 格式化後的檔案大小
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化時間持續時間
 * @param {number} milliseconds - 毫秒數
 * @return {string} 格式化後的時間
 */
export function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
        return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * 節流函數
 * @param {Function} func - 要節流的函數
 * @param {number} wait - 等待時間（毫秒）
 * @return {Function} 節流後的函數
 */
export function throttle(func, wait) {
    let timeout;
    let previous = 0;
    
    return function(...args) {
        const now = Date.now();
        const remaining = wait - (now - previous);
        
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(this, args);
        } else if (!timeout) {
            timeout = setTimeout(() => {
                previous = Date.now();
                timeout = null;
                func.apply(this, args);
            }, remaining);
        }
    };
}

/**
 * 防抖函數
 * @param {Function} func - 要防抖的函數
 * @param {number} wait - 等待時間（毫秒）
 * @return {Function} 防抖後的函數
 */
export function debounce(func, wait) {
    let timeout;
    
    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 深度複製物件
 * @param {any} obj - 要複製的物件
 * @return {any} 複製後的物件
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    
    return obj;
}

/**
 * 產生隨機 ID
 * @param {number} length - ID 長度
 * @return {string} 隨機 ID
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 檢查 WebGPU 支援
 * @return {boolean} 是否支援 WebGPU
 */
export function checkWebGPUSupport() {
    return 'gpu' in navigator;
}

/**
 * 獲取瀏覽器資訊
 * @return {Object} 瀏覽器資訊
 */
export function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    if (ua.includes('Chrome')) {
        browser = 'Chrome';
        version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Firefox')) {
        browser = 'Firefox';
        version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari')) {
        browser = 'Safari';
        version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Edge')) {
        browser = 'Edge';
        version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }
    
    return {
        browser,
        version,
        userAgent: ua,
        platform: navigator.platform,
        language: navigator.language
    };
}

/**
 * 獲取系統資訊
 * @return {Object} 系統資訊
 */
export function getSystemInfo() {
    const info = {
        cores: navigator.hardwareConcurrency || 'Unknown',
        memory: 'Unknown',
        platform: navigator.platform,
        online: navigator.onLine
    };
    
    // 嘗試獲取記憶體資訊
    if (performance.memory) {
        info.memory = {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
    }
    
    return info;
}

/**
 * 創建顏色漸變
 * @param {number} value - 值 (0-1)
 * @param {Array} colors - 顏色陣列
 * @return {string} 十六進位顏色
 */
export function createGradientColor(value, colors = ['#ff0000', '#ffff00', '#00ff00']) {
    value = Math.max(0, Math.min(1, value));
    
    if (colors.length < 2) return colors[0] || '#000000';
    
    const segmentSize = 1 / (colors.length - 1);
    const segment = Math.floor(value / segmentSize);
    const localValue = (value % segmentSize) / segmentSize;
    
    const startColor = colors[Math.min(segment, colors.length - 1)];
    const endColor = colors[Math.min(segment + 1, colors.length - 1)];
    
    return interpolateColor(startColor, endColor, localValue);
}

/**
 * 顏色插值
 * @param {string} color1 - 起始顏色
 * @param {string} color2 - 結束顏色
 * @param {number} factor - 插值因子 (0-1)
 * @return {string} 插值後的顏色
 */
export function interpolateColor(color1, color2, factor) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 十六進位轉 RGB
 * @param {string} hex - 十六進位顏色
 * @return {Object|null} RGB 物件
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * RGB 轉十六進位
 * @param {number} r - 紅色值
 * @param {number} g - 綠色值
 * @param {number} b - 藍色值
 * @return {string} 十六進位顏色
 */
export function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * 計算向量長度
 * @param {Object} vector - 向量物件 {x, y, z}
 * @return {number} 向量長度
 */
export function vectorLength(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

/**
 * 向量正規化
 * @param {Object} vector - 向量物件 {x, y, z}
 * @return {Object} 正規化後的向量
 */
export function normalizeVector(vector) {
    const length = vectorLength(vector);
    if (length === 0) return { x: 0, y: 0, z: 0 };
    
    return {
        x: vector.x / length,
        y: vector.y / length,
        z: vector.z / length
    };
}

/**
 * 線性插值
 * @param {number} start - 起始值
 * @param {number} end - 結束值
 * @param {number} factor - 插值因子 (0-1)
 * @return {number} 插值結果
 */
export function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

/**
 * 角度轉弧度
 * @param {number} degrees - 角度
 * @return {number} 弧度
 */
export function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * 弧度轉角度
 * @param {number} radians - 弧度
 * @return {number} 角度
 */
export function radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
}

/**
 * 限制數值範圍
 * @param {number} value - 值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @return {number} 限制後的值
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * 數值映射
 * @param {number} value - 輸入值
 * @param {number} inMin - 輸入最小值
 * @param {number} inMax - 輸入最大值
 * @param {number} outMin - 輸出最小值
 * @param {number} outMax - 輸出最大值
 * @return {number} 映射後的值
 */
export function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * 平滑步進函數
 * @param {number} edge0 - 下邊界
 * @param {number} edge1 - 上邊界
 * @param {number} x - 輸入值
 * @return {number} 平滑插值結果
 */
export function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

/**
 * 簡單動畫函數
 * @param {number} duration - 動畫持續時間（毫秒）
 * @param {Function} onUpdate - 更新回調
 * @param {Function} onComplete - 完成回調
 * @param {Function} easing - 緩動函數
 * @return {Object} 動畫控制物件
 */
export function animate(duration, onUpdate, onComplete, easing = (t) => t) {
    const startTime = performance.now();
    let animationId;
    let cancelled = false;
    
    function frame() {
        if (cancelled) return;
        
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        
        onUpdate(easedProgress);
        
        if (progress < 1) {
            animationId = requestAnimationFrame(frame);
        } else if (onComplete) {
            onComplete();
        }
    }
    
    animationId = requestAnimationFrame(frame);
    
    return {
        cancel() {
            cancelled = true;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    };
}

/**
 * 常用緩動函數
 */
export const easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
    easeOutSine: t => Math.sin(t * Math.PI / 2),
    easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2
};

/**
 * 本地儲存輔助函數
 */
export const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('儲存失敗:', e);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('讀取失敗:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('刪除失敗:', e);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.warn('清空失敗:', e);
            return false;
        }
    }
};

/**
 * 事件發射器
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }
    
    emit(event, ...args) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(...args);
            } catch (e) {
                console.error('事件回調錯誤:', e);
            }
        });
    }
    
    once(event, callback) {
        const onceCallback = (...args) => {
            callback(...args);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}
