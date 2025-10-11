import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class ThreeJSPlatform {
    constructor() {
        this.scenes = [];
        this.currentScene = null;
        this.currentSceneModule = null;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.init();
    }
    
    async init() {
        await this.setupThreeJS();
        await this.loadSceneList();
        this.animate();
    }
    
    async setupThreeJS() {
        // 创建基础 Three.js 环境
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        const container = document.getElementById('threejs-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(0, 2, 5);
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true
        });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        
        container.appendChild(this.renderer.domElement);
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    async loadSceneList() {
		try {
			// 动态获取 scenes 目录下的所有文件
			const scenesContext = import.meta.glob('./scenes/scene-*.js');
			
			for (const path in scenesContext) {
				const module = await scenesContext[path]();
				if (module.sceneInfo) {
					this.scenes.push({
						...module.sceneInfo,
						load: module.default // 场景的默认导出函数
					});
				}
			}
			
			// 按顺序排序
			this.scenes.sort((a, b) => a.order - b.order);
			
			// 生成左侧列表
			this.generateSceneList();
			
		} catch (error) {
			console.error('加载场景列表失败:', error);
		}
    }
    
    generateSceneList() {
        const sceneList = document.getElementById('sceneList');
        sceneList.innerHTML = '';
        
        this.scenes.forEach((sceneInfo) => {
            const sceneItem = document.createElement('div');
            sceneItem.className = 'scene-item';
            sceneItem.innerHTML = `
                <div class="scene-name">${sceneInfo.name}</div>
                <div class="scene-desc">${sceneInfo.description}</div>
            `;
            
            sceneItem.addEventListener('click', () => {
                this.loadScene(sceneInfo);
            });
            
            sceneList.appendChild(sceneItem);
        });
        
        // 默认加载第一个场景
        if (this.scenes.length > 0) {
            this.loadScene(this.scenes[0]);
            sceneList.children[0].classList.add('active');
        }
    }
    
    async loadScene(sceneInfo) {
        console.log('加载场景:', sceneInfo.name);
        
        // 更新激活状态
        document.querySelectorAll('.scene-item').forEach(item => {
            item.classList.remove('active');
        });
        if(typeof event !== 'undefined' && event.target)event.target.classList.add('active');
        
        // 清理当前场景
        if (this.currentSceneModule && this.currentSceneModule.destroy) {
            this.currentSceneModule.destroy();
        }
        
        // 重置场景
        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }
        
        // 重置相机
        this.camera.position.set(0, 2, 5);
        this.controls.reset();
        
        // 加载新场景
        try {
            this.currentScene = sceneInfo;
            this.currentSceneModule = sceneInfo.load({
                scene: this.scene,
                camera: this.camera,
                renderer: this.renderer,
                controls: this.controls
            });
            
            // 更新UI
            this.updateSceneInfo(sceneInfo);
            
        } catch (error) {
            console.error('场景加载错误:', error);
        }
    }
    updateSceneInfo(sceneInfo) {
        // 更新场景名称
        document.getElementById('currentSceneName').textContent = sceneInfo.name;
        
        // 更新场景统计信息
        this.updateSceneStats();
        
        // 更新描述内容
        this.updateDescription(sceneInfo);
    }
    
    updateSceneStats() {
        // 获取通用统计信息
        const meshCount = this.scene.children.filter(child => child.isMesh).length;
        const lightCount = this.scene.children.filter(child => child.isLight).length;
        const lineCount = this.scene.children.filter(child => child.isLine).length;
        const cameraInfo = `X:${this.camera.position.x.toFixed(1)} Y:${this.camera.position.y.toFixed(1)} Z:${this.camera.position.z.toFixed(1)}`;
        
        // 更新通用统计信息
        const generalStatsElement = document.getElementById('sceneGeneralStats');
        if (generalStatsElement) {
            generalStatsElement.innerHTML = `
                网格: ${meshCount}<br>
                光源: ${lightCount}<br>
                线条: ${lineCount}<br>
                相机: ${cameraInfo}
            `;
        }
        
        // 获取并更新场景自定义信息
        //this.updateCustomStats();//自己被动更新即可
    }
    
    updateCustomStats() {
        const customStatsElement = document.getElementById('sceneCustomStats');
        
        // 如果当前场景模块提供了自定义统计信息方法
        if (this.currentSceneModule && this.currentSceneModule.getCustomStats) {
            const customStats = this.currentSceneModule.getCustomStats();
            if (customStatsElement) {
                customStatsElement.innerHTML = customStats;
            }
        } else {
            // 如果没有自定义信息，显示默认提示或隐藏
            if (customStatsElement) {
                customStatsElement.innerHTML = '<div class="custom-info">场景运行中...</div>';
            }
        }
    }
    
    updateDescription(sceneInfo) {
        const description = document.getElementById('descriptionContent');
        
        let controlsHTML = '';
        if (sceneInfo.controls && sceneInfo.controls.length > 0) {
            controlsHTML = `
                <h4>交互控制</h4>
                <div class="controls-list">
                    ${sceneInfo.controls.map(control => `
                        <div class="control-item">
                            <kbd>${control.key}</kbd>
                            <span>${control.action}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        let notesHTML = '';
        if (sceneInfo.notes && sceneInfo.notes.length > 0) {
            notesHTML = `
                <h4>学习笔记</h4>
                <ul>
                    ${sceneInfo.notes.map(note => `<li>${note}</li>`).join('')}
                </ul>
            `;
        }
        
        // 简单的代码格式化
        const formattedCode = this.simpleFormatCode(sceneInfo.codeExample || '// 代码示例');
        
        description.innerHTML = `
            <h4>场景描述</h4>
            <p>${sceneInfo.longDescription || sceneInfo.description}</p>
            
            <h4>技术要点</h4>
            <div class="code-block-container">
                <div class="code-block">${formattedCode}</div>
                <button class="copy-button">复制代码</button>
            </div>
            
            ${controlsHTML}
            ${notesHTML}
        `;
        
        // 设置复制按钮
        this.setupCopyButton(sceneInfo.codeExample || '// 代码示例');
    }
    
    simpleFormatCode(code) {
        // 只做最基本的格式化：处理换行和缩进
        return code
            .replace(/\n/g, '<br>')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
            .replace(/  /g, ' &nbsp;');
    }
    
    setupCopyButton(code) {
        const copyButton = document.querySelector('.copy-button');
        if (copyButton) {
            copyButton.onclick = () => {
                navigator.clipboard.writeText(code).then(() => {
                    copyButton.textContent = '已复制!';
                    copyButton.classList.add('copied');
                    
                    setTimeout(() => {
                        copyButton.textContent = '复制代码';
                        copyButton.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败:', err);
                    copyButton.textContent = '复制失败';
                    
                    setTimeout(() => {
                        copyButton.textContent = '复制代码';
                    }, 2000);
                });
            };
        }
    }
    
    
    onWindowResize() {
        const container = document.getElementById('threejs-container');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.currentSceneModule && this.currentSceneModule.update) {
            this.currentSceneModule.update();
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// 全局复制函数（用于 HTML 中的 onclick）
window.copyCode = function() {
    const platform = window.threeJSPlatform;
    if (platform && platform.setupCopyButton) {
        platform.setupCopyButton();
        // 立即触发点击
        const copyButton = document.querySelector('.copy-button');
        if (copyButton) copyButton.click();
    }
};

// 在创建实例时保存引用
window.threeJSPlatform = new ThreeJSPlatform();