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
			const scenesContext = import.meta.glob('./scenes/*.js');
			
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
        } else {
            controlsHTML = `
                <h4>交互控制</h4>
                <div class="controls-list">
                    <div class="control-item">
                        <kbd>鼠标左键拖动</kbd>
                        <span>旋转视角</span>
                    </div>
                    <div class="control-item">
                        <kbd>鼠标右键拖动</kbd>
                        <span>平移场景</span>
                    </div>
                    <div class="control-item">
                        <kbd>鼠标滚轮</kbd>
                        <span>缩放</span>
                    </div>
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
        
        // 格式化代码
        const formattedCode = this.formatCode(sceneInfo.codeExample || '// 代码示例');
        
        description.innerHTML = `
            <h4>场景描述</h4>
            <p>${sceneInfo.longDescription || sceneInfo.description}</p>
            
            <h4>技术要点</h4>
            <div class="code-block-container">
                <div class="code-block" id="codeBlock">${formattedCode}</div>
                <button class="copy-button" onclick="copyCode()">复制代码</button>
            </div>
            
            ${controlsHTML}
            ${notesHTML}
        `;
        
        // 重新绑定复制按钮事件
        this.setupCopyButton();
    }
    
	// 简单的语法高亮
    highlightCode(code) {
        return code
            // 注释
            .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
            // 字符串
            .replace(/('.*?'|".*?")/g, '<span class="string">$1</span>')
            // 关键字
            .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default)\b/g, '<span class="keyword">$1</span>')
            // 数字
            .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>')
            // 函数调用
            .replace(/(\w+)(?=\s*\()/g, '<span class="function">$1</span>')
            // 操作符
            .replace(/(=|\+|-|\*|\/|%|&|\||\^|~|!|<|>)/g, '<span class="operator">$1</span>');
    }
    
    // 更新 formatCode 方法以包含高亮
    formatCode(code) {
        let formatted = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
            .replace(/ /g, '&nbsp;');
        
        // 应用语法高亮
        formatted = this.highlightCode(formatted);
        
        return formatted;
    }
    
    // 设置复制按钮功能
    setupCopyButton() {
        const copyButton = document.querySelector('.copy-button');
        if (copyButton) {
            copyButton.onclick = () => {
                const codeBlock = document.getElementById('codeBlock');
                const codeText = codeBlock.textContent || codeBlock.innerText;
                
                navigator.clipboard.writeText(codeText).then(() => {
                    // 显示复制成功反馈
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
    
    updateSceneInfo(sceneInfo) {
        document.getElementById('currentSceneName').textContent = sceneInfo.name;
        
        const description = document.getElementById('descriptionContent');
        description.innerHTML = `
            <h4>场景描述</h4>
            <p>${sceneInfo.longDescription}</p>
            
            <h4>技术要点</h4>
            <div class="code-block">${sceneInfo.codeExample}</div>
            
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