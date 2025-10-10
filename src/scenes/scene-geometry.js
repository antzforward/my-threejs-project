import * as THREE from 'three';
export const sceneInfo = {
    name: '几何体展示',
    description: '各种 Three.js 几何体',
    longDescription: '展示 Three.js 中内置的各种几何体形状，包括立方体、球体、圆柱体、圆环等。',
    category: '几何',
    order: 2,
    codeExample: `// 创建立方体
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

// 创建球体  
const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);

// 创建圆柱体
const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);

// 创建圆环
const torusGeometry = new THREE.TorusGeometry(2, 0.5, 16, 100);`,
    controls: [
        { key: '数字键 1-4', action: '切换不同几何体' },
        { key: 'G', action: '切换线框模式' },
        { key: '鼠标拖动', action: '旋转查看几何体' }
    ],
    notes: [
        'Three.js 提供多种内置几何体',
        '可以通过参数调整几何体细节',
        'BufferGeometry 性能更好',
        '几何体可以组合创建复杂形状'
    ]
};

export default function setup({ scene, camera, renderer, controls }) {
    let currentGeometry = null;
    let geometries = [];
    let wireframe = false;
    
    function init() {
        // 添加灯光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(ambientLight, directionalLight);
        
        // 创建各种几何体
        createGeometries();
        showGeometry(0); // 显示第一个几何体
        
        // 添加键盘监听
        document.addEventListener('keydown', handleKeyPress);
    }
    
    function createGeometries() {
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x3498db,
            roughness: 0.3 
        });
        
        geometries = [
            { 
                mesh: new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material),
                name: '立方体'
            },
            { 
                mesh: new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), material),
                name: '球体'
            },
            { 
                mesh: new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 32), material),
                name: '圆柱体'
            },
            { 
                mesh: new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.4, 16, 100), material),
                name: '圆环'
            }
        ];
    }
    
    function showGeometry(index) {
        if (currentGeometry) {
            scene.remove(currentGeometry);
        }
        
        if (geometries[index]) {
            currentGeometry = geometries[index].mesh;
            scene.add(currentGeometry);
            
            // 更新场景信息
            const stats = document.getElementById('sceneStats');
            if (stats) {
                stats.innerHTML = `当前几何体: ${geometries[index].name}`;
            }
        }
    }
    
    function handleKeyPress(event) {
        switch(event.key) {
            case '1': showGeometry(0); break;
            case '2': showGeometry(1); break;
            case '3': showGeometry(2); break;
            case '4': showGeometry(3); break;
            case 'g': case 'G':
                wireframe = !wireframe;
                geometries.forEach(geo => {
                    geo.mesh.material.wireframe = wireframe;
                });
                break;
        }
    }
    
    function update() {
        if (currentGeometry) {
            currentGeometry.rotation.x += 0.01;
            currentGeometry.rotation.y += 0.005;
        }
    }
    
    function onKeyDown(event) {
        handleKeyPress(event);
    }
    
    function destroy() {
        // 清理几何体
        geometries.forEach(geo => {
            geo.mesh.geometry.dispose();
            geo.mesh.material.dispose();
        });
        
        document.removeEventListener('keydown', handleKeyPress);
    }
    
    init();
    
    return {
        update,
        onKeyDown,
        destroy
    };
}