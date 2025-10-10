// 场景元数据 - 用于自动生成界面
import * as THREE from 'three';
export const sceneInfo = {
    name: '基础场景',
    description: 'Three.js 基础概念演示',
    longDescription: '这个场景展示了 Three.js 的核心组件：场景(Scene)、相机(Camera)、渲染器(Renderer)、几何体(Geometry)和材质(Material)。',
    category: '基础',
    order: 1,
    codeExample: `// 创建基础场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// 创建立方体
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 渲染循环
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}`,
    controls: [
        { key: 'W/A/S/D', action: '移动相机' },
        { key: '鼠标拖动', action: '旋转视角' },
        { key: '滚轮', action: '缩放场景' }
    ],
    notes: [
        'Three.js 使用右手坐标系',
        '场景是所有3D对象的容器',
        '相机定义了观察场景的视角',
        '渲染器负责将3D场景绘制到2D屏幕上'
    ]
};

// 场景实现
export default function setup({ scene, camera, renderer, controls }) {
    let cube;
    let animationId;
    
    // 初始化场景
    function init() {
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        
        // 添加平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
        
        // 创建立方体
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            roughness: 0.4,
            metalness: 0.6
        });
        cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        scene.add(cube);
        
        // 创建地面
        const floorGeometry = new THREE.PlaneGeometry(10, 10);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
        
        // 设置阴影
        renderer.shadowMap.enabled = true;
    }
    
    // 更新函数 - 每帧调用
    function update() {
        if (cube) {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.005;
        }
    }
    
    // 键盘事件处理
    function onKeyDown(event) {
        const moveSpeed = 0.1;
        
        switch(event.code) {
            case 'KeyW': // 前进
                camera.position.z -= moveSpeed;
                break;
            case 'KeyS': // 后退
                camera.position.z += moveSpeed;
                break;
            case 'KeyA': // 左移
                camera.position.x -= moveSpeed;
                break;
            case 'KeyD': // 右移
                camera.position.x += moveSpeed;
                break;
        }
    }
    
    function onKeyUp(event) {
        // 键盘释放处理
    }
    
    // 清理函数 - 切换场景时调用
    function destroy() {
        // 清理自定义资源
        if (cube) {
            cube.geometry.dispose();
            cube.material.dispose();
        }
        
        // 取消动画帧
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }
    
    // 初始化场景
    init();
    
    // 返回场景方法
    return {
        update,
        onKeyDown,
        onKeyUp,
        destroy
    };
}